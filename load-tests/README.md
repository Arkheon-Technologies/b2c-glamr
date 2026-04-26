# Glamr Load Tests (k6)

Run load tests against the API using [k6](https://k6.io/).

## Prerequisites

```bash
brew install k6   # macOS
# or: https://k6.io/docs/getting-started/installation/
```

## Usage

```bash
# Smoke test (1 VU, 30s)
k6 run load-tests/smoke.js

# Average load (50 VUs, 5m)
k6 run --env BASE_URL=http://localhost:4000/api/v1 load-tests/average-load.js

# Stress test (ramp to 200 VUs)
k6 run load-tests/stress.js

# Spike test (instant 500 VUs for 30s)
k6 run load-tests/spike.js

# With output to InfluxDB + Grafana
k6 run --out influxdb=http://localhost:8086/k6 load-tests/average-load.js
```

## Environment variables

| Variable    | Default                        | Description            |
|-------------|--------------------------------|------------------------|
| `BASE_URL`  | `http://localhost:4000/api/v1` | API base URL           |
| `AUTH_TOKEN`| `""`                           | Bearer token for auth  |
