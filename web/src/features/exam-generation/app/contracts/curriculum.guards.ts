import type { AssessmentCriterion, LearningOutcome } from "../../domain";
import { isObjectRecord } from "./guard-helpers";

export function isAssessmentCriterion(
  value: unknown,
): value is AssessmentCriterion {
  return (
    isObjectRecord(value) &&
    typeof value.id === "string" &&
    typeof value.description === "string"
  );
}

export function isLearningOutcome(value: unknown): value is LearningOutcome {
  return (
    isObjectRecord(value) &&
    typeof value.id === "string" &&
    typeof value.moduleId === "string" &&
    typeof value.description === "string" &&
    Array.isArray(value.assessmentCriteria) &&
    value.assessmentCriteria.every(isAssessmentCriterion)
  );
}
