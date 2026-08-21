import { allExercises } from "./exercises";
import {
  summarizeDifficultyPatterns,
  summarizeDifficultyRecoveries,
  summarizeRecoveryVerification,
  type DiagnosticExercise,
  type DifficultyPatternSource,
} from "./diagnostics";
import type { Attempt } from "./types";

export type LearningLoopState = "reinforcement" | "recovered";

export interface LearningLoopItem {
  id: string;
  label: string;
  state: LearningLoopState;
  message: string;
  transfer?: { answered: number; correct: number };
  retention?: { answered: number; correct: number };
}

export interface LearningLoopSummary {
  items: LearningLoopItem[];
  emptyMessage?: string;
}

const identityLabels: Readonly<Record<string, string>> = {
  "reasoningPattern:action-updates-range": "Atualizar o range depois de cada ação",
  "reasoningPattern:action-without-function": "Evitar agir sem definir a função da mão",
  "reasoningPattern:ask-before-label": "Investigar a linha antes de rotular o range",
  "reasoningPattern:atualizar crença": "Atualizar a leitura com novas evidências",
  "reasoningPattern:avoid-action-shortcut": "Evitar atalhos entre ação e leitura de range",
  "reasoningPattern:avoid-label-to-action-shortcut": "Evitar transformar um rótulo em ação automática",
  "reasoningPattern:calibrate-range-signal": "Calibrar o peso das pistas sobre o range",
  "reasoningPattern:calibrate-strategy-update": "Ajustar a estratégia na medida da evidência",
  "reasoningPattern:compare-response-across-sizes": "Comparar a resposta das mãos entre tamanhos",
  "reasoningPattern:complete-decision-chain": "Completar a cadeia de raciocínio da decisão",
  "reasoningPattern:context-changes-action-meaning": "Ler o significado da ação dentro do contexto",
  "reasoningPattern:context-modulates-size-signal": "Interpretar o tamanho dentro do contexto",
  "reasoningPattern:contrast-lines": "Contrastar linhas para atualizar o range",
  "reasoningPattern:distinguir lógica de calibração": "Distinguir lógica de calibração",
  "reasoningPattern:distinguish-concepts": "Distinguir conceitos próximos na leitura de ranges",
  "reasoningPattern:incremental-risk-reward": "Comparar risco adicional e retorno esperado",
  "reasoningPattern:integrate-range-and-hand-function": "Conectar o range à função da mão",
  "reasoningPattern:logic-evidence-decision": "Conectar evidência, lógica e decisão",
  "reasoningPattern:match-hand-function-to-targets": "Relacionar a função da mão às mãos-alvo",
  "reasoningPattern:minimal-pair-context": "Perceber quando o contexto muda a decisão",
  "reasoningPattern:objective-action-fit": "Conectar objetivo e ação",
  "reasoningPattern:pesar evidência": "Pesar evidências antes de atualizar a estratégia",
  "reasoningPattern:premise-action-range": "Conectar premissas, ação e range",
  "reasoningPattern:range-label": "Distinguir força do range e presença do topo",
  "reasoningPattern:range-objective-action": "Conectar range, objetivo e ação",
  "reasoningPattern:range-target-response-size": "Escolher o tamanho pelas mãos-alvo",
  "reasoningPattern:reclassify-hand-by-range": "Reavaliar a função da mão contra ranges diferentes",
  "reasoningPattern:stack-range-strength-clues": "Combinar pistas sobre a força do range",
  "reasoningPattern:target-before-aggression": "Definir mãos-alvo antes de aumentar a agressão",
  "reasoningPattern:target-response-size": "Prever como as mãos-alvo respondem ao tamanho",
};

function identityId(source: DifficultyPatternSource, key: string): string {
  return `${source}:${key}`;
}

export function learningLoopLabel(source: DifficultyPatternSource, key: string): string {
  const id = identityId(source, key);
  const label = identityLabels[id];
  if (!label) throw new Error(`Identidade de aprendizagem sem label de apresentação: ${id}`);
  return label;
}

export function diagnosticIdentities(
  exercises: readonly DiagnosticExercise[] = allExercises,
): { source: DifficultyPatternSource; key: string }[] {
  const identities = new Map<string, { source: DifficultyPatternSource; key: string }>();
  for (const exercise of exercises) {
    if (exercise.purpose !== "development") continue;
    const source = exercise.reasoningPattern ? "reasoningPattern" : exercise.concept ? "concept" : undefined;
    const key = source === "reasoningPattern" ? exercise.reasoningPattern : exercise.concept;
    if (source && key) identities.set(identityId(source, key), { source, key });
  }
  return [...identities.values()].sort((a, b) => identityId(a.source, a.key).localeCompare(identityId(b.source, b.key)));
}

export function assertLearningLoopLabels(
  exercises: readonly DiagnosticExercise[] = allExercises,
): void {
  for (const identity of diagnosticIdentities(exercises)) learningLoopLabel(identity.source, identity.key);
}

export function summarizeLearningLoop(
  attempts: Attempt[],
  exercises: readonly DiagnosticExercise[] = allExercises,
): LearningLoopSummary {
  const recurring = summarizeDifficultyPatterns(attempts, exercises)
    .filter((pattern) => pattern.status === "recurring");
  const activeIds = new Set(recurring.map(({ source, key }) => identityId(source, key)));
  const verificationById = new Map(
    summarizeRecoveryVerification(attempts, exercises)
      .map((item) => [identityId(item.source, item.key), item]),
  );
  const reinforcementItems: (LearningLoopItem & { occurredAt: string })[] = recurring.map((pattern) => ({
    id: identityId(pattern.source, pattern.key),
    label: learningLoopLabel(pattern.source, pattern.key),
    state: "reinforcement",
    message: "Esse raciocínio apareceu como dificuldade recorrente em situações diferentes. O treino pode trazer novos exemplos relacionados.",
    occurredAt: pattern.lastAttemptAt,
  }));
  const recoveredItems: (LearningLoopItem & { occurredAt: string })[] = summarizeDifficultyRecoveries(attempts, exercises)
    .filter((recovery) => !activeIds.has(identityId(recovery.source, recovery.key)))
    .map((recovery) => {
      const verification = verificationById.get(identityId(recovery.source, recovery.key));
      return {
        id: identityId(recovery.source, recovery.key),
        label: learningLoopLabel(recovery.source, recovery.key),
        state: "recovered",
        message: "Você respondeu corretamente em novas tentativas independentes. Agora o treino observa se esse raciocínio se mantém em outra situação e depois de um intervalo.",
        transfer: verification?.transfer ?? { answered: 0, correct: 0 },
        retention: verification?.retention ?? { answered: 0, correct: 0 },
        occurredAt: recovery.recoveredAt,
      };
    });
  const newestFirst = (a: { occurredAt: string; id: string }, b: { occurredAt: string; id: string }) =>
    Date.parse(b.occurredAt) - Date.parse(a.occurredAt) || a.id.localeCompare(b.id);
  const items = [...reinforcementItems.sort(newestFirst), ...recoveredItems.sort(newestFirst)]
    .slice(0, 3)
    .map(({ occurredAt: _occurredAt, ...item }) => item);

  return items.length
    ? { items }
    : { items, emptyMessage: "Ainda estamos reunindo evidências suficientes para identificar padrões recorrentes no seu raciocínio." };
}
