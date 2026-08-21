export type ExercisePurpose = "development" | "transfer" | "retention";
export type SupportLevel = "guided" | "supported" | "independent";
export type LearningPackage =
  | "foundations"
  | "range-actions"
  | "range-to-decision"
  | "calibration"
  | "integrated-application"
  | "range-strength-signals"
  | "hand-function-vs-range";

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

export type RealHandStreet = "preflop" | "flop" | "turn" | "river" | "multiple";

/** Context supplied by the player. It is deliberately separate from pedagogical evidence. */
export interface RealHandReview {
  id: string;
  createdAt: string;
  title?: string;
  rawHandText: string;
  street?: RealHandStreet;
  doubt: string;
  rangeRead: string;
  objective: string;
  targetsAndSizeResponse: string;
  trainingFocus?: Skill;
}

export type RealHandReviewInput = Omit<RealHandReview, "id" | "createdAt">;

export type DecisionStreet = "preflop" | "flop" | "turn" | "river";
export type ParsedActionType = "fold" | "check" | "call" | "bet" | "raise";

/** Temporary structural representation; it is never persisted as learning evidence. */
export interface ParsedGgHand {
  sourceHandId: string;
  playedAt: string;
  game: "holdem-no-limit";
  smallBlind: number;
  bigBlind: number;
  tableName?: string;
  maxPlayers?: number;
  buttonSeat?: number;
  heroSeat?: number;
  heroStartingStack?: number;
  heroCards: [string, string];
  flop?: [string, string, string];
  turn?: string;
  river?: string;
  actions: Array<{ actor: string; street: DecisionStreet; type: ParsedActionType; amount?: number; toAmount?: number; allIn?: boolean }>;
  heroDecisionStreets: DecisionStreet[];
  heroDecisionCount: number;
  heroFacedAggressionStreets: DecisionStreet[];
  heroAllIn: boolean;
  heroShows: boolean;
  heroContribution?: number;
  heroCommitmentRatio?: number;
  rawHandText: string;
}

export interface HeroDecisionAnchor {
  id: string;
  street: DecisionStreet;
  sequenceIndex: number;
  action: ParsedActionType;
  amount?: number;
  toAmount?: number;
  allIn?: boolean;
}

export interface HeroDecisionView {
  anchor: HeroDecisionAnchor;
  heroCards: [string, string];
  board: { flop?: [string, string, string]; turn?: string; river?: string };
  actionsThroughDecision: ParsedGgHand["actions"];
}

export type ReasoningFactor = "size" | "board" | "previous-actions" | "configuration" | "player-read" | "automatic" | "other";
export type SelfRatedSupport = "low" | "medium" | "high" | "unclear";

/** A player's self-report, not evidence that the reading was actually supported. */
export interface RealHandReasoningSnapshot {
  id: string;
  handReviewId: string;
  createdAt: string;
  sourceHandId: string;
  sourceDecision: Omit<HeroDecisionAnchor, "id">;
  thought?: string;
  factors: ReasoningFactor[];
  selfRatedSupport?: SelfRatedSupport;
}

/** Read-only compatibility shape for V0.17 records saved before provenance existed. */
export type LegacyRealHandReasoningSnapshot = Omit<RealHandReasoningSnapshot, "sourceHandId"> & { sourceHandId?: undefined };
export type StoredRealHandReasoningSnapshot = RealHandReasoningSnapshot | LegacyRealHandReasoningSnapshot;

export type HandReviewSuggestionReason = "high-commitment" | "river-decision" | "hero-showdown" | "multi-street-pressure" | "long-line";
export interface HandReviewSuggestion {
  id: string;
  source: "gg-pokercraft";
  sourceHandId: string;
  reason: HandReviewSuggestionReason;
  createdAt: string;
  heroCards: [string, string];
  playedAt: string;
  reasonLabel: string;
  reasonMessage: string;
  rawHandText: string;
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
