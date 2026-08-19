import type { Exercise, SupportLevel } from "./types";

export function attemptSupport(exercise: Exercise, hintRevealed: boolean): SupportLevel {
  if (exercise.support === "guided") return "guided";
  if (exercise.support === "supported" && hintRevealed) return "supported";
  return "independent";
}
