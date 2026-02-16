import { NextResponse } from "next/server";

import { validateExam } from "@/app/features/exam-generation/domain/validation";
import type { Exam } from "@/app/features/exam-generation/domain/types";

type ValidateExamRequestBody = {
  exam: Exam;
};

function isValidateExamRequestBody(value: unknown): value is ValidateExamRequestBody {
  return (
    typeof value === "object" &&
    value !== null &&
    "exam" in value &&
    typeof (value as { exam?: unknown }).exam === "object" &&
    (value as { exam?: unknown }).exam !== null
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
