import assert from 'node:assert/strict';
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { Ingredient, Product } from '../src/types.ts';

const dataDir = resolve(process.env.GOMIN_DATA_DIR ?? 'data');
const products = JSON.parse(readFileSync(join(dataDir, 'products.json'), 'utf8')) as Product[];
const ingredients = JSON.parse(readFileSync(join(dataDir, 'ingredients.json'), 'utf8')) as Ingredient[];
const allowed = new Set<string>([
  ...products.flatMap((product) => [product.purchase_url, ...product.source_urls, ...product.rank_basis.map((basis) => basis.source_url), product.functional_cosmetic?.source_url, product.sensitive.source_url]),
  ...ingredients.flatMap((ingredient) => [ingredient.evidence.source_url, ingredient.functional?.source_url]),
].filter((url): url is string => Boolean(url)));
// Retained older sample builds contain only these explicitly labeled fixture links.
const sampleProducts = JSON.parse(readFileSync('fixtures/sample-data/products.json', 'utf8')) as Product[];
for (const product of sampleProducts) {
  [product.purchase_url, ...product.source_urls, ...product.rank_basis.map((basis) => basis.source_url)].forEach((url) => allowed.add(url));
}

function filesIn(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? filesIn(join(directory, entry.name)) : [join(directory, entry.name)]);
}

const files = filesIn('dist').filter((file) => /\.(html|css|js)$/.test(file));
const detectedUrls = new Set<string>();
const externalResourceLoads: { file: string; snippet: string }[] = [];
for (const file of files) {
  const source = readFileSync(file, 'utf8');
  for (const match of source.matchAll(/https?:\/\/[^\s"'`<>\\]+/g)) detectedUrls.add(match[0]);
  const resourcePatterns = [
    /<(?:script|img|iframe|source|video|audio|link)\b[^>]*(?:src|href|poster)\s*=\s*["']https?:\/\/[^"']+/gi,
    /url\(\s*["']?https?:\/\/[^)]+/gi,
    /(?:fetch|import|Worker|WebSocket|EventSource)\s*\(\s*["'`]https?:\/\/[^"'`]+/g,
  ];
  for (const pattern of resourcePatterns) {
    for (const match of source.matchAll(pattern)) externalResourceLoads.push({ file, snippet: match[0] });
  }
}
const unexpectedUrls = [...detectedUrls].filter((url) => !allowed.has(url));
const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };
const version = JSON.parse(readFileSync('dist/version.json', 'utf8')) as Record<string, unknown>;
assert.equal(version.name, 'gomin-pick');
assert.equal(version.version, pkg.version);
assert.equal(version.commit, process.env.GITHUB_SHA ?? 'local');
assert.equal(version.products, products.length);
assert.equal(version.data_checked_at_max, products.map((product) => product.checked_at).sort().at(-1) ?? null);
assert.ok(typeof version.built_at === 'string' && Number.isFinite(Date.parse(version.built_at)));
const evidence = { checked_at: new Date().toISOString(), data_dir: dataDir, files_checked: files, detected_url_count: detectedUrls.size, external_resource_loads: externalResourceLoads, unexpected_urls: unexpectedUrls, version };
mkdirSync('artifacts/screenshots', { recursive: true });
writeFileSync('artifacts/screenshots/dist-audit.json', `${JSON.stringify(evidence, null, 2)}\n`);
assert.deepEqual(externalResourceLoads, [], 'External resource load in build');
assert.deepEqual(unexpectedUrls, [], 'URL outside declared purchase/source links');
console.log(`PASS: ${files.length} build files, ${detectedUrls.size} declared purchase/source URLs, 0 external resource loads; version.json matches ${products.length} products.`);
