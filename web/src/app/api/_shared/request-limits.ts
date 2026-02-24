import { NextResponse } from "next/server";

export const MAX_JSON_BODY_SIZE = 1 * 256 * 1024; // 256 KB

export function requireContentLengthWithinLimit(
  request: Request,
  maxSize = MAX_JSON_BODY_SIZE,
): NextResponse | null {
  const raw = request.headers.get("content-length");
  if (!raw) return null; // Header may be missing (e.g. chunked encoding).
  const contentLength = Number(raw);

  if (!Number.isFinite(contentLength) || contentLength < 0) {
    return NextResponse.json(
      { error: "Invalid Content-Length header." },
      { status: 400 },
    );
  }

  if (contentLength > maxSize) {
    return NextResponse.json({ error: "Payload too large." }, { status: 413 });
  }

  return null;
}
