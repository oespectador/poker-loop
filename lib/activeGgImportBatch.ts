import { MAX_IMPORT_CANDIDATES } from "./handSuggestions";
import { GG_IMPORTS_KEY, HAND_SUGGESTIONS_KEY, isHandReviewSuggestion, MAX_PENDING_HAND_SUGGESTIONS } from "./handSuggestionStorage";
import type { HandReviewSuggestion } from "./types";

export const ACTIVE_GG_IMPORT_BATCH_KEY = "poker-loop-v1:gg-active-import-batch";

export interface ActiveGgImportBatch {
  version: 1;
  fingerprint: string;
  importedAt: string;
  recognizedHands: number;
  ignoredHands: number;
  candidates: HandReviewSuggestion[];
  surfacedSuggestionIds: string[];
}

const validCount = (value: unknown) => Number.isInteger(value) && (value as number) >= 0;

export function isActiveGgImportBatch(value: unknown): value is ActiveGgImportBatch {
  if (!value || typeof value !== "object") return false;
  const batch = value as Record<string, unknown>;
  if (batch.version !== 1 || typeof batch.fingerprint !== "string" || !/^[a-f0-9]{64}$/.test(batch.fingerprint) ||
    typeof batch.importedAt !== "string" || !Number.isFinite(Date.parse(batch.importedAt)) || !validCount(batch.recognizedHands) || !validCount(batch.ignoredHands) ||
    !Array.isArray(batch.candidates) || batch.candidates.length > MAX_IMPORT_CANDIDATES || !batch.candidates.every(isHandReviewSuggestion) || !Array.isArray(batch.surfacedSuggestionIds)) return false;
  const candidates = batch.candidates as HandReviewSuggestion[];
  const sourceIds = candidates.map(({ sourceHandId }) => sourceHandId); const suggestionIds = candidates.map(({ id }) => id);
  const surfaced = batch.surfacedSuggestionIds;
  return new Set(sourceIds).size === sourceIds.length && new Set(suggestionIds).size === suggestionIds.length &&
    surfaced.every((id): id is string => typeof id === "string" && Boolean(id) && suggestionIds.includes(id)) && new Set(surfaced).size === surfaced.length;
}

export function parseActiveGgImportBatch(raw: string | null): ActiveGgImportBatch | null {
  if (raw === null) return null;
  try { const parsed: unknown = JSON.parse(raw); return isActiveGgImportBatch(parsed) ? parsed : null; } catch { return null; }
}

export function readActiveGgImportBatch(): ActiveGgImportBatch | null {
  return typeof window === "undefined" ? null : parseActiveGgImportBatch(window.localStorage.getItem(ACTIVE_GG_IMPORT_BATCH_KEY));
}

export function writeActiveGgImportBatch(batch: ActiveGgImportBatch): void {
  if (!isActiveGgImportBatch(batch)) throw new Error("Invalid active GG import batch");
  if (typeof window !== "undefined") window.localStorage.setItem(ACTIVE_GG_IMPORT_BATCH_KEY, JSON.stringify(batch));
}

interface PersistGgImportTransitionOptions { fingerprint?: string }

function restoreStorageValue(storage: Storage, key: string, value: string | null): void {
  if (value === null) storage.removeItem(key); else storage.setItem(key, value);
}

/** Commits batch, pending suggestions and optional fingerprint as one recoverable localStorage transition. */
export function persistGgImportTransition(
  previousBatch: ActiveGgImportBatch | null,
  previousPending: HandReviewSuggestion[],
  nextBatch: ActiveGgImportBatch,
  nextPending: HandReviewSuggestion[],
  options: PersistGgImportTransitionOptions = {},
): void {
  if (typeof window === "undefined") return;
  if (!isActiveGgImportBatch(nextBatch) || nextPending.length > MAX_PENDING_HAND_SUGGESTIONS || !nextPending.every(isHandReviewSuggestion)) throw new Error("Invalid GG import transition");
  const candidateIds = new Set(nextBatch.candidates.map(({ id }) => id)); const surfacedIds = new Set(nextBatch.surfacedSuggestionIds);
  if (nextPending.some(({ id }) => !candidateIds.has(id) || !surfacedIds.has(id))) throw new Error("Inconsistent GG import transition");
  const sameBatch = previousBatch?.fingerprint === nextBatch.fingerprint;
  const previousSurfaced = new Set(sameBatch ? previousBatch.surfacedSuggestionIds : []); const pendingIds = new Set(nextPending.map(({ id }) => id));
  if (nextBatch.surfacedSuggestionIds.some((id) => !previousSurfaced.has(id) && !pendingIds.has(id))) throw new Error("Surfaced suggestion was not persisted as pending");
  const previousPendingIds = new Set(previousPending.map(({ id }) => id));
  if (nextPending.some(({ id }) => !previousPendingIds.has(id) && !surfacedIds.has(id))) throw new Error("Pending suggestion was not marked surfaced");
  if (options.fingerprint !== undefined && (options.fingerprint !== nextBatch.fingerprint || !/^[a-f0-9]{64}$/.test(options.fingerprint))) throw new Error("Invalid processed import fingerprint");

  const storage = window.localStorage;
  const keys = [ACTIVE_GG_IMPORT_BATCH_KEY, HAND_SUGGESTIONS_KEY, GG_IMPORTS_KEY] as const;
  const before = new Map(keys.map((key) => [key, storage.getItem(key)]));
  try {
    storage.setItem(ACTIVE_GG_IMPORT_BATCH_KEY, JSON.stringify(nextBatch));
    storage.setItem(HAND_SUGGESTIONS_KEY, JSON.stringify(nextPending));
    if (options.fingerprint) {
      let parsed: unknown; try { parsed = JSON.parse(before.get(GG_IMPORTS_KEY) ?? "[]"); } catch { parsed = []; }
      const fingerprints = Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string" && /^[a-f0-9]{64}$/.test(item)) : [];
      storage.setItem(GG_IMPORTS_KEY, JSON.stringify([...new Set([...fingerprints, options.fingerprint])]));
    }
  } catch (error) {
    for (const key of [...keys].reverse()) { try { restoreStorageValue(storage, key, before.get(key) ?? null); } catch { /* best-effort rollback; preserve the original failure */ } }
    throw error;
  }
}

export function clearActiveGgImportBatch(): void {
  if (typeof window !== "undefined") window.localStorage.removeItem(ACTIVE_GG_IMPORT_BATCH_KEY);
}

export function remainingImportCandidates(batch: ActiveGgImportBatch): HandReviewSuggestion[] {
  const surfaced = new Set(batch.surfacedSuggestionIds);
  return batch.candidates.filter(({ id }) => !surfaced.has(id));
}

export function hasRemainingImportCandidates(batch: ActiveGgImportBatch): boolean { return remainingImportCandidates(batch).length > 0; }

export function nextImportCandidates(batch: ActiveGgImportBatch, count: number, pending: HandReviewSuggestion[] = []): HandReviewSuggestion[] {
  const room = Math.max(0, MAX_PENDING_HAND_SUGGESTIONS - pending.length);
  const pendingSources = new Set(pending.map(({ sourceHandId }) => sourceHandId));
  return remainingImportCandidates(batch).filter(({ sourceHandId }) => !pendingSources.has(sourceHandId)).slice(0, Math.min(Math.max(0, Math.floor(count)), room));
}

export function markImportCandidatesSurfaced(batch: ActiveGgImportBatch, items: HandReviewSuggestion[]): ActiveGgImportBatch {
  const candidateIds = new Set(batch.candidates.map(({ id }) => id));
  const ids = items.map(({ id }) => id).filter((id) => candidateIds.has(id));
  return { ...batch, surfacedSuggestionIds: [...new Set([...batch.surfacedSuggestionIds, ...ids])] };
}

export function surfaceNextImportCandidates(batch: ActiveGgImportBatch, count: number, pending: HandReviewSuggestion[]): { batch: ActiveGgImportBatch; suggestions: HandReviewSuggestion[]; added: HandReviewSuggestion[] } {
  const added = nextImportCandidates(batch, count, pending);
  return { batch: markImportCandidatesSurfaced(batch, added), suggestions: [...pending, ...added].slice(0, MAX_PENDING_HAND_SUGGESTIONS), added };
}
