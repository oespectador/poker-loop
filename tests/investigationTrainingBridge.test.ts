import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { canExploreInvestigationInTraining, getInvestigationTrainingSuggestions, getOtherInvestigationTrainingSkillOptions, investigationTrainingLink, investigationTrainingSkillOptions } from "../lib/investigationTrainingBridge";
import { createRealHandInvestigationEpisode, summarizeRealHandInvestigationEpisode } from "../lib/realHandInvestigationHistory";
import { realHandSkillLabels } from "../lib/realHands";
import type { ActiveRealHandInvestigation } from "../lib/prospectiveRealHandInvestigation";
import type { ReasoningFactor, Skill } from "../lib/types";

function completedWithoutRecurrence(factor: ReasoningFactor): ReturnType<typeof createRealHandInvestigationEpisode> {
  const investigation: ActiveRealHandInvestigation = {
    version: 1, id: `episode-zero-${factor}`, factor, startedAt: "2026-08-24T00:00:00.000Z",
    baselineSnapshotIds: ["b1", "b2", "b3"], baselineHandReviewIds: ["h1", "h2", "h3"], baselineReviewCount: 3,
    ...(factor === "automatic" ? {} : { baselineLowOrUnclearCount: 2 }),
    prospectiveReviews: Array.from({ length: 5 }, (_, index) => ({
      snapshotId: `s${index}`, handReviewId: `new-h${index}`, createdAt: `2026-08-25T00:00:0${index}.000Z`, factorPresent: false,
    })),
  };
  return createRealHandInvestigationEpisode(investigation, "completed");
}

const expected: Record<ReasoningFactor, readonly [Skill, "primary" | "secondary"][]> = {
  size: [["sizing", "primary"], ["integrated-decision", "secondary"]],
  board: [["board-reading", "primary"], ["integrated-decision", "secondary"]],
  "previous-actions": [["range-reading", "primary"], ["integrated-decision", "secondary"]],
  configuration: [["range-reading", "primary"], ["integrated-decision", "secondary"]],
  "player-read": [["range-reading", "primary"], ["integrated-decision", "secondary"]],
  automatic: [], other: [],
};

for (const [factor, mapping] of Object.entries(expected) as [ReasoningFactor, typeof expected[ReasoningFactor]][]) {
  test(`${factor}: mapa editorial ordenado`, () => {
    const suggestions = getInvestigationTrainingSuggestions(factor);
    assert.deepEqual(suggestions.map(({ skill, priority }) => [skill, priority]), mapping);
    assert.equal(new Set(suggestions.map(({ skill }) => skill)).size, suggestions.length);
    assert.ok(suggestions.every(({ skill }) => investigationTrainingSkillOptions.some((option) => option.skill === skill)));
  });
}

test("mapa é puro, determinístico e independente de episódios e contagens", () => {
  const before = JSON.stringify(getInvestigationTrainingSuggestions("size"));
  for (let index = 0; index < 5; index += 1) assert.equal(JSON.stringify(getInvestigationTrainingSuggestions("size")), before);
  const source = readFileSync("lib/investigationTrainingBridge.ts", "utf8");
  assert.doesNotMatch(source, /localStorage|from ["'][^"']*(?:storage|diagnostics|learningLoop|trainingEngine)|factorCount|lowOrUnclearCount|createActiveTrainingSession|registerLaunch/);
});

test("todas as Skills permanecem disponíveis entre relacionadas e outros focos", () => {
  for (const factor of Object.keys(expected) as ReasoningFactor[]) {
    const skills = [...getInvestigationTrainingSuggestions(factor), ...getOtherInvestigationTrainingSkillOptions(factor)].map(({ skill }) => skill);
    assert.deepEqual(new Set(skills), new Set(investigationTrainingSkillOptions.map(({ skill }) => skill)));
    assert.equal(skills.length, investigationTrainingSkillOptions.length);
  }
  assert.deepEqual(investigationTrainingSkillOptions, Object.entries(realHandSkillLabels).map(([skill, label]) => ({ skill, label })));
});

test("completed com factorCount zero mantém a ponte e o mapa depende somente de episode.factor", () => {
  const episode = completedWithoutRecurrence("size");
  assert.equal(episode.completion, "completed");
  assert.equal(summarizeRealHandInvestigationEpisode(episode).factorCount, 0);
  assert.equal(canExploreInvestigationInTraining(episode.completion), true);
  assert.deepEqual(getInvestigationTrainingSuggestions(episode.factor), getInvestigationTrainingSuggestions("size"));
  const withDifferentCounts = { ...episode, factorCount: 5, lowOrUnclearCount: 5 };
  assert.deepEqual(getInvestigationTrainingSuggestions(withDifferentCounts.factor), getInvestigationTrainingSuggestions(episode.factor));
});

test("somente completed pode explorar e a ponte começa sem foco", () => {
  assert.equal(canExploreInvestigationInTraining("completed"), true);
  assert.equal(canExploreInvestigationInTraining("stopped"), false);
  assert.equal(canExploreInvestigationInTraining("inconclusive"), false);
  assert.equal(investigationTrainingLink("episode"), undefined);
});

test("escolha explícita preserva o link existente", () => {
  for (const { skill } of investigationTrainingSkillOptions) assert.equal(investigationTrainingLink("episode / exact", skill), `/session?focus=${skill}&investigation=episode%20%2F%20exact`);
});

test("UI separa sugestões, escolhas neutras e disclosure sem criar launch ao renderizar", () => {
  const source = readFileSync("app/hands/page.tsx", "utf8");
  assert.match(source, /getInvestigationTrainingSuggestions\(episode\.factor\)/);
  assert.match(source, /Treinos relacionados/);
  assert.match(source, /Sugerido/);
  assert.match(source, /Você concluiu o acompanhamento de um padrão que decidiu observar/);
  assert.match(source, /não uma conclusão sobre a causa/);
  assert.doesNotMatch(source, /acompanhamento confirmou|padrão continuou aparecendo|observamos novamente esse padrão|acompanhamento observou um padrão|padrão foi validado/i);
  assert.match(source, /neutral \? investigationTrainingSkillOptions : otherOptions/);
  assert.match(source, /canExploreInvestigationInTraining\(episode\.completion\)/);
  assert.match(source, /trainingBridge\.skill === skill/);
  assert.doesNotMatch(source.slice(source.indexOf("bridgeIsOpen && (() =>")), /registerLaunchForNewTrainingSession|localStorage/);
});
