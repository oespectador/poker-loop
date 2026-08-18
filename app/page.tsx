"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "./components/AppShell";
import { chooseFocus, deriveSkillState, hasUnseenRangeActionPackage, hasUnseenRangeToDecisionPackage, skillLabels } from "@/lib/trainingEngine";
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
  const rangePackagePending = attempts.length > 0 && hasUnseenRangeActionPackage(attempts);
  const decisionPackagePending = attempts.length > 0 && !rangePackagePending && hasUnseenRangeToDecisionPackage(attempts);

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
      </section>

      <section className="two-column">
        <article className="panel">
          <div className="eyebrow">POR QUE HOJE?</div>
          <h2>{skillLabels[focus]}</h2>
          <p>
            {attempts.length === 0
              ? "Ainda não temos evidência suficiente. Este primeiro treino começa a calibrar o que o app precisa observar."
              : rangePackagePending
                ? "Há um bloco de leitura de range ainda sem evidência suficiente. Ele entra em microblocos curtos, misturado a revisões do que você já treinou."
                : decisionPackagePending
                  ? "O próximo bloco conecta leitura de range a objetivo, mãos-alvo e sizing. Ele entra em microblocos curtos sem antecipar conceitos futuros."
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
