# Architecture and Shared Decisions

## 1. Logical Flow

```text
Hide Message Flow:
[User Request / UI]
       │
       ▼
[Electron Main / IPC Layer]
       │
       ▼
[core/image/validate.js & decode.js] ──> Raw RGBA Pixel Buffer + Dimensions
       │
       ▼
[core/steganography/capacity.js] ──────> Verify capacity >= message overhead
       │
       ▼
[core/crypto/keyDerivation.js] ────────> Argon2id (K_encrypt) + Blake2b/KDF (K_embed)
       │
       ▼
[core/crypto/encryption.js] ───────────> XChaCha20-Poly1305 with random salt & nonce
       │
       ▼
[core/steganography/payloadFormat.js] ─> Serialize 50-byte Header + Ciphertext
       │
       ▼
[core/steganography/embed.js] ─────────> Basic (Sequential) or Key-Seeded Scattering
       │
       ▼
[core/image/encode.js] ────────────────> Lossless PNG Buffer / File Output
```

```text
Reveal Message Flow:
[User Request / UI with Password]
       │
       ▼
[core/image/decode.js] ────────────────> Raw RGBA Pixel Buffer
       │
       ▼
[core/steganography/positionGenerator] ─> Deterministic scatter positions from K_embed
       │
       ▼
[core/steganography/extract.js] ───────> Read candidate 50-byte Header
       │
       ▼
[core/steganography/payloadFormat.js] ─> Parse & validate magic, version, length
       │
       ▼
[core/steganography/extract.js] ───────> Read remaining ciphertext bits
       │
       ▼
[core/crypto/keyDerivation.js] ────────> Derive K_encrypt from password + extracted salt
       │
       ▼
[core/crypto/decryption.js] ───────────> Authenticated decryption (XChaCha20-Poly1305)
       │
       ▼
[Plaintext String] ─────────────────────> Return only upon successful authentication
```

---

## 2. Shared Interface Contracts

### 2.1 Core API Functions (`core/index.js`)

```js
// 1. Capacity Estimation
export async function estimateCapacity({
  imagePath,      // Optional: string path
  imageBuffer,    // Optional: Buffer / Uint8Array
  width,          // Optional: number
  height,         // Optional: number
  mode = "basic"  // "basic" | "scattered" | "decoy"
}) // -> CapacityReport

// 2. Hide Message
export async function hideMessage({
  imagePath,      // Optional: string input path
  imageBuffer,    // Optional: Buffer / Uint8Array input
  outputPath,     // Optional: string output file path
  message,        // string (UTF-8)
  password,       // string
  mode = "basic", // "basic" | "scattered"
  options = {}    // Optional parameters
}) // -> { success: true, pngBuffer, outputPath, stats }

// 3. Reveal Message
export async function revealMessage({
  imagePath,      // Optional: string input path
  imageBuffer,    // Optional: Buffer / Uint8Array input
  password,       // string
  mode = "auto"   // "auto" | "basic" | "scattered" | "decoy"
}) // -> { success: true, message, mode, stats }

// 4. Decoy Embedding
export async function hideDecoyMessages({
  imagePath,
  imageBuffer,
  outputPath,
  primary: { message: primaryMessage, password: primaryPassword },
  decoy: { message: decoyMessage, password: decoyPassword }
}) // -> { success: true, pngBuffer, outputPath, stats }

// 5. Steganalysis
export async function runSteganalysis({
  imagePath,
  imageBuffer,
  tests = ["chiSquare", "rsAnalysis"]
}) // -> SteganalysisReport
```

---

## 3. Image Representation & Boundaries

- **Buffer Format:** Raw uncompressed RGBA pixel buffer (`Uint8Array`/`Buffer`), 4 bytes per pixel: `[R, G, B, A, R, G, B, A, ...]`.
- **Eligible Channels:** Red, Green, and Blue channels (indices `0, 1, 2` per pixel).
- **Alpha Channel (index `3`):** Never modified; preserved at full opacity/original value to prevent PNG transparency re-encoding artifacts.
- **Maximum Dimension Limits:**
  - Max width/height: 8,192 x 8,192 px.
  - Max total pixels: 67,108,864 px (64 Megapixels).
  - Max file size: 100 MB.
- **Output:** Always lossless PNG. Never export as JPEG or lossy WebP.

---

## 4. Key Derivation & Domain Separation

- **Encryption Key (`K_encrypt`):**
  Derived via `sodium.crypto_pwhash` (Argon2id13) with a per-payload 16-byte random salt.
- **Embedding Key (`K_embed`):**
  Derived via `sodium.crypto_generichash(32, password, "ABHEDYA_EMBED_V1" || W || "x" || H)`.
  This allows deterministic pseudo-random scatter position generation without needing to read the random salt first.

---

## 5. Security & Error Policy

- **Generic User-Facing Error:**
  Any authentication failure, missing payload, corrupt header, or wrong password produces:
  `"Failed to reveal message. The image may not contain a hidden message, the payload may be corrupted, or the password was incorrect."`
- **Internal Error Classes:** Detailed errors are retained internally for tests and debugging (`AuthenticationError`, `InvalidPayloadError`, `CapacityExceededError`, `ImageValidationError`).
