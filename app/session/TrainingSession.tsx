"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PokerBoard } from "../components/PokerBoard";
import { appendAttempts, readAttempts } from "@/lib/storage";
import { buildRecommendedSession, reprioritizeAfterError, skillLabels } from "@/lib/trainingEngine";
import type { Attempt, Exercise, Skill, SupportLevel } from "@/lib/types";

function parseBoardLabel(label: string): string[] | null {
  const cards = label.trim().split(/\s+/);
  const isCard = (card: string) => /^[2-9TJQKA][♠♥♦♣]$/.test(card);
  return cards.length >= 3 && cards.every(isCard) ? cards : null;
}

function isSkill(value: string | null): value is Skill {
  return value === "board-reading" || value === "range-reading" || value === "sizing" || value === "integrated-decision";
}

function attemptSupport(exercise: Exercise, hintRevealed: boolean): SupportLevel {
  if (exercise.support === "guided") return "guided";
  if (exercise.support === "supported" && hintRevealed) return "supported";
  return "independent";
}

export default function TrainingSession() {
  const params = useSearchParams();
  const focusParam = params.get("focus");
  const focus = isSkill(focusParam) ? focusParam : undefined;
  const [queue, setQueue] = useState<Exercise[]>([]);
  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [hintRevealed, setHintRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const sessionId = useRef(`session-${Date.now()}`);

  useEffect(() => {
    const history = readAttempts();
    setQueue(buildRecommendedSession(history, focus, sessionId.current));
    setReady(true);
  }, [focus]);

  const exercise = queue[index];
  const correct = selected === exercise?.correctOptionId;

  function answer(optionId: string) {
    if (selected || !exercise) return;
    setSelected(optionId);

    const actualSupport = attemptSupport(exercise, hintRevealed);
    const attempt: Attempt = {
      id: `attempt-${Date.now()}-${exercise.id}`,
      exerciseId: exercise.id,
      sessionId: sessionId.current,
      primarySkill: exercise.primarySkill,
      answerId: optionId,
      correct: optionId === exercise.correctOptionId,
      support: actualSupport,
      hintUsed: hintRevealed,
      timestamp: new Date().toISOString(),
    };

    setAttempts((current) => [...current, attempt]);
    appendAttempts([attempt]);
    if (!attempt.correct) {
      setQueue((current) => reprioritizeAfterError(current, index, exercise));
    }
  }

  function next() {
    if (!selected) return;
    if (index >= queue.length - 1) {
      setFinished(true);
      return;
    }
    setIndex((current) => current + 1);
    setSelected(null);
    setExpanded(false);
    setHintRevealed(false);
  }

  if (!ready) {
    return (
      <main className="session-shell">
        <p className="lead">Preparando seu treino…</p>
      </main>
    );
  }

  if (finished) {
    const correctCount = attempts.filter((attempt) => attempt.correct).length;
    const errorSkills = [...new Set(attempts.filter((attempt) => !attempt.correct).map((attempt) => attempt.primarySkill))];
    return (
      <main className="session-shell finish-shell">
        <div className="finish-mark" aria-hidden="true">∞</div>
        <div className="eyebrow">TREINO CONCLUÍDO</div>
        <h1>{attempts.length} decisões.</h1>
        <p className="lead">{correctCount} respostas corretas. O mais importante agora é o padrão que ficou registrado.</p>

        <div className="finish-grid">
          <article className="panel">
            <div className="eyebrow">HOJE VOCÊ TRABALHOU</div>
            <p>Leitura do board → ranges → sizing → decisão.</p>
          </article>
          <article className="panel">
            <div className="eyebrow">VAMOS REFORÇAR</div>
            <p>{errorSkills.length ? errorSkills.map((skill) => skillLabels[skill]).join(" · ") : "Nenhuma habilidade apresentou erro nesta sessão. A próxima etapa é verificar retenção e transferência."}</p>
          </article>
        </div>

        <Link href="/" className="primary-cta">Concluir</Link>
        <Link href="/session" className="quiet-link">Treinar mais</Link>
      </main>
    );
  }

  if (!exercise) return null;

  const selectedMisconception = selected ? exercise.feedback.misconception?.[selected] : undefined;
  const visibleGuidedHint = exercise.support === "guided" && exercise.supportNote && !selected;
  const optionalSupportedHint = exercise.support === "supported" && exercise.supportNote && !selected;

  return (
    <main className="session-shell">
      <header className="session-top">
        <span>{index + 1} / {queue.length}</span>
        <Link href="/" className="session-exit">Sair</Link>
      </header>

      <section className="exercise-card">
        {exercise.title && <div className="exercise-kicker">{exercise.title}</div>}
        <div className="spot-line">{exercise.spot.label}</div>
        <div className="spot-meta">{exercise.spot.pot} · {exercise.spot.stack} · {exercise.spot.hero}</div>

        {exercise.spot.street && <div className="street-label">{exercise.spot.street}</div>}
        <PokerBoard cards={exercise.spot.board} />

        {exercise.spot.action?.length ? (
          <div className="action-sequence">
            {exercise.spot.action.map((action) => <span key={action}>{action}</span>)}
          </div>
        ) : null}

        {visibleGuidedHint && (
          <aside className="support-note">
            <strong>Pista de leitura</strong>
            <span>{exercise.supportNote}</span>
          </aside>
        )}

        {optionalSupportedHint && (
          <div className="optional-hint">
            {!hintRevealed ? (
              <button type="button" className="text-button" onClick={() => setHintRevealed(true)}>
                Ver uma pista
              </button>
            ) : (
              <aside className="support-note">
                <strong>Pista</strong>
                <span>{exercise.supportNote}</span>
              </aside>
            )}
          </div>
        )}

        <div className="decision-zone" aria-live="polite">
          {!selected ? (
            <>
              <h1>{exercise.prompt}</h1>
              <div className="option-stack">
                {exercise.options.map((option) => {
                  const optionBoard = parseBoardLabel(option.label);
                  return (
                    <button
                      key={option.id}
                      className={optionBoard ? "exercise-option board-option" : "exercise-option"}
                      type="button"
                      onClick={() => answer(option.id)}
                      aria-label={optionBoard ? `Board ${option.label}` : undefined}
                    >
                      {optionBoard ? <PokerBoard cards={optionBoard} compact /> : <span>{option.label}</span>}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className={correct ? "feedback-box correct" : "feedback-box incorrect"}>
              <div className="feedback-title">
                <span aria-hidden="true">{correct ? "✓" : "✕"}</span>
                <strong>{correct ? "Boa leitura" : "Revise o raciocínio"}</strong>
              </div>
              <p>{selectedMisconception ?? exercise.feedback.short}</p>
              {!correct && selectedMisconception && <p className="feedback-secondary">{exercise.feedback.short}</p>}
              {expanded && exercise.feedback.expanded && <p className="feedback-expanded">{exercise.feedback.expanded}</p>}
              {exercise.feedback.expanded && (
                <button type="button" className="text-button" onClick={() => setExpanded((value) => !value)}>
                  {expanded ? "Mostrar menos" : "Ver explicação completa"}
                </button>
              )}
              <button type="button" className="primary-cta button-reset" onClick={next}>Continuar</button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
