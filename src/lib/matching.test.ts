import { describe, expect, it } from 'vitest';
import { matchExplanation, matchingIngredientIds } from './matching.ts';
import { ingredients, moisture, product } from './test-helpers.ts';

describe('고민 근거 성분 겹침', () => {
  it('근거 목록과 겹친 성분만 분모와 이름을 함께 보여 준다', () => {
    expect(matchExplanation(moisture, product({ key_ingredient_ids: ['ceramide', 'panthenol', 'retinol'] }), ingredients))
      .toBe('적합 근거: 근거 성분 4개 중 2개 포함(세라마이드, 판테놀)');
  });
  it('비어 있는 핵심 성분을 불일치로 단정하지 않는다', () => {
    expect(matchExplanation(moisture, product({ key_ingredient_ids: [] }), ingredients)).toBe('핵심 성분 확인 필요');
  });
  it('중복 성분을 한 번만 세고 겹침 0개도 설명한다', () => {
    expect(matchingIngredientIds(moisture, product({ key_ingredient_ids: ['panthenol', 'panthenol'] }))).toEqual(['panthenol']);
    expect(matchExplanation(moisture, product({ key_ingredient_ids: ['retinol'] }), ingredients)).toBe('적합 근거: 근거 성분 4개 중 0개 포함');
  });
});
