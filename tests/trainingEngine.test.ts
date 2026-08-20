import assert from "node:assert/strict";
import test from "node:test";

import { allExercises, developmentExercises, evaluationExercises } from "../lib/exercises";
import { buildRecommendedSession, reprioritizeAfterError } from "../lib/trainingEngine";
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

test("a primeira sessão contém os 12 exercícios fundadores em ordem", () => {
  const session = buildRecommendedSession([], undefined, "first-session");

  assert.equal(session.length, 12);
  assert.deepEqual(
    session.map((exercise) => exercise.id),
    founders.map((exercise) => exercise.id),
  );
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

test("itens reservados de retenção e transferência não entram no treino normal", () => {
  const attempts = attemptsFor(developmentExercises, { sessionId: "all-development-seen" });
  const reservedIds = new Set(evaluationExercises.map((exercise) => exercise.id));
  const session = buildRecommendedSession(attempts, undefined, "normal-training");

  assert.equal(session.some((exercise) => reservedIds.has(exercise.id)), false);
  assert.ok(session.every((exercise) => exercise.purpose === "development"));
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
