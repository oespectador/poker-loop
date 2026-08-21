import type { DecisionStreet, ParsedActionType, ParsedGgHand } from "./types";

export interface GgParseResult { totalBlocks: number; recognizedHands: number; ignoredHands: number; hands: ParsedGgHand[] }
const money = String.raw`\$([\d,.]+)`;
const number = (value: string) => Number(value.replace(/,/g, ""));
const unique = <T>(values: T[]) => [...new Set(values)];

export function parseGgPokerCraftFile(text: string): GgParseResult {
  const starts = [...text.matchAll(/^Poker Hand #/gm)].map(({ index }) => index!);
  const blocks = starts.map((start, index) => text.slice(start, starts[index + 1] ?? text.length).trim()).filter(Boolean);
  const hands = blocks.flatMap((block) => { const hand = parseGgHand(block); return hand ? [hand] : []; });
  return { totalBlocks: blocks.length, recognizedHands: hands.length, ignoredHands: blocks.length - hands.length, hands };
}

export function parseGgHand(rawHandText: string): ParsedGgHand | null {
  const lines = rawHandText.replace(/\r\n?/g, "\n").split("\n");
  const header = lines[0]?.match(/^Poker Hand #([^:]+): Hold'em No Limit \(\$([\d,.]+)\/\$([\d,.]+)\) - (\d{4})\/(\d{2})\/(\d{2}) (\d{2}:\d{2}:\d{2})/);
  const dealt = rawHandText.match(/^Dealt to Hero \[([^ ]+) ([^\]]+)\]/m);
  if (!header || !dealt) return null;
  const table = rawHandText.match(/^Table '([^']+)'(?: (\d+)-max)? Seat #(\d+) is the button/m);
  const heroSeat = rawHandText.match(new RegExp(`^Seat (\\d+): Hero \\(${money} in chips\\)`, "m"));
  let street: DecisionStreet = "preflop";
  const actions: ParsedGgHand["actions"] = [];
  const decisionStreets: DecisionStreet[] = [];
  const aggressionStreets: DecisionStreet[] = [];
  const streetContribution: Record<DecisionStreet, number> = { preflop: 0, flop: 0, turn: 0, river: 0 };
  let contribution = 0;
  let pendingAggression = false;
  let heroAllIn = false;
  let heroShows = false;
  let flop: [string, string, string] | undefined; let turn: string | undefined; let river: string | undefined;
  for (const line of lines) {
    const flopMatch = line.match(/^\*\*\* FLOP \*\*\* \[([^ ]+) ([^ ]+) ([^\]]+)\]/); if (flopMatch) { street = "flop"; pendingAggression = false; flop = [flopMatch[1], flopMatch[2], flopMatch[3]]; continue; }
    const turnMatch = line.match(/^\*\*\* TURN \*\*\* .* \[([^\]]+)\]$/); if (turnMatch) { street = "turn"; pendingAggression = false; turn = turnMatch[1]; continue; }
    const riverMatch = line.match(/^\*\*\* RIVER \*\*\* .* \[([^\]]+)\]$/); if (riverMatch) { street = "river"; pendingAggression = false; river = riverMatch[1]; continue; }
    if (/^Hero: shows \[/.test(line)) heroShows = true;
    const post = line.match(new RegExp(`^Hero: posts (?:small blind|big blind|the ante) ${money}`));
    if (post) { const increment = number(post[1]); streetContribution.preflop += increment; contribution += increment; continue; }
    const returned = line.match(new RegExp(`^Uncalled bet \\(${money}\\) returned to Hero`));
    if (returned) { contribution = Math.max(0, contribution - number(returned[1])); continue; }
    const match = line.match(new RegExp(`^([^:]+): (folds|checks|calls ${money}|bets ${money}|raises ${money} to ${money})( and is all-in)?$`));
    if (!match) continue;
    const actor = match[1]; const phrase = match[2];
    const type: ParsedActionType = phrase.startsWith("fold") ? "fold" : phrase.startsWith("check") ? "check" : phrase.startsWith("call") ? "call" : phrase.startsWith("bet") ? "bet" : "raise";
    const values = [...phrase.matchAll(/\$([\d,.]+)/g)].map((item) => number(item[1]));
    const action = { actor, street, type, amount: values[0], toAmount: type === "raise" ? values[1] : undefined, allIn: Boolean(match[match.length - 1]) };
    actions.push(action);
    if (actor === "Hero") {
      decisionStreets.push(street); if (pendingAggression) aggressionStreets.push(street);
      heroAllIn ||= action.allIn;
      if (type === "call" || type === "bet") { const increment = values[0] ?? 0; streetContribution[street] += increment; contribution += increment; }
      if (type === "raise") { const target = values[1] ?? 0; const increment = Math.max(0, target - streetContribution[street]); streetContribution[street] = target; contribution += increment; }
      if (type !== "check" && type !== "bet") pendingAggression = false;
    } else if (type === "bet" || type === "raise") pendingAggression = true;
  }
  const startingStack = heroSeat ? number(heroSeat[2]) : undefined;
  return {
    sourceHandId: header[1], playedAt: `${header[4]}-${header[5]}-${header[6]}T${header[7]}`, game: "holdem-no-limit",
    smallBlind: number(header[2]), bigBlind: number(header[3]), tableName: table?.[1], maxPlayers: table?.[2] ? Number(table[2]) : undefined,
    buttonSeat: table?.[3] ? Number(table[3]) : undefined, heroSeat: heroSeat ? Number(heroSeat[1]) : undefined, heroStartingStack: startingStack,
    heroCards: [dealt[1], dealt[2]], flop, turn, river, actions, heroDecisionStreets: unique(decisionStreets), heroDecisionCount: actions.filter(({ actor }) => actor === "Hero").length,
    heroFacedAggressionStreets: unique(aggressionStreets), heroAllIn, heroShows, heroContribution: startingStack === undefined ? undefined : contribution,
    heroCommitmentRatio: startingStack && contribution >= 0 ? contribution / startingStack : undefined, rawHandText: rawHandText.replace(/\r\n?/g, "\n").trim(),
  };
}
