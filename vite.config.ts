import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import type { Product } from './src/types.ts';

const root = fileURLToPath(new URL('.', import.meta.url));
const dataDir = resolve(root, process.env.GOMIN_DATA_DIR ?? './data');

export default defineConfig({
  base: '/gomin-pick/',
  resolve: { alias: { '@data': dataDir } },
  build: { emptyOutDir: false },
  plugins: [{
    name: 'gomin-pick-version',
    apply: 'build',
    generateBundle() {
      const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string };
      const products = JSON.parse(readFileSync(resolve(dataDir, 'products.json'), 'utf8')) as Product[];
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: `${JSON.stringify({
          name: 'gomin-pick',
          version: pkg.version,
          commit: process.env.GITHUB_SHA ?? 'local',
          built_at: new Date().toISOString(),
          products: products.length,
          data_checked_at_max: products.map((product) => product.checked_at).sort().at(-1) ?? null,
        }, null, 2)}\n`,
      });
    },
  }],
  test: {
    include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'],
    environment: 'node',
    maxWorkers: 1,
  },
});
