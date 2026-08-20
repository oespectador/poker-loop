import assert from "node:assert/strict";
import test from "node:test";

import { createTrainingSession, restoreQueue, resumeTrainingSession, serializeQueue, updateActiveSession } from "../lib/activeTrainingSession";
import { developmentExercises } from "../lib/exercises";
import { ACTIVE_SESSION_KEY, clearPrototypeProgress, isActiveTrainingSession, readActiveTrainingSession } from "../lib/storage";
import { reprioritizeAfterError } from "../lib/trainingEngine";
import type { ActiveTrainingSession, Attempt } from "../lib/types";

const startedAt = "2026-08-20T12:00:00.000Z";

function created(id = "session-a") {
  return createTrainingSession([], undefined, id, startedAt);
}

function attempt(sessionId: string, exerciseId = developmentExercises[0].id): Attempt {
  const exercise = developmentExercises.find(({ id }) => id === exerciseId)!;
  return { id: `attempt-${sessionId}-${exerciseId}`, exerciseId, sessionId, primarySkill: exercise.primarySkill,
    answerId: exercise.correctOptionId, correct: true, support: exercise.support, timestamp: startedAt };
}

test("nova sessão produz estado persistível, identidade e limite de 12", () => {
  const result = created();
  assert.equal(isActiveTrainingSession(result.active), true);
  assert.equal(result.active.sessionId, "session-a");
  assert.equal(result.queue.length, 12);
  assert.equal(result.active.items.length, 12);
});

test("retomada conserva identidade, ordem e não duplica exercícios", () => {
  const first = created();
  const resumed = resumeTrainingSession(first.active, [], undefined)!;
  assert.equal(resumed.active.sessionId, first.active.sessionId);
  assert.deepEqual(resumed.queue.map(({ id }) => id), first.queue.map(({ id }) => id));
  assert.equal(new Set(resumed.queue.map(({ id }) => id)).size, resumed.queue.length);
});

test("serialização conserva suporte efetivo e papel de introdução", () => {
  const queue = [{ ...developmentExercises[0], support: "independent" as const, sessionRole: "introduction" as const }];
  const active: ActiveTrainingSession = { version: 1, sessionId: "s", startedAt, focus: null, items: serializeQueue(queue), nextIndex: 0 };
  const restored = restoreQueue(active)!;
  assert.equal(restored[0].support, "independent");
  assert.equal(restored[0].sessionRole, "introduction");
});

test("nextIndex significa próxima resposta e sobrevive a múltiplas retomadas", () => {
  let state = created();
  state.active = updateActiveSession(state.active, state.queue, 4);
  for (let cycle = 0; cycle < 3; cycle += 1) state = resumeTrainingSession(state.active, [], undefined)!;
  assert.equal(state.active.nextIndex, 4);
  assert.equal(state.active.sessionId, "session-a");
});

test("resposta já persistida não volta durante feedback", () => {
  const state = created();
  const updated = updateActiveSession(state.active, state.queue, 1);
  assert.equal(resumeTrainingSession(updated, [attempt("session-a")], undefined)!.active.nextIndex, 1);
});

test("ordem repriorizada após erro é a ordem restaurada", () => {
  const state = created();
  const changed = reprioritizeAfterError(state.queue, 0, state.queue[0]);
  const active = updateActiveSession(state.active, changed, 1);
  assert.deepEqual(restoreQueue(active)!.map(({ id }) => id), changed.map(({ id }) => id));
});

test("retomada recupera apenas attempts da identidade atual para o resumo", () => {
  const state = created();
  const resumed = resumeTrainingSession(state.active, [attempt("old"), attempt("session-a")], undefined)!;
  assert.deepEqual(resumed.attempts.map(({ sessionId }) => sessionId), ["session-a"]);
});

test("sessão concluída restaura diretamente com nextIndex no fim", () => {
  const state = created();
  const complete = updateActiveSession(state.active, state.queue, state.queue.length);
  assert.equal(resumeTrainingSession(complete, [], undefined)!.active.nextIndex, state.queue.length);
});

test("focus compatível retoma e focus diferente exige criação intencional", () => {
  const focused = createTrainingSession([], "range-reading", "focused", startedAt);
  assert.ok(resumeTrainingSession(focused.active, [], "range-reading"));
  assert.equal(resumeTrainingSession(focused.active, [], "sizing"), null);
  assert.equal(resumeTrainingSession(created().active, [], "range-reading"), null);
});

test("nova sessão pedagógica recebe identidade nova e usa histórico atualizado", () => {
  const first = created("first");
  const history = [attempt("first")];
  const second = createTrainingSession(history, undefined, "second", startedAt);
  assert.notEqual(first.active.sessionId, second.active.sessionId);
  assert.notDeepEqual(first.queue.map(({ id }) => id), second.queue.map(({ id }) => id));
});

test("validação rejeita estrutura, data, item, support, role e índices inválidos", () => {
  const valid = created().active;
  const invalid = [
    { ...valid, version: 2 }, { ...valid, sessionId: "" }, { ...valid, startedAt: "nope" },
    { ...valid, items: [] }, { ...valid, nextIndex: -1 }, { ...valid, nextIndex: valid.items.length + 1 },
    { ...valid, focus: "unknown" }, { ...valid, items: [{ ...valid.items[0], exerciseId: "missing" }] },
    { ...valid, items: [{ ...valid.items[0], support: "unknown" }] },
    { ...valid, items: [{ ...valid.items[0], sessionRole: "review" }] },
  ];
  invalid.forEach((value) => assert.equal(isActiveTrainingSession(value), false));
});

test("restore integral falha, em vez de produzir fila parcial", () => {
  const active = created().active;
  const corrupted = { ...active, items: [...active.items, { ...active.items[0], exerciseId: "missing" }] };
  assert.equal(restoreQueue(corrupted), null);
});

function installStorage(values: Map<string, string>) {
  Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage: {
    getItem: (key: string) => values.get(key) ?? null,
    removeItem: (key: string) => values.delete(key),
    setItem: (key: string, value: string) => values.set(key, value),
  } } });
}

test("JSON inválido no storage retorna null sem quebrar", () => {
  installStorage(new Map([[ACTIVE_SESSION_KEY, "{invalid"]]));
  assert.equal(readActiveTrainingSession(), null);
  delete (globalThis as { window?: unknown }).window;
});

test("estrutura inválida lida do storage é descartada", () => {
  installStorage(new Map([[ACTIVE_SESSION_KEY, JSON.stringify({ version: 1 })]]));
  assert.equal(readActiveTrainingSession(), null);
  delete (globalThis as { window?: unknown }).window;
});

test("reset remove attempts no formato anterior e active session", () => {
  const values = new Map([[ACTIVE_SESSION_KEY, "active"], ["poker-loop-v1:attempts", "[]"]]);
  installStorage(values);
  clearPrototypeProgress();
  assert.equal(values.size, 0);
  delete (globalThis as { window?: unknown }).window;
});
