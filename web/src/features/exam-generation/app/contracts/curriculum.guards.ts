import type { AssessmentCriterion, LearningOutcome } from "../../domain";
import { isObjectRecord } from "./guard-helpers";
import type {
  ContentUnitLearningOutcomeMapping,
  LearningPlan,
  LearningPlanContentUnit,
  LearningPlanSourceDocument,
  Module,
} from "../../domain";

export function isAssessmentCriterion(
  value: unknown,
): value is AssessmentCriterion {
  return (
    isObjectRecord(value) &&
    typeof value.id === "string" &&
    (value.code === undefined || typeof value.code === "string") &&
    typeof value.description === "string"
  );
}

export function isLearningOutcome(value: unknown): value is LearningOutcome {
  return (
    isObjectRecord(value) &&
    typeof value.id === "string" &&
    typeof value.moduleId === "string" &&
    (value.code === undefined || typeof value.code === "string") &&
    typeof value.description === "string" &&
    (value.weight === undefined || typeof value.weight === "number") &&
    Array.isArray(value.assessmentCriteria) &&
    value.assessmentCriteria.every(isAssessmentCriterion)
  );
}

export function isModule(value: unknown): value is Module {
  return (
    isObjectRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    (value.officialCode === undefined || typeof value.officialCode === "string") &&
    (value.code === undefined || typeof value.code === "string") &&
    (value.credits === undefined || typeof value.credits === "number") &&
    (value.weeklyHours === undefined || typeof value.weeklyHours === "number") &&
    (value.totalHours === undefined || typeof value.totalHours === "number") &&
    (value.legacyPlanHours === undefined ||
      typeof value.legacyPlanHours === "number") &&
    (value.description === undefined || typeof value.description === "string") &&
    typeof value.programId === "string" &&
    (value.programName === undefined || typeof value.programName === "string") &&
    (value.family === undefined || typeof value.family === "string") &&
    (value.educationLevel === undefined ||
      typeof value.educationLevel === "string") &&
    (value.europeanReference === undefined ||
      typeof value.europeanReference === "string")
  );
}

export function isLearningPlanSourceDocument(
  value: unknown,
): value is LearningPlanSourceDocument {
  return (
    isObjectRecord(value) &&
    typeof value.title === "string" &&
    (value.format === "pdf" ||
      value.format === "doc" ||
      value.format === "docx" ||
      value.format === "markdown" ||
      value.format === "json") &&
    (value.versionLabel === undefined || typeof value.versionLabel === "string") &&
    (value.academicYear === undefined || typeof value.academicYear === "string")
  );
}

export function isLearningPlanContentUnit(
  value: unknown,
): value is LearningPlanContentUnit {
  return (
    isObjectRecord(value) &&
    typeof value.id === "string" &&
    typeof value.moduleId === "string" &&
    (value.code === undefined || typeof value.code === "string") &&
    typeof value.title === "string" &&
    (value.description === undefined || typeof value.description === "string")
  );
}

export function isContentUnitLearningOutcomeMapping(
  value: unknown,
): value is ContentUnitLearningOutcomeMapping {
  return (
    isObjectRecord(value) &&
    typeof value.contentUnitId === "string" &&
    typeof value.learningOutcomeId === "string"
  );
}

export function isLearningPlan(value: unknown): value is LearningPlan {
  return (
    isObjectRecord(value) &&
    isModule(value.module) &&
    (value.sourceDocument === undefined ||
      isLearningPlanSourceDocument(value.sourceDocument)) &&
    Array.isArray(value.learningOutcomes) &&
    value.learningOutcomes.every(isLearningOutcome) &&
    Array.isArray(value.contentUnits) &&
    value.contentUnits.every(isLearningPlanContentUnit) &&
    Array.isArray(value.contentUnitLearningOutcomeMappings) &&
    value.contentUnitLearningOutcomeMappings.every(
      isContentUnitLearningOutcomeMapping,
    )
  );
}
