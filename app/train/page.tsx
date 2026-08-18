"use client";

import Link from "next/link";
import { AppShell } from "../components/AppShell";
import { skillLabels } from "@/lib/trainingEngine";
import type { Skill } from "@/lib/types";

const skills = Object.entries(skillLabels) as [Skill, string][];

export default function TrainPage() {
  return (
    <AppShell>
      <section className="page-heading">
        <div className="eyebrow">TREINAR</div>
        <h1>O Poker Loop recomenda. Você também pode escolher.</h1>
        <p className="lead">A sessão recomendada continua sendo o caminho principal.</p>
      </section>

      <article className="panel featured-panel">
        <div>
          <div className="eyebrow">RECOMENDADO</div>
          <h2>Treino adaptativo</h2>
          <p>12 decisões misturando leitura de board, ranges, sizing e decisão integrada.</p>
        </div>
        <Link href="/session" className="primary-cta compact">Começar</Link>
      </article>

      <section className="section-block">
        <div className="eyebrow">POR HABILIDADE</div>
        <div className="skill-grid">
          {skills.map(([skill, label]) => (
            <Link className="skill-card" href={`/session?focus=${skill}`} key={skill}>
              <span>{label}</span>
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
