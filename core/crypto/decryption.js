// core/crypto/decryption.js
import { getSodium, deriveEncryptionKey, KEY_BYTES, AEAD_NONCE_BYTES } from "./keyDerivation.js";
import { AuthenticationError } from "../errors.js";

/**
 * Decrypts a ciphertext using XChaCha20-Poly1305 authenticated decryption.
 * Fails safely if authentication tag verification fails.
 *
 * @param {Uint8Array} ciphertext - Ciphertext including 16-byte Poly1305 MAC tag
 * @param {Uint8Array} key - 32-byte derived key
 * @param {Uint8Array} nonce - 24-byte nonce
 * @param {Uint8Array} [aad] - Optional Additional Authenticated Data
 * @returns {Promise<Uint8Array>} Decrypted plaintext bytes
 */
export async function decryptRaw(ciphertext, key, nonce, aad = null) {
  if (!ciphertext || !(ciphertext instanceof Uint8Array)) {
    throw new AuthenticationError("Ciphertext must be a valid Uint8Array");
  }
  if (!key || !(key instanceof Uint8Array) || key.length !== KEY_BYTES) {
    throw new AuthenticationError(`Key must be a ${KEY_BYTES}-byte Uint8Array`);
  }
  if (!nonce || !(nonce instanceof Uint8Array) || nonce.length !== AEAD_NONCE_BYTES) {
    throw new AuthenticationError(`Nonce must be a ${AEAD_NONCE_BYTES}-byte Uint8Array`);
  }

  const s = await getSodium();

  try {
    return s.crypto_aead_xchacha20poly1305_ietf_decrypt(
      null,
      ciphertext,
      aad,
      nonce,
      key
    );
  } catch (_err) {
    // Fail safely without leaking cryptographic details
    throw new AuthenticationError("Authentication failed: invalid key, corrupt payload, or bad tag");
  }
}

/**
 * High-level decryption: derives key from password and salt, verifies authenticated ciphertext,
 * and recovers original plaintext UTF-8 string.
 *
 * @param {object} params
 * @param {Uint8Array} params.ciphertext - Ciphertext with authentication tag
 * @param {string} params.password - User passphrase
 * @param {Uint8Array} params.salt - 16-byte KDF salt
 * @param {Uint8Array} params.nonce - 24-byte AEAD nonce
 * @param {Uint8Array} [params.aad] - Optional Additional Authenticated Data
 * @param {object} [params.kdfOptions] - Optional Argon2id tuning
 * @returns {Promise<{ plaintext: string, plaintextBytes: Uint8Array }>}
 */
export async function decryptMessage({
  ciphertext,
  password,
  salt,
  nonce,
  aad = null,
  kdfOptions = {}
}) {
  const key = await deriveEncryptionKey(password, salt, kdfOptions);
  const plaintextBytes = await decryptRaw(ciphertext, key, nonce, aad);
  const s = await getSodium();

  try {
    const plaintext = s.to_string(plaintextBytes);
    return { plaintext, plaintextBytes };
  } catch (err) {
    throw new AuthenticationError(`Failed to decode plaintext as UTF-8 string: ${err.message}`);
  }
}
