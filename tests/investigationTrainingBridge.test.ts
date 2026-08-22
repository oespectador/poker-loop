import assert from "node:assert/strict";
import test from "node:test";
import { canExploreInvestigationInTraining, investigationTrainingLink, investigationTrainingSkillOptions } from "../lib/investigationTrainingBridge";
import { realHandSkillLabels } from "../lib/realHands";
import { createRealHandInvestigationEpisode } from "../lib/realHandInvestigationHistory";
import type { ActiveRealHandInvestigation } from "../lib/prospectiveRealHandInvestigation";
import type { ReasoningFactor, Skill } from "../lib/types";

function active(factor: ReasoningFactor, factorPresent = true): ActiveRealHandInvestigation {
  return {
    version: 1, id: `episode-${factor}`, factor, startedAt: "2026-08-22T00:00:00Z",
    baselineSnapshotIds: ["a", "b", "c"], baselineHandReviewIds: ["ha", "hb", "hc"],
    baselineReviewCount: 3, ...(factor === "automatic" ? {} : { baselineLowOrUnclearCount: 2 }),
    prospectiveReviews: Array.from({ length: 5 }, (_, index) => ({
      snapshotId: `future-${index}`, handReviewId: `future-hand-${index}`,
      createdAt: `2026-08-22T00:00:0${index + 1}Z`, factorPresent,
      ...(factor === "automatic" || !factorPresent ? {} : { selfRatedSupport: "low" as const }),
    })),
  };
}

test("somente episódios completed são elegíveis", () => {
  assert.equal(canExploreInvestigationInTraining("completed"), true);
  assert.equal(canExploreInvestigationInTraining("stopped"), false);
  assert.equal(canExploreInvestigationInTraining("inconclusive"), false);
});

test("a ponte começa sem foco e não produz destino sem escolha", () => {
  assert.equal(investigationTrainingLink("episode"), undefined);
});

test("todas as Skills atuais aparecem na ordem neutra dos labels humanos", () => {
  assert.deepEqual(investigationTrainingSkillOptions, Object.entries(realHandSkillLabels).map(([skill, label]) => ({ skill, label })));
});

test("cada escolha transporta Skill e episódio para o fluxo normal", () => {
  for (const { skill } of investigationTrainingSkillOptions) assert.equal(investigationTrainingLink("episode", skill), `/session?focus=${skill}&investigation=episode`);
});

test("fator e contagens diferentes não alteram opções nem selecionam foco", () => {
  const snapshots = (["size", "board", "player-read", "configuration", "automatic"] as ReasoningFactor[]).map((factor, index) =>
    createRealHandInvestigationEpisode({ ...active(factor, index % 2 === 0), ...(factor === "automatic" ? {} : { baselineLowOrUnclearCount: index % 4 }) }, "completed"),
  );
  const expected = investigationTrainingSkillOptions.map(({ skill }) => skill);
  for (const episode of snapshots) {
    assert.deepEqual(investigationTrainingSkillOptions.map(({ skill }) => skill), expected);
    assert.equal(investigationTrainingLink(episode.id), undefined);
    assert.equal(episode.completion, "completed");
  }
});

test("usar a ponte não modifica o episódio histórico", () => {
  const episode = createRealHandInvestigationEpisode(active("size"), "completed");
  const before = JSON.stringify(episode);
  assert.equal(investigationTrainingLink(episode.id, "sizing" satisfies Skill), `/session?focus=sizing&investigation=${episode.id}`);
  assert.equal(JSON.stringify(episode), before);
});
