import "server-only";
import { headers } from "next/headers";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;
const attempts = new Map();

// This in-memory limit is per application instance; use a shared store for multi-instance deployments.
export async function loginRateLimitKey(email) {
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || requestHeaders.get("x-real-ip") || "unknown";
  return `${email.toLowerCase()}:${ip}`;
}

export function isRateLimited(key) {
  const entry = attempts.get(key);
  if (!entry) return false;
  if (entry.resetAt <= Date.now()) {
    attempts.delete(key);
    return false;
  }
  return entry.failures >= MAX_FAILURES;
}

export function recordLoginFailure(key) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt <= now) {
    attempts.set(key, { failures: 1, resetAt: now + WINDOW_MS });
    return;
  }
  entry.failures += 1;
}

export function clearLoginFailures(key) {
  attempts.delete(key);
}
