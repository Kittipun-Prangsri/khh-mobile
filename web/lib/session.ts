/**
 * Signed session tokens (HMAC-SHA256), verifiable in both the Node.js API
 * routes and the Edge middleware runtime. Built on the Web Crypto API
 * (`crypto.subtle`), which is available as a global in both — so no
 * external JWT dependency is needed.
 *
 * Token shape: `<base64url payload>.<base64url HMAC signature>`
 */

export const SESSION_COOKIE_NAME = 'khh_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12; // 12 hours

export interface SessionUser {
  id: string;
  role: string;
  name: string;
  roleLabel?: string;
}

export interface SessionPayload extends SessionUser {
  iat: number; // issued-at, unix seconds
  exp: number; // expiry, unix seconds
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    console.warn(
      '⚠️ SESSION_SECRET is missing or < 16 chars. Using default session secret fallback.'
    );
    return 'khh_default_secure_session_secret_key_2026_safe_connect_hospital';
  }
  return secret;
}

function toBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = '';
  for (const byte of arr) bin += String.fromCharCode(byte);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(input: string): Uint8Array<ArrayBuffer> {
  const padLength = (4 - (input.length % 4)) % 4;
  const padded = input.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(padLength);
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/** Create a signed session token for the given user. */
export async function createSessionToken(user: SessionUser): Promise<string> {
  const nowSec = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    ...user,
    iat: nowSec,
    exp: nowSec + SESSION_MAX_AGE_SECONDS,
  };

  const payloadB64 = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await importKey(getSecret());
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadB64));

  return `${payloadB64}.${toBase64Url(signature)}`;
}

/** Verify a session token's signature and expiry. Returns the payload if valid, otherwise null. */
export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;

  const [payloadB64, sigB64] = token.split('.');
  if (!payloadB64 || !sigB64) return null;

  try {
    const key = await importKey(getSecret());
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      fromBase64Url(sigB64),
      new TextEncoder().encode(payloadB64)
    );
    if (!isValid) return null;

    const payload: SessionPayload = JSON.parse(new TextDecoder().decode(fromBase64Url(payloadB64)));
    if (payload.exp < Math.floor(Date.now() / 1000)) return null; // expired

    return payload;
  } catch {
    return null;
  }
}
