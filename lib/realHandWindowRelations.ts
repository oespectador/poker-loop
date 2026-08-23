import { reasoningFactorLabels } from "./realHandReasoning";
import type { RealHandWindowComparison } from "./realHandWindowComparisons";
import type { ReasoningFactor } from "./types";

export type ObservedOccurrenceRelation = "fewer" | "same" | "more";

/** A descriptive relation between two equal, frozen windows. It is never persisted. */
export interface RealHandWindowRelation {
  episodeId: string;
  followUpId: string;
  sessionId: string;
  factor: ReasoningFactor;
  originalCount: number;
  posteriorCount: number;
  relation: ObservedOccurrenceRelation;
}

export interface RealHandWindowRelationDescription {
  text: string;
  disclosure: string;
}

export function deriveRealHandWindowRelation(comparison: RealHandWindowComparison): RealHandWindowRelation | null {
  if (comparison.original.reviewedCount !== 5 || comparison.posterior.reviewedCount !== 5) return null;
  const relation: ObservedOccurrenceRelation = comparison.posterior.factorCount < comparison.original.factorCount
    ? "fewer"
    : comparison.posterior.factorCount > comparison.original.factorCount ? "more" : "same";
  return {
    episodeId: comparison.episodeId,
    followUpId: comparison.followUpId,
    sessionId: comparison.sessionId,
    factor: comparison.factor,
    originalCount: comparison.original.factorCount,
    posteriorCount: comparison.posterior.factorCount,
    relation,
  };
}

/** Preserves the order established by V0.26 and silently omits invalid window sizes. */
export function deriveRealHandWindowRelations(comparisons: readonly RealHandWindowComparison[]): RealHandWindowRelation[] {
  return comparisons.flatMap((comparison) => {
    const relation = deriveRealHandWindowRelation(comparison);
    return relation ? [relation] : [];
  });
}

export function describeRealHandWindowRelation(relation: RealHandWindowRelation): RealHandWindowRelationDescription {
  const factorLabel = reasoningFactorLabels[relation.factor];
  const text = relation.relation === "fewer"
    ? `Na observação posterior, ${factorLabel} apareceu em menos revisões do que na observação original.`
    : relation.relation === "more"
      ? `Na observação posterior, ${factorLabel} apareceu em mais revisões do que na observação original.`
      : `Nas duas observações, ${factorLabel} apareceu no mesmo número de revisões.`;
  return {
    text,
    disclosure: "Isso descreve apenas estas duas janelas de autorrelato. Não permite concluir melhora, piora ou efeito do treino.",
  };
}
