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

export interface DifficultyRecovery {
  key: string;
  source: DifficultyPatternSource;
  recoveredAt: string;
}

export interface RecoveryVerification extends DifficultyRecovery {
  retention: { answered: number; correct: number };
  transfer: { answered: number; correct: number };
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

interface DifficultyAnalysis {
  activeEvidence: KeyedAttempt[];
  recoveries: DifficultyRecovery[];
}

/**
 * Retorna somente a evidência posterior à última recuperação confirmada.
 * A janela é derivada do histórico elegível e não remove nenhuma Attempt.
 */
function analyzeDifficultyGroup(group: KeyedAttempt[]): DifficultyAnalysis {
  let recoveryEnd = -1;
  let previousBoundary = -1;
  const recoveries: DifficultyRecovery[] = [];

  for (let index = 2; index < group.length; index += 1) {
    const window = group.slice(index - 2, index + 1);
    if (
      window.every(({ attempt }) => attempt.correct) &&
      new Set(window.map(({ attempt }) => attempt.exerciseId)).size >= 2
    ) {
      const episodeBeforeBoundary = group.slice(previousBoundary + 1, index - 2);
      const errors = episodeBeforeBoundary.filter(({ attempt }) => !attempt.correct);
      if (
        errors.length >= 3 &&
        new Set(errors.map(({ attempt }) => attempt.exerciseId)).size >= 3 &&
        new Set(errors.map(({ attempt }) => attempt.sessionId)).size >= 2
      ) {
        recoveries.push({
          key: group[index].key,
          source: group[index].source,
          recoveredAt: group[index].attempt.timestamp,
        });
      }
      recoveryEnd = index;
      previousBoundary = index;
    }
  }

  return { activeEvidence: group.slice(recoveryEnd + 1), recoveries };
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

/** Compara somente a identidade causal, inclusive para itens de avaliação. */
export function matchesDifficultyIdentity(
  exercise: DiagnosticExercise,
  identity: Pick<DifficultyRecovery, "key" | "source">,
): boolean {
  if (identity.source === "reasoningPattern") {
    return exercise.reasoningPattern === identity.key;
  }
  return !exercise.reasoningPattern && exercise.concept === identity.key;
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
  const groups = groupedDevelopmentAttempts(attempts, exercises);

  const patterns: DifficultyPattern[] = [];

  for (const group of groups.values()) {
    const { activeEvidence } = analyzeDifficultyGroup(group);
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

function groupedDevelopmentAttempts(
  attempts: Attempt[],
  exercises: readonly DiagnosticExercise[],
): Map<string, KeyedAttempt[]> {
  const exerciseById = new Map(exercises.map((exercise) => [exercise.id, exercise]));
  const groups = new Map<string, KeyedAttempt[]>();
  for (const attempt of attempts) {
    const exercise = exerciseById.get(attempt.exerciseId);
    if (attempt.support !== "independent" || exercise?.purpose !== "development") continue;
    const source: DifficultyPatternSource | undefined = exercise.reasoningPattern
      ? "reasoningPattern"
      : exercise.concept ? "concept" : undefined;
    const key = source === "reasoningPattern" ? exercise.reasoningPattern : exercise?.concept;
    if (!source || !key) continue;
    const id = `${source}:${key}`;
    groups.set(id, [...(groups.get(id) ?? []), { attempt, key, source }]);
  }
  for (const group of groups.values()) group.sort((a, b) => chronological(a.attempt, b.attempt));
  return groups;
}

/** Retorna a recuperação qualificada mais recente de cada identidade diagnóstica. */
export function summarizeDifficultyRecoveries(
  attempts: Attempt[],
  exercises: readonly DiagnosticExercise[] = allExercises,
): DifficultyRecovery[] {
  const result: DifficultyRecovery[] = [];
  for (const group of groupedDevelopmentAttempts(attempts, exercises).values()) {
    const latest = analyzeDifficultyGroup(group).recoveries.at(-1);
    if (latest) result.push(latest);
  }
  return result.sort((a, b) => Date.parse(b.recoveredAt) - Date.parse(a.recoveredAt) || a.key.localeCompare(b.key));
}

/** Observações one-shot respondidas depois da recuperação qualificada mais recente. */
export function summarizeRecoveryVerification(
  attempts: Attempt[],
  exercises: readonly DiagnosticExercise[] = allExercises,
): RecoveryVerification[] {
  const byId = new Map(exercises.map((exercise) => [exercise.id, exercise]));
  return summarizeDifficultyRecoveries(attempts, exercises).map((recovery) => {
    const summary: RecoveryVerification = {
      ...recovery,
      retention: { answered: 0, correct: 0 },
      transfer: { answered: 0, correct: 0 },
    };
    for (const attempt of attempts) {
      const exercise = byId.get(attempt.exerciseId);
      if (!exercise || (exercise.purpose !== "retention" && exercise.purpose !== "transfer")) continue;
      if (timestampValue(attempt.timestamp) <= timestampValue(recovery.recoveredAt)) continue;
      if (!matchesDifficultyIdentity(exercise, recovery)) continue;
      summary[exercise.purpose].answered += 1;
      if (attempt.correct) summary[exercise.purpose].correct += 1;
    }
    return summary;
  });
}
