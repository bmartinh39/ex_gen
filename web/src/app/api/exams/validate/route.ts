import { NextResponse } from "next/server";

import { isValidateExamRequestBody } from "@/features/exam-generation/app/contracts/exam-input.guards";
import { validateExamUseCase } from "@/features/exam-generation/app/validate-exam.use-case";

import { requireApiKey } from "@/app/api/_shared/require-api-key";

export async function POST(request: Request) {
  const apiKeyErrorResponse = requireApiKey(request);
  if (apiKeyErrorResponse) {
    return apiKeyErrorResponse;
  }

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

  const output = validateExamUseCase({ exam: body.exam });
  return NextResponse.json(output, { status: 200 });
}
