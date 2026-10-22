import { describe, expect, it } from 'vitest';
import { cheaperAlternatives } from './alternatives.ts';
import { moisture, product } from './test-helpers.ts';

describe('같은 고민 안의 저렴한 성분 대안', () => {
  const current = product({ id: 'current', price_krw: 10000, key_ingredient_ids: ['ceramide', 'retinol'] });
  it('근거 성분을 공유하며 같은 basis에서 더 저렴한 제품만 반환한다', () => {
    const eligible = product({ id: 'eligible', price_krw: 3000, key_ingredient_ids: ['ceramide'] });
    const excluded = [
      current, product({ id: 'same-price', price_krw: 10000 }), product({ id: 'more', price_krw: 20000 }),
      product({ id: 'other-concern', concern_id: 'soothing' }), product({ id: 'other-basis', volume_unit: 'g' }),
      product({ id: 'missing', price_krw: null }), product({ id: 'non-evidence', key_ingredient_ids: ['retinol'] }),
    ];
    expect(cheaperAlternatives(current, [...excluded, eligible], moisture)).toEqual([
      { product: eligible, sharedIngredientIds: ['ceramide'], savingPerUnit: 1400 },
    ]);
  });
  it('현재 제품 단위가격이나 확인된 핵심 성분이 없으면 추천을 만들지 않는다', () => {
    expect(cheaperAlternatives(product({ price_krw: null }), [current], moisture)).toEqual([]);
    expect(cheaperAlternatives(product({ key_ingredient_ids: [] }), [current], moisture)).toEqual([]);
  });
  it('포장 가격이 높아도 같은 단위의 가격이 더 낮으면 대안이 된다', () => {
    const large = product({ id: 'large', price_krw: 20000, volume_value: 200 });
    expect(cheaperAlternatives(current, [large], moisture)[0]?.savingPerUnit).toBe(1000);
  });
});
