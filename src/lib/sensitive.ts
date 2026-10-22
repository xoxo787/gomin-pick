import type { Product } from '../types.ts';
import type { SortId } from './url-state.ts';
import { sortProducts } from './sorting.ts';

export type SensitiveStatus = 'included' | 'absent' | 'unknown';

export function sensitiveStatus(product: Product): SensitiveStatus {
  const { fragrance, ethanol } = product.sensitive;
  if (fragrance === true || ethanol === true) return 'included';
  return fragrance === false && ethanol === false ? 'absent' : 'unknown';
}

export function sensitiveLabel(value: boolean | null): string {
  return value === true ? '포함' : value === false ? '미포함' : '정보 없음';
}

export function filterAndSortSensitive(products: readonly Product[], enabled: boolean, sort: SortId): Product[] {
  const sorted = sortProducts(products, sort);
  if (!enabled) return sorted;
  return [
    ...sorted.filter((product) => sensitiveStatus(product) === 'absent'),
    ...sorted.filter((product) => sensitiveStatus(product) === 'unknown'),
  ];
}
