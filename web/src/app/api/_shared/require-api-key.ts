import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

function extractApiKey(request: Request): string | null {
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader?.slice("Bearer ".length).trim() ?? null;
  }

  const xApiKey = request.headers.get("x-api-key");
  return xApiKey?.trim() ?? null;
}

function safeEqual(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a, "utf-8");
  const bBuffer = Buffer.from(b, "utf-8");
  if (aBuffer.length !== bBuffer.length) {
    return false;
  }
  return timingSafeEqual(aBuffer, bBuffer);
} 

export function requireApiKey(request: Request): NextResponse | null {
    const expected = process.env.EX_GEN_API_KEY;
    if (!expected) {
        return NextResponse.json(
            { error: "API key is not configured on the server." },
            { status: 500 },
        );
    }

    const provided = extractApiKey(request);
    if (!provided || !safeEqual(provided, expected)) {
        return NextResponse.json(
            { error: "Unauthorized: Invalid or missing API key." },
            { status: 401 },
        );
    }   
    return null; // Indicates the API key is valid
}