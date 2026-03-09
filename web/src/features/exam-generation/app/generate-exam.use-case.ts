import { validateExam } from "../domain/validation";
import type { Exam, Question } from "../domain";
import type {
  GenerateExamUseCaseInput,
  GenerateExamUseCaseOutput,
} from "./contracts/generate-exam.contracts";
import { buildCeTargetQuestionCounts } from "./services/coverage-planner";
import { resolveFrameworkRules } from "./services/framework-rules";
import {
  selectQuestionsByBaselineRanking,
  selectQuestionsByCeTargets,
  selectQuestionsByDistribution,
} from "./services/question-selector";

export function generateExamUseCase(
  input: GenerateExamUseCaseInput,
): GenerateExamUseCaseOutput {
  const errors: string[] = [];
  const warnings: string[] = [];
  const frameworkRules = resolveFrameworkRules(input.frameworkId);
  const frameworkValidationErrors = frameworkRules.validateGenerateExamInput(input);
  if (frameworkValidationErrors.length > 0) {
    return { errors: frameworkValidationErrors };
  }

  if (!Number.isInteger(input.questionCount) || input.questionCount < 1) {
    errors.push("questionCount must be an integer greater than 0.");
    return { errors };
  }

  if (input.availableQuestions.length < input.questionCount) {
    errors.push("Not enough available questions to satisfy questionCount.");
    return { errors };
  }

  let selectionResult: { questions: Question[]; errors: string[]; warnings: string[] };
  const byCount = input.distribution?.byCount;
  let candidatePool = input.availableQuestions;
  const hasCoverageContext =
    (input.learningOutcomes?.length ?? 0) > 0 &&
    (input.assessmentCriteria?.length ?? 0) > 0;
  const targetResult = hasCoverageContext
    ? buildCeTargetQuestionCounts(
        input.questionCount,
        input.learningOutcomes ?? [],
        input.assessmentCriteria ?? [],
        input.coverageWeights,
      )
    : null;

  if (targetResult?.errors.length) {
    return { errors: targetResult.errors };
  }

  if (byCount) {
    const distributionResult = selectQuestionsByDistribution(
      input.questionCount,
      input.availableQuestions,
      byCount,
      targetResult?.ceTargetCounts,
    );

    if (distributionResult.errors.length > 0) {
      return { errors: distributionResult.errors };
    }

    warnings.push(...distributionResult.warnings);
    candidatePool = distributionResult.questions;
  }

  if (hasCoverageContext) {
    selectionResult = selectQuestionsByCeTargets(
      input.questionCount,
      candidatePool,
      targetResult?.ceTargetCounts ?? {},
    );
  } else {
    selectionResult = byCount
      ? { questions: candidatePool, errors: [], warnings: [] }
      : selectQuestionsByBaselineRanking(
          input.questionCount,
          input.availableQuestions,
        );
  }

  if (selectionResult.errors.length > 0) {
    return { errors: selectionResult.errors };
  }
  warnings.push(...selectionResult.warnings);

  const exam: Exam = {
    id: input.examId,
    name: input.name,
    moduleId: input.moduleId,
    difficulty: input.difficulty,
    timeLimitMinutes: input.timeLimitMinutes,
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
    warnings,
  };
}
