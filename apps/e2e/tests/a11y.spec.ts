import { test, expect } from "@playwright/test";

/**
 * Accessibility smoke tests.
 * Full axe-core scanning is left for CI; these tests cover critical paths.
 */
test.describe("Accessibility", () => {
  test("all images on home page have alt text", async ({ page }) => {
    await page.goto("/");
    const imgs = page.locator("img");
    const count = await imgs.count();
    for (let i = 0; i < count; i++) {
      const alt = await imgs.nth(i).getAttribute("alt");
      expect(alt, `Image ${i} is missing alt text`).not.toBeNull();
    }
  });

  test("nav landmark is present", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("navigation")).toBeVisible();
  });

  test("main landmark is present", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("lang attribute is set on <html>", async ({ page }) => {
    await page.goto("/");
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBeTruthy();
  });

  test("locale switcher changes lang attribute", async ({ page }) => {
    await page.goto("/");
    // Click RO locale button
    const roBtn = page.getByRole("button", { name: /switch to romanian/i });
    if (await roBtn.isVisible()) {
      await roBtn.click();
      const lang = await page.locator("html").getAttribute("lang");
      expect(lang).toBe("ro");
    }
  });

  test("interactive elements are keyboard reachable", async ({ page }) => {
    await page.goto("/");
    // Tab through to the "Book now" link
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("Tab");
      const focused = await page.evaluate(() => document.activeElement?.tagName);
      if (focused === "A" || focused === "BUTTON") {
        // At least one focusable element reached
        expect(true).toBe(true);
        return;
      }
    }
    // If nothing focusable reached in 10 tabs, fail
    throw new Error("No interactive elements reachable via Tab within 10 presses");
  });
});
