import { NextResponse } from "next/server";

import { validateExam } from "@/features/exam-generation/domain/validation";
import type {
  Difficulty,
  Exam,
  Option,
  Question,
} from "@/features/exam-generation/domain/types";

type ValidateExamRequestBody = {
  exam: Exam;
};

function isDifficulty(value: unknown): value is Difficulty {
  return value === "easy" || value === "medium" || value === "hard";
}

function isOption(value: unknown): value is Option {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { id?: unknown }).id === "string" &&
    typeof (value as { text?: unknown }).text === "string" &&
    typeof (value as { isCorrect?: unknown }).isCorrect === "boolean"
  );
}

function isQuestion(value: unknown): value is Question {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as {
    type?: unknown;
    id?: unknown;
    text?: unknown;
    difficulty?: unknown;
    ceIds?: unknown;
    options?: unknown;
    correctAnswer?: unknown;
    expectedAnswer?: unknown;
  };

  const hasCommonFields =
    typeof candidate.id === "string" &&
    typeof candidate.text === "string" &&
    isDifficulty(candidate.difficulty) &&
    Array.isArray(candidate.ceIds) &&
    candidate.ceIds.every((ceId) => typeof ceId === "string");

  if (!hasCommonFields) {
    return false;
  }

  if (candidate.type === "multiple-choice") {
    return Array.isArray(candidate.options) && candidate.options.every(isOption);
  }

  if (candidate.type === "true-false") {
    return typeof candidate.correctAnswer === "boolean";
  }

  if (candidate.type === "short-answer") {
    return typeof candidate.expectedAnswer === "string";
  }

  return false;
}

function isExam(value: unknown): value is Exam {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as {
    id?: unknown;
    name?: unknown;
    description?: unknown;
    difficulty?: unknown;
    moduleId?: unknown;
    questions?: unknown;
  };

  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    (candidate.description === undefined ||
      typeof candidate.description === "string") &&
    isDifficulty(candidate.difficulty) &&
    typeof candidate.moduleId === "string" &&
    Array.isArray(candidate.questions) &&
    candidate.questions.every(isQuestion)
  );
}

function isValidateExamRequestBody(value: unknown): value is ValidateExamRequestBody {
  return (
    typeof value === "object" &&
    value !== null &&
    "exam" in value &&
    isExam((value as { exam?: unknown }).exam)
  );
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!isValidateExamRequestBody(body)) {
    return NextResponse.json(
      { error: "Invalid request body. Expected { exam }." },
      { status: 400 },
    );
  }

  const errors = validateExam(body.exam);
  return NextResponse.json({ errors }, { status: 200 });
}
