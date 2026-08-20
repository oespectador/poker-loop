import assert from "node:assert/strict";
import test from "node:test";

import {
  summarizeDifficultyPatterns,
  type DiagnosticExercise,
} from "../lib/diagnostics";
import type { Attempt, Skill, SupportLevel } from "../lib/types";

const exercises: DiagnosticExercise[] = [
  { id: "rp-a", purpose: "development", reasoningPattern: "pattern-a", concept: "shared" },
  { id: "rp-b", purpose: "development", reasoningPattern: "pattern-a", concept: "shared" },
  { id: "rp-c", purpose: "development", reasoningPattern: "pattern-a", concept: "shared" },
  { id: "rp-other-a", purpose: "development", reasoningPattern: "pattern-b" },
  { id: "rp-other-b", purpose: "development", reasoningPattern: "pattern-b" },
  { id: "concept-a", purpose: "development", concept: "concept-only" },
  { id: "concept-b", purpose: "development", concept: "concept-only" },
  { id: "skill-only-a", purpose: "development" },
  { id: "skill-only-b", purpose: "development" },
  { id: "retention", purpose: "retention", reasoningPattern: "pattern-a" },
  { id: "transfer", purpose: "transfer", reasoningPattern: "pattern-a" },
];

let sequence = 0;
function attempt(
  exerciseId: string,
  sessionId: string,
  options: {
    correct?: boolean;
    support?: SupportLevel;
    primarySkill?: Skill;
    minute?: number;
  } = {},
): Attempt {
  sequence += 1;
  const correct = options.correct ?? false;
  return {
    id: `attempt-${sequence}`,
    exerciseId,
    sessionId,
    primarySkill: options.primarySkill ?? "range-reading",
    answerId: correct ? "correct" : "incorrect",
    correct,
    support: options.support ?? "independent",
    timestamp: new Date(Date.UTC(2026, 0, 1, 0, options.minute ?? sequence)).toISOString(),
  };
}

function summarize(items: Attempt[], fixture = exercises) {
  return summarizeDifficultyPatterns(items, fixture);
}

test("um único erro não gera sinal", () => {
  assert.deepEqual(summarize([attempt("rp-a", "s1")]), []);
});

test("dois erros no mesmo exercício não geram sinal", () => {
  assert.deepEqual(summarize([attempt("rp-a", "s1"), attempt("rp-a", "s2")]), []);
});

test("dois erros em exercícios diferentes na mesma sessão não geram sinal", () => {
  assert.deepEqual(summarize([attempt("rp-a", "s1"), attempt("rp-b", "s1")]), []);
});

test("dois erros independentes relacionados em exercícios e sessões diferentes geram candidate", () => {
  const [pattern] = summarize([attempt("rp-a", "s1"), attempt("rp-b", "s2")]);
  assert.deepEqual(pattern, {
    key: "pattern-a",
    source: "reasoningPattern",
    status: "candidate",
    attempts: 2,
    errors: 2,
    distinctExercises: 2,
    sessions: 2,
    recentErrors: 2,
    lastAttemptAt: pattern.lastAttemptAt,
  });
});

test("três erros em três exercícios do mesmo reasoningPattern geram recurring", () => {
  const [pattern] = summarize([
    attempt("rp-a", "s1"),
    attempt("rp-b", "s2"),
    attempt("rp-c", "s2"),
  ]);
  assert.equal(pattern.status, "recurring");
  assert.equal(pattern.errors, 3);
  assert.equal(pattern.distinctExercises, 3);
  assert.equal(pattern.sessions, 2);
});

test("erro guided não entra no diagnóstico", () => {
  assert.deepEqual(summarize([
    attempt("rp-a", "s1", { support: "guided" }),
    attempt("rp-b", "s2"),
  ]), []);
});

test("tentativa registrada como supported não entra no diagnóstico", () => {
  assert.deepEqual(summarize([
    attempt("rp-a", "s1", { support: "supported" }),
    attempt("rp-b", "s2"),
  ]), []);
});

test("retention e transfer não entram no diagnóstico", () => {
  assert.deepEqual(summarize([
    attempt("retention", "s1"),
    attempt("transfer", "s2"),
    attempt("rp-a", "s3"),
  ]), []);
});

test("reasoningPattern tem prioridade sobre concept", () => {
  const patterns = summarize([
    attempt("rp-a", "s1"),
    attempt("rp-b", "s2"),
    attempt("concept-a", "s3"),
  ]);
  assert.equal(patterns.length, 1);
  assert.equal(patterns[0].source, "reasoningPattern");
  assert.equal(patterns[0].key, "pattern-a");
});

test("concept funciona como fallback sem reasoningPattern", () => {
  const [pattern] = summarize([attempt("concept-a", "s1"), attempt("concept-b", "s2")]);
  assert.equal(pattern.source, "concept");
  assert.equal(pattern.key, "concept-only");
});

test("primarySkill sozinho não agrupa exercícios", () => {
  assert.deepEqual(summarize([
    attempt("skill-only-a", "s1", { primarySkill: "sizing" }),
    attempt("skill-only-b", "s2", { primarySkill: "sizing" }),
  ]), []);
});

test("exercícios sem reasoningPattern ou concept são ignorados", () => {
  assert.deepEqual(summarize([
    attempt("skill-only-a", "s1"),
    attempt("skill-only-b", "s2"),
  ]), []);
});

test("três acertos independentes recentes em dois exercícios desativam sinal anterior", () => {
  assert.deepEqual(summarize([
    attempt("rp-a", "s1"),
    attempt("rp-b", "s2"),
    attempt("rp-a", "s3", { correct: true }),
    attempt("rp-b", "s4", { correct: true }),
    attempt("rp-a", "s5", { correct: true }),
  ]), []);
});

test("reasoningPatterns diferentes ficam separados mesmo com primarySkill igual", () => {
  const patterns = summarize([
    attempt("rp-a", "s1"),
    attempt("rp-b", "s2"),
    attempt("rp-other-a", "s3"),
    attempt("rp-other-b", "s4"),
  ]);
  assert.deepEqual(patterns.map(({ key }) => key).sort(), ["pattern-a", "pattern-b"]);
});

test("resultado tem ordenação determinística por status, erros recentes, recência e chave", () => {
  const orderingExercises: DiagnosticExercise[] = [
    ...exercises,
    { id: "alpha-a", purpose: "development", reasoningPattern: "alpha" },
    { id: "alpha-b", purpose: "development", reasoningPattern: "alpha" },
  ];
  const items = [
    attempt("rp-other-a", "s1", { minute: 20 }),
    attempt("rp-other-b", "s2", { minute: 21 }),
    attempt("alpha-a", "s1", { minute: 20 }),
    attempt("alpha-b", "s2", { minute: 21 }),
    attempt("rp-a", "s1", { minute: 1 }),
    attempt("rp-b", "s2", { minute: 2 }),
    attempt("rp-c", "s3", { minute: 3 }),
  ];
  const first = summarize(items, orderingExercises);
  const second = summarize([...items].reverse(), orderingExercises);
  assert.deepEqual(first.map(({ key }) => key), ["pattern-a", "alpha", "pattern-b"]);
  assert.deepEqual(second, first);
});

test("histórico vazio retorna lista vazia", () => {
  assert.deepEqual(summarize([]), []);
});
