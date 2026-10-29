# Abhedya — The Vishanti Cipher

<p align="center">
  <img src="src/assets/logo.png" alt="Abhedya Logo" width="120" onerror="this.style.display='none'"/>
</p>

<p align="center">
  <strong>Local-First, Cross-Platform Desktop Steganography & Cryptographic Suite</strong><br>
  <em>Conceal authenticated, encrypted payloads inside ordinary digital images with zero cloud dependency.</em>
</p>

<p align="center">
  <a href="#test-suite"><img src="https://img.shields.io/badge/tests-67%20passed-brightgreen?style=flat-square" alt="Tests"></a>
  <a href="#system-requirements"><img src="https://img.shields.io/badge/node-%3E%3D18.0.0-blue?style=flat-square" alt="Node Version"></a>
  <a href="#desktop-packaging"><img src="https://img.shields.io/badge/electron-v45-blueviolet?style=flat-square" alt="Electron Version"></a>
  <a href="#cryptographic-specifications"><img src="https://img.shields.io/badge/cryptography-libsodium--sumo-red?style=flat-square" alt="Libsodium"></a>
  <a href="#event-details"><img src="https://img.shields.io/badge/Softablitz%202026-Team%20175-orange?style=flat-square" alt="Event"></a>
</p>

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Core Capabilities & Requirements](#2-core-capabilities--requirements)
   - [Basic Requirements (B1 – B5)](#basic-requirements-b1--b5)
   - [Advanced Capabilities (A1 – A2)](#advanced-capabilities-a1--a2)
3. [Binary Payload Wire Format (v1.0)](#3-binary-payload-wire-format-v10)
4. [System Architecture & Data Flows](#4-system-architecture--data-flows)
   - [Architectural Topology](#architectural-topology)
   - [Hide & Reveal Execution Flows](#hide--reveal-execution-flows)
5. [Installation & Setup Instructions](#5-installation--setup-instructions)
   - [System Prerequisites](#system-prerequisites)
   - [Step-by-Step Installation](#step-by-step-installation)
   - [Running the Desktop App in Development](#running-the-desktop-app-in-development)
   - [Production Builds & Desktop Packaging](#production-builds--desktop-packaging)
6. [Usage Guide](#6-usage-guide)
   - [Hiding a Secret Message](#hiding-a-secret-message)
   - [Revealing a Hidden Message](#revealing-a-hidden-message)
   - [Decoy Embedding (Plausible Deniability)](#decoy-embedding-plausible-deniability)
   - [Steganalysis Forensic Lab](#steganalysis-forensic-lab)
7. [Testing & Quality Assurance](#7-testing--quality-assurance)
8. [Project Structure](#8-project-structure)
9. [Security Architecture & Threat Model](#9-security-architecture--threat-model)
10. [Event Information & Team Credits](#10-event-information--team-credits)

---

## 1. Executive Summary

**Abhedya** (अभ्येद्य — *Invulnerable / Impenetrable*) is a defense-grade desktop application engineered for the **Softablitz 2026** *Vishanti Cipher* challenge. It pairs modern authenticated cryptography with least-significant-bit (LSB) image steganography, non-linear pseudorandom scattering, plausible deniability decoys, and embedded statistical steganalysis.

Unlike conventional steganography utilities that simply inject plaintext bits into image rasters, Abhedya treats the image as an untrusted, public communication channel:
- **Zero Cloud Footprint:** 100% offline, local-first workstation execution. No analytics, external servers, or network calls.
- **Encrypt-Before-Embed:** Every message undergoes authenticated encryption (**XChaCha20-Poly1305**) keyed through memory-hard **Argon2id** password derivation before touching pixel buffers.
- **Key-Seeded Scattering:** Cryptographically secure PRNG permutation eliminates linear scanlines, distributing bits across spatial pixel channels.
- **Dual-Carrier Decoy Channels:** Provides plausible deniability by supporting primary and decoy passphrases within disjoint partitions of the same image.
- **Uniform Failure Surface:** Extraction failures return identical generic errors, preventing side-channel leakage regarding whether a payload exists.

---

## 2. Core Capabilities & Requirements

### Basic Requirements (B1 – B5)

| Requirement | Specification | Implementation in Abhedya |
|---|---|---|
| **B1. Cross-Platform Desktop** | Windows, macOS, Linux desktop binary targets. | Packaged via Electron and `electron-builder` producing macOS `.dmg`, Windows `.exe` (NSIS), and Linux `.AppImage`. |
| **B2. Authenticated Encryption** | Encrypt before embedding with password-derived keys. | **Argon2id** (`crypto_pwhash`) key derivation with fresh 16-byte random salts; **XChaCha20-Poly1305** AEAD with fresh 24-byte nonces; 10-byte header bound via Additional Authenticated Data (AAD). |
| **B3. Indistinguishable Safe Failures** | Uniform, non-revealing errors on invalid password/payload. | Strict uniform failure response (`USER_FACING_REVEAL_ERROR`). Never leaks whether a payload is present, truncated, or failed MAC check. |
| **B4. Accurate Capacity Calculation** | Dynamic payload calculation accounting for overhead. | Real-time byte calculation distinguishing raw carrier bit capacity from net usable space after framing overhead ($50\text{ B header} + 16\text{ B MAC tag} = 66\text{ B overhead}$). Rejects oversized inputs safely. |
| **B5. Lossless Preservation** | Image format preservation to prevent bit degradation. | Sharp-powered lossless PNG encoding with optional compression control (level 9). Rejects lossy inputs upon extraction with explicit user warnings. |

### Advanced Capabilities (A1 – A2)

- **A1. Key-Derived Pseudorandom Scattering:**
  - ChaCha20-based cryptographically secure PRNG with rejection sampling and Fisher-Yates shuffle.
  - Generates uniform, collision-free, deterministic bit coordinates seeded from $(K_{\text{embed}} \parallel W \parallel H)$.
  - Header and ciphertext bits are dispersed across non-linear spatial coordinates, defeating localized LSB visual attacks and linear spatial extractors.
- **A1. Statistical Steganalysis Lab:**
  - **Chi-Square ($\chi^2$) Pair-of-Values (PoV) Test:** Evaluates adjacent pixel intensity pairings ($2k, 2k+1$) with Wilson-Hilferty normal distribution approximation to calculate $p$-value and anomaly density.
  - **RS Steganalysis (Fridrich-Goljan-Du):** Classifies pixel groups into Regular ($R$), Singular ($S$), and Unusable ($U$) under flipping masks $M = [0, 1, 1, 0]$ and $-M$, estimating embedded payload ratio $p$.
  - **Comparative Differential Mode:** Allows side-by-side analysis of virgin cover images versus stego carrier images.
- **A2. Decoy Messages & Multi-Carrier Mode (Plausible Deniability):**
  - **Dual Carrier Decoy:** Encodes a legitimate secret under Passphrase A and a harmless decoy message under Passphrase B in disjoint, non-overlapping channel sets. Passphrase A decrypts only the real secret; Passphrase B decrypts only the decoy.
  - **Multi-Carrier Partitions:** Supports embedding 2 to 4 isolated payloads into distinct channel partitions under separate passphrases.

---

## 3. Binary Payload Wire Format (v1.0)

Every payload embedded into an image follows the standardized, tamper-evident Abhedya v1.0 binary wire layout:

```text
+-------------------+---------+--------+---------------------------------------+
| Field Name        | Offset  | Size   | Description                           |
+-------------------+---------+--------+---------------------------------------+
| Magic Signature   | 0x00    | 4 B    | ASCII: "ABHD" (0x41, 0x42, 0x48, 0x44)|
| Format Version    | 0x04    | 1 B    | uint8: 0x01                           |
| Mode / Flags      | 0x05    | 1 B    | Bit 0: Mode (0=Basic, 1=Scattered)    |
|                   |         |        | Bits 1-2: Carrier (0=Std, 1=Pri, 2=Dec)|
| Ciphertext Length | 0x06    | 4 B    | uint32 Big-Endian (N bytes)           |
| KDF Salt          | 0x0A    | 16 B   | Cryptographic random salt for Argon2id|
| AEAD Nonce        | 0x1A    | 24 B   | Random nonce for XChaCha20-Poly1305   |
| Ciphertext + Tag  | 0x32    | N B    | AEAD Ciphertext + 16-byte Poly1305 MAC|
+-------------------+---------+--------+---------------------------------------+
Total Header Overhead: 50 bytes (400 bits)
Total Framing Overhead: 66 bytes (528 bits) [50 B Header + 16 B Poly1305 MAC]
```

### Framing & Capacity Formula
For an image with width $W$ and height $H$ with 3 active color channels (Red, Green, Blue):
$$\text{RawByteCapacity} = \left\lfloor\frac{W \times H \times 3}{8}\right\rfloor$$
$$\text{MaxPlaintextCapacity} = \max(0, \text{RawByteCapacity} - 66)$$

### Bit Mapping
Bytes are converted to bit streams in **Most Significant Bit (MSB) first** order and mapped 1:1 onto channel LSBs:
$$p' = (p \ \& \ 0xFE) \mid (b \ \& \ 0x01)$$

---

## 4. System Architecture & Data Flows

### Architectural Topology

```text
┌────────────────────────────────────────────────────────┐
│               React HUD User Interface                 │
│   (Overview • Hide • Extract • Steganalysis • Audit)   │
└───────────────────────────┬────────────────────────────┘
                            │ window.electronAPI (contextBridge)
┌───────────────────────────▼────────────────────────────┐
│              Electron Preload & IPC Layer              │
│      contextIsolation: true • nodeIntegration: false   │
│      Strict CSP • Native File Dialogs • Input Bounds   │
└───────────────────────────┬────────────────────────────┘
                            │ Validated IPC Calls
┌───────────────────────────▼────────────────────────────┐
│                  Abhedya Core Engine                   │
│  ┌───────────────────────┐   ┌──────────────────────┐  │
│  │   Image Processing    │   │ Cryptographic Core   │  │
│  │   (Sharp Pipeline)    │   │ (Libsodium Argon2id  │  │
│  │   PNG/JPEG/WebP/BMP   │   │  XChaCha20-Poly1305) │  │
│  └───────────┬───────────┘   └──────────┬───────────┘  │
│              └─────────────┬────────────┘              │
│                            │                           │
│  ┌─────────────────────────▼────────────────────────┐  │
│  │       Steganography & Steganalysis Codecs        │  │
│  │  - Sequential & Key-Seeded Scatter Embedding     │  │
│  │  - Decoy & Multi-Carrier Channel Partitioning   │  │
│  │  - Chi-Square PoV & RS Steganalysis Engine       │  │
│  └─────────────────────────┬────────────────────────┘  │
└────────────────────────────┼───────────────────────────┘
                             │
                             ▼
               Lossless PNG on Local Filesystem
```

### Hide & Reveal Execution Flows

```text
Hide Message Flow:
User Input ──> Validate Image Bounds ──> Calculate Capacity ──>
Argon2id Key Derivation (K_encrypt, K_embed) ──> XChaCha20-Poly1305 Encrypt ──>
Serialize 50-byte Header ──> ChaCha20 PRNG Scattering ──> Encode PNG (Sharp) ──> Export File

Reveal Message Flow:
Selected PNG ──> Decode Image to RGBA ──> Generate Scatter Coordinates from Password ──>
Extract Header (Magic check) ──> Extract Ciphertext ──>
Argon2id Key Derivation ──> Authenticated Decrypt (Verify Poly1305 Tag) ──>
Output Exact Plaintext (or Uniform Failure on MAC/Key Mismatch)
```

---

## 5. Installation & Setup Instructions

### System Prerequisites

Abhedya runs locally on desktop operating systems (macOS, Windows, Linux). Ensure your system meets these prerequisites:

- **Node.js:** `v18.0.0` or higher (`v20.x` or `v22.x` LTS recommended; tested up to Node 24).
- **npm:** `v9.0.0` or higher (bundled with Node.js).
- **C/C++ Build Essentials** (required by native modules like `sharp`):
  - **macOS:** Xcode Command Line Tools (`xcode-select --install`).
  - **Linux (Ubuntu/Debian):** `sudo apt update && sudo apt install build-essential python3`.
  - **Windows:** Visual Studio C++ Build Tools or `npm install --global windows-build-tools`.

### Step-by-Step Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/Abhedya.git
   cd Abhedya
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Verify the installation:**
   Run the test suite to ensure native bindings (`libsodium`, `sharp`) compile and execute cleanly:
   ```bash
   npm test
   ```
   *All 67 tests across 13 test suites should pass.*

### Running the Desktop App in Development

Abhedya uses Vite for fast hot-module-replacement (HMR) paired concurrently with Electron:

```bash
npm run dev
```

This starts:
1. Vite dev server on `http://localhost:5173`.
2. Electron desktop window once the dev server is ready.

> **Tip:** To test the frontend directly in a web browser without Electron native dialogs:
> ```bash
> npx vite
> ```
> *The application automatically degrades gracefully, utilizing browser memory file buffers when outside Electron.*

### Production Builds & Desktop Packaging

To compile and package the desktop client into standalone executables:

1. **Build frontend assets:**
   ```bash
   npm run build
   ```
   *Compiles Vite React bundle into `dist/`.*

2. **Package unpacked application directory:**
   ```bash
   npm run pack
   ```
   *Generates an unpacked platform-native executable inside `release/`.*

3. **Generate complete standalone installers:**
   ```bash
   npm run dist
   ```
   *Produces distributables in the `release/` directory:*
   - **macOS:** `Abhedya-0.1.0.dmg`
   - **Windows:** `Abhedya-Setup-0.1.0.exe` (NSIS)
   - **Linux:** `Abhedya-0.1.0.AppImage`

---

## 6. Usage Guide

### Hiding a Secret Message

1. Navigate to the **Hide Message** tab (`02`).
2. **Select Carrier Image:** Drop or browse for a PNG, JPEG, WebP, or BMP file (max 50 MB, up to 8192×8192 px).
3. **Inspect Capacity:** Observe the real-time capacity meter displaying total bits, available bytes, and usable plaintext space.
4. **Enter Plaintext Secret:** Type or paste your confidential text. The capacity meter updates dynamically.
5. **Set Passphrase:** Enter a strong passphrase (minimum 8 characters).
6. **Select Mode:**
   - **Scattered (Recommended):** Uses ChaCha20 PRNG to disperse bits uniformly across spatial pixel channels.
   - **Sequential:** Traditional sequential LSB embedding.
7. **Click "Encrypt & Embed Message":** Once processed, preview the carrier and save the resulting lossless `.png` file.

### Revealing a Hidden Message

1. Navigate to the **Extract Message** tab (`03`).
2. **Select Carrier Image:** Select the stego PNG image.
3. **Enter Passphrase:** Supply the passphrase used during encryption.
4. **Click "Extract & Decrypt Payload":**
   - **Success:** The authenticated original message is displayed inside a secure text container with a one-click copy button.
   - **Failure:** If the passphrase is incorrect or the image is unencoded/tampered with, a safe uniform error message is shown without revealing internal details.

### Decoy Embedding (Plausible Deniability)

For scenarios involving coercion or dual-access control:
- Use the **Decoy Mode** to embed two distinct messages:
  - **Primary Secret** bound to **Primary Passphrase**.
  - **Decoy Message** bound to **Decoy Passphrase**.
- When revealed, entering the Decoy Passphrase only extracts the harmless decoy message, with no cryptographic or structural evidence of the primary secret.

### Steganalysis Forensic Lab

Abhedya includes an integrated forensic analysis suite (`04`):
- **Chi-Square PoV:** Tests whether the distribution of pairs of values deviates from expected natural image entropy.
- **RS Steganalysis:** Measures the relative group proportion of Regular vs. Singular pixel blocks under spatial flipping masks.
- **Differential Inspection:** Compare an original image with its stego counterpart to evaluate visual and statistical undetectability.

---

## 7. Testing & Quality Assurance

Abhedya maintains comprehensive automated unit, integration, and round-trip tests via **Vitest**:

```bash
# Run all tests once
npm test

# Run tests in watch mode during development
npm run test:watch
```

### Test Coverage Summary (13 Test Suites / 67 Tests)

- `tests/crypto.test.js`: Verifies Argon2id key derivation, XChaCha20-Poly1305 encryption/decryption, nonce handling, and AAD tamper prevention.
- `tests/payloadFormat.test.js`: Validates 50-byte header serialization, magic signature checking, length validation, and bit conversions.
- `tests/embedding.test.js` & `tests/extraction.test.js`: Validates LSB bit encoding/decoding across RGB channels.
- `tests/capacity.test.js`: Verifies accurate calculation of raw bit capacity and 66-byte framing overhead.
- `tests/roundTrip.test.js`: Validates full end-to-end hide $\to$ save $\to$ reveal workflows in both basic and scattered modes.
- `tests/decoy.test.js`: Verifies dual-carrier decoy and multi-carrier partitioned isolation.
- `tests/wrongPassword.test.js`: Confirms uniform failure reporting on invalid passwords or corrupted bytes.
- `tests/steganalysis.test.js`: Tests Chi-Square PoV and RS Steganalysis metric calculations.
- `tests/unit/fileValidation.test.js`: Verifies file size, dimension bounds, and magic byte file sanitization.
- `tests/unit/imageSaving.test.js`: Confirms PNG output enforcement.
- `tests/unit/ipcContract.test.js`: Validates Electron IPC channel contracts.
- `tests/integration/electronCoreIntegration.test.js`: Validates full IPC-to-Core round trips.

---

## 8. Project Structure

```text
Abhedya/
├── core/                           # Pure Core Steganography & Crypto Engine
│   ├── advanced/                   # Decoy & multi-carrier partition implementations
│   │   ├── decoyMode.js
│   │   └── multiMessage.js
│   ├── analysis/                   # Statistical steganalysis analyzers
│   │   ├── chiSquare.js            # Chi-Square PoV & Wilson-Hilferty transformation
│   │   └── rsAnalysis.js           # Fridrich-Goljan RS Steganalysis
│   ├── crypto/                     # Cryptographic primitives (Libsodium)
│   │   ├── decryption.js           # XChaCha20-Poly1305 decryption & MAC verification
│   │   ├── encryption.js           # XChaCha20-Poly1305 AEAD encryption
│   │   └── keyDerivation.js        # Argon2id KDF & Blake2b domain separation
│   ├── image/                      # Image processing (Sharp)
│   │   ├── decode.js               # Decode images to raw RGBA buffers
│   │   ├── encode.js               # Encode RGBA buffers to lossless PNG
│   │   └── validate.js             # Image dimensions and file size bounds checking
│   ├── steganography/              # Bit-level LSB codecs & payload serialization
│   │   ├── capacity.js             # Overhead & usable capacity calculations
│   │   ├── embed.js                # Sequential & scattered bit embedder
│   │   ├── extract.js              # Header & ciphertext bit extractor
│   │   ├── payloadFormat.js        # 50-byte binary header serializer
│   │   ├── pixelCodec.js           # Bitwise LSB read/write operations
│   │   └── positionGenerator.js    # ChaCha20 PRNG key-seeded scattering
│   ├── errors.js                   # Error taxonomy & uniform user-facing error handler
│   └── index.js                    # Core Engine public export API
├── electron/                       # Electron Desktop Shell & Main Process
│   ├── ipc/                        # Validated IPC handlers
│   │   ├── hideHandlers.cjs        # IPC handler for hide message operations
│   │   ├── imageHandlers.cjs       # IPC handlers for file dialogs & image validation
│   │   └── revealHandlers.cjs      # IPC handler for reveal message operations
│   ├── security/                   # Desktop security guards
│   │   └── csp.cjs                 # Strict Content Security Policy configuration
│   ├── main.cjs                    # Electron main lifecycle & window configuration
│   └── preload.cjs                 # Secure contextBridge API definition
├── src/                            # React HUD Frontend Interface
│   ├── assets/                     # Custom typography and tactical HUD icons
│   ├── components/                 # Reusable UI components
│   │   ├── AbhedyaLogo.jsx         # Custom brand SVG mark
│   │   ├── CapacityMeter.jsx       # Dynamic real-time capacity gauge
│   │   ├── ImagePreview.jsx        # Image thumbnail & dimension inspector
│   │   ├── ImageUploader.jsx       # Drag-and-drop file upload zone
│   │   ├── OperationStatus.jsx     # Progress spinner & success/error banners
│   │   ├── PasswordInput.jsx       # Passphrase input with strength feedback
│   │   ├── ThemeSwitcher.jsx       # Dark/Tactical theme selector
│   │   └── WindowControls.jsx      # Frameless window controls
│   ├── context/                    # React Context providers (ThemeContext)
│   ├── pages/                      # Application route screens
│   │   ├── History.jsx             # Local operation audit log
│   │   ├── HideMessage.jsx         # Encode & conceal message screen
│   │   ├── Home.jsx                # Tactical HUD dashboard & system overview
│   │   ├── RevealMessage.jsx       # Extract & decrypt message screen
│   │   ├── Steganalysis.jsx        # Forensic Chi-Square & RS analysis lab
│   │   └── TechSecurity.jsx        # Cryptographic specs & architectural documentation
│   ├── services/                   # Frontend services (IPC client & history store)
│   ├── App.jsx                     # Top-level application layout & navigation tabs
│   └── main.jsx                    # React root entry point
├── tests/                          # Vitest Automated Test Suite
│   ├── integration/                # Electron IPC + Core Engine integration tests
│   ├── unit/                       # Component & utility unit tests
│   └── *.test.js                   # Crypto, steganography, capacity, & decoy tests
├── docs/                           # Technical Specifications & Architecture Decisions
│   ├── ARCHITECTURE.md             # System architecture & interface contracts
│   ├── PAYLOAD_FORMAT.md           # Binary wire layout specifications
│   ├── SECURITY.md                 # Threat model & cryptographic principles
│   └── E2E_TEST_CHECKLIST.md       # Manual QA & validation checklist
├── electron-builder.yml            # Multi-platform packaging configuration
├── package.json                    # Project dependencies and script definitions
└── vite.config.js                  # Vite bundler configuration
```

---

## 9. Security Architecture & Threat Model

1. **Encrypt Before Embedding:** Plaintext is never written directly to pixel channels. Every payload is encrypted with XChaCha20-Poly1305 before embedding.
2. **Authenticated Additional Data (AAD):** The 10-byte header prefix (Magic, Version, Mode, Length) is authenticated by the Poly1305 MAC tag, preventing attackers from modifying flags or ciphertext length parameters.
3. **Argon2id Key Derivation:** Passwords are never used directly as keys. Unique 16-byte cryptographically secure random salts are generated per operation and processed with Argon2id to defeat precomputed dictionary or rainbow table attacks.
4. **Memory Confidentiality:** Plaintexts, passphrases, and derived keys are retained only in temporary local variables and never persisted to disk, local storage, or telemetry logs.
5. **Electron Sandboxing:**
   - `contextIsolation: true` and `nodeIntegration: false` prevent renderer scripts from accessing Node.js runtime APIs.
   - Strict Content Security Policy (CSP) restricts external script execution and network connections.
   - Popups and new window creation are rejected via `setWindowOpenHandler`.
6. **Lossless Transmission Warning:** Embedded payloads reside in the least-significant bits. Transmission over lossy channels (JPEG conversion, social media compression, image resizing) will destroy the hidden payload. Lossless PNG must be preserved.

---

## 10. Event Information & Team Credits

- **Event:** Softablitz 2026 — TechBlitz
- **Problem Statement:** The Vishanti Cipher
- **Team Name:** TechBlitz
- **Team ID:** 175
- **Application Name:** Abhedya (The Vishanti Cipher)
- **License:** Proprietary / Competition Submission (Softablitz 2026)
