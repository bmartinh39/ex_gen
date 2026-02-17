import { validateExam } from "../domain/validation";
import type {
  AssessmentCriterion,
  Exam,
  LearningOutcome,
  Question,
  QuestionDistribution,
} from "../domain";
import type {
  CoverageWeights,
  GenerateExamUseCaseInput,
  GenerateExamUseCaseOutput,
} from "./contracts/generate-exam.contracts";

function normalizeWeights(
  ids: string[],
  explicitWeights: Array<{ id: string; percentage: number }> | undefined,
  label: string,
): { normalized: Record<string, number>; errors: string[] } {
  const errors: string[] = [];
  const normalized: Record<string, number> = {};

  if (ids.length === 0) {
    return { normalized, errors };
  }

  if (!explicitWeights || explicitWeights.length === 0) {
    const equal = 100 / ids.length;
    for (const id of ids) {
      normalized[id] = equal;
    }
    return { normalized, errors };
  }

  const uniqueExplicit = new Map<string, number>();
  for (const weight of explicitWeights) {
    if (!ids.includes(weight.id)) {
      errors.push(`${label} '${weight.id}' is not in the current scope.`);
      continue;
    }

    if (uniqueExplicit.has(weight.id)) {
      errors.push(`${label} '${weight.id}' is duplicated in weights.`);
      continue;
    }

    if (!Number.isFinite(weight.percentage) || weight.percentage < 0) {
      errors.push(`${label} '${weight.id}' has an invalid percentage.`);
      continue;
    }

    uniqueExplicit.set(weight.id, weight.percentage);
  }

  if (errors.length > 0) {
    return { normalized, errors };
  }

  let explicitTotal = 0;
  for (const value of uniqueExplicit.values()) {
    explicitTotal += value;
  }

  if (explicitTotal > 100) {
    errors.push(`${label} explicit percentages exceed 100.`);
    return { normalized, errors };
  }

  const missingIds = ids.filter((id) => !uniqueExplicit.has(id));
  const remaining = 100 - explicitTotal;
  const equalForMissing = missingIds.length > 0 ? remaining / missingIds.length : 0;

  for (const id of ids) {
    normalized[id] = uniqueExplicit.get(id) ?? equalForMissing;
  }

  return { normalized, errors };
}

function allocateTargetsByLargestRemainder(
  questionCount: number,
  percentages: Record<string, number>,
): Record<string, number> {
  const target: Record<string, number> = {};
  const remainders: Array<{ id: string; remainder: number }> = [];
  let allocated = 0;

  for (const [id, pct] of Object.entries(percentages)) {
    const raw = (questionCount * pct) / 100;
    const base = Math.floor(raw);
    target[id] = base;
    allocated += base;
    remainders.push({ id, remainder: raw - base });
  }

  let missing = questionCount - allocated;
  remainders.sort((a, b) => b.remainder - a.remainder);

  let idx = 0;
  while (missing > 0 && remainders.length > 0) {
    target[remainders[idx].id] += 1;
    idx = (idx + 1) % remainders.length;
    missing -= 1;
  }

  return target;
}

function buildCeTargetQuestionCounts(
  questionCount: number,
  learningOutcomes: LearningOutcome[],
  assessmentCriteria: AssessmentCriterion[],
  coverageWeights: CoverageWeights | undefined,
): { ceTargetCounts: Record<string, number>; errors: string[] } {
  const errors: string[] = [];
  const loIds = learningOutcomes.map((lo) => lo.id);
  const ceByRa = new Map<string, string[]>();

  for (const loId of loIds) {
    ceByRa.set(loId, []);
  }

  for (const ce of assessmentCriteria) {
    if (!ceByRa.has(ce.learningOutcomeId)) {
      errors.push(
        `Assessment criterion '${ce.id}' references unknown learning outcome '${ce.learningOutcomeId}'.`,
      );
      continue;
    }
    ceByRa.get(ce.learningOutcomeId)?.push(ce.id);
  }

  if (errors.length > 0) {
    return { ceTargetCounts: {}, errors };
  }

  const loNormalization = normalizeWeights(
    loIds,
    coverageWeights?.learningOutcomeWeights?.map((weight) => ({
      id: weight.learningOutcomeId,
      percentage: weight.percentage,
    })),
    "Learning outcome",
  );

  if (loNormalization.errors.length > 0) {
    return { ceTargetCounts: {}, errors: loNormalization.errors };
  }

  const ceGlobalPct: Record<string, number> = {};

  for (const loId of loIds) {
    const ceIds = ceByRa.get(loId) ?? [];
    if (ceIds.length === 0) {
      continue;
    }

    const ceNormalization = normalizeWeights(
      ceIds,
      coverageWeights?.assessmentCriterionWeights
        ?.filter((weight) => ceIds.includes(weight.assessmentCriterionId))
        .map((weight) => ({
          id: weight.assessmentCriterionId,
          percentage: weight.percentageWithinLearningOutcome,
        })),
      "Assessment criterion",
    );

    if (ceNormalization.errors.length > 0) {
      errors.push(...ceNormalization.errors);
      continue;
    }

    const loPct = loNormalization.normalized[loId];
    for (const ceId of ceIds) {
      ceGlobalPct[ceId] =
        (loPct * ceNormalization.normalized[ceId]) / 100;
    }
  }

  if (errors.length > 0) {
    return { ceTargetCounts: {}, errors };
  }

  return {
    ceTargetCounts: allocateTargetsByLargestRemainder(questionCount, ceGlobalPct),
    errors: [],
  };
}

function selectQuestionsByCeTargets(
  questionCount: number,
  availableQuestions: Question[],
  ceTargetCounts: Record<string, number>,
): { questions: Question[]; errors: string[] } {
  const selected: Question[] = [];
  const remaining = [...availableQuestions];
  const deficits = { ...ceTargetCounts };
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

    const pickIdx = bestIdx >= 0 ? bestIdx : 0;
    const question = remaining.splice(pickIdx, 1)[0];
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

function selectQuestionsByDistribution(
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

export function generateExamUseCase(
  input: GenerateExamUseCaseInput,
): GenerateExamUseCaseOutput {
  const errors: string[] = [];

  if (!Number.isInteger(input.questionCount) || input.questionCount < 1) {
    errors.push("questionCount must be an integer greater than 0.");
    return { errors };
  }

  if (input.availableQuestions.length < input.questionCount) {
    errors.push("Not enough available questions to satisfy questionCount.");
    return { errors };
  }

  let selectionResult: { questions: Question[]; errors: string[] };
  const hasCoverageContext =
    (input.learningOutcomes?.length ?? 0) > 0 &&
    (input.assessmentCriteria?.length ?? 0) > 0;

  if (hasCoverageContext) {
    const targetResult = buildCeTargetQuestionCounts(
      input.questionCount,
      input.learningOutcomes ?? [],
      input.assessmentCriteria ?? [],
      input.coverageWeights,
    );

    if (targetResult.errors.length > 0) {
      return { errors: targetResult.errors };
    }

    selectionResult = selectQuestionsByCeTargets(
      input.questionCount,
      input.availableQuestions,
      targetResult.ceTargetCounts,
    );
  } else {
    const byCount = input.distribution?.byCount;
    selectionResult = byCount
      ? selectQuestionsByDistribution(
          input.questionCount,
          input.availableQuestions,
          byCount,
        )
      : {
          questions: input.availableQuestions.slice(0, input.questionCount),
          errors: [],
        };
  }

  if (selectionResult.errors.length > 0) {
    return { errors: selectionResult.errors };
  }

  const exam: Exam = {
    id: input.examId,
    name: input.name,
    moduleId: input.moduleId,
    difficulty: input.difficulty,
    questions: selectionResult.questions,
    distribution: input.distribution,
  };

  const validationErrors = validateExam(exam);
  if (validationErrors.length > 0) {
    return { errors: validationErrors };
  }

  return {
    exam,
    errors: [],
  };
}
