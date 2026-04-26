import { test as base, type Page } from "@playwright/test";
import fs from "fs";
import path from "path";

const AUTH_FILE = path.join(__dirname, "../.auth/user.json");

/**
 * Extended test fixture that injects the auth token into localStorage
 * so pages load as an authenticated user.
 */
export const test = base.extend<{ authedPage: Page }>({
  authedPage: async ({ page }, use) => {
    // Read saved token from global setup
    let token = "";
    try {
      const data = JSON.parse(fs.readFileSync(AUTH_FILE, "utf8"));
      token = data.access_token ?? "";
    } catch {/* no auth file — anonymous */}

    if (token) {
      // Navigate to origin to be able to write localStorage
      await page.goto("/");
      await page.evaluate((t: string) => {
        localStorage.setItem(
          "glamr.auth.session",
          JSON.stringify({ access_token: t }),
        );
      }, token);
    }

    await use(page);
  },
});

export { expect } from "@playwright/test";
