"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PokerBoard } from "../components/PokerBoard";
import { createTrainingSession, resumeTrainingSession, updateActiveSession } from "@/lib/activeTrainingSession";
import { appendAttempts, clearActiveTrainingSession, readActiveTrainingSession, readAttempts, writeActiveTrainingSession } from "@/lib/storage";
import { attemptSupport } from "@/lib/support";
import { reprioritizeAfterError, skillLabels } from "@/lib/trainingEngine";
import type { ActiveTrainingSession, Attempt, Exercise, Skill } from "@/lib/types";
import { findInvestigationTrainingLaunchBySessionId, readInvestigationTrainingLaunches, registerLaunchForNewTrainingSession, type InvestigationTrainingLaunch } from "@/lib/investigationTrainingLaunches";
import { completionForFinishedLaunchedSession, findInvestigationTrainingCompletionBySessionId, readInvestigationTrainingCompletions, registerInvestigationTrainingCompletion, type InvestigationTrainingCompletion } from "@/lib/investigationTrainingCompletions";

function parseBoardLabel(label: string): string[] | null {
  const cards = label.trim().split(/\s+/);
  const isCard = (card: string) => /^[2-9TJQKA][♠♥♦♣]$/.test(card);
  return cards.length >= 3 && cards.every(isCard) ? cards : null;
}

function isSkill(value: string | null): value is Skill {
  return value === "board-reading" || value === "range-reading" || value === "sizing" || value === "integrated-decision";
}

export default function TrainingSession() {
  const params = useSearchParams();
  const focusParam = params.get("focus");
  const focus = isSkill(focusParam) ? focusParam : undefined;
  const investigationParam = params.get("investigation");
  const [queue, setQueue] = useState<Exercise[]>([]);
  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [hintRevealed, setHintRevealed] = useState(false);
  const [provenance, setProvenance] = useState<InvestigationTrainingLaunch>();
  const [operationalCompletion, setOperationalCompletion] = useState<InvestigationTrainingCompletion>();
  const activeSession = useRef<ActiveTrainingSession | null>(null);

  function newSessionId() {
    return `session-${Date.now()}-${crypto.randomUUID()}`;
  }

  function startNewSession(history: Attempt[], allowInvestigationOrigin = false) {
    const created = createTrainingSession(history, focus, newSessionId());
    activeSession.current = created.active;
    writeActiveTrainingSession(created.active);
    setQueue(created.queue);
    setAttempts(created.attempts);
    setIndex(0);
    setSelected(null);
    setExpanded(false);
    setHintRevealed(false);
    const launch = allowInvestigationOrigin ? registerLaunchForNewTrainingSession(investigationParam, created.active) : null;
    setProvenance(launch ?? undefined);
    setOperationalCompletion(undefined);
  }

  useEffect(() => {
    const history = readAttempts();
    const resumed = resumeTrainingSession(readActiveTrainingSession(), history, focus);
    if (resumed) {
      activeSession.current = resumed.active;
      setQueue(resumed.queue);
      setAttempts(resumed.attempts);
      setIndex(resumed.active.nextIndex);
      const launch = findInvestigationTrainingLaunchBySessionId(readInvestigationTrainingLaunches(), resumed.active.sessionId);
      setProvenance(launch);
      const existing = findInvestigationTrainingCompletionBySessionId(readInvestigationTrainingCompletions(), resumed.active.sessionId);
      const factualCandidate = completionForFinishedLaunchedSession(resumed.active, launch, history);
      const completion = factualCandidate && existing && Date.parse(existing.completedAt) >= Date.parse(launch!.launchedAt) ? existing : factualCandidate;
      if (!existing && completion) registerInvestigationTrainingCompletion(completion);
      setOperationalCompletion(completion ?? undefined);
    } else {
      startNewSession(history, true);
    }
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
      sessionId: activeSession.current!.sessionId,
      primarySkill: exercise.primarySkill,
      answerId: optionId,
      correct: optionId === exercise.correctOptionId,
      support: actualSupport,
      hintUsed: hintRevealed,
      timestamp: new Date().toISOString(),
    };

    setAttempts((current) => [...current, attempt]);
    appendAttempts([attempt]);
    const nextQueue = attempt.correct ? queue : reprioritizeAfterError(queue, index, exercise);
    setQueue(nextQueue);
    const nextActive = updateActiveSession(activeSession.current!, nextQueue, index + 1);
    activeSession.current = nextActive;
    writeActiveTrainingSession(nextActive);
    const completion = completionForFinishedLaunchedSession(nextActive, provenance, [...attempts, attempt]);
    if (completion) {
      const result = registerInvestigationTrainingCompletion(completion);
      if (result === "created" || result === "idempotent") setOperationalCompletion(completion);
    }
  }

  function next() {
    if (!selected) return;
    if (index >= queue.length - 1) {
      setIndex(queue.length);
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

  if (index >= queue.length) {
    const correctCount = attempts.filter((attempt) => attempt.correct).length;
    const errorSkills = [...new Set(attempts.filter((attempt) => !attempt.correct).map((attempt) => attempt.primarySkill))];
    return (
      <main className="session-shell finish-shell">
        <div className="finish-mark" aria-hidden="true">∞</div>
        <div className="eyebrow">TREINO CONCLUÍDO</div>
        <h1>{attempts.length} decisões.</h1>
        <p className="lead">{correctCount} respostas corretas. O mais importante agora é o padrão que ficou registrado.</p>
        {provenance && operationalCompletion && <p className="optional-note">Esta sessão, iniciada a partir de uma investigação de mãos reais, chegou ao fim das decisões planejadas. O foco foi escolhido por você.</p>}

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

        <Link href="/" className="primary-cta" onClick={clearActiveTrainingSession}>Concluir</Link>
        <button type="button" className="quiet-link button-reset" onClick={() => {
          clearActiveTrainingSession();
          startNewSession(readAttempts());
        }}>Treinar mais</button>
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

      {provenance && index === 0 && <p className="optional-note">Esta sessão foi iniciada a partir de uma investigação de mãos reais. O foco {skillLabels[provenance.skill]} foi escolhido por você.</p>}

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
