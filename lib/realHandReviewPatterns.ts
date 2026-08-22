import { decisionStreetLabels, reasoningFactorLabels } from "./realHandReasoning";
import type { ReasoningFactor, SelfRatedSupport, StoredRealHandReasoningSnapshot } from "./types";

export const selfRatedSupportLabels: Record<SelfRatedSupport, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  unclear: "Não estava claro",
};

const factorOrder: ReasoningFactor[] = ["size", "board", "previous-actions", "configuration", "player-read", "automatic", "other"];
const supportOrder: SelfRatedSupport[] = ["low", "medium", "high", "unclear"];
const streetOrder = ["preflop", "flop", "turn", "river"] as const;

export interface RealHandReviewObservation {
  kind: "factor" | "support";
  count: number;
  denominator: number;
  text: string;
}

export interface RealHandReviewPatternSummary {
  reviewedHands: number;
  factorCounts: Record<ReasoningFactor, number>;
  supportCounts: Record<SelfRatedSupport, number>;
  supportReviewedHands: number;
  streetCounts: Record<(typeof streetOrder)[number], number>;
  observations: RealHandReviewObservation[];
  hasEnoughReviewsForObservations: boolean;
}

/**
 * Builds presentation data from self-reports only. This pure function neither
 * reads storage nor produces pedagogical evidence.
 */
export function summarizeRealHandReviewPatterns(snapshots: readonly StoredRealHandReasoningSnapshot[]): RealHandReviewPatternSummary {
  const factorCounts = Object.fromEntries(factorOrder.map((factor) => [factor, 0])) as Record<ReasoningFactor, number>;
  const supportCounts = Object.fromEntries(supportOrder.map((support) => [support, 0])) as Record<SelfRatedSupport, number>;
  const streetCounts = Object.fromEntries(streetOrder.map((street) => [street, 0])) as Record<(typeof streetOrder)[number], number>;

  for (const snapshot of snapshots) {
    for (const factor of snapshot.factors) factorCounts[factor] += 1;
    if (snapshot.selfRatedSupport) supportCounts[snapshot.selfRatedSupport] += 1;
    streetCounts[snapshot.sourceDecision.street] += 1;
  }

  const reviewedHands = snapshots.length;
  const supportReviewedHands = supportOrder.reduce((total, support) => total + supportCounts[support], 0);
  const observations: Array<RealHandReviewObservation & { order: number }> = [];

  if (reviewedHands >= 3) {
    factorOrder.forEach((factor, order) => {
      const count = factorCounts[factor];
      if (count < 3) return;
      const label = reasoningFactorLabels[factor];
      observations.push({
        kind: "factor",
        count,
        denominator: reviewedHands,
        order,
        text: factor === "automatic"
          ? `Você marcou “${label}” em ${count} das suas ${reviewedHands} revisões.`
          : `${label} apareceu em ${count} das suas ${reviewedHands} revisões.`,
      });
    });

    const lowerOrUnclear = supportCounts.low + supportCounts.unclear;
    if (lowerOrUnclear >= 3) observations.push({
      kind: "support",
      count: lowerOrUnclear,
      denominator: supportReviewedHands,
      order: factorOrder.length,
      text: `Em ${lowerOrUnclear} de ${supportReviewedHands} decisões com sustentação registrada, você marcou Baixa ou Não estava claro.`,
    });
  }

  return {
    reviewedHands,
    factorCounts,
    supportCounts,
    supportReviewedHands,
    streetCounts,
    observations: observations.sort((a, b) => b.count - a.count || a.order - b.order).slice(0, 3).map(({ order: _order, ...observation }) => observation),
    hasEnoughReviewsForObservations: reviewedHands >= 3,
  };
}

export { decisionStreetLabels, factorOrder as reasoningFactorOrder, streetOrder as realHandStreetOrder };
