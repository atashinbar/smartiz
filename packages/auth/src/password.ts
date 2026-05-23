const ITERATIONS = 100_000;
const HASH_LENGTH = 64;
const SALT_LENGTH = 32;

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function deriveKey(password: string, salt: Uint8Array): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  return crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    HASH_LENGTH * 8
  );
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const hash = await deriveKey(password, salt);
  return `${toHex(salt.buffer as ArrayBuffer)}:${toHex(hash)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, expectedHashHex] = stored.split(":");
  if (!saltHex || !expectedHashHex) return false;

  const match = saltHex.match(/.{2}/g);
  if (!match) return false;
  const salt = new Uint8Array(match.map((byte) => parseInt(byte, 16)));
  const hash = await deriveKey(password, salt);
  const hashHex = toHex(hash);

  if (hashHex.length !== expectedHashHex.length) return false;
  let result = 0;
  for (let i = 0; i < hashHex.length; i++) {
    result |= hashHex.charCodeAt(i) ^ expectedHashHex.charCodeAt(i);
  }
  return result === 0;
}
