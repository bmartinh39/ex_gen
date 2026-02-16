// --------------------
// Core Enums
// --------------------

export type Difficulty = "easy" | "medium" | "hard";

export type VocationalProgramLevel =
  | "basic"
  | "intermediate"
  | "higher";

// --------------------
// Questions
// --------------------
export type BaseQuestion = {
  id: string;
  text: string;
  difficulty: Difficulty;  
  ceIds: string[];
};

export type MultipleChoiceQuestion = BaseQuestion & {
  type: "multiple-choice";
  options: Option[];
};

export type TrueFalseQuestion = BaseQuestion & {
  type: "true-false";
  correctAnswer: boolean;
};

export type ShortAnswerQuestion = BaseQuestion & {
  type: "short-answer";
  expectedAnswer: string;
};

export type Question =
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | ShortAnswerQuestion;

export type Option = {
  id: string;
  text: string;
  isCorrect: boolean;
};

// --------------------
// Exam
// --------------------

export type Exam = {
  id: string;
  name: string;
  description?: string;
  difficulty: Difficulty;
  moduleId: string;
  questions: Question[];
  createdAt?: Date;
};

// --------------------
// Academic Structure
// --------------------

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

// --------------------
// RAs and CEs (Learning Outcomes and Assessment Criterion)
// --------------------
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
