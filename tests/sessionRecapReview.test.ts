import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const component = readFileSync("app/session/SessionRecapReview.tsx", "utf8");
const trainingSession = readFileSync("app/session/TrainingSession.tsx", "utf8");
const recapModule = readFileSync("lib/sessionRecap.ts", "utf8");

test("feedback começa oculto e depende do estado local de reveal", () => {
  assert.match(component, /review\.revealed && <p[^>]+id=\{feedbackId\}>\{item\.feedback\}<\/p>/);
  assert.doesNotMatch(component, /<p>\{item\.feedback\}<\/p>/);
});

test("botão de reveal aparece antes da ideia central", () => {
  assert.match(component, /!review\.revealed && \([\s\S]*Ver ideia central[\s\S]*review\.revealed &&/);
});

test("reveal mostra exatamente o feedback autoral recebido", () => {
  assert.match(component, />\{item\.feedback\}<\/p>/);
  assert.doesNotMatch(component, /feedback\.(short|misconception)/);
});

test("estado de reveal e reflexão é indexado independentemente pelo id do item", () => {
  assert.match(component, /Record<string, ItemReviewState>/);
  assert.match(component, /\[itemId\]: \{ revealed: true/);
  assert.match(component, /reviewByItem\[item\.id\]/);
});

test("revelar um item preserva a reflexão e não altera os demais", () => {
  assert.match(component, /\.\.\.current,[\s\S]*\[itemId\]: \{ revealed: true, reflection: current\[itemId\]\?\.reflection \?\? "" \}/);
});

test("reflexão escrita é opcional e reveal aceita campo vazio", () => {
  assert.match(component, /Uma frase antes de revelar \(opcional\)/);
  assert.match(component, /reflection: current\[itemId\]\?\.reflection \?\? ""/);
  assert.doesNotMatch(component, /required/);
});

test("textarea limita a reflexão a 180 caracteres", () => {
  assert.match(component, /<textarea[\s\S]*maxLength=\{180\}/);
});

test("reflexão e reveal não são persistidos nem enviados", () => {
  assert.doesNotMatch(component, /localStorage|sessionStorage|fetch\(|XMLHttpRequest|navigator\.sendBeacon|analytics/i);
});

test("interação não cria nem registra Attempt", () => {
  assert.doesNotMatch(component, /\bAttempt\b|appendAttempts|answerId|correct:/);
});

test("sair sem reveal não possui efeito de cleanup", () => {
  assert.doesNotMatch(component, /useEffect|beforeunload|pagehide|unmount/i);
});

test("acerto posterior permanece fato e não controla o reveal", () => {
  assert.match(component, /item\.laterCorrectInSession[\s\S]*houve um acerto posterior/);
  assert.doesNotMatch(component, /revealed:\s*item\.laterCorrectInSession/);
});

test("item sem acerto posterior mantém a mesma possibilidade de reveal", () => {
  assert.match(component, /onClick=\{\(\) => reveal\(item\.id\)\}/);
  assert.match(component, /não voltou a aparecer com acerto/);
});

test("sessão sem erros não cria controles artificiais", () => {
  assert.match(component, /items\.length \? \([\s\S]*\) : \([\s\S]*Nenhum erro foi registrado nesta sessão/);
});

test("integração mantém no máximo três itens e a ordem recebida", () => {
  assert.match(trainingSession, /const visibleRecapItems = recap\.items\.slice\(0, 3\)/);
  assert.match(component, /items\.map\(\(item, index\)/);
  assert.doesNotMatch(component, /\.sort\(|\.reverse\(/);
});

test("contagem dos raciocínios restantes continua visível", () => {
  assert.match(component, /remainingCount > 0[\s\S]*Outros \{remainingCount\} raciocínios/);
});

test("componente não importa domínios pedagógicos ou de mãos reais proibidos", () => {
  assert.doesNotMatch(component, /diagnostics|trainingEngine|realHand|investigation/i);
});

test("copy convida a lembrar antes de revelar sem tom de avaliação", () => {
  assert.match(component, /tente lembrar/);
  assert.match(component, /antes de revelar/i);
  assert.doesNotMatch(component, /\bteste\b|avaliação|mastery|dominou|aprendeu|recuperou|retenção comprovada/i);
});

test("botão possui associação acessível com o feedback", () => {
  assert.match(component, /aria-controls=\{feedbackId\}/);
  assert.match(component, /aria-expanded=\{false\}/);
  assert.match(component, /id=\{feedbackId\}/);
});

test("textarea possui label acessível associada", () => {
  assert.match(component, /<label htmlFor=\{reflectionId\}>/);
  assert.match(component, /<textarea[\s\S]*id=\{reflectionId\}/);
});

test("SessionRecap continua factual e sem estado de interface", () => {
  assert.doesNotMatch(recapModule, /revealed|reflection|recalled|remembered/);
  assert.match(recapModule, /feedback: attemptFeedback\(attempt, exercise\)/);
});
