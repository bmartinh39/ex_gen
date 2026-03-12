import { readFile } from "node:fs/promises";
import path from "node:path";

import type { LearningPlan } from "../domain";
import { isLearningPlan } from "../app/contracts/curriculum.guards";
import type { LearningPlanRepository } from "../app/ports/learning-plan.repository";

export class FileLearningPlanRepository implements LearningPlanRepository {
  constructor(
    private readonly directoryPath = path.resolve(
      process.cwd(),
      "src/features/exam-generation/infrastructure/learning-plans",
    ),
  ) {}

  async findByModuleId(moduleId: string): Promise<LearningPlan | null> {
    const filePath = path.join(this.directoryPath, `${moduleId}.learning-plan.json`);

    let rawContent: string;
    try {
      rawContent = await readFile(filePath, "utf-8");
    } catch (error) {
      if (isMissingFileError(error)) {
        return null;
      }

      throw error;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      throw new Error(`Learning plan file '${filePath}' contains invalid JSON.`);
    }

    if (!isLearningPlan(parsed)) {
      throw new Error(`Learning plan file '${filePath}' does not match the domain schema.`);
    }

    if (parsed.module.id !== moduleId) {
      throw new Error(
        `Learning plan file '${filePath}' does not match requested module '${moduleId}'.`,
      );
    }

    return parsed;
  }
}

function isMissingFileError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}
