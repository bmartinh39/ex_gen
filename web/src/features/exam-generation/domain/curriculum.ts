import type { VocationalProgramLevel } from "./shared";

export type Module = {
  id: string;
  name: string;
  credits: number;
  description?: string;
  programId: string;
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
  description: string;
  assessmentCriteria: AssessmentCriterion[];
};

export type AssessmentCriterion = {
  id: string;
  description: string;
};

export type LearningPlanSourceDocument = {
  title: string;
  format: "pdf" | "doc" | "docx" | "markdown" | "json";
  versionLabel?: string;
};

export type LearningPlanContentUnit = {
  id: string;
  moduleId: string;
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
