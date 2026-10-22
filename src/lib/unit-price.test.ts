import { describe, expect, it } from 'vitest';
import { calculateUnitPrice, formatUnitPrice } from './unit-price.ts';

describe('단위가격', () => {
  it('ml은 10ml, g은 10g, 수량은 1ea 기준으로 반올림한다', () => {
    expect(calculateUnitPrice(3000, 50, 'ml')).toEqual({ value: 600, basis: '10ml' });
    expect(calculateUnitPrice(5000, 75, 'g')).toEqual({ value: 667, basis: '10g' });
    expect(calculateUnitPrice(1000, 3, 'ea')).toEqual({ value: 333, basis: '1ea' });
  });
  it.each([
    [null, 50, 'ml'], [3000, null, 'ml'], [3000, 50, null], [3000, 0, 'g'],
    [3000, -1, 'g'], [NaN, 50, 'ml'], [3000, Infinity, 'ml'], [-1, 50, 'ml'],
  ] as const)('계산 불가 값 %s / %s / %s를 0으로 바꾸지 않는다', (price, volume, unit) => {
    expect(calculateUnitPrice(price, volume, unit)).toBeNull();
  });
  it('확인된 가격 0과 미확인을 구분하고 basis를 표시한다', () => {
    expect(calculateUnitPrice(0, 10, 'ml')).toEqual({ value: 0, basis: '10ml' });
    expect(formatUnitPrice(null)).toBe('단위가격 확인 필요');
    expect(formatUnitPrice({ value: 5600, basis: '10ml' })).toBe('10ml당 5,600원');
  });
});
