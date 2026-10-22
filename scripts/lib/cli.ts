import { dateEpoch } from './schema.ts';
import type { ValidationResult } from './validate.ts';

export interface CliOptions { dataDir: string; now: string; json: boolean; help: boolean }

export function parseArgs(args: string[], defaultDataDir: string, defaultNow: string): CliOptions {
  const options: CliOptions = { dataDir: defaultDataDir, now: defaultNow, json: false, help: false };
  const seen = new Set<string>();
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (seen.has(arg)) throw new Error(`중복 옵션: ${arg}`);
    seen.add(arg);
    if (arg === '--json') options.json = true;
    else if (arg === '--help') options.help = true;
    else if (arg === '--data-dir' || arg === '--now') {
      const value = args[index + 1];
      if (!value || value.startsWith('--')) throw new Error(`${arg} 뒤에 값이 필요합니다.`);
      if (arg === '--data-dir') options.dataDir = value;
      else options.now = value;
      index += 1;
    } else throw new Error(`알 수 없는 옵션: ${arg}`);
  }
  if (dateEpoch(options.now) === null) throw new Error('--now는 실제 달력 날짜 YYYY-MM-DD이어야 합니다.');
  if (options.dataDir.trim() === '') throw new Error('데이터 폴더가 비어 있습니다.');
  return options;
}

export function formatReport(result: ValidationResult): string {
  const lines = [
    `데이터 검사 기준일: ${result.now} (UTC 날짜)`,
    `전체 제품: ${result.summary.total}개 | 오류: ${result.errors.length}개 | 경고: ${result.warnings.length}개`,
    '', '| 고민 | ID | 제품 수 |', '| --- | --- | ---: |',
    ...result.summary.concerns.map((row) => `| ${row.label} | ${row.id} | ${row.count} |`),
    '', '| 구매처 | 제품 수 |', '| --- | ---: |',
    ...result.summary.shops.map((row) => `| ${row.shop} | ${row.count} |`),
    '', '| 고민 / 구매처 | 제품 수 |', '| --- | ---: |',
    ...result.summary.groups.map((row) => `| ${row.concern_id} / ${row.shop} | ${row.count} |`),
    '', '| 필드 | null 수 | 전체 제품 대비 비율 |', '| --- | ---: | ---: |',
    ...result.summary.null_fields.map((row) => `| ${row.field} | ${row.count} | ${(row.ratio * 100).toFixed(1)}% |`),
    '', `unverified_fields가 있는 제품: ${result.summary.unverified.count}개 (${(result.summary.unverified.ratio * 100).toFixed(1)}%)`,
    '', '오류:', ...(result.errors.length ? result.errors.map((issue) => `- [${issue.code}] ${issue.path}: ${issue.message}`) : ['- 없음']),
    '', '경고:', ...(result.warnings.length ? result.warnings.map((issue) => `- [${issue.code}] ${issue.path}: ${issue.message}`) : ['- 없음']),
    '', 'stale 목록 (확인 후 30일 초과):',
    ...(result.stale.length ? result.stale.map((item) => `- ${item.id}: ${item.checked_at} (${item.age_days}일)`) : ['- 없음']),
  ];
  return lines.join('\n');
}
