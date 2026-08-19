import type { Exercise, LearningPackage } from "./types";

export interface ExerciseCollections {
  developmentExercises: Exercise[];
  evaluationExercises: Exercise[];
  allExercises: Exercise[];
}

const structuredPackages: Readonly<Record<Exclude<LearningPackage, "foundations">, number>> = {
  "range-actions": 12,
  "range-to-decision": 12,
};

export function validateExerciseLibrary({
  developmentExercises,
  evaluationExercises,
  allExercises,
}: ExerciseCollections): string[] {
  const errors: string[] = [];
  const exerciseIds = new Set<string>();

  for (const exercise of allExercises) {
    if (exerciseIds.has(exercise.id)) errors.push(`ID de exercício duplicado: ${exercise.id}`);
    exerciseIds.add(exercise.id);

    const optionIds = new Set<string>();
    const optionLabels = new Set<string>();
    for (const option of exercise.options) {
      if (optionIds.has(option.id)) errors.push(`${exercise.id}: ID de opção duplicado: ${option.id}`);
      optionIds.add(option.id);

      const trimmedLabel = option.label.trim();
      if (optionLabels.has(trimmedLabel)) {
        errors.push(`${exercise.id}: label de opção duplicado: ${JSON.stringify(trimmedLabel)}`);
      }
      optionLabels.add(trimmedLabel);
    }

    if (!optionIds.has(exercise.correctOptionId)) {
      errors.push(`${exercise.id}: correctOptionId não existe nas opções: ${exercise.correctOptionId}`);
    }
    if ((exercise.support === "guided" || exercise.support === "supported") && !exercise.supportNote?.trim()) {
      errors.push(`${exercise.id}: suporte ${exercise.support} exige supportNote`);
    }
  }

  for (const exercise of developmentExercises) {
    if (exercise.purpose !== "development") {
      errors.push(`${exercise.id}: developmentExercises contém purpose=${exercise.purpose}`);
    }
  }
  for (const exercise of evaluationExercises) {
    if (exercise.purpose !== "retention" && exercise.purpose !== "transfer") {
      errors.push(`${exercise.id}: evaluationExercises contém purpose=${exercise.purpose}`);
    }
  }

  const composed = [...developmentExercises, ...evaluationExercises];
  if (allExercises.length !== composed.length) {
    errors.push(`allExercises tem ${allExercises.length} itens; coleções componentes têm ${composed.length}`);
  }
  const maxLength = Math.max(allExercises.length, composed.length);
  for (let index = 0; index < maxLength; index += 1) {
    if (allExercises[index] !== composed[index]) {
      errors.push(`allExercises diverge das coleções componentes no índice ${index}`);
    }
  }

  for (const [packageName, expectedCount] of Object.entries(structuredPackages)) {
    const items = developmentExercises.filter((exercise) => exercise.learningPackage === packageName);
    const seenSequences = new Set<number>();
    for (const exercise of items) {
      if (exercise.packageSequence === undefined) {
        errors.push(`${exercise.id}: pacote estruturado ${packageName} exige packageSequence`);
        continue;
      }
      if (seenSequences.has(exercise.packageSequence)) {
        errors.push(`${packageName}: packageSequence duplicada: ${exercise.packageSequence}`);
      }
      seenSequences.add(exercise.packageSequence);
    }
    for (let sequence = 1; sequence <= expectedCount; sequence += 1) {
      if (!seenSequences.has(sequence)) errors.push(`${packageName}: packageSequence faltando: ${sequence}`);
    }
  }

  return errors;
}
