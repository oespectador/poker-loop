import type { HandReviewSuggestion } from "@/lib/types";
import { ParsedHandVisualization, PokerCard } from "../components/HandVisualization";

interface HandSuggestionCardProps {
  suggestion: HandReviewSuggestion;
  expanded: boolean;
  onToggle: () => void;
  onSave: () => void;
  onDiscard: () => void;
}

const dateLabel = (value: string) => new Date(value).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

export function HandSuggestionCard({ suggestion, expanded, onToggle, onSave, onDiscard }: HandSuggestionCardProps) {
  return <article className={`panel suggestion-card${expanded ? " expanded" : ""}`}>
    <header className="suggestion-card-header">
      <div className="suggestion-card-cards" aria-label="Cartas do Herói">
        {suggestion.heroCards.map((card, index) => <PokerCard card={card} key={`${card}-${index}`}/>)}
      </div>
      <time className="suggestion-card-meta" dateTime={suggestion.playedAt}>{dateLabel(suggestion.playedAt)}</time>
      <div className="eyebrow">{suggestion.reasonLabel}</div>
    </header>

    <button className="primary-cta compact suggestion-review-action" type="button" aria-expanded={expanded} onClick={onToggle}>
      {expanded ? "Fechar mão" : "Revisar situação"}
    </button>

    {!expanded && <div className="suggestion-card-secondary-actions">
      <button className="text-button" type="button" onClick={onSave}>Salvar</button>
      <button className="text-button danger-text" type="button" onClick={onDiscard}>Descartar</button>
    </div>}

    {expanded && <div className="suggestion-expanded-content">
      <ParsedHandVisualization rawHandText={suggestion.rawHandText}/>
      <details className="raw-history"><summary>Ver histórico bruto</summary><pre className="raw-hand-text">{suggestion.rawHandText}</pre></details>
      <div className="eyebrow reflection-heading">POR QUE ELA APARECEU AQUI?</div>
      <h2>{suggestion.reasonLabel}</h2>
      <p>{suggestion.reasonMessage}</p>
      <p>Essa seleção considera apenas a estrutura da mão. Ela não indica que sua decisão foi correta ou incorreta.</p>
      <div className="suggestion-actions">
        <button className="text-button danger-text" type="button" onClick={onDiscard}>Descartar</button>
        <button className="primary-cta compact" type="button" onClick={onSave}>Salvar para revisão</button>
        <button className="text-button" type="button" onClick={onToggle}>Fechar</button>
      </div>
    </div>}
  </article>;
}
