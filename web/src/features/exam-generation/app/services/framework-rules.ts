import type { GenerateExamUseCaseInput, FrameworkId } from "../contracts/generate-exam.contracts";

export type FrameworkRules = {
  validateGenerateExamInput: (input: GenerateExamUseCaseInput) => string[];
};

const spainFrameworkRules: FrameworkRules = {
  validateGenerateExamInput: () => [],
};

const frameworkRulesById: Record<FrameworkId, FrameworkRules> = {
  es: spainFrameworkRules,
};

export function resolveFrameworkRules(
  frameworkId: FrameworkId | undefined,
): FrameworkRules {
  return frameworkRulesById[frameworkId ?? "es"];
}
