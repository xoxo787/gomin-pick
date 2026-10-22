import type { ConcernId, SkinType } from '../types.ts';

export type SortId = 'rank' | 'unit' | 'price';
export type ShopFilter = 'all' | 'daiso';
export interface ViewState {
  concern: ConcernId | null;
  shop: ShopFilter;
  skin: SkinType | null;
  sort: SortId;
  sensitive: boolean;
}

const concerns: ConcernId[] = ['moisture', 'soothing', 'trouble', 'brightening', 'wrinkle', 'pore', 'sun'];
const skins: SkinType[] = ['dry', 'oily', 'combination', 'sensitive', 'normal'];
const sorts: SortId[] = ['rank', 'unit', 'price'];

function member<T extends string>(value: string | null, values: readonly T[]): T | null {
  return values.find((item) => item === value) ?? null;
}

export function parseState(search: string): ViewState {
  const params = new URLSearchParams(search);
  return {
    concern: member(params.get('concern'), concerns),
    shop: params.get('shop') === 'daiso' ? 'daiso' : 'all',
    skin: member(params.get('skin'), skins),
    sort: member(params.get('sort'), sorts) ?? 'rank',
    sensitive: params.get('sensitive') === '1',
  };
}

export function serializeState(state: ViewState): string {
  const params = new URLSearchParams();
  if (state.concern) params.set('concern', state.concern);
  params.set('shop', state.shop);
  if (state.skin) params.set('skin', state.skin);
  params.set('sort', state.sort);
  if (state.sensitive) params.set('sensitive', '1');
  return `?${params.toString()}`;
}
