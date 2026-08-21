import type { HandReviewSuggestion } from "./types";

export const HAND_SUGGESTIONS_KEY = "poker-loop-v1:hand-review-suggestions";
export const GG_IMPORTS_KEY = "poker-loop-v1:gg-imports";
const reasons = new Set(["high-commitment", "river-decision", "hero-showdown", "multi-street-pressure", "long-line"]);

export function isHandReviewSuggestion(value: unknown): value is HandReviewSuggestion {
  if (!value || typeof value !== "object") return false; const item = value as Record<string, unknown>;
  return typeof item.id === "string" && Boolean(item.id) && item.source === "gg-pokercraft" && typeof item.sourceHandId === "string" && Boolean(item.sourceHandId) &&
    reasons.has(item.reason as string) && typeof item.createdAt === "string" && Number.isFinite(Date.parse(item.createdAt)) &&
    Array.isArray(item.heroCards) && item.heroCards.length === 2 && item.heroCards.every((card) => typeof card === "string" && Boolean(card)) &&
    typeof item.playedAt === "string" && Number.isFinite(Date.parse(item.playedAt)) && typeof item.reasonLabel === "string" && Boolean(item.reasonLabel) &&
    typeof item.reasonMessage === "string" && Boolean(item.reasonMessage) && typeof item.rawHandText === "string" && Boolean(item.rawHandText.trim());
}
export function readHandSuggestions(): HandReviewSuggestion[] {
  if (typeof window === "undefined") return [];
  try { const parsed: unknown = JSON.parse(window.localStorage.getItem(HAND_SUGGESTIONS_KEY) ?? "[]"); return Array.isArray(parsed) ? parsed.filter(isHandReviewSuggestion).slice(0, 5) : []; } catch { return []; }
}
export function writeHandSuggestions(items: HandReviewSuggestion[]): void {
  if (typeof window !== "undefined") window.localStorage.setItem(HAND_SUGGESTIONS_KEY, JSON.stringify(items.filter(isHandReviewSuggestion).slice(0, 5)));
}
export function removeHandSuggestion(id: string): void { writeHandSuggestions(readHandSuggestions().filter((item) => item.id !== id)); }
export function clearHandSuggestions(): void { if (typeof window !== "undefined") window.localStorage.removeItem(HAND_SUGGESTIONS_KEY); }
export function readProcessedImports(): string[] {
  if (typeof window === "undefined") return [];
  try { const parsed: unknown = JSON.parse(window.localStorage.getItem(GG_IMPORTS_KEY) ?? "[]"); return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string" && /^[a-f0-9]{64}$/.test(item)) : []; } catch { return []; }
}
export function hasProcessedImport(fingerprint: string): boolean { return readProcessedImports().includes(fingerprint); }
export function recordProcessedImport(fingerprint: string): void {
  if (typeof window !== "undefined" && /^[a-f0-9]{64}$/.test(fingerprint)) window.localStorage.setItem(GG_IMPORTS_KEY, JSON.stringify([...new Set([...readProcessedImports(), fingerprint])]));
}
