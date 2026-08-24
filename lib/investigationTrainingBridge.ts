import { realHandSkillLabels } from "./realHands";
import type { RealHandInvestigationCompletion } from "./realHandInvestigationHistory";
import type { ReasoningFactor, Skill } from "./types";

export interface InvestigationTrainingSkillOption {
  skill: Skill;
  label: string;
}

export interface InvestigationTrainingSuggestion extends InvestigationTrainingSkillOption {
  reason: string;
  priority: "primary" | "secondary";
}

export const investigationTrainingSkillOptions: readonly InvestigationTrainingSkillOption[] =
  (Object.entries(realHandSkillLabels) as [Skill, string][]).map(([skill, label]) => ({ skill, label }));

// Este mapa é editorial e estático: ele ordena caminhos possíveis de estudo, não
// faz inferência estatística, diagnóstico ou atribuição causal. As sugestões não
// são evidência de domínio, não alteram SkillState e nunca iniciam uma sessão.
const editorialSuggestions: Readonly<Partial<Record<ReasoningFactor, readonly InvestigationTrainingSuggestion[]>>> = {
  size: [
    { skill: "sizing", label: realHandSkillLabels.sizing, reason: "Explore como o tamanho escolhido muda quais mãos continuam na decisão.", priority: "primary" },
    { skill: "integrated-decision", label: realHandSkillLabels["integrated-decision"], reason: "Observe como tamanho, board, ranges e objetivo se combinam na decisão.", priority: "secondary" },
  ],
  board: [
    { skill: "board-reading", label: realHandSkillLabels["board-reading"], reason: "Pratique quais características do board mudam a distribuição das mãos.", priority: "primary" },
    { skill: "integrated-decision", label: realHandSkillLabels["integrated-decision"], reason: "Observe como board, ranges, tamanho e objetivo se combinam na decisão.", priority: "secondary" },
  ],
  "previous-actions": [
    { skill: "range-reading", label: realHandSkillLabels["range-reading"], reason: "Use as ações anteriores para construir quais mãos ainda fazem sentido no range.", priority: "primary" },
    { skill: "integrated-decision", label: realHandSkillLabels["integrated-decision"], reason: "Observe como ações anteriores se combinam com board, tamanho e objetivo.", priority: "secondary" },
  ],
  configuration: [
    { skill: "range-reading", label: realHandSkillLabels["range-reading"], reason: "Explore como posição e configuração alteram os ranges plausíveis.", priority: "primary" },
    { skill: "integrated-decision", label: realHandSkillLabels["integrated-decision"], reason: "Observe como configuração, board, tamanho e objetivo se combinam na decisão.", priority: "secondary" },
  ],
  "player-read": [
    { skill: "range-reading", label: realHandSkillLabels["range-reading"], reason: "Pratique como uma leitura do jogador muda o range que você atribui a ele.", priority: "primary" },
    { skill: "integrated-decision", label: realHandSkillLabels["integrated-decision"], reason: "Observe como a leitura do jogador interage com os demais elementos da decisão.", priority: "secondary" },
  ],
};

export function getInvestigationTrainingSuggestions(factor: ReasoningFactor): readonly InvestigationTrainingSuggestion[] {
  return editorialSuggestions[factor] ?? [];
}

export function getOtherInvestigationTrainingSkillOptions(factor: ReasoningFactor): readonly InvestigationTrainingSkillOption[] {
  const suggested = new Set(getInvestigationTrainingSuggestions(factor).map(({ skill }) => skill));
  return investigationTrainingSkillOptions.filter(({ skill }) => !suggested.has(skill));
}

export function canExploreInvestigationInTraining(completion: RealHandInvestigationCompletion): boolean {
  return completion === "completed";
}

export function investigationTrainingLink(episodeId: string, skill?: Skill): string | undefined {
  return skill && episodeId ? `/session?focus=${skill}&investigation=${encodeURIComponent(episodeId)}` : undefined;
}
