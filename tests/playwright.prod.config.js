import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './specs-prod',
  fullyParallel: true,
  retries: 1,
  reporter: 'list',
  use: {
    baseURL: 'https://radarpin.me',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 14'] } },
  ],
});
