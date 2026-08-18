interface PokerBoardProps {
  cards?: string[];
  compact?: boolean;
}

export function PokerBoard({ cards, compact = false }: PokerBoardProps) {
  if (!cards?.length) return null;

  return (
    <div
      className={compact ? "poker-board compact" : "poker-board"}
      aria-label={`Board: ${cards.join(" ")}`}
    >
      {cards.map((card, index) => {
        const suit = card.slice(-1);
        const isRed = suit === "♥" || suit === "♦";
        return (
          <span className={isRed ? "playing-card red-suit" : "playing-card"} key={`${card}-${index}`}>
            {card}
          </span>
        );
      })}
    </div>
  );
}
