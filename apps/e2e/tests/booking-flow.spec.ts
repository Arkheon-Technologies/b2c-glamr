import { test, expect } from "./fixtures";

/**
 * Core booking flow:
 * Browse business profile → pick service → select date/time → confirm
 */
test.describe("Booking flow", () => {
  test("business profile page loads and shows services", async ({ authedPage: page }) => {
    // Navigate to a demo or seeded business slug
    const slug = process.env.TEST_BUSINESS_SLUG ?? "sala-studio";
    await page.goto(`/business/${slug}`);

    // Business name heading is visible
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Services section renders
    await expect(page.getByText(/services/i).first()).toBeVisible();

    // At least one "Book" button
    await expect(page.getByRole("link", { name: /book/i }).first()).toBeVisible();
  });

  test("availability calendar shows slots", async ({ authedPage: page }) => {
    const slug = process.env.TEST_BUSINESS_SLUG ?? "sala-studio";
    await page.goto(`/business/${slug}`);

    // Click first "Book" button
    const bookBtn = page.getByRole("link", { name: /book/i }).first();
    await bookBtn.click();

    // Should be on a /book or /booking/ page
    await expect(page).toHaveURL(/\/book/);

    // Date picker or slot grid should appear
    await expect(page.getByText(/select/i).first()).toBeVisible({ timeout: 10_000 });
  });
});
