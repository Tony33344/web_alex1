import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * Playwright configuration for Infinity Role Teachers E2E testing
 * Uses installed Brave browser (Chromium-based) for Ubuntu 26.04 compatibility
 */

// Detect Brave browser path
const bravePath = process.env.BRAVE_PATH || '/usr/bin/brave-browser';

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 15000,
  },
  projects: [
    // Setup project for authentication
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    // Desktop Chromium (using installed Brave browser)
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          executablePath: bravePath,
        },
      },
      dependencies: ['setup'],
    },
    // Mobile Chromium
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        launchOptions: {
          executablePath: bravePath,
        },
      },
      dependencies: ['setup'],
    },
    // Firefox (if installed)
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        launchOptions: {
          executablePath: '/usr/bin/firefox',
        },
      },
      dependencies: ['setup'],
    },
    // WebKit (if available - usually not on Linux)
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
