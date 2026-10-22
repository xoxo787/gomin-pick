import type { Product, UnitBasis, VolumeUnit } from '../types.ts';

const bases: Record<VolumeUnit, UnitBasis> = { ml: '10ml', g: '10g', ea: '1ea' };

export function calculateUnitPrice(
  price: number | null,
  volume: number | null,
  unit: VolumeUnit | null,
): Product['unit_price'] {
  if (price === null || volume === null || unit === null
    || !Number.isFinite(price) || !Number.isFinite(volume) || price < 0 || volume <= 0) return null;
  return { value: Math.round(price * (unit === 'ea' ? 1 : 10) / volume), basis: bases[unit] };
}

export function productUnitPrice(product: Product): Product['unit_price'] {
  return calculateUnitPrice(product.price_krw, product.volume_value, product.volume_unit);
}

export function formatUnitPrice(price: Product['unit_price']): string {
  return price === null ? '단위가격 확인 필요' : `${price.basis}당 ${price.value.toLocaleString('ko-KR')}원`;
}
