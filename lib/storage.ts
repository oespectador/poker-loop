import type { Attempt } from "./types";

const ATTEMPTS_KEY = "poker-loop-v1:attempts";

export function readAttempts(): Attempt[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ATTEMPTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function appendAttempts(next: Attempt[]): void {
  if (typeof window === "undefined" || next.length === 0) return;
  const current = readAttempts();
  window.localStorage.setItem(ATTEMPTS_KEY, JSON.stringify([...current, ...next]));
}

export function clearPrototypeProgress(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ATTEMPTS_KEY);
}
