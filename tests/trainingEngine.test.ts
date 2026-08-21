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
  exercisePriority,
  getPendingLearningPackage,
  getActualSupport,
  isLearningPackageComplete,
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

test("pacote pendente respeita a ordem global dos seis pacotes", () => {
  const attempts = attemptsFor(founders);
  assert.equal(getPendingLearningPackage(attempts), "range-actions");

  attempts.push(...attemptsFor(packageExercises("range-actions"), { sessionId: "range-actions" }));
  assert.equal(getPendingLearningPackage(attempts), "range-to-decision");

  attempts.push(...attemptsFor(packageExercises("range-to-decision"), { sessionId: "range-to-decision" }));
  assert.equal(getPendingLearningPackage(attempts), "calibration");

  attempts.push(...attemptsFor(packageExercises("calibration"), { sessionId: "calibration" }));
  assert.equal(getPendingLearningPackage(attempts), "integrated-application");

  attempts.push(...attemptsFor(packageExercises("integrated-application"), { sessionId: "integrated-application" }));
  assert.equal(getPendingLearningPackage(attempts), "range-strength-signals");

  attempts.push(...attemptsFor(packageExercises("range-strength-signals"), { sessionId: "range-strength-signals" }));
  assert.equal(getPendingLearningPackage(attempts), "hand-function-vs-range");

  attempts.push(...attemptsFor(packageExercises("hand-function-vs-range"), { sessionId: "hand-function-vs-range" }));
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

test("itens reservados do próprio pacote não entram antes de calibration terminar", () => {
  const incomplete = developmentExercises.filter((exercise) => exercise.id !== "dev-calibration-12");
  const attempts = attemptsFor(incomplete, { sessionId: "development-incomplete" });
  const calibrationIds = new Set(evaluationExercises.filter(({ learningPackage }) => learningPackage === "calibration").map(({ id }) => id));
  const session = buildRecommendedSession(attempts, undefined, "normal-training", NOW);

  assert.equal(session.some((exercise) => calibrationIds.has(exercise.id)), false);
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

test("candidate é read-only e recurring antigo pode coexistir com pacote posterior pendente", () => {
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
  assert.equal(session.filter(({ id }) => id === selected.id).length, 1);
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

test("integrated-application fica por último e bloqueado até calibration completo", () => {
  const beforeCalibrationEnds = developmentExercises.filter(
    (exercise) => exercise.learningPackage !== "integrated-application" && exercise.id !== "dev-calibration-12",
  );
  assert.equal(getPendingLearningPackage(attemptsFor(beforeCalibrationEnds)), "calibration");
  const throughCalibration = developmentExercises.filter(
    (exercise) => exercise.learningPackage !== "integrated-application",
  );
  assert.equal(getPendingLearningPackage(attemptsFor(throughCalibration)), "integrated-application");
});

test("integrated-application é introduzido nos três microblocos em ordem", () => {
  const previous = developmentExercises.filter(
    (exercise) => exercise.learningPackage !== "integrated-application",
  );
  const attempts = attemptsFor(previous, { sessionId: "before-application" });
  for (const [start, end] of [[1, 4], [5, 8], [9, 12]] as const) {
    const introductions = buildRecommendedSession(attempts, undefined, `application-${start}`).filter(
      (exercise) => exercise.sessionRole === "introduction",
    );
    assert.deepEqual(introductions.map(({ id }) => id), packageIds("integrated-application", start, end));
    attempts.push(...attemptsFor(introductions, { sessionId: `application-${start}` }));
  }
});

test("integrated-application retoma microbloco parcial e erro não o embaralha", () => {
  const previous = developmentExercises.filter(
    (exercise) => exercise.learningPackage !== "integrated-application",
  );
  const attempts = attemptsFor(previous);
  const block = buildRecommendedSession(attempts, undefined, "application-partial").filter(
    (exercise) => exercise.sessionRole === "introduction",
  );
  assert.deepEqual(reprioritizeAfterError(block, 0, block[0]).map(({ id }) => id), block.map(({ id }) => id));
  attempts.push(...attemptsFor(block.slice(0, 2), { sessionId: "application-partial" }));
  const resumed = buildRecommendedSession(attempts, undefined, "application-resumed").filter(
    (exercise) => exercise.sessionRole === "introduction",
  );
  assert.deepEqual(resumed.map(({ id }) => id), packageIds("integrated-application", 1, 4).slice(2));
});

test("treino manual não vaza integrated-application inédito", () => {
  const previous = developmentExercises.filter(
    (exercise) => exercise.learningPackage !== "integrated-application",
  );
  const session = buildRecommendedSession(attemptsFor(previous), "sizing", "manual-application");
  assert.equal(session.some((exercise) => exercise.learningPackage === "integrated-application"), false);
});

test("avaliação e reforço ficam bloqueados durante a introdução de integrated-application", () => {
  const incomplete = developmentExercises.filter(({ id }) => id !== "dev-application-12");
  const family = packageExercises("integrated-application").filter(
    ({ reasoningPattern, primarySkill }) => reasoningPattern === "action-updates-range" && primarySkill === "range-reading",
  );
  const attempts = [...attemptsFor(incomplete), ...diagnosticErrors(family)];
  const session = buildRecommendedSession(attempts, undefined, "application-pending", NOW);
  assert.ok(session.some(({ sessionRole }) => sessionRole === "introduction"));
  assert.ok(session.every(({ purpose }) => purpose === "development"));
  assert.equal(session[0]?.id, "dev-application-12");
});

test("após integrated-application, avaliações e novas superfícies diagnósticas são elegíveis", () => {
  const reserved = evaluationExercises.find(({ id }) => id === "transfer-application-01");
  assert.ok(reserved);
  const family = packageExercises("integrated-application").filter(
    ({ reasoningPattern, primarySkill }) => reasoningPattern === "action-updates-range" && primarySkill === "range-reading",
  );
  const attempts = [
    ...completedDevelopmentAttempts(),
    ...evidenceFor(reserved),
    ...diagnosticErrors(family, 3, 10),
  ];
  assert.equal(eligibleTransferExercises(attempts).some(({ id }) => id === reserved.id), true);
  const selected = selectDiagnosticReinforcement(attempts, "range-reading");
  assert.ok(selected && selected.learningPackage === "integrated-application");
});

test("integrated-application mantém suas seis avaliações reservadas", () => {
  const applicationEvaluations = evaluationExercises.filter(
    ({ learningPackage }) => learningPackage === "integrated-application",
  );
  assert.equal(applicationEvaluations.length, 6);
  assert.deepEqual(
    applicationEvaluations.map(({ purpose }) => purpose).sort(),
    ["retention", "retention", "retention", "transfer", "transfer", "transfer"],
  );
  assert.ok(applicationEvaluations.every(({ support, packageSequence }) => support === "independent" && packageSequence === undefined));
});

test("V0.9 mantém determinismo e limite de 12 itens", () => {
  const attempts = completedDevelopmentAttempts();
  const first = buildRecommendedSession(attempts, "integrated-decision", "v09-stable", NOW);
  const second = buildRecommendedSession(attempts, "integrated-decision", "v09-stable", NOW);
  assert.deepEqual(first.map(({ id }) => id), second.map(({ id }) => id));
  assert.ok(first.length <= 12);
});

test("range-strength-signals é o quinto pacote e fica bloqueado até integrated-application completo", () => {
  const beforeApplicationEnds = developmentExercises.filter(({ learningPackage, id }) =>
    learningPackage !== "range-strength-signals" && id !== "dev-application-12");
  assert.equal(getPendingLearningPackage(attemptsFor(beforeApplicationEnds)), "integrated-application");
  const previous = developmentExercises.filter(({ learningPackage }) => learningPackage !== "range-strength-signals");
  assert.equal(getPendingLearningPackage(attemptsFor(previous)), "range-strength-signals");
});

test("range-strength-signals entra em 01–04, 05–08 e 09–12, retomando sem embaralhar por erro", () => {
  const previous = developmentExercises.filter(({ learningPackage }) => learningPackage !== "range-strength-signals");
  const attempts = attemptsFor(previous);
  const first = buildRecommendedSession(attempts, undefined, "signals-first").filter(({ sessionRole }) => sessionRole === "introduction");
  assert.deepEqual(first.map(({ id }) => id), packageIds("range-strength-signals", 1, 4));
  assert.deepEqual(reprioritizeAfterError(first, 0, first[0]).map(({ id }) => id), first.map(({ id }) => id));
  attempts.push(...attemptsFor(first.slice(0, 2), { sessionId: "signals-partial" }));
  const resumed = buildRecommendedSession(attempts, undefined, "signals-resumed").filter(({ sessionRole }) => sessionRole === "introduction");
  assert.deepEqual(resumed.map(({ id }) => id), packageIds("range-strength-signals", 1, 4).slice(2));
  attempts.push(...attemptsFor(resumed, { sessionId: "signals-rest-first" }));
  for (const [start, end] of [[5, 8], [9, 12]] as const) {
    const block = buildRecommendedSession(attempts, undefined, `signals-${start}`).filter(({ sessionRole }) => sessionRole === "introduction");
    assert.deepEqual(block.map(({ id }) => id), packageIds("range-strength-signals", start, end));
    attempts.push(...attemptsFor(block, { sessionId: `signals-${start}` }));
  }
});

test("treino manual, avaliação e diagnóstico não vazam enquanto range-strength-signals está pendente", () => {
  const incomplete = developmentExercises.filter(({ id }) => id !== "dev-range-signals-12");
  const family = packageExercises("range-strength-signals").filter(({ reasoningPattern }) => reasoningPattern === "stack-range-strength-clues");
  const attempts = [...attemptsFor(incomplete), ...diagnosticErrors(family, 3, 10)];
  const manual = buildRecommendedSession(attempts, "sizing", "signals-manual", NOW);
  assert.equal(manual.filter(({ id }) => id === "dev-range-signals-12").every(({ sessionRole }) => sessionRole === "introduction"), true);
  assert.ok(manual.every(({ purpose }) => purpose === "development"));
  assert.equal(manual.some(({ purpose }) => purpose === "retention" || purpose === "transfer"), false);
});

test("após o quinto pacote, avaliação e os novos reasoningPatterns voltam a ser elegíveis", () => {
  const reserved = evaluationExercises.find(({ id }) => id === "transfer-range-signals-01");
  assert.ok(reserved);
  const family = packageExercises("range-strength-signals").filter(({ reasoningPattern }) => reasoningPattern === "stack-range-strength-clues");
  const attempts = [...completedDevelopmentAttempts(), ...evidenceFor(reserved), ...diagnosticErrors(family, 3, 20)];
  assert.equal(eligibleTransferExercises(attempts).some(({ id }) => id === reserved.id), true);
  const selected = selectDiagnosticReinforcement(attempts, "range-reading");
  assert.ok(selected && ["stack-range-strength-clues", "context-modulates-size-signal", "calibrate-range-signal"].includes(selected.reasoningPattern ?? ""));
});

test("há exatamente seis reservados de sinais, independentes e sem packageSequence", () => {
  const items = evaluationExercises.filter(({ learningPackage }) => learningPackage === "range-strength-signals");
  assert.equal(items.length, 6);
  assert.deepEqual(items.map(({ purpose }) => purpose).sort(), ["retention", "retention", "retention", "transfer", "transfer", "transfer"]);
  assert.ok(items.every(({ support, packageSequence }) => support === "independent" && packageSequence === undefined));
});

test("conteúdo de sinais mantém heurísticas condicionais e representa os dois boundary cases", () => {
  const items = [...packageExercises("range-strength-signals"), ...evaluationExercises.filter(({ learningPackage }) => learningPackage === "range-strength-signals")];
  assert.ok(items.every(({ sourceKind }) => sourceKind === "heuristic"));
  const text = items.flatMap(({ options, feedback }) => [...options.map(({ label }) => label), feedback.short]).join(" ").toLowerCase();
  assert.equal(text.includes("small bet = weak"), false);
  assert.equal(text.includes("big bet = strong"), false);
  assert.ok(items.some(({ subconcept }) => subconcept === "static-dry-boundary"));
  assert.ok(items.some(({ subconcept }) => subconcept === "three-bet-pot-boundary"));
});

test("V0.10 preserva determinismo e sessões de no máximo 12 decisões", () => {
  const attempts = completedDevelopmentAttempts();
  const first = buildRecommendedSession(attempts, "range-reading", "v010-stable", NOW);
  const second = buildRecommendedSession(attempts, "range-reading", "v010-stable", NOW);
  assert.deepEqual(first.map(({ id }) => id), second.map(({ id }) => id));
  assert.ok(first.length <= 12);
});

test("completude local usa todos os IDs reais do pacote, inclusive foundations", () => {
  const foundations = packageExercises(undefined);
  const complete = attemptsFor(foundations);
  assert.equal(isLearningPackageComplete(complete, "foundations"), true);
  assert.equal(isLearningPackageComplete(complete.slice(1), "foundations"), false);

  const rangeActions = packageExercises("range-actions");
  assert.equal(isLearningPackageComplete(attemptsFor(rangeActions), "range-actions"), true);
  assert.equal(isLearningPackageComplete(attemptsFor(rangeActions.filter(({ id }) => id !== rangeActions[5].id)), "range-actions"), false);
});

test("avaliação é liberada pelo próprio pacote mesmo com pacote posterior pendente", () => {
  const item = evaluationExercises.find(
    ({ purpose, learningPackage }) => purpose === "transfer" && learningPackage === "range-actions",
  );
  assert.ok(item);
  const completed = [...packageExercises(undefined), ...packageExercises("range-actions")];
  const attempts = [...attemptsFor(completed), ...evidenceFor(item)];

  assert.equal(getPendingLearningPackage(attempts), "range-to-decision");
  assert.equal(eligibleTransferExercises(attempts).some(({ id }) => id === item.id), true);

  const incomplete = attempts.filter(({ exerciseId }) => exerciseId !== packageExercises("range-actions")[4].id);
  assert.equal(eligibleTransferExercises(incomplete).some(({ id }) => id === item.id), false);
});

test("introBlock intacto coexiste com retention e transfer antigos sem duplicação", () => {
  const retention = evaluationExercises.find(
    ({ purpose, learningPackage }) => purpose === "retention" && learningPackage === "range-actions",
  );
  const transfer = evaluationExercises.find(
    ({ purpose, learningPackage }) => purpose === "transfer" && learningPackage === "range-actions",
  );
  assert.ok(retention && transfer);
  const completed = [...packageExercises(undefined), ...packageExercises("range-actions")];
  const attempts = [
    ...attemptsFor(completed),
    ...evaluationExercises
      .filter(({ purpose, learningPackage }) => purpose === "retention" && learningPackage === "range-actions")
      .flatMap((item) => evidenceFor(item, NOW - 24 * 60 * 60 * 1000)),
    ...evidenceFor(transfer),
  ];
  const session = buildRecommendedSession(attempts, undefined, "local-evaluation", NOW);

  assert.deepEqual(session.slice(0, 4).map(({ id }) => id), packageIds("range-to-decision", 1, 4));
  assert.equal(session.slice(4, 6).filter(({ purpose }) => purpose === "retention").length, 1);
  assert.equal(session.slice(4, 6).filter(({ purpose }) => purpose === "transfer").length, 1);
  assert.ok(session.length <= 12);
  assert.equal(new Set(session.map(({ id }) => id)).size, session.length);
});

test("diagnóstico durante introdução usa somente pacote completamente apresentado", () => {
  const completedExercises = developmentExercises.filter(({ learningPackage }) =>
    !learningPackage || learningPackage !== "range-strength-signals",
  );
  const familyGroups = new Map<string, Exercise[]>();
  for (const exercise of completedExercises) {
    if (!exercise.reasoningPattern) continue;
    const key = `${exercise.reasoningPattern}:${exercise.primarySkill}`;
    familyGroups.set(key, [...(familyGroups.get(key) ?? []), exercise]);
  }
  const oldFamily = [...familyGroups.values()].find(
    (family) => family.length >= 3 && family[0].primarySkill === "range-reading",
  ) ?? [];
  assert.ok(oldFamily.length >= 3);
  const attempts = [...attemptsFor(completedExercises), ...diagnosticErrors(oldFamily)];
  const session = buildRecommendedSession(attempts, undefined, "local-diagnostic", NOW);
  const introIds = packageIds("range-strength-signals", 1, 4);

  assert.deepEqual(session.slice(0, 4).map(({ id }) => id), introIds);
  const reinforcement = selectDiagnosticReinforcement(attempts, "range-reading", oldFamily);
  assert.ok(reinforcement);
  assert.equal(session.filter(({ id }) => id === reinforcement.id).length, 1);
  assert.equal(session.slice(4).some(({ learningPackage }) => learningPackage === "range-strength-signals"), false);
});

test("relação evaluation → development prefere reasoningPattern, concept e Skill nessa ordem", () => {
  const reasoning = developmentExercises.find(({ reasoningPattern }) => reasoningPattern);
  const conceptExercise = developmentExercises.find(({ concept }) => concept);
  assert.ok(reasoning && conceptExercise);

  const byReasoning = relatedDevelopmentExercises({
    ...evaluationExercises[0],
    reasoningPattern: reasoning.reasoningPattern,
    concept: conceptExercise.concept,
  });
  assert.ok(byReasoning.length > 0);
  assert.ok(byReasoning.every(({ reasoningPattern }) => reasoningPattern === reasoning.reasoningPattern));

  const byConcept = relatedDevelopmentExercises({
    ...evaluationExercises[0],
    reasoningPattern: "pattern-inexistente",
    concept: conceptExercise.concept,
  });
  assert.ok(byConcept.length > 0);
  assert.ok(byConcept.every(({ concept }) => concept === conceptExercise.concept));

  const bySkill = relatedDevelopmentExercises({
    ...evaluationExercises[0],
    reasoningPattern: "pattern-inexistente",
    concept: "concept-inexistente",
  });
  assert.ok(bySkill.length > 0);
  assert.ok(bySkill.every(({ primarySkill }) => primarySkill === evaluationExercises[0].primarySkill));
});

test("retention e transfer não contaminam suporte, prioridade ou SkillState development", () => {
  const development = developmentExercises.find(({ support }) => support === "guided");
  const retention = evaluationExercises.find(({ purpose }) => purpose === "retention");
  const transfer = evaluationExercises.find(({ purpose }) => purpose === "transfer");
  assert.ok(development && retention && transfer);
  const evaluationAttempts = [
    ...attemptsFor([retention], { correct: true, sessionId: "retention-correct" }),
    ...attemptsFor([retention], { correct: false, sessionId: "retention-wrong" }),
    ...attemptsFor([transfer], { correct: false, sessionId: "transfer-wrong" }),
  ];

  assert.equal(getActualSupport(development, evaluationAttempts), getActualSupport(development, []));
  assert.equal(exercisePriority(development, evaluationAttempts, development.primarySkill), exercisePriority(development, [], development.primarySkill));
  assert.equal(deriveSkillState(evaluationAttempts, development.primarySkill), deriveSkillState([], development.primarySkill));
});

test("retention local continua bloqueada antes de 24 horas", () => {
  const item = evaluationExercises.find(
    ({ purpose, learningPackage }) => purpose === "retention" && learningPackage === "range-actions",
  );
  assert.ok(item);
  const attempts = [
    ...attemptsFor([...packageExercises(undefined), ...packageExercises("range-actions")]),
    ...evidenceFor(item, NOW - 24 * 60 * 60 * 1000 + 1),
  ];

  assert.equal(eligibleRetentionExercises(attempts, NOW).some(({ id }) => id === item.id), false);
});

test("retention local é liberada ao completar 24 horas", () => {
  const item = evaluationExercises.find(
    ({ purpose, learningPackage }) => purpose === "retention" && learningPackage === "range-actions",
  );
  assert.ok(item);
  const attempts = [
    ...attemptsFor([...packageExercises(undefined), ...packageExercises("range-actions")]),
    ...evidenceFor(item, NOW - 24 * 60 * 60 * 1000),
  ];

  assert.equal(eligibleRetentionExercises(attempts, NOW).some(({ id }) => id === item.id), true);
});

test("transfer local exige evidência independente em duas sessões", () => {
  const item = evaluationExercises.find(
    ({ purpose, learningPackage }) => purpose === "transfer" && learningPackage === "range-actions",
  );
  assert.ok(item);
  const completed = attemptsFor([...packageExercises(undefined), ...packageExercises("range-actions")]);
  const evidence = evidenceFor(item);
  const presentationOnly = completed.map((attempt) => ({ ...attempt, support: "guided" as const }));

  assert.equal(
    eligibleTransferExercises([...presentationOnly, ...evidence.map((attempt) => ({ ...attempt, sessionId: "same" }))])
      .some(({ id }) => id === item.id),
    false,
  );
  assert.equal(eligibleTransferExercises([...presentationOnly, ...evidence]).some(({ id }) => id === item.id), true);
});

test("retention antiga pode coexistir sozinha com introdução posterior", () => {
  const item = evaluationExercises.find(
    ({ purpose, learningPackage }) => purpose === "retention" && learningPackage === "range-actions",
  );
  assert.ok(item);
  const attempts = [
    ...attemptsFor([...packageExercises(undefined), ...packageExercises("range-actions")]),
    ...evidenceFor(item, NOW - 24 * 60 * 60 * 1000),
  ];
  const session = buildRecommendedSession(attempts, undefined, "retention-with-intro", NOW);

  assert.deepEqual(session.slice(0, 4).map(({ id }) => id), packageIds("range-to-decision", 1, 4));
  assert.equal(session.some(({ purpose }) => purpose === "retention"), true);
});

test("transfer antiga pode coexistir sozinha com introdução posterior", () => {
  const item = evaluationExercises.find(
    ({ purpose, learningPackage }) => purpose === "transfer" && learningPackage === "range-actions",
  );
  assert.ok(item);
  const attempts = [
    ...attemptsFor([...packageExercises(undefined), ...packageExercises("range-actions")]),
    ...evidenceFor(item),
  ];
  const session = buildRecommendedSession(attempts, undefined, "transfer-with-intro", NOW);

  assert.deepEqual(session.slice(0, 4).map(({ id }) => id), packageIds("range-to-decision", 1, 4));
  assert.equal(session.some(({ purpose }) => purpose === "transfer"), true);
});

test("sessão local com avaliações mantém o teto de 12", () => {
  const completed = [...packageExercises(undefined), ...packageExercises("range-actions")];
  const attempts = [
    ...attemptsFor(completed),
    ...evaluationExercises
      .filter(({ learningPackage }) => learningPackage === "range-actions")
      .flatMap((item) => evidenceFor(item, NOW - 24 * 60 * 60 * 1000)),
  ];

  assert.ok(buildRecommendedSession(attempts, undefined, "local-limit", NOW).length <= 12);
});

test("sessão local com avaliações não duplica exerciseId", () => {
  const completed = [...packageExercises(undefined), ...packageExercises("range-actions")];
  const attempts = [
    ...attemptsFor(completed),
    ...evaluationExercises
      .filter(({ learningPackage }) => learningPackage === "range-actions")
      .flatMap((item) => evidenceFor(item, NOW - 24 * 60 * 60 * 1000)),
  ];
  const ids = buildRecommendedSession(attempts, undefined, "local-unique", NOW).map(({ id }) => id);

  assert.equal(new Set(ids).size, ids.length);
});

test("diagnóstico não usa development do próprio pacote incompleto", () => {
  const incompletePackage = packageExercises("range-strength-signals");
  const attempts = [
    ...attemptsFor(developmentExercises.filter(({ learningPackage }) => learningPackage !== "range-strength-signals")),
    ...diagnosticErrors(incompletePackage.filter(({ reasoningPattern }) => reasoningPattern).slice(0, 3)),
  ];
  const completedDevelopment = developmentExercises.filter(
    ({ learningPackage }) => learningPackage !== "range-strength-signals",
  );
  const reinforcement = selectDiagnosticReinforcement(
    attempts,
    incompletePackage[0].primarySkill,
    completedDevelopment,
  );

  assert.equal(
    reinforcement?.learningPackage === "range-strength-signals",
    false,
  );
});

test("matching de evaluation por reasoningPattern ignora variantGroup conflitante", () => {
  const related = developmentExercises.find(({ reasoningPattern }) => reasoningPattern);
  assert.ok(related);
  const matches = relatedDevelopmentExercises({
    ...evaluationExercises[0],
    reasoningPattern: related.reasoningPattern,
    concept: "concept-inexistente",
    variantGroup: "variant-inexistente",
  });

  assert.ok(matches.length > 0);
  assert.ok(matches.every(({ reasoningPattern }) => reasoningPattern === related.reasoningPattern));
});

test("fallback por concept só ocorre sem match de reasoningPattern", () => {
  const related = developmentExercises.find(({ concept }) => concept);
  assert.ok(related);
  const matches = relatedDevelopmentExercises({
    ...evaluationExercises[0],
    reasoningPattern: "pattern-inexistente",
    concept: related.concept,
  });

  assert.ok(matches.length > 0);
  assert.ok(matches.every(({ concept }) => concept === related.concept));
});

test("fallback final por primarySkill só ocorre sem match específico", () => {
  const evaluation = evaluationExercises[0];
  const matches = relatedDevelopmentExercises({
    ...evaluation,
    reasoningPattern: "pattern-inexistente",
    concept: "concept-inexistente",
  });

  assert.ok(matches.length > 0);
  assert.ok(matches.every(({ primarySkill }) => primarySkill === evaluation.primarySkill));
});

test("retention correta não reduz suporte de development relacionado", () => {
  const evaluation = evaluationExercises.find(({ purpose, variantGroup }) =>
    purpose === "retention" && developmentExercises.some((exercise) => exercise.variantGroup === variantGroup),
  );
  assert.ok(evaluation);
  const development = developmentExercises.find(({ variantGroup }) => variantGroup === evaluation.variantGroup);
  assert.ok(development);
  const attempts = attemptsFor([evaluation, evaluation], { sessionId: "retention-correct" }).map(
    (attempt, index) => ({ ...attempt, sessionId: `retention-${index}`, support: "independent" as const }),
  );

  assert.equal(getActualSupport(development, attempts), development.support);
});

test("retention errada não restaura suporte de development relacionado", () => {
  const development = developmentExercises.find(({ support, variantGroup }) =>
    support === "guided" && developmentExercises.filter((item) => item.variantGroup === variantGroup).length >= 2,
  );
  assert.ok(development);
  const related = developmentExercises.filter(({ variantGroup }) => variantGroup === development.variantGroup);
  const developmentEvidence = attemptsFor(related.slice(0, 2), { sessionId: "development-correct" });
  const evaluation = evaluationExercises.find(({ purpose }) => purpose === "retention");
  assert.ok(evaluation);
  const wrongRetention = attemptsFor([evaluation], { correct: false, sessionId: "retention-wrong" });

  assert.equal(getActualSupport(development, developmentEvidence), "supported");
  assert.equal(getActualSupport(development, [...developmentEvidence, ...wrongRetention]), "supported");
});

test("transfer não altera a prioridade de development nem indiretamente pela Skill", () => {
  const transfer = evaluationExercises.find(({ purpose }) => purpose === "transfer");
  assert.ok(transfer);
  const development = developmentExercises.find(
    ({ primarySkill }) => primarySkill === transfer.primarySkill,
  );
  assert.ok(development);
  const attempt = attemptsFor([transfer], { correct: false, sessionId: "transfer-error" });

  assert.equal(
    exercisePriority(development, attempt, development.primarySkill),
    exercisePriority(development, [], development.primarySkill),
  );
});

test("histórico exclusivamente evaluation mantém SkillState idêntico", () => {
  const attempts = attemptsFor(evaluationExercises, { correct: false, sessionId: "evaluations-only" });

  for (const skill of Object.keys(skillLabels) as Skill[]) {
    assert.equal(deriveSkillState(attempts, skill), deriveSkillState([], skill));
  }
});

test("sessão com evidência local permanece determinística", () => {
  const completed = [...packageExercises(undefined), ...packageExercises("range-actions")];
  const item = evaluationExercises.find(({ learningPackage }) => learningPackage === "range-actions");
  assert.ok(item);
  const attempts = [...attemptsFor(completed), ...evidenceFor(item, NOW - 24 * 60 * 60 * 1000)];

  const first = buildRecommendedSession(attempts, undefined, "local-determinism", NOW);
  const second = buildRecommendedSession(attempts, undefined, "local-determinism", NOW);
  assert.deepEqual(first.map(({ id }) => id), second.map(({ id }) => id));
});

test("V0.11 é o sexto pacote e só aparece após range-strength-signals", () => {
  const beforeSignalsEnd = developmentExercises.filter(({ learningPackage, id }) =>
    learningPackage !== "hand-function-vs-range" && id !== "dev-range-signals-12");
  assert.equal(getPendingLearningPackage(attemptsFor(beforeSignalsEnd)), "range-strength-signals");
  const previous = developmentExercises.filter(({ learningPackage }) => learningPackage !== "hand-function-vs-range");
  assert.equal(getPendingLearningPackage(attemptsFor(previous)), "hand-function-vs-range");
});

test("hand-function-vs-range entra nos três microblocos, retoma parcialmente e erro não embaralha", () => {
  const previous = developmentExercises.filter(({ learningPackage }) => learningPackage !== "hand-function-vs-range");
  const attempts = attemptsFor(previous);
  const first = buildRecommendedSession(attempts, undefined, "hand-range-first").filter(({ sessionRole }) => sessionRole === "introduction");
  assert.deepEqual(first.map(({ id }) => id), packageIds("hand-function-vs-range", 1, 4));
  assert.deepEqual(reprioritizeAfterError(first, 0, first[0]).map(({ id }) => id), first.map(({ id }) => id));
  attempts.push(...attemptsFor(first.slice(0, 2), { sessionId: "hand-range-partial" }));
  const resumed = buildRecommendedSession(attempts, undefined, "hand-range-resume").filter(({ sessionRole }) => sessionRole === "introduction");
  assert.deepEqual(resumed.map(({ id }) => id), packageIds("hand-function-vs-range", 1, 4).slice(2));
  attempts.push(...attemptsFor(resumed, { sessionId: "hand-range-complete-one" }));
  for (const [start, end] of [[5, 8], [9, 12]] as const) {
    const block = buildRecommendedSession(attempts, undefined, `hand-range-${start}`).filter(({ sessionRole }) => sessionRole === "introduction");
    assert.deepEqual(block.map(({ id }) => id), packageIds("hand-function-vs-range", start, end));
    attempts.push(...attemptsFor(block, { sessionId: `hand-range-${start}` }));
  }
});

test("treino manual não vaza V0.11 inédita e avaliações próprias ficam bloqueadas", () => {
  const incomplete = developmentExercises.filter(({ id }) => id !== "dev-hand-range-12");
  const attempts = attemptsFor(incomplete);
  const session = buildRecommendedSession(attempts, "range-reading", "hand-range-manual", NOW);
  assert.equal(session.some(({ id }) => id === "dev-hand-range-12"), false);
  assert.equal(eligibleRetentionExercises(attempts, NOW + 86_400_000).some(({ learningPackage }) => learningPackage === "hand-function-vs-range"), false);
  assert.equal(eligibleTransferExercises(attempts).some(({ learningPackage }) => learningPackage === "hand-function-vs-range"), false);
});

test("avaliações e diagnóstico anteriores coexistem com a introdução V0.11", () => {
  const previous = developmentExercises.filter(({ learningPackage }) => learningPackage !== "hand-function-vs-range");
  const oldTransfer = evaluationExercises.find(({ id }) => id === "transfer-range-signals-01");
  assert.ok(oldTransfer);
  const oldFamily = packageExercises("range-strength-signals").filter(({ reasoningPattern }) => reasoningPattern === "stack-range-strength-clues");
  const attempts = [...attemptsFor(previous), ...evidenceFor(oldTransfer), ...diagnosticErrors(oldFamily, 3, 50)];
  const session = buildRecommendedSession(attempts, undefined, "hand-range-coexist", NOW);
  assert.deepEqual(session.slice(0, 4).map(({ id }) => id), packageIds("hand-function-vs-range", 1, 4));
  assert.ok(session.some(({ purpose }) => purpose === "transfer"));
  assert.ok(session.slice(4).some(({ reasoningPattern }) => reasoningPattern === "stack-range-strength-clues"));
  assert.ok(session.length <= 12);
});

test("V0.11 libera retention e transfer pelas regras normais", () => {
  const retention = evaluationExercises.find(({ id }) => id === "retention-hand-range-01");
  const transfer = evaluationExercises.find(({ id }) => id === "transfer-hand-range-01");
  assert.ok(retention && transfer);
  const complete = completedDevelopmentAttempts();
  const retentionAttempts = [...complete, ...evidenceFor(retention, NOW - 86_400_000)];
  const transferAttempts = [...complete, ...evidenceFor(transfer)];
  assert.ok(eligibleRetentionExercises(retentionAttempts, NOW).some(({ id }) => id === retention.id));
  assert.ok(eligibleTransferExercises(transferAttempts).some(({ id }) => id === transfer.id));
});

test("V0.11 possui 84 development, 42 reservados e exatamente seis avaliações novas", () => {
  const items = evaluationExercises.filter(({ learningPackage }) => learningPackage === "hand-function-vs-range");
  assert.equal(developmentExercises.length, 84);
  assert.equal(evaluationExercises.length, 42);
  assert.equal(items.length, 6);
  assert.deepEqual(items.map(({ purpose }) => purpose).sort(), ["retention", "retention", "retention", "transfer", "transfer", "transfer"]);
  assert.ok(items.every(({ support, packageSequence }) => support === "independent" && packageSequence === undefined));
  assert.equal(new Set(allExercises.map(({ id }) => id)).size, allExercises.length);
});

test("conteúdo V0.11 mantém função contextual, alvos, calibração e exclusões editoriais", () => {
  const items = [...packageExercises("hand-function-vs-range"), ...evaluationExercises.filter(({ learningPackage }) => learningPackage === "hand-function-vs-range")];
  assert.ok(items.every(({ sourceKind }) => sourceKind !== "solver-reference"));
  assert.ok(items.some(({ subconcept }) => subconcept === "thin-value-context"));
  assert.ok(items.some(({ subconcept }) => subconcept === "sdv-context"));
  assert.ok(items.some(({ subconcept }) => subconcept === "draw-without-target"));
  assert.ok(items.some(({ subconcept }) => subconcept === "air-without-target"));
  assert.ok(items.some(({ concept }) => concept === "range-response-calibration"));
  const thickValueBoundary = items.find(({ id }) => id === "dev-hand-range-04");
  assert.ok(thickValueBoundary);
  assert.match(thickValueBoundary.prompt, /integra/i);
  assert.match(
    thickValueBoundary.options.find(({ id }) => id === thickValueBoundary.correctOptionId)?.label ?? "",
    /range mais forte.*função de Thick Value/i,
  );
  const incorrectOptionIds = thickValueBoundary.options
    .filter(({ id }) => id !== thickValueBoundary.correctOptionId)
    .map(({ id }) => id)
    .sort();
  assert.deepEqual(Object.keys(thickValueBoundary.feedback.misconception ?? {}).sort(), incorrectOptionIds);
  const correctText = items.map((item) => item.options.find(({ id }) => id === item.correctOptionId)?.label ?? "").join(" ").toLowerCase();
  assert.equal(/range forte[^.]{0,40}(fold|foldar)/.test(correctText), false);
  assert.equal(/range (mais )?fraco[^.]{0,40}(bet|raise|apost)/.test(correctText), false);
  const allText = JSON.stringify(items).toLowerCase();
  for (const forbidden of ["timing tell", "double previous", "checkback", "board pair", "check-raise river", "donk", "ggpoker", "nl2"]) assert.equal(allText.includes(forbidden), false);
});

test("V0.11 preserva determinismo e o limite de 12 decisões", () => {
  const attempts = completedDevelopmentAttempts();
  const first = buildRecommendedSession(attempts, "integrated-decision", "v011-stable", NOW);
  const second = buildRecommendedSession(attempts, "integrated-decision", "v011-stable", NOW);
  assert.deepEqual(first.map(({ id }) => id), second.map(({ id }) => id));
  assert.ok(first.length <= 12);
});
