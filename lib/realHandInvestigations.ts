import { reasoningFactorLabels } from "./realHandReasoning";
import type { ReasoningFactor, StoredRealHandReasoningSnapshot } from "./types";

const factorOrder: ReasoningFactor[] = ["size", "board", "previous-actions", "configuration", "player-read", "automatic", "other"];
const lowerSupport = new Set(["low", "unclear"]);

export interface RealHandInvestigationCandidate {
  factor: ReasoningFactor;
  factorLabel: string;
  reviewCount: number;
  lowOrUnclearCount?: number;
  snapshotIds: string[];
  handReviewIds: string[];
  representativeHandReviewIds: string[];
  text: string;
}

function newestFirst(a: StoredRealHandReasoningSnapshot, b: StoredRealHandReasoningSnapshot) {
  return Date.parse(b.createdAt) - Date.parse(a.createdAt) || b.id.localeCompare(a.id);
}

/** Derives cautious prompts from self-reports only; no state is read or written. */
export function deriveRealHandInvestigations(
  snapshots: readonly StoredRealHandReasoningSnapshot[],
): RealHandInvestigationCandidate[] {
  const distinctReviews = new Map<string, StoredRealHandReasoningSnapshot>();
  for (const snapshot of [...snapshots].sort(newestFirst)) {
    if (!distinctReviews.has(snapshot.handReviewId)) distinctReviews.set(snapshot.handReviewId, snapshot);
  }

  return factorOrder.flatMap<RealHandInvestigationCandidate>((factor) => {
    const evidence = [...distinctReviews.values()].filter((snapshot) => snapshot.factors.includes(factor)).sort(newestFirst);
    if (evidence.length < 3) return [];

    const factorLabel = reasoningFactorLabels[factor];
    if (factor === "automatic") return [{
      factor,
      factorLabel,
      reviewCount: evidence.length,
      snapshotIds: evidence.map(({ id }) => id),
      handReviewIds: evidence.map(({ handReviewId }) => handReviewId),
      representativeHandReviewIds: evidence.slice(0, 3).map(({ handReviewId }) => handReviewId),
      text: `Você marcou “${factorLabel}” em ${evidence.length} revisões. Talvez valha observar essas decisões em conjunto.`,
    }];

    const lowOrUnclearCount = evidence.filter(({ selfRatedSupport }) => selfRatedSupport && lowerSupport.has(selfRatedSupport)).length;
    if (lowOrUnclearCount < 2) return [];
    return [{
      factor,
      factorLabel,
      reviewCount: evidence.length,
      lowOrUnclearCount,
      snapshotIds: evidence.map(({ id }) => id),
      handReviewIds: evidence.map(({ handReviewId }) => handReviewId),
      representativeHandReviewIds: evidence.slice(0, 3).map(({ handReviewId }) => handReviewId),
      text: `Você marcou ${factorLabel} em ${evidence.length} revisões. Em ${lowOrUnclearCount} dessas decisões, sua sustentação percebida foi Baixa ou Não estava claro.`,
    }];
  });
}
