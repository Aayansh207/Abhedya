// core/crypto/encryption.js
import { getSodium, deriveEncryptionKey, generateSalt, generateNonce, KEY_BYTES, AEAD_NONCE_BYTES } from "./keyDerivation.js";
import { AuthenticationError } from "../errors.js";

/**
 * Encrypts a message using XChaCha20-Poly1305 authenticated encryption.
 *
 * @param {string | Uint8Array} message - Plaintext message to encrypt
 * @param {Uint8Array} key - 32-byte derived encryption key
 * @param {Uint8Array} nonce - 24-byte random nonce
 * @param {Uint8Array} [aad] - Optional Additional Authenticated Data
 * @returns {Promise<Uint8Array>} Ciphertext including 16-byte Poly1305 authentication tag
 */
export async function encryptRaw(message, key, nonce, aad = null) {
  if (message === undefined || message === null) {
    throw new AuthenticationError("Message is required for encryption");
  }
  if (!key || !(key instanceof Uint8Array) || key.length !== KEY_BYTES) {
    throw new AuthenticationError(`Key must be a ${KEY_BYTES}-byte Uint8Array`);
  }
  if (!nonce || !(nonce instanceof Uint8Array) || nonce.length !== AEAD_NONCE_BYTES) {
    throw new AuthenticationError(`Nonce must be a ${AEAD_NONCE_BYTES}-byte Uint8Array`);
  }

  const s = await getSodium();
  const messageBytes = typeof message === "string" ? s.from_string(message) : message;

  try {
    return s.crypto_aead_xchacha20poly1305_ietf_encrypt(
      messageBytes,
      aad,
      null,
      nonce,
      key
    );
  } catch (err) {
    throw new AuthenticationError(`Encryption failed: ${err.message}`);
  }
}

/**
 * High-level encryption: derives key from password, generates salt/nonce if needed,
 * and performs authenticated encryption.
 *
 * @param {object} params
 * @param {string | Uint8Array} params.message - Plaintext message
 * @param {string} params.password - User passphrase
 * @param {Uint8Array} [params.salt] - Optional pre-generated 16-byte salt
 * @param {Uint8Array} [params.nonce] - Optional pre-generated 24-byte nonce
 * @param {Uint8Array} [params.aad] - Optional Additional Authenticated Data
 * @param {object} [params.kdfOptions] - Optional Argon2id tuning
 * @returns {Promise<{ ciphertext: Uint8Array, salt: Uint8Array, nonce: Uint8Array }>}
 */
export async function encryptMessage({
  message,
  password,
  salt,
  nonce,
  aad = null,
  kdfOptions = {}
}) {
  const chosenSalt = salt || (await generateSalt());
  const chosenNonce = nonce || (await generateNonce());
  const key = await deriveEncryptionKey(password, chosenSalt, kdfOptions);

  const ciphertext = await encryptRaw(message, key, chosenNonce, aad);

  return {
    ciphertext,
    salt: chosenSalt,
    nonce: chosenNonce
  };
}
