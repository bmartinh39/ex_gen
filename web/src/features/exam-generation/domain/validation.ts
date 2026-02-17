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

  return errors;
}
