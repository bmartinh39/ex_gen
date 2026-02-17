import type { Difficulty, QuestionIntent } from "./shared";

export type BaseQuestion = {
  id: string;
  text: string;
  difficulty: Difficulty;
  ceIds: string[];
  intent: QuestionIntent;
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

export type QuestionDistribution = {
  byCount?: {
    theoreticalPct: number;
    practicalPct: number;
    tolerancePct?: number;
  };
};

export type Exam = {
  id: string;
  name: string;
  description?: string;
  difficulty: Difficulty;
  moduleId: string;
  questions: Question[];
  distribution?: QuestionDistribution;
  createdAt?: Date;
};
