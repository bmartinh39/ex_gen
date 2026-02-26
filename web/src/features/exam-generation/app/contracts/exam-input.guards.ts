import type {
  FrameworkId,
  GenerateExamUseCaseInput,
} from "./generate-exam.contracts";
import type {
  Difficulty,
  Exam,
  Option,
  Question,
  QuestionDistribution,
  QuestionIntent,
} from "../../domain";
import { isAssessmentCriterion, isLearningOutcome } from "./curriculum.guards";
import { isCoverageWeights } from "./coverage-weights.guards";
import {
  isFiniteNumber,
  isObjectRecord,
  isPositiveFiniteNumber,
} from "./guard-helpers";

const MAX_QUESTION_COUNT = 200;
const MAX_AVAILABLE_QUESTIONS = 2000;
const MAX_LEARNING_OUTCOMES = 500;
const MAX_ASSESSMENT_CRITERIA = 2000;

export type ValidateExamRequestBody = {
  exam: Exam;
};

export function isDifficulty(value: unknown): value is Difficulty {
  return value === "easy" || value === "medium" || value === "hard";
}

export function isQuestionIntent(value: unknown): value is QuestionIntent {
  return value === "theoretical" || value === "practical";
}

export function isFrameworkId(value: unknown): value is FrameworkId {
  return value === "es";
}

export function isOption(value: unknown): value is Option {
  return (
    isObjectRecord(value) &&
    typeof value.id === "string" &&
    typeof value.text === "string" &&
    typeof value.isCorrect === "boolean"
  );
}

function isAssessmentCriterionCoverage(value: unknown): boolean {
  return (
    isObjectRecord(value) &&
    typeof value.ceId === "string" &&
    isFiniteNumber(value.score) &&
    value.score >= 0 &&
    value.score <= 1
  );
}

export function isQuestion(value: unknown): value is Question {
  if (!isObjectRecord(value)) {
    return false;
  }

  const candidate = value;

  const hasCommonFields =
    typeof candidate.id === "string" &&
    typeof candidate.text === "string" &&
    isDifficulty(candidate.difficulty) &&
    Array.isArray(candidate.ceIds) &&
    (candidate.ceCoverage === undefined ||
      (Array.isArray(candidate.ceCoverage) &&
        candidate.ceCoverage.every(isAssessmentCriterionCoverage))) &&
    isQuestionIntent(candidate.intent) &&
    (candidate.points === undefined || isFiniteNumber(candidate.points)) &&
    candidate.ceIds.every((ceId) => typeof ceId === "string");

  if (!hasCommonFields) {
    return false;
  }

  if (candidate.type === "multiple-choice") {
    return Array.isArray(candidate.options) && candidate.options.every(isOption);
  }

  if (candidate.type === "true-false") {
    return typeof candidate.correctAnswer === "boolean";
  }

  if (candidate.type === "short-answer") {
    return typeof candidate.expectedAnswer === "string";
  }

  return false;
}

export function isQuestionDistribution(
  value: unknown,
): value is QuestionDistribution {
  if (!isObjectRecord(value)) {
    return false;
  }

  const candidate = value;
  if (candidate.byCount === undefined) {
    return true;
  }

  if (!isObjectRecord(candidate.byCount)) {
    return false;
  }

  const byCount = candidate.byCount;

  return (
    isFiniteNumber(byCount.theoreticalPct) &&
    isFiniteNumber(byCount.practicalPct) &&
    (byCount.tolerancePct === undefined || isFiniteNumber(byCount.tolerancePct))
  );
}

export function isExam(value: unknown): value is Exam {
  if (!isObjectRecord(value)) {
    return false;
  }

  const candidate = value;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    (candidate.description === undefined ||
      typeof candidate.description === "string") &&
    isDifficulty(candidate.difficulty) &&
    typeof candidate.moduleId === "string" &&
    (candidate.timeLimitMinutes === undefined ||
      isPositiveFiniteNumber(candidate.timeLimitMinutes)) &&
    Array.isArray(candidate.questions) &&
    candidate.questions.every(isQuestion) &&
    (candidate.distribution === undefined ||
      isQuestionDistribution(candidate.distribution))
  );
}

export function isValidateExamRequestBody(
  value: unknown,
): value is ValidateExamRequestBody {
  return (
    isObjectRecord(value) &&
    "exam" in value &&
    isExam(value.exam)
  );
}

export function isGenerateExamUseCaseInput(
  value: unknown,
): value is GenerateExamUseCaseInput {
  if (!isObjectRecord(value)) {
    return false;
  }

  const candidate = value;

  const hasValidQuestionCount =
    isFiniteNumber(candidate.questionCount) &&
    Number.isInteger(candidate.questionCount) &&
    candidate.questionCount >= 1 &&
    candidate.questionCount <= MAX_QUESTION_COUNT;

  const hasValidAvailableQuestions =
    Array.isArray(candidate.availableQuestions) &&
    candidate.availableQuestions.length <= MAX_AVAILABLE_QUESTIONS &&
    candidate.availableQuestions.every(isQuestion);

  const hasValidLearningOutcomes =
    candidate.learningOutcomes === undefined ||
    (Array.isArray(candidate.learningOutcomes) &&
      candidate.learningOutcomes.length <= MAX_LEARNING_OUTCOMES &&
      candidate.learningOutcomes.every(isLearningOutcome));

  const hasValidAssessmentCriteria =
    candidate.assessmentCriteria === undefined ||
    (Array.isArray(candidate.assessmentCriteria) &&
      candidate.assessmentCriteria.length <= MAX_ASSESSMENT_CRITERIA &&
      candidate.assessmentCriteria.every(isAssessmentCriterion));

  const hasValidCoverageWeights =
    candidate.coverageWeights === undefined ||
    isCoverageWeights(candidate.coverageWeights);

  return (
    typeof candidate.examId === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.moduleId === "string" &&
    isDifficulty(candidate.difficulty) &&
    (candidate.frameworkId === undefined || isFrameworkId(candidate.frameworkId)) &&
    (candidate.timeLimitMinutes === undefined ||
      isPositiveFiniteNumber(candidate.timeLimitMinutes)) &&
    hasValidQuestionCount &&
    hasValidAvailableQuestions &&
    (candidate.distribution === undefined ||
      isQuestionDistribution(candidate.distribution)) &&
    hasValidLearningOutcomes &&
    hasValidAssessmentCriteria &&
    hasValidCoverageWeights
  );
}
