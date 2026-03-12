import type { LearningOutcome } from "../../domain";
import type { CoverageWeights } from "../contracts/generate-exam.contracts";
import {
  allocateTargetsByLargestRemainder,
  normalizeWeights,
} from "./weight-normalization";

export function buildCeTargetQuestionCounts(
  questionCount: number,
  learningOutcomes: LearningOutcome[],
  coverageWeights: CoverageWeights | undefined,
): { ceTargetCounts: Record<string, number>; errors: string[] } {
  const errors: string[] = [];
  const loIds = learningOutcomes.map((lo) => lo.id);
  const ceByRa = new Map<string, string[]>();
  const ceToRa = new Map<string, string>();

  for (const learningOutcome of learningOutcomes) {
    const criterionIds = learningOutcome.assessmentCriteria.map(
      (criterion) => criterion.id,
    );
    ceByRa.set(learningOutcome.id, criterionIds);

    for (const criterion of learningOutcome.assessmentCriteria) {
      ceToRa.set(criterion.id, learningOutcome.id);
    }
  }

  if (errors.length > 0) {
    return { ceTargetCounts: {}, errors };
  }

  for (const weight of coverageWeights?.assessmentCriterionWeights ?? []) {
    const knownRa = ceToRa.get(weight.assessmentCriterionId);
    if (!knownRa) {
      errors.push(
        `Assessment criterion weight '${weight.assessmentCriterionId}' does not exist in learningOutcomes.`,
      );
      continue;
    }

    if (knownRa !== weight.learningOutcomeId) {
      errors.push(
        `Assessment criterion '${weight.assessmentCriterionId}' belongs to '${knownRa}', not '${weight.learningOutcomeId}'.`,
      );
    }
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
        ?.filter((weight) => weight.learningOutcomeId === loId)
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
      ceGlobalPct[ceId] = (loPct * ceNormalization.normalized[ceId]) / 100;
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
