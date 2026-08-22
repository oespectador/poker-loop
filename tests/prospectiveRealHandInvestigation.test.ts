import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { clearActiveRealHandInvestigation, createActiveRealHandInvestigation, deriveProspectiveInvestigation, isActiveRealHandInvestigation, readActiveRealHandInvestigation, REAL_HAND_INVESTIGATION_KEY, syncProspectiveInvestigation, writeActiveRealHandInvestigation } from "../lib/prospectiveRealHandInvestigation";
import { deriveRealHandInvestigations } from "../lib/realHandInvestigations";
import { clearPrototypeProgress } from "../lib/storage";
import type { ReasoningFactor, SelfRatedSupport, StoredRealHandReasoningSnapshot } from "../lib/types";

function snap(id: string, factors: ReasoningFactor[], support?: SelfRatedSupport, options: { hand?: string; at?: string; legacy?: boolean } = {}): StoredRealHandReasoningSnapshot {
  const value = { id, handReviewId: options.hand ?? `hand-${id}`, createdAt: options.at ?? `2026-08-22T00:00:${id.padStart(2, "0")}Z`, sourceHandId: "source", sourceDecision: { street: "flop" as const, sequenceIndex: 0, action: "check" as const }, factors, selfRatedSupport: support };
  if (!options.legacy) return value;
  const { sourceHandId: _sourceHandId, ...legacy } = value; return legacy;
}
const baseline = [snap("01", ["size"], "low"), snap("02", ["size"], "unclear"), snap("03", ["size"], "high")];
function active(factor: ReasoningFactor = "size") {
  const source = factor === "size" ? baseline : [snap("01", [factor]), snap("02", [factor]), snap("03", [factor])];
  const candidate = deriveRealHandInvestigations(source)[0];
  return { investigation: createActiveRealHandInvestigation(candidate, "investigation-1", "2026-08-22T00:01:00Z"), source };
}
function observed(investigation: ReturnType<typeof active>["investigation"], snapshots: StoredRealHandReasoningSnapshot[]) {
  const synced = syncProspectiveInvestigation(investigation, snapshots); return deriveProspectiveInvestigation(synced, snapshots);
}
function future(id: string, factors: ReasoningFactor[] = [], support?: SelfRatedSupport, options: { hand?: string; at?: string; legacy?: boolean } = {}) { return snap(id, factors, support, { at: options.at ?? `2026-08-22T00:02:${id.padStart(2, "0")}Z`, hand: options.hand, legacy: options.legacy }); }

test("sem investigação não há progresso derivado", () => assert.equal(deriveProspectiveInvestigation(null, baseline), null));
test("criação congela fator, instante e IDs exatos da baseline", () => { const { investigation } = active(); assert.equal(investigation.factor, "size"); assert.equal(investigation.startedAt, "2026-08-22T00:01:00Z"); assert.deepEqual(investigation.baselineSnapshotIds, ["03", "02", "01"]); assert.deepEqual(investigation.baselineHandReviewIds, ["hand-03", "hand-02", "hand-01"]); assert.equal(investigation.baselineReviewCount, 3); assert.equal(investigation.baselineLowOrUnclearCount, 2); });
test("baseline nunca conta na janela", () => { const { investigation, source } = active(); assert.equal(observed(investigation, source)?.reviewedCount, 0); });
test("snapshot anterior ou igual a startedAt não conta", () => { const { investigation, source } = active(); const old = future("04", ["size"], "low", { at: investigation.startedAt }); assert.equal(observed(investigation, [...source, old])?.reviewedCount, 0); });
test("edição antiga com createdAt preservado não vira evidência futura", () => { const { investigation, source } = active(); const edited = snap("old", ["size"], "low", { at: "2026-08-21T00:00:00Z" }); assert.equal(observed(investigation, [...source, edited])?.reviewedCount, 0); });
test("handReviewId duplicado conta uma vez", () => { const { investigation, source } = active(); const result = observed(investigation, [...source, future("04", ["size"], "low", { hand: "same" }), future("05", [], undefined, { hand: "same" })]); assert.equal(result?.reviewedCount, 1); });
test("uma a quatro novas revisões permanecem waiting", () => { const { investigation, source } = active(); for (let count = 1; count <= 4; count++) assert.equal(observed(investigation, [...source, ...Array.from({ length: count }, (_, index) => future(String(index + 4)))])?.status, "waiting"); });
test("exatamente cinco fecha a janela e a sexta não a altera", () => { const { investigation, source } = active(); const five = ["04", "05", "06", "07", "08"].map((id) => future(id, id === "04" ? ["size"] : [])); const closed = observed(investigation, [...source, ...five]); const sixth = observed(investigation, [...source, ...five, future("09", ["size"], "low")]); assert.equal(closed?.reviewedCount, 5); assert.equal(closed?.status, "not-repeated"); assert.deepEqual(sixth, closed); });
test("ordenação usa createdAt crescente e id como desempate", () => { const { investigation, source } = active(); const same = "2026-08-22T00:03:00Z"; const values = [future("z", [], undefined, { at: same }), future("a", [], undefined, { at: same }), future("m", [], undefined, { at: same }), future("b", [], undefined, { at: same }), future("c", [], undefined, { at: same }), future("d", [], undefined, { at: same })]; assert.deepEqual(observed(investigation, [...source, ...values.reverse()])?.observedSnapshotIds, ["a", "b", "c", "d", "m"]); });
test("fator normal em pelo menos 2/5 com low ou unclear reaparece", () => { const { investigation, source } = active(); const result = observed(investigation, [...source, future("04", ["size"], "medium"), future("05", ["size"], "low"), future("06"), future("07"), future("08")]); assert.equal(result?.status, "observed-again"); assert.equal(result?.lowOrUnclearCount, 1); });
test("fator normal repetido sem low/unclear tem estado próprio", () => { const { investigation, source } = active(); const result = observed(investigation, [...source, future("04", ["size"], "medium"), future("05", ["size"], "high"), future("06"), future("07"), future("08")]); assert.equal(result?.status, "factor-without-low-support"); assert.equal(result?.lowOrUnclearCount, 0); });
test("uma ocorrência é descritiva e zero é não observado", () => { const { investigation, source } = active(); const tail = [future("05"), future("06"), future("07"), future("08")]; assert.equal(observed(investigation, [...source, future("04", ["size"], "low"), ...tail])?.status, "not-repeated"); assert.equal(observed(investigation, [...source, future("04"), ...tail])?.status, "not-observed"); });
test("automatic reaparece em 2/5 sem usar sustentação", () => { const { investigation, source } = active("automatic"); const result = observed(investigation, [...source, future("04", ["automatic"]), future("05", ["automatic"]), future("06"), future("07"), future("08")]); assert.equal(result?.status, "observed-again"); assert.equal(result?.lowOrUnclearCount, undefined); assert.doesNotMatch(result?.text ?? "", /sustenta/i); });
test("automatic tem resultados descritivos para uma e zero ocorrência", () => { const { investigation, source } = active("automatic"); const tail = [future("05"), future("06"), future("07"), future("08")]; assert.equal(observed(investigation, [...source, future("04", ["automatic"]), ...tail])?.status, "not-repeated"); assert.equal(observed(investigation, [...source, future("04"), ...tail])?.status, "not-observed"); });
test("snapshot legado futuro válido participa", () => { const { investigation, source } = active(); assert.equal(observed(investigation, [...source, future("04", ["size"], "low", { legacy: true })])?.factorCount, 1); });
test("baseline ausente ou alterada fica inconclusiva e não é substituída", () => { const { investigation, source } = active(); assert.equal(observed(investigation, source.slice(1))?.status, "inconclusive"); assert.equal(observed(investigation, [...source.slice(1), snap("replacement", ["size"], "low")])?.status, "inconclusive"); });

test("storage é defensivo, limita a uma investigação e encerramento remove só sua chave", () => {
  const memory = new Map<string, string>(); Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage: { getItem: (key: string) => memory.get(key) ?? null, setItem: (key: string, value: string) => memory.set(key, value), removeItem: (key: string) => memory.delete(key) } } });
  const { investigation } = active(); memory.set(REAL_HAND_INVESTIGATION_KEY, "{"); assert.equal(readActiveRealHandInvestigation(), null); memory.set(REAL_HAND_INVESTIGATION_KEY, JSON.stringify({ ...investigation, version: 2 })); assert.equal(readActiveRealHandInvestigation(), null);
  writeActiveRealHandInvestigation(investigation); assert.deepEqual(readActiveRealHandInvestigation(), investigation); assert.throws(() => writeActiveRealHandInvestigation(investigation)); memory.set("poker-loop-v1:reasoning-snapshots", "snapshots"); memory.set("poker-loop-v1:real-hands", "hands"); clearActiveRealHandInvestigation(); assert.equal(memory.has(REAL_HAND_INVESTIGATION_KEY), false); assert.equal(memory.get("poker-loop-v1:reasoning-snapshots"), "snapshots"); assert.equal(memory.get("poker-loop-v1:real-hands"), "hands"); delete (globalThis as { window?: unknown }).window;
});
test("reset pedagógico preserva investigação", () => { const source = readFileSync("lib/storage.ts", "utf8"); assert.doesNotMatch(source, /real-hand-investigation|REAL_HAND_INVESTIGATION_KEY/); clearPrototypeProgress(); });
test("módulo não depende do motor pedagógico nem associa fator a Skill", () => { const source = readFileSync("lib/prospectiveRealHandInvestigation.ts", "utf8"); assert.doesNotMatch(source, /trainingEngine|diagnostics|learningLoop|scheduler|activeTrainingSession|\bAttempt\b|SkillState|\bSkill\b|board-reading|range-reading|sizing/); });
test("copy evita conclusões proibidas", () => { const source = `${readFileSync("lib/prospectiveRealHandInvestigation.ts", "utf8")}\n${readFileSync("app/hands/page.tsx", "utf8")}`.toLowerCase(); for (const phrase of ["hipótese confirmada", "hipótese refutada", "leak", "você melhorou", "você piorou"]) assert.equal(source.includes(phrase), false); });
test("validação rejeita versão e baseline inconsistentes", () => { const { investigation } = active(); assert.equal(isActiveRealHandInvestigation(investigation), true); assert.equal(isActiveRealHandInvestigation({ ...investigation, version: 2 }), false); assert.equal(isActiveRealHandInvestigation({ ...investigation, baselineReviewCount: 99 }), false); });

test("janela fechada preserva A–E quando F surge e A desaparece", () => {
  const { investigation, source } = active(); const five = ["04", "05", "06", "07", "08"].map((id) => future(id));
  const closed = syncProspectiveInvestigation(investigation, [...source, ...five]); const withF = syncProspectiveInvestigation(closed, [...source, ...five, future("09", ["size"], "low")]);
  assert.strictEqual(withF, closed); assert.deepEqual(withF.prospectiveReviews.map(({ snapshotId }) => snapshotId), ["04", "05", "06", "07", "08"]);
  const withoutA = [...source, ...five.slice(1), future("09", ["size"], "low")]; const afterDeletion = syncProspectiveInvestigation(closed, withoutA);
  assert.strictEqual(afterDeletion, closed); assert.deepEqual(afterDeletion.prospectiveReviews.map(({ snapshotId }) => snapshotId), ["04", "05", "06", "07", "08"]);
  const result = deriveProspectiveInvestigation(afterDeletion, withoutA); assert.equal(result?.reviewedCount, 5); assert.deepEqual(result?.observedHandReviewIds, ["hand-04", "hand-05", "hand-06", "hand-07", "hand-08"]);
});

test("edições posteriores não reescrevem fator nem sustentação congelados", () => {
  const { investigation, source } = active(); const original = [future("04", ["size"], "low"), future("05", ["size"], "medium"), future("06"), future("07"), future("08")];
  const closed = syncProspectiveInvestigation(investigation, [...source, ...original]); const before = deriveProspectiveInvestigation(closed, [...source, ...original]);
  const editedA = future("04", [], "high"); const current = [...source, editedA, ...original.slice(1)]; const after = deriveProspectiveInvestigation(syncProspectiveInvestigation(closed, current), current);
  assert.equal(before?.factorCount, 2); assert.equal(before?.lowOrUnclearCount, 1); assert.equal(after?.factorCount, 2); assert.equal(after?.lowOrUnclearCount, 1); assert.deepEqual(after, before);
});

test("sync parcial acrescenta elegíveis em ordem sem baseline ou handReviewId duplicado", () => {
  const { investigation, source } = active(); const first = syncProspectiveInvestigation(investigation, [...source, future("06"), future("04", ["size"], "low")]);
  assert.deepEqual(first.prospectiveReviews.map(({ snapshotId }) => snapshotId), ["04", "06"]);
  const second = syncProspectiveInvestigation(first, [...source, future("05"), future("duplicate", ["size"], "low", { hand: "hand-04", at: "2026-08-22T00:03:00Z" }), ...source]);
  assert.deepEqual(second.prospectiveReviews.map(({ snapshotId }) => snapshotId), ["04", "06", "05"]); assert.equal(second.prospectiveReviews.filter(({ handReviewId }) => handReviewId === "hand-04").length, 1);
  assert.equal(second.prospectiveReviews.some(({ handReviewId }) => investigation.baselineHandReviewIds.includes(handReviewId)), false);
});

test("sync fechado é idempotente diante de dezenas de snapshots", () => {
  const { investigation, source } = active(); const five = ["04", "05", "06", "07", "08"].map((id) => future(id)); const closed = syncProspectiveInvestigation(investigation, [...source, ...five]);
  const many = Array.from({ length: 40 }, (_, index) => future(String(index + 10), ["size"], "low", { at: `2026-08-23T00:${String(index).padStart(2, "0")}:00Z` }));
  assert.strictEqual(syncProspectiveInvestigation(closed, [...source, ...five, ...many]), closed);
});

test("round-trip do storage preserva exatamente a janela congelada", () => {
  const memory = new Map<string, string>(); Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage: { getItem: (key: string) => memory.get(key) ?? null, setItem: (key: string, value: string) => memory.set(key, value), removeItem: (key: string) => memory.delete(key) } } });
  const { investigation, source } = active(); const closed = syncProspectiveInvestigation(investigation, [...source, ...["04", "05", "06", "07", "08"].map((id) => future(id, ["size"], id === "04" ? "low" : "high"))]);
  writeActiveRealHandInvestigation(closed); assert.deepEqual(readActiveRealHandInvestigation(), closed); delete (globalThis as { window?: unknown }).window;
});

test("mão excluída deixa de abrir detalhe sem mudar a observação", () => {
  const { investigation, source } = active(); const five = ["04", "05", "06", "07", "08"].map((id) => future(id)); const closed = syncProspectiveInvestigation(investigation, [...source, ...five]);
  const result = deriveProspectiveInvestigation(closed, [...source, ...five.slice(1)]); const existingHandIds = new Set(["hand-05", "hand-06", "hand-07", "hand-08"]);
  assert.equal(result?.reviewedCount, 5); assert.deepEqual(result?.observedHandReviewIds.filter((id) => existingHandIds.has(id)), ["hand-05", "hand-06", "hand-07", "hand-08"]); assert.ok(result?.observedHandReviewIds.includes("hand-04"));
});
