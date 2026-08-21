"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { parseGgPokerCraftFile } from "@/lib/ggHandParser";
import { selectHandDetail, selectHandReviewSuggestions, suggestionToRealHandInput } from "@/lib/handSuggestions";
import { clearHandSuggestions, hasProcessedImport, readHandSuggestions, recordProcessedImport, removeHandSuggestion, writeHandSuggestions } from "@/lib/handSuggestionStorage";
import { createRealHand, deleteRealHand, readRealHands, realHandSkillLabels, realHandStreetLabels, saveRealHand, trainingLinkForHand, updateRealHand, validateRealHandInput } from "@/lib/realHands";
import type { HandReviewSuggestion, RealHandReview, RealHandReviewInput, RealHandStreet, Skill } from "@/lib/types";
import { QuickReview } from "./QuickReview";
import { deleteReasoningSnapshotForHand } from "@/lib/reasoningSnapshotStorage";
import { ParsedHandVisualization } from "../components/HandVisualization";

const emptyForm: RealHandReviewInput = { rawHandText: "", doubt: "", rangeRead: "", objective: "", targetsAndSizeResponse: "" };
const cardLabel = (card: string) => card.replace("h", "♥").replace("d", "♦").replace("c", "♣").replace("s", "♠");
const dateLabel = (value: string) => new Date(value).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
async function fingerprint(text: string) { const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)); return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join(""); }

export default function HandsPage() {
  const [hands, setHands] = useState<RealHandReview[]>([]); const [suggestions, setSuggestions] = useState<HandReviewSuggestion[]>([]);
  const [selectedId, setSelectedId] = useState<string>(); const [selectedSuggestionId, setSelectedSuggestionId] = useState<string>();
  const [editingId, setEditingId] = useState<string>(); const [form, setForm] = useState<RealHandReviewInput>(emptyForm); const [message, setMessage] = useState("");
  const [importMessage, setImportMessage] = useState(""); const [importSummary, setImportSummary] = useState<{ recognized: number; ignored: number; selected: number }>();
  useEffect(() => { setHands(readRealHands()); setSuggestions(readHandSuggestions()); }, []);
  const selected = hands.find(({ id }) => id === selectedId); const selectedSuggestion = suggestions.find(({ id }) => id === selectedSuggestionId);
  function openDetail(kind: "saved" | "suggestion", id: string) { const next = selectHandDetail(kind, id); setSelectedId(next.selectedId); setSelectedSuggestionId(next.selectedSuggestionId); }
  function change<K extends keyof RealHandReviewInput>(key: K, value: RealHandReviewInput[K]) { setForm((current) => ({ ...current, [key]: value })); }
  async function importFile(file?: File) {
    if (!file) return; setImportMessage(""); setImportSummary(undefined);
    if (suggestions.length) return setImportMessage("Você ainda tem situações desta sessão para considerar. Salve ou descarte essas sugestões antes de importar outra sessão.");
    try {
      const text = await file.text(); const hash = await fingerprint(text);
      if (hasProcessedImport(hash)) return setImportMessage("Este arquivo já foi processado.");
      const result = parseGgPokerCraftFile(text); const next = selectHandReviewSuggestions(result.hands);
      writeHandSuggestions(next); recordProcessedImport(hash); setSuggestions(next); setImportSummary({ recognized: result.recognizedHands, ignored: result.ignoredHands, selected: next.length });
      if (!result.totalBlocks) setImportMessage("Nenhuma mão GG/PokerCraft reconhecível foi encontrada neste arquivo.");
    } catch { setImportMessage("Não foi possível processar este arquivo neste navegador."); }
  }
  function discard(item: HandReviewSuggestion) { removeHandSuggestion(item.id); setSuggestions(readHandSuggestions()); setSelectedSuggestionId(undefined); }
  function discardAll() { if (!window.confirm("Descartar todas as sugestões desta sessão?")) return; clearHandSuggestions(); setSuggestions([]); setSelectedSuggestionId(undefined); }
  function promote(item: HandReviewSuggestion) {
    try {
      const saved = saveRealHand(createRealHand(suggestionToRealHandInput(item))); removeHandSuggestion(item.id);
      setHands(readRealHands()); setSuggestions(readHandSuggestions()); openDetail("saved", saved.id); setMessage("Mão salva para revisão. Complete sua reflexão quando quiser.");
    } catch { setImportMessage("Não foi possível salvar esta mão no armazenamento deste navegador."); }
  }
  function submit(event: FormEvent) { event.preventDefault(); const validation = validateRealHandInput(form); if (validation) return setMessage(validation); try { const saved = editingId ? updateRealHand(editingId, form) : saveRealHand(createRealHand(form)); if (!saved) return setMessage("Esta mão não está mais disponível."); setHands(readRealHands()); openDetail("saved", saved.id); setEditingId(undefined); setForm(emptyForm); setMessage("Mão salva."); } catch { setMessage("Não foi possível salvar a mão no armazenamento deste navegador. Seus dados existentes não foram apagados."); } }
  function edit(hand: RealHandReview) { const { id: _id, createdAt: _createdAt, ...input } = hand; setEditingId(hand.id); setForm(input); setSelectedId(undefined); setSelectedSuggestionId(undefined); setMessage(""); }
  function remove(hand: RealHandReview) { if (!window.confirm("Excluir esta mão registrada?")) return; deleteRealHand(hand.id); deleteReasoningSnapshotForHand(hand.id); setHands(readRealHands()); setSelectedId(undefined); setEditingId(undefined); setMessage("Mão excluída. Seu progresso de treino não foi alterado."); }
  return <AppShell>
    <section className="page-heading"><div className="eyebrow">MÃOS REAIS</div><h1>Do volume à próxima situação para considerar.</h1><p className="lead">Importações e mãos salvas são contexto para você. Elas não viram diagnóstico nem alteram seu progresso.</p></section>

    <section className="panel import-panel"><div><div className="eyebrow">IMPORTAR SESSÃO GG/POKERCRAFT</div><h2>Separe até cinco situações, sem criar uma fila de mãos.</h2><p>Seu arquivo .txt é processado localmente neste navegador e não é enviado a um servidor.</p></div><label className={`primary-cta file-cta ${suggestions.length ? "disabled" : ""}`}>Escolher arquivo<input type="file" accept=".txt,text/plain" disabled={Boolean(suggestions.length)} onChange={(event) => { void importFile(event.target.files?.[0]); event.target.value = ""; }} /></label></section>
    {suggestions.length > 0 && <p className="form-message">Você ainda tem situações desta sessão para considerar. Salve ou descarte essas sugestões antes de importar outra sessão.</p>}
    {importMessage && <p className="form-message" role="status">{importMessage}</p>}
    {importSummary && <section className="import-summary" aria-live="polite"><div className="eyebrow">SESSÃO PROCESSADA</div><strong>{importSummary.recognized} mãos reconhecidas</strong><span>{importSummary.selected} situações separadas para você considerar{importSummary.ignored ? ` · ${importSummary.ignored} blocos ignorados com segurança` : ""}</span><p>Isso não significa que houve erro nessas mãos.</p></section>}

    <section className="section-block"><div className="suggestion-heading"><div><div className="eyebrow">SUGESTÕES DA SESSÃO</div><p className="lead">No máximo cinco situações escolhidas somente pela estrutura da mão.</p></div>{suggestions.length > 0 && <button className="text-button danger-text" type="button" onClick={discardAll}>Descartar todas as sugestões</button>}</div>
      {!suggestions.length && <p className="lead">Nenhuma sugestão pendente.</p>}<div className="suggestion-grid">{suggestions.map((item) => <article className="panel suggestion-card" key={item.id}><div className="hero-cards">{item.heroCards.map(cardLabel).join(" ")}</div><span>{dateLabel(item.playedAt)}</span><div className="eyebrow">{item.reasonLabel}</div><p>{item.reasonMessage}</p><div className="suggestion-actions"><button className="text-button" onClick={() => openDetail("suggestion", item.id)}>Ver mão</button><button className="text-button danger-text" onClick={() => discard(item)}>Descartar</button><button className="primary-cta compact" onClick={() => promote(item)}>Salvar para revisão</button></div></article>)}</div>
    </section>

    {selectedSuggestion && <article className="panel hand-detail"><div className="eyebrow">MÃO JOGADA</div><h2>{selectedSuggestion.heroCards.map(cardLabel).join(" ")} · {dateLabel(selectedSuggestion.playedAt)}</h2><ParsedHandVisualization rawHandText={selectedSuggestion.rawHandText}/><details className="raw-history"><summary>Ver histórico bruto</summary><pre className="raw-hand-text">{selectedSuggestion.rawHandText}</pre></details><div className="eyebrow reflection-heading">POR QUE ELA APARECEU AQUI?</div><h2>{selectedSuggestion.reasonLabel}</h2><p>{selectedSuggestion.reasonMessage}</p><p>Essa seleção considera apenas a estrutura da mão. Ela não indica que sua decisão foi correta ou incorreta.</p><div className="suggestion-actions"><button className="text-button danger-text" onClick={() => discard(selectedSuggestion)}>Descartar</button><button className="primary-cta compact" onClick={() => promote(selectedSuggestion)}>Salvar para revisão</button></div></article>}

    <section className="section-block"><div className="eyebrow">PARA REVISAR</div>{!hands.length && <p className="lead">Nenhuma mão salva para revisão ainda.</p>}<div className="hand-list">{hands.map((hand) => <button type="button" className="hand-list-item" key={hand.id} onClick={() => openDetail("saved", hand.id)}><strong>{hand.title || "Mão registrada"}</strong><span>{new Date(hand.createdAt).toLocaleDateString("pt-BR")}{hand.street ? ` · ${realHandStreetLabels[hand.street]}` : ""}</span>{hand.trainingFocus && <span>{realHandSkillLabels[hand.trainingFocus]}</span>}</button>)}</div></section>
    {selected && <article className="panel hand-detail"><div className="hand-detail-actions"><button className="text-button" type="button" onClick={() => edit(selected)}>Editar</button><button className="text-button danger-text" type="button" onClick={() => remove(selected)}>Excluir</button></div><div className="eyebrow">MÃO JOGADA</div><h2>{selected.title || "Mão registrada"}</h2><QuickReview key={`${selected.id}:${selected.rawHandText}`} hand={selected}/><details className="raw-history"><summary>Ver histórico bruto</summary><pre className="raw-hand-text">{selected.rawHandText}</pre></details><details className="detailed-reflection"><summary>Adicionar ou ver reflexão detalhada</summary><div className="eyebrow reflection-heading">SUA REFLEXÃO</div><dl className="reflection-list"><div><dt>Onde ficou sua principal dúvida?</dt><dd>{selected.doubt || "Não informado."}</dd></div><div><dt>O que você acreditava sobre o range do Vilão naquele momento?</dt><dd>{selected.rangeRead || "Não informado."}</dd></div><div><dt>Qual era o seu objetivo com a ação?</dt><dd>{selected.objective || "Não informado."}</dd></div><div><dt>Quais mãos você estava tentando atingir e elas mudariam de decisão se o tamanho aumentasse?</dt><dd>{selected.targetsAndSizeResponse || "Não informado."}</dd></div></dl>{selected.trainingFocus ? <><p>Foco escolhido por você: <strong>{realHandSkillLabels[selected.trainingFocus]}</strong></p><Link className="primary-cta compact" href={trainingLinkForHand(selected)!}>Treinar este tema</Link></> : <p>Você pode voltar a esta mão depois e escolher um foco de treino.</p>}</details></article>}

    <details className="panel manual-entry section-block" open={Boolean(editingId)}><summary><span className="eyebrow">ADICIONAR MANUALMENTE</span><strong>{editingId ? "Editar reflexão" : "Registrar uma mão sem importar uma sessão"}</strong></summary><form onSubmit={submit} className="hand-form">
      <label>Histórico da mão <textarea required rows={10} value={form.rawHandText} onChange={(e) => change("rawHandText", e.target.value)} placeholder="Cole aqui o histórico bruto da mão." /></label><label>Título <input value={form.title ?? ""} onChange={(e) => change("title", e.target.value)} placeholder="BTN vs BB — dúvida no river" /></label><label>Onde ficou a principal dúvida? <select value={form.street ?? ""} onChange={(e) => change("street", (e.target.value || undefined) as RealHandStreet | undefined)}><option value="">Não informar</option>{Object.entries(realHandStreetLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Descreva sua principal dúvida <textarea rows={3} value={form.doubt} onChange={(e) => change("doubt", e.target.value)} /></label><label>O que você acreditava sobre o range do Vilão naquele momento? <textarea rows={3} value={form.rangeRead} onChange={(e) => change("rangeRead", e.target.value)} /></label><label>Qual era o seu objetivo com a ação? <textarea rows={3} value={form.objective} onChange={(e) => change("objective", e.target.value)} /></label><label>Quais mãos você estava tentando atingir e elas mudariam de decisão se o tamanho aumentasse? <textarea rows={3} value={form.targetsAndSizeResponse} onChange={(e) => change("targetsAndSizeResponse", e.target.value)} /></label><label>O que você gostaria de treinar a partir desta mão? <small>Esta é uma escolha sua, não um diagnóstico do Poker Loop.</small><select value={form.trainingFocus ?? ""} onChange={(e) => change("trainingFocus", (e.target.value || undefined) as Skill | undefined)}><option value="">Ainda não sei</option>{Object.entries(realHandSkillLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>{message && <p className="form-message" role="status">{message}</p>}<button className="primary-cta" type="submit">{editingId ? "Salvar alterações" : "Salvar mão"}</button>{editingId && <button type="button" className="text-button" onClick={() => { setEditingId(undefined); setForm(emptyForm); }}>Cancelar edição</button>}
    </form></details>
  </AppShell>;
}
