export function normalizeWeights(
  ids: string[],
  explicitWeights: Array<{ id: string; percentage: number }> | undefined,
  label: string,
): { normalized: Record<string, number>; errors: string[] } {
  const errors: string[] = [];
  const normalized: Record<string, number> = {};

  if (ids.length === 0) {
    return { normalized, errors };
  }

  if (!explicitWeights || explicitWeights.length === 0) {
    const equal = 100 / ids.length;
    for (const id of ids) {
      normalized[id] = equal;
    }
    return { normalized, errors };
  }

  const uniqueExplicit = new Map<string, number>();
  for (const weight of explicitWeights) {
    if (!ids.includes(weight.id)) {
      errors.push(`${label} '${weight.id}' is not in the current scope.`);
      continue;
    }

    if (uniqueExplicit.has(weight.id)) {
      errors.push(`${label} '${weight.id}' is duplicated in weights.`);
      continue;
    }

    if (!Number.isFinite(weight.percentage) || weight.percentage < 0) {
      errors.push(`${label} '${weight.id}' has an invalid percentage.`);
      continue;
    }

    uniqueExplicit.set(weight.id, weight.percentage);
  }

  if (errors.length > 0) {
    return { normalized, errors };
  }

  let explicitTotal = 0;
  for (const value of uniqueExplicit.values()) {
    explicitTotal += value;
  }

  if (explicitTotal > 100) {
    errors.push(`${label} explicit percentages exceed 100.`);
    return { normalized, errors };
  }

  const missingIds = ids.filter((id) => !uniqueExplicit.has(id));
  const remaining = 100 - explicitTotal;
  const equalForMissing = missingIds.length > 0 ? remaining / missingIds.length : 0;

  for (const id of ids) {
    normalized[id] = uniqueExplicit.get(id) ?? equalForMissing;
  }

  return { normalized, errors };
}

export function allocateTargetsByLargestRemainder(
  questionCount: number,
  percentages: Record<string, number>,
): Record<string, number> {
  const target: Record<string, number> = {};
  const remainders: Array<{ id: string; remainder: number }> = [];
  let allocated = 0;

  for (const [id, pct] of Object.entries(percentages)) {
    const raw = (questionCount * pct) / 100;
    const base = Math.floor(raw);
    target[id] = base;
    allocated += base;
    remainders.push({ id, remainder: raw - base });
  }

  let missing = questionCount - allocated;
  remainders.sort((a, b) => b.remainder - a.remainder);

  let idx = 0;
  while (missing > 0 && remainders.length > 0) {
    target[remainders[idx].id] += 1;
    idx = (idx + 1) % remainders.length;
    missing -= 1;
  }

  return target;
}
