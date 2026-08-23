"use client";

import { useState } from "react";
import type { SessionRecapItem } from "@/lib/sessionRecap";

interface SessionRecapReviewProps {
  items: readonly SessionRecapItem[];
  remainingCount: number;
}

interface ItemReviewState {
  revealed: boolean;
  reflection: string;
}

export function SessionRecapReview({ items, remainingCount }: SessionRecapReviewProps) {
  const [reviewByItem, setReviewByItem] = useState<Record<string, ItemReviewState>>({});

  function updateReflection(itemId: string, reflection: string) {
    setReviewByItem((current) => ({
      ...current,
      [itemId]: { revealed: current[itemId]?.revealed ?? false, reflection },
    }));
  }

  function reveal(itemId: string) {
    setReviewByItem((current) => ({
      ...current,
      [itemId]: { revealed: true, reflection: current[itemId]?.reflection ?? "" },
    }));
  }

  return (
    <section className="session-recap" aria-labelledby="session-recap-title">
      <div className="eyebrow">PARA LEVAR DESTA SESSÃO</div>
      <h2 id="session-recap-title">Raciocínios das decisões que tiveram erro</h2>
      {items.length ? (
        <>
          <p className="session-recap-guidance">Antes de abrir cada explicação, tente lembrar por alguns segundos qual era a ideia central.</p>
          <div className="session-recap-list">
            {items.map((item, index) => {
              const review = reviewByItem[item.id] ?? { revealed: false, reflection: "" };
              const feedbackId = `session-recap-feedback-${index}`;
              const reflectionId = `session-recap-reflection-${index}`;
              return (
                <article className="session-recap-item" key={item.id}>
                  <h3>{item.label}</h3>
                  <p className="session-recap-prompt">Antes de abrir a explicação, tente lembrar: o que você deveria observar nessa situação?</p>
                  <label htmlFor={reflectionId}>Uma frase antes de revelar (opcional)</label>
                  <textarea
                    id={reflectionId}
                    className="session-recap-reflection"
                    maxLength={180}
                    onChange={(event) => updateReflection(item.id, event.target.value)}
                    placeholder="Se quiser, escreva em uma frase antes de revelar."
                    rows={2}
                    value={review.reflection}
                  />
                  {!review.revealed && (
                    <button
                      type="button"
                      className="session-recap-reveal"
                      aria-controls={feedbackId}
                      aria-expanded={false}
                      onClick={() => reveal(item.id)}
                    >
                      Ver ideia central
                    </button>
                  )}
                  {review.revealed && <p className="session-recap-feedback" id={feedbackId}>{item.feedback}</p>}
                  <p className="optional-note">Esse raciocínio apareceu em {item.wrongCount} {item.wrongCount === 1 ? "decisão" : "decisões"} com erro nesta sessão.</p>
                  <p className="optional-note">{item.laterCorrectInSession
                    ? "Depois desse último erro, houve um acerto posterior nesse raciocínio ainda nesta sessão."
                    : "Esse raciocínio não voltou a aparecer com acerto depois do último erro nesta sessão."}</p>
                </article>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <p>Nenhum erro foi registrado nesta sessão.</p>
          <p className="optional-note">Isso descreve apenas esta sessão; retenção e transferência continuam sendo verificadas separadamente.</p>
        </>
      )}
      {remainingCount > 0 && <p className="optional-note">Outros {remainingCount} raciocínios também tiveram pelo menos um erro nesta sessão.</p>}
      <p className="session-recap-disclosure">Este resumo usa apenas as decisões desta sessão. Padrões recorrentes, retenção e transferência são avaliados separadamente pelo Poker Loop.</p>
    </section>
  );
}
