import { reasoningFactorLabels } from "./realHandReasoning";
import type { StoredRealHandInvestigationEpisode } from "./realHandInvestigationHistory";
import type { InvestigationTrainingLaunch } from "./investigationTrainingLaunches";
import type { InvestigationTrainingCompletion } from "./investigationTrainingCompletions";
import type { ActiveRealHandInvestigation, ProspectiveObservedReview } from "./prospectiveRealHandInvestigation";
import type { ReasoningFactor, SelfRatedSupport, StoredRealHandReasoningSnapshot } from "./types";

export const POST_TRAINING_REAL_HAND_FOLLOW_UPS_KEY = "poker-loop-v1:post-training-real-hand-follow-ups";
export const POST_TRAINING_FOLLOW_UP_WINDOW_SIZE = 5;

export interface PostTrainingRealHandFollowUp {
  version: 1; id: string; episodeId: string; sessionId: string; factor: ReasoningFactor; startedAt: string;
  baselineHandReviewIds: string[]; observations: ProspectiveObservedReview[]; windowCompletedAt?: string;
}
export interface PostTrainingFollowUpSummary { reviewedCount: number; factorCount: number; lowOrUnclearCount?: number; text: string; }

const factors = new Set<ReasoningFactor>(["size", "board", "previous-actions", "configuration", "player-read", "automatic", "other"]);
const supports = new Set<SelfRatedSupport>(["low", "medium", "high", "unclear"]);
const timestamp = (value: unknown): value is string => typeof value === "string" && Number.isFinite(Date.parse(value));
const strings = (value: unknown): value is string[] => Array.isArray(value) && value.every((item) => typeof item === "string" && Boolean(item.trim())) && new Set(value).size === value.length;

export function isPostTrainingRealHandFollowUp(value: unknown): value is PostTrainingRealHandFollowUp {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  if (item.version !== 1 || ![item.id, item.episodeId, item.sessionId].every((id) => typeof id === "string" && Boolean(id.trim())) || !factors.has(item.factor as ReasoningFactor) || !timestamp(item.startedAt) || !strings(item.baselineHandReviewIds) || !Array.isArray(item.observations) || item.observations.length > POST_TRAINING_FOLLOW_UP_WINDOW_SIZE) return false;
  const baseline = new Set(item.baselineHandReviewIds as string[]); const hands = new Set<string>();
  const valid = item.observations.every((entry) => {
    if (!entry || typeof entry !== "object") return false; const review = entry as Record<string, unknown>;
    if (typeof review.snapshotId !== "string" || !review.snapshotId.trim() || typeof review.handReviewId !== "string" || !review.handReviewId.trim() || hands.has(review.handReviewId) || baseline.has(review.handReviewId) || !timestamp(review.createdAt) || Date.parse(review.createdAt) <= Date.parse(item.startedAt as string) || typeof review.factorPresent !== "boolean") return false;
    hands.add(review.handReviewId); return review.selfRatedSupport === undefined || (item.factor !== "automatic" && supports.has(review.selfRatedSupport as SelfRatedSupport));
  });
  const observations = item.observations as ProspectiveObservedReview[];
  const ordered = observations.every((review, index) => index === 0 || chronological(observations[index - 1], review) <= 0);
  return valid && ordered && (item.windowCompletedAt === undefined ? observations.length < POST_TRAINING_FOLLOW_UP_WINDOW_SIZE : observations.length === POST_TRAINING_FOLLOW_UP_WINDOW_SIZE && timestamp(item.windowCompletedAt) && item.windowCompletedAt === observations.at(-1)?.createdAt);
}

const newestFirst = (a: PostTrainingRealHandFollowUp, b: PostTrainingRealHandFollowUp) => Date.parse(b.windowCompletedAt ?? b.startedAt) - Date.parse(a.windowCompletedAt ?? a.startedAt) || a.id.localeCompare(b.id);
export function parsePostTrainingRealHandFollowUps(raw: string | null): PostTrainingRealHandFollowUp[] { if (!raw) return []; try { const parsed: unknown = JSON.parse(raw); return Array.isArray(parsed) ? parsed.filter(isPostTrainingRealHandFollowUp).sort(newestFirst) : []; } catch { return []; } }
export function readPostTrainingRealHandFollowUps(): PostTrainingRealHandFollowUp[] { return typeof window === "undefined" ? [] : parsePostTrainingRealHandFollowUps(window.localStorage.getItem(POST_TRAINING_REAL_HAND_FOLLOW_UPS_KEY)); }
export function writePostTrainingRealHandFollowUps(items: readonly PostTrainingRealHandFollowUp[]): boolean { if (typeof window === "undefined" || !items.every(isPostTrainingRealHandFollowUp) || items.filter(({ windowCompletedAt }) => !windowCompletedAt).length > 1 || new Set(items.map(({ id }) => id)).size !== items.length) return false; window.localStorage.setItem(POST_TRAINING_REAL_HAND_FOLLOW_UPS_KEY, JSON.stringify([...items].sort(newestFirst))); return true; }
export function findActivePostTrainingRealHandFollowUp(items: readonly PostTrainingRealHandFollowUp[]) { return items.find(({ windowCompletedAt }) => !windowCompletedAt); }
export function listPostTrainingRealHandFollowUpsByEpisodeId(items: readonly PostTrainingRealHandFollowUp[], episodeId: string) { return items.filter((item) => item.episodeId === episodeId).sort(newestFirst); }

/** Revalidates exact episode → launch → completion provenance and freezes the explicit prospective boundary. */
export function createPostTrainingRealHandFollowUp(args: { episodeId: string; sessionId: string; episodes: readonly StoredRealHandInvestigationEpisode[]; launches: readonly InvestigationTrainingLaunch[]; completions: readonly InvestigationTrainingCompletion[]; snapshots: readonly StoredRealHandReasoningSnapshot[]; existingFollowUps: readonly PostTrainingRealHandFollowUp[]; activeInvestigation?: ActiveRealHandInvestigation | null; id?: string; startedAt?: string; }): PostTrainingRealHandFollowUp | null {
  if (findActivePostTrainingRealHandFollowUp(args.existingFollowUps) || args.activeInvestigation) return null;
  const episode = args.episodes.find(({ id }) => id === args.episodeId);
  const launch = args.launches.find(({ sessionId, episodeId }) => sessionId === args.sessionId && episodeId === episode?.id);
  const completion = args.completions.find(({ sessionId }) => sessionId === launch?.sessionId);
  if (!episode || episode.completion !== "completed" || !launch || !completion) return null;
  const followUp: PostTrainingRealHandFollowUp = { version: 1, id: args.id ?? crypto.randomUUID(), episodeId: episode.id, sessionId: launch.sessionId, factor: episode.factor, startedAt: args.startedAt ?? new Date().toISOString(), baselineHandReviewIds: [...new Set(args.snapshots.map(({ handReviewId }) => handReviewId))], observations: [] };
  return isPostTrainingRealHandFollowUp(followUp) ? followUp : null;
}

const chronological = (a: { createdAt: string; id?: string; snapshotId?: string }, b: { createdAt: string; id?: string; snapshotId?: string }) => Date.parse(a.createdAt) - Date.parse(b.createdAt) || (a.id ?? a.snapshotId ?? "").localeCompare(b.id ?? b.snapshotId ?? "");
/** Existing observations and completed records are never rewritten. */
export function syncPostTrainingRealHandFollowUp(followUp: PostTrainingRealHandFollowUp, snapshots: readonly StoredRealHandReasoningSnapshot[]): PostTrainingRealHandFollowUp {
  if (followUp.windowCompletedAt) return followUp;
  const seen = new Set([...followUp.baselineHandReviewIds, ...followUp.observations.map(({ handReviewId }) => handReviewId)]); const additions: ProspectiveObservedReview[] = [];
  for (const snapshot of [...snapshots].sort(chronological)) { if (followUp.observations.length + additions.length === POST_TRAINING_FOLLOW_UP_WINDOW_SIZE) break; if (Date.parse(snapshot.createdAt) <= Date.parse(followUp.startedAt) || seen.has(snapshot.handReviewId)) continue; seen.add(snapshot.handReviewId); additions.push({ snapshotId: snapshot.id, handReviewId: snapshot.handReviewId, createdAt: snapshot.createdAt, factorPresent: snapshot.factors.includes(followUp.factor), ...(followUp.factor === "automatic" || snapshot.selfRatedSupport === undefined ? {} : { selfRatedSupport: snapshot.selfRatedSupport }) }); }
  if (!additions.length) return followUp; const observations = [...followUp.observations, ...additions]; return { ...followUp, observations, ...(observations.length === POST_TRAINING_FOLLOW_UP_WINDOW_SIZE ? { windowCompletedAt: observations.at(-1)?.createdAt } : {}) };
}
export function syncPostTrainingRealHandFollowUps(items: readonly PostTrainingRealHandFollowUp[], snapshots: readonly StoredRealHandReasoningSnapshot[]) { return items.map((item) => item.windowCompletedAt ? item : syncPostTrainingRealHandFollowUp(item, snapshots)).sort(newestFirst); }

export function summarizePostTrainingRealHandFollowUp(followUp: PostTrainingRealHandFollowUp): PostTrainingFollowUpSummary {
  const reviewedCount = followUp.observations.length; const occurrences = followUp.observations.filter(({ factorPresent }) => factorPresent); const factorCount = occurrences.length; const label = reasoningFactorLabels[followUp.factor];
  const prefix = reviewedCount < 5 ? `Acompanhamento em andamento: ${reviewedCount} de 5 novas revisões. ` : ""; const occurrence = factorCount ? `${label} apareceu em ${factorCount} ${reviewedCount === 5 ? "das 5 novas revisões" : "dessas revisões"}.` : `${label} não apareceu nas ${reviewedCount === 5 ? "5 novas revisões" : "revisões observadas até agora"}.`;
  if (followUp.factor === "automatic") return { reviewedCount, factorCount, text: prefix + occurrence };
  const lowOrUnclearCount = occurrences.filter(({ selfRatedSupport }) => selfRatedSupport === "low" || selfRatedSupport === "unclear").length;
  return { reviewedCount, factorCount, lowOrUnclearCount, text: `${prefix}${occurrence}${factorCount ? ` Em ${lowOrUnclearCount} dessas decisões você marcou sustentação Baixa ou Não estava claro.` : ""}` };
}
