import { NextResponse } from "next/server";

import {
  isGenerateExamFromModuleInput,
  isGenerateExamUseCaseInput,
} from "@/features/exam-generation/app/contracts/exam-input.guards";
import type { GenerateExamUseCaseInput } from "@/features/exam-generation/app/contracts/generate-exam.contracts";
import {
  generateExamUseCase,
} from "@/features/exam-generation/app/generate-exam.use-case";
import { resolveGenerateExamInputFromModule } from "@/features/exam-generation/app/services/resolve-generate-input";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  let generateInput: GenerateExamUseCaseInput | null = null;
  if (isGenerateExamUseCaseInput(body)) {
    generateInput = body;
  } else if (isGenerateExamFromModuleInput(body)) {
    const resolved = resolveGenerateExamInputFromModule(body);
    if (resolved.error) {
      return NextResponse.json({ error: resolved.error }, { status: 404 });
    }

    if (!resolved.value) {
      return NextResponse.json(
        { error: "Invalid request body for exam generation." },
        { status: 400 },
      );
    }

    generateInput = resolved.value;
  } else {
    return NextResponse.json(
      { error: "Invalid request body for exam generation." },
      { status: 400 },
    );
  }

  if (generateInput === null) {
    return NextResponse.json(
      { error: "Invalid request body for exam generation." },
      { status: 400 },
    );
  }

  const output = generateExamUseCase(generateInput);
  if (output.errors.length > 0 || !output.exam) {
    return NextResponse.json({ errors: output.errors }, { status: 400 });
  }

  return NextResponse.json({ exam: output.exam }, { status: 200 });
}
