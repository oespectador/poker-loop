import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { toggleSuggestionExpansion } from "../lib/suggestionExpansion";

const component = readFileSync("app/hands/HandSuggestionCard.tsx", "utf8");
const page = readFileSync("app/hands/page.tsx", "utf8");
const css = readFileSync("app/globals.css", "utf8");

test("expansão troca a sugestão aberta e fecha a mesma sugestão", () => {
  assert.equal(toggleSuggestionExpansion(undefined, "a"), "a");
  assert.equal(toggleSuggestionExpansion("a", "b"), "b");
  assert.equal(toggleSuggestionExpansion("a", "a"), undefined);
});

test("resumo usa PokerCard, data e reasonLabel sem texto analítico ou board", () => {
  const compact = component.slice(0, component.indexOf("{expanded &&"));
  assert.match(compact, /suggestion\.heroCards\.map[\s\S]*?<PokerCard/);
  assert.match(compact, /<time[\s\S]*?suggestion\.playedAt/);
  assert.match(compact, /suggestion\.reasonLabel/);
  assert.doesNotMatch(compact, /reasonMessage|board|collected|winner|profit|loss/i);
  assert.doesNotMatch(compact, /heroCards\.join/);
});

test("ação principal é button com aria-expanded, sem associação a conteúdo ausente", () => {
  assert.match(component, /<button[^>]*aria-expanded=\{expanded\}[^>]*onClick=\{onToggle\}/);
  assert.doesNotMatch(component, /aria-controls|contentId/);
  assert.match(component, /Revisar situação/);
  assert.match(component, /!expanded[\s\S]*?>Salvar<\/button>[\s\S]*?>Descartar<\/button>/);
  assert.match(page, /expanded=\{selectedSuggestionId === item\.id\}/);
  assert.match(page, /toggleSuggestionExpansion\(current, item\.id\)/);
});

test("expansão reutiliza visualização completa, raw recolhido, motivo e ações", () => {
  assert.match(component, /return <article[\s\S]*?\{expanded && <div className="suggestion-expanded-content">[\s\S]*?<ParsedHandVisualization rawHandText=\{suggestion\.rawHandText\}/);
  assert.equal((component.match(/<ParsedHandVisualization/g) ?? []).length, 1);
  assert.match(component, /<details className="raw-history">[\s\S]*?<pre className="raw-hand-text">/);
  assert.match(component, /POR QUE ELA APARECEU AQUI\?/);
  assert.match(component, /suggestion\.reasonMessage/);
  assert.match(component, /Salvar para revisão/);
  assert.match(component, />Descartar<\/button>/);
  assert.match(component, />Fechar<\/button>/);
});

test("card aberto ocupa toda a grade e não introduz storage ou motor pedagógico", () => {
  assert.match(css, /\.suggestion-card\.expanded\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/);
  assert.doesNotMatch(component, /localStorage|sessionStorage|trainingEngine|learningLoop|Attempt|SkillState/);
});
