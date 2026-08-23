import type { ParsedGgHand } from "./types";

export const hasRiverDecision = (hand: ParsedGgHand): boolean => hand.heroDecisionStreets.includes("river");
export const hasRiverFacingAggression = (hand: ParsedGgHand): boolean => hand.heroFacedAggressionStreets.includes("river");
export const hasHeroShowdown = (hand: ParsedGgHand): boolean => hand.heroShows;
export const isHighCommitmentHand = (hand: ParsedGgHand): boolean => hand.heroDecisionCount > 0 && (hand.heroAllIn || (hand.heroCommitmentRatio ?? 0) >= 0.25);
export const hasMultiStreetPressure = (hand: ParsedGgHand): boolean => hand.heroFacedAggressionStreets.length >= 2;
export const hasLongLine = (hand: ParsedGgHand): boolean => (["flop", "turn", "river"] as const).every((street) => hand.heroDecisionStreets.includes(street));
