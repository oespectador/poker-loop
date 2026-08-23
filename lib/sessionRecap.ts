import { learningLoopLabelIfKnown } from "./learningLoop";
import { skillLabels } from "./trainingEngine";
import type { Attempt, Exercise } from "./types";

export interface SessionRecapItem {
  id: string;
  label: string;
  wrongCount: number;
  feedback: string;
  lastWrongAt: string;
  laterCorrectInSession: boolean;
}

export interface SessionRecap {
  items: SessionRecapItem[];
  totalWrongAttempts: number;
  distinctReasoningItems: number;
}

export interface ExerciseReasoningIdentity {
  id: string;
  label: string;
}

export function exerciseReasoningIdentity(exercise: Exercise): ExerciseReasoningIdentity {
  if (exercise.reasoningPattern) {
    return {
      id: `reasoningPattern:${exercise.reasoningPattern}`,
      label: learningLoopLabelIfKnown("reasoningPattern", exercise.reasoningPattern)
        ?? `Rever: ${skillLabels[exercise.primarySkill]}`,
    };
  }
  if (exercise.concept) {
    return {
      id: `concept:${exercise.concept}`,
      label: learningLoopLabelIfKnown("concept", exercise.concept)
        ?? `Rever: ${skillLabels[exercise.primarySkill]}`,
    };
  }
  return {
    id: `primarySkill:${exercise.primarySkill}`,
    label: `Rever: ${skillLabels[exercise.primarySkill]}`,
  };
}

export function attemptFeedback(attempt: Attempt, exercise: Exercise): string {
  return exercise.feedback.misconception?.[attempt.answerId] ?? exercise.feedback.short;
}

export function buildSessionRecap(
  sessionId: string,
  attempts: readonly Attempt[],
  exercises: readonly Exercise[],
): SessionRecap {
  const exerciseById = new Map(exercises.map((exercise) => [exercise.id, exercise]));
  const sessionAttempts = attempts.filter((attempt) => attempt.sessionId === sessionId);
  const groups = new Map<string, SessionRecapItem>();

  for (const attempt of sessionAttempts) {
    if (attempt.correct) continue;
    const exercise = exerciseById.get(attempt.exerciseId);
    if (!exercise) continue;
    const identity = exerciseReasoningIdentity(exercise);
    const current = groups.get(identity.id);
    if (!current) {
      groups.set(identity.id, {
        ...identity,
        wrongCount: 1,
        feedback: attemptFeedback(attempt, exercise),
        lastWrongAt: attempt.timestamp,
        laterCorrectInSession: false,
      });
      continue;
    }
    current.wrongCount += 1;
    if (attempt.timestamp > current.lastWrongAt) {
      current.feedback = attemptFeedback(attempt, exercise);
      current.lastWrongAt = attempt.timestamp;
    }
  }

  for (const attempt of sessionAttempts) {
    if (!attempt.correct) continue;
    const exercise = exerciseById.get(attempt.exerciseId);
    if (!exercise) continue;
    const item = groups.get(exerciseReasoningIdentity(exercise).id);
    if (item && attempt.timestamp > item.lastWrongAt) item.laterCorrectInSession = true;
  }

  const items = [...groups.values()].sort((a, b) =>
    Number(a.laterCorrectInSession) - Number(b.laterCorrectInSession)
      || b.lastWrongAt.localeCompare(a.lastWrongAt)
      || a.id.localeCompare(b.id),
  );

  return {
    items,
    totalWrongAttempts: items.reduce((total, item) => total + item.wrongCount, 0),
    distinctReasoningItems: items.length,
  };
}
