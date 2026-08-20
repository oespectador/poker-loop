export type ExercisePurpose = "development" | "transfer" | "retention";
export type SupportLevel = "guided" | "supported" | "independent";
export type LearningPackage =
  | "foundations"
  | "range-actions"
  | "range-to-decision"
  | "calibration"
  | "integrated-application"
  | "range-strength-signals";

export type Skill =
  | "board-reading"
  | "range-reading"
  | "sizing"
  | "integrated-decision";

export type SkillState =
  | "Ainda observando"
  | "Aprendendo"
  | "Em desenvolvimento"
  | "Consistente"
  | "Precisa de reforço";

export interface ExerciseOption {
  id: string;
  label: string;
}

export interface Spot {
  label: string;
  pot: string;
  stack: string;
  hero: string;
  street?: string;
  board?: string[];
  action?: string[];
}

export interface Exercise {
  id: string;
  purpose: ExercisePurpose;
  primarySkill: Skill;
  support: SupportLevel;
  title?: string;
  spot: Spot;
  prompt: string;
  options: ExerciseOption[];
  correctOptionId: string;
  feedback: {
    short: string;
    expanded?: string;
    misconception?: Record<string, string>;
  };
  sourceKind: "theory" | "solver-reference" | "heuristic" | "exploit";
  variantGroup?: string;
  learningPackage?: LearningPackage;
  packageSequence?: number;
  concept?: string;
  subconcept?: string;
  reasoningPattern?: string;
  supportNote?: string;
  sessionRole?: "introduction";
}

export interface Attempt {
  id: string;
  exerciseId: string;
  sessionId: string;
  primarySkill: Skill;
  answerId: string;
  correct: boolean;
  support: SupportLevel;
  hintUsed?: boolean;
  timestamp: string;
}

export interface ActiveTrainingSessionItem {
  exerciseId: string;
  support: SupportLevel;
  sessionRole?: "introduction";
}

export interface ActiveTrainingSession {
  version: 1;
  sessionId: string;
  startedAt: string;
  focus: Skill | null;
  items: ActiveTrainingSessionItem[];
  /** Index of the next decision that has not yet produced an Attempt. */
  nextIndex: number;
}

export interface SessionResult {
  id: string;
  startedAt: string;
  completedAt: string;
  attempts: Attempt[];
}
