import { MAX_PENDING_HAND_SUGGESTIONS } from "./handSuggestionStorage";
import { parseGgHand } from "./ggHandParser";
import { hasHeroRiverAction, hasHeroShowdown, hasLongLine, hasMultiStreetPressure, hasRiverDecision, hasRiverFacingAggression, heroBetThenFacedRiverRaise, heroFacedRiverBet, heroFacedRiverRaise, isHighCommitmentHand } from "./ggHandStructuralPredicates";
import { markImportCandidatesSurfaced, type ActiveGgImportBatch } from "./activeGgImportBatch";
import type { HandReviewSuggestion, ParsedGgHand } from "./types";

export const GG_SITUATION_FILTERS = ["river-decision", "river-facing-aggression", "hero-showdown", "high-commitment", "multi-street-pressure", "long-line"] as const;
export const GG_RIVER_ACTION_FILTERS = ["hero-river-bet", "hero-river-check", "hero-river-call", "hero-river-raise", "hero-river-fold", "river-facing-bet", "river-facing-raise", "river-bet-faced-raise"] as const;
export const GG_EXPLORATION_FILTERS = [...GG_SITUATION_FILTERS, ...GG_RIVER_ACTION_FILTERS] as const;
export type GgExplorationFilter = (typeof GG_EXPLORATION_FILTERS)[number];

export const ggExplorationFilterLabels: Record<GgExplorationFilter, string> = {
  "river-decision": "Decisão no river",
  "river-facing-aggression": "Agressão enfrentada no river",
  "hero-showdown": "Showdown com cartas reveladas",
  "high-commitment": "Alta exposição",
  "multi-street-pressure": "Pressão em várias streets",
  "long-line": "Linha longa",
  "hero-river-bet": "Hero apostou",
  "hero-river-check": "Hero deu check",
  "hero-river-call": "Hero deu call",
  "hero-river-raise": "Hero deu raise",
  "hero-river-fold": "Hero foldou",
  "river-facing-bet": "Hero enfrentou bet",
  "river-facing-raise": "Hero enfrentou raise",
  "river-bet-faced-raise": "Apostou e enfrentou raise",
};

const predicates: Record<GgExplorationFilter, (hand: ParsedGgHand) => boolean> = {
  "river-decision": hasRiverDecision,
  "river-facing-aggression": hasRiverFacingAggression,
  "hero-showdown": hasHeroShowdown,
  "high-commitment": isHighCommitmentHand,
  "multi-street-pressure": hasMultiStreetPressure,
  "long-line": hasLongLine,
  "hero-river-bet": (hand) => hasHeroRiverAction(hand, "bet"),
  "hero-river-check": (hand) => hasHeroRiverAction(hand, "check"),
  "hero-river-call": (hand) => hasHeroRiverAction(hand, "call"),
  "hero-river-raise": (hand) => hasHeroRiverAction(hand, "raise"),
  "hero-river-fold": (hand) => hasHeroRiverAction(hand, "fold"),
  "river-facing-bet": heroFacedRiverBet,
  "river-facing-raise": heroFacedRiverRaise,
  "river-bet-faced-raise": heroBetThenFacedRiverRaise,
};

/** Derives independent, non-strategic tags from the candidate's preserved hand history. */
export function deriveCandidateStructuralTags(candidate: HandReviewSuggestion): GgExplorationFilter[] {
  const hand = parseGgHand(candidate.rawHandText);
  if (!hand) return [];
  return GG_EXPLORATION_FILTERS.filter((filter) => predicates[filter](hand));
}

export function countRemainingCandidatesByFilter(batch: ActiveGgImportBatch): Record<GgExplorationFilter, number> {
  const counts = Object.fromEntries(GG_EXPLORATION_FILTERS.map((filter) => [filter, 0])) as Record<GgExplorationFilter, number>;
  const surfaced = new Set(batch.surfacedSuggestionIds);
  for (const candidate of batch.candidates) {
    if (surfaced.has(candidate.id)) continue;
    for (const tag of deriveCandidateStructuralTags(candidate)) counts[tag] += 1;
  }
  return counts;
}

export function nextImportCandidatesForFilter(batch: ActiveGgImportBatch, filter: GgExplorationFilter, count: number, pending: HandReviewSuggestion[]): HandReviewSuggestion[] {
  const surfaced = new Set(batch.surfacedSuggestionIds);
  const pendingSources = new Set(pending.map(({ sourceHandId }) => sourceHandId));
  const room = Math.max(0, MAX_PENDING_HAND_SUGGESTIONS - pending.length);
  const limit = Math.min(Math.max(0, Math.floor(count)), room);
  return batch.candidates.filter((candidate) => !surfaced.has(candidate.id) && !pendingSources.has(candidate.sourceHandId) && deriveCandidateStructuralTags(candidate).includes(filter)).slice(0, limit);
}

export function surfaceImportCandidatesForFilter(batch: ActiveGgImportBatch, filter: GgExplorationFilter, count: number, pending: HandReviewSuggestion[]): { batch: ActiveGgImportBatch; suggestions: HandReviewSuggestion[]; added: HandReviewSuggestion[] } {
  const added = nextImportCandidatesForFilter(batch, filter, count, pending);
  return { batch: markImportCandidatesSurfaced(batch, added), suggestions: [...pending, ...added], added };
}
