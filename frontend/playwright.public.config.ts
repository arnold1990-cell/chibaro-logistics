import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests', testMatch: 'slider.spec.ts', workers: 1, timeout: 60000,
  use: { baseURL: 'http://localhost:3107' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'tablet', use: { ...devices['Desktop Chrome'], viewport: { width: 820, height: 1180 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: { command: 'npm run start -- --port 3107', url: 'http://localhost:3107', reuseExistingServer: false },
});


