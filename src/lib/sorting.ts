import type { Product, UnitBasis } from '../types.ts';
import type { SortId } from './url-state.ts';
import { productUnitPrice } from './unit-price.ts';

const basisOrder: Record<UnitBasis, number> = { '10ml': 0, '10g': 1, '1ea': 2 };

function nullableNumber(a: number | null, b: number | null): number {
  if (a === null) return b === null ? 0 : 1;
  if (b === null) return -1;
  return a - b;
}

function byRank(a: Product, b: Product): number {
  return a.rank_in_group - b.rank_in_group
    || (a.shop === b.shop ? 0 : a.shop === 'daiso' ? -1 : 1)
    || a.id.localeCompare(b.id);
}

export function sortProducts(products: readonly Product[], sort: SortId): Product[] {
  return [...products].sort((a, b) => {
    if (sort === 'price') return nullableNumber(a.price_krw, b.price_krw) || byRank(a, b);
    if (sort === 'unit') {
      const left = productUnitPrice(a);
      const right = productUnitPrice(b);
      if (left === null || right === null) {
        return nullableNumber(left?.value ?? null, right?.value ?? null) || byRank(a, b);
      }
      return basisOrder[left.basis] - basisOrder[right.basis] || left.value - right.value || byRank(a, b);
    }
    // Each shop's curation order is local to that shop: interleave equal ranks, Daiso first.
    return byRank(a, b);
  });
}
