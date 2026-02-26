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

  it("enforces theoretical/practical distribution before coverage selection", () => {
    const learningOutcomes: LearningOutcome[] = [
      { id: "ra-1", moduleId: "module-1", description: "RA 1" },
    ];

    const assessmentCriteria: AssessmentCriterion[] = [
      { id: "ce-1", learningOutcomeId: "ra-1", description: "CE 1" },
    ];

    const availableQuestions: Question[] = [
      { ...buildQuestion("q-1", "theoretical"), ceIds: ["ce-1"] },
      { ...buildQuestion("q-2", "theoretical"), ceIds: ["ce-1"] },
      { ...buildQuestion("q-3", "theoretical"), ceIds: ["ce-1"] },
      { ...buildQuestion("q-4", "practical"), ceIds: ["ce-1"] },
      { ...buildQuestion("q-5", "practical"), ceIds: ["ce-1"] },
      { ...buildQuestion("q-6", "practical"), ceIds: ["ce-1"] },
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
      learningOutcomes,
      assessmentCriteria,
    });

    expect(output.errors).toEqual([]);
    expect(output.exam).toBeDefined();

    const theoreticalCount =
      output.exam?.questions.filter((question) => question.intent === "theoretical")
        .length ?? 0;
    const practicalCount =
      output.exam?.questions.filter((question) => question.intent === "practical")
        .length ?? 0;

    expect(theoreticalCount).toBe(2);
    expect(practicalCount).toBe(2);
  });

  it("returns warnings instead of errors when CE coverage targets are not fully met", () => {
    const learningOutcomes: LearningOutcome[] = [
      { id: "ra-1", moduleId: "module-1", description: "RA 1" },
      { id: "ra-2", moduleId: "module-1", description: "RA 2" },
    ];

    const assessmentCriteria: AssessmentCriterion[] = [
      { id: "ce-1", learningOutcomeId: "ra-1", description: "CE 1" },
      { id: "ce-2", learningOutcomeId: "ra-2", description: "CE 2" },
    ];

    const availableQuestions: Question[] = [
      { ...buildQuestion("q-1", "theoretical"), ceIds: ["ce-2"] },
      { ...buildQuestion("q-2", "theoretical"), ceIds: ["ce-2"] },
      { ...buildQuestion("q-3", "practical"), ceIds: ["ce-2"] },
      { ...buildQuestion("q-4", "practical"), ceIds: ["ce-2"] },
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
    expect(output.warnings).toHaveLength(1);
    expect(output.warnings?.[0]).toContain(
      "Coverage targets could not be fully satisfied:",
    );
  });

  it("prefers higher CE affinity when binary CE overlap is equivalent", () => {
    const learningOutcomes: LearningOutcome[] = [
      { id: "ra-1", moduleId: "module-1", description: "RA 1" },
    ];

    const assessmentCriteria: AssessmentCriterion[] = [
      { id: "ce-1", learningOutcomeId: "ra-1", description: "CE 1" },
    ];

    const availableQuestions: Question[] = [
      {
        ...buildQuestion("q-low-affinity", "theoretical"),
        ceIds: ["ce-1"],
        ceCoverage: [{ ceId: "ce-1", score: 0.2 }],
      },
      {
        ...buildQuestion("q-high-affinity", "theoretical"),
        ceIds: ["ce-1"],
        ceCoverage: [{ ceId: "ce-1", score: 0.9 }],
      },
    ];

    const output = generateExamUseCase({
      examId: "exam-1",
      name: "Generated exam",
      moduleId: "module-1",
      difficulty: "easy",
      questionCount: 1,
      availableQuestions,
      learningOutcomes,
      assessmentCriteria,
    });

    expect(output.errors).toEqual([]);
    expect(output.exam).toBeDefined();
    expect(output.exam?.questions).toHaveLength(1);
    expect(output.exam?.questions[0].id).toBe("q-high-affinity");
  });
});
