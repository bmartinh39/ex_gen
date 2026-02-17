import type { GenerateExamUseCaseInput } from "../generate-exam.use-case";
import type {
  Difficulty,
  Exam,
  Option,
  Question,
  QuestionDistribution,
  QuestionIntent,
} from "../../domain";

export type ValidateExamRequestBody = {
  exam: Exam;
};

export function isDifficulty(value: unknown): value is Difficulty {
  return value === "easy" || value === "medium" || value === "hard";
}

export function isQuestionIntent(value: unknown): value is QuestionIntent {
  return value === "theoretical" || value === "practical";
}

export function isOption(value: unknown): value is Option {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { id?: unknown }).id === "string" &&
    typeof (value as { text?: unknown }).text === "string" &&
    typeof (value as { isCorrect?: unknown }).isCorrect === "boolean"
  );
}

export function isQuestion(value: unknown): value is Question {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as {
    type?: unknown;
    id?: unknown;
    text?: unknown;
    difficulty?: unknown;
    ceIds?: unknown;
    intent?: unknown;
    options?: unknown;
    correctAnswer?: unknown;
    expectedAnswer?: unknown;
  };

  const hasCommonFields =
    typeof candidate.id === "string" &&
    typeof candidate.text === "string" &&
    isDifficulty(candidate.difficulty) &&
    Array.isArray(candidate.ceIds) &&
    isQuestionIntent(candidate.intent) &&
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
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as { byCount?: unknown };
  if (candidate.byCount === undefined) {
    return true;
  }

  if (typeof candidate.byCount !== "object" || candidate.byCount === null) {
    return false;
  }

  const byCount = candidate.byCount as {
    theoreticalPct?: unknown;
    practicalPct?: unknown;
    tolerancePct?: unknown;
  };

  return (
    typeof byCount.theoreticalPct === "number" &&
    typeof byCount.practicalPct === "number" &&
    (byCount.tolerancePct === undefined ||
      typeof byCount.tolerancePct === "number")
  );
}

export function isExam(value: unknown): value is Exam {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as {
    id?: unknown;
    name?: unknown;
    description?: unknown;
    difficulty?: unknown;
    moduleId?: unknown;
    questions?: unknown;
    distribution?: unknown;
  };

  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    (candidate.description === undefined ||
      typeof candidate.description === "string") &&
    isDifficulty(candidate.difficulty) &&
    typeof candidate.moduleId === "string" &&
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
    typeof value === "object" &&
    value !== null &&
    "exam" in value &&
    isExam((value as { exam?: unknown }).exam)
  );
}

export function isGenerateExamUseCaseInput(
  value: unknown,
): value is GenerateExamUseCaseInput {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as {
    examId?: unknown;
    name?: unknown;
    moduleId?: unknown;
    difficulty?: unknown;
    questionCount?: unknown;
    availableQuestions?: unknown;
    distribution?: unknown;
  };

  return (
    typeof candidate.examId === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.moduleId === "string" &&
    isDifficulty(candidate.difficulty) &&
    typeof candidate.questionCount === "number" &&
    Array.isArray(candidate.availableQuestions) &&
    candidate.availableQuestions.every(isQuestion) &&
    (candidate.distribution === undefined ||
      isQuestionDistribution(candidate.distribution))
  );
}
