import { describe, expect, it } from 'vitest';
import { parseState, serializeState } from './url-state.ts';

describe('공유 URL 상태', () => {
  it('기본 진입은 고민·피부 타입 미선택이다', () => {
    expect(parseState('')).toEqual({ concern: null, shop: 'all', skin: null, sort: 'rank', sensitive: false });
  });
  it('허용되지 않은 값과 민감 true 문자열을 기본값으로 되돌린다', () => {
    expect(parseState('?concern=nope&shop=oliveyoung&skin=bad&sort=cheap&sensitive=true')).toEqual(parseState(''));
  });
  it.each(['rank', 'unit', 'price'] as const)('%s 정렬과 모든 필터를 직렬화 후 복원한다', (sort) => {
    const state = { concern: 'moisture' as const, shop: 'daiso' as const, skin: 'dry' as const, sort, sensitive: true };
    expect(parseState(serializeState(state))).toEqual(state);
    expect(serializeState(state)).toBe(`?concern=moisture&shop=daiso&skin=dry&sort=${sort}&sensitive=1`);
  });
  it('미선택 피부와 꺼진 민감 상태는 URL에서 생략한다', () => {
    expect(serializeState(parseState('?concern=sun&tracking=ignored'))).toBe('?concern=sun&shop=all&sort=rank');
  });
});
