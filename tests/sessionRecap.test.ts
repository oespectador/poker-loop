import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

import { attemptFeedback, buildSessionRecap, exerciseReasoningIdentity } from "../lib/sessionRecap";
import type { Attempt, Exercise, ExercisePurpose, Skill, SupportLevel } from "../lib/types";

function exercise(id: string, options: { pattern?: string; concept?: string; skill?: Skill; purpose?: ExercisePurpose } = {}): Exercise {
  return {
    id, purpose: options.purpose ?? "development", primarySkill: options.skill ?? "range-reading", support: "independent",
    spot: { label: "Spot", pot: "10bb", stack: "100bb", hero: "Herói" }, prompt: "Decisão?",
    options: [{ id: "wrong", label: "Errada" }, { id: "other", label: "Outra" }, { id: "right", label: "Certa" }],
    correctOptionId: "right", feedback: { short: `Feedback geral ${id}`, misconception: { wrong: `Feedback específico ${id}` } },
    sourceKind: "theory", reasoningPattern: options.pattern, concept: options.concept,
  };
}

let attemptId = 0;
function attempt(exerciseId: string, minute: number, options: { correct?: boolean; session?: string; answer?: string; support?: SupportLevel } = {}): Attempt {
  attemptId += 1;
  return {
    id: `attempt-${attemptId}`, exerciseId, sessionId: options.session ?? "session-a", primarySkill: "range-reading",
    answerId: options.answer ?? (options.correct ? "right" : "wrong"), correct: options.correct ?? false,
    support: options.support ?? "independent", timestamp: new Date(Date.UTC(2026, 0, 1, 0, minute)).toISOString(),
  };
}

test("sessão sem erros produz recap vazio", () => {
  const ex = exercise("a", { pattern: "action-updates-range" });
  assert.deepEqual(buildSessionRecap("session-a", [attempt("a", 1, { correct: true })], [ex]), { items: [], totalWrongAttempts: 0, distinctReasoningItems: 0 });
});

test("um erro produz um item com feedback específico", () => {
  const ex = exercise("a", { pattern: "action-updates-range" });
  const recap = buildSessionRecap("session-a", [attempt("a", 1)], [ex]);
  assert.equal(recap.items.length, 1);
  assert.equal(recap.items[0].feedback, "Feedback específico a");
  assert.equal(recap.totalWrongAttempts, 1);
});

test("misconception da alternativa tem prioridade e short é fallback", () => {
  const ex = exercise("a");
  assert.equal(attemptFeedback(attempt("a", 1), ex), "Feedback específico a");
  assert.equal(attemptFeedback(attempt("a", 2, { answer: "other" }), ex), "Feedback geral a");
});

test("erros da mesma reasoningPattern são agrupados pelo erro mais recente", () => {
  const a = exercise("a", { pattern: "action-updates-range" });
  const b = exercise("b", { pattern: "action-updates-range" });
  const recap = buildSessionRecap("session-a", [attempt("b", 3), attempt("a", 7)], [a, b]);
  assert.equal(recap.items.length, 1);
  assert.equal(recap.items[0].wrongCount, 2);
  assert.equal(recap.items[0].feedback, "Feedback específico a");
  assert.equal(recap.items[0].lastWrongAt, new Date(Date.UTC(2026, 0, 1, 0, 7)).toISOString());
});

test("reasoningPatterns diferentes produzem itens diferentes", () => {
  const exercises = [exercise("a", { pattern: "action-updates-range" }), exercise("b", { pattern: "objective-action-fit" })];
  assert.equal(buildSessionRecap("session-a", [attempt("a", 1), attempt("b", 2)], exercises).items.length, 2);
});

test("concept é fallback de identidade", () => {
  assert.equal(exerciseReasoningIdentity(exercise("a", { concept: "conceito-interno" })).id, "concept:conceito-interno");
});

test("identidade desconhecida recebe fallback humano da Skill sem label técnico", () => {
  const identities = [
    exerciseReasoningIdentity(exercise("a", { pattern: "nao-catalogado", skill: "sizing" })),
    exerciseReasoningIdentity(exercise("b", { concept: "interno", skill: "board-reading" })),
    exerciseReasoningIdentity(exercise("c", { skill: "integrated-decision" })),
  ];
  assert.deepEqual(identities.map(({ label }) => label), ["Rever: Sizing", "Rever: Leitura do board", "Rever: Decisão integrada"]);
  for (const { label } of identities) assert.doesNotMatch(label, /reasoningPattern:|concept:|primarySkill:/);
});

test("correto anterior ao último erro não conta como posterior", () => {
  const ex = exercise("a", { pattern: "action-updates-range" });
  const item = buildSessionRecap("session-a", [attempt("a", 1, { correct: true }), attempt("a", 2)], [ex]).items[0];
  assert.equal(item.laterCorrectInSession, false);
});

for (const support of ["guided", "supported", "independent"] as const) {
  test(`acerto posterior ${support} conta somente como evento posterior`, () => {
    const ex = exercise("a", { pattern: "action-updates-range" });
    const item = buildSessionRecap("session-a", [attempt("a", 1), attempt("a", 2, { correct: true, support })], [ex]).items[0];
    assert.equal(item.laterCorrectInSession, true);
    assert.doesNotMatch(JSON.stringify(item), /recovery|recupera|dom[ií]nio|aprendeu/i);
  });
}

test("outra sessão e exerciseId desconhecido são ignorados", () => {
  const ex = exercise("a", { pattern: "action-updates-range" });
  const recap = buildSessionRecap("session-a", [attempt("a", 1, { session: "session-b" }), attempt("missing", 2)], [ex]);
  assert.equal(recap.totalWrongAttempts, 0);
});

test("development, retention e transfer participam sem distinção longitudinal", () => {
  const exercises = [
    exercise("dev", { pattern: "action-updates-range", purpose: "development" }),
    exercise("ret", { pattern: "objective-action-fit", purpose: "retention" }),
    exercise("tra", { pattern: "target-response-size", purpose: "transfer" }),
  ];
  const recap = buildSessionRecap("session-a", exercises.map((ex, index) => attempt(ex.id, index + 1)), exercises);
  assert.equal(recap.items.length, 3);
  assert.equal(recap.totalWrongAttempts, 3);
});

test("ordena sem acerto posterior, depois por recência e finalmente por id", () => {
  const exercises = [
    exercise("a", { pattern: "action-updates-range" }),
    exercise("b", { pattern: "objective-action-fit" }),
    exercise("c", { pattern: "target-response-size" }),
    exercise("d", { pattern: "range-label" }),
  ];
  const history = [attempt("a", 1), attempt("a", 9, { correct: true }), attempt("b", 5), attempt("c", 5), attempt("d", 8)];
  assert.deepEqual(buildSessionRecap("session-a", history, exercises).items.map(({ id }) => id), [
    "reasoningPattern:range-label", "reasoningPattern:objective-action-fit", "reasoningPattern:target-response-size", "reasoningPattern:action-updates-range",
  ]);
});

test("copy da UI limita três cards, informa restantes e mantém disclosure conservador", () => {
  const source = readFileSync("app/session/TrainingSession.tsx", "utf8");
  assert.match(source, /recap\.items\.slice\(0, 3\)/);
  assert.match(source, /Outros \{remainingRecapItems\} raciocínios/);
  assert.match(source, /Padrões recorrentes, retenção e transferência são avaliados separadamente/);
  assert.match(source, /Nenhum erro foi registrado nesta sessão/);
  assert.doesNotMatch(source, /VAMOS REFORÇAR|leak|fraqueza|dominou|mastery|recuperou|corrigiu definitivamente|aprendeu/i);
});

test("módulo puro não importa domínios proibidos nem storage", () => {
  const source = readFileSync("lib/sessionRecap.ts", "utf8");
  assert.doesNotMatch(source, /diagnostics|realHand|investigation|storage/i);
});
