import { allExercises } from "./exercises";
import { buildRecommendedSession } from "./trainingEngine";
import type { ActiveTrainingSession, Attempt, Exercise, Skill } from "./types";

const exerciseById = new Map(allExercises.map((exercise) => [exercise.id, exercise]));

export function serializeQueue(queue: Exercise[]) {
  return queue.map(({ id: exerciseId, support, sessionRole }) => ({
    exerciseId,
    support,
    ...(sessionRole ? { sessionRole } : {}),
  }));
}

export function restoreQueue(session: ActiveTrainingSession): Exercise[] | null {
  const queue = session.items.map((item) => {
    const exercise = exerciseById.get(item.exerciseId);
    return exercise ? { ...exercise, support: item.support, ...(item.sessionRole ? { sessionRole: item.sessionRole } : {}) } : null;
  });
  return queue.every((item): item is Exercise => item !== null) ? queue : null;
}

export function createTrainingSession(
  history: Attempt[],
  focus: Skill | undefined,
  sessionId: string,
  startedAt = new Date().toISOString(),
): { active: ActiveTrainingSession; queue: Exercise[]; attempts: Attempt[] } {
  const queue = buildRecommendedSession(history, focus, sessionId);
  return {
    active: { version: 1, sessionId, startedAt, focus: focus ?? null, items: serializeQueue(queue), nextIndex: 0 },
    queue,
    attempts: [],
  };
}

export function resumeTrainingSession(
  active: ActiveTrainingSession | null,
  history: Attempt[],
  focus: Skill | undefined,
): { active: ActiveTrainingSession; queue: Exercise[]; attempts: Attempt[] } | null {
  if (!active || active.focus !== (focus ?? null)) return null;
  const queue = restoreQueue(active);
  if (!queue) return null;
  return { active, queue, attempts: history.filter((attempt) => attempt.sessionId === active.sessionId) };
}

export function updateActiveSession(active: ActiveTrainingSession, queue: Exercise[], nextIndex: number): ActiveTrainingSession {
  return { ...active, items: serializeQueue(queue), nextIndex };
}
