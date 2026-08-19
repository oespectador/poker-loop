import assert from "node:assert/strict";
import test from "node:test";

import { allExercises, developmentExercises, evaluationExercises } from "../lib/exercises";
import { validateExerciseLibrary, type ExerciseCollections } from "../lib/libraryValidation";
import { attemptSupport } from "../lib/support";
import type { Exercise } from "../lib/types";

function exercise(overrides: Partial<Exercise> = {}): Exercise {
  return {
    id: "exercise-1",
    purpose: "development",
    primarySkill: "board-reading",
    support: "independent",
    spot: { label: "Spot", pot: "10bb", stack: "100bb", hero: "Herói" },
    prompt: "Decisão?",
    options: [{ id: "a", label: "A" }, { id: "b", label: "B" }],
    correctOptionId: "a",
    feedback: { short: "Feedback" },
    sourceKind: "theory",
    ...overrides,
  };
}

function collections(development: Exercise[], evaluation: Exercise[] = []): ExerciseCollections {
  return { developmentExercises: development, evaluationExercises: evaluation, allExercises: [...development, ...evaluation] };
}

test("a biblioteca V0.4 satisfaz o contrato estático atual", () => {
  assert.deepEqual(validateExerciseLibrary({ developmentExercises, evaluationExercises, allExercises }), []);
});

test("detecta IDs de exercício, IDs de opção e labels aparados duplicados", () => {
  const duplicated = exercise({
    options: [{ id: "same", label: " Call " }, { id: "same", label: "Call" }],
    correctOptionId: "missing",
  });
  const errors = validateExerciseLibrary(collections([duplicated, duplicated]));

  assert.ok(errors.some((error) => error.includes("ID de exercício duplicado")));
  assert.ok(errors.some((error) => error.includes("ID de opção duplicado")));
  assert.ok(errors.some((error) => error.includes("label de opção duplicado")));
  assert.ok(errors.some((error) => error.includes("correctOptionId não existe")));
});

test("detecta supportNote ausente e purpose incompatível com a coleção", () => {
  const development = exercise({ support: "guided" });
  const evaluation = exercise({ id: "evaluation", purpose: "development" });
  const errors = validateExerciseLibrary(collections([development], [evaluation]));

  assert.ok(errors.some((error) => error.includes("guided exige supportNote")));
  assert.ok(errors.some((error) => error.includes("evaluationExercises contém purpose=development")));
});

test("detecta sequência ausente, duplicada e omitida nos pacotes estruturados", () => {
  const items = [
    exercise({ id: "ra-1", learningPackage: "range-actions", packageSequence: 1 }),
    exercise({ id: "ra-duplicate", learningPackage: "range-actions", packageSequence: 1 }),
    exercise({ id: "ra-no-sequence", learningPackage: "range-actions" }),
  ];
  const errors = validateExerciseLibrary(collections(items));

  assert.ok(errors.some((error) => error.includes("packageSequence duplicada: 1")));
  assert.ok(errors.some((error) => error.includes("exige packageSequence")));
  assert.ok(errors.some((error) => error.includes("packageSequence faltando: 2")));
});

test("detecta divergência entre allExercises e suas coleções componentes", () => {
  const item = exercise();
  const errors = validateExerciseLibrary({
    developmentExercises: [item],
    evaluationExercises: [],
    allExercises: [exercise({ id: "other" })],
  });

  assert.ok(errors.some((error) => error.includes("diverge das coleções componentes")));
});

test("guided é sempre registrado como guided", () => {
  assert.equal(attemptSupport(exercise({ support: "guided" }), false), "guided");
  assert.equal(attemptSupport(exercise({ support: "guided" }), true), "guided");
});

test("supported com pista aberta é registrado como supported", () => {
  assert.equal(attemptSupport(exercise({ support: "supported" }), true), "supported");
});

test("supported sem pista aberta é registrado como independent", () => {
  assert.equal(attemptSupport(exercise({ support: "supported" }), false), "independent");
});

test("independent é sempre registrado como independent", () => {
  assert.equal(attemptSupport(exercise({ support: "independent" }), false), "independent");
  assert.equal(attemptSupport(exercise({ support: "independent" }), true), "independent");
});
