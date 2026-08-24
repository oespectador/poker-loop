import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { parseGgHand } from "../lib/ggHandParser";
import { buildHandVisualModel, extractHeroDecisionAnchors } from "../lib/realHandReasoning";
import { buildReplayDecisionView, compareReplayAction, deriveRealHandReplayEligibility, deriveReplayActionOptions, replayActionFamily } from "../lib/realHandDecisionReplay";
import type { RealHandReasoningSnapshot } from "../lib/types";

const parse = (body: string, summary = "", table = "Table 'T' 6-max Seat #1 is the button") => parseGgHand(`Poker Hand #REPLAY: Hold'em No Limit ($0.01/$0.02) - 2026/08/20 23:19:07\n${table}\nSeat 5: Hero ($2.00 in chips)\n*** HOLE CARDS ***\nDealt to Hero [Ah Qc]\n${body}\n*** SUMMARY ***\n${summary}`)!;
const optionsFor = (line: string) => { const hand = parse(line); const anchor = extractHeroDecisionAnchors(hand).at(-1)!; return deriveReplayActionOptions(hand, anchor); };

test("check e bet oferecem check, bet em ordem determinística", () => {
  assert.deepEqual(optionsFor("Hero: checks"), ["check", "bet"]);
  assert.deepEqual(optionsFor("Hero: bets $0.50"), ["check", "bet"]);
});
test("fold, call e raise enfrentando agressão oferecem as três famílias", () => {
  assert.deepEqual(optionsFor("Villain: bets $0.20\nHero: folds"), ["fold", "call", "raise"]);
  assert.deepEqual(optionsFor("Villain: bets $0.20\nHero: calls $0.20"), ["fold", "call", "raise"]);
  assert.deepEqual(optionsFor("Villain: bets $0.20\nHero: raises $0.40 to $0.60"), ["fold", "call", "raise"]);
});
test("heads-up explícito remove raise após bet ou raise all-in", () => {
  const table = "Table 'T' 2-max Seat #1 is the button";
  for (const [line, historical] of [["Villain: bets $2.00 and is all-in\nHero: calls $2.00 and is all-in", "call"], ["Villain: raises $1.98 to $2.00 and is all-in\nHero: folds", "fold"]] as const) {
    const hand = parse(line, "", table); const anchor = extractHeroDecisionAnchors(hand)[0];
    assert.equal(hand.maxPlayers, 2); assert.equal(anchor.action, historical); assert.deepEqual(deriveReplayActionOptions(hand, anchor), ["fold", "call"]);
  }
});
test("all-in imediatamente anterior em mesa multiway não remove raise por inferência", () => {
  const hand = parse("VillainA: bets $2.00 and is all-in\nHero: calls $2.00 and is all-in"); const anchor = extractHeroDecisionAnchors(hand)[0];
  assert.equal(hand.maxPlayers, 6); assert.deepEqual(deriveReplayActionOptions(hand, anchor), ["fold", "call", "raise"]);
});
test("maxPlayers desconhecido mantém raise como possibilidade conservadora", () => {
  const hand = parse("Villain: bets $2.00 and is all-in\nHero: calls $2.00 and is all-in", "", "Table 'T' Seat #1 is the button"); const anchor = extractHeroDecisionAnchors(hand)[0];
  assert.equal(hand.maxPlayers, undefined); assert.deepEqual(deriveReplayActionOptions(hand, anchor), ["fold", "call", "raise"]);
});
test("all-in do Herói e sizing não criam família nova", () => {
  assert.equal(replayActionFamily({ action: "bet", amount: .75, allIn: true } as never), "bet");
  assert.equal(replayActionFamily({ action: "raise", toAmount: 2, allIn: true } as never), "raise");
  assert.equal(compareReplayAction({ action: "bet", amount: .5 } as never, "bet"), "same-action-family");
  assert.equal(compareReplayAction({ action: "bet", amount: 1.25, allIn: true } as never, "bet"), "same-action-family");
});
test("comparação informa apenas mesma família ou família diferente", () => {
  assert.equal(compareReplayAction({ action: "call" }, "call"), "same-action-family");
  assert.equal(compareReplayAction({ action: "call" }, "fold"), "different-action-family");
  assert.equal(compareReplayAction({ action: "bet" }, "check"), "different-action-family");
});
test("opções são únicas e sempre incluem a família histórica", () => {
  for (const line of ["Hero: checks", "Hero: bets $0.20", "Villain: bets $0.20\nHero: folds", "Villain: bets $0.20\nHero: calls $0.20", "Villain: bets $0.20\nHero: raises $0.20 to $0.40"]) {
    const hand = parse(line); const anchor = extractHeroDecisionAnchors(hand).at(-1)!; const options = deriveReplayActionOptions(hand, anchor);
    assert.equal(new Set(options).size, options.length); assert.ok(options.includes(anchor.action));
  }
});

const futureHand = () => parse("Hero: calls $0.02\n*** FLOP *** [2c 3d 5s]\nVillain: checks\nHero: bets $0.08\nVillain: calls $0.08\n*** TURN *** [2c 3d 5s] [Kd]\nVillain: bets $0.20\nHero: calls $0.20\n*** RIVER *** [2c 3d 5s Kd] [Qc]\nVillain: checks\nHero: bets $0.40\nVillain: calls $0.40\nHero collected $2.00 from pot", "Hero showed [Ah Qc] and won ($2.00)");
test("replay no flop corta ação original, ações posteriores, turn, river e showdown", () => {
  const hand = futureHand(); const anchor = extractHeroDecisionAnchors(hand)[1]; const view = buildReplayDecisionView(hand, anchor)!;
  assert.deepEqual(view.board, { flop: ["2c", "3d", "5s"] });
  assert.equal(view.actionsThroughDecision.at(-1)?.actor, "Villain");
  assert.equal(view.actionsThroughDecision.some(({ street }) => street === "turn" || street === "river"), false);
  const visual = buildHandVisualModel(hand, anchor, true)!;
  assert.deepEqual(visual.map(({ street }) => street), ["preflop", "flop"]);
  assert.equal(visual.flatMap(({ actions }) => actions).some(({ selected }) => selected), false);
});
test("replay no turn não contém river nem resultado", () => {
  const hand = futureHand(); const anchor = extractHeroDecisionAnchors(hand)[2]; const view = buildReplayDecisionView(hand, anchor)!;
  assert.equal(view.board.river, undefined); assert.equal(view.actionsThroughDecision.some(({ street }) => street === "river"), false);
  assert.equal(JSON.stringify(view).includes("collected"), false);
});
test("resultado financeiro não altera elegibilidade, opções ou comparação", () => {
  const a = parse("Villain: bets $0.20\nHero: calls $0.20", "Hero collected $1.00");
  const b = parse("Villain: bets $0.20\nHero: calls $0.20", "Villain collected $100.00");
  const snapshotFor = (hand: typeof a): RealHandReasoningSnapshot => { const anchor = extractHeroDecisionAnchors(hand)[0]; return { id: "s", handReviewId: "h", createdAt: "2026-08-21T00:00:00Z", sourceHandId: hand.sourceHandId, sourceDecision: { street: anchor.street, sequenceIndex: anchor.sequenceIndex, action: anchor.action, amount: anchor.amount, toAmount: anchor.toAmount, allIn: anchor.allIn }, factors: [] }; };
  assert.deepEqual(deriveRealHandReplayEligibility(a, snapshotFor(a))?.options, deriveRealHandReplayEligibility(b, snapshotFor(b))?.options);
  assert.equal(compareReplayAction(extractHeroDecisionAnchors(a)[0], "call"), compareReplayAction(extractHeroDecisionAnchors(b)[0], "call"));
});
test("sem snapshot, legado ou anchor incompatível não há replay nem fallback", () => {
  const hand = parse("Hero: checks\nHero: bets $0.20"); const anchor = extractHeroDecisionAnchors(hand)[0];
  const exact: RealHandReasoningSnapshot = { id: "s", handReviewId: "h", createdAt: "2026-08-21T00:00:00Z", sourceHandId: hand.sourceHandId, sourceDecision: { street: anchor.street, sequenceIndex: anchor.sequenceIndex, action: anchor.action, amount: anchor.amount, toAmount: anchor.toAmount, allIn: anchor.allIn }, factors: [] };
  assert.ok(deriveRealHandReplayEligibility(hand, exact)); assert.equal(deriveRealHandReplayEligibility(hand, undefined), null);
  assert.equal(deriveRealHandReplayEligibility(hand, { ...exact, sourceHandId: undefined } as never), null);
  assert.equal(deriveRealHandReplayEligibility(hand, { ...exact, sourceDecision: { ...exact.sourceDecision, sequenceIndex: 99 } }), null);
});
test("UI é condicional, acessível e isolada de storage e domínios pedagógicos", () => {
  const source = readFileSync("app/hands/RealHandDecisionReplay.tsx", "utf8"); const page = readFileSync("app/hands/page.tsx", "utf8");
  assert.match(page, /reasoningSnapshots\.find/); assert.match(source, /aria-expanded=\{open\}/); assert.doesNotMatch(source, /aria-controls/);
  assert.match(source, /\{open && <div className="decision-replay-surface">/); assert.match(source, /!choice \?/);
  assert.match(source, /SUA ESCOLHA AGORA/); assert.match(source, /NA MESA/); assert.match(source, /Rejogar novamente/);
  assert.doesNotMatch(source, /localStorage|saveAttempt|registerAttempt|trainingEngine|learningLoop|SkillState|saveReasoningSnapshot|ReasoningFactor|SelfRatedSupport/);
  assert.doesNotMatch(source.toLowerCase(), /correto|incorreto|acertou|errou|melhorou|piorou|corrigiu|deveria/);
});
