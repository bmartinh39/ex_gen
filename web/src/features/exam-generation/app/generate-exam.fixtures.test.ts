import { describe, expect, it } from "vitest";

import { generateExamUseCase } from "./generate-exam.use-case";
import {
  fixtureGenerateExamHealthcare,
  fixtureGenerateExamHospitality,
} from "./fixtures/generate-exam.fixtures";

describe("generateExamUseCase with realistic fixtures", () => {
  it("generates a valid 40-question exam from hospitality fixture", () => {
    const output = generateExamUseCase(fixtureGenerateExamHospitality);

    expect(output.errors).toEqual([]);
    expect(output.exam).toBeDefined();
    expect(output.exam?.questions).toHaveLength(40);
  });

  it("generates a valid 40-question exam from healthcare fixture", () => {
    const output = generateExamUseCase(fixtureGenerateExamHealthcare);

    expect(output.errors).toEqual([]);
    expect(output.exam).toBeDefined();
    expect(output.exam?.questions).toHaveLength(40);
  });
});
