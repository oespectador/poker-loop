import type { ParsedActionType, ParsedGgHand } from "./types";

export type FacedAggressionType = "bet" | "raise";

/** River actions are observed chronologically; third-party calls/folds do not clear what Hero faces. */
export function deriveHeroRiverFacedAggressions(hand: ParsedGgHand): FacedAggressionType[] {
  let pending: FacedAggressionType | undefined;
  const faced: FacedAggressionType[] = [];
  for (const action of hand.actions) {
    if (action.street !== "river") continue;
    if (action.actor === "Hero") {
      if (pending) faced.push(pending);
      pending = undefined;
    } else if (action.type === "bet" || action.type === "raise") {
      pending = action.type;
    }
  }
  return faced;
}

export function hasHeroRiverAction(hand: ParsedGgHand, type: ParsedActionType): boolean {
  return hand.actions.some((action) => action.actor === "Hero" && action.street === "river" && action.type === type);
}

export const heroFacedRiverBet = (hand: ParsedGgHand): boolean => deriveHeroRiverFacedAggressions(hand).includes("bet");
export const heroFacedRiverRaise = (hand: ParsedGgHand): boolean => deriveHeroRiverFacedAggressions(hand).includes("raise");

export function heroBetThenFacedRiverRaise(hand: ParsedGgHand): boolean {
  let heroBet = false;
  let raiseAfterHeroBet = false;
  for (const action of hand.actions) {
    if (action.street !== "river") continue;
    if (action.actor === "Hero") {
      if (raiseAfterHeroBet) return true;
      if (action.type === "bet") heroBet = true;
    } else if (heroBet && action.type === "raise") {
      raiseAfterHeroBet = true;
    }
  }
  return false;
}

export const hasRiverDecision = (hand: ParsedGgHand): boolean => hand.heroDecisionStreets.includes("river");
export const hasRiverFacingAggression = (hand: ParsedGgHand): boolean => hand.heroFacedAggressionStreets.includes("river");
export const hasHeroShowdown = (hand: ParsedGgHand): boolean => hand.heroShows;
export const isHighCommitmentHand = (hand: ParsedGgHand): boolean => hand.heroDecisionCount > 0 && (hand.heroAllIn || (hand.heroCommitmentRatio ?? 0) >= 0.25);
export const hasMultiStreetPressure = (hand: ParsedGgHand): boolean => hand.heroFacedAggressionStreets.length >= 2;
export const hasLongLine = (hand: ParsedGgHand): boolean => (["flop", "turn", "river"] as const).every((street) => hand.heroDecisionStreets.includes(street));
