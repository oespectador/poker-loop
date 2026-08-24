import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { MIN_REVIEWS_FOR_PATTERN_SCAN, reasoningFactorOrder, summarizeRealHandReviewPatterns } from "../lib/realHandReviewPatterns";
import type { ReasoningFactor, SelfRatedSupport, StoredRealHandReasoningSnapshot } from "../lib/types";

function snapshot(id: string, factors: ReasoningFactor[] = [], support?: SelfRatedSupport, street: "preflop" | "flop" | "turn" | "river" = "flop", legacy = false): StoredRealHandReasoningSnapshot {
  const value = { id, handReviewId: `hand-${id}`, createdAt: "2026-08-21T00:00:00Z", sourceHandId: "source", sourceDecision: { street, sequenceIndex: 0, action: "check" as const }, factors, selfRatedSupport: support };
  if (!legacy) return value;
  const { sourceHandId: _sourceHandId, ...withoutSource } = value;
  return withoutSource;
}

test("zero snapshots produz contagens vazias e estado sem observações", () => {
  const summary = summarizeRealHandReviewPatterns([]);
  assert.equal(summary.reviewedHands, 0);
  assert.equal(summary.hasEnoughReviewsForObservations, false);
  assert.equal(MIN_REVIEWS_FOR_PATTERN_SCAN, 3);
  assert.equal(summary.minimumReviewsForObservations, 3);
  assert.equal(summary.reviewsUntilObservationsPossible, 3);
  assert.deepEqual(summary.observations, []);
  assert.ok(Object.values(summary.factorCounts).every((count) => count === 0));
});

test("countdown factual termina no milestone e nunca fica negativo", () => {
  assert.equal(summarizeRealHandReviewPatterns([snapshot("1")]).reviewsUntilObservationsPossible, 2);
  assert.equal(summarizeRealHandReviewPatterns([snapshot("1"), snapshot("2")]).reviewsUntilObservationsPossible, 1);
  const three = summarizeRealHandReviewPatterns([snapshot("1"), snapshot("2"), snapshot("3")]);
  assert.equal(three.reviewsUntilObservationsPossible, 0);
  assert.equal(three.hasEnoughReviewsForObservations, true);
  assert.deepEqual(three.observations, []);
  assert.equal(summarizeRealHandReviewPatterns(Array.from({ length: 10 }, (_, index) => snapshot(String(index)))).reviewsUntilObservationsPossible, 0);
});

test("milestone sem repetição não inventa observação", () => {
  const summary = summarizeRealHandReviewPatterns([snapshot("1", ["size"]), snapshot("2", ["board"]), snapshot("3", ["player-read"])]);
  assert.equal(summary.hasEnoughReviewsForObservations, true);
  assert.deepEqual(summary.observations, []);
});

test("copy da superfície distingue countdown de leitura em andamento", () => {
  const source = readFileSync("app/hands/page.tsx", "utf8");
  assert.match(source, /para começarmos a procurar padrões recorrentes/);
  assert.match(source, /Já há revisões suficientes para procurar recorrências/);
  assert.match(source, /Continue revisando normalmente/);
  assert.doesNotMatch(source, /revise mais X mãos/i);
});

test("uma ou duas revisões não produzem observação recorrente", () => {
  assert.deepEqual(summarizeRealHandReviewPatterns([snapshot("1", ["size"])]).observations, []);
  assert.deepEqual(summarizeRealHandReviewPatterns([snapshot("1", ["size"]), snapshot("2", ["size"])]).observations, []);
});

test("fator em exatamente três snapshots pode aparecer, mas fator em dois não", () => {
  const summary = summarizeRealHandReviewPatterns([snapshot("1", ["size", "board"]), snapshot("2", ["size", "board"]), snapshot("3", ["size"])]);
  assert.equal(summary.factorCounts.size, 3);
  assert.equal(summary.factorCounts.board, 2);
  assert.deepEqual(summary.observations.map(({ kind, count }) => [kind, count]), [["factor", 3]]);
});

test("duas opções na mesma revisão contam individualmente e automatic conta como fator", () => {
  const summary = summarizeRealHandReviewPatterns([snapshot("1", ["size", "board"]), snapshot("2", ["automatic"])]);
  assert.equal(summary.factorCounts.size, 1);
  assert.equal(summary.factorCounts.board, 1);
  assert.equal(summary.factorCounts.automatic, 1);
});

test("automatic sem suporte fica fora do denominador de sustentação", () => {
  const summary = summarizeRealHandReviewPatterns([snapshot("1", ["automatic"]), snapshot("2", ["size"], "low"), snapshot("3", ["board"], "high")]);
  assert.equal(summary.reviewedHands, 3);
  assert.equal(summary.supportReviewedHands, 2);
  assert.equal(summary.supportCounts.low, 1);
});

test("low e unclear formam observação factual; medium e high não entram nessa soma", () => {
  const summary = summarizeRealHandReviewPatterns([snapshot("1", [], "low"), snapshot("2", [], "unclear"), snapshot("3", [], "low"), snapshot("4", [], "medium"), snapshot("5", [], "high")]);
  assert.equal(summary.observations[0].count, 3);
  assert.equal(summary.observations[0].denominator, 5);
  assert.match(summary.observations[0].text, /^Em 3 de 5 decisões/);
});

test("contagens por street são corretas", () => {
  const summary = summarizeRealHandReviewPatterns([snapshot("1", [], undefined, "preflop"), snapshot("2", [], undefined, "flop"), snapshot("3", [], undefined, "river"), snapshot("4", [], undefined, "river")]);
  assert.deepEqual(summary.streetCounts, { preflop: 1, flop: 1, turn: 0, river: 2 });
});

test("snapshot legado sem sourceHandId participa de todas as contagens disponíveis", () => {
  const summary = summarizeRealHandReviewPatterns([snapshot("1", ["player-read"], "medium", "turn", true)]);
  assert.equal(summary.reviewedHands, 1);
  assert.equal(summary.factorCounts["player-read"], 1);
  assert.equal(summary.supportCounts.medium, 1);
  assert.equal(summary.streetCounts.turn, 1);
});

test("há no máximo três observações e empates seguem a ordem pública dos fatores", () => {
  const all = reasoningFactorOrder.slice(0, 4);
  const summary = summarizeRealHandReviewPatterns([snapshot("1", all.slice(0, 2)), snapshot("2", all.slice(0, 2)), snapshot("3", all.slice(0, 2)), snapshot("4", all.slice(2, 4)), snapshot("5", all.slice(2, 4)), snapshot("6", all.slice(2, 4))]);
  assert.equal(summary.observations.length, 3);
  assert.deepEqual(summary.observations.map(({ text }) => text.split(" apareceu")[0]), ["Tamanho da aposta", "Board", "Ações anteriores"]);
});

test("copy gerada não usa porcentagens", () => {
  const summary = summarizeRealHandReviewPatterns([snapshot("1", ["automatic"]), snapshot("2", ["automatic"]), snapshot("3", ["automatic"])]);
  assert.ok(summary.observations.every(({ text }) => !text.includes("%")));
});

test("resumo é puro e não lê localStorage", () => {
  const source = readFileSync("lib/realHandReviewPatterns.ts", "utf8");
  assert.doesNotMatch(source, /localStorage|readReasoningSnapshots|\bwindow\b/);
});

test("remoção na entrada se reflete naturalmente sem estado próprio", () => {
  const values = [snapshot("1", ["size"]), snapshot("2", ["size"]), snapshot("3", ["size"])];
  assert.equal(summarizeRealHandReviewPatterns(values).observations.length, 1);
  assert.equal(summarizeRealHandReviewPatterns(values.slice(1)).observations.length, 0);
});

test("módulo não depende de Attempt, SkillState, diagnóstico ou scheduler", () => {
  const source = readFileSync("lib/realHandReviewPatterns.ts", "utf8");
  assert.doesNotMatch(source, /\bAttempt\b|SkillState|diagnostics|trainingEngine|scheduler|learningLoop/);
});
