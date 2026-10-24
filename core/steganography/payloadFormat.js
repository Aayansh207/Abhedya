// core/steganography/payloadFormat.js
import { InvalidPayloadError } from "../errors.js";
import { HEADER_SIZE_BYTES } from "./capacity.js";
import { KDF_SALT_BYTES, AEAD_NONCE_BYTES } from "../crypto/keyDerivation.js";

export const MAGIC_BYTES = Buffer.from([0x41, 0x42, 0x48, 0x44]); // "ABHD"
export const CURRENT_FORMAT_VERSION = 0x01;
export const MAX_CIPHERTEXT_BYTES = 64 * 1024 * 1024; // 64 MB upper sanity limit
export const MIN_CIPHERTEXT_BYTES = 16; // Poly1305 authentication tag is 16 bytes

export const MODES = Object.freeze({
  BASIC: 0x00,
  SCATTERED: 0x01,
  DECOY_PRIMARY: 0x02,
  DECOY_SECONDARY: 0x03
});

export const AAD_HEADER_LENGTH = 10; // Magic (4) + Version (1) + Mode (1) + Length (4)

/**
 * Builds the 10-byte Additional Authenticated Data (AAD) prefix
 * bound into the AEAD Poly1305 tag.
 *
 * @param {object} params
 * @param {number} [params.version=CURRENT_FORMAT_VERSION]
 * @param {number} [params.mode=MODES.BASIC]
 * @param {number} params.ciphertextLength
 * @returns {Uint8Array}
 */
export function getHeaderAad({ version = CURRENT_FORMAT_VERSION, mode = MODES.BASIC, ciphertextLength }) {
  if (ciphertextLength === undefined || ciphertextLength < MIN_CIPHERTEXT_BYTES) {
    throw new InvalidPayloadError(`Invalid ciphertext length for AAD: ${ciphertextLength}`);
  }

  const aad = Buffer.alloc(AAD_HEADER_LENGTH);
  MAGIC_BYTES.copy(aad, 0);
  aad.writeUInt8(version, 4);
  aad.writeUInt8(mode, 5);
  aad.writeUInt32BE(ciphertextLength, 6);
  return new Uint8Array(aad.buffer, aad.byteOffset, aad.byteLength);
}

/**
 * Serializes payload fields into a versioned binary buffer.
 *
 * @param {object} params
 * @param {number} [params.version=CURRENT_FORMAT_VERSION]
 * @param {number} [params.mode=MODES.BASIC]
 * @param {Uint8Array} params.salt - 16 bytes
 * @param {Uint8Array} params.nonce - 24 bytes
 * @param {Uint8Array} params.ciphertext - Ciphertext including 16-byte tag
 * @returns {Uint8Array} Serialized binary payload
 */
export function serializePayload({
  version = CURRENT_FORMAT_VERSION,
  mode = MODES.BASIC,
  salt,
  nonce,
  ciphertext
}) {
  if (!salt || !(salt instanceof Uint8Array) || salt.length !== KDF_SALT_BYTES) {
    throw new InvalidPayloadError(`Salt must be a ${KDF_SALT_BYTES}-byte Uint8Array`);
  }
  if (!nonce || !(nonce instanceof Uint8Array) || nonce.length !== AEAD_NONCE_BYTES) {
    throw new InvalidPayloadError(`Nonce must be a ${AEAD_NONCE_BYTES}-byte Uint8Array`);
  }
  if (!ciphertext || !(ciphertext instanceof Uint8Array) || ciphertext.length < MIN_CIPHERTEXT_BYTES) {
    throw new InvalidPayloadError(
      `Ciphertext must be a Uint8Array of at least ${MIN_CIPHERTEXT_BYTES} bytes`
    );
  }
  if (ciphertext.length > MAX_CIPHERTEXT_BYTES) {
    throw new InvalidPayloadError(
      `Ciphertext length (${ciphertext.length}) exceeds maximum limit (${MAX_CIPHERTEXT_BYTES})`
    );
  }

  const ciphertextLength = ciphertext.length;
  const totalLength = HEADER_SIZE_BYTES + ciphertextLength;
  const buffer = Buffer.alloc(totalLength);

  // 1. Magic Signature (4 bytes)
  MAGIC_BYTES.copy(buffer, 0);

  // 2. Format Version (1 byte)
  buffer.writeUInt8(version, 4);

  // 3. Mode / Flags (1 byte)
  buffer.writeUInt8(mode, 5);

  // 4. Ciphertext Length (4 bytes, uint32BE)
  buffer.writeUInt32BE(ciphertextLength, 6);

  // 5. KDF Salt (16 bytes)
  Buffer.from(salt).copy(buffer, 10);

  // 6. AEAD Nonce (24 bytes)
  Buffer.from(nonce).copy(buffer, 26);

  // 7. Ciphertext (N bytes)
  Buffer.from(ciphertext).copy(buffer, HEADER_SIZE_BYTES);

  return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
}

/**
 * Parses and strictly validates a 50-byte payload header.
 *
 * @param {Uint8Array | Buffer} data
 * @returns {object} Parsed header fields
 */
export function parseHeader(data) {
  if (!data || data.length < HEADER_SIZE_BYTES) {
    throw new InvalidPayloadError(
      `Header data too short: expected at least ${HEADER_SIZE_BYTES} bytes, got ${data?.length || 0}`
    );
  }

  const buf = Buffer.isBuffer(data) ? data : Buffer.from(data.buffer, data.byteOffset, data.byteLength);

  // 1. Magic check
  if (!buf.subarray(0, 4).equals(MAGIC_BYTES)) {
    throw new InvalidPayloadError("Invalid magic signature: not an Abhedya payload");
  }

  // 2. Version check
  const version = buf.readUInt8(4);
  if (version !== CURRENT_FORMAT_VERSION) {
    throw new InvalidPayloadError(`Unsupported format version: 0x${version.toString(16)}`);
  }

  // 3. Mode check
  const mode = buf.readUInt8(5);

  // 4. Ciphertext Length check
  const ciphertextLength = buf.readUInt32BE(6);
  if (ciphertextLength < MIN_CIPHERTEXT_BYTES) {
    throw new InvalidPayloadError(
      `Invalid ciphertext length in header (${ciphertextLength} bytes); minimum is ${MIN_CIPHERTEXT_BYTES}`
    );
  }
  if (ciphertextLength > MAX_CIPHERTEXT_BYTES) {
    throw new InvalidPayloadError(
      `Ciphertext length in header (${ciphertextLength} bytes) exceeds maximum limit (${MAX_CIPHERTEXT_BYTES})`
    );
  }

  // 5. Salt (16 bytes)
  const salt = new Uint8Array(buf.subarray(10, 26));

  // 6. Nonce (24 bytes)
  const nonce = new Uint8Array(buf.subarray(26, 50));

  // 7. AAD prefix (first 10 bytes)
  const aad = new Uint8Array(buf.subarray(0, AAD_HEADER_LENGTH));

  return {
    magic: "ABHD",
    version,
    mode,
    ciphertextLength,
    salt,
    nonce,
    headerBytes: HEADER_SIZE_BYTES,
    totalPayloadBytes: HEADER_SIZE_BYTES + ciphertextLength,
    aad
  };
}

/**
 * Parses full payload buffer into header and extracted ciphertext.
 *
 * @param {Uint8Array | Buffer} data
 * @returns {object} { header, ciphertext, aad }
 */
export function parsePayload(data) {
  const header = parseHeader(data);
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(data.buffer, data.byteOffset, data.byteLength);

  if (buf.length < header.totalPayloadBytes) {
    throw new InvalidPayloadError(
      `Payload buffer truncated: expected ${header.totalPayloadBytes} bytes, got ${buf.length}`
    );
  }

  const ciphertext = new Uint8Array(
    buf.subarray(HEADER_SIZE_BYTES, HEADER_SIZE_BYTES + header.ciphertextLength)
  );

  return {
    header,
    ciphertext,
    aad: header.aad
  };
}
