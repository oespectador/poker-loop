"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "./components/AppShell";
import { chooseFocus, deriveSkillState, getPendingLearningPackage, skillLabels } from "@/lib/trainingEngine";
import { readAttempts } from "@/lib/storage";
import type { Attempt, Skill } from "@/lib/types";

export default function TodayPage() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);

  useEffect(() => {
    setAttempts(readAttempts());
  }, []);

  const focus = useMemo(() => chooseFocus(attempts), [attempts]);
  const secondary: Skill = focus === "range-reading" ? "board-reading" : "range-reading";
  const focusState = deriveSkillState(attempts, focus);
  const secondaryState = deriveSkillState(attempts, secondary);
  const pendingPackage = attempts.length > 0 ? getPendingLearningPackage(attempts) : undefined;

  return (
    <AppShell>
      <section className="hero-grid">
        <div className="eyebrow">TREINO DE HOJE</div>
        <h1>Uma sessão curta. Um foco claro.</h1>
        <p className="lead">12 decisões · ~10 min</p>

        <div className="focus-row" aria-label="Foco recomendado">
          <span className="focus-chip">{skillLabels[focus]}</span>
          <span className="focus-chip muted">{skillLabels[secondary]}</span>
        </div>

        <Link href={`/session?focus=${focus}`} className="primary-cta">Começar treino</Link>
        <Link href="/train" className="quiet-link">Ajustar treino</Link>
        <Link href="/hands" className="quiet-link">Revisar uma mão real</Link>
      </section>

      <section className="two-column">
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
      </section>
    </AppShell>
  );
}
