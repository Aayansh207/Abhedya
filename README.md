# Abhedya — The Vishanti Cipher

A local-first, cross-platform desktop application that encrypts a secret message and conceals the encrypted payload inside an image.

## Architecture

- **React (`src/`)** — user interface only.
- **Electron (`electron/`)** — desktop window, native file dialogs, and validated IPC.
- **Core engine (`core/`)** — image processing, capacity calculation, cryptography, payload format, embedding, and extraction.
- **Tests (`tests/`)** — unit and end-to-end round-trip tests.
- **Docs (`docs/`)** — shared technical decisions and payload specification.

No cloud backend is required for the main workflow. Process messages and images locally.

## First milestone

1. Agree on `docs/ARCHITECTURE.md` and `docs/PAYLOAD_FORMAT.md`.
2. Get the desktop shell running.
3. Implement image decode/encode and exact capacity calculation.
4. Implement authenticated encryption and a versioned payload.
5. Implement basic LSB embedding/extraction.
6. Pass `hide → export PNG → reload PNG → reveal` round-trip tests.
7. Only then add key-seeded scattering, decoy mode, and steganalysis evaluation.

## Ownership

- **Member 1:** `src/`, `electron/`, app integration, packaging.
- **Member 2:** `core/`, core tests, payload and security documentation.
- **Both:** API contracts, payload format, capacity rules, integration tests, final security decisions.

## Security rules

- Use maintained cryptographic libraries; do not invent a cipher or KDF.
- Never log passwords, keys, or plaintext messages.
- Keep Electron `contextIsolation` enabled and `nodeIntegration` disabled.
- Expose a narrow preload API; do not expose unrestricted Node.js or `ipcRenderer`.
- Export encoded images as PNG. JPEG recompression, resizing, or other image transformations can destroy hidden data.
- Do not claim steganographic undetectability; measure detection performance.

## Scaffold status

This repository is a starter structure, not a completed application. TODO modules are intentionally unimplemented until the team agrees on the payload format and APIs.
