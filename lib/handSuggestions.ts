import type { HandReviewSuggestion, HandReviewSuggestionReason, ParsedGgHand } from "./types";

const details: Record<HandReviewSuggestionReason, [string, string]> = {
  "high-commitment": ["ALTA EXPOSIÇÃO", "Esta foi uma das situações em que uma parcela maior do seu stack entrou no pot."],
  "river-decision": ["DECISÃO NO RIVER", "Sua linha chegou até uma decisão no river."],
  "hero-showdown": ["SHOWDOWN", "Esta mão chegou ao showdown com as cartas do Herói reveladas."],
  "multi-street-pressure": ["PRESSÃO EM VÁRIAS STREETS", "Você precisou responder a ações agressivas em mais de uma street."],
  "long-line": ["LINHA EM VÁRIAS STREETS", "Suas decisões evoluíram ao longo de várias streets nesta mão."],
};
const postflopCount = (hand: ParsedGgHand) => hand.heroDecisionStreets.filter((street) => street !== "preflop").length;
function structuralCompare(a: ParsedGgHand, b: ParsedGgHand) {
  return b.heroDecisionStreets.length - a.heroDecisionStreets.length || b.heroDecisionCount - a.heroDecisionCount ||
    b.heroFacedAggressionStreets.length - a.heroFacedAggressionStreets.length || a.playedAt.localeCompare(b.playedAt) || a.sourceHandId.localeCompare(b.sourceHandId);
}
export function selectHandReviewSuggestions(hands: ParsedGgHand[], options: { createdAt?: string } = {}): HandReviewSuggestion[] {
  const selected = new Set<string>(); const output: HandReviewSuggestion[] = []; const createdAt = options.createdAt ?? new Date().toISOString();
  const categories: Array<[HandReviewSuggestionReason, (hand: ParsedGgHand) => boolean, (a: ParsedGgHand, b: ParsedGgHand) => number]> = [
    ["high-commitment", (h) => h.heroDecisionCount > 0 && (h.heroAllIn || (h.heroCommitmentRatio ?? 0) >= 0.25), (a, b) => (b.heroCommitmentRatio ?? -1) - (a.heroCommitmentRatio ?? -1) || structuralCompare(a, b)],
    ["river-decision", (h) => h.heroDecisionStreets.includes("river"), (a, b) => postflopCount(b) - postflopCount(a) || b.heroFacedAggressionStreets.length - a.heroFacedAggressionStreets.length || b.heroDecisionCount - a.heroDecisionCount || structuralCompare(a, b)],
    ["hero-showdown", (h) => h.heroShows, structuralCompare],
    ["multi-street-pressure", (h) => h.heroFacedAggressionStreets.length >= 2, structuralCompare],
    ["long-line", (h) => ["flop", "turn", "river"].every((street) => h.heroDecisionStreets.includes(street as never)), structuralCompare],
  ];
  for (const [reason, eligible, compare] of categories) {
    const hand = hands.filter((h) => !selected.has(h.sourceHandId) && eligible(h)).sort(compare)[0]; if (!hand) continue;
    selected.add(hand.sourceHandId); const [reasonLabel, reasonMessage] = details[reason];
    output.push({ id: `${reason}:${hand.sourceHandId}`, source: "gg-pokercraft", sourceHandId: hand.sourceHandId, reason, createdAt, heroCards: hand.heroCards, playedAt: hand.playedAt, reasonLabel, reasonMessage, rawHandText: hand.rawHandText });
  }
  return output.slice(0, 5);
}
