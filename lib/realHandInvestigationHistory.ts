import { reasoningFactorLabels } from "./realHandReasoning";
import {
  PROSPECTIVE_WINDOW_SIZE,
  REAL_HAND_INVESTIGATION_KEY,
  isActiveRealHandInvestigation,
  type ActiveRealHandInvestigation,
  type ProspectiveObservedReview,
  type ProspectiveInvestigationResult,
} from "./prospectiveRealHandInvestigation";
import type { ReasoningFactor } from "./types";

export const REAL_HAND_INVESTIGATION_HISTORY_KEY = "poker-loop-v1:real-hand-investigation-history";

export type RealHandInvestigationCompletion = "completed" | "stopped" | "inconclusive";

export interface StoredRealHandInvestigationEpisode {
  version: 1;
  id: string;
  factor: ReasoningFactor;
  startedAt: string;
  endedAt: string;
  baselineSnapshotIds: string[];
  baselineHandReviewIds: string[];
  baselineReviewCount: number;
  baselineLowOrUnclearCount?: number;
  prospectiveReviews: ProspectiveObservedReview[];
  completion: RealHandInvestigationCompletion;
}

export interface RealHandInvestigationEpisodeSummary {
  reviewedCount: number;
  factorCount: number;
  lowOrUnclearCount?: number;
  text: string;
}

const completions = new Set<RealHandInvestigationCompletion>(["completed", "stopped", "inconclusive"]);

/** Keeps every explicit closing path on the same factual classification rule. */
export function completionForProspectiveResult(result: ProspectiveInvestigationResult): RealHandInvestigationCompletion {
  if (result.status === "inconclusive") return "inconclusive";
  if (result.reviewedCount === PROSPECTIVE_WINDOW_SIZE) return "completed";
  return "stopped";
}

export function isStoredRealHandInvestigationEpisode(value: unknown): value is StoredRealHandInvestigationEpisode {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  if (!completions.has(item.completion as RealHandInvestigationCompletion) || typeof item.endedAt !== "string" || !Number.isFinite(Date.parse(item.endedAt))) return false;
  const { endedAt: _endedAt, completion: _completion, ...active } = item;
  if (!isActiveRealHandInvestigation(active) || Date.parse(item.endedAt) < Date.parse(active.startedAt as string)) return false;
  const count = (active.prospectiveReviews as ProspectiveObservedReview[]).length;
  return item.completion !== "completed" || count === PROSPECTIVE_WINDOW_SIZE;
}

function newestFirst(a: StoredRealHandInvestigationEpisode, b: StoredRealHandInvestigationEpisode) {
  return Date.parse(b.endedAt) - Date.parse(a.endedAt) || a.id.localeCompare(b.id);
}

export function parseRealHandInvestigationHistory(raw: string | null): StoredRealHandInvestigationEpisode[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value.filter(isStoredRealHandInvestigationEpisode).sort(newestFirst);
  } catch { return []; }
}

export function readRealHandInvestigationHistory(): StoredRealHandInvestigationEpisode[] {
  if (typeof window === "undefined") return [];
  return parseRealHandInvestigationHistory(window.localStorage.getItem(REAL_HAND_INVESTIGATION_HISTORY_KEY));
}

export function createRealHandInvestigationEpisode(
  investigation: ActiveRealHandInvestigation,
  completion: RealHandInvestigationCompletion,
  endedAt: string = new Date().toISOString(),
): StoredRealHandInvestigationEpisode {
  const episode: StoredRealHandInvestigationEpisode = JSON.parse(JSON.stringify({ ...investigation, endedAt, completion }));
  if (!isStoredRealHandInvestigationEpisode(episode)) throw new Error("Episódio de acompanhamento inválido.");
  return episode;
}

/** Appends one immutable episode by investigation id and clears only that active investigation. */
export function archiveRealHandInvestigation(
  investigation: ActiveRealHandInvestigation,
  completion: RealHandInvestigationCompletion,
  endedAt: string = new Date().toISOString(),
): StoredRealHandInvestigationEpisode[] {
  const episode = createRealHandInvestigationEpisode(investigation, completion, endedAt);
  if (typeof window === "undefined") return [episode];
  const history = readRealHandInvestigationHistory();
  if (!history.some(({ id }) => id === episode.id)) {
    window.localStorage.setItem(REAL_HAND_INVESTIGATION_HISTORY_KEY, JSON.stringify([...history, episode].sort(newestFirst)));
  }
  const activeRaw = window.localStorage.getItem(REAL_HAND_INVESTIGATION_KEY);
  try {
    const active: unknown = activeRaw ? JSON.parse(activeRaw) : null;
    if (isActiveRealHandInvestigation(active) && active.id === investigation.id) window.localStorage.removeItem(REAL_HAND_INVESTIGATION_KEY);
  } catch { /* A malformed active value is not another valid investigation. */ }
  return readRealHandInvestigationHistory();
}

/** Uses only facts frozen in the episode; current hands and snapshots are intentionally irrelevant. */
export function summarizeRealHandInvestigationEpisode(episode: StoredRealHandInvestigationEpisode): RealHandInvestigationEpisodeSummary {
  const reviewedCount = episode.prospectiveReviews.length;
  const occurrences = episode.prospectiveReviews.filter(({ factorPresent }) => factorPresent);
  const factorCount = occurrences.length;
  const label = reasoningFactorLabels[episode.factor];
  if (episode.completion === "inconclusive") return { reviewedCount, factorCount, text: "Acompanhamento encerrado sem uma janela interpretável porque parte da evidência de origem deixou de estar disponível." };
  if (episode.completion === "stopped") return { reviewedCount, factorCount, text: `Acompanhamento encerrado após ${reviewedCount} das 5 revisões previstas.${factorCount ? ` ${label} apareceu em ${factorCount} ${factorCount === 1 ? "delas" : "delas"}.` : ""}` };
  if (episode.factor === "automatic") return { reviewedCount, factorCount, text: factorCount ? `${label} apareceu em ${factorCount} das 5 novas revisões.` : `${label} não apareceu nas 5 novas revisões observadas.` };
  const lowOrUnclearCount = occurrences.filter(({ selfRatedSupport }) => selfRatedSupport === "low" || selfRatedSupport === "unclear").length;
  return { reviewedCount, factorCount, lowOrUnclearCount, text: factorCount ? `${label} apareceu em ${factorCount} das 5 novas revisões. Em ${lowOrUnclearCount} dessas decisões você marcou sustentação Baixa ou Não estava claro.` : `${label} não apareceu nas 5 novas revisões observadas.` };
}
