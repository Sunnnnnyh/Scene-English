export const normalizeSpelling = (value: string) => value.trim().toLowerCase();

export const isNormalizedSpellingMatch = (input: string, target: string) =>
  normalizeSpelling(input) === normalizeSpelling(target);
