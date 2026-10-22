import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { formatReport, parseArgs } from './lib/cli.ts';
import type { Issue } from './lib/schema.ts';
import { validateData } from './lib/validate.ts';
import type { DatasetInput } from './lib/validate.ts';

const args = process.argv.slice(2);
const defaultNow = new Date().toISOString().slice(0, 10);
const empty: DatasetInput = { concerns: [], ingredients: [], products: [] };

try {
  const options = parseArgs(args, process.env.GOMIN_DATA_DIR ?? 'data', defaultNow);
  if (options.help) {
    console.log('사용법: node scripts/validate-data.ts [--data-dir <dir>] [--now YYYY-MM-DD] [--json]');
  } else {
    const input: DatasetInput = { ...empty };
    const loadErrors: Issue[] = [];
    for (const key of ['concerns', 'ingredients', 'products'] as const) {
      const file = `${key}.json`;
      let text: string;
      try {
        text = readFileSync(resolve(options.dataDir, file), 'utf8');
      } catch {
        loadErrors.push({ code: 'FILE_READ', path: file, message: '데이터 파일을 읽을 수 없습니다.' });
        continue;
      }
      try {
        input[key] = JSON.parse(text.replace(/^\uFEFF/u, '')) as unknown;
      } catch {
        loadErrors.push({ code: 'JSON_PARSE', path: file, message: '유효한 JSON이 아닙니다.' });
      }
    }
    const result = validateData(input, options.now);
    result.errors.unshift(...loadErrors);
    console.log(options.json ? JSON.stringify(result, null, 2) : formatReport(result));
    process.exitCode = result.errors.length > 0 ? 1 : 0;
  }
} catch (error: unknown) {
  const result = validateData(empty, defaultNow);
  result.warnings = [];
  result.errors = [{ code: 'CLI_OPTIONS', path: 'argv', message: error instanceof Error ? error.message : '옵션을 처리할 수 없습니다.' }];
  console.log(args.includes('--json') ? JSON.stringify(result, null, 2) : formatReport(result));
  process.exitCode = 1;
}
