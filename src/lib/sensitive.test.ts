import { describe, expect, it } from 'vitest';
import { filterAndSortSensitive, sensitiveLabel, sensitiveStatus } from './sensitive.ts';
import { product } from './test-helpers.ts';

describe('민감 정보 필터', () => {
  it.each([
    [false, false, 'absent'], [false, null, 'unknown'], [null, false, 'unknown'], [null, null, 'unknown'],
    [true, true, 'included'], [true, false, 'included'], [false, true, 'included'], [true, null, 'included'], [null, true, 'included'],
  ] as const)('향료 %s / 에탄올 %s는 %s', (fragrance, ethanol, status) => {
    expect(sensitiveStatus(product({ sensitive: { fragrance, ethanol, source_url: null } }))).toBe(status);
  });
  it('확인된 미포함을 먼저, 미확인을 나중에 표시하고 포함 제품을 숨긴다', () => {
    const unknown = product({ id: 'unknown', price_krw: 100, sensitive: { fragrance: null, ethanol: false, source_url: null } });
    const included = product({ id: 'included', sensitive: { fragrance: true, ethanol: null, source_url: null } });
    const absent = product({ id: 'absent', price_krw: 5000 });
    expect(filterAndSortSensitive([unknown, included, absent], true, 'price').map((item) => item.id)).toEqual(['absent', 'unknown']);
    expect(filterAndSortSensitive([unknown, included, absent], false, 'price')).toHaveLength(3);
  });
  it('null을 미포함으로 표시하지 않는다', () => {
    expect([true, false, null].map(sensitiveLabel)).toEqual(['포함', '미포함', '정보 없음']);
  });
});
