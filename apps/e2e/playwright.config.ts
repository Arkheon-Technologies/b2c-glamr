import { defineConfig, devices } from "@playwright/test";

/**
 * Glamr E2E Test Suite
 * Run: `cd apps/e2e && npx playwright test`
 * Assumes `apps/web` running at localhost:3000 and `apps/api` at localhost:4000.
 */

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["list"],
  ],
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    // Default viewport — desktop
    viewport: { width: 1280, height: 800 },
    locale: "en-GB",
    timezoneId: "Europe/Bucharest",
  },

  projects: [
    /* ─── Setup: seed test user ─────────────────────────────────────── */
    {
      name: "setup",
      testMatch: /global\.setup\.ts/,
    },

    /* ─── Desktop browsers ──────────────────────────────────────────── */
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      dependencies: ["setup"],
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
      dependencies: ["setup"],
    },

    /* ─── Mobile browsers ───────────────────────────────────────────── */
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"] },
      dependencies: ["setup"],
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 14"] },
      dependencies: ["setup"],
    },
  ],

  /* Start local dev servers in CI */
  webServer: process.env.CI
    ? [
        {
          command: "npm run start --workspace=apps/web",
          url: "http://localhost:3000",
          reuseExistingServer: false,
          timeout: 120_000,
        },
        {
          command: "npm run start --workspace=apps/api",
          url: "http://localhost:4000/health",
          reuseExistingServer: false,
          timeout: 120_000,
        },
      ]
    : undefined,
});
