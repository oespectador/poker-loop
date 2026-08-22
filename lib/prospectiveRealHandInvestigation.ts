import { reasoningFactorLabels } from "./realHandReasoning";
import type { ReasoningFactor, StoredRealHandReasoningSnapshot } from "./types";
import type { RealHandInvestigationCandidate } from "./realHandInvestigations";

export const REAL_HAND_INVESTIGATION_KEY = "poker-loop-v1:real-hand-investigation";
export const PROSPECTIVE_WINDOW_SIZE = 5;

export interface ActiveRealHandInvestigation {
  version: 1;
  id: string;
  factor: ReasoningFactor;
  startedAt: string;
  baselineSnapshotIds: string[];
  baselineHandReviewIds: string[];
  baselineReviewCount: number;
  baselineLowOrUnclearCount?: number;
}

export type ProspectiveInvestigationStatus =
  | "waiting"
  | "observed-again"
  | "factor-without-low-support"
  | "not-repeated"
  | "not-observed"
  | "inconclusive";

export interface ProspectiveInvestigationResult {
  status: ProspectiveInvestigationStatus;
  reviewedCount: number;
  factorCount: number;
  lowOrUnclearCount?: number;
  observedSnapshotIds: string[];
  observedHandReviewIds: string[];
  text: string;
}

const factors = new Set<ReasoningFactor>(["size", "board", "previous-actions", "configuration", "player-read", "automatic", "other"]);
const lowOrUnclear = new Set(["low", "unclear"]);
const validStrings = (value: unknown) => Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === "string" && Boolean(item.trim())) && new Set(value).size === value.length;

export function isActiveRealHandInvestigation(value: unknown): value is ActiveRealHandInvestigation {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return item.version === 1 && typeof item.id === "string" && Boolean(item.id.trim()) &&
    factors.has(item.factor as ReasoningFactor) && typeof item.startedAt === "string" && Number.isFinite(Date.parse(item.startedAt)) &&
    validStrings(item.baselineSnapshotIds) && validStrings(item.baselineHandReviewIds) &&
    item.baselineSnapshotIds instanceof Array && item.baselineHandReviewIds instanceof Array &&
    item.baselineSnapshotIds.length === item.baselineHandReviewIds.length && item.baselineReviewCount === item.baselineSnapshotIds.length &&
    (item.baselineLowOrUnclearCount === undefined || (item.factor !== "automatic" && Number.isInteger(item.baselineLowOrUnclearCount) && (item.baselineLowOrUnclearCount as number) >= 0 && (item.baselineLowOrUnclearCount as number) <= item.baselineReviewCount));
}

/** Freezes the exact V0.19 evidence at the moment the player starts following it. */
export function createActiveRealHandInvestigation(
  candidate: RealHandInvestigationCandidate,
  id: string = crypto.randomUUID(),
  startedAt: string = new Date().toISOString(),
): ActiveRealHandInvestigation {
  const investigation: ActiveRealHandInvestigation = {
    version: 1, id, factor: candidate.factor, startedAt,
    baselineSnapshotIds: [...candidate.snapshotIds], baselineHandReviewIds: [...candidate.handReviewIds],
    baselineReviewCount: candidate.reviewCount,
    ...(candidate.lowOrUnclearCount === undefined ? {} : { baselineLowOrUnclearCount: candidate.lowOrUnclearCount }),
  };
  if (!isActiveRealHandInvestigation(investigation)) throw new Error("Acompanhamento inválido.");
  return investigation;
}

export function readActiveRealHandInvestigation(): ActiveRealHandInvestigation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(REAL_HAND_INVESTIGATION_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isActiveRealHandInvestigation(parsed) ? parsed : null;
  } catch { return null; }
}

export function writeActiveRealHandInvestigation(investigation: ActiveRealHandInvestigation, replace = false): void {
  if (!isActiveRealHandInvestigation(investigation)) throw new Error("Acompanhamento inválido.");
  if (typeof window === "undefined") return;
  if (!replace && readActiveRealHandInvestigation()) throw new Error("Já existe um acompanhamento ativo.");
  window.localStorage.setItem(REAL_HAND_INVESTIGATION_KEY, JSON.stringify(investigation));
}

export function clearActiveRealHandInvestigation(): void {
  if (typeof window !== "undefined") window.localStorage.removeItem(REAL_HAND_INVESTIGATION_KEY);
}

function baselineIsAvailable(investigation: ActiveRealHandInvestigation, snapshots: readonly StoredRealHandReasoningSnapshot[]) {
  const byId = new Map(snapshots.map((snapshot) => [snapshot.id, snapshot]));
  return investigation.baselineSnapshotIds.every((id, index) => {
    const snapshot = byId.get(id);
    return snapshot?.handReviewId === investigation.baselineHandReviewIds[index] && snapshot.factors.includes(investigation.factor);
  });
}

function chronological(a: StoredRealHandReasoningSnapshot, b: StoredRealHandReasoningSnapshot) {
  return Date.parse(a.createdAt) - Date.parse(b.createdAt) || a.id.localeCompare(b.id);
}

/** Observes self-reports after an explicit temporal boundary; it never reads storage. */
export function deriveProspectiveInvestigation(
  investigation: ActiveRealHandInvestigation | null,
  snapshots: readonly StoredRealHandReasoningSnapshot[],
): ProspectiveInvestigationResult | null {
  if (!investigation) return null;
  if (!baselineIsAvailable(investigation, snapshots)) return { status: "inconclusive", reviewedCount: 0, factorCount: 0, observedSnapshotIds: [], observedHandReviewIds: [], text: "Algumas revisões que originaram este acompanhamento não estão mais disponíveis." };

  const baselineHands = new Set(investigation.baselineHandReviewIds);
  const distinct = new Map<string, StoredRealHandReasoningSnapshot>();
  for (const snapshot of [...snapshots].sort(chronological)) {
    if (Date.parse(snapshot.createdAt) > Date.parse(investigation.startedAt) && !baselineHands.has(snapshot.handReviewId) && !distinct.has(snapshot.handReviewId)) distinct.set(snapshot.handReviewId, snapshot);
  }
  const window = [...distinct.values()].slice(0, PROSPECTIVE_WINDOW_SIZE);
  const occurrences = window.filter((snapshot) => snapshot.factors.includes(investigation.factor));
  const common = { reviewedCount: window.length, factorCount: occurrences.length, observedSnapshotIds: window.map(({ id }) => id), observedHandReviewIds: window.map(({ handReviewId }) => handReviewId) };
  const label = reasoningFactorLabels[investigation.factor];
  if (window.length < PROSPECTIVE_WINDOW_SIZE) return { ...common, status: "waiting", text: `${window.length} de 5 novas decisões revisadas. ${label} apareceu em ${occurrences.length} ${occurrences.length === 1 ? "delas" : "delas"}.` };
  if (investigation.factor === "automatic") {
    if (occurrences.length >= 2) return { ...common, status: "observed-again", text: `“${label}” voltou a aparecer em ${occurrences.length} das 5 novas revisões.` };
    if (occurrences.length === 1) return { ...common, status: "not-repeated", text: "Apareceu uma vez nas 5 novas revisões." };
    return { ...common, status: "not-observed", text: "Não apareceu nas 5 novas revisões observadas." };
  }
  const lowerCount = occurrences.filter(({ selfRatedSupport }) => selfRatedSupport && lowOrUnclear.has(selfRatedSupport)).length;
  if (occurrences.length >= 2 && lowerCount > 0) return { ...common, lowOrUnclearCount: lowerCount, status: "observed-again", text: `O mesmo padrão de autorrelato apareceu novamente: ${label} foi marcado em ${occurrences.length} das 5 novas revisões, e em ${lowerCount} dessas decisões sua sustentação percebida foi Baixa ou Não estava claro.` };
  if (occurrences.length >= 2) return { ...common, lowOrUnclearCount: 0, status: "factor-without-low-support", text: `${label} voltou a aparecer em ${occurrences.length} das 5 novas revisões, mas nessas decisões você não marcou sustentação Baixa ou Não estava claro.` };
  if (occurrences.length === 1) return { ...common, lowOrUnclearCount: lowerCount, status: "not-repeated", text: "Apareceu em 1 das 5 novas revisões. Esta janela não mostrou repetição suficiente para destacar o mesmo padrão novamente." };
  return { ...common, lowOrUnclearCount: 0, status: "not-observed", text: `${label} não apareceu nas 5 novas revisões observadas.` };
}
