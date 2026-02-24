import { describe, expect, it, beforeAll, afterAll } from "vitest";

import { POST } from "./route";
import type { Question } from "@/features/exam-generation/domain";

const previousApiKey = process.env.EX_GEN_API_KEY;
const authHeaders = {
  "content-type": "application/json",
  "x-api-key": "test-api-key",
};


beforeAll(() => {
  process.env.EX_GEN_API_KEY = "test-api-key";
});

afterAll(() => {
  if (previousApiKey == undefined){
    delete process.env.EX_GEN_API_KEY;
  } else {
    process.env.EX_GEN_API_KEY = previousApiKey;
  }
});

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
      headers: authHeaders,
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
      headers: authHeaders,
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: "Invalid request body for exam generation." });
  });

  it("returns 400 for unsupported frameworkId", async () => {
    const request = new Request("http://localhost/api/exams/generate", {
      method: "POST",
      body: JSON.stringify({
        examId: "exam-1",
        name: "Generated exam",
        moduleId: "module-1",
        difficulty: "easy",
        frameworkId: "uk",
        questionCount: 1,
        availableQuestions: [buildQuestion("q-1", "theoretical")],
      }),
      headers: authHeaders,
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
      headers: authHeaders,
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
      headers: authHeaders,
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.exam).toBeDefined();
    expect(body.exam.questions).toHaveLength(4);
  });

  it("returns 401 for missing API key", async () => {
    const request = new Request("http://localhost/api/exams/generate", {
      method: "POST", 
      body: JSON.stringify({
        examId: "exam-1",
        name: "Generated exam", 
        moduleId: "module-1",   
        difficulty: "easy",
        questionCount: 1,
        availableQuestions: [buildQuestion("q-1", "theoretical")],
      }),
      headers: { "content-type": "application/json" },
    }); 

    const response = await POST(request);
    const body = await response.json();     
    
    expect(response.status).toBe(401);
    expect(body).toEqual({ error: "Unauthorized: Invalid or missing API key." });
  });

});
