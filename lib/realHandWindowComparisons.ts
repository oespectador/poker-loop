import { isInvestigationTrainingCompletion, type InvestigationTrainingCompletion } from "./investigationTrainingCompletions";
import { isInvestigationTrainingLaunch, type InvestigationTrainingLaunch } from "./investigationTrainingLaunches";
import { isPostTrainingRealHandFollowUp, type PostTrainingRealHandFollowUp } from "./postTrainingRealHandFollowUps";
import { isStoredRealHandInvestigationEpisode, type StoredRealHandInvestigationEpisode } from "./realHandInvestigationHistory";
import type { ProspectiveObservedReview } from "./prospectiveRealHandInvestigation";
import type { ReasoningFactor, Skill } from "./types";

export interface WindowObservationSummary {
  reviewedCount: number;
  factorCount: number;
  supportRecordedCount?: number;
  lowOrUnclearCount?: number;
}

/** A read-only join of frozen facts. It is never persisted or used as learning evidence. */
export interface RealHandWindowComparison {
  episodeId: string;
  followUpId: string;
  sessionId: string;
  factor: ReasoningFactor;
  skill: Skill;
  original: WindowObservationSummary;
  posterior: WindowObservationSummary;
  originalCompletedAt: string;
  posteriorCompletedAt: string;
}

export function summarizeFrozenObservationWindow(
  observations: readonly ProspectiveObservedReview[],
  factor: ReasoningFactor,
): WindowObservationSummary {
  const occurrences = observations.filter(({ factorPresent }) => factorPresent);
  const summary: WindowObservationSummary = {
    reviewedCount: observations.length,
    factorCount: occurrences.length,
  };
  if (factor === "automatic") return summary;
  const withSupport = occurrences.filter(({ selfRatedSupport }) => selfRatedSupport !== undefined);
  return {
    ...summary,
    supportRecordedCount: withSupport.length,
    lowOrUnclearCount: withSupport.filter(({ selfRatedSupport }) => selfRatedSupport === "low" || selfRatedSupport === "unclear").length,
  };
}

/** Derives the factual end of a frozen window without relying on array position. */
export function latestFrozenObservationAt(observations: readonly ProspectiveObservedReview[]): string | undefined {
  return observations.reduce<string | undefined>((latest, observation) => {
    const observedAt = Date.parse(observation.createdAt);
    if (!Number.isFinite(observedAt)) return latest;
    return latest === undefined || observedAt > Date.parse(latest) ? observation.createdAt : latest;
  }, undefined);
}

export function buildRealHandWindowComparison(
  episode: StoredRealHandInvestigationEpisode,
  followUp: PostTrainingRealHandFollowUp,
  launch: InvestigationTrainingLaunch | undefined,
  completion: InvestigationTrainingCompletion | undefined,
): RealHandWindowComparison | null {
  if (!isStoredRealHandInvestigationEpisode(episode) || episode.completion !== "completed" || episode.prospectiveReviews.length !== 5) return null;
  if (!isPostTrainingRealHandFollowUp(followUp) || followUp.observations.length !== 5 || !followUp.windowCompletedAt) return null;
  if (followUp.episodeId !== episode.id || followUp.factor !== episode.factor) return null;
  if (!launch || !isInvestigationTrainingLaunch(launch) || launch.sessionId !== followUp.sessionId || launch.episodeId !== episode.id) return null;
  if (!completion || !isInvestigationTrainingCompletion(completion) || completion.sessionId !== launch.sessionId) return null;
  const originalCompletedAt = latestFrozenObservationAt(episode.prospectiveReviews);
  if (!originalCompletedAt) return null;
  const boundaries = [originalCompletedAt, episode.endedAt, launch.launchedAt, completion.completedAt, followUp.startedAt, followUp.windowCompletedAt];
  if (boundaries.some((boundary, index) => index > 0 && Date.parse(boundary) < Date.parse(boundaries[index - 1]))) return null;
  return {
    episodeId: episode.id,
    followUpId: followUp.id,
    sessionId: followUp.sessionId,
    factor: episode.factor,
    skill: launch.skill,
    original: summarizeFrozenObservationWindow(episode.prospectiveReviews, episode.factor),
    posterior: summarizeFrozenObservationWindow(followUp.observations, followUp.factor),
    originalCompletedAt,
    posteriorCompletedAt: followUp.windowCompletedAt,
  };
}

/** Each posterior window is joined only to its original episode, never to another follow-up. */
export function deriveRealHandWindowComparisons(
  episodes: readonly StoredRealHandInvestigationEpisode[],
  followUps: readonly PostTrainingRealHandFollowUp[],
  launches: readonly InvestigationTrainingLaunch[],
  completions: readonly InvestigationTrainingCompletion[],
): RealHandWindowComparison[] {
  return followUps.flatMap((followUp) => {
    const episode = episodes.find(({ id }) => id === followUp.episodeId);
    const launch = launches.find(({ sessionId }) => sessionId === followUp.sessionId);
    const completion = completions.find(({ sessionId }) => sessionId === launch?.sessionId);
    if (!episode) return [];
    const comparison = buildRealHandWindowComparison(episode, followUp, launch, completion);
    return comparison ? [comparison] : [];
  }).sort((a, b) => Date.parse(b.posteriorCompletedAt) - Date.parse(a.posteriorCompletedAt) || a.followUpId.localeCompare(b.followUpId));
}
