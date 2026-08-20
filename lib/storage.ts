import { allExercises } from "./exercises";
import type { ActiveTrainingSession, Attempt, Skill, SupportLevel } from "./types";

const ATTEMPTS_KEY = "poker-loop-v1:attempts";
export const ACTIVE_SESSION_KEY = "poker-loop-v1:active-session";

const skills = new Set<Skill>(["board-reading", "range-reading", "sizing", "integrated-decision"]);
const supportLevels = new Set<SupportLevel>(["guided", "supported", "independent"]);
const exerciseIds = new Set(allExercises.map(({ id }) => id));

export function isActiveTrainingSession(value: unknown): value is ActiveTrainingSession {
  if (!value || typeof value !== "object") return false;
  const session = value as Record<string, unknown>;
  if (session.version !== 1 || typeof session.sessionId !== "string" || !session.sessionId.trim()) return false;
  if (typeof session.startedAt !== "string" || !session.startedAt || !Number.isFinite(Date.parse(session.startedAt))) return false;
  if (session.focus !== null && !skills.has(session.focus as Skill)) return false;
  if (!Array.isArray(session.items) || session.items.length === 0) return false;
  if (!Number.isInteger(session.nextIndex) || (session.nextIndex as number) < 0 || (session.nextIndex as number) > session.items.length) return false;
  return session.items.every((value) => {
    if (!value || typeof value !== "object") return false;
    const item = value as Record<string, unknown>;
    return typeof item.exerciseId === "string" && exerciseIds.has(item.exerciseId) &&
      supportLevels.has(item.support as SupportLevel) &&
      (item.sessionRole === undefined || item.sessionRole === "introduction");
  });
}

export function readActiveTrainingSession(): ActiveTrainingSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ACTIVE_SESSION_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isActiveTrainingSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeActiveTrainingSession(session: ActiveTrainingSession): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
}

export function clearActiveTrainingSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACTIVE_SESSION_KEY);
}

export function readAttempts(): Attempt[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ATTEMPTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function appendAttempts(next: Attempt[]): void {
  if (typeof window === "undefined" || next.length === 0) return;
  const current = readAttempts();
  window.localStorage.setItem(ATTEMPTS_KEY, JSON.stringify([...current, ...next]));
}

export function clearPrototypeProgress(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ATTEMPTS_KEY);
  window.localStorage.removeItem(ACTIVE_SESSION_KEY);
}
