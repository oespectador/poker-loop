import type { HeroDecisionAnchor, HeroDecisionView, ParsedGgHand, RealHandReasoningSnapshot, ReasoningFactor } from "./types";

export const decisionStreetLabels = { preflop: "Pré-flop", flop: "Flop", turn: "Turn", river: "River" } as const;
export const reasoningFactorLabels: Record<ReasoningFactor, string> = {
  size: "Tamanho da aposta", board: "Board", "previous-actions": "Ações anteriores", configuration: "Posição / configuração",
  "player-read": "Leitura do jogador", automatic: "Fui mais no automático", other: "Outro",
};

export function extractHeroDecisionAnchors(hand: ParsedGgHand): HeroDecisionAnchor[] {
  return hand.actions.flatMap((action, sequenceIndex) => action.actor === "Hero" ? [{
    id: `${action.street}-${sequenceIndex}`, street: action.street, sequenceIndex, action: action.type,
    amount: action.amount, toAmount: action.toAmount, allIn: action.allIn,
  }] : []);
}

export function matchSnapshotDecisionAnchor(
  anchors: HeroDecisionAnchor[],
  snapshot: RealHandReasoningSnapshot,
): HeroDecisionAnchor | undefined {
  return anchors.find(({ sequenceIndex, street, action }) =>
    sequenceIndex === snapshot.sourceDecision.sequenceIndex &&
    street === snapshot.sourceDecision.street &&
    action === snapshot.sourceDecision.action);
}

export function initialQuickReviewAnchor(
  anchors: HeroDecisionAnchor[],
  snapshot: RealHandReasoningSnapshot | undefined,
  editing: boolean,
): HeroDecisionAnchor | undefined {
  return editing && snapshot ? matchSnapshotDecisionAnchor(anchors, snapshot) : anchors.at(-1);
}

export function buildHeroDecisionView(hand: ParsedGgHand, anchor: HeroDecisionAnchor): HeroDecisionView | null {
  const action = hand.actions[anchor.sequenceIndex];
  if (!action || action.actor !== "Hero" || action.street !== anchor.street || action.type !== anchor.action) return null;
  const board: HeroDecisionView["board"] = {};
  if (anchor.street !== "preflop" && hand.flop) board.flop = hand.flop;
  if ((anchor.street === "turn" || anchor.street === "river") && hand.turn) board.turn = hand.turn;
  if (anchor.street === "river" && hand.river) board.river = hand.river;
  return { anchor, heroCards: hand.heroCards, board, actionsThroughDecision: hand.actions.slice(0, anchor.sequenceIndex + 1) };
}

export function toggleReasoningFactor(current: ReasoningFactor[], next: ReasoningFactor): ReasoningFactor[] {
  if (next === "automatic") return current.length === 1 && current[0] === next ? [] : [next];
  const withoutAutomatic = current.filter((factor) => factor !== "automatic");
  if (withoutAutomatic.includes(next)) return withoutAutomatic.filter((factor) => factor !== next);
  return withoutAutomatic.length >= 2 ? withoutAutomatic : [...withoutAutomatic, next];
}

export function formatAction(action: { action?: string; type?: string; amount?: number; toAmount?: number }): string {
  const type = action.action ?? action.type;
  const money = (value: number) => `$${value.toFixed(2).replace(".", ",")}`;
  if (type === "check") return "Check"; if (type === "fold") return "Fold";
  if (type === "raise") return action.toAmount === undefined ? "Raise" : `Raise para ${money(action.toAmount)}`;
  const label = type === "call" ? "Call" : "Bet";
  return action.amount === undefined ? label : `${label} ${money(action.amount)}`;
}
