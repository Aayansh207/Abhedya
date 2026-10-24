# Security Architecture & Threat Model

## 1. Cryptographic Principles

- **Password Key Derivation:**
  - Password hashing uses Argon2id (`crypto_pwhash_ALG_ARGON2ID13`) via `libsodium-wrappers`.
  - Memory and CPU limits: `crypto_pwhash_OPSLIMIT_INTERACTIVE` and `crypto_pwhash_MEMLIMIT_INTERACTIVE`.
  - 16-byte cryptographically secure random salt generated fresh for every encryption.
  - Zero password reuse as keys: passwords are never stored or used directly.

- **Authenticated Encryption:**
  - Standard: XChaCha20-Poly1305 (`crypto_aead_xchacha20poly1305_ietf`).
  - 192-bit (24-byte) random nonce eliminates nonce-reuse risks.
  - 128-bit Poly1305 authentication tag provides existential unforgeability under chosen-ciphertext attack (IND-CCA2).
  - Additional Authenticated Data (AAD): The 10-byte header prefix is bound into the Poly1305 tag, preventing tampering of metadata (version, mode, length).

- **Domain Separation:**
  - Encryption key (`K_encrypt`) and embedding scatter key (`K_embed`) are derived independently using distinct domain tags.
  - An attacker who discovers or tests embedding positions cannot forge or decrypt ciphertexts without solving Argon2id.

---

## 2. Steganographic Integrity & Scattering

- **Deterministic Key-Seeded Scattering:**
  - Mode `scattered` uses a cryptographically secure pseudo-random permutation (ChaCha20-based Fisher-Yates shuffle with rejection sampling).
  - Positions are uniform and collision-free.
  - Header bits are also scattered pseudorandomly; no fixed pixel headers exist in scattered mode, making simple localized LSB inspection impossible.

- **Plausible Deniability / Decoy Mode:**
  - Dual carrier embedding partitions eligible pixel channels into non-overlapping sets.
  - The primary holder cannot decrypt or see the decoy message.
  - The decoy holder cannot decrypt or see the primary message.
  - Extraction without the correct password yields noise and fails authentication cleanly.

---

## 3. Defense in Depth & Error Handling

- **Uniform Failure Surface:**
  - Incorrect passwords, missing payloads, truncated bits, and corrupted ciphertexts return the same generic error string to the user.
  - No timing or error-type side channels are exposed to the UI layer.

- **Resource & Memory Bounds:**
  - Decoded image dimensions are capped at 8,192 x 8,192 pixels (64 Megapixels).
  - Input file size capped at 100 MB.
  - Ciphertext length is validated against both image capacity and safe maximums before buffer allocation.

- **Confidentiality in Memory:**
  - Passwords, keys, and decrypted plaintext buffers are not logged or cached globally.
