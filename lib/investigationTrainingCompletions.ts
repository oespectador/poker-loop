import { isInvestigationTrainingLaunch, type InvestigationTrainingLaunch } from "./investigationTrainingLaunches";
import type { ActiveTrainingSession, Attempt } from "./types";

export const INVESTIGATION_TRAINING_COMPLETIONS_KEY = "poker-loop-v1:investigation-training-completions";

export interface InvestigationTrainingCompletion {
  version: 1;
  sessionId: string;
  completedAt: string;
}

export type InvestigationTrainingCompletionRegistration = "created" | "idempotent" | "conflict" | "invalid";

function validTimestamp(value: unknown): value is string {
  return typeof value === "string" && Boolean(value) && Number.isFinite(Date.parse(value));
}

export function isInvestigationTrainingCompletion(value: unknown): value is InvestigationTrainingCompletion {
  if (!value || typeof value !== "object") return false;
  const completion = value as Record<string, unknown>;
  return completion.version === 1 && typeof completion.sessionId === "string" && Boolean(completion.sessionId.trim()) && validTimestamp(completion.completedAt);
}

function newestFirst(a: InvestigationTrainingCompletion, b: InvestigationTrainingCompletion): number {
  return Date.parse(b.completedAt) - Date.parse(a.completedAt) || a.sessionId.localeCompare(b.sessionId);
}

export function parseInvestigationTrainingCompletions(raw: string | null): InvestigationTrainingCompletion[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isInvestigationTrainingCompletion).sort(newestFirst) : [];
  } catch { return []; }
}

export function readInvestigationTrainingCompletions(): InvestigationTrainingCompletion[] {
  if (typeof window === "undefined") return [];
  return parseInvestigationTrainingCompletions(window.localStorage.getItem(INVESTIGATION_TRAINING_COMPLETIONS_KEY));
}

export function findInvestigationTrainingCompletionBySessionId(completions: readonly InvestigationTrainingCompletion[], sessionId: string) {
  return completions.find((completion) => completion.sessionId === sessionId);
}

/** The persisted queue, rather than an Attempt count, is the authority for this boundary. */
export function isTrainingSessionOperationallyComplete(session: ActiveTrainingSession): boolean {
  return Array.isArray(session.items) && session.items.length > 0 && Number.isInteger(session.nextIndex) && session.nextIndex >= session.items.length;
}

/** Uses Attempts only to date an already-complete session; they never establish completion. */
export function completionForFinishedLaunchedSession(
  session: ActiveTrainingSession,
  launch: InvestigationTrainingLaunch | undefined,
  attempts: readonly Attempt[],
): InvestigationTrainingCompletion | null {
  if (!launch || !isInvestigationTrainingLaunch(launch) || launch.sessionId !== session.sessionId || !session.focus || session.focus !== launch.skill || !isTrainingSessionOperationallyComplete(session)) return null;
  const timestamps = attempts
    .filter((attempt) => attempt.sessionId === session.sessionId && validTimestamp(attempt.timestamp))
    .map((attempt) => attempt.timestamp)
    .sort((a, b) => Date.parse(b) - Date.parse(a));
  const completedAt = timestamps[0];
  if (!completedAt || Date.parse(completedAt) < Date.parse(launch.launchedAt)) return null;
  return { version: 1, sessionId: session.sessionId, completedAt };
}

export function registerInvestigationTrainingCompletion(completion: InvestigationTrainingCompletion): InvestigationTrainingCompletionRegistration {
  if (!isInvestigationTrainingCompletion(completion) || typeof window === "undefined") return "invalid";
  const completions = readInvestigationTrainingCompletions();
  const existing = findInvestigationTrainingCompletionBySessionId(completions, completion.sessionId);
  if (existing) return JSON.stringify(existing) === JSON.stringify(completion) ? "idempotent" : "conflict";
  window.localStorage.setItem(INVESTIGATION_TRAINING_COMPLETIONS_KEY, JSON.stringify([...completions, completion].sort(newestFirst)));
  return "created";
}

export function listInvestigationTrainingCompletionsForEpisode(
  completions: readonly InvestigationTrainingCompletion[],
  launches: readonly InvestigationTrainingLaunch[],
  episodeId: string,
) {
  const sessionIds = new Set(launches.filter((launch) => launch.episodeId === episodeId).map((launch) => launch.sessionId));
  return completions.filter((completion) => sessionIds.has(completion.sessionId)).sort(newestFirst);
}
