import { validateExam } from "../domain/validation";
import type { Exam } from "../domain/types";

export type ValidateExamUseCaseInput = {
  exam: Exam;
};

export type ValidateExamUseCaseOutput = {
  errors: string[];
};

export function validateExamUseCase(
  input: ValidateExamUseCaseInput,
): ValidateExamUseCaseOutput {
  return {
    errors: validateExam(input.exam),
  };
}
