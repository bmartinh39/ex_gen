import type { VocationalProgramLevel } from "./shared";

export type Module = {
  id: string;
  name: string;
  officialCode?: string;
  code?: string;
  credits?: number;
  weeklyHours?: number;
  totalHours?: number;
  legacyPlanHours?: number;
  description?: string;
  programId: string;
  programName?: string;
  family?: string;
  educationLevel?: string;
  europeanReference?: string;
};

export type VocationalProgram = {
  id: string;
  name: string;
  description?: string;
  level: VocationalProgramLevel;
  familyId: string;
};

export type VocationalFamily = {
  id: string;
  name: string;
  description?: string;
};

export type LearningOutcome = {
  id: string;
  moduleId: string;
  code?: string;
  description: string;
  weight?: number;
  assessmentCriteria: AssessmentCriterion[];
};

export type AssessmentCriterion = {
  id: string;
  code?: string;
  description: string;
};

export type LearningPlanSourceDocument = {
  title: string;
  format: "pdf" | "doc" | "docx" | "markdown" | "json";
  versionLabel?: string;
  academicYear?: string;
};

export type LearningPlanContentUnit = {
  id: string;
  moduleId: string;
  code?: string;
  title: string;
  description?: string;
};

export type ContentUnitLearningOutcomeMapping = {
  contentUnitId: string;
  learningOutcomeId: string;
};

export type LearningPlan = {
  module: Module;
  sourceDocument?: LearningPlanSourceDocument;
  learningOutcomes: LearningOutcome[];
  contentUnits: LearningPlanContentUnit[];
  contentUnitLearningOutcomeMappings: ContentUnitLearningOutcomeMapping[];
};
