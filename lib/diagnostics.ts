import { allExercises } from "./exercises";
import type { Attempt, Exercise } from "./types";

export type DifficultyPatternSource = "reasoningPattern" | "concept";
export type DifficultyPatternStatus = "candidate" | "recurring";

export interface DifficultyPattern {
  key: string;
  source: DifficultyPatternSource;
  status: DifficultyPatternStatus;
  attempts: number;
  errors: number;
  distinctExercises: number;
  sessions: number;
  recentErrors: number;
  lastAttemptAt: string;
}

export type DiagnosticExercise = Pick<
  Exercise,
  "id" | "purpose" | "reasoningPattern" | "concept"
>;

interface KeyedAttempt {
  attempt: Attempt;
  key: string;
  source: DifficultyPatternSource;
}

function chronological(a: Attempt, b: Attempt): number {
  const timestampDifference = Date.parse(a.timestamp) - Date.parse(b.timestamp);
  return timestampDifference || a.id.localeCompare(b.id);
}

/**
 * Detecta sinais conservadores de dificuldade no histórico já existente.
 * Os limiares e a regra de recuperação são heurísticas provisórias do protótipo,
 * não diagnósticos causais nem evidência psicométrica de domínio.
 */
export function summarizeDifficultyPatterns(
  attempts: Attempt[],
  exercises: readonly DiagnosticExercise[] = allExercises,
): DifficultyPattern[] {
  const exerciseById = new Map(exercises.map((exercise) => [exercise.id, exercise]));
  const groups = new Map<string, KeyedAttempt[]>();

  for (const attempt of attempts) {
    const exercise = exerciseById.get(attempt.exerciseId);
    if (attempt.support !== "independent" || exercise?.purpose !== "development") continue;

    const source: DifficultyPatternSource | undefined = exercise.reasoningPattern
      ? "reasoningPattern"
      : exercise.concept
        ? "concept"
        : undefined;
    if (!source) continue;

    const key = source === "reasoningPattern" ? exercise.reasoningPattern : exercise.concept;
    if (!key) continue;

    const groupId = `${source}:${key}`;
    const group = groups.get(groupId) ?? [];
    group.push({ attempt, key, source });
    groups.set(groupId, group);
  }

  const patterns: DifficultyPattern[] = [];

  for (const group of groups.values()) {
    group.sort((a, b) => chronological(a.attempt, b.attempt));
    const recent = group.slice(-3);
    const recoveredForNow =
      recent.length === 3 &&
      recent.every(({ attempt }) => attempt.correct) &&
      new Set(recent.map(({ attempt }) => attempt.exerciseId)).size >= 2;
    if (recoveredForNow) continue;

    const errors = group.filter(({ attempt }) => !attempt.correct);
    const distinctExercises = new Set(errors.map(({ attempt }) => attempt.exerciseId)).size;
    const sessions = new Set(errors.map(({ attempt }) => attempt.sessionId)).size;
    if (errors.length < 2 || distinctExercises < 2 || sessions < 2) continue;

    const recurring = errors.length >= 3 && distinctExercises >= 3 && sessions >= 2;
    const last = group[group.length - 1];
    patterns.push({
      key: last.key,
      source: last.source,
      status: recurring ? "recurring" : "candidate",
      attempts: group.length,
      errors: errors.length,
      distinctExercises,
      sessions,
      recentErrors: recent.filter(({ attempt }) => !attempt.correct).length,
      lastAttemptAt: last.attempt.timestamp,
    });
  }

  return patterns.sort((a, b) => {
    if (a.status !== b.status) return a.status === "recurring" ? -1 : 1;
    return (
      b.recentErrors - a.recentErrors ||
      Date.parse(b.lastAttemptAt) - Date.parse(a.lastAttemptAt) ||
      a.key.localeCompare(b.key) ||
      a.source.localeCompare(b.source)
    );
  });
}
