import type { ParsedActionType, RealHandReasoningSnapshot, ReasoningFactor, SelfRatedSupport } from "./types";

export const REASONING_SNAPSHOTS_KEY = "poker-loop-v1:reasoning-snapshots";
const streets = new Set(["preflop", "flop", "turn", "river"]); const actions = new Set<ParsedActionType>(["fold", "check", "call", "bet", "raise"]);
const factors = new Set<ReasoningFactor>(["size", "board", "previous-actions", "configuration", "player-read", "automatic", "other"]);
const supports = new Set<SelfRatedSupport>(["low", "medium", "high", "unclear"]);
const validMoney = (value: unknown) => value === undefined || (typeof value === "number" && Number.isFinite(value) && value >= 0);

export function isRealHandReasoningSnapshot(value: unknown): value is RealHandReasoningSnapshot {
  if (!value || typeof value !== "object") return false; const item = value as Record<string, unknown>; const source = item.sourceDecision as Record<string, unknown> | undefined;
  if (typeof item.id !== "string" || !item.id.trim() || typeof item.handReviewId !== "string" || !item.handReviewId.trim() || typeof item.createdAt !== "string" || !Number.isFinite(Date.parse(item.createdAt)) || !source) return false;
  if (!streets.has(source.street as string) || !Number.isInteger(source.sequenceIndex) || (source.sequenceIndex as number) < 0 || !actions.has(source.action as ParsedActionType) || !validMoney(source.amount) || !validMoney(source.toAmount)) return false;
  if (item.thought !== undefined && typeof item.thought !== "string") return false;
  if (!Array.isArray(item.factors) || item.factors.length > 2 || !item.factors.every((x) => factors.has(x as ReasoningFactor)) || new Set(item.factors).size !== item.factors.length) return false;
  if (item.factors.includes("automatic") && item.factors.length !== 1) return false;
  if (item.selfRatedSupport !== undefined && !supports.has(item.selfRatedSupport as SelfRatedSupport)) return false;
  return !(item.factors.includes("automatic") && item.selfRatedSupport !== undefined);
}
export function readReasoningSnapshots(): RealHandReasoningSnapshot[] { if (typeof window === "undefined") return []; try { const parsed: unknown = JSON.parse(window.localStorage.getItem(REASONING_SNAPSHOTS_KEY) ?? "[]"); if (!Array.isArray(parsed)) return []; const valid = parsed.filter(isRealHandReasoningSnapshot); return [...new Map(valid.map((x) => [x.handReviewId, x])).values()].sort((a,b) => a.handReviewId.localeCompare(b.handReviewId)); } catch { return []; } }
function write(items: RealHandReasoningSnapshot[]) { if (typeof window !== "undefined") window.localStorage.setItem(REASONING_SNAPSHOTS_KEY, JSON.stringify(items)); }
export function saveReasoningSnapshot(snapshot: RealHandReasoningSnapshot): RealHandReasoningSnapshot { if (!isRealHandReasoningSnapshot(snapshot)) throw new Error("Snapshot inválido."); const current = readReasoningSnapshots().find((x) => x.handReviewId === snapshot.handReviewId); const saved = current ? { ...snapshot, id: current.id, createdAt: current.createdAt } : snapshot; write([...readReasoningSnapshots().filter((x) => x.handReviewId !== saved.handReviewId), saved]); return saved; }
export function deleteReasoningSnapshotForHand(handReviewId: string) { write(readReasoningSnapshots().filter((x) => x.handReviewId !== handReviewId)); }
