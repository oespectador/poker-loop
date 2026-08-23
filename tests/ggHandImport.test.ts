import assert from "node:assert/strict";
import test from "node:test";
import { parseGgHand, parseGgPokerCraftFile } from "../lib/ggHandParser";
import { selectHandDetail, selectHandReviewSuggestions, suggestionToRealHandInput } from "../lib/handSuggestions";
import { clearHandSuggestions, GG_IMPORTS_KEY, HAND_SUGGESTIONS_KEY, hasProcessedImport, readHandSuggestions, recordProcessedImport, removeHandSuggestion, writeHandSuggestions } from "../lib/handSuggestionStorage";
import { clearPrototypeProgress } from "../lib/storage";

const hand = (id: string, body: string, result = "Hero collected $4 from pot") => `Poker Hand #${id}: Hold'em No Limit ($0.01/$0.02) - 2026/08/20 23:19:07\r\nTable 'RushAndCash14031056' 6-max Seat #1 is the button\r\nSeat 1: Villain ($2.00 in chips)\r\nSeat 5: Hero ($2.00 in chips)\r\n*** HOLE CARDS ***\r\nDealt to Hero [Ah 4h]\r\n${body}\r\n*** SHOWDOWN ***\r\n${result}\r\n*** SUMMARY ***`;
const riverLine = `Villain: bets $0.04\nHero: calls $0.04\n*** FLOP *** [2c 3d 5s]\nVillain: bets $0.08\nOther: calls $0.08\nHero: calls $0.08\n*** TURN *** [2c 3d 5s] [Kd]\nHero: checks\n*** RIVER *** [2c 3d 5s Kd] [Qc]\nVillain: bets $0.20\nHero: calls $0.20`;

function installStorage(values = new Map<string, string>()) { Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage: { getItem: (key: string) => values.get(key) ?? null, removeItem: (key: string) => values.delete(key), setItem: (key: string, value: string) => values.set(key, value) } } }); return values; }
function cleanup() { delete (globalThis as { window?: unknown }).window; }

test("arquivo usa próximo cabeçalho como fronteira, aceita CRLF e ignora bloco inválido", () => {
  const result = parseGgPokerCraftFile(`${hand("A", "Hero: folds")}\nPoker Hand #broken: unknown`);
  assert.equal(result.totalBlocks, 2); assert.equal(result.recognizedHands, 1); assert.equal(result.ignoredHands, 1);
});
test("SHOWDOWN section não implica cartas do Herói reveladas", () => { assert.equal(parseGgHand(hand("A", "Hero: folds"))!.heroShows, false); });
test("apenas Hero: shows define heroShows e não vira decisão", () => { const parsed = parseGgHand(hand("A", "Hero: checks\nHero: shows [Ah 4h]"))!; assert.equal(parsed.heroShows, true); assert.equal(parsed.heroDecisionCount, 1); });
test("cashout, posts e collected não contam como decisões ou streets", () => { const parsed = parseGgHand(hand("A", "Hero: posts small blind $0.01\nHero: Chooses to EV Cashout\nHero: Pays Cashout Risk ($0.3)"))!; assert.equal(parsed.heroDecisionCount, 0); assert.deepEqual(parsed.heroDecisionStreets, []); });
test("river existente sem ação do Herói não cria decisão no river", () => { const parsed = parseGgHand(hand("A", "Hero: checks\n*** FLOP *** [2c 3d 5s]\nHero: folds\n*** TURN *** [2c 3d 5s] [Kd]\n*** RIVER *** [2c 3d 5s Kd] [Qc]"))!; assert.equal(parsed.heroDecisionStreets.includes("river"), false); });
test("agressão continua relevante através do call de outro jogador", () => { const parsed = parseGgHand(hand("A", riverLine))!; assert.deepEqual(parsed.heroFacedAggressionStreets, ["preflop", "flop", "river"]); });
test("raise adversário depois da bet do Herói conta como agressão enfrentada", () => { const parsed = parseGgHand(hand("A", "Hero: bets $0.04\nVillain: raises $0.10 to $0.20\nHero: calls $0.16"))!; assert.deepEqual(parsed.heroFacedAggressionStreets, ["preflop"]); });
test("accounting de raise usa diferença por street e retorno reduz contribuição", () => { const parsed = parseGgHand(hand("A", "Hero: posts big blind $0.02\nHero: raises $0.02 to $0.20\n*** FLOP *** [2c 3d 5s]\nHero: bets $0.10\nUncalled bet ($0.04) returned to Hero"))!; assert.ok(Math.abs(parsed.heroContribution! - 0.26) < 1e-9); assert.ok(Math.abs(parsed.heroCommitmentRatio! - 0.13) < 1e-9); });
test("all-in é reconhecido sem tratar raise comum como all-in", () => { assert.equal(parseGgHand(hand("A", "Hero: raises $0.02 to $0.20"))!.heroAllIn, false); assert.equal(parseGgHand(hand("B", "Hero: calls $1.20 and is all-in"))!.heroAllIn, true); });
test("triagem respeita ordem, unicidade, elegibilidade e teto de cinco", () => { const parsed = [parseGgHand(hand("all", "Hero: bets $2.00 and is all-in"))!, parseGgHand(hand("river", riverLine))!, parseGgHand(hand("show", "Hero: checks\nHero: shows [Ah 4h]"))!, parseGgHand(hand("pressure", riverLine.replace("*** RIVER *** [2c 3d 5s Kd] [Qc]\nVillain: bets $0.20\nHero: calls $0.20", "")))!, parseGgHand(hand("long", "Hero: checks\n*** FLOP *** [2c 3d 5s]\nHero: checks\n*** TURN *** [2c 3d 5s] [Kd]\nHero: checks\n*** RIVER *** [2c 3d 5s Kd] [Qc]\nHero: checks"))!]; const suggestions = selectHandReviewSuggestions(parsed, { createdAt: "2026-08-21T00:00:00Z" }); assert.deepEqual(suggestions.map(({ reason }) => reason), ["high-commitment", "river-decision", "hero-showdown", "multi-street-pressure", "long-line"]); assert.equal(new Set(suggestions.map(({ sourceHandId }) => sourceHandId)).size, 5); });
test("resultado financeiro e sua inversão não mudam a seleção", () => { const won = parseGgHand(hand("A", riverLine, "Hero collected $9 from pot"))!; const lost = parseGgHand(hand("B", riverLine, "Villain collected $9 from pot"))!; const first = selectHandReviewSuggestions([won, lost], { createdAt: "2026-08-21T00:00:00Z" }).map((x) => [x.reason, x.sourceHandId]); const inverted = selectHandReviewSuggestions([parseGgHand(hand("A", riverLine, "Villain collected $9 from pot"))!, parseGgHand(hand("B", riverLine, "Hero collected $9 from pot"))!], { createdAt: "2026-08-21T00:00:00Z" }).map((x) => [x.reason, x.sourceHandId]); assert.deepEqual(inverted, first); });
test("storage defensivo usa o teto explícito de quinze, remove isoladamente e não entra no reset pedagógico", () => { const values = installStorage(); const parsed = parseGgHand(hand("A", riverLine))!; const item = selectHandReviewSuggestions([parsed], { createdAt: "2026-08-21T00:00:00Z" })[0]; writeHandSuggestions(Array.from({ length: 20 }, (_, index) => ({ ...item, id: `${item.id}:${index}`, sourceHandId: `${item.sourceHandId}:${index}` }))); assert.equal(readHandSuggestions().length, 15); removeHandSuggestion(`${item.id}:0`); assert.equal(readHandSuggestions().length, 14); writeHandSuggestions([item]); clearPrototypeProgress(); assert.equal(values.has(HAND_SUGGESTIONS_KEY), true); cleanup(); });
test("storage ignora JSON e registros inválidos e fingerprint não guarda conteúdo", () => { const hash = "a".repeat(64); const values = installStorage(new Map([[HAND_SUGGESTIONS_KEY, "{"], [GG_IMPORTS_KEY, JSON.stringify(["bad"])]])); assert.deepEqual(readHandSuggestions(), []); assert.equal(hasProcessedImport(hash), false); recordProcessedImport(hash); assert.equal(hasProcessedImport(hash), true); assert.equal(values.get(GG_IMPORTS_KEY), JSON.stringify([hash])); cleanup(); });
test("seleção de detalhe é exclusiva nos dois sentidos", () => {
  assert.deepEqual(selectHandDetail("suggestion", "suggestion-a"), { selectedId: undefined, selectedSuggestionId: "suggestion-a" });
  assert.deepEqual(selectHandDetail("saved", "hand-a"), { selectedId: "hand-a", selectedSuggestionId: undefined });
});
test("promoção preserva a mão e não infere reflexão, street ou Skill", () => {
  const parsed = parseGgHand(hand("A", riverLine))!;
  const suggestion = selectHandReviewSuggestions([parsed], { createdAt: "2026-08-21T00:00:00Z" })[0];
  const input = suggestionToRealHandInput(suggestion);
  assert.deepEqual(input, {
    title: "A♥ 4♥ · 20/08 23:19",
    rawHandText: suggestion.rawHandText,
    doubt: "", rangeRead: "", objective: "", targetsAndSizeResponse: "",
    street: undefined, trainingFocus: undefined,
  });
});
