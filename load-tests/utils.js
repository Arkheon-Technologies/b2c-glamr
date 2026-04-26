/**
 * Shared utilities for k6 load tests.
 */

export const BASE_URL = __ENV.BASE_URL || "http://localhost:4000/api/v1";
export const AUTH_TOKEN = __ENV.AUTH_TOKEN || "";

export function authHeaders() {
  const h = { "Content-Type": "application/json" };
  if (AUTH_TOKEN) h["Authorization"] = `Bearer ${AUTH_TOKEN}`;
  return h;
}

/**
 * Standard thresholds for glamr API SLA:
 *   - 95% of requests < 500ms
 *   - 99% of requests < 2000ms
 *   - error rate < 1%
 */
export const DEFAULT_THRESHOLDS = {
  http_req_duration: ["p(95)<500", "p(99)<2000"],
  http_req_failed: ["rate<0.01"],
};
