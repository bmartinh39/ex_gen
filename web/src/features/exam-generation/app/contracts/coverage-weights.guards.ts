import type {
  AssessmentCriterionWeight,
  CoverageWeights,
  LearningOutcomeWeight,
} from "./generate-exam.contracts";
import { isFiniteNumber, isObjectRecord } from "./guard-helpers";

export function isLearningOutcomeWeight(
  value: unknown,
): value is LearningOutcomeWeight {
  return (
    isObjectRecord(value) &&
    typeof value.learningOutcomeId === "string" &&
    isFiniteNumber(value.percentage)
  );
}

export function isAssessmentCriterionWeight(
  value: unknown,
): value is AssessmentCriterionWeight {
  return (
    isObjectRecord(value) &&
    typeof value.assessmentCriterionId === "string" &&
    typeof value.learningOutcomeId === "string" &&
    isFiniteNumber(value.percentageWithinLearningOutcome)
  );
}

export function isCoverageWeights(value: unknown): value is CoverageWeights {
  if (!isObjectRecord(value)) {
    return false;
  }

  const hasValidLearningOutcomeWeights =
    value.learningOutcomeWeights === undefined ||
    (Array.isArray(value.learningOutcomeWeights) &&
      value.learningOutcomeWeights.every(isLearningOutcomeWeight));

  const hasValidAssessmentCriterionWeights =
    value.assessmentCriterionWeights === undefined ||
    (Array.isArray(value.assessmentCriterionWeights) &&
      value.assessmentCriterionWeights.every(isAssessmentCriterionWeight));

  return hasValidLearningOutcomeWeights && hasValidAssessmentCriterionWeights;
}
