import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { describeRealHandWindowRelation, deriveRealHandWindowRelation, deriveRealHandWindowRelations } from "../lib/realHandWindowRelations";
import type { RealHandWindowComparison, WindowObservationSummary } from "../lib/realHandWindowComparisons";
import type { ReasoningFactor, Skill } from "../lib/types";

const comparison = (originalCount: number, posteriorCount: number, patch: Partial<RealHandWindowComparison> = {}): RealHandWindowComparison => ({
  episodeId: "episode", followUpId: "follow", sessionId: "session", factor: "size", skill: "sizing",
  original: { reviewedCount: 5, factorCount: originalCount }, posterior: { reviewedCount: 5, factorCount: posteriorCount },
  originalCompletedAt: "2026-08-10T00:00:00Z", posteriorCompletedAt: "2026-08-20T00:00:00Z", ...patch,
});
const relation = (originalCount: number, posteriorCount: number, patch: Partial<RealHandWindowComparison> = {}) => deriveRealHandWindowRelation(comparison(originalCount, posteriorCount, patch));

test("4/5 original e 2/5 posterior produz fewer", () => assert.equal(relation(4, 2)?.relation, "fewer"));
test("2/5 e 2/5 produz same", () => assert.equal(relation(2, 2)?.relation, "same"));
test("1/5 e 4/5 produz more", () => assert.equal(relation(1, 4)?.relation, "more"));
test("0/5 e 0/5 produz same", () => assert.equal(relation(0, 0)?.relation, "same"));
test("5/5 e 0/5 produz fewer", () => assert.equal(relation(5, 0)?.relation, "fewer"));
test("0/5 e 5/5 produz more", () => assert.equal(relation(0, 5)?.relation, "more"));
test("janela original diferente de cinco é rejeitada", () => assert.equal(relation(2, 1, { original: { reviewedCount: 4, factorCount: 2 } }), null));
test("janela posterior diferente de cinco é rejeitada", () => assert.equal(relation(2, 1, { posterior: { reviewedCount: 6, factorCount: 1 } }), null));
test("relação conserva identidades, fator e contagens", () => assert.deepEqual(relation(4, 2), { episodeId: "episode", followUpId: "follow", sessionId: "session", factor: "size", originalCount: 4, posteriorCount: 2, relation: "fewer" }));

test("relação depende somente de factorCount depois da defesa 5/5", () => {
  const summaries: WindowObservationSummary[] = [
    { reviewedCount: 5, factorCount: 3, supportRecordedCount: 3, lowOrUnclearCount: 3 },
    { reviewedCount: 5, factorCount: 3, supportRecordedCount: 0, lowOrUnclearCount: 0 },
  ];
  assert.equal(relation(0, 0, { original: summaries[0], posterior: summaries[1] })?.relation, "same");
});
test("lowOrUnclearCount não altera a direção", () => assert.equal(relation(0, 0, { original: { reviewedCount: 5, factorCount: 4, lowOrUnclearCount: 0 }, posterior: { reviewedCount: 5, factorCount: 2, lowOrUnclearCount: 2 } })?.relation, "fewer"));
test("supportRecordedCount não altera a direção", () => assert.equal(relation(0, 0, { original: { reviewedCount: 5, factorCount: 1, supportRecordedCount: 5 }, posterior: { reviewedCount: 5, factorCount: 4, supportRecordedCount: 0 } })?.relation, "more"));
test("Skill não altera a relação", () => { const skills: Skill[] = ["board-reading", "range-reading", "sizing", "integrated-decision"]; assert.deepEqual(skills.map((skill) => relation(4, 2, { skill })?.relation), skills.map(() => "fewer")); });
test("ReasoningFactor não determina Skill nem muda a regra", () => { const factors: ReasoningFactor[] = ["size", "board", "previous-actions", "configuration", "player-read", "automatic", "other"]; assert.deepEqual(factors.map((factor) => relation(1, 4, { factor, skill: "sizing" })?.relation), factors.map(() => "more")); });
test("Skill não determina ReasoningFactor", () => assert.equal(relation(2, 2, { factor: "board", skill: "sizing" })?.factor, "board"));
test("automatic usa a mesma comparação de ocorrência", () => assert.equal(relation(4, 1, { factor: "automatic" })?.relation, "fewer"));
test("automatic não recebe campos de suporte na relação", () => { const value = relation(4, 1, { factor: "automatic", original: { reviewedCount: 5, factorCount: 4, supportRecordedCount: 4 }, posterior: { reviewedCount: 5, factorCount: 1, lowOrUnclearCount: 1 } })!; assert.equal("supportRecordedCount" in value, false); assert.equal("lowOrUnclearCount" in value, false); });

test("copy fewer usa menos revisões", () => assert.match(describeRealHandWindowRelation(relation(4, 2)!).text, /menos revisões/));
test("copy same usa mesmo número de revisões", () => assert.match(describeRealHandWindowRelation(relation(2, 2)!).text, /mesmo número de revisões/));
test("copy more usa mais revisões", () => assert.match(describeRealHandWindowRelation(relation(1, 4)!).text, /mais revisões/));
test("copy inclui disclosure metodológico", () => assert.match(describeRealHandWindowRelation(relation(1, 4)!).disclosure, /apenas estas duas janelas de autorrelato.*Não permite concluir melhora, piora ou efeito do treino/));
test("copy não contém julgamentos proibidos", () => { const copy = ([relation(4, 2), relation(2, 2), relation(1, 4)] as const).map((item) => Object.values(describeRealHandWindowRelation(item!)).join(" ")).join(" "); for (const word of ["melhorou", "piorou", "funcionou", "eficaz", "progresso", "regressão", "sucesso", "fracasso", "corrigiu", "resolveu"]) assert.doesNotMatch(copy, new RegExp(word, "i")); });

test("múltiplas comparações produzem relações independentes na mesma ordem", () => { const values = deriveRealHandWindowRelations([comparison(4, 2, { followUpId: "b" }), comparison(1, 4, { followUpId: "a" }), comparison(2, 2, { followUpId: "c" })]); assert.deepEqual(values.map(({ followUpId, relation }) => [followUpId, relation]), [["b", "fewer"], ["a", "more"], ["c", "same"]]); });
test("lista omite defensivamente comparação inválida sem reordenar as válidas", () => { const invalid = comparison(1, 2, { original: { reviewedCount: 4, factorCount: 1 } }); assert.deepEqual(deriveRealHandWindowRelations([comparison(4, 2, { followUpId: "first" }), invalid, comparison(1, 4, { followUpId: "last" })]).map(({ followUpId }) => followUpId), ["first", "last"]); });
test("módulo é derivado, sem storage ou dependências pedagógicas", () => { const source = readFileSync("lib/realHandWindowRelations.ts", "utf8"); assert.doesNotMatch(source, /localStorage|_KEY|trainingEngine|diagnostics|learningLoop|Attempt|SkillState/); });
test("módulo recebe a comparação V0.26 e não reconstrói proveniência", () => { const source = readFileSync("lib/realHandWindowRelations.ts", "utf8"); assert.match(source, /RealHandWindowComparison/); assert.doesNotMatch(source, /StoredRealHandInvestigationEpisode|PostTrainingRealHandFollowUp|InvestigationTrainingLaunch|InvestigationTrainingCompletion/); });
test("UI é neutra, não contém setas, porcentagem ou delta numérico", () => { const source = readFileSync("app/hands/page.tsx", "utf8"); assert.match(source, /RELAÇÃO OBSERVADA/); assert.doesNotMatch(source, /↑|↓|%|diferença:\s*[-+]?\d|p\.p\./i); });
test("V0.27 não cria storage nem modifica schemas protegidos ou motor", () => { const files = ["lib/storage.ts", "lib/types.ts", "lib/trainingEngine.ts"]; const status = readFileSync("tests/realHandWindowRelations.test.ts", "utf8"); assert.ok(files.every((file) => status.includes(file))); assert.doesNotMatch(readFileSync("lib/realHandWindowRelations.ts", "utf8"), /version\s*:|localStorage|write[A-Z]|read[A-Z]/); });
