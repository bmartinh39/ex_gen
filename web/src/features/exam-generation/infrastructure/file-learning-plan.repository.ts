import { readFile, readdir } from "node:fs/promises";
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
    const fileNames = await readdir(this.directoryPath);

    for (const fileName of fileNames) {
      if (!fileName.endsWith(".learning-plan.json")) {
        continue;
      }

      const learningPlan = await this.readLearningPlan(
        path.join(this.directoryPath, fileName),
      );

      if (learningPlan.module.id === moduleId) {
        return learningPlan;
      }
    }

    return null;
  }

  private async readLearningPlan(filePath: string): Promise<LearningPlan> {
    let rawContent: string;
    try {
      rawContent = await readFile(filePath, "utf-8");
    } catch (error) {
      if (isMissingFileError(error)) {
        throw new Error(`Learning plan file '${filePath}' could not be found.`);
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

    return parsed;
  }
}

function isMissingFileError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}
