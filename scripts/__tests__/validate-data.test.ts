import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import type { Concern, Ingredient, Product } from '../../src/types.ts';
import { formatReport, parseArgs } from '../lib/cli.ts';
import { FORBIDDEN_PHRASES, hasForbiddenPhrase } from '../lib/forbidden.ts';
import { dateEpoch, httpsUrl } from '../lib/schema.ts';
import { calculateUnitPrice, validateData } from '../lib/validate.ts';
import type { DatasetInput, ValidationResult } from '../lib/validate.ts';

const fixtures = fileURLToPath(new URL('./fixtures/', import.meta.url));
const projectRoot = fileURLToPath(new URL('../../', import.meta.url));
const now = '2026-10-22';
type Dataset = { concerns: Concern[]; ingredients: Ingredient[]; products: Product[] };
interface FailureFixture {
  name: string;
  code: string;
  edits: { path: (string | number)[]; value?: unknown; remove?: boolean }[];
  copies?: number;
}
const readJson = (file: string): unknown => JSON.parse(readFileSync(file, 'utf8')) as unknown;
const valid: Dataset = {
  concerns: readJson(resolve(fixtures, 'valid/concerns.json')) as Concern[],
  ingredients: readJson(resolve(fixtures, 'valid/ingredients.json')) as Ingredient[],
  products: readJson(resolve(fixtures, 'valid/products.json')) as Product[],
};
const failures = readJson(resolve(fixtures, 'invalid-cases.json')) as FailureFixture[];

function materialize(testCase: FailureFixture): DatasetInput {
  const data = structuredClone(valid) as unknown as Record<string, unknown>;
  if (testCase.copies) {
    data.products = Array.from({ length: testCase.copies }, (_, index) => ({
      ...structuredClone(valid.products[0]), id: `daiso-copy-${index}`, rank_in_group: (index % 5) + 1,
    }));
  }
  for (const edit of testCase.edits) {
    let target = data;
    for (const segment of edit.path.slice(0, -1)) target = target[segment] as Record<string, unknown>;
    const key = edit.path.at(-1)!;
    if (edit.remove) delete target[key];
    else target[key] = structuredClone(edit.value);
  }
  return data as unknown as DatasetInput;
}

function saveDataset(data: DatasetInput): string {
  // Preserve each unique temporary directory for audit; never remove fixtures.
  const dir = mkdtempSync(resolve(tmpdir(), 'gomin-pick-validation-'));
  for (const [key, value] of Object.entries(data)) writeFileSync(resolve(dir, `${key}.json`), `${JSON.stringify(value)}\n`, 'utf8');
  return dir;
}

function cli(args: string[], dataDir?: string) {
  return spawnSync(process.execPath, ['scripts/validate-data.ts', ...args], {
    cwd: projectRoot, encoding: 'utf8', timeout: 10_000,
    env: { ...process.env, GOMIN_DATA_DIR: dataDir ?? resolve(fixtures, 'valid') },
  });
}

describe('runtime contract and CLI error fixtures', () => {
  it('accepts the valid fixture and retains sparse-group warnings with exit 0', () => {
    const result = validateData(valid, now);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toHaveLength(12);
    expect(result.summary.total).toBe(6);
    const process = cli(['--data-dir', resolve(fixtures, 'valid'), '--now', now, '--json']);
    expect(process.status, process.stderr).toBe(0);
    expect(JSON.parse(process.stdout)).toEqual(result);
  });

  it.each(failures)('$name returns $code and exits 1', (testCase) => {
    const data = materialize(testCase);
    const expected = validateData(data, now);
    expect(expected.errors.map((issue) => issue.code)).toContain(testCase.code);
    const process = cli(['--data-dir', saveDataset(data), '--now', now, '--json']);
    expect(process.status, process.stderr).toBe(1);
    expect((JSON.parse(process.stdout) as ValidationResult).errors).toEqual(expected.errors);
  });

  it('supports a directly executable invalid-schema directory', () => {
    const result = cli(['--data-dir', resolve(fixtures, 'invalid-schema'), '--now', now, '--json']);
    expect(result.status).toBe(1);
    expect((JSON.parse(result.stdout) as ValidationResult).errors.some((issue) => issue.code === 'SCHEMA_REQUIRED')).toBe(true);
  });
});

describe('semantic boundaries', () => {
  it('accepts exactly 70 records across 14 groups with all five distinct ranks', () => {
    const data = structuredClone(valid);
    data.products = data.concerns.flatMap((concern) => (['daiso', 'oliveyoung'] as const).flatMap((shop) =>
      Array.from({ length: 5 }, (_, index) => ({
        ...structuredClone(valid.products[shop === 'daiso' ? 0 : 3]),
        id: `${shop}-${concern.id}-${index + 1}`, concern_id: concern.id, rank_in_group: index + 1,
      })),
    ));
    const result = validateData(data, now);
    expect(result.summary.total).toBe(70);
    expect(result.summary.groups.every((group) => group.count === 5)).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it.each([
    ['2026-09-22', 0], ['2026-09-21', 1],
  ])('checked_at=%s has %i stale record(s)', (checked_at, count) => {
    const data = structuredClone(valid);
    data.products[0].checked_at = checked_at;
    const result = validateData(data, now);
    expect(result.errors).toEqual([]);
    expect(result.stale).toHaveLength(count);
    if (count) expect(result.stale[0]).toEqual({ id: data.products[0].id, checked_at, age_days: 31 });
    const process = cli(['--now', now, '--json'], saveDataset(data));
    expect(process.status).toBe(0);
    expect((JSON.parse(process.stdout) as ValidationResult).stale).toEqual(result.stale);
  });

  it.each([
    [100, 80, 'ml', 13, '10ml'], [100, 81, 'ml', 12, '10ml'],
    [100, 80, 'g', 13, '10g'], [100, 81, 'g', 12, '10g'],
    [5, 2, 'ea', 3, '1ea'], [4, 3, 'ea', 1, '1ea'],
  ] as const)('rounds %i / %i %s to %i per %s', (price, volume, unit, value, basis) => {
    expect(calculateUnitPrice(price, volume, unit)).toEqual({ value, basis });
    const data = structuredClone(valid);
    Object.assign(data.products[3], { price_krw: price, volume_value: volume, volume_unit: unit, unit_price: { value, basis } });
    expect(validateData(data, now).errors).toEqual([]);
    data.products[3].unit_price!.value = value + 1;
    expect(validateData(data, now).errors.some((issue) => issue.code === 'UNIT_PRICE')).toBe(true);
  });

  it('accepts unknown price/volume when marked, without converting null to zero', () => {
    const data = structuredClone(valid);
    Object.assign(data.products[0], { price_krw: null, price_source: null, volume_value: null, volume_unit: null, unit_price: null, unverified_fields: ['price_krw', 'volume_value'] });
    const result = validateData(data, now);
    expect(result.errors).toEqual([]);
    expect(result.summary.null_fields.find((row) => row.field === 'price_krw')).toEqual({ field: 'price_krw', count: 1, ratio: 1 / 6 });
    expect(calculateUnitPrice(null, 50, 'ml')).toBeNull();
    expect(calculateUnitPrice(1000, null, 'ml')).toBeNull();
    expect(calculateUnitPrice(1000, 50, null)).toBeNull();
    expect(calculateUnitPrice(1000, 0, 'ml')).toBeNull();
  });

  it('accepts supported nested values and unverified evidence with null source', () => {
    const data = structuredClone(valid);
    Object.assign(data.products[0], {
      functional_cosmetic: { categories: ['whitening', 'wrinkle'], source_url: 'https://example.org/functional' },
      sensitive: { fragrance: false, ethanol: true, source_url: 'https://example.org/full-ingredients' },
      skin_types: ['dry', 'sensitive'],
    });
    Object.assign(data.ingredients[0].evidence, { status: 'unverified', source_url: null });
    expect(validateData(data, now).errors).toEqual([]);
  });

  it('counts Unicode characters without counting surrogate pairs twice', () => {
    const data = structuredClone(valid);
    data.products[0].evidence = '🌱'.repeat(150);
    expect(validateData(data, now).errors).toEqual([]);
    data.products[0].evidence += '🌱';
    expect(validateData(data, now).errors.some((issue) => issue.code === 'EVIDENCE_LENGTH')).toBe(true);
  });

  it('warns about unusual Daiso prices without changing the success status', () => {
    const data = structuredClone(valid);
    data.products[0].price_krw = 4000;
    data.products[0].unit_price = { value: 800, basis: '10ml' };
    const result = validateData(data, now);
    expect(result.errors).toEqual([]);
    expect(result.warnings.some((issue) => issue.code === 'DAISO_PRICE')).toBe(true);
    expect(cli(['--now', now, '--json'], saveDataset(data)).status).toBe(0);
  });

  it('reports all 14 empty groups and avoids NaN ratios for empty datasets', () => {
    const result = validateData({ concerns: [], ingredients: [], products: [] }, now);
    expect(result.errors).toEqual([]);
    expect(result.warnings.filter((issue) => issue.code === 'GROUP_SPARSE')).toHaveLength(14);
    expect(result.summary.unverified).toEqual({ count: 0, ratio: 0 });
    expect(result.summary.null_fields.every((row) => row.ratio === 0)).toBe(true);
  });

  it.each(FORBIDDEN_PHRASES)('detects restricted phrase %s at every nested string level', (phrase) => {
    expect(hasForbiddenPhrase(phrase)).toBe(true);
    const data = structuredClone(valid);
    data.products[0].rank_basis[0].title = phrase;
    expect(validateData(data, now).errors.some((issue) => issue.code === 'FORBIDDEN_PHRASE' && issue.path.endsWith('.title'))).toBe(true);
  });

  it('also scans unknown fields before rejecting the schema', () => {
    const data = structuredClone(valid) as unknown as DatasetInput & { products: Record<string, unknown>[] };
    data.products[0].unexpected = { text: FORBIDDEN_PHRASES[0] };
    const codes = validateData(data, now).errors.map((issue) => issue.code);
    expect(codes).toContain('FORBIDDEN_PHRASE');
    expect(codes).toContain('SCHEMA_UNKNOWN_FIELD');
  });

  it('normalizes full-width characters and embedded zero-width spaces', () => {
    expect(hasForbiddenPhrase(FORBIDDEN_PHRASES[2].replace('100%', '１００％'))).toBe(true);
    expect(hasForbiddenPhrase([...FORBIDDEN_PHRASES[0]].join('\u200b'))).toBe(true);
    expect(hasForbiddenPhrase('피부 고민별 제품 정보를 비교합니다.')).toBe(false);
  });
});

describe('dates, URLs, and CLI reporting', () => {
  it.each(['2026-02-29', '2026-04-31', '2026-1-01', '0000-01-01', '2026-10-22T00:00:00Z', '2026-10-22 '])('rejects invalid date %s', (date) => {
    expect(dateEpoch(date)).toBeNull();
  });
  it('accepts leap dates and checks an invalid injected clock', () => {
    expect(dateEpoch('2024-02-29')).not.toBeNull();
    expect(validateData(valid, 'bad-date').errors.some((issue) => issue.code === 'NOW_DATE')).toBe(true);
  });
  it.each(['http://example.org', 'https://', 'https://user:password@example.org', ' https://example.org', '//example.org'])('rejects invalid https URL %s', (url) => {
    expect(httpsUrl(url)).toBeNull();
  });
  it('uses data-dir before the environment default and accepts machine output', () => {
    expect(parseArgs(['--data-dir', 'chosen', '--now', now, '--json'], 'env', now)).toEqual({ dataDir: 'chosen', now, json: true, help: false });
    expect(parseArgs([], 'env', now).dataDir).toBe('env');
    const result = cli(['--data-dir', resolve(fixtures, 'valid'), '--now', now, '--json'], 'missing-directory');
    expect(result.status).toBe(0);
    expect((JSON.parse(result.stdout) as ValidationResult).summary.total).toBe(6);
  });
  it.each([['--now', '2026-02-30'], ['--data-dir'], ['--bogus'], ['--json', '--json']])('rejects invalid options %j', (...args) => {
    const result = cli([...args, ...(args.includes('--json') ? [] : ['--json'])]);
    expect(result.status).toBe(1);
    expect((JSON.parse(result.stdout) as ValidationResult).errors[0].code).toBe('CLI_OPTIONS');
  });
  it('returns structured file-read and malformed-JSON errors', () => {
    const missing = mkdtempSync(resolve(tmpdir(), 'gomin-pick-missing-'));
    const unreadable = cli(['--data-dir', missing, '--now', now, '--json']);
    expect(unreadable.status).toBe(1);
    expect((JSON.parse(unreadable.stdout) as ValidationResult).errors.filter((issue) => issue.code === 'FILE_READ')).toHaveLength(3);
    const invalid = saveDataset(valid);
    writeFileSync(resolve(invalid, 'products.json'), '{');
    const malformed = cli(['--data-dir', invalid, '--now', now, '--json']);
    expect(malformed.status).toBe(1);
    expect((JSON.parse(malformed.stdout) as ValidationResult).errors.some((issue) => issue.code === 'JSON_PARSE')).toBe(true);
  });
  it('renders the same distributions, null ratios, and stale list in text output', () => {
    const data = structuredClone(valid);
    data.products[0].checked_at = '2026-09-21';
    const result = validateData(data, now);
    const text = formatReport(result);
    expect(text).toContain('전체 제품: 6개');
    expect(text).toContain('| moisture / daiso | 3 |');
    expect(text).toContain('| sensitive.fragrance | 6 | 100.0% |');
    expect(text).toContain('daiso-fixture-1: 2026-09-21 (31일)');
    const process = cli(['--now', now], saveDataset(data));
    expect(process.status).toBe(0);
    expect(process.stdout.trim()).toBe(text);
  });
});
