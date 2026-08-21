import type { HeroDecisionAnchor, ParsedGgHand } from "@/lib/types";
import { buildHandVisualModel, decisionStreetLabels, formatAction } from "@/lib/realHandReasoning";
import { parseGgHand } from "@/lib/ggHandParser";

export function PokerCard({ card }: { card: string }) {
  const match = card.match(/^(.+)([cdhs])$/i);
  if (!match) return <span className="hand-card">{card}</span>;
  const suits = { c: "♣", d: "♦", h: "♥", s: "♠" } as const;
  const suit = match[2].toLowerCase() as keyof typeof suits;
  return <span className={`hand-card ${suit === "h" || suit === "d" ? "red-suit" : ""}`} aria-label={`${match[1]} ${suits[suit]}`}><span>{match[1]}</span><span>{suits[suit]}</span></span>;
}

export function HandVisualization({ hand, decision }: { hand: ParsedGgHand; decision?: HeroDecisionAnchor }) {
  const visual = buildHandVisualModel(hand, decision);
  if (!visual) return null;

  return <section className="hand-visual" aria-label={decision ? "Visualização da decisão" : "Visualização da mão"}>
    <header className="hand-visual-header">
      <div><div className="eyebrow">MÃO #{hand.sourceHandId}</div><strong>{hand.tableName || "Texas Hold’em No Limit"}</strong></div>
      <span>{new Date(hand.playedAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })} · ${hand.smallBlind.toFixed(2)}/${hand.bigBlind.toFixed(2)}</span>
    </header>
    <div className="hero-hand"><span>Herói</span><div className="hand-cards">{hand.heroCards.map((card) => <PokerCard card={card} key={card}/>)}</div></div>
    <div className="street-flow">{visual.map(({ street, board, actions }) => {
      return <section className="street-block" key={street}>
        <header><h3>{decisionStreetLabels[street]}</h3>{board?.length ? <div className="street-board">{board.map((card) => <PokerCard card={card} key={card}/>)}</div> : null}</header>
        <div className="street-actions">{actions.map((action) => <div className={`street-action ${action.actor === "Hero" ? "hero-action" : ""} ${action.selected ? "selected-decision" : ""}`} key={action.sequenceIndex}><strong>{action.actor === "Hero" ? "Herói" : action.actor}</strong><span>{formatAction(action)}</span>{action.selected && <small>Sua decisão</small>}</div>)}</div>
      </section>;
    })}</div>
  </section>;
}

export function ParsedHandVisualization({ rawHandText }: { rawHandText: string }) {
  const hand = parseGgHand(rawHandText);
  return hand ? <HandVisualization hand={hand}/> : <p className="visual-unavailable">Visualização automática indisponível para este formato. O texto original continua acessível abaixo.</p>;
}
