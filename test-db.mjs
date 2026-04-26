/**
 * Run this from the glamr repo root:
 *   node test-db.mjs
 *
 * It tests both the pooler (port 6543) and direct (port 5432) connections.
 */

import { createConnection } from 'net';
import { execSync } from 'child_process';

const POOLER_HOST = 'aws-1-eu-central-1.pooler.supabase.com';
const POOLER_PORT = 6543;
const DIRECT_HOST = 'db.wrousieyiuuqoekfnfzn.supabase.co';
const DIRECT_PORT = 5432;

function tcpCheck(host, port, label) {
  return new Promise((resolve) => {
    const start = Date.now();
    const socket = createConnection({ host, port, timeout: 5000 });
    socket.on('connect', () => {
      const ms = Date.now() - start;
      console.log(`✅ [${label}] TCP connection to ${host}:${port} succeeded (${ms}ms)`);
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      console.log(`❌ [${label}] TCP connection to ${host}:${port} TIMED OUT (5s) — host is unreachable or port is blocked`);
      socket.destroy();
      resolve(false);
    });
    socket.on('error', (err) => {
      console.log(`❌ [${label}] TCP connection to ${host}:${port} FAILED — ${err.message}`);
      socket.destroy();
      resolve(false);
    });
  });
}

async function main() {
  console.log('\n=== GLAMR DB Connectivity Test ===\n');

  const poolerOk = await tcpCheck(POOLER_HOST, POOLER_PORT, 'Transaction Pooler');
  const directOk = await tcpCheck(DIRECT_HOST, DIRECT_PORT, 'Direct Connection');

  console.log('\n--- Results ---');
  if (!poolerOk && !directOk) {
    console.log(`
🚨 Both connections failed. Most likely causes:
   1. Your Supabase project is PAUSED (free tier pauses after inactivity).
      → Go to https://supabase.com/dashboard and check if there's a "Resume" button.
   2. Supabase Network Restrictions are enabled and blocking external IPs.
      → Go to Project Settings → Networking → Network Restrictions and check if restrictions are on.
`);
  } else if (!poolerOk && directOk) {
    console.log(`
⚠️  Direct connection (5432) works but pooler (6543) does not.
    → Use DIRECT_URL for both DATABASE_URL and DIRECT_URL as a temporary workaround,
      or check if port 6543 is specifically blocked by a firewall.
`);
  } else if (poolerOk && !directOk) {
    console.log(`
⚠️  Pooler works but direct connection (5432) does not.
    This is unusual — double-check your DIRECT_URL host/credentials.
`);
  } else {
    console.log(`
✅ Both TCP connections succeeded — the host is reachable.
   The issue is likely a credentials or SSL mismatch.
   Try running: cd packages/db && npx prisma migrate status
`);
  }
}

main();
