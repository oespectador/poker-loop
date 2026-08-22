import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { deriveRealHandInvestigations } from "../lib/realHandInvestigations";
import type { ReasoningFactor, SelfRatedSupport, StoredRealHandReasoningSnapshot } from "../lib/types";

function snapshot(id: string, factors: ReasoningFactor[], support?: SelfRatedSupport, options: { handReviewId?: string; createdAt?: string; legacy?: boolean; street?: "preflop" | "flop" | "turn" | "river" } = {}): StoredRealHandReasoningSnapshot {
  const value = { id, handReviewId: options.handReviewId ?? `hand-${id}`, createdAt: options.createdAt ?? `2026-08-${String(Number(id.replace(/\D/g, "") || 1)).padStart(2, "0")}T00:00:00Z`, sourceHandId: "source", sourceDecision: { street: options.street ?? "flop", sequenceIndex: 0, action: "check" as const }, factors, selfRatedSupport: support };
  if (!options.legacy) return value;
  const { sourceHandId: _sourceHandId, ...legacy } = value;
  return legacy;
}

test("zero snapshots produz zero candidatos", () => assert.deepEqual(deriveRealHandInvestigations([]), []));

test("três revisões com somente uma sustentação low ou unclear não qualificam", () => {
  assert.equal(deriveRealHandInvestigations([snapshot("1", ["size"], "low"), snapshot("2", ["size"], "medium"), snapshot("3", ["size"], "high")]).length, 0);
});

test("três revisões com duas sustentações low ou unclear qualificam", () => {
  const [candidate] = deriveRealHandInvestigations([snapshot("1", ["size"], "low"), snapshot("2", ["size"], "unclear"), snapshot("3", ["size"], "high")]);
  assert.equal(candidate.factor, "size"); assert.equal(candidate.reviewCount, 3); assert.equal(candidate.lowOrUnclearCount, 2);
});

test("cinco revisões e três sustentações baixas ou incertas mantêm contagens exatas", () => {
  const values = [snapshot("1", ["board"], "low"), snapshot("2", ["board"], "unclear"), snapshot("3", ["board"], "low"), snapshot("4", ["board"], "medium"), snapshot("5", ["board"], "high")];
  const [candidate] = deriveRealHandInvestigations(values); assert.equal(candidate.reviewCount, 5); assert.equal(candidate.lowOrUnclearCount, 3);
});

test("automatic qualifica em exatamente três revisões e não exige sustentação", () => {
  const [candidate] = deriveRealHandInvestigations([snapshot("1", ["automatic"]), snapshot("2", ["automatic"]), snapshot("3", ["automatic"])]);
  assert.equal(candidate.factor, "automatic"); assert.equal(candidate.reviewCount, 3); assert.equal(candidate.lowOrUnclearCount, undefined);
});

test("automatic em duas revisões não qualifica", () => assert.equal(deriveRealHandInvestigations([snapshot("1", ["automatic"]), snapshot("2", ["automatic"])]).length, 0));

test("medium e high não contam como low ou unclear", () => {
  assert.deepEqual(deriveRealHandInvestigations([snapshot("1", ["other"], "medium"), snapshot("2", ["other"], "high"), snapshot("3", ["other"], "medium")]), []);
});

test("handReviewId duplicado não aumenta a evidência", () => {
  const values = [snapshot("1", ["size"], "low", { handReviewId: "same" }), snapshot("2", ["size"], "unclear", { handReviewId: "same" }), snapshot("3", ["size"], "low")];
  assert.equal(deriveRealHandInvestigations(values).length, 0);
});

test("dois fatores na mesma revisão contribuem separadamente", () => {
  const values = ["1", "2", "3"].map((id) => snapshot(id, ["size", "board"], id === "3" ? "high" : "low"));
  assert.deepEqual(deriveRealHandInvestigations(values).map(({ factor }) => factor), ["size", "board"]);
});

test("evidências representativas têm teto de três e preferem as mais recentes", () => {
  const values = ["1", "2", "3", "4", "5"].map((id) => snapshot(id, ["size"], Number(id) < 3 ? "low" : "high"));
  assert.deepEqual(deriveRealHandInvestigations(values)[0].representativeHandReviewIds, ["hand-5", "hand-4", "hand-3"]);
});

test("escolha representativa é determinística inclusive em empate temporal", () => {
  const values = [snapshot("a", ["size"], "low", { createdAt: "2026-08-20T00:00:00Z" }), snapshot("b", ["size"], "unclear", { createdAt: "2026-08-20T00:00:00Z" }), snapshot("c", ["size"], "high", { createdAt: "2026-08-19T00:00:00Z" })];
  assert.deepEqual(deriveRealHandInvestigations(values)[0].snapshotIds, ["b", "a", "c"]);
  assert.deepEqual(deriveRealHandInvestigations([...values].reverse())[0].snapshotIds, ["b", "a", "c"]);
});

test("excluir snapshot pode fazer o candidato desaparecer", () => {
  const values = [snapshot("1", ["size"], "low"), snapshot("2", ["size"], "unclear"), snapshot("3", ["size"], "high")];
  assert.equal(deriveRealHandInvestigations(values).length, 1); assert.equal(deriveRealHandInvestigations(values.slice(1)).length, 0);
});

test("snapshot legado participa da qualificação", () => {
  const values = [snapshot("1", ["player-read"], "low", { legacy: true }), snapshot("2", ["player-read"], "unclear"), snapshot("3", ["player-read"], "high")];
  assert.equal(deriveRealHandInvestigations(values)[0].reviewCount, 3);
});

test("street isoladamente nunca gera candidato", () => {
  const values = ["1", "2", "3", "4"].map((id) => snapshot(id, [], "low", { street: "river" }));
  assert.deepEqual(deriveRealHandInvestigations(values), []);
});

test("módulo é puro e isolado do motor pedagógico", () => {
  const source = readFileSync("lib/realHandInvestigations.ts", "utf8");
  assert.doesNotMatch(source, /localStorage|\bwindow\b|readReasoningSnapshots|trainingEngine|diagnostics|learningLoop|\bAttempt\b|SkillState|scheduler/);
});

test("módulo não cria associação de ReasoningFactor para Skill", () => {
  const source = readFileSync("lib/realHandInvestigations.ts", "utf8");
  assert.doesNotMatch(source, /\bSkill\b|board-reading|range-reading|sizing/);
});

test("copy permanece cautelosa e factual", () => {
  const candidates = deriveRealHandInvestigations([snapshot("1", ["size", "board"], "low"), snapshot("2", ["size", "board"], "unclear"), snapshot("3", ["size", "board"], "high")]);
  for (const { text } of candidates) assert.doesNotMatch(text.toLowerCase(), /leak|erro|fraqueza|defici.ncia|problema|precisa melhorar|deveria estudar|jogando errado/);
});
