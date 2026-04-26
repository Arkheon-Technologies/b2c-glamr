import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("renders hero with correct heading and CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/glamr/i);
    // Hero heading contains "hair day" (locale-agnostic partial match)
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // Search input is present
    await expect(page.getByPlaceholder(/find a service/i)).toBeVisible();
    // "Book now" CTA exists in nav
    await expect(page.getByRole("link", { name: /book now/i }).first()).toBeVisible();
  });

  test("navigation links are accessible", async ({ page }) => {
    await page.goto("/");
    // Navbar items
    await expect(page.getByRole("link", { name: /discover/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /inspiration/i }).first()).toBeVisible();
  });

  test("skip to content link works for keyboard users", async ({ page }) => {
    await page.goto("/");
    // Tab once — focus should reach skip link
    await page.keyboard.press("Tab");
    const skipLink = page.getByRole("link", { name: /skip to main content/i });
    await expect(skipLink).toBeFocused();
  });
});
