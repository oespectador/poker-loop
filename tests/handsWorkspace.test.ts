import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { chooseInitialHandsWorkspaceSection } from "../lib/handsWorkspace";

const page = readFileSync("app/hands/page.tsx", "utf8");
const nav = readFileSync("app/hands/HandsWorkspaceNav.tsx", "utf8");
const helper = readFileSync("lib/handsWorkspace.ts", "utf8");
const initial = { hasActiveInvestigation: false, hasActiveFollowUp: false, hasPendingSuggestions: false, hasRemainingImportCandidates: false };

test("workspace possui exatamente as três áreas por intenção", () => {
  assert.deepEqual([...nav.matchAll(/id: "(explore|review|track)", label: "([^"]+)"/g)].map((match) => match[2]), ["Explorar", "Revisar", "Acompanhar"]);
});
test("os três tabpanels permanecem montados com IDs estáveis e sem main aninhado", () => {
  const panelIds = [...page.matchAll(/<section id="(hands-panel-(?:explore|review|track))"[^>]*role="tabpanel"/g)].map((match) => match[1]).sort();
  assert.deepEqual(panelIds, ["hands-panel-explore", "hands-panel-review", "hands-panel-track"]);
  assert.equal((page.match(/role="tabpanel"/g) ?? []).length, 3);
  assert.doesNotMatch(page, /<main\s+id="hands-panel-/);
  assert.doesNotMatch(page, /workspaceSection === "(?:track|explore|review)" &&/);
});
test("painéis inativos usam hidden e somente a seleção atual é apresentada", () => {
  for (const section of ["explore", "review", "track"]) {
    assert.match(page, new RegExp(`id="hands-panel-${section}"[^>]*hidden=\\{workspaceSection !== "${section}"\\}`));
  }
  assert.equal((page.match(/hidden=\{workspaceSection !== "(?:explore|review|track)"\}/g) ?? []).length, 3);
});
test("cada aria-controls das tabs corresponde a um painel sempre presente", () => {
  const controlledIds = [...nav.matchAll(/aria-controls=\{`(hands-panel-\$\{section\.id\})`\}/g)].map((match) => match[1]);
  assert.deepEqual(controlledIds, ["hands-panel-${section.id}"]);
  for (const section of ["explore", "review", "track"]) assert.match(page, new RegExp(`id="hands-panel-${section}"`));
});
test("investigação ativa escolhe acompanhar", () => assert.equal(chooseInitialHandsWorkspaceSection({ ...initial, hasActiveInvestigation: true }), "track"));
test("follow-up ativo escolhe acompanhar", () => assert.equal(chooseInitialHandsWorkspaceSection({ ...initial, hasActiveFollowUp: true }), "track"));
test("sugestões pendentes escolhem explorar", () => assert.equal(chooseInitialHandsWorkspaceSection({ ...initial, hasPendingSuggestions: true }), "explore"));
test("batch com candidatas restantes escolhe explorar", () => assert.equal(chooseInitialHandsWorkspaceSection({ ...initial, hasRemainingImportCandidates: true }), "explore"));
test("sem estado acionável escolhe revisar", () => assert.equal(chooseInitialHandsWorkspaceSection(initial), "review"));
test("prioridade de acompanhamento antecede exploração", () => assert.equal(chooseInitialHandsWorkspaceSection({ ...initial, hasActiveInvestigation: true, hasPendingSuggestions: true }), "track"));
test("escolha inicial roda apenas no efeito de montagem e não observa atualizações", () => {
  assert.match(page, /useEffect\(\(\) => \{[\s\S]*setWorkspaceSection\(chooseInitialHandsWorkspaceSection[\s\S]*\}, \[\]\);/);
  assert.equal((page.match(/chooseInitialHandsWorkspaceSection\(/g) ?? []).length, 1);
});
test("salvar sugestão seleciona a mão e a leva para Revisar", () => {
  assert.match(page, /function promote[\s\S]*openDetail\("saved", saved\.id\)/);
  assert.match(page, /kind === "saved"\) setWorkspaceSection\("review"\)/);
});
test("mãos relacionadas usam a mesma navegação contextual para Revisar", () => assert.match(page, /related-hands[\s\S]*openDetail\("saved", hand\.id\)/));
test("Explorar contém importador, expansão e filtros V0.31", () => {
  const explore = page.slice(page.indexOf('id="hands-panel-explore"'), page.indexOf('id="hands-panel-review"'));
  assert.match(explore, /IMPORTAR SESSÃO GG\/POKERCRAFT/); assert.match(explore, /surfaceMore\(5\)/); assert.match(explore, /surfaceMore\(10\)/); assert.match(explore, /GG_EXPLORATION_FILTERS/);
});
test("Revisar contém mãos salvas, Quick Review e registro manual", () => {
  const review = page.slice(page.indexOf('id="hands-panel-review"'));
  assert.match(review, /PARA REVISAR/); assert.match(review, /<QuickReview/); assert.match(review, /ADICIONAR MANUALMENTE/);
});
test("Acompanhar contém padrões, investigações e histórico", () => {
  const track = page.slice(page.indexOf('id="hands-panel-track"'), page.indexOf('id="hands-panel-explore"'));
  assert.match(track, /SUAS REVISÕES/); assert.match(track, /PARA INVESTIGAR/); assert.match(track, /HISTÓRICO DE INVESTIGAÇÕES/);
});
test("navegação usa tabs acessíveis e teclado", () => {
  assert.match(nav, /role="tablist"/); assert.match(nav, /role="tab"/); assert.match(nav, /aria-selected/); assert.match(nav, /aria-controls/); assert.match(nav, /ArrowLeft/); assert.match(nav, /ArrowRight/); assert.match(nav, /Home/); assert.match(nav, /End/);
});
test("cada área contém seu empty state curto", () => {
  assert.match(page, /Importe uma sessão GG\/PokerCraft para separar situações que valem uma segunda olhada/);
  assert.match(page, /As mãos que você salvar para revisão aparecerão aqui/);
  assert.match(page, /Conforme você revisa mãos, padrões e acompanhamentos aparecem aqui/);
});
test("seção efêmera não cria storage", () => {
  assert.doesNotMatch(helper + nav, /localStorage|sessionStorage/);
  assert.doesNotMatch(page, /selectedHandsTab|lastHandsSection|workspaceSection["']/);
});
test("transições de importação existentes continuam persistidas", () => assert.ok((page.match(/persistGgImportTransition\(/g) ?? []).length >= 3));
