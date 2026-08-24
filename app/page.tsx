"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "./components/AppShell";
import { chooseFocus, deriveSkillState, getPendingLearningPackage, skillLabels } from "@/lib/trainingEngine";
import { readActiveTrainingSession, readAttempts } from "@/lib/storage";
import { readActiveRealHandInvestigation } from "@/lib/prospectiveRealHandInvestigation";
import { findActivePostTrainingRealHandFollowUp, readPostTrainingRealHandFollowUps } from "@/lib/postTrainingRealHandFollowUps";
import { readHandSuggestions } from "@/lib/handSuggestionStorage";
import { readActiveGgImportBatch, remainingImportCandidates } from "@/lib/activeGgImportBatch";
import { deriveHomeNextAction, type HomeOperationalState } from "@/lib/homeNextAction";
import type { Attempt, Skill } from "@/lib/types";

const emptyOperationalState: Omit<HomeOperationalState, "recommendedFocus"> = {
  activeTrainingSession: null,
  hasActiveInvestigation: false,
  hasActiveFollowUp: false,
  pendingSuggestionCount: 0,
  remainingImportCandidates: 0,
};

export default function TodayPage() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [operationalState, setOperationalState] = useState(emptyOperationalState);
  const [operationalReady, setOperationalReady] = useState(false);

  useEffect(() => {
    const storedAttempts = readAttempts();
    const activeTrainingSession = readActiveTrainingSession();
    const hasActiveInvestigation = Boolean(readActiveRealHandInvestigation());
    const hasActiveFollowUp = Boolean(findActivePostTrainingRealHandFollowUp(readPostTrainingRealHandFollowUps()));
    const pendingSuggestionCount = readHandSuggestions().length;
    const batch = readActiveGgImportBatch();

    setAttempts(storedAttempts);
    setOperationalState({
      activeTrainingSession,
      hasActiveInvestigation,
      hasActiveFollowUp,
      pendingSuggestionCount,
      remainingImportCandidates: batch ? remainingImportCandidates(batch).length : 0,
    });
    setOperationalReady(true);
  }, []);

  const focus = useMemo(() => chooseFocus(attempts), [attempts]);
  const secondary: Skill = focus === "range-reading" ? "board-reading" : "range-reading";
  const focusState = deriveSkillState(attempts, focus);
  const secondaryState = deriveSkillState(attempts, secondary);
  const pendingPackage = attempts.length > 0 ? getPendingLearningPackage(attempts) : undefined;

  if (!operationalReady) {
    return (
      <AppShell>
        <section className="hero-grid" aria-live="polite">
          <div className="eyebrow">POKER LOOP</div>
          <h1>Preparando seu próximo passo…</h1>
        </section>
      </AppShell>
    );
  }

  const nextAction = deriveHomeNextAction({ ...operationalState, recommendedFocus: focus });
  const hasOpenTraining = Boolean(operationalState.activeTrainingSession);

  return (
    <AppShell>
      <section className="hero-grid">
        <div className="eyebrow">{nextAction.eyebrow}</div>
        <h1>{nextAction.title}</h1>
        <p className="lead">{nextAction.description}</p>

        {nextAction.kind === "recommended-training" && <div className="focus-row" aria-label="Foco recomendado">
          <span className="focus-chip">{skillLabels[focus]}</span>
          <span className="focus-chip muted">{skillLabels[secondary]}</span>
        </div>}

        <Link href={nextAction.href} className="primary-cta">{nextAction.ctaLabel}</Link>
        {nextAction.kind === "recommended-training" && <Link href="/train" className="quiet-link">Ajustar treino</Link>}
        <Link href="/hands" className="quiet-link">Revisar uma mão real</Link>
      </section>

      {nextAction.kind === "recommended-training" && <section className="two-column">
        <article className="panel">
          <div className="eyebrow">POR QUE HOJE?</div>
          <h2>{skillLabels[focus]}</h2>
          <p>
            {attempts.length === 0
              ? "Ainda não temos evidência suficiente. Este primeiro treino começa a calibrar o que o app precisa observar."
              : pendingPackage === "range-actions"
                ? "Há um bloco de leitura de range ainda sem evidência suficiente. Ele entra em microblocos curtos, misturado a revisões do que você já treinou."
                : pendingPackage === "range-to-decision"
                  ? "O próximo bloco conecta leitura de range a objetivo, mãos-alvo e sizing. Ele entra em microblocos curtos sem antecipar conceitos futuros."
                  : pendingPackage === "calibration"
                    ? "O próximo bloco separa duas perguntas: se a decisão segue das premissas e quanto podemos confiar nessas premissas. Ele entra em microblocos curtos antes de o treino voltar à revisão adaptativa."
                  : pendingPackage === "range-strength-signals"
                    ? "O próximo bloco treina como combinar size, board e configuração para atualizar a leitura do range sem transformar uma pista em certeza."
                  : pendingPackage === "hand-function-vs-range"
                    ? "O próximo bloco treina como a leitura do range muda a função da sua mão e o objetivo da decisão."
                  : pendingPackage === "integrated-application"
                    ? "O próximo bloco coloca os conceitos anteriores em novas situações: a linha atualiza o range, o objetivo define as mãos-alvo e a evidência define quanto podemos confiar na leitura."
                  : focusState === "Precisa de reforço"
                  ? "Este foi o ponto mais instável nas tentativas recentes, então ele recebe prioridade na sessão."
                  : "O motor prioriza habilidades com menos evidência ou menor consistência e volta a elas em contextos diferentes."}
          </p>
        </article>

        <article className="panel">
          <div className="eyebrow">SEU MOMENTO</div>
          <div className="status-list">
            <div><span>{skillLabels[focus]}</span><strong>{focusState}</strong></div>
            <div><span>{skillLabels[secondary]}</span><strong>{secondaryState}</strong></div>
          </div>
        </article>
      </section>}

      {!hasOpenTraining && nextAction.kind !== "recommended-training" && <section className="two-column">
        <article className="panel">
          <div className="eyebrow">TREINO RECOMENDADO</div>
          <h2>{skillLabels[focus]}</h2>
          <p>Disponível quando quiser iniciar uma nova sessão.</p>
          <Link href={`/session?focus=${focus}`} className="quiet-link">Ver treino</Link>
        </article>
      </section>}
    </AppShell>
  );
}
