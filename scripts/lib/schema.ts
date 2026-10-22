import type { Concern, Ingredient, Product, RankBasis } from '../../src/types.ts';

export interface Issue {
  code: string;
  path: string;
  message: string;
}

type Validator = (value: unknown, path: string, issues: Issue[]) => void;
type Shape<T> = { [K in keyof T]-?: Validator };

export const CONCERN_IDS = ['moisture', 'soothing', 'trouble', 'brightening', 'wrinkle', 'pore', 'sun'] as const;
export const SHOP_IDS = ['daiso', 'oliveyoung'] as const;
const functionalCategories = ['whitening', 'wrinkle', 'uv', 'acne', 'other'];

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function addIssue(issues: Issue[], code: string, path: string, message: string): void {
  issues.push({ code, path, message });
}

export function dateEpoch(value: unknown): number | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/u.test(value) || value.startsWith('0000')) return null;
  const time = Date.parse(`${value}T00:00:00.000Z`);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value ? time : null;
}

export function httpsUrl(value: unknown): URL | null {
  if (typeof value !== 'string' || value !== value.trim() || !value.startsWith('https://')) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname !== '' && !url.username && !url.password ? url : null;
  } catch {
    return null;
  }
}

const string: Validator = (value, path, issues) => {
  if (typeof value !== 'string') addIssue(issues, 'SCHEMA_TYPE', path, '문자열이어야 합니다.');
  else if (value.trim() === '') addIssue(issues, 'EMPTY_STRING', path, '빈 문자열은 허용하지 않습니다.');
};

const boolean: Validator = (value, path, issues) => {
  if (typeof value !== 'boolean') addIssue(issues, 'SCHEMA_TYPE', path, 'boolean이어야 합니다.');
};

const number = (min: number, max = Infinity, integer = false, exclusiveMin = false): Validator => (value, path, issues) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    addIssue(issues, 'SCHEMA_TYPE', path, '유한한 숫자여야 합니다.');
  } else if ((exclusiveMin ? value <= min : value < min) || value > max || (integer && !Number.isInteger(value))) {
    addIssue(issues, 'SCHEMA_RANGE', path, '허용 범위 또는 정수 조건에 맞지 않습니다.');
  }
};

const oneOf = (values: readonly string[]): Validator => (value, path, issues) => {
  if (typeof value !== 'string' || !values.includes(value)) addIssue(issues, 'SCHEMA_ENUM', path, `허용 값: ${values.join(', ')}`);
};

const nullable = (validator: Validator): Validator => (value, path, issues) => {
  if (value !== null) validator(value, path, issues);
};

const array = (validator: Validator, min = 0): Validator => (value, path, issues) => {
  if (!Array.isArray(value)) {
    addIssue(issues, 'SCHEMA_TYPE', path, '배열이어야 합니다.');
    return;
  }
  if (value.length < min) addIssue(issues, 'ARRAY_MIN', path, `최소 ${min}개가 필요합니다.`);
  value.forEach((item, index) => validator(item, `${path}[${index}]`, issues));
};

const object = (shape: Record<string, Validator>): Validator => (value, path, issues) => {
  if (!isRecord(value)) {
    addIssue(issues, 'SCHEMA_TYPE', path, '객체여야 합니다.');
    return;
  }
  for (const [key, validate] of Object.entries(shape)) {
    if (!Object.hasOwn(value, key)) addIssue(issues, 'SCHEMA_REQUIRED', `${path}.${key}`, '필수 필드가 없습니다.');
    else validate(value[key], `${path}.${key}`, issues);
  }
  for (const key of Object.keys(value)) {
    if (!Object.hasOwn(shape, key)) addIssue(issues, 'SCHEMA_UNKNOWN_FIELD', `${path}.${key}`, '스키마에 없는 필드입니다.');
  }
};

const url: Validator = (value, path, issues) => {
  string(value, path, issues);
  if (typeof value === 'string' && !httpsUrl(value)) addIssue(issues, 'URL_HTTPS', path, '인증 정보 없는 유효한 https URL이어야 합니다.');
};

const date: Validator = (value, path, issues) => {
  if (dateEpoch(value) === null) addIssue(issues, 'DATE_FORMAT', path, '실제 달력 날짜 YYYY-MM-DD이어야 합니다.');
};

const evidence: Validator = (value, path, issues) => {
  string(value, path, issues);
  if (typeof value === 'string' && Array.from(value).length > 150) addIssue(issues, 'EVIDENCE_LENGTH', path, '근거는 150자 이하여야 합니다.');
};

const ingredientId: Validator = (value, path, issues) => {
  string(value, path, issues);
  if (typeof value === 'string' && !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u.test(value)) {
    addIssue(issues, 'ID_FORMAT', path, '영문 소문자 kebab-case ID이어야 합니다.');
  }
};

const concernShape = {
  id: oneOf(CONCERN_IDS), label: string, hint: string,
  evidence_ingredient_ids: array(string), functional_category: nullable(oneOf(functionalCategories)),
  order: number(1, 7, true),
} satisfies Shape<Concern>;

const ingredientShape = {
  id: ingredientId, name_ko: string, name_inci: nullable(string), aliases: array(string),
  concern_ids: array(oneOf(CONCERN_IDS)),
  functional: nullable(object({
    category: oneOf(functionalCategories), notice_name: string, limit: nullable(string), source_url: url,
  } satisfies Shape<NonNullable<Ingredient['functional']>>)),
  evidence: object({
    status: oneOf(['official', 'reference', 'unverified']), note: evidence, source_url: nullable(url),
  } satisfies Shape<Ingredient['evidence']>),
} satisfies Shape<Ingredient>;

const rankBasisShape = {
  kind: oneOf(['award', 'press', 'official']), title: string, award_category: nullable(string),
  award_rank: nullable(string), published_at: nullable(date), source_url: url,
} satisfies Shape<RankBasis>;

const productShape = {
  id: string, shop: oneOf(SHOP_IDS), concern_id: oneOf(CONCERN_IDS), rank_in_group: number(1, 5, true),
  brand: string, name: string, price_krw: nullable(number(0, Number.MAX_SAFE_INTEGER, true)),
  price_source: nullable(oneOf(['shop_official', 'brand_official', 'press'])),
  volume_value: nullable(number(0, Number.MAX_SAFE_INTEGER, false, true)), volume_unit: nullable(oneOf(['ml', 'g', 'ea'])),
  unit_price: nullable(object({ value: number(0, Number.MAX_SAFE_INTEGER, true), basis: oneOf(['10ml', '10g', '1ea']) } satisfies Shape<NonNullable<Product['unit_price']>>)),
  key_ingredient_ids: array(string),
  functional_cosmetic: nullable(object({ categories: array(oneOf(functionalCategories)), source_url: url } satisfies Shape<NonNullable<Product['functional_cosmetic']>>)),
  sensitive: object({ fragrance: nullable(boolean), ethanol: nullable(boolean), source_url: nullable(url) } satisfies Shape<Product['sensitive']>),
  skin_types: nullable(array(oneOf(['dry', 'oily', 'combination', 'sensitive', 'normal']))),
  rank_basis: array(object(rankBasisShape), 1), purchase_url: url, purchase_url_kind: oneOf(['product', 'search']),
  source_urls: array(url, 1), evidence, checked_at: date, price_note: string, unverified_fields: array(string),
} satisfies Shape<Product>;

export const PRODUCT_FIELDS = Object.keys(productShape) as (keyof Product)[];

export function validateRecords<T>(value: unknown, path: string, kind: 'concerns' | 'ingredients' | 'products', issues: Issue[]): { value: T; path: string }[] {
  const validator = object({ concerns: concernShape, ingredients: ingredientShape, products: productShape }[kind]);
  if (!Array.isArray(value)) {
    addIssue(issues, 'SCHEMA_TYPE', path, '최상위 값은 배열이어야 합니다.');
    return [];
  }
  return value.flatMap((item: unknown, index) => {
    const itemPath = `${path}[${index}]`;
    const before = issues.length;
    validator(item, itemPath, issues);
    return issues.length === before ? [{ value: item as T, path: itemPath }] : [];
  });
}
