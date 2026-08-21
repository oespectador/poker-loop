import assert from "node:assert/strict";
import test from "node:test";

import { allExercises } from "../lib/exercises";
import {
  assertLearningLoopLabels,
  diagnosticIdentities,
  learningLoopLabel,
  summarizeLearningLoop,
} from "../lib/learningLoop";
import type { DiagnosticExercise } from "../lib/diagnostics";
import type { Attempt } from "../lib/types";

const exercises: DiagnosticExercise[] = [
  { id: "a1", purpose: "development", reasoningPattern: "action-updates-range" },
  { id: "a2", purpose: "development", reasoningPattern: "action-updates-range" },
  { id: "a3", purpose: "development", reasoningPattern: "action-updates-range" },
  { id: "b1", purpose: "development", reasoningPattern: "objective-action-fit" },
  { id: "b2", purpose: "development", reasoningPattern: "objective-action-fit" },
  { id: "b3", purpose: "development", reasoningPattern: "objective-action-fit" },
  { id: "c1", purpose: "development", reasoningPattern: "target-response-size" },
  { id: "c2", purpose: "development", reasoningPattern: "target-response-size" },
  { id: "c3", purpose: "development", reasoningPattern: "target-response-size" },
  { id: "d1", purpose: "development", reasoningPattern: "range-label" },
  { id: "d2", purpose: "development", reasoningPattern: "range-label" },
  { id: "d3", purpose: "development", reasoningPattern: "range-label" },
  { id: "a-transfer", purpose: "transfer", reasoningPattern: "action-updates-range" },
  { id: "a-retention", purpose: "retention", reasoningPattern: "action-updates-range" },
];

let id = 0;
function attempt(exerciseId: string, minute: number, correct = false, sessionId = `s-${minute}`): Attempt {
  id += 1;
  return {
    id: `loop-${id}`, exerciseId, sessionId, primarySkill: "range-reading",
    answerId: correct ? "correct" : "wrong", correct, support: "independent",
    timestamp: new Date(Date.UTC(2026, 0, 1, 0, minute)).toISOString(),
  };
}

function recurring(prefix = "a", start = 1): Attempt[] {
  return [1, 2, 3].map((number, index) => attempt(`${prefix}${number}`, start + index, false, `errors-${index % 2}`));
}

function recovered(prefix = "a", start = 1): Attempt[] {
  return [
    ...recurring(prefix, start),
    attempt(`${prefix}1`, start + 3, true),
    attempt(`${prefix}2`, start + 4, true),
    attempt(`${prefix}1`, start + 5, true),
  ];
}

test("histórico vazio produz somente o estado vazio", () => {
  const summary = summarizeLearningLoop([], exercises);
  assert.deepEqual(summary.items, []);
  assert.match(summary.emptyMessage ?? "", /reunindo evidências suficientes/i);
});

test("candidate sozinho permanece invisível", () => {
  const summary = summarizeLearningLoop([attempt("a1", 1), attempt("a2", 2)], exercises);
  assert.equal(summary.items.length, 0);
});

test("recurring aparece como reinforcement sem thresholds", () => {
  const [item] = summarizeLearningLoop(recurring(), exercises).items;
  assert.equal(item.state, "reinforcement");
  assert.doesNotMatch(item.message, /3 erros|sessões|exercícios/i);
});

test("recurring usa label humana e não expõe a key", () => {
  const [item] = summarizeLearningLoop(recurring(), exercises).items;
  assert.equal(item.label, "Atualizar o range depois de cada ação");
  assert.equal(JSON.stringify(item).includes("action-updates-range"), true, "a identidade pode existir apenas no id estrutural");
  assert.doesNotMatch(`${item.label} ${item.message}`, /action-updates-range/);
});

test("recovery qualificada aparece como recovered com linguagem conservadora", () => {
  const [item] = summarizeLearningLoop(recovered(), exercises).items;
  assert.equal(item.state, "recovered");
  assert.match(item.message, /novas tentativas independentes/i);
  assert.doesNotMatch(`${item.label} ${item.message}`, /dominad|resolvid|mastery/i);
});

test("recovery sem evaluation registra ambas as ausências de observação", () => {
  const [item] = summarizeLearningLoop(recovered(), exercises).items;
  assert.deepEqual(item.transfer, { answered: 0, correct: 0 });
  assert.deepEqual(item.retention, { answered: 0, correct: 0 });
});

test("transfer e retention posteriores entram na contagem específica", () => {
  const history = recovered();
  history.push(attempt("a-transfer", 20, true), attempt("a-retention", 21, false));
  const [item] = summarizeLearningLoop(history, exercises).items;
  assert.deepEqual(item.transfer, { answered: 1, correct: 1 });
  assert.deepEqual(item.retention, { answered: 1, correct: 0 });
});

test("evaluation anterior a recoveredAt não entra na verificação", () => {
  const history = [attempt("a-transfer", 0, true), ...recovered("a", 2)];
  assert.deepEqual(summarizeLearningLoop(history, exercises).items[0].transfer, { answered: 0, correct: 0 });
});

test("novo recurring substitui visualmente recovery da mesma identidade", () => {
  const history = [...recovered(), ...recurring("a", 20)];
  const items = summarizeLearningLoop(history, exercises).items;
  assert.equal(items.length, 1);
  assert.equal(items[0].state, "reinforcement");
});

test("recurring de outra identidade não esconde recovery válida", () => {
  const items = summarizeLearningLoop([...recovered(), ...recurring("b", 20)], exercises).items;
  assert.deepEqual(items.map(({ state }) => state), ["reinforcement", "recovered"]);
});

test("recurring vem antes de recovered mesmo quando a recovery é mais recente", () => {
  const items = summarizeLearningLoop([...recurring("b", 1), ...recovered("a", 20)], exercises).items;
  assert.deepEqual(items.map(({ state }) => state), ["reinforcement", "recovered"]);
});

test("recoveries usam recência e identidade como desempate determinístico", () => {
  const history = [...recovered("a", 1), ...recovered("b", 20), ...recovered("c", 40)];
  const first = summarizeLearningLoop(history, exercises).items;
  const second = summarizeLearningLoop([...history].reverse(), exercises).items;
  assert.deepEqual(first.map(({ label }) => label), [
    learningLoopLabel("reasoningPattern", "target-response-size"),
    learningLoopLabel("reasoningPattern", "objective-action-fit"),
    learningLoopLabel("reasoningPattern", "action-updates-range"),
  ]);
  assert.deepEqual(second, first);
});

test("modelo limita a saída a três itens", () => {
  const history = [...recurring("a", 1), ...recurring("b", 10), ...recurring("c", 20), ...recurring("d", 30)];
  assert.equal(summarizeLearningLoop(history, exercises).items.length, 3);
});

test("inventário contém uma vez cada identidade diagnóstica da biblioteca", () => {
  const identities = diagnosticIdentities(allExercises);
  assert.equal(new Set(identities.map(({ source, key }) => `${source}:${key}`)).size, identities.length);
  assert.ok(identities.length > 0);
});

test("todas as identidades diagnósticas atuais possuem label humano", () => {
  assert.doesNotThrow(() => assertLearningLoopLabels(allExercises));
  for (const { source, key } of diagnosticIdentities(allExercises)) {
    assert.notEqual(learningLoopLabel(source, key), key);
  }
});

test("identidade desconhecida falha explicitamente sem fallback técnico", () => {
  const unknown: DiagnosticExercise[] = [
    { id: "unknown", purpose: "development", concept: "internal-concept" },
  ];
  assert.throws(() => assertLearningLoopLabels(unknown), /sem label de apresentação/);
  assert.throws(() => learningLoopLabel("concept", "internal-concept"), /sem label de apresentação/);
});

test("reasoningPattern e concept nunca são usados como label bruto", () => {
  for (const { source, key } of diagnosticIdentities(allExercises)) {
    const label = learningLoopLabel(source, key);
    assert.notEqual(label, key);
    assert.equal(label.includes(`${source}:`), false);
  }
});
