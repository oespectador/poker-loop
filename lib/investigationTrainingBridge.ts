import { realHandSkillLabels } from "./realHands";
import type { RealHandInvestigationCompletion } from "./realHandInvestigationHistory";
import type { Skill } from "./types";

export interface InvestigationTrainingSkillOption {
  skill: Skill;
  label: string;
}

export const investigationTrainingSkillOptions: readonly InvestigationTrainingSkillOption[] =
  (Object.entries(realHandSkillLabels) as [Skill, string][]).map(([skill, label]) => ({ skill, label }));

export function canExploreInvestigationInTraining(completion: RealHandInvestigationCompletion): boolean {
  return completion === "completed";
}

export function investigationTrainingLink(episodeId: string, skill?: Skill): string | undefined {
  return skill && episodeId ? `/session?focus=${skill}&investigation=${encodeURIComponent(episodeId)}` : undefined;
}
