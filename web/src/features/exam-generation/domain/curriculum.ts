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
};

export type AssessmentCriterion = {
  id: string;
  learningOutcomeId: string;
  description: string;
};
