/**
 * Brute-force guard for the login endpoint. In-memory is fine here — this
 * app runs as a single long-lived PM2 process (not serverless/multi-region),
 * so a Map survives for the process lifetime and is shared across requests.
 */

interface AttemptRecord {
  failures: number;
  firstFailureAt: number;
  lockedUntil: number | null;
}

const attempts = new Map<string, AttemptRecord>();

const WINDOW_MS = 5 * 60 * 1000; // count failures within a rolling 5-minute window
const MAX_FAILURES = 5; // ...before locking out
const LOCKOUT_MS = 15 * 60 * 1000; // ...for 15 minutes

export function checkLoginLockout(key: string): { locked: boolean; retryAfterSeconds?: number } {
  const record = attempts.get(key);
  if (!record?.lockedUntil) return { locked: false };

  const remainingMs = record.lockedUntil - Date.now();
  if (remainingMs <= 0) {
    attempts.delete(key);
    return { locked: false };
  }

  return { locked: true, retryAfterSeconds: Math.ceil(remainingMs / 1000) };
}

export function recordLoginFailure(key: string): void {
  const now = Date.now();
  const record = attempts.get(key);

  if (!record || now - record.firstFailureAt > WINDOW_MS) {
    attempts.set(key, { failures: 1, firstFailureAt: now, lockedUntil: null });
    return;
  }

  record.failures += 1;
  if (record.failures >= MAX_FAILURES) {
    record.lockedUntil = now + LOCKOUT_MS;
  }
}

export function recordLoginSuccess(key: string): void {
  attempts.delete(key);
}
