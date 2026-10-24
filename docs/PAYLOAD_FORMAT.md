# Abhedya Binary Payload Format Specification (v1.0)

**Status:** Frozen / Approved  
**Owners:** Member 1 & Member 2  
**Format Version:** `0x01`

---

## 1. Overview

Abhedya embeds encrypted data into the least-significant bits (LSB) of uncompressed 24/32-bit RGB image pixels. To ensure cryptographic integrity, version adaptability, and protection against unauthorized extraction, every embedded payload follows this standardized binary format before bit-level serialization.

---

## 2. Binary Layout

A valid Abhedya v1 payload consists of a fixed **50-byte Header** followed by a variable-length **Ciphertext** (with integrated Poly1305 authentication tag):

```text
+-------------------+---------+--------+-------------------+
| Field Name        | Offset  | Size   | Encoding / Type   |
+-------------------+---------+--------+-------------------+
| Magic Signature   | 0x00    | 4 B    | ASCII: "ABHD"     |
| Format Version    | 0x04    | 1 B    | uint8 (0x01)      |
| Mode / Flags      | 0x05    | 1 B    | uint8 bitfield    |
| Ciphertext Length | 0x06    | 4 B    | uint32 BE         |
| KDF Salt          | 0x0A    | 16 B   | Raw bytes         |
| AEAD Nonce        | 0x1A    | 24 B   | Raw bytes         |
| Ciphertext + Tag  | 0x32    | N B    | Raw bytes         |
+-------------------+---------+--------+-------------------+
Total Header Size: 50 bytes (400 bits)
Total Payload Size: 50 + N bytes
```

### Field Definitions

1. **Magic Signature (`4 bytes`)**:
   - Exact byte sequence: `0x41, 0x42, 0x48, 0x44` (ASCII `"ABHD"`).
   - Serves as an initial sanity check during extraction. Extraction aborts if magic does not match.

2. **Format Version (`1 byte`)**:
   - Current version: `0x01`.
   - Payloads with unknown versions are rejected immediately.

3. **Mode / Flags (`1 byte`)**:
   - `Bit 0` (Embedding mode):
     - `0` = `BASIC` (Sequential LSB)
     - `1` = `SCATTERED` (Key-seeded pseudorandom permutation)
   - `Bit 1-2` (Carrier type):
     - `00` = `STANDARD` (Single message)
     - `01` = `DECOY_PRIMARY` (Dual carrier - primary payload)
     - `10` = `DECOY_SECONDARY` (Dual carrier - decoy payload)
   - `Bits 3-7`: Reserved for future use (must be set to `0`).

4. **Ciphertext Length (`4 bytes`, uint32 Big-Endian)**:
   - Length $N$ in bytes of the following `Ciphertext + Tag` field.
   - Strict bounds: `16 <= N <= MAX_PAYLOAD_BYTES` ($2^{26} \approx 64\text{ MB}$, and $\le \text{image capacity}$).
   - Because libsodium XChaCha20-Poly1305 appends a 16-byte Poly1305 authentication tag, $N = \text{plaintext\_bytes} + 16$.

5. **KDF Salt (`16 bytes`)**:
   - Cryptographically secure random 16 bytes generated per encryption via `sodium.randombytes_buf(16)`.
   - Used as the salt input to Argon2id (`crypto_pwhash`) to derive the 32-byte encryption key.

6. **AEAD Nonce (`24 bytes`)**:
   - Cryptographically secure random 24 bytes generated via `sodium.randombytes_buf(24)`.
   - Nonce for XChaCha20-Poly1305 (`crypto_aead_xchacha20poly1305_ietf`).

7. **Ciphertext + Authentication Tag (`N bytes`)**:
   - Output of `crypto_aead_xchacha20poly1305_ietf_encrypt`.
   - Additional Authenticated Data (AAD): The 10-byte header prefix (Magic + Version + Flags + Length). This cryptographically binds the header fields to the ciphertext, preventing header tampering.
   - The final 16 bytes contain the Poly1305 MAC tag.

---

## 3. Overhead and Capacity Calculations

- Fixed Header Size: `50 bytes`
- Authentication Tag: `16 bytes`
- **Total Overhead:** `66 bytes` ($528\text{ bits}$).
- For an image with dimensions $W \times H$ and 3 eligible channels (R, G, B):
  $$\text{RawByteCapacity} = \left\lfloor\frac{W \times H \times 3}{8}\right\rfloor$$
  $$\text{MaxCiphertextBytes} = \max(0, \text{RawByteCapacity} - 50)$$
  $$\text{MaxPlaintextBytes} = \max(0, \text{RawByteCapacity} - 66)$$

---

## 4. Bit-Order Serialization

- Bytes are serialized to bits in **Most Significant Bit (MSB) first** order:
  Byte $B$: bit 7, bit 6, bit 5, bit 4, bit 3, bit 2, bit 1, bit 0.
- Bit stream is mapped 1:1 onto the LSB of eligible pixel channels:
  `p' = (p & 0xFE) | (b & 0x01)`
