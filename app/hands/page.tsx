"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { parseGgPokerCraftFile } from "@/lib/ggHandParser";
import { selectHandDetail, selectHandReviewSuggestions, suggestionToRealHandInput } from "@/lib/handSuggestions";
import { clearHandSuggestions, hasProcessedImport, readHandSuggestions, recordProcessedImport, removeHandSuggestion, writeHandSuggestions } from "@/lib/handSuggestionStorage";
import { createRealHand, deleteRealHand, readRealHands, realHandSkillLabels, realHandStreetLabels, saveRealHand, trainingLinkForHand, updateRealHand, validateRealHandInput } from "@/lib/realHands";
import type { HandReviewSuggestion, RealHandReview, RealHandReviewInput, RealHandStreet, Skill, StoredRealHandReasoningSnapshot } from "@/lib/types";
import { QuickReview } from "./QuickReview";
import { deleteReasoningSnapshotForHand, readReasoningSnapshots } from "@/lib/reasoningSnapshotStorage";
import { ParsedHandVisualization } from "../components/HandVisualization";
import { summarizeRealHandReviewPatterns } from "@/lib/realHandReviewPatterns";
import { deriveRealHandInvestigations } from "@/lib/realHandInvestigations";
import { reasoningFactorLabels } from "@/lib/realHandReasoning";
import { createActiveRealHandInvestigation, deriveProspectiveInvestigation, readActiveRealHandInvestigation, syncProspectiveInvestigation, writeActiveRealHandInvestigation, type ActiveRealHandInvestigation } from "@/lib/prospectiveRealHandInvestigation";
import { archiveRealHandInvestigation, readRealHandInvestigationHistory, summarizeRealHandInvestigationEpisode, type StoredRealHandInvestigationEpisode } from "@/lib/realHandInvestigationHistory";

const emptyForm: RealHandReviewInput = { rawHandText: "", doubt: "", rangeRead: "", objective: "", targetsAndSizeResponse: "" };
const cardLabel = (card: string) => card.replace("h", "♥").replace("d", "♦").replace("c", "♣").replace("s", "♠");
const dateLabel = (value: string) => new Date(value).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
async function fingerprint(text: string) { const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)); return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join(""); }

export default function HandsPage() {
  const [hands, setHands] = useState<RealHandReview[]>([]); const [suggestions, setSuggestions] = useState<HandReviewSuggestion[]>([]);
  const [selectedId, setSelectedId] = useState<string>(); const [selectedSuggestionId, setSelectedSuggestionId] = useState<string>();
  const [editingId, setEditingId] = useState<string>(); const [form, setForm] = useState<RealHandReviewInput>(emptyForm); const [message, setMessage] = useState("");
  const [importMessage, setImportMessage] = useState(""); const [importSummary, setImportSummary] = useState<{ recognized: number; ignored: number; selected: number }>();
  const [reasoningSnapshots, setReasoningSnapshots] = useState<StoredRealHandReasoningSnapshot[]>([]);
  const [openInvestigation, setOpenInvestigation] = useState<string>();
  const [activeInvestigation, setActiveInvestigation] = useState<ActiveRealHandInvestigation | null>(null);
  const [showObservedHands, setShowObservedHands] = useState(false);
  const [history, setHistory] = useState<StoredRealHandInvestigationEpisode[]>([]);
  const [openEpisodeId, setOpenEpisodeId] = useState<string>();
  useEffect(() => {
    const snapshots = readReasoningSnapshots(); const storedInvestigation = readActiveRealHandInvestigation();
    const syncedInvestigation = storedInvestigation ? syncProspectiveInvestigation(storedInvestigation, snapshots) : null;
    if (storedInvestigation && syncedInvestigation && syncedInvestigation !== storedInvestigation) writeActiveRealHandInvestigation(syncedInvestigation, true);
    setHands(readRealHands()); setSuggestions(readHandSuggestions()); setReasoningSnapshots(snapshots); setActiveInvestigation(syncedInvestigation); setHistory(readRealHandInvestigationHistory());
  }, []);
  const reviewPatterns = summarizeRealHandReviewPatterns(reasoningSnapshots);
  const investigations = deriveRealHandInvestigations(reasoningSnapshots);
  const prospectiveResult = deriveProspectiveInvestigation(activeInvestigation, reasoningSnapshots);
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
  function remove(hand: RealHandReview) { if (!window.confirm("Excluir esta mão registrada?")) return; deleteRealHand(hand.id); deleteReasoningSnapshotForHand(hand.id); setHands(readRealHands()); setReasoningSnapshots(readReasoningSnapshots()); setSelectedId(undefined); setEditingId(undefined); setMessage("Mão excluída. Seu progresso de treino não foi alterado."); }
  function follow(candidate: (typeof investigations)[number]) {
    if (activeInvestigation && activeInvestigation.factor !== candidate.factor && !window.confirm(`Você já está acompanhando ${reasoningFactorLabels[activeInvestigation.factor]}. Encerrar esse acompanhamento e começar ${candidate.factorLabel}?`)) return;
    if (activeInvestigation?.factor === candidate.factor) return;
    if (activeInvestigation) setHistory(archiveRealHandInvestigation(activeInvestigation, prospectiveResult?.status === "inconclusive" ? "inconclusive" : "stopped"));
    const next = createActiveRealHandInvestigation(candidate);
    writeActiveRealHandInvestigation(next); setActiveInvestigation(next); setShowObservedHands(false);
  }
  function endFollowing() {
    if (!activeInvestigation || !prospectiveResult) return;
    const completion = prospectiveResult.status === "inconclusive" ? "inconclusive" : prospectiveResult.reviewedCount === 5 ? "completed" : "stopped";
    setHistory(archiveRealHandInvestigation(activeInvestigation, completion)); setActiveInvestigation(null); setShowObservedHands(false);
  }
  function refreshSnapshots() {
    const snapshots = readReasoningSnapshots(); setReasoningSnapshots(snapshots);
    if (!activeInvestigation) return;
    const synced = syncProspectiveInvestigation(activeInvestigation, snapshots);
    if (synced !== activeInvestigation) { writeActiveRealHandInvestigation(synced, true); setActiveInvestigation(synced); }
  }
  return <AppShell>
    <section className="page-heading"><div className="eyebrow">MÃOS REAIS</div><h1>Do volume à próxima situação para considerar.</h1><p className="lead">Importações e mãos salvas são contexto para você. Elas não viram diagnóstico nem alteram seu progresso.</p></section>

    <section className="panel review-patterns" aria-labelledby="review-patterns-title"><div className="eyebrow">SUAS REVISÕES</div><h2 id="review-patterns-title">O que tem aparecido nas suas decisões</h2><p>Isso resume apenas o que você marcou durante as revisões. Não é uma avaliação de certo ou errado.</p><strong className="reviewed-count">{reviewPatterns.reviewedHands} {reviewPatterns.reviewedHands === 1 ? "decisão revisada" : "decisões revisadas"}</strong>{reviewPatterns.observations.length > 0 ? <ul className="review-observations">{reviewPatterns.observations.map((observation) => <li key={`${observation.kind}:${observation.text}`}>{observation.text}</li>)}</ul> : <p className="review-patterns-empty">{reviewPatterns.hasEnoughReviewsForObservations ? "Entre as revisões registradas, nenhum fator apareceu em pelo menos três decisões." : "Continue revisando mãos. Ainda há poucas revisões para destacar algo que tenha aparecido repetidamente."}</p>}</section>

    <section className="panel investigations" aria-labelledby="investigations-title"><div className="eyebrow">PARA INVESTIGAR</div><h2 id="investigations-title">Pontos que apareceram em várias revisões</h2><p>Essas são hipóteses baseadas no que você mesmo marcou nas suas mãos. Elas não indicam que uma decisão estava certa ou errada.</p>{investigations.length ? <div className="investigation-list">{investigations.map((candidate) => {
      const relatedHands = candidate.handReviewIds.map((id) => hands.find((hand) => hand.id === id)).filter((hand): hand is RealHandReview => Boolean(hand)).slice(0, 3);
      const isOpen = openInvestigation === candidate.factor;
      return <article className="investigation-card" key={candidate.factor}><div className="eyebrow">{candidate.factorLabel.toUpperCase()}</div><p>{candidate.text}</p><div className="investigation-actions"><button className="primary-cta compact" type="button" disabled={activeInvestigation?.factor === candidate.factor} onClick={() => follow(candidate)}>{activeInvestigation?.factor === candidate.factor ? "Acompanhamento ativo" : "Acompanhar nas próximas mãos"}</button>{relatedHands.length > 0 && <><button className="text-button" type="button" aria-expanded={isOpen} onClick={() => setOpenInvestigation(isOpen ? undefined : candidate.factor)}>Ver mãos relacionadas</button>{isOpen && <div className="related-hands">{relatedHands.map((hand) => <button type="button" className="hand-list-item" key={hand.id} onClick={() => openDetail("saved", hand.id)}><strong>{hand.title || "Mão registrada"}</strong><span>{new Date(hand.createdAt).toLocaleDateString("pt-BR")}{hand.street ? ` · ${realHandStreetLabels[hand.street]}` : ""}</span></button>)}</div>}</>}</div></article>;
    })}</div> : <p className="investigations-empty">Ainda não apareceu nenhum ponto com evidência suficiente no seu autorrelato para destacar como hipótese de investigação.</p>}</section>

    {activeInvestigation && prospectiveResult && <section className="panel active-investigation" aria-labelledby="active-investigation-title"><div className="eyebrow">ACOMPANHAMENTO ATIVO</div><h2 id="active-investigation-title">{reasoningFactorLabels[activeInvestigation.factor]}</h2><p>Vamos observar apenas as próximas decisões que você revisar. As mãos que criaram esta hipótese não entram novamente na contagem.</p><strong className="investigation-progress">{prospectiveResult.reviewedCount} de 5 novas decisões</strong><p>{prospectiveResult.text}</p><div className="investigation-actions">{prospectiveResult.observedHandReviewIds.some((id) => hands.some((hand) => hand.id === id)) && <button className="text-button" type="button" aria-expanded={showObservedHands} onClick={() => setShowObservedHands(!showObservedHands)}>Ver novas mãos observadas</button>}<button className={prospectiveResult.reviewedCount === 5 && prospectiveResult.status !== "inconclusive" ? "primary-cta compact" : "text-button danger-text"} type="button" onClick={endFollowing}>{prospectiveResult.reviewedCount === 5 && prospectiveResult.status !== "inconclusive" ? "Concluir acompanhamento" : "Encerrar acompanhamento"}</button></div>{showObservedHands && <div className="related-hands">{prospectiveResult.observedHandReviewIds.map((id) => hands.find((hand) => hand.id === id)).filter((hand): hand is RealHandReview => Boolean(hand)).map((hand) => <button type="button" className="hand-list-item" key={hand.id} onClick={() => openDetail("saved", hand.id)}><strong>{hand.title || "Mão registrada"}</strong><span>{new Date(hand.createdAt).toLocaleDateString("pt-BR")}{hand.street ? ` · ${realHandStreetLabels[hand.street]}` : ""}</span></button>)}</div>}</section>}

    <section className="panel investigation-history" aria-labelledby="investigation-history-title"><div className="eyebrow">HISTÓRICO DE INVESTIGAÇÕES</div><h2 id="investigation-history-title">O que você já acompanhou</h2>{history.length ? <div className="investigation-list">{history.map((episode) => {
      const summary = summarizeRealHandInvestigationEpisode(episode); const availableHands = episode.prospectiveReviews.map(({ handReviewId }) => hands.find(({ id }) => id === handReviewId)).filter((hand): hand is RealHandReview => Boolean(hand)); const isOpen = openEpisodeId === episode.id;
      const stateLabel = episode.completion === "completed" ? "Concluído" : episode.completion === "stopped" ? "Encerrado antes do fim" : "Inconclusivo";
      return <article className="investigation-card" key={episode.id}><div className="eyebrow">{reasoningFactorLabels[episode.factor].toUpperCase()}</div><strong>{stateLabel} · {new Date(episode.endedAt).toLocaleDateString("pt-BR")}</strong><p>{summary.text}</p>{availableHands.length > 0 && <div className="investigation-actions"><button className="text-button" type="button" aria-expanded={isOpen} onClick={() => setOpenEpisodeId(isOpen ? undefined : episode.id)}>Ver mãos observadas</button>{isOpen && <div className="related-hands">{availableHands.map((hand) => <button type="button" className="hand-list-item" key={hand.id} onClick={() => openDetail("saved", hand.id)}><strong>{hand.title || "Mão registrada"}</strong><span>{new Date(hand.createdAt).toLocaleDateString("pt-BR")}{hand.street ? ` · ${realHandStreetLabels[hand.street]}` : ""}</span></button>)}</div>}</div>}</article>;
    })}</div> : <p>Nenhum acompanhamento encerrado ainda.</p>}</section>

    <section className="panel import-panel"><div><div className="eyebrow">IMPORTAR SESSÃO GG/POKERCRAFT</div><h2>Separe até cinco situações, sem criar uma fila de mãos.</h2><p>Seu arquivo .txt é processado localmente neste navegador e não é enviado a um servidor.</p></div><label className={`primary-cta file-cta ${suggestions.length ? "disabled" : ""}`}>Escolher arquivo<input type="file" accept=".txt,text/plain" disabled={Boolean(suggestions.length)} onChange={(event) => { void importFile(event.target.files?.[0]); event.target.value = ""; }} /></label></section>
    {suggestions.length > 0 && <p className="form-message">Você ainda tem situações desta sessão para considerar. Salve ou descarte essas sugestões antes de importar outra sessão.</p>}
    {importMessage && <p className="form-message" role="status">{importMessage}</p>}
    {importSummary && <section className="import-summary" aria-live="polite"><div className="eyebrow">SESSÃO PROCESSADA</div><strong>{importSummary.recognized} mãos reconhecidas</strong><span>{importSummary.selected} situações separadas para você considerar{importSummary.ignored ? ` · ${importSummary.ignored} blocos ignorados com segurança` : ""}</span><p>Isso não significa que houve erro nessas mãos.</p></section>}

    <section className="section-block"><div className="suggestion-heading"><div><div className="eyebrow">SUGESTÕES DA SESSÃO</div><p className="lead">No máximo cinco situações escolhidas somente pela estrutura da mão.</p></div>{suggestions.length > 0 && <button className="text-button danger-text" type="button" onClick={discardAll}>Descartar todas as sugestões</button>}</div>
      {!suggestions.length && <p className="lead">Nenhuma sugestão pendente.</p>}<div className="suggestion-grid">{suggestions.map((item) => <article className="panel suggestion-card" key={item.id}><div className="hero-cards">{item.heroCards.map(cardLabel).join(" ")}</div><span>{dateLabel(item.playedAt)}</span><div className="eyebrow">{item.reasonLabel}</div><p>{item.reasonMessage}</p><div className="suggestion-actions"><button className="text-button" onClick={() => openDetail("suggestion", item.id)}>Ver mão</button><button className="text-button danger-text" onClick={() => discard(item)}>Descartar</button><button className="primary-cta compact" onClick={() => promote(item)}>Salvar para revisão</button></div></article>)}</div>
    </section>

    {selectedSuggestion && <article className="panel hand-detail"><div className="eyebrow">MÃO JOGADA</div><h2>{selectedSuggestion.heroCards.map(cardLabel).join(" ")} · {dateLabel(selectedSuggestion.playedAt)}</h2><ParsedHandVisualization rawHandText={selectedSuggestion.rawHandText}/><details className="raw-history"><summary>Ver histórico bruto</summary><pre className="raw-hand-text">{selectedSuggestion.rawHandText}</pre></details><div className="eyebrow reflection-heading">POR QUE ELA APARECEU AQUI?</div><h2>{selectedSuggestion.reasonLabel}</h2><p>{selectedSuggestion.reasonMessage}</p><p>Essa seleção considera apenas a estrutura da mão. Ela não indica que sua decisão foi correta ou incorreta.</p><div className="suggestion-actions"><button className="text-button danger-text" onClick={() => discard(selectedSuggestion)}>Descartar</button><button className="primary-cta compact" onClick={() => promote(selectedSuggestion)}>Salvar para revisão</button></div></article>}

    <section className="section-block"><div className="eyebrow">PARA REVISAR</div>{!hands.length && <p className="lead">Nenhuma mão salva para revisão ainda.</p>}<div className="hand-list">{hands.map((hand) => <button type="button" className="hand-list-item" key={hand.id} onClick={() => openDetail("saved", hand.id)}><strong>{hand.title || "Mão registrada"}</strong><span>{new Date(hand.createdAt).toLocaleDateString("pt-BR")}{hand.street ? ` · ${realHandStreetLabels[hand.street]}` : ""}</span>{hand.trainingFocus && <span>{realHandSkillLabels[hand.trainingFocus]}</span>}</button>)}</div></section>
    {selected && <article className="panel hand-detail"><div className="hand-detail-actions"><button className="text-button" type="button" onClick={() => edit(selected)}>Editar</button><button className="text-button danger-text" type="button" onClick={() => remove(selected)}>Excluir</button></div><div className="eyebrow">MÃO JOGADA</div><h2>{selected.title || "Mão registrada"}</h2><QuickReview key={`${selected.id}:${selected.rawHandText}`} hand={selected} onSnapshotSaved={refreshSnapshots}/><details className="raw-history"><summary>Ver histórico bruto</summary><pre className="raw-hand-text">{selected.rawHandText}</pre></details><details className="detailed-reflection"><summary>Adicionar ou ver reflexão detalhada</summary><div className="eyebrow reflection-heading">SUA REFLEXÃO</div><dl className="reflection-list"><div><dt>Onde ficou sua principal dúvida?</dt><dd>{selected.doubt || "Não informado."}</dd></div><div><dt>O que você acreditava sobre o range do Vilão naquele momento?</dt><dd>{selected.rangeRead || "Não informado."}</dd></div><div><dt>Qual era o seu objetivo com a ação?</dt><dd>{selected.objective || "Não informado."}</dd></div><div><dt>Quais mãos você estava tentando atingir e elas mudariam de decisão se o tamanho aumentasse?</dt><dd>{selected.targetsAndSizeResponse || "Não informado."}</dd></div></dl>{selected.trainingFocus ? <><p>Foco escolhido por você: <strong>{realHandSkillLabels[selected.trainingFocus]}</strong></p><Link className="primary-cta compact" href={trainingLinkForHand(selected)!}>Treinar este tema</Link></> : <p>Você pode voltar a esta mão depois e escolher um foco de treino.</p>}</details></article>}

    <details className="panel manual-entry section-block" open={Boolean(editingId)}><summary><span className="eyebrow">ADICIONAR MANUALMENTE</span><strong>{editingId ? "Editar reflexão" : "Registrar uma mão sem importar uma sessão"}</strong></summary><form onSubmit={submit} className="hand-form">
      <label>Histórico da mão <textarea required rows={10} value={form.rawHandText} onChange={(e) => change("rawHandText", e.target.value)} placeholder="Cole aqui o histórico bruto da mão." /></label><label>Título <input value={form.title ?? ""} onChange={(e) => change("title", e.target.value)} placeholder="BTN vs BB — dúvida no river" /></label><label>Onde ficou a principal dúvida? <select value={form.street ?? ""} onChange={(e) => change("street", (e.target.value || undefined) as RealHandStreet | undefined)}><option value="">Não informar</option>{Object.entries(realHandStreetLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Descreva sua principal dúvida <textarea rows={3} value={form.doubt} onChange={(e) => change("doubt", e.target.value)} /></label><label>O que você acreditava sobre o range do Vilão naquele momento? <textarea rows={3} value={form.rangeRead} onChange={(e) => change("rangeRead", e.target.value)} /></label><label>Qual era o seu objetivo com a ação? <textarea rows={3} value={form.objective} onChange={(e) => change("objective", e.target.value)} /></label><label>Quais mãos você estava tentando atingir e elas mudariam de decisão se o tamanho aumentasse? <textarea rows={3} value={form.targetsAndSizeResponse} onChange={(e) => change("targetsAndSizeResponse", e.target.value)} /></label><label>O que você gostaria de treinar a partir desta mão? <small>Esta é uma escolha sua, não um diagnóstico do Poker Loop.</small><select value={form.trainingFocus ?? ""} onChange={(e) => change("trainingFocus", (e.target.value || undefined) as Skill | undefined)}><option value="">Ainda não sei</option>{Object.entries(realHandSkillLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>{message && <p className="form-message" role="status">{message}</p>}<button className="primary-cta" type="submit">{editingId ? "Salvar alterações" : "Salvar mão"}</button>{editingId && <button type="button" className="text-button" onClick={() => { setEditingId(undefined); setForm(emptyForm); }}>Cancelar edição</button>}
    </form></details>
  </AppShell>;
}
