import { describe, expect, it } from "vitest";

import { validateExam } from "./validation";
import type { Exam } from "./types";

function buildBaseExam(): Exam {
  return {
    id: "exam-1",
    name: "Sample exam",
    difficulty: "easy",
    moduleId: "module-1",
    questions: [
      {
        id: "q-1",
        type: "multiple-choice",
        text: "Which one is correct?",
        difficulty: "easy",
        ceIds: ["ce-1"],
        intent: "theoretical",
        options: [
          { id: "o-1", text: "A", isCorrect: true },
          { id: "o-2", text: "B", isCorrect: false },
        ],
      },
    ],
  };
}

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

  it("passes for a valid exam", () => {
    const exam = buildBaseExam();

    const errors = validateExam(exam);

    expect(errors).toEqual([]);
  });

  it("fails when a question has no CE references", () => {
    const exam = buildBaseExam();
    exam.questions[0].ceIds = [];

    const errors = validateExam(exam);

    expect(errors).toContain("Question q-1 must reference at least one CE.");
  });

  it("fails when multiple-choice has fewer than 2 options", () => {
    const exam = buildBaseExam();
    if (exam.questions[0].type === "multiple-choice") {
      exam.questions[0].options = [{ id: "o-1", text: "A", isCorrect: true }];
    }

    const errors = validateExam(exam);

    expect(errors).toContain(
      "Multiple choice question q-1 must have at least 2 options.",
    );
  });

  it("fails when multiple-choice has more than one correct option", () => {
    const exam = buildBaseExam();
    if (exam.questions[0].type === "multiple-choice") {
      exam.questions[0].options = [
        { id: "o-1", text: "A", isCorrect: true },
        { id: "o-2", text: "B", isCorrect: true },
      ];
    }

    const errors = validateExam(exam);

    expect(errors).toContain(
      "Multiple choice question q-1 must have exactly one correct option.",
    );
  });

  it("fails when question IDs are duplicated", () => {
    const exam = buildBaseExam();
    exam.questions.push({
      id: "q-1",
      type: "true-false",
      text: "True or false?",
      difficulty: "easy",
      ceIds: ["ce-2"],
      intent: "practical",
      correctAnswer: true,
    });

    const errors = validateExam(exam);

    expect(errors).toContain("Question ID 'q-1' is duplicated within the exam.");
  });

  it("fails when distribution percentages do not add up to 100", () => {
    const exam = buildBaseExam();
    exam.distribution = {
      byCount: {
        theoreticalPct: 70,
        practicalPct: 20,
      },
    };

    const errors = validateExam(exam);

    expect(errors).toContain(
      "distribution.byCount percentages must add up to 100.",
    );
  });

  it("fails when actual distribution is outside tolerance", () => {
    const exam = buildBaseExam();
    exam.questions.push({
      id: "q-2",
      type: "true-false",
      text: "Apply the concept in a scenario.",
      difficulty: "easy",
      ceIds: ["ce-2"],
      intent: "practical",
      correctAnswer: true,
    });
    exam.distribution = {
      byCount: {
        theoreticalPct: 100,
        practicalPct: 0,
        tolerancePct: 0,
      },
    };

    const errors = validateExam(exam);

    expect(errors).toContain(
      "Theoretical questions percentage (50.00%) is outside allowed tolerance.",
    );
    expect(errors).toContain(
      "Practical questions percentage (50.00%) is outside allowed tolerance.",
    );
  });

  it("passes when distribution is within tolerance", () => {
    const exam = buildBaseExam();
    exam.questions.push({
      id: "q-2",
      type: "true-false",
      text: "Apply the concept in a scenario.",
      difficulty: "easy",
      ceIds: ["ce-2"],
      intent: "practical",
      correctAnswer: true,
    });
    exam.distribution = {
      byCount: {
        theoreticalPct: 40,
        practicalPct: 60,
        tolerancePct: 10,
      },
    };

    const errors = validateExam(exam);

    expect(errors).toEqual([]);
  });
});
