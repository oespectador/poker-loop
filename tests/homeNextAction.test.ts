import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { deriveHomeNextAction, type HomeOperationalState } from "../lib/homeNextAction";
import type { ActiveTrainingSession, Skill } from "../lib/types";

const page = readFileSync("app/page.tsx", "utf8");
const helper = readFileSync("lib/homeNextAction.ts", "utf8");
const handsPage = readFileSync("app/hands/page.tsx", "utf8");
const sessionPage = readFileSync("app/session/TrainingSession.tsx", "utf8");

const active = (nextIndex = 4, focus: Skill | null = "range-reading"): ActiveTrainingSession => ({
  version: 1,
  sessionId: "session-1",
  startedAt: "2026-08-23T00:00:00.000Z",
  focus,
  items: Array.from({ length: 12 }, (_, index) => ({ exerciseId: `exercise-${index}`, support: "independent" })),
  nextIndex,
});

const initial: HomeOperationalState = {
  activeTrainingSession: null,
  hasActiveInvestigation: false,
  hasActiveFollowUp: false,
  pendingSuggestionCount: 0,
  remainingImportCandidates: 0,
  recommendedFocus: "board-reading",
};

test("Home começa sem readiness operacional", () => assert.match(page, /const \[operationalReady, setOperationalReady\] = useState\(false\)/));
test("readiness só é confirmado depois de todas as leituras e atualizações", () => {
  const effect = page.slice(page.indexOf("useEffect(() =>"), page.indexOf("}, []);"));
  const readyAt = effect.indexOf("setOperationalReady(true)");
  for (const operation of ["readAttempts()", "readActiveTrainingSession()", "readActiveRealHandInvestigation()", "readPostTrainingRealHandFollowUps()", "readHandSuggestions()", "readActiveGgImportBatch()", "setAttempts(storedAttempts)", "setOperationalState("]) {
    assert.ok(effect.indexOf(operation) >= 0 && effect.indexOf(operation) < readyAt, `${operation} deve ocorrer antes do ready`);
  }
});
test("antes do ready a Hero é neutra e não renderiza CTA", () => {
  const preparation = page.slice(page.indexOf("if (!operationalReady)"), page.indexOf("const nextAction"));
  assert.match(preparation, /POKER LOOP/);
  assert.match(preparation, /Preparando seu próximo passo…/);
  assert.doesNotMatch(preparation, /<Link|primary-cta|Começar treino|Continuar treino|Ver fechamento|Ver acompanhamento|Continuar revisão|Continuar explorando/);
});
test("readiness permanece efêmero e não alcança o helper puro", () => {
  assert.doesNotMatch(helper, /operationalReady|Preparando seu próximo passo/);
  assert.doesNotMatch(page, /localStorage|sessionStorage|writeOperational|persistOperational/);
});

test("sessão incompleta é retomada com progresso factual", () => {
  const action = deriveHomeNextAction({ ...initial, activeTrainingSession: active() });
  assert.equal(action.kind, "resume-training");
  assert.equal(action.description, "4 de 12 decisões concluídas.");
  assert.equal(action.ctaLabel, "Continuar treino");
});
test("sessão completa leva ao fechamento sem classificar aprendizagem", () => {
  const action = deriveHomeNextAction({ ...initial, activeTrainingSession: active(12) });
  assert.equal(action.kind, "finish-training");
  assert.equal(action.title, "Seu fechamento está esperando.");
  assert.equal(action.ctaLabel, "Ver fechamento");
  assert.doesNotMatch(Object.values(action).join(" "), /dominou|aprendeu|consolidou/i);
});
for (const [name, override] of [
  ["investigação", { hasActiveInvestigation: true }],
  ["follow-up", { hasActiveFollowUp: true }],
  ["sugestões", { pendingSuggestionCount: 5 }],
  ["batch", { remainingImportCandidates: 32 }],
] as const) {
  test(`sessão ativa ganha de ${name}`, () => assert.equal(deriveHomeNextAction({ ...initial, ...override, activeTrainingSession: active() }).kind, "resume-training"));
}
test("investigação ativa sem sessão abre acompanhamento", () => assert.equal(deriveHomeNextAction({ ...initial, hasActiveInvestigation: true }).kind, "active-tracking"));
test("follow-up ativo sem sessão abre acompanhamento", () => assert.equal(deriveHomeNextAction({ ...initial, hasActiveFollowUp: true }).kind, "active-tracking"));
test("acompanhamento ganha de sugestões", () => assert.equal(deriveHomeNextAction({ ...initial, hasActiveFollowUp: true, pendingSuggestionCount: 5 }).kind, "active-tracking"));
test("acompanhamento ganha de batch", () => assert.equal(deriveHomeNextAction({ ...initial, hasActiveInvestigation: true, remainingImportCandidates: 32 }).kind, "active-tracking"));
test("sugestões pendentes abrem exploração com contagem factual", () => {
  const action = deriveHomeNextAction({ ...initial, pendingSuggestionCount: 5, remainingImportCandidates: 32 });
  assert.equal(action.kind, "explore-hands"); assert.equal(action.title, "5 situações estão esperando sua decisão."); assert.equal(action.ctaLabel, "Continuar revisão");
});
test("uma sugestão usa concordância singular", () => assert.equal(deriveHomeNextAction({ ...initial, pendingSuggestionCount: 1 }).title, "1 situação está esperando sua decisão."));
test("batch restante abre exploração com contagem factual", () => {
  const action = deriveHomeNextAction({ ...initial, remainingImportCandidates: 32 });
  assert.equal(action.kind, "explore-hands"); assert.equal(action.title, "32 outras situações ainda estão disponíveis no lote."); assert.equal(action.ctaLabel, "Continuar explorando");
});
test("fallback preserva treino recomendado e foco do motor fornecido", () => {
  const action = deriveHomeNextAction(initial);
  assert.equal(action.kind, "recommended-training"); assert.equal(action.href, "/session?focus=board-reading"); assert.equal(action.title, "Uma sessão curta. Um foco claro.");
});
test("sessão focada retoma com o focus persistido", () => assert.equal(deriveHomeNextAction({ ...initial, recommendedFocus: "sizing", activeTrainingSession: active(4, "range-reading") }).href, "/session?focus=range-reading"));
test("sessão sem focus retoma a URL sem query", () => assert.equal(deriveHomeNextAction({ ...initial, activeTrainingSession: active(4, null) }).href, "/session"));
test("helper é puro e não conhece storage ou motor", () => assert.doesNotMatch(helper, /localStorage|sessionStorage|trainingEngine|read[A-Z]|write[A-Z]/));
test("Home lê somente pelas APIs existentes e não escreve estados", () => {
  for (const reader of ["readAttempts", "readActiveTrainingSession", "readActiveRealHandInvestigation", "readPostTrainingRealHandFollowUps", "findActivePostTrainingRealHandFollowUp", "readHandSuggestions", "readActiveGgImportBatch", "remainingImportCandidates"]) assert.match(page, new RegExp(`${reader}\\(`));
  assert.doesNotMatch(page, /localStorage|sessionStorage|writeActiveTrainingSession|appendAttempts|writeActiveRealHandInvestigation|writePostTrainingRealHandFollowUps/);
});
test("Home navega por Link e mostra uma única CTA principal", () => {
  assert.match(page, /<Link href=\{nextAction\.href\} className="primary-cta">/);
  assert.equal((page.match(/className="primary-cta"/g) ?? []).length, 1);
});
test("Home não classifica leak ou fraqueza", () => assert.doesNotMatch(page + helper, /maior leak|maior fraqueza|corrija isso agora|treino funcionou/i));
test("integrações de hands e session permanecem presentes", () => {
  assert.match(handsPage, /chooseInitialHandsWorkspaceSection/);
  assert.match(sessionPage, /resumeTrainingSession\(readActiveTrainingSession\(\), history, focus\)/);
});
