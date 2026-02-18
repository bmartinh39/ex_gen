import type { AssessmentCriterion, LearningOutcome, Question } from "../../domain";

type SeedQuestion = Question & {
  moduleId: string;
};

const learningOutcomes: LearningOutcome[] = [
  {
    id: "ra-1",
    moduleId: "module-1",
    description: "Understand core concepts and terminology.",
  },
  {
    id: "ra-2",
    moduleId: "module-1",
    description: "Apply concepts to realistic scenarios.",
  },
];

const assessmentCriteria: AssessmentCriterion[] = [
  { id: "ce-1", learningOutcomeId: "ra-1", description: "Identify definitions." },
  { id: "ce-2", learningOutcomeId: "ra-1", description: "Differentiate concepts." },
  { id: "ce-3", learningOutcomeId: "ra-2", description: "Solve guided exercises." },
  { id: "ce-4", learningOutcomeId: "ra-2", description: "Analyze practical cases." },
];

const questions: SeedQuestion[] = [
  {
    moduleId: "module-1",
    id: "q-1",
    type: "true-false",
    text: "Statement about a key definition.",
    difficulty: "easy",
    ceIds: ["ce-1"],
    intent: "theoretical",
    points: 1,
    correctAnswer: true,
  },
  {
    moduleId: "module-1",
    id: "q-2",
    type: "multiple-choice",
    text: "Pick the correct concept.",
    difficulty: "easy",
    ceIds: ["ce-2"],
    intent: "theoretical",
    points: 1,
    options: [
      { id: "o-1", text: "Correct", isCorrect: true },
      { id: "o-2", text: "Distractor", isCorrect: false },
    ],
  },
  {
    moduleId: "module-1",
    id: "q-3",
    type: "multiple-choice",
    text: "Differentiate similar terms.",
    difficulty: "medium",
    ceIds: ["ce-2"],
    intent: "theoretical",
    points: 1,
    options: [
      { id: "o-1", text: "Correct", isCorrect: true },
      { id: "o-2", text: "Distractor", isCorrect: false },
    ],
  },
  {
    moduleId: "module-1",
    id: "q-4",
    type: "short-answer",
    text: "Explain why a scenario works this way.",
    difficulty: "medium",
    ceIds: ["ce-3"],
    intent: "practical",
    points: 2,
    expectedAnswer: "Reasoned answer",
  },
  {
    moduleId: "module-1",
    id: "q-5",
    type: "true-false",
    text: "Evaluate a practical situation quickly.",
    difficulty: "easy",
    ceIds: ["ce-3"],
    intent: "practical",
    points: 1,
    correctAnswer: false,
  },
  {
    moduleId: "module-1",
    id: "q-6",
    type: "short-answer",
    text: "Analyze and justify an applied decision.",
    difficulty: "hard",
    ceIds: ["ce-4"],
    intent: "practical",
    points: 2,
    expectedAnswer: "Structured analysis",
  },
  {
    moduleId: "module-1",
    id: "q-7",
    type: "multiple-choice",
    text: "Choose the best intervention in a case.",
    difficulty: "medium",
    ceIds: ["ce-4"],
    intent: "practical",
    points: 1,
    options: [
      { id: "o-1", text: "Best option", isCorrect: true },
      { id: "o-2", text: "Less suitable", isCorrect: false },
    ],
  },
  {
    moduleId: "module-1",
    id: "q-8",
    type: "multiple-choice",
    text: "Recall a foundational concept.",
    difficulty: "easy",
    ceIds: ["ce-1"],
    intent: "theoretical",
    points: 1,
    options: [
      { id: "o-1", text: "Correct", isCorrect: true },
      { id: "o-2", text: "Distractor", isCorrect: false },
    ],
  },
];

export function getInMemoryGenerationContextByModuleId(moduleId: string): {
  learningOutcomes: LearningOutcome[];
  assessmentCriteria: AssessmentCriterion[];
  availableQuestions: Question[];
} | null {
  const moduleLearningOutcomes = learningOutcomes.filter(
    (learningOutcome) => learningOutcome.moduleId === moduleId,
  );

  if (moduleLearningOutcomes.length === 0) {
    return null;
  }

  const loIds = new Set(moduleLearningOutcomes.map((learningOutcome) => learningOutcome.id));

  const moduleAssessmentCriteria = assessmentCriteria.filter((criterion) =>
    loIds.has(criterion.learningOutcomeId),
  );
  const ceIds = new Set(moduleAssessmentCriteria.map((criterion) => criterion.id));

  const moduleQuestions = questions
    .filter((question) => question.moduleId === moduleId)
    .map(({ moduleId: _moduleId, ...question }) => question)
    .filter((question) => question.ceIds.some((ceId) => ceIds.has(ceId)));

  return {
    learningOutcomes: moduleLearningOutcomes,
    assessmentCriteria: moduleAssessmentCriteria,
    availableQuestions: moduleQuestions,
  };
}
