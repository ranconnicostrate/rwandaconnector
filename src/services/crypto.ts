/**
 * Password hashing and token generation.
 *
 * Runs in the browser via SubtleCrypto: PBKDF2-SHA256, 150k iterations, random
 * 16-byte salt per user. Plain-text passwords are never stored or logged.
 */

const ITERATIONS = 150_000;
const KEY_LENGTH = 32;

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer)).
  map((b) => b.toString(16).padStart(2, '0')).
  join('');
}

export function randomHex(bytes = 16): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr).
  map((b) => b.toString(16).padStart(2, '0')).
  join('');
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    KEY_LENGTH * 8
  );
  return toHex(bits);
}

export async function verifyPassword(
password: string,
salt: string,
expectedHash: string)
: Promise<boolean> {
  const hash = await hashPassword(password, salt);
  // Constant-time-ish comparison.
  if (hash.length !== expectedHash.length) return false;
  let diff = 0;
  for (let i = 0; i < hash.length; i += 1) diff |= hash.charCodeAt(i) ^ expectedHash.charCodeAt(i);
  return diff === 0;
}