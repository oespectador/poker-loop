import assert from "node:assert/strict";
import test from "node:test";

import { allExercises, developmentExercises, evaluationExercises } from "../lib/exercises";
import { selectDiagnosticReinforcement } from "../lib/diagnostics";
import {
  buildRecommendedSession,
  chooseFocus,
  deriveSkillState,
  eligibleRetentionExercises,
  eligibleTransferExercises,
  getPendingLearningPackage,
  getActualSupport,
  relatedDevelopmentExercises,
  reprioritizeAfterError,
  skillLabels,
  summarizeEvaluationEvidence,
} from "../lib/trainingEngine";
import type { Attempt, Exercise, Skill } from "../lib/types";

function attemptsFor(
  exercises: Exercise[],
  options: { correct?: boolean; sessionId?: string } = {},
): Attempt[] {
  const { correct = true, sessionId = "completed-session" } = options;

  return exercises.map((exercise, index) => ({
    id: `${sessionId}-${exercise.id}-${index}`,
    exerciseId: exercise.id,
    sessionId,
    primarySkill: exercise.primarySkill,
    answerId: correct ? exercise.correctOptionId : "incorrect-answer",
    correct,
    support: exercise.support,
    timestamp: new Date(Date.UTC(2026, 0, 1, 0, index)).toISOString(),
  }));
}

function packageIds(packageName: Exercise["learningPackage"], start: number, end: number) {
  return developmentExercises
    .filter(
      (exercise) =>
        exercise.learningPackage === packageName &&
        (exercise.packageSequence ?? 0) >= start &&
        (exercise.packageSequence ?? 0) <= end,
    )
    .sort((a, b) => (a.packageSequence ?? 0) - (b.packageSequence ?? 0))
    .map((exercise) => exercise.id);
}

const founders = developmentExercises.slice(0, 12);

function packageExercises(packageName: Exercise["learningPackage"]): Exercise[] {
  return developmentExercises.filter((exercise) => exercise.learningPackage === packageName);
}

test("a primeira sessão contém os 12 exercícios fundadores em ordem", () => {
  const session = buildRecommendedSession([], undefined, "first-session");

  assert.equal(session.length, 12);
  assert.deepEqual(
    session.map((exercise) => exercise.id),
    founders.map((exercise) => exercise.id),
  );
});

test("pacote pendente respeita range-actions → range-to-decision → calibration", () => {
  const attempts = attemptsFor(founders);
  assert.equal(getPendingLearningPackage(attempts), "range-actions");

  attempts.push(...attemptsFor(packageExercises("range-actions"), { sessionId: "range-actions" }));
  assert.equal(getPendingLearningPackage(attempts), "range-to-decision");

  attempts.push(...attemptsFor(packageExercises("range-to-decision"), { sessionId: "range-to-decision" }));
  assert.equal(getPendingLearningPackage(attempts), "calibration");

  attempts.push(...attemptsFor(packageExercises("calibration"), { sessionId: "calibration" }));
  assert.equal(getPendingLearningPackage(attempts), undefined);
});

test("chooseFocus prioriza o foco de calibration sobre o ranking normal", () => {
  const previousPackages = developmentExercises.filter(
    (exercise) => exercise.learningPackage !== "calibration",
  );
  const attempts = attemptsFor(previousPackages);
  const weakBoard = founders.find((exercise) => exercise.primarySkill === "board-reading");
  assert.ok(weakBoard);
  attempts.push(...attemptsFor([weakBoard, weakBoard], { correct: false, sessionId: "weak-board" }));

  assert.equal(getPendingLearningPackage(attempts), "calibration");
  assert.equal(chooseFocus(attempts), "range-reading");
});

test("chooseFocus volta ao ranking normal depois de todos os pacotes", () => {
  assert.equal(getPendingLearningPackage(attemptsFor(developmentExercises)), undefined);
  assert.equal(chooseFocus(attemptsFor(developmentExercises)), "board-reading");
});

test("sessão recomendada pelo foco automático introduz calibration 01–04", () => {
  const attempts = attemptsFor(
    developmentExercises.filter((exercise) => exercise.learningPackage !== "calibration"),
  );
  const focus = chooseFocus(attempts);
  const introductions = buildRecommendedSession(attempts, focus, "recommended-calibration").filter(
    (exercise) => exercise.sessionRole === "introduction",
  );

  assert.equal(focus, "range-reading");
  assert.deepEqual(introductions.map(({ id }) => id), packageIds("calibration", 1, 4));
});

test("range-actions é introduzido em microblocos sequenciais 01–04, 05–08 e 09–12", () => {
  const attempts = attemptsFor(founders, { sessionId: "foundations" });

  for (const [start, end] of [[1, 4], [5, 8], [9, 12]] as const) {
    const session = buildRecommendedSession(attempts, undefined, `range-actions-${start}`);
    const introductions = session.filter((exercise) => exercise.sessionRole === "introduction");

    assert.deepEqual(
      introductions.map((exercise) => exercise.id),
      packageIds("range-actions", start, end),
    );
    assert.ok(introductions.every((exercise) => exercise.sessionRole === "introduction"));
    attempts.push(...attemptsFor(introductions, { sessionId: `range-actions-${start}` }));
  }
});

test("range-to-decision permanece bloqueado enquanto range-actions tem itens inéditos", () => {
  const attempts = attemptsFor(founders);
  const firstBlock = buildRecommendedSession(attempts).filter(
    (exercise) => exercise.sessionRole === "introduction",
  );
  attempts.push(...attemptsFor(firstBlock.slice(0, 3), { sessionId: "partial-range-actions" }));

  const nextSession = buildRecommendedSession(attempts, "integrated-decision", "manual-focus");

  assert.equal(
    nextSession.some((exercise) => exercise.learningPackage === "range-to-decision"),
    false,
  );
});

test("uma sessão interrompida retoma somente o restante do microbloco atual", () => {
  const attempts = attemptsFor(founders);
  const expectedBlock = packageIds("range-actions", 1, 4);
  const firstBlock = buildRecommendedSession(attempts).filter(
    (exercise) => exercise.sessionRole === "introduction",
  );
  attempts.push(...attemptsFor(firstBlock.slice(0, 2), { sessionId: "interrupted" }));

  const resumed = buildRecommendedSession(attempts, undefined, "resumed").filter(
    (exercise) => exercise.sessionRole === "introduction",
  );

  assert.deepEqual(resumed.map((exercise) => exercise.id), expectedBlock.slice(2));
  assert.equal(resumed.some((exercise) => (exercise.packageSequence ?? 0) > 4), false);
});

test("erro em introdução não altera a sequência restante", () => {
  const queue = buildRecommendedSession(attemptsFor(founders), undefined, "intro-error");
  const failed = queue[0];

  assert.equal(failed.sessionRole, "introduction");
  assert.deepEqual(
    reprioritizeAfterError(queue, 0, failed).map((exercise) => exercise.id),
    queue.map((exercise) => exercise.id),
  );
});

test("erro fora de introdução aproxima outra variação sem repetir imediatamente a questão", () => {
  const grouped = new Map<string, Exercise[]>();
  for (const exercise of developmentExercises) {
    if (!exercise.variantGroup) continue;
    grouped.set(exercise.variantGroup, [...(grouped.get(exercise.variantGroup) ?? []), exercise]);
  }
  const related = [...grouped.values()].find((items) => items.length >= 2);
  assert.ok(related);

  const unrelated = developmentExercises.filter(
    (exercise) => exercise.variantGroup !== related[0].variantGroup,
  );
  const queue = [related[0], unrelated[0], unrelated[1], unrelated[2], related[1], unrelated[3]];
  const reprioritized = reprioritizeAfterError(queue, 0, related[0]);

  assert.equal(reprioritized[1].id, unrelated[0].id);
  assert.equal(reprioritized[3].id, related[1].id);
  assert.equal(reprioritized.slice(1).some((exercise) => exercise.id === related[0].id), false);
});

test("treino manual não antecipa itens inéditos de pacotes estruturados", () => {
  const attempts = attemptsFor(founders);
  const manualFocuses: Skill[] = ["board-reading", "sizing", "integrated-decision"];

  for (const focus of manualFocuses) {
    const session = buildRecommendedSession(attempts, focus, `manual-${focus}`);
    assert.equal(
      session.some(
        (exercise) =>
          Boolean(exercise.learningPackage) &&
          exercise.learningPackage !== "foundations" &&
          !attempts.some((attempt) => attempt.exerciseId === exercise.id),
      ),
      false,
    );
  }
});

test("adaptive fill não antecipa itens inéditos além do microbloco atual", () => {
  const attempts = attemptsFor(founders);
  const session = buildRecommendedSession(attempts, undefined, "adaptive-fill");
  const newStructuredItems = session.filter(
    (exercise) =>
      Boolean(exercise.learningPackage) && exercise.learningPackage !== "foundations",
  );

  assert.deepEqual(
    newStructuredItems.map((exercise) => exercise.id),
    packageIds("range-actions", 1, 4),
  );
  assert.ok(newStructuredItems.every((exercise) => exercise.sessionRole === "introduction"));
});

test("calibration fica bloqueado enquanto range-to-decision possui itens inéditos", () => {
  const priorPackages = developmentExercises.filter(
    (exercise) => exercise.learningPackage !== "calibration" && exercise.id !== "dev-range-decision-12",
  );
  const session = buildRecommendedSession(attemptsFor(priorPackages), undefined, "calibration-blocked");

  assert.equal(session.some((exercise) => exercise.learningPackage === "calibration"), false);
});

test("calibration é introduzido em 01–04, 05–08 e 09–12 após os pacotes anteriores", () => {
  const previous = developmentExercises.filter((exercise) => exercise.learningPackage !== "calibration");
  const attempts = attemptsFor(previous, { sessionId: "previous-packages" });

  for (const [start, end] of [[1, 4], [5, 8], [9, 12]] as const) {
    const introductions = buildRecommendedSession(attempts, undefined, `calibration-${start}`).filter(
      (exercise) => exercise.sessionRole === "introduction",
    );
    assert.deepEqual(
      introductions.map((exercise) => exercise.id),
      packageIds("calibration", start, end),
    );
    attempts.push(...attemptsFor(introductions, { sessionId: `calibration-${start}` }));
  }
});

test("calibration retoma somente os itens restantes do microbloco interrompido", () => {
  const previous = developmentExercises.filter((exercise) => exercise.learningPackage !== "calibration");
  const attempts = attemptsFor(previous);
  const firstBlock = buildRecommendedSession(attempts, undefined, "calibration-partial").filter(
    (exercise) => exercise.sessionRole === "introduction",
  );
  attempts.push(...attemptsFor(firstBlock.slice(0, 2), { sessionId: "calibration-partial" }));

  const resumed = buildRecommendedSession(attempts, undefined, "calibration-resumed").filter(
    (exercise) => exercise.sessionRole === "introduction",
  );
  assert.deepEqual(resumed.map((exercise) => exercise.id), packageIds("calibration", 1, 4).slice(2));
});

test("erro na introdução de calibration não embaralha a ordem", () => {
  const previous = developmentExercises.filter((exercise) => exercise.learningPackage !== "calibration");
  const queue = buildRecommendedSession(attemptsFor(previous), undefined, "calibration-error");

  assert.equal(queue[0].id, "dev-calibration-01");
  assert.deepEqual(
    reprioritizeAfterError(queue, 0, queue[0]).map((exercise) => exercise.id),
    queue.map((exercise) => exercise.id),
  );
});

test("treino manual não vaza itens inéditos de calibration", () => {
  const previous = developmentExercises.filter((exercise) => exercise.learningPackage !== "calibration");
  const session = buildRecommendedSession(attemptsFor(previous), "integrated-decision", "manual-calibration");

  assert.equal(session.some((exercise) => exercise.learningPackage === "calibration"), false);
});

test("itens reservados de calibration não entram no treino normal", () => {
  const reserved = new Set(
    evaluationExercises
      .filter((exercise) => exercise.learningPackage === "calibration")
      .map((exercise) => exercise.id),
  );
  assert.equal(reserved.size, 6);

  const session = buildRecommendedSession(attemptsFor(developmentExercises), undefined, "no-calibration-eval");
  assert.equal(session.some((exercise) => reserved.has(exercise.id)), false);
});

test("itens reservados de retenção e transferência não entram antes de calibration terminar", () => {
  const incomplete = developmentExercises.filter((exercise) => exercise.id !== "dev-calibration-12");
  const attempts = attemptsFor(incomplete, { sessionId: "development-incomplete" });
  const reservedIds = new Set(evaluationExercises.map((exercise) => exercise.id));
  const session = buildRecommendedSession(attempts, undefined, "normal-training");

  assert.equal(session.some((exercise) => reservedIds.has(exercise.id)), false);
  assert.ok(session.every((exercise) => exercise.purpose === "development"));
});

const NOW = Date.UTC(2026, 5, 10, 12);

function completedDevelopmentAttempts(): Attempt[] {
  return attemptsFor(developmentExercises, { sessionId: "all-development-seen" });
}

function evidenceFor(evaluation: Exercise, latestAt = NOW): Attempt[] {
  const related = relatedDevelopmentExercises(evaluation);
  assert.ok(related.length > 0);
  return [0, 1].map((offset) => ({
    id: `evidence-${evaluation.id}-${offset}`,
    exerciseId: related[offset % related.length].id,
    sessionId: `evidence-session-${offset}`,
    primarySkill: related[offset % related.length].primarySkill,
    answerId: related[offset % related.length].correctOptionId,
    correct: true,
    support: "independent" as const,
    timestamp: new Date(latestAt - offset * 60_000).toISOString(),
  }));
}

function diagnosticFamily(focus?: Skill): Exercise[] {
  const groups = new Map<string, Exercise[]>();
  for (const exercise of developmentExercises) {
    if (!exercise.reasoningPattern || (focus && exercise.primarySkill !== focus)) continue;
    const key = `${exercise.reasoningPattern}:${exercise.primarySkill}`;
    groups.set(key, [...(groups.get(key) ?? []), exercise]);
  }
  const family = [...groups.values()].find((items) => items.length >= 3);
  assert.ok(family, `família diagnóstica ausente para ${focus ?? "qualquer foco"}`);
  return family;
}

function diagnosticErrors(
  family: Exercise[],
  count = 3,
  minuteOffset = 0,
): Attempt[] {
  return family.slice(0, count).map((exercise, index) => ({
    id: `diagnostic-${exercise.id}-${minuteOffset + index}`,
    exerciseId: exercise.id,
    sessionId: `diagnostic-session-${index % 2}`,
    primarySkill: exercise.primarySkill,
    answerId: "incorrect-answer",
    correct: false,
    support: "independent" as const,
    timestamp: new Date(NOW + (minuteOffset + index) * 60_000).toISOString(),
  }));
}

test("candidate é read-only e recurring fica bloqueado enquanto há pacote pendente", () => {
  const family = diagnosticFamily("range-reading");
  const candidateAttempts = [...completedDevelopmentAttempts(), ...diagnosticErrors(family, 2)];
  assert.equal(selectDiagnosticReinforcement(candidateAttempts, family[0].primarySkill), undefined);

  const incomplete = attemptsFor(
    developmentExercises.filter(({ id }) => id !== "dev-calibration-12"),
  );
  const attempts = [...incomplete, ...diagnosticErrors(family)];
  const selected = selectDiagnosticReinforcement(attempts, family[0].primarySkill);
  assert.ok(selected, "o sinal recurring existe fora da trava estrutural");
  const session = buildRecommendedSession(attempts, undefined, "pending-diagnostic", NOW);
  assert.equal(session[0]?.sessionRole, "introduction");
  assert.equal(session.filter(({ id }) => id === selected.id).length <= 1, true);
});

test("recurring compatível reserva exatamente um item e não duplica no fill", () => {
  const family = diagnosticFamily();
  const attempts = [...completedDevelopmentAttempts(), ...diagnosticErrors(family)];
  const selected = selectDiagnosticReinforcement(attempts, family[0].primarySkill);
  assert.ok(selected);
  const session = buildRecommendedSession(attempts, family[0].primarySkill, "diagnostic", NOW);

  assert.equal(session.length, 12);
  assert.equal(session.filter(({ id }) => id === selected.id).length, 1);
  assert.equal(session[0].id, selected.id);
  assert.equal(new Set(session.map(({ id }) => id)).size, session.length);
  assert.equal(session.find(({ id }) => id === selected.id)?.support, getActualSupport(selected, attempts));
});

test("recurring de outra Skill não interfere no foco manual nem no SkillState", () => {
  const family = diagnosticFamily();
  const otherFocus = (Object.keys(skillLabels) as Skill[]).find(
    (skill) => skill !== family[0].primarySkill,
  );
  assert.ok(otherFocus);
  const base = completedDevelopmentAttempts();
  const attempts = [...base, ...diagnosticErrors(family)];
  const focusBeforeSelection = chooseFocus(attempts);
  const stateBeforeSelection = deriveSkillState(attempts, otherFocus);

  assert.equal(selectDiagnosticReinforcement(attempts, otherFocus), undefined);
  assert.equal(chooseFocus(attempts), focusBeforeSelection);
  assert.equal(deriveSkillState(attempts, otherFocus), stateBeforeSelection);
  assert.equal(buildRecommendedSession(attempts, otherFocus, "other-focus", NOW).length, 12);
});

test("seleção evita a tentativa mais recente, prefere a superfície mais antiga e é determinística", () => {
  const family = diagnosticFamily();
  const attempts = [...completedDevelopmentAttempts(), ...diagnosticErrors(family)];
  const first = selectDiagnosticReinforcement(attempts, family[0].primarySkill);
  const second = selectDiagnosticReinforcement(attempts, family[0].primarySkill);

  assert.ok(first);
  assert.equal(first.id, second?.id);
  assert.notEqual(first.id, family[2].id);
});

test("retention e transfer coexistem com um único reforço sem serem deslocados", () => {
  const family = diagnosticFamily();
  const retention = evaluationExercises.find(
    (item) => item.purpose === "retention" && item.primarySkill === family[0].primarySkill,
  );
  const transfer = evaluationExercises.find(
    (item) => item.purpose === "transfer" && item.primarySkill === family[0].primarySkill,
  );
  assert.ok(retention && transfer);
  const attempts = [
    ...completedDevelopmentAttempts(),
    ...evidenceFor(retention, NOW - 24 * 60 * 60 * 1000 - 60_000),
    ...evidenceFor(transfer, NOW - 24 * 60 * 60 * 1000 - 60_000),
    ...diagnosticErrors(family, 3, 10),
  ];
  const selected = selectDiagnosticReinforcement(attempts, family[0].primarySkill);
  assert.ok(selected);
  const session = buildRecommendedSession(attempts, family[0].primarySkill, "all-slots", NOW);

  assert.equal(session.length, 12);
  assert.equal(session.filter(({ purpose }) => purpose === "retention").length, 1);
  assert.equal(session.filter(({ purpose }) => purpose === "transfer").length, 1);
  assert.equal(session.filter(({ id }) => id === selected.id).length, 1);
  assert.equal(session[2].id, selected.id);
});

test("recurring recuperado não reserva reforço e sessão sem recurring mantém o resultado", () => {
  const family = diagnosticFamily();
  const errors = diagnosticErrors(family);
  const recovery = [family[0], family[1], family[0]].map((exercise, index) => ({
    ...diagnosticErrors([exercise], 1, 20 + index)[0],
    id: `recovery-${index}`,
    sessionId: `recovery-session-${index}`,
    correct: true,
    answerId: exercise.correctOptionId,
  }));
  const attempts = [...completedDevelopmentAttempts(), ...errors, ...recovery];
  assert.equal(selectDiagnosticReinforcement(attempts, family[0].primarySkill), undefined);

  const first = buildRecommendedSession(attempts, family[0].primarySkill, "no-recurring", NOW);
  const second = buildRecommendedSession(attempts, family[0].primarySkill, "no-recurring", NOW);
  assert.deepEqual(first.map(({ id }) => id), second.map(({ id }) => id));
});

test("sessão piloto respeita 12 itens e no máximo um item de cada avaliação", () => {
  const retention = evaluationExercises.find((item) => item.purpose === "retention");
  const transfer = evaluationExercises.find((item) => item.purpose === "transfer");
  assert.ok(retention && transfer);
  const attempts = [
    ...completedDevelopmentAttempts(),
    ...evidenceFor(retention, NOW - 24 * 60 * 60 * 1000),
    ...evidenceFor(transfer),
  ];
  const session = buildRecommendedSession(attempts, undefined, "pilot", NOW);

  assert.equal(session.length, 12);
  assert.ok(session.filter((item) => item.purpose === "retention").length <= 1);
  assert.ok(session.filter((item) => item.purpose === "transfer").length <= 1);
});

test("retention exige 24h e dois acertos independentes em sessões diferentes", () => {
  const item = evaluationExercises.find((exercise) => exercise.purpose === "retention");
  assert.ok(item);
  const base = completedDevelopmentAttempts();
  const tooRecent = [...base, ...evidenceFor(item, NOW - 24 * 60 * 60 * 1000 + 1)];
  const eligible = [...base, ...evidenceFor(item, NOW - 24 * 60 * 60 * 1000)];

  assert.equal(eligibleRetentionExercises(tooRecent, NOW).some(({ id }) => id === item.id), false);
  assert.equal(eligibleRetentionExercises(eligible, NOW).some(({ id }) => id === item.id), true);
});

test("transfer pode ser elegível imediatamente com evidência independente suficiente", () => {
  const item = evaluationExercises.find((exercise) => exercise.purpose === "transfer");
  assert.ok(item);
  const attempts = [...completedDevelopmentAttempts(), ...evidenceFor(item, NOW)];

  assert.equal(eligibleTransferExercises(attempts).some(({ id }) => id === item.id), true);
});

test("evaluation respondido não reaparece e mantém support independent", () => {
  const item = evaluationExercises.find((exercise) => exercise.purpose === "transfer");
  assert.ok(item);
  const attempts = [...completedDevelopmentAttempts(), ...evidenceFor(item, NOW)];
  const first = buildRecommendedSession(attempts, item.primarySkill, "evaluation-once", NOW);
  const selected = first.find((exercise) => exercise.id === item.id);
  assert.ok(selected);
  assert.equal(selected.support, "independent");

  const answered = attemptsFor([item], { correct: false, sessionId: "evaluation-answer" });
  assert.equal(eligibleTransferExercises([...attempts, ...answered]).some(({ id }) => id === item.id), false);
});

test("tentativas de transfer não alteram o estado-base da Skill", () => {
  const item = evaluationExercises.find((exercise) => exercise.purpose === "transfer");
  assert.ok(item);
  const related = relatedDevelopmentExercises(item).slice(0, 2);
  assert.equal(related.length, 2);
  const base = Array.from({ length: 4 }, (_, index) => {
    const exercise = related[index % 2];
    return {
      ...attemptsFor([exercise], { sessionId: `consistent-${index % 2}` })[0],
      id: `consistent-${index}`,
      support: "independent" as const,
      timestamp: new Date(NOW - (4 - index) * 60_000).toISOString(),
    };
  });
  assert.equal(deriveSkillState(base, item.primarySkill), "Consistente");

  const failedTransfer = attemptsFor([item], { correct: false, sessionId: "failed-transfer" });
  assert.equal(deriveSkillState([...base, ...failedTransfer], item.primarySkill), "Consistente");
  assert.equal(deriveSkillState(attemptsFor([item], { sessionId: "only-transfer" }), item.primarySkill), "Ainda observando");
});

test("resumo de avaliação separa retention de transfer", () => {
  const retention = evaluationExercises.find((exercise) => exercise.purpose === "retention");
  const transfer = evaluationExercises.find((exercise) => exercise.purpose === "transfer");
  assert.ok(retention && transfer);
  const attempts = [
    ...attemptsFor([retention], { sessionId: "retention-correct" }),
    ...attemptsFor([retention], { correct: false, sessionId: "retention-wrong" }),
    ...attemptsFor([transfer], { sessionId: "transfer-correct" }),
    ...attemptsFor([founders[0]], { sessionId: "development-ignored" }),
  ];

  assert.deepEqual(summarizeEvaluationEvidence(attempts), {
    retention: { answered: 2, correct: 1 },
    transfer: { answered: 1, correct: 1 },
  });
});

test("erro de evaluation só pode repriorizar um exercício development", () => {
  const evaluations = evaluationExercises.slice(0, 2);
  const development = developmentExercises.find(
    (exercise) => exercise.primarySkill === evaluations[0].primarySkill,
  );
  assert.ok(development);
  const queue = [evaluations[0], evaluations[1], development];
  const reprioritized = reprioritizeAfterError(queue, 0, evaluations[0]);

  assert.equal(reprioritized[2].purpose, "development");
});

test("seleção piloto é determinística para os mesmos inputs e now", () => {
  const item = evaluationExercises.find((exercise) => exercise.purpose === "retention");
  assert.ok(item);
  const attempts = [
    ...completedDevelopmentAttempts(),
    ...evidenceFor(item, NOW - 24 * 60 * 60 * 1000),
  ];
  const first = buildRecommendedSession(attempts, undefined, "stable-seed", NOW);
  const second = buildRecommendedSession(attempts, undefined, "stable-seed", NOW);
  assert.deepEqual(first.map(({ id }) => id), second.map(({ id }) => id));
});

test("a biblioteca possui IDs únicos e cada resposta correta existe nas opções", () => {
  const ids = allExercises.map((exercise) => exercise.id);

  assert.equal(new Set(ids).size, ids.length);
  for (const exercise of allExercises) {
    assert.ok(
      exercise.options.some((option) => option.id === exercise.correctOptionId),
      `${exercise.id}: correctOptionId ausente das opções`,
    );
  }
});
