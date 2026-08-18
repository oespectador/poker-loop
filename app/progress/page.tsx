"use client";

import { useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { clearPrototypeProgress, readAttempts } from "@/lib/storage";
import { deriveSkillState, skillLabels, summarizeSkill } from "@/lib/trainingEngine";
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
        <div className="eyebrow">AINDA NÃO MEDIDO</div>
        <h2>Transferência e retenção</h2>
        <p>Os itens reservados continuam fora do treino normal. O motor adaptativo usa apenas exercícios de desenvolvimento; transferência e retenção serão avaliadas separadamente para não contaminar a medida.</p>
      </article>

      {attempts.length > 0 && (
        <button className="danger-quiet" type="button" onClick={reset}>Limpar progresso deste protótipo</button>
      )}
    </AppShell>
  );
}
