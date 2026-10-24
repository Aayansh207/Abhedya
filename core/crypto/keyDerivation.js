// core/crypto/keyDerivation.js
import sodium from "libsodium-wrappers-sumo";
import { AuthenticationError } from "../errors.js";

/**
 * Ensures libsodium is initialized and ready for cryptographic operations.
 */
export async function getSodium() {
  await sodium.ready;
  return sodium;
}

export const KDF_SALT_BYTES = 16;
export const AEAD_NONCE_BYTES = 24;
export const KEY_BYTES = 32;

/**
 * Generates a cryptographically secure random salt for Argon2id KDF.
 *
 * @returns {Promise<Uint8Array>} 16-byte random salt
 */
export async function generateSalt() {
  const s = await getSodium();
  return s.randombytes_buf(KDF_SALT_BYTES);
}

/**
 * Generates a cryptographically secure random nonce for XChaCha20-Poly1305.
 *
 * @returns {Promise<Uint8Array>} 24-byte random nonce
 */
export async function generateNonce() {
  const s = await getSodium();
  return s.randombytes_buf(AEAD_NONCE_BYTES);
}

/**
 * Derives a 32-byte encryption key from a user password and random salt using Argon2id.
 *
 * @param {string} password - User passphrase
 * @param {Uint8Array} salt - 16-byte random salt
 * @param {object} [options] - Optional custom opslimit/memlimit for tests or specific profiles
 * @returns {Promise<Uint8Array>} 32-byte derived key
 */
export async function deriveEncryptionKey(password, salt, options = {}) {
  if (!password || typeof password !== "string") {
    throw new AuthenticationError("Password must be a non-empty string");
  }
  if (!salt || !(salt instanceof Uint8Array) || salt.length !== KDF_SALT_BYTES) {
    throw new AuthenticationError(`Salt must be a ${KDF_SALT_BYTES}-byte Uint8Array`);
  }

  const s = await getSodium();
  const opslimit = options.opslimit || s.crypto_pwhash_OPSLIMIT_INTERACTIVE;
  const memlimit = options.memlimit || s.crypto_pwhash_MEMLIMIT_INTERACTIVE;

  try {
    return s.crypto_pwhash(
      KEY_BYTES,
      password,
      salt,
      opslimit,
      memlimit,
      s.crypto_pwhash_ALG_ARGON2ID13
    );
  } catch (err) {
    throw new AuthenticationError(`Key derivation failed: ${err.message}`);
  }
}

/**
 * Derives a 32-byte deterministic embedding key for keyed position scattering.
 * Uses Blake2b generichash with strict domain separation and image geometry binding.
 *
 * @param {string} password - User passphrase
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {string} [domain="ABHEDYA_EMBED_V1"] - Domain separation tag
 * @returns {Promise<Uint8Array>} 32-byte derived embedding key
 */
export async function deriveEmbeddingKey(password, width, height, domain = "ABHEDYA_EMBED_V1") {
  if (!password || typeof password !== "string") {
    throw new AuthenticationError("Password must be a non-empty string");
  }

  const s = await getSodium();
  const message = `${domain}:${width}x${height}:${password}`;
  return s.crypto_generichash(KEY_BYTES, s.from_string(message));
}
