/**
 * Average load test — simulates typical weekday traffic.
 * Ramp to 50 VUs over 2 min, hold for 5 min, ramp down.
 *
 * Scenarios model real user behaviour with weighted endpoints.
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Rate } from "k6/metrics";
import { BASE_URL, authHeaders, DEFAULT_THRESHOLDS } from "./utils.js";

const searchDuration = new Trend("search_duration", true);
const feedDuration = new Trend("feed_duration", true);
const bookingDuration = new Trend("booking_duration", true);
const errorRate = new Rate("errors");

export const options = {
  stages: [
    { duration: "2m",  target: 50  }, // ramp up
    { duration: "5m",  target: 50  }, // hold
    { duration: "2m",  target: 0   }, // ramp down
  ],
  thresholds: {
    ...DEFAULT_THRESHOLDS,
    search_duration:  ["p(95)<300"],
    feed_duration:    ["p(95)<400"],
    booking_duration: ["p(95)<600"],
  },
};

const SCENARIOS = ["search", "feed", "discover", "availability"] as const;

function weightedScenario() {
  const rand = Math.random();
  if (rand < 0.35) return "search";     // 35% — search / autocomplete
  if (rand < 0.60) return "feed";       // 25% — inspiration feed
  if (rand < 0.85) return "discover";   // 25% — business discover
  return "availability";                // 15% — availability check
}

export default function () {
  const scenario = weightedScenario();

  switch (scenario) {
    case "search": {
      const terms = ["balayage", "nail art", "haircut", "facial", "lashes"];
      const q = terms[Math.floor(Math.random() * terms.length)];
      const res = http.get(`${BASE_URL}/search/autocomplete?q=${q}`, {
        headers: authHeaders(),
        tags: { name: "search_autocomplete" },
      });
      searchDuration.add(res.timings.duration);
      const ok = check(res, { "search 200": (r) => r.status === 200 });
      errorRate.add(!ok);
      break;
    }

    case "feed": {
      const modes = ["for_you", "all"];
      const mode = modes[Math.floor(Math.random() * modes.length)];
      const res = http.get(`${BASE_URL}/feed?mode=${mode}&limit=12`, {
        headers: authHeaders(),
        tags: { name: "feed_list" },
      });
      feedDuration.add(res.timings.duration);
      const ok = check(res, { "feed 200": (r) => r.status === 200 });
      errorRate.add(!ok);
      break;
    }

    case "discover": {
      const res = http.get(`${BASE_URL}/businesses/discover?limit=20`, {
        headers: authHeaders(),
        tags: { name: "business_discover" },
      });
      const ok = check(res, { "discover 200": (r) => r.status === 200 });
      errorRate.add(!ok);
      break;
    }

    case "availability": {
      const serviceId = __ENV.TEST_SERVICE_ID || "00000000-0000-0000-0000-000000000001";
      const date = new Date().toISOString().split("T")[0];
      const res = http.get(
        `${BASE_URL}/scheduling/availability?service_id=${serviceId}&date=${date}`,
        { headers: authHeaders(), tags: { name: "availability" } },
      );
      bookingDuration.add(res.timings.duration);
      const ok = check(res, { "availability 200": (r) => r.status === 200 });
      errorRate.add(!ok);
      break;
    }
  }

  sleep(Math.random() * 2 + 0.5); // 0.5–2.5s think time
}
