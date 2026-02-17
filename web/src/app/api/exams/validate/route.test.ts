import { describe, expect, it } from "vitest";

import { POST } from "./route";
import type { Exam } from "@/features/exam-generation/domain/types";

function buildValidExam(): Exam {
  return {
    id: "exam-1",
    name: "Sample exam",
    difficulty: "easy",
    moduleId: "module-1",
    questions: [
      {
        id: "q-1",
        type: "multiple-choice",
        text: "Which one is correct?",
        difficulty: "easy",
        ceIds: ["ce-1"],
        options: [
          { id: "o-1", text: "A", isCorrect: true },
          { id: "o-2", text: "B", isCorrect: false },
        ],
      },
    ],
  };
}

describe("POST /api/exams/validate", () => {
  it("returns 400 for malformed JSON", async () => {
    const request = new Request("http://localhost/api/exams/validate", {
      method: "POST",
      body: "{invalid-json",
      headers: { "content-type": "application/json" },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: "Invalid JSON body." });
  });

  it("returns 400 when body does not contain exam", async () => {
    const request = new Request("http://localhost/api/exams/validate", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "content-type": "application/json" },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: "Invalid request body. Expected { exam }." });
  });

  it("returns 400 when exam payload shape is invalid", async () => {
    const request = new Request("http://localhost/api/exams/validate", {
      method: "POST",
      body: JSON.stringify({
        exam: {
          id: "exam-1",
          name: "Invalid exam",
          difficulty: "easy",
          moduleId: "module-1",
          questions: [
            {
              id: "q-1",
              type: "multiple-choice",
              text: "Bad shape question",
              difficulty: "easy",
              ceIds: ["ce-1"],
            },
          ],
        },
      }),
      headers: { "content-type": "application/json" },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: "Invalid request body. Expected { exam }." });
  });

  it("returns 200 with validation errors", async () => {
    const invalidExam = buildValidExam();
    invalidExam.questions = [];

    const request = new Request("http://localhost/api/exams/validate", {
      method: "POST",
      body: JSON.stringify({ exam: invalidExam }),
      headers: { "content-type": "application/json" },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ errors: ["Exam must contain at least 1 question."] });
  });

  it("returns 200 with empty errors for a valid exam", async () => {
    const request = new Request("http://localhost/api/exams/validate", {
      method: "POST",
      body: JSON.stringify({ exam: buildValidExam() }),
      headers: { "content-type": "application/json" },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ errors: [] });
  });
});
