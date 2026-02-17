import { describe, expect, it } from "vitest";

import { validateExamUseCase } from "./validate-exam.use-case";
import type { Exam } from "../domain/types";

describe("validateExamUseCase", () => {
  it("returns domain validation errors", () => {
    const exam: Exam = {
      id: "exam-1",
      name: "Sample exam",
      difficulty: "easy",
      moduleId: "module-1",
      questions: [],
    };

    const output = validateExamUseCase({ exam });

    expect(output).toEqual({
      errors: ["Exam must contain at least 1 question."],
    });
  });
});
