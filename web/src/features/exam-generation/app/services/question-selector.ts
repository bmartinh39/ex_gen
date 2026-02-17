import type { Question, QuestionDistribution } from "../../domain";

export function selectQuestionsByCeTargets(
  questionCount: number,
  availableQuestions: Question[],
  ceTargetCounts: Record<string, number>,
): { questions: Question[]; errors: string[] } {
  const selected: Question[] = [];
  const remaining = [...availableQuestions];
  const deficits = { ...ceTargetCounts };
  const targetCeIds = new Set(Object.keys(ceTargetCounts));
  const errors: string[] = [];

  while (selected.length < questionCount && remaining.length > 0) {
    let bestIdx = -1;
    let bestScore = -1;

    for (let i = 0; i < remaining.length; i += 1) {
      const question = remaining[i];
      const relevantCeIds = question.ceIds.filter((ceId) => deficits[ceId] > 0);
      if (relevantCeIds.length === 0) {
        continue;
      }

      const score = relevantCeIds.reduce((acc, ceId) => acc + deficits[ceId], 0);
      if (score > bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }

    if (bestIdx < 0) {
      let closestIdx = 0;
      let closestScore = -1;

      for (let i = 0; i < remaining.length; i += 1) {
        const question = remaining[i];
        const overlap = question.ceIds.filter((ceId) => targetCeIds.has(ceId)).length;
        const score = overlap > 0 ? overlap : (question.points ?? 1) * 0.001;
        if (score > closestScore) {
          closestScore = score;
          closestIdx = i;
        }
      }

      bestIdx = closestIdx;
    }

    const question = remaining.splice(bestIdx, 1)[0];
    selected.push(question);

    const uniqueCeIds = Array.from(new Set(question.ceIds));
    for (const ceId of uniqueCeIds) {
      if (deficits[ceId] !== undefined && deficits[ceId] > 0) {
        deficits[ceId] -= 1;
      }
    }
  }

  if (selected.length < questionCount) {
    errors.push("Not enough available questions to satisfy questionCount.");
    return { questions: [], errors };
  }

  const unmet = Object.entries(deficits).filter(([, remainingCount]) => remainingCount > 0);
  if (unmet.length > 0) {
    errors.push(
      `Coverage targets could not be fully satisfied: ${unmet
        .map(([ceId, remainingCount]) => `${ceId} (${remainingCount} short)`)
        .join(", ")}.`,
    );
  }

  return { questions: selected, errors };
}

export function selectQuestionsByDistribution(
  questionCount: number,
  availableQuestions: Question[],
  distribution: NonNullable<QuestionDistribution["byCount"]>,
): { questions: Question[]; errors: string[] } {
  const errors: string[] = [];
  const theoreticalPool = availableQuestions.filter(
    (question) => question.intent === "theoretical",
  );
  const practicalPool = availableQuestions.filter(
    (question) => question.intent === "practical",
  );

  const targetTheoretical = Math.round(
    (questionCount * distribution.theoreticalPct) / 100,
  );
  const targetPractical = questionCount - targetTheoretical;

  if (theoreticalPool.length < targetTheoretical) {
    errors.push(
      `Not enough theoretical questions. Required ${targetTheoretical}, found ${theoreticalPool.length}.`,
    );
  }

  if (practicalPool.length < targetPractical) {
    errors.push(
      `Not enough practical questions. Required ${targetPractical}, found ${practicalPool.length}.`,
    );
  }

  if (errors.length > 0) {
    return { questions: [], errors };
  }

  return {
    questions: [
      ...theoreticalPool.slice(0, targetTheoretical),
      ...practicalPool.slice(0, targetPractical),
    ],
    errors: [],
  };
}
