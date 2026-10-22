import type { Concern, Ingredient, Product } from '../types.ts';

export function matchingIngredientIds(concern: Concern, product: Product): string[] {
  const productIds = new Set(product.key_ingredient_ids);
  return [...new Set(concern.evidence_ingredient_ids)].filter((id) => productIds.has(id));
}

export function matchExplanation(concern: Concern, product: Product, ingredients: Ingredient[]): string {
  if (product.key_ingredient_ids.length === 0) return '핵심 성분 확인 필요';
  const matched = matchingIngredientIds(concern, product);
  const names = matched.map((id) => ingredients.find((ingredient) => ingredient.id === id)?.name_ko ?? id);
  const total = new Set(concern.evidence_ingredient_ids).size;
  return `적합 근거: 근거 성분 ${total}개 중 ${matched.length}개 포함${names.length ? `(${names.join(', ')})` : ''}`;
}
