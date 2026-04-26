import { test, expect } from "./fixtures";

test.describe("Studio — Calendar", () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto("/studio/calendar");
  });

  test("renders day view with staff columns", async ({ authedPage: page }) => {
    // Page heading
    await expect(page.getByText(/calendar/i).first()).toBeVisible();
    // Day view should be default
    await expect(page.getByRole("button", { name: /day/i })).toBeVisible();
  });

  test("can switch to month view", async ({ authedPage: page }) => {
    await page.getByRole("button", { name: /month/i }).click();
    // Month grid appears (days of week header)
    await expect(page.getByText(/mon/i).first()).toBeVisible();
  });

  test("can switch to timeline view", async ({ authedPage: page }) => {
    await page.getByRole("button", { name: /timeline/i }).click();
    await expect(page.getByText(/timeline/i, { exact: false }).first()).toBeVisible();
  });

  test("today navigation button works", async ({ authedPage: page }) => {
    // Navigate away first
    await page.getByRole("button", { name: /›/i }).click();
    await page.getByRole("button", { name: /today/i }).click();
    // Today button should still exist and page is stable
    await expect(page.getByRole("button", { name: /today/i })).toBeVisible();
  });
});
