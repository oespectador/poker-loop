import { MAX_PENDING_HAND_SUGGESTIONS } from "./handSuggestionStorage";
import { parseGgHand } from "./ggHandParser";
import { hasHeroShowdown, hasLongLine, hasMultiStreetPressure, hasRiverDecision, hasRiverFacingAggression, isHighCommitmentHand } from "./ggHandStructuralPredicates";
import { markImportCandidatesSurfaced, type ActiveGgImportBatch } from "./activeGgImportBatch";
import type { HandReviewSuggestion, ParsedGgHand } from "./types";

export const GG_EXPLORATION_FILTERS = ["river-decision", "river-facing-aggression", "hero-showdown", "high-commitment", "multi-street-pressure", "long-line"] as const;
export type GgExplorationFilter = (typeof GG_EXPLORATION_FILTERS)[number];

export const ggExplorationFilterLabels: Record<GgExplorationFilter, string> = {
  "river-decision": "Decisão no river",
  "river-facing-aggression": "Agressão enfrentada no river",
  "hero-showdown": "Showdown com cartas reveladas",
  "high-commitment": "Alta exposição",
  "multi-street-pressure": "Pressão em várias streets",
  "long-line": "Linha longa",
};

const predicates: Record<GgExplorationFilter, (hand: ParsedGgHand) => boolean> = {
  "river-decision": hasRiverDecision,
  "river-facing-aggression": hasRiverFacingAggression,
  "hero-showdown": hasHeroShowdown,
  "high-commitment": isHighCommitmentHand,
  "multi-street-pressure": hasMultiStreetPressure,
  "long-line": hasLongLine,
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
