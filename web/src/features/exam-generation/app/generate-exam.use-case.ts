import { validateExam } from "../domain/validation";
import type { Difficulty, Exam, Question, QuestionDistribution } from "../domain";

export type GenerateExamUseCaseInput = {
  examId: string;
  name: string;
  moduleId: string;
  difficulty: Difficulty;
  questionCount: number;
  availableQuestions: Question[];
  distribution?: QuestionDistribution;
};

export type GenerateExamUseCaseOutput = {
  exam?: Exam;
  errors: string[];
};

function selectQuestionsByDistribution(
  questionCount: number,
  availableQuestions: Question[],
  distribution: NonNullable<QuestionDistribution["byCount"]>,
): { questions: Question[]; errors: string[] } {
  const errors: string[] = [];
  const theoreticalPool = availableQuestions.filter(
    (question) => question.intent === "theoretical",
  );
  const practicalPool = availableQuestions.filter(
    (question) => question.intent === "practical",
  );

  const targetTheoretical = Math.round(
    (questionCount * distribution.theoreticalPct) / 100,
  );
  const targetPractical = questionCount - targetTheoretical;

  if (theoreticalPool.length < targetTheoretical) {
    errors.push(
      `Not enough theoretical questions. Required ${targetTheoretical}, found ${theoreticalPool.length}.`,
    );
  }

  if (practicalPool.length < targetPractical) {
    errors.push(
      `Not enough practical questions. Required ${targetPractical}, found ${practicalPool.length}.`,
    );
  }

  if (errors.length > 0) {
    return { questions: [], errors };
  }

  return {
    questions: [
      ...theoreticalPool.slice(0, targetTheoretical),
      ...practicalPool.slice(0, targetPractical),
    ],
    errors: [],
  };
}

export function generateExamUseCase(
  input: GenerateExamUseCaseInput,
): GenerateExamUseCaseOutput {
  const errors: string[] = [];

  if (!Number.isInteger(input.questionCount) || input.questionCount < 1) {
    errors.push("questionCount must be an integer greater than 0.");
    return { errors };
  }

  if (input.availableQuestions.length < input.questionCount) {
    errors.push("Not enough available questions to satisfy questionCount.");
    return { errors };
  }

  const byCount = input.distribution?.byCount;
  const selectionResult = byCount
    ? selectQuestionsByDistribution(
        input.questionCount,
        input.availableQuestions,
        byCount,
      )
    : { questions: input.availableQuestions.slice(0, input.questionCount), errors: [] };

  if (selectionResult.errors.length > 0) {
    return { errors: selectionResult.errors };
  }

  const exam: Exam = {
    id: input.examId,
    name: input.name,
    moduleId: input.moduleId,
    difficulty: input.difficulty,
    questions: selectionResult.questions,
    distribution: input.distribution,
  };

  const validationErrors = validateExam(exam);
  if (validationErrors.length > 0) {
    return { errors: validationErrors };
  }

  return {
    exam,
    errors: [],
  };
}
