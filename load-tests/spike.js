/**
 * Spike test — simulates a sudden burst (e.g. social media viral post).
 * Instantly ramps to 500 VUs for 30s, then drops back.
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { BASE_URL, authHeaders } from "./utils.js";

export const options = {
  stages: [
    { duration: "10s", target: 500 }, // instant spike
    { duration: "30s", target: 500 }, // hold spike
    { duration: "10s", target: 0   }, // drop
  ],
  thresholds: {
    http_req_failed: ["rate<0.10"],  // up to 10% errors during spike
    http_req_duration: ["p(99)<5000"], // allow 5s for p99 during spike
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/businesses/discover?limit=10`, {
    headers: authHeaders(),
  });
  check(res, { "not 5xx": (r) => r.status < 500 });
  sleep(0.2);
}
