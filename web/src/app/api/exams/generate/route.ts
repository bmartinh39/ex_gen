import { NextResponse } from "next/server";

import { isGenerateExamUseCaseInput } from "@/features/exam-generation/app/contracts/exam-input.guards";
import {
  generateExamUseCase,
} from "@/features/exam-generation/app/generate-exam.use-case";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!isGenerateExamUseCaseInput(body)) {
    return NextResponse.json(
      { error: "Invalid request body for exam generation." },
      { status: 400 },
    );
  }

  const output = generateExamUseCase(body);
  if (output.errors.length > 0 || !output.exam) {
    return NextResponse.json({ errors: output.errors }, { status: 400 });
  }

  return NextResponse.json({ exam: output.exam }, { status: 200 });
}
