"use client";

import { useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { clearPrototypeProgress, readAttempts } from "@/lib/storage";
import { deriveSkillState, skillLabels, summarizeEvaluationEvidence, summarizeSkill } from "@/lib/trainingEngine";
import type { Attempt, Skill } from "@/lib/types";

const skills = Object.keys(skillLabels) as Skill[];

export default function ProgressPage() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);

  useEffect(() => {
    setAttempts(readAttempts());
  }, []);

  function reset() {
    clearPrototypeProgress();
    setAttempts([]);
  }

  const evaluation = summarizeEvaluationEvidence(attempts);

  return (
    <AppShell>
      <section className="page-heading">
        <div className="eyebrow">PROGRESSO</div>
        <h1>O que já está consistente — e o que ainda precisamos observar.</h1>
        <p className="lead">Sem porcentagens de domínio falsas. O protótipo trabalha com evidência simples e estados qualitativos.</p>
      </section>

      <section className="progress-grid">
        {skills.map((skill) => {
          const state = deriveSkillState(attempts, skill);
          const stats = summarizeSkill(attempts, skill);
          return (
            <article className="progress-card" key={skill}>
              <div>
                <h2>{skillLabels[skill]}</h2>
                <span className={`state state-${state.toLowerCase().replaceAll(" ", "-").normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`}>{state}</span>
              </div>
              <p>{stats.encounters === 0 ? "Ainda sem encontros suficientes." : `${stats.encounters} encontros · ${stats.independentEncounters} sem apoio · ${stats.sessions} ${stats.sessions === 1 ? "sessão" : "sessões"}.`}</p>
            </article>
          );
        })}
      </section>

      <article className="panel note-panel">
        <div className="eyebrow">EVIDÊNCIAS DE AVALIAÇÃO</div>
        <h2>Retenção e transferência</h2>
        <p>Retenção e transferência são observadas separadamente do estado-base das habilidades.</p>
        <div className="status-list">
          <div>
            <strong>RETENÇÃO</strong>
            <span>{evaluation.retention.answered === 0 ? "Ainda sem verificações após intervalo." : `${evaluation.retention.answered} verificações realizadas · ${evaluation.retention.correct} corretas.`}</span>
          </div>
          <div>
            <strong>TRANSFERÊNCIA</strong>
            <span>{evaluation.transfer.answered === 0 ? "Ainda sem verificações em nova superfície." : `${evaluation.transfer.answered} verificações realizadas · ${evaluation.transfer.correct} corretas.`}</span>
          </div>
        </div>
      </article>

      {attempts.length > 0 && (
        <button className="danger-quiet" type="button" onClick={reset}>Limpar progresso deste protótipo</button>
      )}
    </AppShell>
  );
}
