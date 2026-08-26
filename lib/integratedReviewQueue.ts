import type { ActiveGgImportBatch } from "./activeGgImportBatch";
import type { HandReviewSuggestion, RealHandReview, StoredRealHandReasoningSnapshot } from "./types";

export interface ReviewRoundSummary { total: number; considered: number; quickReviewed: number; withoutQuickReview: number; nextSuggestionId?: string; nextSavedHandId?: string; complete: boolean; }

/** Factual read-only view over an import round. It creates no workflow state or evidence. */
export function deriveReviewRound(batch: ActiveGgImportBatch | null, suggestions: readonly HandReviewSuggestion[], hands: readonly RealHandReview[], snapshots: readonly StoredRealHandReasoningSnapshot[], currentHandId?: string): ReviewRoundSummary | null {
  if (!batch?.surfacedSuggestionIds.length) return null;
  const surfaced = new Set(batch.surfacedSuggestionIds);
  const candidates = batch.candidates.filter(({ id }) => surfaced.has(id));
  const pending = new Set(suggestions.map(({ id }) => id));
  const savedByText = new Map(hands.map((hand) => [hand.rawHandText, hand]));
  const reviewed = new Set(snapshots.map(({ handReviewId }) => handReviewId));
  const promoted = candidates.map((item) => savedByText.get(item.rawHandText)).filter((hand): hand is RealHandReview => Boolean(hand));
  const currentIndex = currentHandId ? candidates.findIndex((item) => savedByText.get(item.rawHandText)?.id === currentHandId) : -1;
  const ordered = currentIndex < 0 ? candidates : [...candidates.slice(currentIndex + 1), ...candidates.slice(0, currentIndex)];
  const nextSaved = ordered.map((item) => savedByText.get(item.rawHandText)).find((hand) => hand && !reviewed.has(hand.id));
  const nextSuggestion = ordered.find(({ id }) => pending.has(id));
  const quickReviewed = promoted.filter(({ id }) => reviewed.has(id)).length;
  return { total: candidates.length, considered: candidates.length - candidates.filter(({ id }) => pending.has(id)).length, quickReviewed, withoutQuickReview: Math.max(0, promoted.length - quickReviewed), nextSuggestionId: nextSuggestion?.id, nextSavedHandId: nextSaved?.id, complete: !nextSuggestion && !nextSaved };
}
