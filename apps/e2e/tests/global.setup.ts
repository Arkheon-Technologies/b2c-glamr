import { test as setup } from "@playwright/test";
import path from "path";
import fs from "fs";

/**
 * Global setup: registers a test user via the API and saves the auth state
 * so individual tests don't need to log in every time.
 */

const AUTH_FILE = path.join(__dirname, "../.auth/user.json");

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:4000/api/v1";
const TEST_EMAIL = process.env.TEST_USER_EMAIL ?? "playwright@glamr.test";
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD ?? "Playwright1!";

setup("authenticate", async ({ request }) => {
  // Attempt registration (idempotent — ignore 409 conflict)
  await request.post(`${API_BASE}/auth/register`, {
    data: { email: TEST_EMAIL, password: TEST_PASSWORD, fullName: "Playwright User" },
  });

  // Login
  const loginRes = await request.post(`${API_BASE}/auth/login`, {
    data: { email: TEST_EMAIL, password: TEST_PASSWORD },
  });

  const body = await loginRes.json();
  const token: string = body?.data?.access_token ?? "";

  // Save minimal auth state (we inject token into localStorage in fixtures)
  const dir = path.dirname(AUTH_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    AUTH_FILE,
    JSON.stringify({ access_token: token, email: TEST_EMAIL }),
  );
});
