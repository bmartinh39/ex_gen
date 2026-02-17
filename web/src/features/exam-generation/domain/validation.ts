import type { Exam, Question } from "./types";

export function validateQuestion(question: Question): string[] {
  const errors: string[] = [];

  if (!question.ceIds || question.ceIds.length < 1) {
    errors.push(`Question ${question.id} must reference at least one CE.`);
  }

  if (question.type === "multiple-choice") {
    if (!question.options || question.options.length < 2) {
      errors.push(
        `Multiple choice question ${question.id} must have at least 2 options.`,
      );
    }

    const correctOptions = question.options.filter((option) => option.isCorrect);
    if (correctOptions.length !== 1) {
      errors.push(
        `Multiple choice question ${question.id} must have exactly one correct option.`,
      );
    }
  }

  return errors;
}

export function validateExam(exam: Exam): string[] {
  const errors: string[] = [];

  if (!exam.questions || exam.questions.length < 1) {
    errors.push("Exam must contain at least 1 question.");
    return errors;
  }

  const seenQuestionIds = new Set<string>();

  for (const question of exam.questions) {
    const questionErrors = validateQuestion(question);
    errors.push(...questionErrors);

    if (seenQuestionIds.has(question.id)) {
      errors.push(`Question ID '${question.id}' is duplicated within the exam.`);
    } else {
      seenQuestionIds.add(question.id);
    }
  }

  if (exam.distribution?.byCount) {
    const { theoreticalPct, practicalPct, tolerancePct = 0 } = exam.distribution.byCount;

    if (!Number.isFinite(theoreticalPct) || theoreticalPct < 0 || theoreticalPct > 100) {
      errors.push("distribution.byCount.theoreticalPct must be between 0 and 100.");
    }

    if (!Number.isFinite(practicalPct) || practicalPct < 0 || practicalPct > 100) {
      errors.push("distribution.byCount.practicalPct must be between 0 and 100.");
    }

    if (!Number.isFinite(tolerancePct) || tolerancePct < 0 || tolerancePct > 100) {
      errors.push("distribution.byCount.tolerancePct must be between 0 and 100.");
    }

    if (theoreticalPct + practicalPct !== 100) {
      errors.push("distribution.byCount percentages must add up to 100.");
    }

    const totalQuestions = exam.questions.length;
    const theoreticalCount = exam.questions.filter(
      (question) => question.intent === "theoretical",
    ).length;
    const practicalCount = totalQuestions - theoreticalCount;

    const actualTheoreticalPct = (theoreticalCount / totalQuestions) * 100;
    const actualPracticalPct = (practicalCount / totalQuestions) * 100;

    if (Math.abs(actualTheoreticalPct - theoreticalPct) > tolerancePct) {
      errors.push(
        `Theoretical questions percentage (${actualTheoreticalPct.toFixed(
          2,
        )}%) is outside allowed tolerance.`,
      );
    }

    if (Math.abs(actualPracticalPct - practicalPct) > tolerancePct) {
      errors.push(
        `Practical questions percentage (${actualPracticalPct.toFixed(
          2,
        )}%) is outside allowed tolerance.`,
      );
    }
  }

  return errors;
}
