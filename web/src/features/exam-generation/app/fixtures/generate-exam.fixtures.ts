import type {
  AssessmentCriterion,
  LearningOutcome,
  Question,
} from "../../domain";
import type { GenerateExamUseCaseInput } from "../contracts/generate-exam.contracts";

function buildLearningOutcomes(
  moduleId: string,
  prefix: string,
  count: number,
): LearningOutcome[] {
  return Array.from({ length: count }, (_, index) => {
    const id = `${prefix}-lo-${index + 1}`;
    return {
      id,
      moduleId,
      description: `Learning outcome ${index + 1} for ${moduleId}.`,
    };
  });
}

function buildAssessmentCriteria(
  learningOutcomes: LearningOutcome[],
  perLearningOutcome: number,
  prefix: string,
): AssessmentCriterion[] {
  return learningOutcomes.flatMap((learningOutcome, loIndex) =>
    Array.from({ length: perLearningOutcome }, (_, criterionIndex) => ({
      id: `${prefix}-ce-${loIndex + 1}-${criterionIndex + 1}`,
      learningOutcomeId: learningOutcome.id,
      description: `Assessment criterion ${criterionIndex + 1} for ${learningOutcome.id}.`,
    })),
  );
}

function buildQuestion(
  index: number,
  difficulty: "easy" | "medium" | "hard",
  intent: "theoretical" | "practical",
  ceIds: string[],
  label: string,
): Question {
  const questionId = `${label}-q-${index + 1}`;
  const typeSelector = index % 3;

  if (typeSelector === 0) {
    const correctIndex = index % 4;
    return {
      id: questionId,
      type: "multiple-choice",
      text: `MCQ ${index + 1}: choose the correct statement for ${label}.`,
      difficulty,
      intent,
      ceIds,
      options: [
        { id: `${questionId}-o-1`, text: "Option A", isCorrect: correctIndex === 0 },
        { id: `${questionId}-o-2`, text: "Option B", isCorrect: correctIndex === 1 },
        { id: `${questionId}-o-3`, text: "Option C", isCorrect: correctIndex === 2 },
        { id: `${questionId}-o-4`, text: "Option D", isCorrect: correctIndex === 3 },
      ],
    };
  }

  if (typeSelector === 1) {
    return {
      id: questionId,
      type: "true-false",
      text: `TF ${index + 1}: evaluate whether the statement is correct for ${label}.`,
      difficulty,
      intent,
      ceIds,
      correctAnswer: index % 2 === 0,
    };
  }

  return {
    id: questionId,
    type: "short-answer",
    text: `Short answer ${index + 1}: explain the approach for ${label}.`,
    difficulty,
    intent,
    ceIds,
    expectedAnswer: "Expected answer placeholder.",
  };
}

function buildQuestionBank(
  criteria: AssessmentCriterion[],
  count: number,
  label: string,
): Question[] {
  return Array.from({ length: count }, (_, index) => {
    const difficulty = (["easy", "medium", "hard"] as const)[index % 3];
    const intent = (["theoretical", "practical"] as const)[index % 2];
    const primaryCeId = criteria[index % criteria.length].id;
    const secondaryCeId = criteria[(index * 7 + 3) % criteria.length].id;
    const ceIds =
      primaryCeId === secondaryCeId ? [primaryCeId] : [primaryCeId, secondaryCeId];

    return buildQuestion(index, difficulty, intent, ceIds, label);
  });
}

const moduleAId = "module-hospitality-1";
const learningOutcomesA = buildLearningOutcomes(moduleAId, "hos", 6);
const assessmentCriteriaA = buildAssessmentCriteria(learningOutcomesA, 8, "hos");

const moduleBId = "module-healthcare-1";
const learningOutcomesB = buildLearningOutcomes(moduleBId, "hea", 7);
const assessmentCriteriaB = buildAssessmentCriteria(learningOutcomesB, 7, "hea");

export const fixtureGenerateExamHospitality: GenerateExamUseCaseInput = {
  examId: "exam-hos-40",
  name: "Hospitality Exam Fixture (40 questions)",
  moduleId: moduleAId,
  frameworkId: "es",
  difficulty: "medium",
  questionCount: 40,
  availableQuestions: buildQuestionBank(assessmentCriteriaA, 40, "hos"),
  distribution: {
    byCount: {
      theoreticalPct: 50,
      practicalPct: 50,
      tolerancePct: 5,
    },
  },
  learningOutcomes: learningOutcomesA,
  assessmentCriteria: assessmentCriteriaA,
};

export const fixtureGenerateExamHealthcare: GenerateExamUseCaseInput = {
  examId: "exam-hea-40",
  name: "Healthcare Exam Fixture (40 questions)",
  moduleId: moduleBId,
  frameworkId: "es",
  difficulty: "hard",
  questionCount: 40,
  availableQuestions: buildQuestionBank(assessmentCriteriaB, 40, "hea"),
  distribution: {
    byCount: {
      theoreticalPct: 40,
      practicalPct: 60,
      tolerancePct: 5,
    },
  },
  learningOutcomes: learningOutcomesB,
  assessmentCriteria: assessmentCriteriaB,
  coverageWeights: {
    learningOutcomeWeights: [
      { learningOutcomeId: learningOutcomesB[0].id, percentage: 18 },
      { learningOutcomeId: learningOutcomesB[1].id, percentage: 16 },
      { learningOutcomeId: learningOutcomesB[2].id, percentage: 15 },
      { learningOutcomeId: learningOutcomesB[3].id, percentage: 14 },
      { learningOutcomeId: learningOutcomesB[4].id, percentage: 13 },
      { learningOutcomeId: learningOutcomesB[5].id, percentage: 12 },
      { learningOutcomeId: learningOutcomesB[6].id, percentage: 12 },
    ],
  },
};
