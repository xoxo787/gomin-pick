import type { Concern, Product } from '../types.ts';
import { matchingIngredientIds } from './matching.ts';
import { sortProducts } from './sorting.ts';
import { productUnitPrice } from './unit-price.ts';

export const ALTERNATIVE_NOTE = '성분이 겹친다고 효과가 같다는 뜻은 아닙니다';

export interface Alternative {
  product: Product;
  sharedIngredientIds: string[];
  savingPerUnit: number;
}

export function cheaperAlternatives(product: Product, candidates: readonly Product[], concern: Concern): Alternative[] {
  const unit = productUnitPrice(product);
  if (!unit || product.concern_id !== concern.id) return [];
  const evidenceIds = new Set(matchingIngredientIds(concern, product));
  return sortProducts(candidates, 'unit').flatMap((candidate) => {
    const otherUnit = productUnitPrice(candidate);
    if (candidate.id === product.id || candidate.concern_id !== concern.id
      || !otherUnit || otherUnit.basis !== unit.basis || otherUnit.value >= unit.value) return [];
    const sharedIngredientIds = [...new Set(candidate.key_ingredient_ids)].filter((id) => evidenceIds.has(id));
    return sharedIngredientIds.length ? [{
      product: candidate, sharedIngredientIds, savingPerUnit: unit.value - otherUnit.value,
    }] : [];
  });
}
