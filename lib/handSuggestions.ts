import type { HandReviewSuggestion, HandReviewSuggestionReason, ParsedGgHand, RealHandReviewInput } from "./types";

const details: Record<HandReviewSuggestionReason, [string, string]> = {
  "high-commitment": ["ALTA EXPOSIÇÃO", "Esta foi uma das situações em que uma parcela maior do seu stack entrou no pot."],
  "river-decision": ["DECISÃO NO RIVER", "Sua linha chegou até uma decisão no river."],
  "hero-showdown": ["SHOWDOWN", "Esta mão chegou ao showdown com as cartas do Herói reveladas."],
  "multi-street-pressure": ["PRESSÃO EM VÁRIAS STREETS", "Você precisou responder a ações agressivas em mais de uma street."],
  "long-line": ["LINHA EM VÁRIAS STREETS", "Suas decisões evoluíram ao longo de várias streets nesta mão."],
};
const postflopCount = (hand: ParsedGgHand) => hand.heroDecisionStreets.filter((street) => street !== "preflop").length;
const cardLabel = (card: string) => card.replace("h", "♥").replace("d", "♦").replace("c", "♣").replace("s", "♠");
export const MAX_IMPORT_CANDIDATES = 50;

export interface HandDetailSelection { selectedId?: string; selectedSuggestionId?: string }

/** Returns an exclusive detail selection: a saved hand or a pending suggestion, never both. */
export function selectHandDetail(kind: "saved" | "suggestion", id: string): HandDetailSelection {
  return kind === "saved" ? { selectedId: id, selectedSuggestionId: undefined } : { selectedId: undefined, selectedSuggestionId: id };
}

/** Promotes only imported context; reflection and pedagogical fields remain deliberately unset. */
export function suggestionToRealHandInput(suggestion: HandReviewSuggestion): RealHandReviewInput {
  const [, year, month, day, hour, minute] = suggestion.playedAt.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/) ?? [];
  const playedAtLabel = year ? `${day}/${month} ${hour}:${minute}` : suggestion.playedAt;
  return {
    title: `${suggestion.heroCards.map(cardLabel).join(" ")} · ${playedAtLabel}`,
    rawHandText: suggestion.rawHandText,
    doubt: "",
    rangeRead: "",
    objective: "",
    targetsAndSizeResponse: "",
    street: undefined,
    trainingFocus: undefined,
  };
}
function structuralCompare(a: ParsedGgHand, b: ParsedGgHand) {
  return b.heroDecisionStreets.length - a.heroDecisionStreets.length || b.heroDecisionCount - a.heroDecisionCount ||
    b.heroFacedAggressionStreets.length - a.heroFacedAggressionStreets.length || a.playedAt.localeCompare(b.playedAt) || a.sourceHandId.localeCompare(b.sourceHandId);
}
export function selectHandReviewCandidatePool(hands: ParsedGgHand[], options: { createdAt?: string; limit?: number } = {}): HandReviewSuggestion[] {
  const selected = new Set<string>(); const output: HandReviewSuggestion[] = []; const createdAt = options.createdAt ?? new Date().toISOString();
  const categories: Array<[HandReviewSuggestionReason, (hand: ParsedGgHand) => boolean, (a: ParsedGgHand, b: ParsedGgHand) => number]> = [
    ["high-commitment", (h) => h.heroDecisionCount > 0 && (h.heroAllIn || (h.heroCommitmentRatio ?? 0) >= 0.25), (a, b) => (b.heroCommitmentRatio ?? -1) - (a.heroCommitmentRatio ?? -1) || structuralCompare(a, b)],
    ["river-decision", (h) => h.heroDecisionStreets.includes("river"), (a, b) => postflopCount(b) - postflopCount(a) || b.heroFacedAggressionStreets.length - a.heroFacedAggressionStreets.length || b.heroDecisionCount - a.heroDecisionCount || structuralCompare(a, b)],
    ["hero-showdown", (h) => h.heroShows, structuralCompare],
    ["multi-street-pressure", (h) => h.heroFacedAggressionStreets.length >= 2, structuralCompare],
    ["long-line", (h) => ["flop", "turn", "river"].every((street) => h.heroDecisionStreets.includes(street as never)), structuralCompare],
  ];
  const limit = Math.max(0, Math.min(options.limit ?? MAX_IMPORT_CANDIDATES, MAX_IMPORT_CANDIDATES));
  const ranked = categories.map(([reason, eligible, compare]) => [reason, hands.filter(eligible).sort(compare)] as const);
  while (output.length < limit) {
    let foundInRound = false;
    for (const [reason, candidates] of ranked) {
      const hand = candidates.find((candidate) => !selected.has(candidate.sourceHandId));
      if (!hand) continue;
      foundInRound = true; selected.add(hand.sourceHandId); const [reasonLabel, reasonMessage] = details[reason];
      output.push({ id: `${reason}:${hand.sourceHandId}`, source: "gg-pokercraft", sourceHandId: hand.sourceHandId, reason, createdAt, heroCards: hand.heroCards, playedAt: hand.playedAt, reasonLabel, reasonMessage, rawHandText: hand.rawHandText });
      if (output.length === limit) break;
    }
    if (!foundInRound) break;
  }
  return output;
}

export function selectHandReviewSuggestions(hands: ParsedGgHand[], options: { createdAt?: string } = {}): HandReviewSuggestion[] {
  return selectHandReviewCandidatePool(hands, { ...options, limit: 5 });
}
