import assert from "node:assert/strict";
import test from "node:test";
import { clearPrototypeProgress, readAttempts } from "../lib/storage";
import { createRealHand, deleteRealHand, isRealHandReview, readRealHands, REAL_HANDS_KEY, realHandSkillLabels, saveRealHand, sortRealHands, trainingLinkForHand, updateRealHand, validateRealHandInput } from "../lib/realHands";
import { summarizeDifficultyPatterns } from "../lib/diagnostics";
import { summarizeLearningLoop } from "../lib/learningLoop";
import type { RealHandReviewInput } from "../lib/types";

const base: RealHandReviewInput = { title: "River", rawHandText: "Hero bets <b>100</b>\nVillain calls", street: "river", doubt: "Size?", rangeRead: "O range tinha bluff-catchers.", objective: "Value", targetsAndSizeResponse: "Pares; talvez mudassem.", trainingFocus: "sizing" };
function installStorage(values = new Map<string, string>()) { Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage: { getItem: (key: string) => values.get(key) ?? null, removeItem: (key: string) => values.delete(key), setItem: (key: string, value: string) => values.set(key, value) } } }); return values; }
function cleanup() { delete (globalThis as { window?: unknown }).window; }

test("storage ausente retorna lista vazia", () => { installStorage(); assert.deepEqual(readRealHands(), []); cleanup(); });
test("JSON inválido retorna estado seguro", () => { installStorage(new Map([[REAL_HANDS_KEY, "{"]])); assert.deepEqual(readRealHands(), []); cleanup(); });
test("salvar persiste todos os campos e texto opaco", () => { const values = installStorage(); const hand = createRealHand(base, "one", "2026-08-20T00:00:00Z"); saveRealHand(hand); assert.deepEqual(JSON.parse(values.get(REAL_HANDS_KEY)!), [hand]); assert.equal(readRealHands()[0].rawHandText, base.rawHandText); cleanup(); });
test("rawHandText é obrigatório", () => { assert.ok(validateRealHandInput({ ...base, rawHandText: "  " })); assert.throws(() => createRealHand({ ...base, rawHandText: "" }, "x")); });
test("IDs gerados são únicos", () => { assert.notEqual(createRealHand(base).id, createRealHand(base).id); });
test("edição preserva id e createdAt e atualiza reflexão", () => { installStorage(); saveRealHand(createRealHand(base, "same", "2026-08-20T00:00:00Z")); const changed = updateRealHand("same", { ...base, doubt: "Nova dúvida" })!; assert.equal(changed.id, "same"); assert.equal(changed.createdAt, "2026-08-20T00:00:00Z"); assert.equal(changed.doubt, "Nova dúvida"); cleanup(); });
test("edição altera trainingFocus e Ainda não sei o remove", () => { installStorage(); saveRealHand(createRealHand(base, "one")); assert.equal(updateRealHand("one", { ...base, trainingFocus: "range-reading" })!.trainingFocus, "range-reading"); assert.equal(updateRealHand("one", { ...base, trainingFocus: undefined })!.trainingFocus, undefined); cleanup(); });
test("exclusão remove somente a mão escolhida e não toca Attempts", () => { const values = installStorage(new Map([["poker-loop-v1:attempts", "[1]"]])); saveRealHand(createRealHand(base, "one", "2026-08-20T00:00:00Z")); saveRealHand(createRealHand(base, "two", "2026-08-21T00:00:00Z")); deleteRealHand("one"); assert.deepEqual(readRealHands().map(({ id }) => id), ["two"]); assert.equal(values.get("poker-loop-v1:attempts"), "[1]"); cleanup(); });
test("reset pedagógico não apaga mãos reais", () => { const values = installStorage(new Map([[REAL_HANDS_KEY, "hands"], ["poker-loop-v1:attempts", "[]"], ["poker-loop-v1:active-session", "active"]])); clearPrototypeProgress(); assert.equal(values.get(REAL_HANDS_KEY), "hands"); cleanup(); });
test("ordena mais recente primeiro", () => { const older = createRealHand(base, "old", "2026-01-01T00:00:00Z"); const newer = createRealHand(base, "new", "2026-02-01T00:00:00Z"); assert.deepEqual(sortRealHands([older, newer]).map(({ id }) => id), ["new", "old"]); });
test("street inválida é rejeitada defensivamente", () => { assert.equal(isRealHandReview({ ...createRealHand(base, "x"), street: "later" }), false); });
test("trainingFocus inválido é rejeitado defensivamente", () => { assert.equal(isRealHandReview({ ...createRealHand(base, "x"), trainingFocus: "poker" }), false); });
test("label humana da Skill é exposta", () => { assert.equal(realHandSkillLabels["integrated-decision"], "Decisão integrada"); });
test("mão sem foco não produz CTA e mão com foco produz link atual", () => { assert.equal(trainingLinkForHand(createRealHand({ ...base, trainingFocus: undefined }, "a")), undefined); assert.equal(trainingLinkForHand(createRealHand(base, "b")), "/session?focus=sizing"); });
test("registro não cria Attempt, dificuldade ou loop longitudinal", () => { installStorage(); const beforeLoop = summarizeLearningLoop([]); saveRealHand(createRealHand(base, "one")); assert.deepEqual(readAttempts(), []); assert.deepEqual(summarizeDifficultyPatterns([]), []); assert.deepEqual(summarizeLearningLoop([]), beforeLoop); cleanup(); });
test("leitura ignora registros inválidos e conserva válidos", () => { const valid = createRealHand(base, "ok"); installStorage(new Map([[REAL_HANDS_KEY, JSON.stringify([valid, { rawHandText: "x" }, { ...valid, street: "invalid" }, { ...valid, id: "bad-focus", trainingFocus: "invalid" }])]])); assert.deepEqual(readRealHands(), [valid]); cleanup(); });
