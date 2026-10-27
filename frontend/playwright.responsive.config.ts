import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests', testMatch: 'responsive.spec.ts', workers: 1, timeout: 120000,
  use: { baseURL: 'http://localhost:3107' },
  webServer: { command: 'npm run start -- --port 3107', url: 'http://localhost:3107', reuseExistingServer: false },
});
