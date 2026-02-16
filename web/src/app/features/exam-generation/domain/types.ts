// --------------------
// Core Enums
// --------------------

export type Difficulty = "easy" | "medium" | "hard";

export type QuestionType =
  | "multiple-choice"
  | "true-false"
  | "short-answer";

export type VocationalProgramLevel =
  | "basic"
  | "intermediate"
  | "higher";

// --------------------
// Questions
// --------------------

export type MultipleChoiceQuestion = {
  id: string;
  type: "multiple-choice";
  text: string;
  difficulty: Difficulty;
  options: Option[];
};

export type TrueFalseQuestion = {
  id: string;
  type: "true-false";
  text: string;
  difficulty: Difficulty;
  correctAnswer: boolean;
};

export type ShortAnswerQuestion = {
  id: string;
  type: "short-answer";
  text: string;
  difficulty: Difficulty;
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
