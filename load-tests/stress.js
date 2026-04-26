/**
 * Stress test — finds the breaking point by ramping beyond expected capacity.
 * Ramp to 200 VUs over 10 min.
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { BASE_URL, authHeaders } from "./utils.js";

export const options = {
  stages: [
    { duration: "2m", target: 50  },
    { duration: "2m", target: 100 },
    { duration: "2m", target: 150 },
    { duration: "2m", target: 200 },
    { duration: "2m", target: 0   }, // ramp down
  ],
  thresholds: {
    // Relaxed thresholds for stress — we expect some degradation
    http_req_duration: ["p(95)<2000"],
    http_req_failed: ["rate<0.05"], // up to 5% errors OK under stress
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/search/autocomplete?q=hair`, {
    headers: authHeaders(),
  });
  check(res, { "status < 500": (r) => r.status < 500 });
  sleep(0.5);
}
