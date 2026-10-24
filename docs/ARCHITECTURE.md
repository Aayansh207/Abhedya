# Architecture and Shared Decisions

## Logical flow

React UI → Electron preload API → Electron main/IPC handlers → core engine → local PNG output.

The reveal flow reverses the process and returns plaintext only after authenticated decryption succeeds.

## Responsibilities

- `src/`: presentation and UI state.
- `electron/`: app lifecycle, native file dialogs, IPC validation, and restricted preload bridge.
- `core/image/`: image decoding, normalization, validation, PNG encoding.
- `core/crypto/`: password-based key derivation and authenticated encryption/decryption.
- `core/steganography/`: capacity, payload serialization, bit codec, embedding, extraction, position generation.
- `core/advanced/`: future multiple-message/decoy features.
- `core/analysis/`: future chi-square and RS evaluation.
- `tests/`: unit and end-to-end tests.

## Decisions to record before implementation

- [ ] Core API signatures and return types.
- [ ] Whether the core accepts file paths or decoded pixel buffers.
- [ ] Supported input formats and image dimension limits.
- [ ] Exact eligible pixel channels and embedding rules.
- [ ] Binary payload fields, byte order, and version.
- [ ] Capacity formula and exact payload overhead.
- [ ] Crypto library and safe parameters.
- [ ] Internal errors and generic user-facing failure message.
- [ ] Multi-message/decoy design.

## Security boundaries

Only Electron main should perform privileged file operations. The renderer calls a narrow API exposed by `preload.js`. Validate every IPC argument. Keep image and message processing local.
