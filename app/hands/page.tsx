"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { createRealHand, deleteRealHand, readRealHands, realHandSkillLabels, realHandStreetLabels, saveRealHand, trainingLinkForHand, updateRealHand, validateRealHandInput } from "@/lib/realHands";
import type { RealHandReview, RealHandReviewInput, RealHandStreet, Skill } from "@/lib/types";

const emptyForm: RealHandReviewInput = { rawHandText: "", doubt: "", rangeRead: "", objective: "", targetsAndSizeResponse: "" };

export default function HandsPage() {
  const [hands, setHands] = useState<RealHandReview[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [editingId, setEditingId] = useState<string>();
  const [form, setForm] = useState<RealHandReviewInput>(emptyForm);
  const [message, setMessage] = useState("");
  useEffect(() => setHands(readRealHands()), []);
  const selected = hands.find(({ id }) => id === selectedId);
  function change<K extends keyof RealHandReviewInput>(key: K, value: RealHandReviewInput[K]) { setForm((current) => ({ ...current, [key]: value })); }
  function submit(event: FormEvent) {
    event.preventDefault();
    const validation = validateRealHandInput(form);
    if (validation) return setMessage(validation);
    try {
      const saved = editingId ? updateRealHand(editingId, form) : saveRealHand(createRealHand(form));
      if (!saved) return setMessage("Esta mão não está mais disponível.");
      setHands(readRealHands()); setSelectedId(saved.id); setEditingId(undefined); setForm(emptyForm); setMessage("Mão salva.");
    } catch { setMessage("Não foi possível salvar a mão no armazenamento deste navegador. Seus dados existentes não foram apagados."); }
  }
  function edit(hand: RealHandReview) {
    const { id: _id, createdAt: _createdAt, ...input } = hand;
    setEditingId(hand.id); setForm(input); setSelectedId(undefined); setMessage("");
  }
  function remove(hand: RealHandReview) {
    if (!window.confirm("Excluir esta mão registrada?")) return;
    deleteRealHand(hand.id); setHands(readRealHands()); setSelectedId(undefined); setEditingId(undefined);
    setMessage("Mão excluída. Seu progresso de treino não foi alterado.");
  }
  return <AppShell>
    <section className="page-heading"><div className="eyebrow">MÃOS REAIS</div><h1>Da mão jogada para uma reflexão clara.</h1><p className="lead">Este registro é contexto para você. Ele não vira diagnóstico nem altera seu progresso.</p></section>
    <div className="hands-layout">
      <section className="panel hand-form-panel"><div className="eyebrow">{editingId ? "EDITAR REFLEXÃO" : "REGISTRAR NOVA MÃO"}</div><form onSubmit={submit} className="hand-form">
        <label>Histórico da mão <textarea required rows={10} value={form.rawHandText} onChange={(e) => change("rawHandText", e.target.value)} placeholder="Cole aqui o histórico bruto da mão." /></label>
        <label>Título <input value={form.title ?? ""} onChange={(e) => change("title", e.target.value)} placeholder="BTN vs BB — dúvida no river" /></label>
        <label>Onde ficou a principal dúvida? <select value={form.street ?? ""} onChange={(e) => change("street", (e.target.value || undefined) as RealHandStreet | undefined)}><option value="">Não informar</option>{Object.entries(realHandStreetLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>Onde ficou sua principal dúvida? <textarea rows={3} value={form.doubt} onChange={(e) => change("doubt", e.target.value)} /></label>
        <label>O que você acreditava sobre o range do Vilão naquele momento? <textarea rows={3} value={form.rangeRead} onChange={(e) => change("rangeRead", e.target.value)} /></label>
        <label>Qual era o seu objetivo com a ação? <small>Por exemplo: extrair value, fazer mãos melhores abandonarem, realizar equidade, chegar ao showdown ou ainda não estava claro.</small><textarea rows={3} value={form.objective} onChange={(e) => change("objective", e.target.value)} /></label>
        <label>Quais mãos você estava tentando atingir e elas mudariam de decisão se o tamanho aumentasse? <textarea rows={3} value={form.targetsAndSizeResponse} onChange={(e) => change("targetsAndSizeResponse", e.target.value)} /></label>
        <label>O que você gostaria de treinar a partir desta mão? <small>Esta é uma escolha sua, não um diagnóstico do Poker Loop.</small><select value={form.trainingFocus ?? ""} onChange={(e) => change("trainingFocus", (e.target.value || undefined) as Skill | undefined)}><option value="">Ainda não sei</option>{Object.entries(realHandSkillLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        {message && <p className="form-message" role="status">{message}</p>}<button className="primary-cta" type="submit">{editingId ? "Salvar alterações" : "Salvar mão"}</button>{editingId && <button type="button" className="text-button" onClick={() => { setEditingId(undefined); setForm(emptyForm); }}>Cancelar edição</button>}
      </form></section>
      <section className="hands-library"><div className="eyebrow">MÃOS REGISTRADAS</div>{!hands.length && <p className="lead">Nenhuma mão registrada ainda.</p>}<div className="hand-list">{hands.map((hand) => <button type="button" className="hand-list-item" key={hand.id} onClick={() => setSelectedId(hand.id)}><strong>{hand.title || "Mão registrada"}</strong><span>{new Date(hand.createdAt).toLocaleDateString("pt-BR")}{hand.street ? ` · ${realHandStreetLabels[hand.street]}` : ""}</span>{hand.trainingFocus && <span>{realHandSkillLabels[hand.trainingFocus]}</span>}</button>)}</div></section>
    </div>
    {selected && <article className="panel hand-detail"><div className="hand-detail-actions"><button className="text-button" type="button" onClick={() => edit(selected)}>Editar</button><button className="text-button danger-text" type="button" onClick={() => remove(selected)}>Excluir</button></div><div className="eyebrow">MÃO JOGADA</div><h2>{selected.title || "Mão registrada"}</h2><pre className="raw-hand-text">{selected.rawHandText}</pre><div className="eyebrow reflection-heading">SUA REFLEXÃO</div><dl className="reflection-list"><div><dt>Onde ficou sua principal dúvida?</dt><dd>{selected.doubt || "Não informado."}</dd></div><div><dt>O que você acreditava sobre o range do Vilão naquele momento?</dt><dd>{selected.rangeRead || "Não informado."}</dd></div><div><dt>Qual era o seu objetivo com a ação?</dt><dd>{selected.objective || "Não informado."}</dd></div><div><dt>Quais mãos você estava tentando atingir e elas mudariam de decisão se o tamanho aumentasse?</dt><dd>{selected.targetsAndSizeResponse || "Não informado."}</dd></div></dl>{selected.trainingFocus ? <><p>Foco escolhido por você: <strong>{realHandSkillLabels[selected.trainingFocus]}</strong></p><Link className="primary-cta compact" href={trainingLinkForHand(selected)!}>Treinar este tema</Link></> : <p>Você pode voltar a esta mão depois e escolher um foco de treino.</p>}</article>}
  </AppShell>;
}
