import { describe, expect, it } from "vitest";

import { POST } from "./route";
import type { Question } from "@/features/exam-generation/domain";

function buildQuestion(id: string, intent: "theoretical" | "practical"): Question {
  return {
    id,
    type: "true-false",
    text: `Question ${id}`,
    difficulty: "easy",
    ceIds: ["ce-1"],
    intent,
    correctAnswer: true,
  };
}

describe("POST /api/exams/generate", () => {
  it("returns 400 for malformed JSON", async () => {
    const request = new Request("http://localhost/api/exams/generate", {
      method: "POST",
      body: "{invalid-json",
      headers: { "content-type": "application/json" },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: "Invalid JSON body." });
  });

  it("returns 400 for invalid request body", async () => {
    const request = new Request("http://localhost/api/exams/generate", {
      method: "POST",
      body: JSON.stringify({ name: "Missing fields" }),
      headers: { "content-type": "application/json" },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: "Invalid request body for exam generation." });
  });

  it("returns 400 when generation fails business constraints", async () => {
    const request = new Request("http://localhost/api/exams/generate", {
      method: "POST",
      body: JSON.stringify({
        examId: "exam-1",
        name: "Generated exam",
        moduleId: "module-1",
        difficulty: "easy",
        questionCount: 2,
        availableQuestions: [buildQuestion("q-1", "theoretical")],
        distribution: {
          byCount: {
            theoreticalPct: 0,
            practicalPct: 100,
          },
        },
      }),
      headers: { "content-type": "application/json" },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({
      errors: ["Not enough available questions to satisfy questionCount."],
    });
  });

  it("returns 200 with a generated valid exam", async () => {
    const request = new Request("http://localhost/api/exams/generate", {
      method: "POST",
      body: JSON.stringify({
        examId: "exam-1",
        name: "Generated exam",
        moduleId: "module-1",
        difficulty: "easy",
        questionCount: 4,
        availableQuestions: [
          buildQuestion("q-1", "theoretical"),
          buildQuestion("q-2", "theoretical"),
          buildQuestion("q-3", "practical"),
          buildQuestion("q-4", "practical"),
        ],
        distribution: {
          byCount: {
            theoreticalPct: 50,
            practicalPct: 50,
            tolerancePct: 0,
          },
        },
      }),
      headers: { "content-type": "application/json" },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.exam).toBeDefined();
    expect(body.exam.questions).toHaveLength(4);
  });
});
