import type {
  AssessmentCriterion,
  Difficulty,
  Exam,
  LearningOutcome,
  Question,
  QuestionDistribution,
} from "../../domain";

export type LearningOutcomeWeight = {
  learningOutcomeId: string;
  percentage: number;
};

export type AssessmentCriterionWeight = {
  learningOutcomeId: string;
  assessmentCriterionId: string;
  percentageWithinLearningOutcome: number;
};

export type CoverageWeights = {
  learningOutcomeWeights?: LearningOutcomeWeight[];
  assessmentCriterionWeights?: AssessmentCriterionWeight[];
};

export type GenerateExamUseCaseInput = {
  examId: string;
  name: string;
  moduleId: string;
  difficulty: Difficulty;
  timeLimitMinutes?: number;
  questionCount: number;
  availableQuestions: Question[];
  distribution?: QuestionDistribution;
  learningOutcomes?: LearningOutcome[];
  assessmentCriteria?: AssessmentCriterion[];
  coverageWeights?: CoverageWeights;
};

export type GenerateExamUseCaseOutput = {
  exam?: Exam;
  errors: string[];
};
