import { allExercises, developmentExercises } from "./exercises";
import type { Attempt, Exercise, Skill } from "./types";

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

/**
 * Retorna somente a evidência posterior à última recuperação confirmada.
 * A janela é derivada do histórico elegível e não remove nenhuma Attempt.
 */
function activeEvidenceSinceRecovery(group: KeyedAttempt[]): KeyedAttempt[] {
  let recoveryEnd = -1;

  for (let index = 2; index < group.length; index += 1) {
    const window = group.slice(index - 2, index + 1);
    if (
      window.every(({ attempt }) => attempt.correct) &&
      new Set(window.map(({ attempt }) => attempt.exerciseId)).size >= 2
    ) {
      recoveryEnd = index;
    }
  }

  return group.slice(recoveryEnd + 1);
}

/** Mantém exatamente a chave exclusiva usada pela análise da V0.7. */
export function matchesDifficultyPattern(
  exercise: DiagnosticExercise,
  pattern: Pick<DifficultyPattern, "key" | "source">,
): boolean {
  if (exercise.purpose !== "development") return false;
  if (pattern.source === "reasoningPattern") {
    return exercise.reasoningPattern === pattern.key;
  }
  return !exercise.reasoningPattern && exercise.concept === pattern.key;
}

function timestampValue(value: string): number {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Reserva, no máximo, uma superfície development para o primeiro sinal
 * recurring compatível com o foco já resolvido pelo motor.
 */
export function selectDiagnosticReinforcement(
  attempts: Attempt[],
  focus: Skill,
  exercises: readonly Exercise[] = developmentExercises,
): Exercise | undefined {
  const patterns = summarizeDifficultyPatterns(attempts, exercises);

  for (const pattern of patterns) {
    if (pattern.status !== "recurring") continue;

    const patternExercises = exercises.filter((exercise) =>
      matchesDifficultyPattern(exercise, pattern),
    );
    const related = patternExercises.filter((exercise) => exercise.primarySkill === focus);
    if (!related.length) continue;

    const patternIds = new Set(patternExercises.map(({ id }) => id));
    const relatedIds = new Set(related.map(({ id }) => id));
    const patternAttempts = attempts
      .filter(
        (attempt) =>
          attempt.support === "independent" && patternIds.has(attempt.exerciseId),
      )
      .sort(chronological);
    const mostRecentId = patternAttempts.at(-1)?.exerciseId;
    const candidates =
      mostRecentId && related.length > 1
        ? related.filter(({ id }) => id !== mostRecentId)
        : related;

    const latestByExercise = new Map<string, number>();
    for (const attempt of attempts) {
      if (!relatedIds.has(attempt.exerciseId)) continue;
      latestByExercise.set(
        attempt.exerciseId,
        Math.max(latestByExercise.get(attempt.exerciseId) ?? 0, timestampValue(attempt.timestamp)),
      );
    }

    return candidates
      .map((exercise, libraryIndex) => ({
        exercise,
        libraryIndex,
        latestAt: latestByExercise.get(exercise.id) ?? Number.NEGATIVE_INFINITY,
      }))
      .sort((a, b) => a.latestAt - b.latestAt || a.libraryIndex - b.libraryIndex)[0]?.exercise;
  }

  return undefined;
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
    const activeEvidence = activeEvidenceSinceRecovery(group);
    const recent = activeEvidence.slice(-3);

    const errors = activeEvidence.filter(({ attempt }) => !attempt.correct);
    const distinctExercises = new Set(errors.map(({ attempt }) => attempt.exerciseId)).size;
    const sessions = new Set(errors.map(({ attempt }) => attempt.sessionId)).size;
    if (errors.length < 2 || distinctExercises < 2 || sessions < 2) continue;

    const recurring = errors.length >= 3 && distinctExercises >= 3 && sessions >= 2;
    const last = activeEvidence[activeEvidence.length - 1];
    patterns.push({
      key: last.key,
      source: last.source,
      status: recurring ? "recurring" : "candidate",
      attempts: activeEvidence.length,
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
