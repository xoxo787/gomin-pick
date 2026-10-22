import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import type { Concern, Product } from '../src/types.ts';

const dataDir = resolve(process.env.GOMIN_DATA_DIR ?? 'data');
const products = JSON.parse(readFileSync(resolve(dataDir, 'products.json'), 'utf8')) as Product[];
const concerns = (JSON.parse(readFileSync(resolve(dataDir, 'concerns.json'), 'utf8')) as Concern[]).sort((a, b) => a.order - b.order);
const selected = concerns.find((concern) => products.some((product) => product.concern_id === concern.id))!;
const selectedProducts = products.filter((product) => product.concern_id === selected.id);
const observations = new WeakMap<Page, { errors: string[]; external: string[] }>();

test.beforeEach(async ({ page, context, baseURL }) => {
  const evidence = { errors: [] as string[], external: [] as string[] };
  observations.set(page, evidence);
  page.on('pageerror', (error) => evidence.errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') evidence.errors.push(message.text()); });
  // An accidental external resource is blocked before connection, including purchase domains.
  await context.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== new URL(baseURL!).origin) {
      evidence.external.push(url.href);
      return route.abort('blockedbyclient');
    }
    return route.continue();
  });
});

test.afterEach(async ({ page, baseURL }) => {
  expect(observations.get(page)?.errors, '콘솔 오류 및 pageerror').toEqual([]);
  expect(observations.get(page)?.external, '외부 도메인 요청').toEqual([]);
  if (!page.isClosed() && page.url().startsWith(baseURL!)) {
    const viewport = page.viewportSize()!;
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
  }
});

async function goToResults(page: Page, query = ''): Promise<void> {
  await page.goto(`?concern=${selected.id}&shop=all&sort=rank${query}`);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(selected.label);
}

test('질문에서 고민을 선택하고 피부 타입 없이 결과를 확인한다', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: '피부 고민이 뭔가요?' })).toBeVisible();
  await expect(page.locator('.concern-option')).toHaveCount(concerns.length);
  expect(await page.locator('input[name="concern"]').evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value))).toEqual(concerns.map((concern) => concern.id));
  await page.locator('.concern-option').filter({ has: page.locator(`input[value="${selected.id}"]`) }).click();
  await page.getByRole('button', { name: '비교 결과 보기' }).click();
  await expect(page.getByTestId('product-card')).toHaveCount(selectedProducts.length);
  expect(new URL(page.url()).searchParams.get('concern')).toBe(selected.id);
  expect(new URL(page.url()).searchParams.has('skin')).toBe(false);
  await expect(page.locator('#results-heading')).toBeFocused();
});

test('직접 진입 URL과 새로고침에서 모든 조건이 복원된다', async ({ page }) => {
  await page.goto(`?concern=${selected.id}&shop=daiso&skin=dry&sort=unit&sensitive=1`);
  await expect(page.locator('#sort')).toHaveValue('unit');
  await expect(page.locator('#result-shop')).toHaveValue('daiso');
  await expect(page.locator('#sensitive-filter')).toBeChecked();
  const before = await page.getByTestId('product-card').evaluateAll((nodes) => nodes.map((node) => node.id));
  await page.reload();
  expect(await page.getByTestId('product-card').evaluateAll((nodes) => nodes.map((node) => node.id))).toEqual(before);
  await expect(page.locator('#sort')).toHaveValue('unit');
  await expect(page.locator('#sensitive-filter')).toBeChecked();
  await page.getByRole('button', { name: '조건 다시 고르기' }).click();
  await expect(page.locator('#skin')).toHaveValue('dry');
  await expect(page.locator('input[name="shop"][value="daiso"]')).toBeChecked();
});

test('가격과 단위가격 정렬을 바꾸고 미확인 가격은 뒤에 둔다', async ({ page }) => {
  await goToResults(page);
  const cards = page.getByTestId('product-card');
  await page.locator('#sort').focus();
  await page.locator('#sort').selectOption('price');
  const prices = await cards.evaluateAll((nodes) => nodes.map((node) => {
    const raw = (node as HTMLElement).dataset.price;
    return raw ? Number(raw) : null;
  }));
  expect(prices).toEqual([...prices].sort((a, b) => (a ?? Infinity) - (b ?? Infinity)));
  await expect(page.locator('#sort')).toBeFocused();
  expect(new URL(page.url()).searchParams.get('sort')).toBe('price');
  await page.locator('#sort').selectOption('unit');
  const units = await cards.evaluateAll((nodes) => nodes.map((node) => ({ basis: (node as HTMLElement).dataset.basis!, value: (node as HTMLElement).dataset.unit! })));
  const basisOrder = ['10ml', '10g', '1ea', ''];
  for (let index = 1; index < units.length; index++) {
    const previous = units[index - 1];
    const current = units[index];
    expect(basisOrder.indexOf(current.basis)).toBeGreaterThanOrEqual(basisOrder.indexOf(previous.basis));
    if (current.basis === previous.basis && current.basis) expect(Number(current.value)).toBeGreaterThanOrEqual(Number(previous.value));
  }
});

test('다이소 필터와 피부 타입 표시가 제품 수를 올바르게 유지한다', async ({ page }) => {
  await goToResults(page, '&skin=dry');
  await expect(page.getByTestId('product-card')).toHaveCount(selectedProducts.length);
  await expect(page.locator('.skin-mention')).toHaveCount(selectedProducts.filter((product) => product.skin_types?.includes('dry')).length);
  await page.locator('#result-shop').selectOption('daiso');
  await expect(page.getByTestId('product-card')).toHaveCount(selectedProducts.filter((product) => product.shop === 'daiso').length);
  await expect(page.locator('[data-testid="product-card"][data-shop="oliveyoung"]')).toHaveCount(0);
  expect(new URL(page.url()).searchParams.get('shop')).toBe('daiso');
});

test('민감 필터는 포함 확인 제품을 숨기고 정보 없음을 마지막 묶음으로 표시한다', async ({ page }) => {
  await goToResults(page);
  await page.locator('#sensitive-filter').check();
  const eligible = selectedProducts.filter((product) => product.sensitive.fragrance !== true && product.sensitive.ethanol !== true);
  await expect(page.getByTestId('product-card')).toHaveCount(eligible.length);
  const statuses = await page.getByTestId('product-card').evaluateAll((nodes) => nodes.map((node) => (node as HTMLElement).dataset.sensitive));
  expect(statuses).not.toContain('included');
  const unknownIndex = statuses.indexOf('unknown');
  if (unknownIndex !== -1) {
    expect(statuses.slice(unknownIndex).every((status) => status === 'unknown')).toBe(true);
    await expect(page.getByTestId('sensitive-group').last()).toContainText('정보 없음');
  }
  await page.locator('#sensitive-filter').uncheck();
  await expect(page.getByTestId('product-card')).toHaveCount(selectedProducts.length);
});

test('미확인 가격·근거·구매 링크와 하단 고지를 명확히 표시한다', async ({ page }) => {
  await goToResults(page);
  for (const product of selectedProducts) {
    const card = page.locator(`[id="${product.id}"]`);
    if (product.price_krw === null) {
      await expect(card.locator('.unknown-price')).toHaveText('가격 확인 필요');
      await expect(card.locator('.price, .unit-price')).toHaveCount(0);
    }
    if (!product.key_ingredient_ids.length) await expect(card.locator('.match-line')).toHaveText('핵심 성분 확인 필요');
    const purchase = card.locator('.purchase-link');
    await expect(purchase).toHaveAttribute('target', '_blank');
    await expect(purchase).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(purchase).toHaveAttribute('href', new URL(product.purchase_url).href);
    await card.getByText('왜 이 제품?', { exact: true }).click();
    await expect(card.locator('.rank-sources')).toBeVisible();
    await card.locator('.alternatives summary').click();
    await expect(card.locator('.alternative-note')).toHaveText('성분이 겹친다고 효과가 같다는 뜻은 아닙니다');
  }
  await expect(page.getByTestId('disclaimer')).toHaveCount(4);
  const notices = await page.getByTestId('disclaimer').allTextContents();
  expect(notices[0]).toContain('패치테스트');
  expect(notices[1]).toContain('가격');
  expect(notices[2]).toContain('제휴');
  expect(notices[3]).toContain('화장품법');
});

test('키보드 탭과 화살표로 조건을 고르고 포커스 표시를 확인한다', async ({ page }) => {
  await page.goto('./');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  const focusStyle = await page.locator('.skip-link').evaluate((element) => ({ style: getComputedStyle(element).outlineStyle, width: getComputedStyle(element).outlineWidth }));
  expect(focusStyle).toEqual({ style: 'solid', width: '3px' });
  await page.keyboard.press('Tab');
  await expect(page.locator('.wordmark')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('#theme-toggle')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('input[name="concern"]').first()).toBeFocused();
  expect(await page.locator('.concern-option').first().evaluate((element) => getComputedStyle(element).outlineWidth)).toBe('3px');
  await page.keyboard.press('Space');
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('input[name="concern"]').nth(1)).toBeChecked();
  await page.keyboard.press('Tab');
  await expect(page.locator('#skin')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('input[name="shop"][value="all"]')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: '비교 결과 보기' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#results-heading')).toBeFocused();
});

test('시스템 다크 모드·수동 전환·저장소 제한에서 동작한다', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await page.goto('./');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: '라이트 모드로 전환' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: '시스템 화면 모드 사용' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new Error('Test: storage unavailable'); } });
  });
  await page.reload();
  await page.getByRole('button', { name: '라이트 모드로 전환' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('잘못된 URL 값은 기본 질문 화면으로 복구한다', async ({ page }) => {
  await page.goto('?concern=unknown&shop=bad&skin=unknown&sort=bad&sensitive=true');
  await expect(page.getByRole('heading', { name: '피부 고민이 뭔가요?' })).toBeVisible();
  await expect(page.locator('#skin')).toHaveValue('');
  await expect(page.locator('input[name="shop"][value="all"]')).toBeChecked();
  expect(new URL(page.url()).searchParams.get('sort')).toBe('rank');
});

test('모든 고민의 결과와 빈 필터 결과의 초기화 경계를 확인한다', async ({ page }, testInfo) => {
  for (const concern of concerns) {
    await page.goto(`?concern=${concern.id}&shop=all&sort=rank`);
    await expect(page.getByTestId('product-card')).toHaveCount(products.filter((product) => product.concern_id === concern.id).length);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
  }
  const emptyCandidate = concerns.find((concern) => {
    const daiso = products.filter((product) => product.concern_id === concern.id && product.shop === 'daiso');
    return daiso.length > 0 && daiso.every((product) => product.sensitive.fragrance === true || product.sensitive.ethanol === true);
  });
  if (emptyCandidate) {
    await page.goto(`?concern=${emptyCandidate.id}&shop=daiso&sort=rank&sensitive=1`);
    await expect(page.getByTestId('product-card')).toHaveCount(0);
    await expect(page.getByText('현재 조건에 맞는 제품이 없습니다.')).toBeVisible();
    await page.screenshot({ path: `artifacts/screenshots/${testInfo.project.name}-empty.png`, fullPage: true });
    await page.getByRole('button', { name: '필터 초기화' }).click();
    await expect(page.getByTestId('product-card')).toHaveCount(products.filter((product) => product.concern_id === emptyCandidate.id).length);
    await expect(page.locator('#sensitive-filter')).not.toBeChecked();
    await expect(page.locator('#result-shop')).toHaveValue('all');
  } else {
    await goToResults(page);
    await expect(page.locator('#reset-filters')).toHaveCount(0);
  }
});

for (const scheme of ['light', 'dark'] as const) {
  test(`${scheme} 화면 대비와 스크린샷`, async ({ page }, testInfo) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto('./');
    await page.screenshot({ path: `artifacts/screenshots/${testInfo.project.name}-${scheme}-home.png`, fullPage: true });
    await goToResults(page);
    await expect(page.locator('html')).toHaveAttribute('data-theme', scheme);
    const ratios = await page.evaluate(() => {
      const styles = getComputedStyle(document.documentElement);
      function luminance(token: string): number {
        const raw = styles.getPropertyValue(token).trim().slice(1);
        const hex = raw.length === 3 ? [...raw].map((digit) => digit + digit).join('') : raw;
        const channels = [0, 2, 4].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255).map((value) => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
        return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
      }
      function ratio(a: string, b: string): number {
        const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
        return (values[0] + .05) / (values[1] + .05);
      }
      return {
        text: ['--ink', '--muted', '--accent'].flatMap((text) => ['--page', '--surface'].map((background) => ratio(text, background))),
        accentSoft: ratio('--ink', '--accent-soft'),
        accentBadge: ratio('--accent', '--accent-soft'),
        button: ratio('--inverse', '--accent'),
        border: ratio('--control-line', '--surface'),
      };
    });
    for (const ratio of [...ratios.text, ratios.accentSoft, ratios.accentBadge, ratios.button]) expect(ratio).toBeGreaterThanOrEqual(4.5);
    expect(ratios.border).toBeGreaterThanOrEqual(3);
    await page.screenshot({ path: `artifacts/screenshots/${testInfo.project.name}-${scheme}.png`, fullPage: true });
    await page.getByTestId('product-card').first().screenshot({ path: `artifacts/screenshots/${testInfo.project.name}-${scheme}-product.png` });
  });
}
