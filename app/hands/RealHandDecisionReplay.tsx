"use client";

import { useMemo, useState } from "react";
import { HandVisualization } from "@/app/components/HandVisualization";
import { parseGgHand } from "@/lib/ggHandParser";
import { compareReplayAction, deriveRealHandReplayEligibility, replayActionLabels, type ReplayAction } from "@/lib/realHandDecisionReplay";
import type { RealHandReview, StoredRealHandReasoningSnapshot } from "@/lib/types";

export function RealHandDecisionReplay({ hand, snapshot }: { hand: RealHandReview; snapshot?: StoredRealHandReasoningSnapshot }) {
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState<ReplayAction>();
  const parsed = useMemo(() => parseGgHand(hand.rawHandText), [hand.rawHandText]);
  const replay = useMemo(() => parsed ? deriveRealHandReplayEligibility(parsed, snapshot) : null, [parsed, snapshot]);
  if (!parsed || !replay) return null;
  const comparison = choice ? compareReplayAction(replay.anchor, choice) : undefined;

  return <section className="decision-replay">
    <button className="primary-cta compact" type="button" aria-expanded={open} onClick={() => { setOpen((current) => !current); setChoice(undefined); }}>Rejogar esta decisão</button>
    {open && <div className="decision-replay-surface">
      <div className="eyebrow">REJOGAR DECISÃO</div>
      <h3>O que você faria agora?</h3>
      <p>Refaça a escolha usando apenas as informações disponíveis neste ponto da mão.</p>
      <HandVisualization hand={parsed} decision={replay.anchor} beforeDecision />
      {!choice ? <div className="decision-replay-actions" role="group" aria-label="Escolha uma ação">
        {replay.options.map((action) => <button type="button" key={action} onClick={() => setChoice(action)}>{replayActionLabels[action]}</button>)}
      </div> : <div className="decision-replay-result">
        <div><span>SUA ESCOLHA AGORA</span><strong>{replayActionLabels[choice]}</strong></div>
        <div><span>NA MESA</span><strong>{replayActionLabels[replay.anchor.action]}</strong></div>
        <p>{comparison === "same-action-family" ? "Você escolheu novamente o mesmo tipo de ação." : "Você escolheu um tipo de ação diferente desta vez."}</p>
        <small>Isso não indica qual decisão é melhor.</small>
        <div className="quick-actions"><button className="text-button" type="button" onClick={() => setChoice(undefined)}>Rejogar novamente</button><button className="text-button" type="button" onClick={() => { setChoice(undefined); setOpen(false); }}>Fechar replay</button></div>
      </div>}
    </div>}
  </section>;
}
