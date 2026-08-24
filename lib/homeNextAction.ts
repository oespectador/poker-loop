import type { ActiveTrainingSession, Skill } from "./types";

export type HomeNextActionKind =
  | "resume-training"
  | "finish-training"
  | "active-tracking"
  | "explore-hands"
  | "recommended-training";

export interface HomeNextAction {
  kind: HomeNextActionKind;
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
}

export interface HomeOperationalState {
  activeTrainingSession: ActiveTrainingSession | null;
  hasActiveInvestigation: boolean;
  hasActiveFollowUp: boolean;
  pendingSuggestionCount: number;
  remainingImportCandidates: number;
  recommendedFocus: Skill;
}

const situations = (count: number) => count === 1 ? "1 situação está" : `${count} situações estão`;

/** Derives one operational next step without reading or writing persisted state. */
export function deriveHomeNextAction(state: HomeOperationalState): HomeNextAction {
  const active = state.activeTrainingSession;
  if (active) {
    const href = active.focus === null ? "/session" : `/session?focus=${active.focus}`;
    if (active.nextIndex < active.items.length) {
      return {
        kind: "resume-training",
        eyebrow: "CONTINUAR DE ONDE PAROU",
        title: "Seu treino ainda está em andamento.",
        description: `${active.nextIndex} de ${active.items.length} decisões concluídas.`,
        ctaLabel: "Continuar treino",
        href,
      };
    }
    return {
      kind: "finish-training",
      eyebrow: "TREINO CONCLUÍDO",
      title: "Seu fechamento está esperando.",
      description: `${active.items.length} de ${active.items.length} decisões concluídas.`,
      ctaLabel: "Ver fechamento",
      href,
    };
  }

  if (state.hasActiveInvestigation || state.hasActiveFollowUp) {
    return {
      kind: "active-tracking",
      eyebrow: "ACOMPANHAMENTO ATIVO",
      title: "Há algo sendo acompanhado nas suas mãos.",
      description: "Continue pelas suas revisões de mãos reais.",
      ctaLabel: "Ver acompanhamento",
      href: "/hands",
    };
  }

  if (state.pendingSuggestionCount > 0) {
    return {
      kind: "explore-hands",
      eyebrow: "SUAS MÃOS",
      title: `${situations(state.pendingSuggestionCount)} esperando sua decisão.`,
      description: "Continue pelas situações separadas para revisão.",
      ctaLabel: "Continuar revisão",
      href: "/hands",
    };
  }

  if (state.remainingImportCandidates > 0) {
    return {
      kind: "explore-hands",
      eyebrow: "SUAS MÃOS",
      title: `${state.remainingImportCandidates} ${state.remainingImportCandidates === 1 ? "outra situação ainda está disponível" : "outras situações ainda estão disponíveis"} no lote.`,
      description: "Continue explorando o lote já importado.",
      ctaLabel: "Continuar explorando",
      href: "/hands",
    };
  }

  return {
    kind: "recommended-training",
    eyebrow: "TREINO DE HOJE",
    title: "Uma sessão curta. Um foco claro.",
    description: "12 decisões · ~10 min",
    ctaLabel: "Começar treino",
    href: `/session?focus=${state.recommendedFocus}`,
  };
}
