import type { Concern, Ingredient, Product } from '../../src/types.ts';
import { hasForbiddenPhrase } from './forbidden.ts';
import { addIssue, CONCERN_IDS, dateEpoch, httpsUrl, isRecord, PRODUCT_FIELDS, SHOP_IDS, validateRecords } from './schema.ts';
import type { Issue } from './schema.ts';

export interface DatasetInput { concerns: unknown; ingredients: unknown; products: unknown }
export interface Summary {
  total: number;
  concerns: { id: string; label: string; count: number }[];
  shops: { shop: string; count: number }[];
  groups: { concern_id: string; shop: string; count: number }[];
  null_fields: { field: string; count: number; ratio: number }[];
  unverified: { count: number; ratio: number };
}
export interface ValidationResult {
  now: string;
  summary: Summary;
  errors: Issue[];
  warnings: Issue[];
  stale: { id: string; checked_at: string; age_days: number }[];
}

export function calculateUnitPrice(price: Product['price_krw'], volume: Product['volume_value'], unit: Product['volume_unit']): Product['unit_price'] {
  if (price === null || volume === null || unit === null || volume <= 0) return null;
  return { value: Math.round(price * (unit === 'ea' ? 1 : 10) / volume), basis: { ml: '10ml', g: '10g', ea: '1ea' }[unit] as NonNullable<Product['unit_price']>['basis'] };
}

function inspectStrings(value: unknown, path: string, issues: Issue[]): void {
  if (typeof value === 'string') {
    if (hasForbiddenPhrase(value)) addIssue(issues, 'FORBIDDEN_PHRASE', path, '허용하지 않는 효능 표현이 있습니다.');
    // URL fields are validated by the schema; catch URL literals in free text too.
    const embeddedUrls = value.match(/(?:[a-z][a-z0-9+.-]*:\/\/|www\.)[^\s<>"']+/giu) ?? [];
    if (embeddedUrls.some((candidate) => !httpsUrl(candidate))) addIssue(issues, 'URL_HTTPS', path, '문자열 안의 URL도 https이어야 합니다.');
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => inspectStrings(item, `${path}[${index}]`, issues));
  } else if (isRecord(value)) {
    for (const [key, item] of Object.entries(value)) inspectStrings(item, `${path}.${key}`, issues);
  }
}

function uniqueIds(rows: { value: { id: string }; path: string }[], issues: Issue[]): void {
  const ids = new Set<string>();
  for (const { value, path } of rows) {
    if (ids.has(value.id)) addIssue(issues, 'DUPLICATE_ID', `${path}.id`, '동일 파일에서 ID가 중복됩니다.');
    ids.add(value.id);
  }
}

function reference(id: string, known: Set<string>, path: string, issues: Issue[]): void {
  if (!known.has(id)) addIssue(issues, 'REFERENCE', path, '참조 대상 ID가 없습니다.');
}

function buildSummary(input: DatasetInput): Summary {
  const rawProducts: unknown[] = Array.isArray(input.products) ? input.products : [];
  const products = rawProducts.filter(isRecord);
  const concerns = Array.isArray(input.concerns) ? input.concerns.filter(isRecord) : [];
  const total = rawProducts.length;
  const ratio = (count: number): number => total === 0 ? 0 : count / total;
  const fields = [...PRODUCT_FIELDS, 'sensitive.fragrance', 'sensitive.ethanol', 'sensitive.source_url'];
  const unverifiedCount = products.filter((product) => Array.isArray(product.unverified_fields) && product.unverified_fields.length > 0).length;
  return {
    total,
    concerns: CONCERN_IDS.map((id) => ({ id, label: String(concerns.find((concern) => concern.id === id)?.label ?? id), count: products.filter((product) => product.concern_id === id).length })),
    shops: SHOP_IDS.map((shop) => ({ shop, count: products.filter((product) => product.shop === shop).length })),
    groups: CONCERN_IDS.flatMap((concern_id) => SHOP_IDS.map((shop) => ({ concern_id, shop, count: products.filter((product) => product.concern_id === concern_id && product.shop === shop).length }))),
    null_fields: fields.map((field) => {
      const count = products.filter((product) => {
        const [key, nested] = field.split('.');
        return nested ? isRecord(product[key]) && product[key][nested] === null : product[key] === null;
      }).length;
      return { field, count, ratio: ratio(count) };
    }),
    unverified: { count: unverifiedCount, ratio: ratio(unverifiedCount) },
  };
}

export function validateData(input: DatasetInput, now: string): ValidationResult {
  const result: ValidationResult = { now, summary: buildSummary(input), errors: [], warnings: [], stale: [] };
  const { errors, warnings } = result;
  const today = dateEpoch(now);
  if (today === null) addIssue(errors, 'NOW_DATE', '--now', '실제 달력 날짜 YYYY-MM-DD이어야 합니다.');
  for (const [key, value] of Object.entries(input)) inspectStrings(value, `${key}.json`, errors);
  const concerns = validateRecords<Concern>(input.concerns, 'concerns.json', 'concerns', errors);
  const ingredients = validateRecords<Ingredient>(input.ingredients, 'ingredients.json', 'ingredients', errors);
  const products = validateRecords<Product>(input.products, 'products.json', 'products', errors);
  uniqueIds(concerns, errors);
  uniqueIds(ingredients, errors);
  uniqueIds(products, errors);
  const concernIds = new Set(concerns.map(({ value }) => value.id));
  const ingredientIds = new Set(ingredients.map(({ value }) => value.id));
  for (const { value: concern, path } of concerns) {
    concern.evidence_ingredient_ids.forEach((id, index) => reference(id, ingredientIds, `${path}.evidence_ingredient_ids[${index}]`, errors));
  }
  for (const { value: ingredient, path } of ingredients) {
    ingredient.concern_ids.forEach((id, index) => reference(id, concernIds, `${path}.concern_ids[${index}]`, errors));
    if (ingredient.evidence.status !== 'unverified' && ingredient.evidence.source_url === null) addIssue(errors, 'EVIDENCE_SOURCE', `${path}.evidence.source_url`, '확인된 근거에는 출처 URL이 필요합니다.');
  }
  if (result.summary.total > 70) addIssue(errors, 'TOTAL_LIMIT', 'products.json', '제품은 전체 70개 이하여야 합니다.');
  const ranks = new Map<string, Set<number>>();
  for (const { value: product, path } of products) {
    if (!new RegExp(`^${product.shop}-[a-z0-9]+(?:-[a-z0-9]+)*$`, 'u').test(product.id)) addIssue(errors, 'ID_FORMAT', `${path}.id`, '구매처 접두사와 영문 소문자 slug가 필요합니다.');
    reference(product.concern_id, concernIds, `${path}.concern_id`, errors);
    product.key_ingredient_ids.forEach((id, index) => reference(id, ingredientIds, `${path}.key_ingredient_ids[${index}]`, errors));
    const group = `${product.concern_id}/${product.shop}`;
    const groupRanks = ranks.get(group) ?? new Set<number>();
    if (groupRanks.has(product.rank_in_group)) addIssue(errors, 'DUPLICATE_RANK', `${path}.rank_in_group`, `${group} 안에서 순서가 중복됩니다.`);
    groupRanks.add(product.rank_in_group);
    ranks.set(group, groupRanks);
    const expected = calculateUnitPrice(product.price_krw, product.volume_value, product.volume_unit);
    if (expected === null ? product.unit_price !== null : product.unit_price?.value !== expected.value || product.unit_price?.basis !== expected.basis) {
      addIssue(errors, 'UNIT_PRICE', `${path}.unit_price`, `단위가격 공식 불일치: 예상 ${JSON.stringify(expected)}`);
    }
    for (const field of ['price_krw', 'volume_value'] as const) {
      if (product[field] === null && !product.unverified_fields.includes(field)) addIssue(errors, 'UNVERIFIED_REQUIRED', `${path}.unverified_fields`, `${field} 미확인 상태를 표시해야 합니다.`);
    }
    product.unverified_fields.forEach((field, index) => {
      if (!(PRODUCT_FIELDS as string[]).includes(field)) addIssue(errors, 'UNVERIFIED_FIELD', `${path}.unverified_fields[${index}]`, 'Product에 없는 필드명입니다.');
    });
    if (product.price_krw === null && product.price_source !== null) addIssue(errors, 'PRICE_SOURCE', `${path}.price_source`, '가격 미확인 시 가격 출처 종류도 null이어야 합니다.');
    const expectedHost = product.shop === 'daiso' ? 'www.daisomall.co.kr' : 'www.oliveyoung.co.kr';
    if (httpsUrl(product.purchase_url)?.host !== expectedHost) addIssue(errors, 'PURCHASE_HOST', `${path}.purchase_url`, `구매처 호스트는 ${expectedHost}이어야 합니다.`);
    const checked = dateEpoch(product.checked_at);
    if (today !== null && checked !== null) {
      const age = (today - checked) / 86_400_000;
      if (age < 0) addIssue(errors, 'FUTURE_DATE', `${path}.checked_at`, '확인일은 기준일 이후일 수 없습니다.');
      else if (age > 30) {
        result.stale.push({ id: product.id, checked_at: product.checked_at, age_days: age });
        addIssue(warnings, 'STALE', `${path}.checked_at`, `${product.id}: 확인 후 ${age}일이 지났습니다.`);
      }
    }
    if (product.shop === 'daiso' && product.price_krw !== null && ![1000, 2000, 3000, 5000].includes(product.price_krw)) {
      addIssue(warnings, 'DAISO_PRICE', `${path}.price_krw`, '다이소 가격이 1000/2000/3000/5000원 범위 목록과 다릅니다.');
    }
  }
  for (const group of result.summary.groups) {
    const path = `products.json:${group.concern_id}/${group.shop}`;
    if (group.count > 5) addIssue(errors, 'GROUP_LIMIT', path, '그룹당 제품은 5개 이하여야 합니다.');
    if (group.count < 3) addIssue(warnings, 'GROUP_SPARSE', path, `그룹당 3개 미만입니다(${group.count}개).`);
  }
  return result;
}
