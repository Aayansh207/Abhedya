# Abhedya — Work Plan 1: Desktop UI, Electron Integration & Application Flow

**Project:** Abhedya — The Vishanti Cipher  
**Team:** TechBlitz | Softablitz 2026  
**Owner:** Team Member 1  
**Primary responsibility:** Build the desktop application shell, React interface, Electron security boundary, and connect the UI to the core engine.

---

## 1. What we are building

Abhedya is a cross-platform desktop application that hides an encrypted secret message inside an ordinary image. A recipient selects the resulting PNG and enters the correct password to recover the original message.

The app should process files locally. We are not building a cloud backend or a separate server for the main workflow.

### Overall architecture

```text
React UI
   │  calls a small, restricted API
   ▼
Electron Preload (contextBridge)
   ▼
Electron Main Process (IPC handlers + native file dialogs)
   ▼
Core Engine (implemented jointly with Member 2)
   ├── Image processing
   ├── Capacity estimation
   ├── Encryption / decryption
   ├── Payload format
   └── Embedding / extraction
   ▼
PNG output on the user's device
```

**Your focus:** everything from the user interface down to the safe Electron IPC boundary, plus integration with the core engine. Do not independently implement cryptography or the pixel-embedding algorithm; agree on their APIs with Member 2.

---

## 2. Your deliverables

By the end, your part should provide:

- A working Electron + React desktop application.
- Home, Hide Message, Reveal Message, and basic Settings screens.
- Image selection and preview.
- Password and message input.
- Capacity estimate and clear “fits / does not fit” feedback.
- Progress, success, and generic failure states.
- A restricted preload API and validated IPC handlers.
- Save-dialog integration for the resulting PNG.
- Packaged builds tested on the operating systems available to the team.
- Integration tests or a documented end-to-end test checklist.

---

## 3. Work breakdown

### Task A — Application foundation

1. Set up Electron and React in the agreed repository structure.
2. Create the main window and React entry point.
3. Add navigation for:
   - Home
   - Hide Message
   - Reveal Message
   - Settings / About
4. Add a consistent visual design and reusable components.

Suggested components:

```text
src/
  pages/
    Home.jsx
    HideMessage.jsx
    RevealMessage.jsx
    Settings.jsx
  components/
    ImageUploader.jsx
    ImagePreview.jsx
    PasswordInput.jsx
    CapacityMeter.jsx
    OperationStatus.jsx
```

Keep the UI polished but do not spend too long on decoration before the full hide/reveal flow works.

### Task B — Electron security and file operations

Implement:

```text
electron/
  main.js
  preload.js
  ipc/
    imageHandlers.js
    hideHandlers.js
    revealHandlers.js
  security/
    fileValidation.js
```

Security requirements:

- Enable `contextIsolation`.
- Keep `nodeIntegration` disabled in the renderer.
- Use `contextBridge` to expose only explicit operations.
- Validate IPC inputs in the main process; never trust renderer-supplied paths, sizes, or payload data.
- Use native file dialogs for opening and saving files.
- Restrict supported formats and enforce reasonable image size/dimension limits.
- Do not expose unrestricted filesystem or arbitrary Node.js access to React.
- Never log passwords, plaintext messages, derived keys, or decrypted content.
- Display a generic failure message for incorrect passwords, invalid payloads, or images that cannot be decoded.

Example frontend API (names are provisional; finalize with Member 2):

```js
window.abhedya.selectImage()
window.abhedya.estimateCapacity({ imagePath })
window.abhedya.hideMessage({
  imagePath,
  message,
  password,
  mode
})
window.abhedya.revealMessage({
  imagePath,
  password,
  mode
})
window.abhedya.saveOutput({ suggestedName, bytes })
```

Use a narrow API. Do not expose `ipcRenderer` directly to the renderer.

### Task C — React hide workflow

The Hide Message screen should allow the user to:

1. Select an image.
2. Preview the selected image and show its dimensions.
3. Enter a secret message.
4. Enter and confirm a password.
5. See the available capacity and whether the message fits.
6. Start hiding the message.
7. See operation status and a clear result.
8. Choose where to save the output PNG.

UI validation is for usability only. The core engine must repeat all important validation because UI checks can be bypassed.

### Task D — React reveal workflow

The Reveal Message screen should allow the user to:

1. Select the encoded PNG.
2. Enter the password.
3. Start extraction and decryption.
4. Display the recovered message only after authenticated decryption succeeds.
5. Display the same generic failure message when recovery fails, regardless of whether the cause is a wrong password, absent payload, corrupted data, or failed authentication.

Never show partial plaintext or internal cryptographic errors.

### Task E — Integration contract with Member 2

Agree on these interfaces before both sides implement against assumptions:

- Image representation passed into the engine (prefer a documented RGBA buffer + width/height).
- Payload format and version.
- Capacity function signature and units.
- Hide function input/output.
- Reveal function input/output.
- Error categories internally and the single safe message shown to users.
- Which side performs image decoding and PNG encoding.
- Whether long image operations need a worker thread.

Proposed engine API:

```js
// Illustrative contract; finalize jointly.
await engine.estimateCapacity({ imagePath })
await engine.hideMessage({ imagePath, message, password, mode })
await engine.revealMessage({ imagePath, password, mode })
```

Do not make a second competing implementation of these functions in the UI. Call the shared core implementation.

### Task F — Packaging and cross-platform checks

- Configure packaging with `electron-builder` or the agreed equivalent.
- Check native dependencies against the Electron version.
- Test at least one complete hide/reveal round trip on each available OS.
- Verify that exported files are PNG and that the app does not upload images.
- Document OS-specific packaging issues rather than assuming all platforms behave identically.

---

## 4. Suggested ownership boundary

**You own:**
- `src/`
- `electron/`
- App-level integration and packaging configuration
- UI/IPC tests and user-facing documentation

**Member 2 owns:**
- `core/crypto/`
- `core/steganography/`
- `core/image/` (coordinate who owns image decoding/encoding)
- Engine unit tests and payload/security documentation

**Shared decisions — both must approve:**
- Payload binary format and versioning
- Cryptographic algorithms and library
- Pixel-channel eligibility and embedding algorithm
- Capacity formula and reserved overhead
- Public engine API and error behavior
- Multi-message/decoy format
- Security and test acceptance criteria

Avoid changing a shared interface unilaterally. Raise the change, agree on it, and update the contract and tests.

---

## 5. Integration milestones

### Milestone 1 — UI skeleton
- App launches.
- Navigation works.
- Image picker and preview work.

### Milestone 2 — Mock integration
- UI can call stub engine functions.
- Capacity and operation statuses display correctly.
- IPC input validation is in place.

### Milestone 3 — Real hide/reveal integration
- Replace stubs with Member 2's real engine functions.
- Hide a short message in a PNG.
- Recover the exact message using the correct password.
- Wrong password produces only the generic failure message.

### Milestone 4 — Packaging
- Build the app.
- Test on available target platforms.
- Confirm native modules are packaged correctly.

---

## 6. Definition of done

Your part is complete when:

- [ ] The application launches and navigates between screens.
- [ ] Users can select and preview supported images.
- [ ] Capacity is shown using the core engine's calculation.
- [ ] Hide and Reveal actions call the shared engine through IPC.
- [ ] Wrong passwords and malformed files fail safely.
- [ ] The app never exposes unrestricted Node.js access to the renderer.
- [ ] No secrets are written to logs.
- [ ] Output PNGs can be saved to a user-selected location.
- [ ] A clean end-to-end test is documented and repeatable.

---

## 7. Important constraints

- Do not claim the image is “undetectable.” Steganalysis resistance must be measured.
- PNG preserves embedded pixels, but a messaging platform may resize or recompress the image. Tell users to send it as a file/document where possible.
- UI validation is not a substitute for core-engine validation.
- Do not add a cloud backend unless the team identifies a real requirement for one.
- Implement the basic single-message workflow before advanced decoy mode.

**First action:** create the Electron + React skeleton and a small, secure preload API. At the same time, meet with Member 2 to freeze the engine interface and payload contract before implementing real integration.
