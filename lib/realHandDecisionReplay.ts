import type { HeroDecisionAnchor, HeroDecisionView, ParsedGgHand, StoredRealHandReasoningSnapshot } from "./types";
import { buildHeroDecisionView, matchSnapshotDecisionAnchor } from "./realHandReasoning";

export type ReplayAction = "fold" | "check" | "call" | "bet" | "raise";
export type ReplayComparison = "same-action-family" | "different-action-family";

const passiveOptions: readonly ReplayAction[] = ["check", "bet"];
const facingAggressionOptions: readonly ReplayAction[] = ["fold", "call", "raise"];

export const replayActionLabels: Record<ReplayAction, string> = {
  fold: "Fold", check: "Check", call: "Call", bet: "Bet", raise: "Raise",
};

/** Amount and all-in describe execution, not a new action family. */
export function replayActionFamily(action: { action?: string; type?: string }): ReplayAction | undefined {
  const candidate = action.action ?? action.type;
  return candidate === "fold" || candidate === "check" || candidate === "call" || candidate === "bet" || candidate === "raise" ? candidate : undefined;
}

function immediatelyFacesAllIn(hand: ParsedGgHand, anchor: HeroDecisionAnchor): boolean {
  const previous = hand.actions[anchor.sequenceIndex - 1];
  return Boolean(previous && previous.street === anchor.street && previous.actor !== "Hero" &&
    (previous.type === "bet" || previous.type === "raise") && previous.allIn);
}

export function deriveReplayActionOptions(hand: ParsedGgHand, anchor: HeroDecisionAnchor): ReplayAction[] {
  const historical = replayActionFamily(anchor);
  if (!historical) return [];
  let options = historical === "check" || historical === "bet" ? [...passiveOptions] : [...facingAggressionOptions];
  if (immediatelyFacesAllIn(hand, anchor) && historical !== "raise") options = options.filter((action) => action !== "raise");
  if (!options.includes(historical)) options.push(historical);
  return [...new Set(options)];
}

export function compareReplayAction(historicalAction: { action?: string; type?: string }, currentAction: ReplayAction): ReplayComparison {
  return replayActionFamily(historicalAction) === currentAction ? "same-action-family" : "different-action-family";
}

/** Reuses the validated Decision View, then removes exactly the action being replayed. */
export function buildReplayDecisionView(hand: ParsedGgHand, anchor: HeroDecisionAnchor): HeroDecisionView | null {
  const view = buildHeroDecisionView(hand, anchor);
  return view ? { ...view, actionsThroughDecision: view.actionsThroughDecision.slice(0, -1) } : null;
}

export interface RealHandReplayEligibility {
  anchor: HeroDecisionAnchor;
  options: ReplayAction[];
  decisionView: HeroDecisionView;
}

export function deriveRealHandReplayEligibility(
  hand: ParsedGgHand,
  snapshot: StoredRealHandReasoningSnapshot | undefined,
): RealHandReplayEligibility | null {
  if (!snapshot) return null;
  const anchor = matchSnapshotDecisionAnchor(hand, snapshot);
  if (!anchor) return null;
  const options = deriveReplayActionOptions(hand, anchor);
  const decisionView = buildReplayDecisionView(hand, anchor);
  return options.length >= 2 && options.includes(anchor.action) && decisionView ? { anchor, options, decisionView } : null;
}
