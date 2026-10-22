// The only production source that defines restricted claims. NFKC and whitespace
// normalization also catch full-width punctuation and spacing variants.
export const FORBIDDEN_PHRASES = [
  '치료', '완치', '100% 개선', '100%개선', '특효', '즉효',
  '부작용 없', '부작용없', '효능 보장', '효과 보장', '의약품 대체',
] as const;

const normalize = (text: string): string => text.normalize('NFKC').replace(/[\s\u200b-\u200d\ufeff]+/gu, '');

export function hasForbiddenPhrase(text: string): boolean {
  const normalized = normalize(text);
  return FORBIDDEN_PHRASES.some((phrase) => normalized.includes(normalize(phrase)));
}
