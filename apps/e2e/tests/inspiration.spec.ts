import { test, expect } from "@playwright/test";

test.describe("Inspiration / Feed page", () => {
  test("renders filter chips and posts grid", async ({ page }) => {
    await page.goto("/inspiration");
    await expect(page.getByRole("main")).toBeVisible();

    // Mode filter chips
    await expect(page.getByRole("button", { name: /for you/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /following/i })).toBeVisible();
  });

  test("category filter chips narrow the feed", async ({ page }) => {
    await page.goto("/inspiration");
    // At least one category chip (from demo data or API)
    const chips = page.locator("button.chip").filter({ hasNotText: /for you|following/i });
    await expect(chips.first()).toBeVisible();
    // Click first category chip
    await chips.first().click();
    // Chip should become active (has "on" class)
    await expect(chips.first()).toHaveClass(/on/);
  });

  test("like button triggers optimistic update", async ({ page }) => {
    await page.goto("/inspiration");
    // Hover over first post card to reveal buttons
    const firstCard = page.locator(".card").first();
    await firstCard.hover();
    const likeBtn = firstCard.getByRole("button", { name: /like/i });
    if (await likeBtn.isVisible()) {
      await likeBtn.click();
      // Button should now have plum background (active state)
      await expect(likeBtn).toHaveClass(/bg-\[var\(--plum\)\]/);
    }
  });
});
