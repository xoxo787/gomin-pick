import { defineConfig } from '@playwright/test';

// Windows may reserve 4173; keep the CI default and allow a local, explicit override.
const port = Number(process.env.GOMIN_E2E_PORT ?? 4173);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('GOMIN_E2E_PORT must be a valid TCP port');
const baseURL = `http://localhost:${port}/gomin-pick/`;
const runId = `${Date.now()}-${process.pid}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  outputDir: `test-results/${runId}`,
  reporter: [['list'], ['html', { open: 'never', outputFolder: `playwright-report/${runId}` }]],
  use: {
    baseURL,
    browserName: 'chromium',
    colorScheme: 'light',
    locale: 'ko-KR',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1280, height: 800 } } },
    { name: 'mobile-375', use: { viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true } },
  ],
  webServer: {
    command: `npm run build && npm run preview -- --host localhost --port ${port} --strictPort`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
