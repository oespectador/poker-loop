import { allExercises, developmentExercises, evaluationExercises } from "./exercises";
import type { Attempt, Exercise, LearningPackage, Skill, SkillState, SupportLevel } from "./types";

export const skillLabels: Record<Skill, string> = {
  "board-reading": "Leitura do board",
  "range-reading": "Leitura de range",
  sizing: "Sizing",
  "integrated-decision": "Decisão integrada",
};

const exerciseById = new Map(allExercises.map((exercise) => [exercise.id, exercise]));

const INTRO_BLOCK_SIZE = 4;
const RETENTION_INTERVAL_MS = 24 * 60 * 60 * 1000;

const LEARNING_PACKAGE_ORDER: LearningPackage[] = ["range-actions", "range-to-decision", "calibration"];

const PACKAGE_FOCUS: Partial<Record<LearningPackage, Skill>> = {
  "range-actions": "range-reading",
  "range-to-decision": "integrated-decision",
  calibration: "range-reading",
};

const PACKAGE_REDUNDANT_ITEMS: Partial<Record<LearningPackage, Set<string>>> = {
  "range-actions": new Set(["dev-range-03", "dev-range-04"]),
  "range-to-decision": new Set(["dev-sizing-02", "dev-sizing-03"]),
};

function packageExercises(packageName: LearningPackage) {
  return developmentExercises
    .filter((exercise) => exercise.learningPackage === packageName)
    .sort((a, b) => (a.packageSequence ?? 999) - (b.packageSequence ?? 999));
}

function hasUnseenPackage(attempts: Attempt[], packageName: LearningPackage): boolean {
  const seen = new Set(attempts.map((attempt) => attempt.exerciseId));
  return packageExercises(packageName).some((exercise) => !seen.has(exercise.id));
}

export function hasUnseenRangeActionPackage(attempts: Attempt[]): boolean {
  return hasUnseenPackage(attempts, "range-actions");
}

export function hasUnseenRangeToDecisionPackage(attempts: Attempt[]): boolean {
  return hasUnseenPackage(attempts, "range-to-decision");
}

function pendingLearningPackage(attempts: Attempt[]): LearningPackage | undefined {
  return LEARNING_PACKAGE_ORDER.find((packageName) => hasUnseenPackage(attempts, packageName));
}

function developmentAttempts(attempts: Attempt[]): Attempt[] {
  return attempts.filter((attempt) => exerciseById.get(attempt.exerciseId)?.purpose === "development");
}

export function relatedDevelopmentExercises(evaluation: Exercise): Exercise[] {
  const sameConcept = evaluation.concept
    ? developmentExercises.filter((exercise) => exercise.concept === evaluation.concept)
    : [];

  return sameConcept.length
    ? sameConcept
    : developmentExercises.filter((exercise) => exercise.primarySkill === evaluation.primarySkill);
}

function hasIndependentBaseEvidence(evaluation: Exercise, attempts: Attempt[]) {
  const relatedIds = new Set(relatedDevelopmentExercises(evaluation).map((exercise) => exercise.id));
  const evidence = attempts.filter(
    (attempt) =>
      relatedIds.has(attempt.exerciseId) && attempt.correct && attempt.support === "independent",
  );

  return {
    sufficient: evidence.length >= 2 && new Set(evidence.map((attempt) => attempt.sessionId)).size >= 2,
    latestAt: evidence.length
      ? Math.max(...evidence.map((attempt) => timestampValue(attempt.timestamp)))
      : 0,
  };
}

function unansweredEvaluationExercises(attempts: Attempt[], purpose: "retention" | "transfer") {
  const answeredIds = new Set(attempts.map((attempt) => attempt.exerciseId));
  return evaluationExercises.filter(
    (exercise) => exercise.purpose === purpose && !answeredIds.has(exercise.id),
  );
}

export function eligibleRetentionExercises(attempts: Attempt[], now = Date.now()): Exercise[] {
  if (pendingLearningPackage(attempts)) return [];

  return unansweredEvaluationExercises(attempts, "retention").filter((exercise) => {
    const evidence = hasIndependentBaseEvidence(exercise, attempts);
    return evidence.sufficient && evidence.latestAt > 0 && now - evidence.latestAt >= RETENTION_INTERVAL_MS;
  });
}

export function eligibleTransferExercises(attempts: Attempt[]): Exercise[] {
  if (pendingLearningPackage(attempts)) return [];
  return unansweredEvaluationExercises(attempts, "transfer").filter(
    (exercise) => hasIndependentBaseEvidence(exercise, attempts).sufficient,
  );
}

function selectEvaluation(items: Exercise[], focus?: Skill): Exercise | undefined {
  return items.find((exercise) => exercise.primarySkill === focus) ?? items[0];
}

function unseenPackageExercises(attempts: Attempt[], packageName: LearningPackage): Exercise[] {
  const seen = new Set(attempts.map((attempt) => attempt.exerciseId));
  return packageExercises(packageName).filter((exercise) => !seen.has(exercise.id));
}

function currentIntroBlock(attempts: Attempt[], packageName: LearningPackage): Exercise[] {
  const unseen = unseenPackageExercises(attempts, packageName);
  const firstUnseen = unseen[0];
  if (!firstUnseen) return [];

  const sequence = firstUnseen.packageSequence ?? 1;
  const blockStart = Math.floor((sequence - 1) / INTRO_BLOCK_SIZE) * INTRO_BLOCK_SIZE + 1;
  const blockEnd = blockStart + INTRO_BLOCK_SIZE - 1;
  const seen = new Set(attempts.map((attempt) => attempt.exerciseId));

  // Se uma sessão for interrompida no meio do microbloco, retomamos somente
  // os itens restantes daquele mesmo bloco. Não antecipamos o bloco seguinte.
  return packageExercises(packageName).filter((exercise) => {
    const itemSequence = exercise.packageSequence ?? 999;
    return itemSequence >= blockStart && itemSequence <= blockEnd && !seen.has(exercise.id);
  });
}

function timestampValue(value: string): number {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function sortAttempts(items: Attempt[]): Attempt[] {
  return [...items].sort((a, b) => timestampValue(a.timestamp) - timestampValue(b.timestamp));
}

function getVariantAttempts(attempts: Attempt[], variantGroup?: string): Attempt[] {
  if (!variantGroup) return [];
  return attempts.filter((attempt) => exerciseById.get(attempt.exerciseId)?.variantGroup === variantGroup);
}

function getActualSupport(exercise: Exercise, attempts: Attempt[]): SupportLevel {
  const variantAttempts = sortAttempts(getVariantAttempts(attempts, exercise.variantGroup));
  if (!variantAttempts.length) return exercise.support;

  const latest = variantAttempts.at(-1);
  if (latest && !latest.correct) {
    // Um erro recente devolve o suporte ao nível editorial original.
    return exercise.support;
  }

  const independentCorrect = variantAttempts.filter(
    (attempt) => attempt.correct && attempt.support === "independent",
  );
  const independentSessions = new Set(independentCorrect.map((attempt) => attempt.sessionId)).size;

  if (independentCorrect.length >= 2 && independentSessions >= 2) return "independent";

  if (exercise.support === "guided") {
    const correctExercises = new Set(
      variantAttempts
        .filter((attempt) => attempt.correct)
        .map((attempt) => attempt.exerciseId),
    ).size;
    if (correctExercises >= 1) return "supported";
  }

  return exercise.support;
}

function daysSinceLastAttempt(items: Attempt[], now = Date.now()): number | null {
  if (!items.length) return null;
  const latest = Math.max(...items.map((item) => timestampValue(item.timestamp)));
  if (!latest) return null;
  return Math.max(0, (now - latest) / 86_400_000);
}

function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function sessionVariation(exerciseId: string, sessionSeed: string): number {
  // Pequena variação apenas para desempatar exercícios de prioridade parecida.
  // Não deve superar sinais pedagógicos fortes, como foco ou erro recente.
  return (hashString(`${sessionSeed}:${exerciseId}`) % 700) / 100;
}

function exercisePriority(exercise: Exercise, attempts: Attempt[], focus?: Skill): number {
  const exerciseAttempts = sortAttempts(attempts.filter((attempt) => attempt.exerciseId === exercise.id));
  const variantAttempts = sortAttempts(getVariantAttempts(attempts, exercise.variantGroup));
  const skillAttempts = sortAttempts(attempts.filter((attempt) => attempt.primarySkill === exercise.primarySkill));
  const latestVariant = variantAttempts.at(-1);
  const latestSkill = skillAttempts.at(-1);
  const staleDays = daysSinceLastAttempt(exerciseAttempts);

  let score = 0;

  if (focus === exercise.primarySkill) score += 28;
  if (!exerciseAttempts.length) score += 14;

  // Erro recente no mesmo conceito é a evidência mais forte para reforço.
  if (latestVariant && !latestVariant.correct) score += 34;
  else if (latestSkill && !latestSkill.correct) score += 12;

  // Reapresentação espaçada simples. As janelas são heurísticas do protótipo.
  if (staleDays !== null) {
    if (staleDays >= 7) score += 22;
    else if (staleDays >= 3) score += 14;
    else if (staleDays >= 1) score += 7;
    else score -= 5;
  }

  const variantIndependentCorrect = variantAttempts.filter(
    (attempt) => attempt.correct && attempt.support === "independent",
  ).length;

  // À medida que surge evidência independente, priorizamos exemplos que exigem menos apoio.
  if (exercise.support === "independent" && variantIndependentCorrect > 0) score += 7;
  if (exercise.support === "guided" && variantIndependentCorrect >= 2) score -= 8;

  return score;
}

function diversifyOrder(items: Exercise[]): Exercise[] {
  const remaining = [...items];
  const ordered: Exercise[] = [];

  while (remaining.length) {
    const previous = ordered.at(-1);
    let index = 0;

    if (previous) {
      const differentSkillAndConcept = remaining.findIndex(
        (exercise) =>
          exercise.primarySkill !== previous.primarySkill &&
          exercise.variantGroup !== previous.variantGroup,
      );
      const differentConcept = remaining.findIndex(
        (exercise) => exercise.variantGroup !== previous.variantGroup,
      );

      if (differentSkillAndConcept >= 0) index = differentSkillAndConcept;
      else if (differentConcept >= 0) index = differentConcept;
    }

    ordered.push(remaining.splice(index, 1)[0]);
  }

  return ordered;
}

export function buildRecommendedSession(
  attempts: Attempt[] = [],
  focus?: Skill,
  sessionSeed = "default-session",
  now = Date.now(),
): Exercise[] {
  // Primeiro contato: mantém o pacote fundador em sequência e limita a sessão a 12 decisões.
  if (!attempts.length) {
    return developmentExercises.slice(0, 12).map((exercise) => ({ ...exercise }));
  }

  const resolvedFocus = focus ?? chooseFocus(attempts);
  const pendingPackage = pendingLearningPackage(attempts);
  const pendingFocus = pendingPackage ? PACKAGE_FOCUS[pendingPackage] : undefined;
  const unseenPackage = pendingPackage ? unseenPackageExercises(attempts, pendingPackage) : [];
  const pendingIntroBlock = pendingPackage ? currentIntroBlock(attempts, pendingPackage) : [];

  // Conteúdo novo entra em microblocos de quatro itens, em ordem pedagógica.
  // Pacotes posteriores ficam bloqueados até o anterior ter sido apresentado.
  // Se o usuário sair no meio de um bloco, a sessão seguinte termina esse mesmo
  // bloco antes de apresentar conceitos do próximo.
  const shouldIntroducePackage = Boolean(
    pendingPackage && unseenPackage.length > 0 && (!focus || focus === pendingFocus),
  );
  const introBlock = shouldIntroducePackage
    ? pendingIntroBlock.map((exercise) => ({
        ...exercise,
        support: getActualSupport(exercise, attempts),
        sessionRole: "introduction" as const,
      }))
    : [];

  const introIds = new Set(introBlock.map((exercise) => exercise.id));
  const seenIds = new Set(attempts.map((attempt) => attempt.exerciseId));
  const redundantItems = pendingPackage ? PACKAGE_REDUNDANT_ITEMS[pendingPackage] : undefined;

  const scored = developmentExercises
    .filter((exercise) => {
      if (introIds.has(exercise.id)) return false;
      // Durante a introdução, evitamos repetir imediatamente exercícios antigos
      // que o pacote novo está refinando.
      if (shouldIntroducePackage && redundantItems?.has(exercise.id)) return false;
      // Qualquer item inédito de um pacote estruturado só entra pelo microbloco.
      // Isso impede tanto vazamento do bloco atual quanto antecipação de pacotes futuros.
      if (exercise.learningPackage && exercise.learningPackage !== "foundations" && !seenIds.has(exercise.id)) {
        return false;
      }
      return true;
    })
    .map((exercise, originalIndex) => ({
      exercise,
      originalIndex,
      score:
        exercisePriority(exercise, attempts, resolvedFocus) +
        sessionVariation(exercise.id, sessionSeed),
    }))
    .sort((a, b) => b.score - a.score || a.originalIndex - b.originalIndex)
    .map(({ exercise }) => ({
      ...exercise,
      support: getActualSupport(exercise, attempts),
    }));

  const evaluationItems = pendingPackage
    ? []
    : [
        selectEvaluation(eligibleRetentionExercises(attempts, now), resolvedFocus),
        selectEvaluation(eligibleTransferExercises(attempts), resolvedFocus),
      ].filter((exercise): exercise is Exercise => Boolean(exercise));
  const fillCount = Math.max(0, 12 - introBlock.length - evaluationItems.length);
  const adaptiveFill = diversifyOrder(scored).slice(0, fillCount);

  return [...introBlock, ...evaluationItems, ...adaptiveFill];
}

export function reprioritizeAfterError(
  queue: Exercise[],
  currentIndex: number,
  failedExercise: Exercise,
): Exercise[] {
  const next = [...queue];

  // Durante a primeira apresentação de um conceito, a ordem do microbloco tem
  // função pedagógica. Um erro recebe feedback agora e revisão depois; não deve
  // embaralhar os itens que ainda estão construindo a ideia pela primeira vez.
  if (failedExercise.sessionRole === "introduction") return next;

  const searchStart = currentIndex + 1;

  let futureIndex = next.findIndex(
    (exercise, index) =>
      index >= searchStart &&
      exercise.purpose === "development" &&
      exercise.id !== failedExercise.id &&
      Boolean(failedExercise.variantGroup) &&
      exercise.variantGroup === failedExercise.variantGroup,
  );

  // Se não houver outra variação do mesmo conceito, usamos a habilidade ampla como fallback.
  if (futureIndex === -1) {
    futureIndex = next.findIndex(
      (exercise, index) =>
        index >= searchStart &&
        exercise.purpose === "development" &&
        exercise.id !== failedExercise.id &&
        exercise.primarySkill === failedExercise.primarySkill,
    );
  }

  if (futureIndex === -1) return next;

  const [exercise] = next.splice(futureIndex, 1);
  const target = Math.min(currentIndex + 3, next.length);
  next.splice(target, 0, exercise);
  return next;
}

export function summarizeSkill(attempts: Attempt[], skill: Skill) {
  const items = sortAttempts(
    developmentAttempts(attempts).filter((attempt) => attempt.primarySkill === skill),
  );
  const independent = items.filter((attempt) => attempt.support === "independent");
  const correct = items.filter((attempt) => attempt.correct).length;
  const independentCorrectItems = independent.filter((attempt) => attempt.correct);
  const distinctExercises = new Set(items.map((attempt) => attempt.exerciseId)).size;
  const sessions = new Set(items.map((attempt) => attempt.sessionId)).size;
  const independentCorrectSessions = new Set(
    independentCorrectItems.map((attempt) => attempt.sessionId),
  ).size;
  const recent = items.slice(-2);
  const recentErrors = recent.filter((attempt) => !attempt.correct).length;

  return {
    encounters: items.length,
    correct,
    independentEncounters: independent.length,
    independentCorrect: independentCorrectItems.length,
    distinctExercises,
    sessions,
    independentCorrectSessions,
    recentErrors,
  };
}

export function deriveSkillState(attempts: Attempt[], skill: Skill): SkillState {
  const stats = summarizeSkill(attempts, skill);
  if (stats.encounters === 0) return "Ainda observando";
  if (stats.encounters < 3) return "Aprendendo";

  const accuracy = stats.correct / stats.encounters;
  if (accuracy < 0.55) return "Precisa de reforço";

  // Um erro recente impede que uma habilidade apareça como consolidada imediatamente.
  if (stats.recentErrors > 0) return "Em desenvolvimento";

  if (
    accuracy >= 0.75 &&
    stats.independentCorrect >= 2 &&
    stats.independentCorrectSessions >= 2 &&
    stats.distinctExercises >= 2
  ) {
    return "Consistente";
  }

  return "Em desenvolvimento";
}

export function chooseFocus(attempts: Attempt[]): Skill {
  attempts = developmentAttempts(attempts);
  const skills = Object.keys(skillLabels) as Skill[];
  if (attempts.length === 0) return "range-reading";

  // Pacotes estruturados recebem prioridade na recomendação até a primeira
  // apresentação estar completa. O usuário ainda pode escolher outra habilidade
  // manualmente em Treinar sem fazer conceitos futuros vazarem fora de ordem.
  if (hasUnseenRangeActionPackage(attempts)) return "range-reading";
  if (hasUnseenRangeToDecisionPackage(attempts)) return "integrated-decision";

  const ranked = skills.map((skill) => {
    const stats = summarizeSkill(attempts, skill);

    // Sem evidência ainda não significa fraqueza; recebe prioridade intermediária.
    if (stats.encounters === 0) return { skill, score: 0.45 };

    const accuracy = stats.correct / stats.encounters;
    const independentAccuracy = stats.independentEncounters
      ? stats.independentCorrect / stats.independentEncounters
      : 0.5;
    const recentErrorPenalty = stats.recentErrors * 0.18;
    const lowEvidencePenalty = stats.encounters < 3 ? 0.08 : 0;
    const score = accuracy * 0.65 + independentAccuracy * 0.35 - recentErrorPenalty - lowEvidencePenalty;

    return { skill, score };
  });

  ranked.sort((a, b) => a.score - b.score);
  return ranked[0].skill;
}
