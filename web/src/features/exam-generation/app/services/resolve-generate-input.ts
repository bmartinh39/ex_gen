import type {
  GenerateExamFromModuleInput,
  GenerateExamUseCaseInput,
} from "../contracts/generate-exam.contracts";
import { getInMemoryGenerationContextByModuleId } from "../../infra/in-memory/generation-seed";

export function resolveGenerateExamInputFromModule(
  input: GenerateExamFromModuleInput,
): { value?: GenerateExamUseCaseInput; error?: string } {
  const context = getInMemoryGenerationContextByModuleId(input.moduleId);
  if (!context) {
    return {
      error: `No in-memory curriculum data found for module '${input.moduleId}'.`,
    };
  }

  return {
    value: {
      ...input,
      availableQuestions: context.availableQuestions,
      learningOutcomes: context.learningOutcomes,
      assessmentCriteria: context.assessmentCriteria,
    },
  };
}
