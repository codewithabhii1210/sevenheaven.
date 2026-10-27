import { defineConfig } from '@playwright/test'

// E2E suite runs against the LIVE site by default (browser-based verification
// per the project plan). Override with E2E_BASE_URL for local testing.
// Uses the system-installed Google Chrome (channel: 'chrome') — no browser
// download required.
export default defineConfig({
  testDir: './tests',
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  // Sequential: tests share one IP's rate-limit budget and the test-patron
  // records in the live database.
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'https://sevenheaven.co.in',
    channel: 'chrome',
    headless: true,
    viewport: { width: 1280, height: 900 },
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
})
