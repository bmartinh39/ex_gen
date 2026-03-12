import type { LearningPlan } from "../../domain";

export interface LearningPlanRepository {
  findByModuleId(moduleId: string): Promise<LearningPlan | null>;
}
