import type { RealHandReview, RealHandReviewInput, RealHandStreet, Skill } from "./types";

export const REAL_HANDS_KEY = "poker-loop-v1:real-hands";
export const realHandStreetLabels: Record<RealHandStreet, string> = {
  preflop: "Pré-flop", flop: "Flop", turn: "Turn", river: "River", multiple: "A mão como um todo",
};
export const realHandSkillLabels: Record<Skill, string> = {
  "board-reading": "Leitura do board", "range-reading": "Leitura de range", sizing: "Sizing", "integrated-decision": "Decisão integrada",
};
const streets = new Set(Object.keys(realHandStreetLabels));
const skills = new Set(Object.keys(realHandSkillLabels));
const optionalString = (value: unknown): value is string | undefined => value === undefined || typeof value === "string";

export function isRealHandReview(value: unknown): value is RealHandReview {
  if (!value || typeof value !== "object") return false;
  const hand = value as Record<string, unknown>;
  return typeof hand.id === "string" && Boolean(hand.id.trim()) &&
    typeof hand.createdAt === "string" && Number.isFinite(Date.parse(hand.createdAt)) &&
    optionalString(hand.title) && typeof hand.rawHandText === "string" && Boolean(hand.rawHandText.trim()) &&
    (hand.street === undefined || streets.has(hand.street as string)) &&
    typeof hand.doubt === "string" && typeof hand.rangeRead === "string" && typeof hand.objective === "string" &&
    typeof hand.targetsAndSizeResponse === "string" &&
    (hand.trainingFocus === undefined || skills.has(hand.trainingFocus as string));
}

export function validateRealHandInput(input: RealHandReviewInput): string | null {
  return input.rawHandText.trim() ? null : "Cole o histórico da mão antes de salvar.";
}
export function sortRealHands(hands: RealHandReview[]): RealHandReview[] {
  return [...hands].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}
export function readRealHands(): RealHandReview[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(REAL_HANDS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? sortRealHands(parsed.filter(isRealHandReview)) : [];
  } catch { return []; }
}
function writeRealHands(hands: RealHandReview[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REAL_HANDS_KEY, JSON.stringify(sortRealHands(hands)));
}
export function createRealHand(input: RealHandReviewInput, id: string = crypto.randomUUID(), createdAt = new Date().toISOString()): RealHandReview {
  const error = validateRealHandInput(input);
  if (error) throw new Error(error);
  return { ...input, title: input.title?.trim() || undefined, id, createdAt };
}
export function saveRealHand(hand: RealHandReview): RealHandReview {
  if (!isRealHandReview(hand)) throw new Error("A mão não pôde ser salva porque os dados estão incompletos.");
  writeRealHands([hand, ...readRealHands().filter(({ id }) => id !== hand.id)]);
  return hand;
}
export function updateRealHand(id: string, input: RealHandReviewInput): RealHandReview | null {
  const current = readRealHands().find((hand) => hand.id === id);
  if (!current) return null;
  return saveRealHand(createRealHand({ ...current, ...input }, current.id, current.createdAt));
}
export function deleteRealHand(id: string): void { writeRealHands(readRealHands().filter((hand) => hand.id !== id)); }
export function clearRealHands(): void {
  if (typeof window !== "undefined") window.localStorage.removeItem(REAL_HANDS_KEY);
}
export function trainingLinkForHand(hand: RealHandReview): string | undefined {
  return hand.trainingFocus ? `/session?focus=${hand.trainingFocus}` : undefined;
}
