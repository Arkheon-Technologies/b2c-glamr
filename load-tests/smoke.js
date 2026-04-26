/**
 * Smoke test — verifies the system works under minimal load.
 * 1 VU for 30 seconds.
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { BASE_URL, authHeaders, DEFAULT_THRESHOLDS } from "./utils.js";

export const options = {
  vus: 1,
  duration: "30s",
  thresholds: DEFAULT_THRESHOLDS,
};

export default function () {
  // Health check
  const health = http.get(`${BASE_URL.replace("/api/v1", "")}/health`);
  check(health, { "health ok": (r) => r.status === 200 });

  // Search autocomplete
  const search = http.get(`${BASE_URL}/search/autocomplete?q=hair`, {
    headers: authHeaders(),
  });
  check(search, {
    "search 200": (r) => r.status === 200,
    "search has data": (r) => JSON.parse(r.body)?.ok !== false,
  });

  // Business discover
  const discover = http.get(`${BASE_URL}/businesses/discover?limit=10`, {
    headers: authHeaders(),
  });
  check(discover, { "discover 200": (r) => r.status === 200 });

  // Feed categories
  const cats = http.get(`${BASE_URL}/feed/categories`);
  check(cats, { "categories 200": (r) => r.status === 200 });

  sleep(1);
}
