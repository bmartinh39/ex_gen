import { describe, expect, it } from "vitest";

import { generateExamUseCase } from "./generate-exam.use-case";
import type { AssessmentCriterion, LearningOutcome, Question } from "../domain";

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

  it("uses equal default weights for learning outcomes and assessment criteria", () => {
    const learningOutcomes: LearningOutcome[] = [
      { id: "ra-1", moduleId: "module-1", description: "RA 1" },
      { id: "ra-2", moduleId: "module-1", description: "RA 2" },
    ];

    const assessmentCriteria: AssessmentCriterion[] = [
      { id: "ce-1", learningOutcomeId: "ra-1", description: "CE 1" },
      { id: "ce-2", learningOutcomeId: "ra-1", description: "CE 2" },
      { id: "ce-3", learningOutcomeId: "ra-2", description: "CE 3" },
      { id: "ce-4", learningOutcomeId: "ra-2", description: "CE 4" },
    ];

    const availableQuestions: Question[] = [
      buildQuestion("q-1", "theoretical"),
      buildQuestion("q-2", "theoretical"),
      buildQuestion("q-3", "practical"),
      buildQuestion("q-4", "practical"),
    ];
    availableQuestions[0].ceIds = ["ce-1"];
    availableQuestions[1].ceIds = ["ce-2"];
    availableQuestions[2].ceIds = ["ce-3"];
    availableQuestions[3].ceIds = ["ce-4"];

    const output = generateExamUseCase({
      examId: "exam-1",
      name: "Generated exam",
      moduleId: "module-1",
      difficulty: "easy",
      questionCount: 4,
      availableQuestions,
      learningOutcomes,
      assessmentCriteria,
    });

    expect(output.errors).toEqual([]);
    expect(output.exam).toBeDefined();

    const selectedCeIds = new Set(
      (output.exam?.questions ?? []).flatMap((question) => question.ceIds),
    );
    expect(selectedCeIds).toEqual(new Set(["ce-1", "ce-2", "ce-3", "ce-4"]));
  });

  it("honors explicit learning outcome weights", () => {
    const learningOutcomes: LearningOutcome[] = [
      { id: "ra-1", moduleId: "module-1", description: "RA 1" },
      { id: "ra-2", moduleId: "module-1", description: "RA 2" },
    ];

    const assessmentCriteria: AssessmentCriterion[] = [
      { id: "ce-1", learningOutcomeId: "ra-1", description: "CE 1" },
      { id: "ce-2", learningOutcomeId: "ra-2", description: "CE 2" },
    ];

    const availableQuestions: Question[] = [
      { ...buildQuestion("q-1", "theoretical"), ceIds: ["ce-1"] },
      { ...buildQuestion("q-2", "theoretical"), ceIds: ["ce-1"] },
      { ...buildQuestion("q-3", "theoretical"), ceIds: ["ce-1"] },
      { ...buildQuestion("q-4", "practical"), ceIds: ["ce-2"] },
    ];

    const output = generateExamUseCase({
      examId: "exam-1",
      name: "Generated exam",
      moduleId: "module-1",
      difficulty: "easy",
      questionCount: 4,
      availableQuestions,
      learningOutcomes,
      assessmentCriteria,
      coverageWeights: {
        learningOutcomeWeights: [
          { learningOutcomeId: "ra-1", percentage: 75 },
          { learningOutcomeId: "ra-2", percentage: 25 },
        ],
      },
    });

    expect(output.errors).toEqual([]);
    expect(output.exam).toBeDefined();

    const ceCounts = (output.exam?.questions ?? []).reduce<Record<string, number>>(
      (acc, question) => {
        for (const ceId of question.ceIds) {
          acc[ceId] = (acc[ceId] ?? 0) + 1;
        }
        return acc;
      },
      {},
    );

    expect(ceCounts["ce-1"]).toBe(3);
    expect(ceCounts["ce-2"]).toBe(1);
  });
});
