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

export function investigationTrainingLink(skill?: Skill): string | undefined {
  return skill ? `/session?focus=${skill}` : undefined;
}
