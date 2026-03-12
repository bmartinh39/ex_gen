import { describe, expect, it } from "vitest";

import { FileLearningPlanRepository } from "./file-learning-plan.repository";

describe("FileLearningPlanRepository", () => {
  it("loads a learning plan by module id", async () => {
    const repository = new FileLearningPlanRepository();

    const learningPlan = await repository.findByModuleId("module-daw-0614");

    expect(learningPlan).not.toBeNull();
    expect(learningPlan?.module.id).toBe("module-daw-0614");
    expect(learningPlan?.module.officialCode).toBe("IFCS03_0614");
    expect(learningPlan?.learningOutcomes).toHaveLength(6);
    expect(learningPlan?.learningOutcomes[0].assessmentCriteria).toHaveLength(9);
    expect(learningPlan?.contentUnits).toHaveLength(6);
  });

  it("returns null when the learning plan file does not exist", async () => {
    const repository = new FileLearningPlanRepository();

    await expect(
      repository.findByModuleId("module-that-does-not-exist"),
    ).resolves.toBeNull();
  });

  it("loads a learning plan even when the filename is based on the official code", async () => {
    const repository = new FileLearningPlanRepository();

    const learningPlan = await repository.findByModuleId("module-daw-0613");

    expect(learningPlan).not.toBeNull();
    expect(learningPlan?.module.officialCode).toBe("IFCS03_0613");
    expect(learningPlan?.module.code).toBe("0613");
  });
});
