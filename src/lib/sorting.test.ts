import { describe, expect, it } from 'vitest';
import { sortProducts } from './sorting.ts';
import { product } from './test-helpers.ts';

describe('제품 정렬', () => {
  it('구매처 순위를 교차시키고 동순위에서는 다이소를 먼저 표시한다', () => {
    const input = [product({ id: 'o2', shop: 'oliveyoung', rank_in_group: 2 }), product({ id: 'd2', rank_in_group: 2 }), product({ id: 'o1', shop: 'oliveyoung' }), product({ id: 'd1' })];
    expect(sortProducts(input, 'rank').map((item) => item.id)).toEqual(['d1', 'o1', 'd2', 'o2']);
    expect(input[0].id).toBe('o2');
  });
  it('가격 오름차순, 미확인은 마지막으로 보낸다', () => {
    const input = [product({ id: 'unknown', price_krw: null }), product({ id: 'high', price_krw: 2000 }), product({ id: 'zero', price_krw: 0 })];
    expect(sortProducts(input, 'price').map((item) => item.id)).toEqual(['zero', 'high', 'unknown']);
  });
  it('다른 basis는 섞어 가격을 비교하지 않고 묶음 안에서만 정렬한다', () => {
    const input = [product({ id: 'g', volume_unit: 'g', price_krw: 100 }), product({ id: 'ml-high', price_krw: 4000 }), product({ id: 'unknown', volume_value: null }), product({ id: 'ea', volume_unit: 'ea', price_krw: 1 }), product({ id: 'ml-low', price_krw: 2000 })];
    expect(sortProducts(input, 'unit').map((item) => item.id)).toEqual(['ml-low', 'ml-high', 'g', 'ea', 'unknown']);
  });
});
