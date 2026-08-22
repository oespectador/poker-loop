import { readRealHandInvestigationHistory, type StoredRealHandInvestigationEpisode } from "./realHandInvestigationHistory";
import type { ActiveTrainingSession, Skill } from "./types";

export const INVESTIGATION_TRAINING_LAUNCHES_KEY = "poker-loop-v1:investigation-training-launches";

export interface InvestigationTrainingLaunch {
  version: 1;
  episodeId: string;
  sessionId: string;
  skill: Skill;
  launchedAt: string;
}

export type InvestigationTrainingLaunchRegistration = "created" | "idempotent" | "conflict" | "invalid";
const skills = new Set<Skill>(["board-reading", "range-reading", "sizing", "integrated-decision"]);

export function isInvestigationTrainingLaunch(value: unknown): value is InvestigationTrainingLaunch {
  if (!value || typeof value !== "object") return false;
  const launch = value as Record<string, unknown>;
  return launch.version === 1 && typeof launch.episodeId === "string" && Boolean(launch.episodeId.trim()) &&
    typeof launch.sessionId === "string" && Boolean(launch.sessionId.trim()) && skills.has(launch.skill as Skill) &&
    typeof launch.launchedAt === "string" && Boolean(launch.launchedAt) && Number.isFinite(Date.parse(launch.launchedAt));
}

function newestFirst(a: InvestigationTrainingLaunch, b: InvestigationTrainingLaunch): number {
  return Date.parse(b.launchedAt) - Date.parse(a.launchedAt) || a.sessionId.localeCompare(b.sessionId);
}

export function parseInvestigationTrainingLaunches(raw: string | null): InvestigationTrainingLaunch[] {
  if (!raw) return [];
  try { const parsed: unknown = JSON.parse(raw); return Array.isArray(parsed) ? parsed.filter(isInvestigationTrainingLaunch).sort(newestFirst) : []; }
  catch { return []; }
}

export function readInvestigationTrainingLaunches(): InvestigationTrainingLaunch[] {
  if (typeof window === "undefined") return [];
  return parseInvestigationTrainingLaunches(window.localStorage.getItem(INVESTIGATION_TRAINING_LAUNCHES_KEY));
}

export function findInvestigationTrainingLaunchBySessionId(launches: readonly InvestigationTrainingLaunch[], sessionId: string) {
  return launches.find((launch) => launch.sessionId === sessionId);
}

export function listInvestigationTrainingLaunchesByEpisodeId(launches: readonly InvestigationTrainingLaunch[], episodeId: string) {
  return launches.filter((launch) => launch.episodeId === episodeId).sort(newestFirst);
}

/** Builds only the factual candidate for a session that the caller has just created. */
export function launchForNewTrainingSession(episodeId: string | null, session: ActiveTrainingSession, episodes: readonly StoredRealHandInvestigationEpisode[]): InvestigationTrainingLaunch | null {
  if (!episodeId || !session.focus || !skills.has(session.focus)) return null;
  const episode = episodes.find(({ id }) => id === episodeId);
  if (!episode || episode.completion !== "completed") return null;
  return { version: 1, episodeId: episode.id, sessionId: session.sessionId, skill: session.focus, launchedAt: session.startedAt };
}

export function registerInvestigationTrainingLaunch(launch: InvestigationTrainingLaunch): InvestigationTrainingLaunchRegistration {
  if (!isInvestigationTrainingLaunch(launch) || typeof window === "undefined") return "invalid";
  const launches = readInvestigationTrainingLaunches();
  const existing = findInvestigationTrainingLaunchBySessionId(launches, launch.sessionId);
  if (existing) return JSON.stringify(existing) === JSON.stringify(launch) ? "idempotent" : "conflict";
  window.localStorage.setItem(INVESTIGATION_TRAINING_LAUNCHES_KEY, JSON.stringify([...launches, launch].sort(newestFirst)));
  return "created";
}

export function registerLaunchForNewTrainingSession(episodeId: string | null, session: ActiveTrainingSession): InvestigationTrainingLaunch | null {
  const launch = launchForNewTrainingSession(episodeId, session, readRealHandInvestigationHistory());
  if (!launch) return null;
  const result = registerInvestigationTrainingLaunch(launch);
  return result === "created" || result === "idempotent" ? launch : null;
}
