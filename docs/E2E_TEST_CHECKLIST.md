# Abhedya — End-to-End Test Checklist & Validation Guide

**Component:** Desktop UI, Electron Security Boundary & Application Flow  
**Owner:** Member 1  
**Target:** Softablitz 2026

---

## 1. Automated Test Execution

Run the automated test suite before manual QA:

```bash
# Run unit & security validation tests
npm test

# Verify production bundle compilation
npm run build
```

---

## 2. End-to-End Verification Checklist

### Phase 1 — Application Launch & Navigation
- [ ] **Launch from command line:** Run `npm start` (or `npm run dev`).
  - App window opens with minimum bounds (840×640) and default size (1200×840).
  - Background color matches obsidian palette (`#0d0d15`) without white flashes.
- [ ] **Navigation tabs:**
  - Clicking **Home** renders hero section, two action cards, and security highlights.
  - Clicking **Hide Message** loads carrier image dropzone, message area, and password inputs.
  - Clicking **Reveal Message** loads PNG dropzone and password input.
  - Clicking **Settings** displays diagnostics, runtime version numbers, and security check status.
- [ ] **External URL Guard:**
  - Try dragging an external link or navigating away — navigation is blocked.
  - Popups and new windows are rejected via `setWindowOpenHandler`.

---

### Phase 2 — Carrier Image Selection & Inspection
- [ ] **Open native dialog:** Click "Select Carrier Image" in Hide Message.
  - Native file picker opens with filters for PNG, JPEG, WebP, BMP.
- [ ] **Image Preview & Metadata:**
  - Valid image displays thumbnail preview, dimensions (width × height), file size, and format badge.
- [ ] **Security — Corrupted / Disguised Files:**
  - Rename an executable or shell script to `.png` and attempt to open.
  - App displays error: *"Unsupported or corrupted image format. Please select a valid PNG, JPEG, WebP, or BMP image."*
  - Malicious files are rejected in main process using magic byte inspection.
- [ ] **Security — Dimension & Size Bounds:**
  - Images larger than 50MB are rejected.
  - Images with dimensions exceeding 8192×8192 are rejected.

---

### Phase 3 — Capacity Estimation & Message Encoding
- [ ] **Dynamic Capacity Meter:**
  - Selecting an 800×600 image shows calculated capacity (~179 KB payload space).
  - Typing in the message box updates byte count and capacity percentage live.
  - Warning shows when message exceeds available capacity; "Encrypt & Embed" button is disabled.
- [ ] **Password Validation:**
  - Passwords under 8 characters disable the button and show helper guidance.
  - Confirmation password verifies exact match.
  - Eye icon toggles password visibility.
- [ ] **Operation Status:**
  - Clicking "Encrypt & Embed Message" shows progress indicator with phase description.
  - Success banner displays with "Save Encoded PNG Image" button.
- [ ] **Output PNG Export:**
  - Clicking save prompts native save dialog.
  - File is strictly saved with `.png` extension.

---

### Phase 4 — Extraction & Decryption Security
- [ ] **Lossless PNG Requirement:**
  - In Reveal Message, attempt to select a `.jpg` or `.webp` file.
  - App rejects it with *"The encoded file must be a lossless PNG image. Other formats do not preserve steganographic payload data."*
- [ ] **Generic Failure Verification (Zero-Leakage):**
  - Enter an incorrect password on an encoded image.
  - Verify app displays strictly:
    > *"Decryption failed. The password may be incorrect, or the image does not contain a valid encrypted payload."*
  - Confirm NO internal cryptographic errors, stack traces, or partial plaintexts appear in UI or console.
- [ ] **Successful Recovery:**
  - Enter the correct password.
  - Decrypted plaintext is presented inside a formatted code container with a "Copy" button.

---

### Phase 5 — Packaging Verification
- [ ] Verify `electron-builder.yml` configuration:
  - Output directory is `release/`.
  - Bundle includes `dist/`, `electron/`, and `package.json`.
- [ ] Build unpacked directory:
  ```bash
  npm run build
  ```
