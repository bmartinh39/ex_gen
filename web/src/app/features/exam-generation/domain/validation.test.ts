import { describe, expect, it } from "vitest";

import { validateExam } from "./validation";
import type { Exam } from "./types";

describe("validateExam", () => {
  it("returns an error for an empty exam", () => {
    const exam: Exam = {
      id: "exam-1",
      name: "Sample exam",
      difficulty: "easy",
      moduleId: "module-1",
      questions: [],
    };

    const errors = validateExam(exam);

    expect(errors).toContain("Exam must contain at least 1 question.");
  });
});
