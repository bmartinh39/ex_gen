import { describe, expect, it } from "vitest";

import { generateExamUseCase } from "./generate-exam.use-case";
import type { Question } from "../domain";

function buildQuestion(id: string, intent: "theoretical" | "practical"): Question {
  return {
    id,
    type: "true-false",
    text: `Question ${id}`,
    difficulty: "easy",
    ceIds: ["ce-1"],
    intent,
    correctAnswer: true,
  };
}

describe("generateExamUseCase", () => {
  it("generates an exam using the requested distribution", () => {
    const availableQuestions: Question[] = [
      buildQuestion("q-1", "theoretical"),
      buildQuestion("q-2", "theoretical"),
      buildQuestion("q-3", "practical"),
      buildQuestion("q-4", "practical"),
    ];

    const output = generateExamUseCase({
      examId: "exam-1",
      name: "Generated exam",
      moduleId: "module-1",
      difficulty: "easy",
      questionCount: 4,
      availableQuestions,
      distribution: {
        byCount: {
          theoreticalPct: 50,
          practicalPct: 50,
          tolerancePct: 0,
        },
      },
    });

    expect(output.errors).toEqual([]);
    expect(output.exam).toBeDefined();
    expect(output.exam?.questions).toHaveLength(4);
  });

  it("fails when there are not enough practical questions", () => {
    const availableQuestions: Question[] = [
      buildQuestion("q-1", "theoretical"),
      buildQuestion("q-2", "theoretical"),
      buildQuestion("q-3", "theoretical"),
    ];

    const output = generateExamUseCase({
      examId: "exam-1",
      name: "Generated exam",
      moduleId: "module-1",
      difficulty: "easy",
      questionCount: 3,
      availableQuestions,
      distribution: {
        byCount: {
          theoreticalPct: 0,
          practicalPct: 100,
        },
      },
    });

    expect(output.exam).toBeUndefined();
    expect(output.errors).toContain(
      "Not enough practical questions. Required 3, found 0.",
    );
  });
});
