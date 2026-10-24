# Softablitz 2026 — TechBlitz
## Complete Problem Statement and Event Rules

**Project name:** Abhedya  
**Selected problem statement:** The Vishanti Cipher  
**Team:** TechBlitz  
**Team ID:** 175  
**Source documents:** *Softablitz-PS-update.pdf*, *The Vishanti Cipher.pdf*, and the submitted TechBlitz abstract, *TechBlitz_2nd Year_Softablitz_2026.pdf*.

> **How to read this document:** The event rules and problem requirements below are summarized from the supplied Softablitz problem-statement documents and the team’s submitted abstract. The rules section does not invent deadlines, judging percentages, submission formats, or presentation requirements that were not stated in those sources. Confirm any additional logistics with the event coordinators.

---

# Part I — Event Rules and Regulations

The official rules listed in the supplied problem-statement document are:

1. **Team size:** A team may have up to **3 members**.
2. **Branch eligibility:** Students from all branches are welcome.
3. **Cross-year teams:** Cross-year teams are **not allowed**.
4. **Problem-statement limit:** A team may work on a maximum of **two problem statements**.
5. **Git and GitHub:** Use of **Git and GitHub is mandatory**.
6. **Supported operating systems:** The application may target **Windows, macOS, or Linux**.
7. **Cross-platform bonus:** Creating a cross-platform application earns **extra points**.
8. **Basic features first:** Implement the basic features first. Advanced features earn extra points.
9. **Partial projects:** Partial or incomplete projects will still be evaluated based on the progress made.
10. **Functionality over UI:** Prioritize working functionality over visual design. An app with minimal functionality will not score well; UI may be considered as a tiebreaker.
11. **Questions and clarification:** Contact the event coordinators for questions about the problem statements.

## Practical interpretation for our team

- Keep the team within the three-member limit and ensure all members satisfy the same-year rule.
- Use a shared Git repository from the beginning. Commit work regularly and use branches or pull requests so contributions are visible and integration is manageable.
- First deliver a working end-to-end version of the **basic hide-and-reveal flow**. Do not spend most of the available time polishing screens while core functionality is missing.
- Add advanced capabilities only after the basic requirements work reliably.
- Make progress demonstrable even if every advanced feature cannot be completed.
- A single-OS implementation is allowed, but supporting Windows, macOS, and Linux may earn extra points. Cross-platform support is a bonus, not a substitute for core functionality.

## Event details not specified in the supplied rules

The supplied rules do **not** state the exact deadline, demo duration, presentation format, judging-weight percentages, required repository visibility, deployment requirements, or final submission procedure. Do not assume these details; check the official event announcements or ask the coordinators.

---

# Part II — The Vishanti Cipher: Problem Statement

## 1. Story and challenge

The problem is presented through a Doctor Strange / Scarlet Witch scenario. Doctor Strange has discovered a secret incantation, but Wanda can detect concealed magical signatures. Sending the incantation openly is unsafe, and storing it in an obvious locked vault would reveal that something valuable is being protected.

The challenge is to **hide the secret in plain sight** by embedding it in an ordinary digital photograph. The image should look like a normal image to a person viewing it, while the secret should not be stored as readable text. Only a user with the correct password should be able to retrieve the original message through the application.

The story is fictional framing; the engineering task is a secure desktop application combining **image steganography and encryption**.

## 2. Goal

Build a desktop application called **Abhedya** that:

- Hides a secret message inside a digital image.
- Encrypts the message before embedding it.
- Uses a password to control recovery of the hidden message.
- Estimates how much data an image can safely hold before embedding.
- Recovers the exact original message when given the encoded image and correct password.
- Handles incorrect passwords and invalid data without crashing or revealing sensitive information.
- Runs on desktop operating systems, with cross-platform support earning extra points.
- Offers advanced concealment features for additional credit.

## 3. What the terms mean

### Steganography

Steganography is the practice of concealing the existence of a message inside another file, such as an image. The goal is not merely to scramble the message, but to make the image appear ordinary and avoid exposing the message directly.

### Encryption

Encryption transforms the message into ciphertext using a cryptographic key. Even if an attacker discovers the embedded data, the message should not be readable without the correct password-derived key.

### Why both are needed

- **Encryption** protects the content of the message.
- **Steganography** attempts to conceal the presence and location of that encrypted content.

These solve different problems and should be used together.

---

# Part III — Required Basic Features

The problem-statement document labels the following requirements **Basic**. These should be the first implementation priority.

## B1. The Sanctum Must Work Anywhere — Desktop Compatibility

The application must run as a desktop app on **Windows, macOS, and Linux** to meet the full cross-platform requirement.

The event rules allow an app to target Windows, macOS, or Linux; cross-platform implementation earns extra points. Therefore, the safest interpretation is:

- A working app for at least one intended desktop OS is permitted by the event rules.
- Support for all three OSes aligns with the problem statement and can earn the cross-platform bonus.

## B2. Seal and Reveal the Spell — Hide and Recover a Message

The application must conceal the secret message inside an image so that:

- The original message is not stored as readable text inside the image.
- The resulting image remains viewable as an ordinary image.
- A recipient can select the modified image and provide the correct password.
- The application can recover the **exact original message**.

The expected core flow is:

1. Select an image.
2. Enter the secret message.
3. Set a password.
4. Encrypt the message.
5. Embed the encrypted data into the image.
6. Save the modified image.
7. Later, select that modified image and enter the password.
8. Extract, verify, decrypt, and display the original message.

## B3. Wanda May Try to Trick the Tool — Safe Failure

A wrong password must not:

- Crash the application.
- Reveal whether a hidden message is present.
- Give away sensitive information through detailed error messages.

Failure should be calm and **uninformative**. The same general failure response should be used for cases such as an incorrect password or invalid hidden data, rather than exposing which security check failed.

The application should also validate image inputs and handle malformed or unsupported files safely.

## B4. Know What the Image Can Hold — Capacity Estimation

Before embedding, the application must calculate and communicate the image's available embedding capacity and check whether the message will fit.

The estimate should account for the actual embedding method and required payload overhead—not merely the image's file size. The application should reject an oversized message safely instead of silently truncating it or producing a broken image.

## B5. The Image Must Survive the Journey — Preserve Hidden Data

The modified image must be saved in a format that preserves the embedded data when the image is passed along.

The submitted abstract specifically proposes a **lossless format such as PNG**. Lossy recompression, resizing, or some messaging-platform image transformations can alter pixel values and destroy hidden data, so the application should clearly identify the supported output format and its limitations.

---

# Part IV — Advanced Features for Extra Points

The problem statement labels these requirements **Advanced**. Event rules say advanced features earn extra points, so build them after the basic flow is dependable.

## A1. Survive the Darkhold's Gaze — Key-Seeded Scattering and Steganalysis Evaluation

The advanced requirement asks the team to:

1. Spread the hidden data across the image in a less predictable, **key-seeded scattering pattern**, rather than placing it in one obvious continuous region.
2. Evaluate whether the embedding introduces detectable statistical patterns.
3. Test against standard steganalysis techniques named in the statement:
   - **Chi-square analysis**
   - **RS analysis**

The aim is to reduce detectability and avoid suspicious patterns. This is a difficult security goal: do not claim that the image is impossible to detect or that it always passes every detector. Implement the technique, test it, and report measured results honestly.

## A2. One Image, Many Realities — Multiple Password-Dependent Messages and Decoys

The advanced requirement asks for a single image to reveal different messages depending on the password supplied.

In particular:

- A valid primary password can reveal the real message.
- A designated decoy password can reveal a different, harmless decoy message.
- The image should support these password-dependent outcomes without exposing the real message to someone who only knows the decoy password.

Treat this as an advanced feature. First make the normal one-password hide/reveal flow correct and reliable.

---

# Part V — Expected Application Workflow

The submitted TechBlitz abstract describes the following workflow.

## Hiding a message

1. **Image selection:** The user chooses an image in a supported format.
2. **Message and password input:** The user enters the secret message and chooses a password.
3. **Capacity estimation:** The app calculates available capacity and checks whether the payload fits.
4. **Encryption:** The message is encrypted using a cryptographic key derived from the password.
5. **Steganographic embedding:** The encrypted data is embedded in image pixels. In advanced mode, the locations are distributed using a password/key-seeded pattern.
6. **Export:** The app saves the resulting image in a supported lossless format, such as PNG.

## Revealing a message

1. The recipient selects the modified image.
2. The recipient enters the password.
3. The application extracts the hidden payload.
4. It validates the payload and verifies its integrity.
5. It decrypts the payload using the supplied password.
6. If successful, it displays the exact original message.
7. If the password is incorrect or the data is invalid, it shows a generic failure response and does not crash or reveal whether a hidden message exists.

---

# Part VI — Security and Reliability Expectations

These expectations follow from the stated requirements and the submitted abstract.

## 1. Encrypt before embedding

Do not place plaintext directly into image pixels. Encrypt the message first, then embed the ciphertext.

## 2. Password-derived access

The password should be used to derive the cryptographic key. The embedding/retrieval process must be reproducible for the intended recipient when the correct password is supplied.

## 3. Integrity verification

The app should detect an incorrect password or altered/corrupt payload and must not display corrupted plaintext as if it were valid.

## 4. Safe error handling

Handle at least these cases safely:

- Incorrect password.
- Image contains no valid payload.
- Corrupt or truncated payload.
- Unsupported or malformed image.
- Message exceeds capacity.
- Image decoding or export failure.

Do not log passwords, plaintext messages, or derived secret keys.

## 5. Local processing

The submitted architecture proposes processing images locally on the user's device, avoiding the need to upload private images or messages to a central server for the normal workflow. This is an architectural choice in the abstract rather than a separate event rule.

## 6. Lossless output and file transformations

Use a supported lossless output such as PNG to preserve pixel data. Warn users that recompression, resizing, format conversion, or social-media image processing can destroy the hidden payload.

## 7. Be honest about steganalysis

The advanced statement asks for resistance to chi-square and RS analysis. This should be treated as an objective to evaluate, not a guarantee of perfect undetectability. Include test methodology and observed results in the final demonstration or documentation if this feature is implemented.

---

# Part VII — Proposed Technology Choices in the Submitted Abstract

These are the technology choices recorded in the TechBlitz abstract, not additional event rules.

| Area | Proposed choice | Purpose |
|---|---|---|
| Desktop application | Electron | Desktop shell and access to native file dialogs |
| User interface | React | Reusable UI components and application screens |
| Image processing | Sharp | Decode/process images and export PNG |
| Cryptographic utilities | Node.js Crypto API, with a suitable cryptography library where appropriate | Random values and cryptographic operations |
| Steganography | Custom module | Embed and extract payload bits using the chosen pixel algorithm |
| Output format | PNG | Lossless image export that preserves pixel values |

The abstract also records these choices:

- Electron rather than Tauri, as a practical fit for a JavaScript-based desktop application.
- React rather than vanilla JavaScript for organizing a multi-screen interface.
- PNG rather than JPEG for output because PNG uses lossless compression.

The team may refine implementation details, but should not weaken the required outcomes: encryption before embedding, correct recovery, capacity estimation, safe failure, and preserved output data.

---

# Part VIII — What to Build First

A practical implementation order consistent with the event's stated priorities:

## Milestone 1 — Working basic application

- Desktop app launches.
- User can select a supported image.
- User can enter a message and password.
- Capacity is calculated and oversized messages are rejected.
- Message is encrypted before embedding.
- Encoded image can be exported as PNG.
- Encoded PNG can be reopened and the original message recovered with the correct password.
- Wrong passwords and invalid files fail safely.
- Code is maintained in Git/GitHub.

## Milestone 2 — Robustness and compatibility

- Add unit and integration tests.
- Test different image dimensions and message sizes.
- Verify exact round-trip recovery.
- Validate behavior with incorrect passwords and damaged payloads.
- Test packaging and operation on additional operating systems, if available.
- Document supported formats and limitations.

## Milestone 3 — Advanced scoring features

- Key-seeded scattering of embedded data.
- Chi-square and RS analysis evaluation.
- Multiple password-dependent messages.
- Decoy-message mode.

## Milestone 4 — Presentation polish

After the functional flow works, improve the UI, progress states, capacity visualization, and user guidance. Visual polish should not displace core functionality.

---

# Part IX — Minimum Demonstration Checklist

Before presenting the project, verify these cases:

- [ ] App launches as a desktop application.
- [ ] A normal image can be selected and previewed.
- [ ] Capacity is shown before embedding.
- [ ] A message that fits can be hidden successfully.
- [ ] Output image is saved in the supported lossless format.
- [ ] The output image still looks like an ordinary image.
- [ ] Correct password recovers the exact original message.
- [ ] Wrong password does not crash the app.
- [ ] Failure messages do not reveal whether a hidden payload exists.
- [ ] Invalid or corrupted image/payload is handled safely.
- [ ] A message exceeding capacity is rejected cleanly.
- [ ] Git/GitHub history shows the team's development work.
- [ ] If claiming cross-platform support, the app is tested on the operating systems claimed.
- [ ] If claiming advanced steganalysis resistance, results from chi-square and RS evaluation are available.
- [ ] If claiming decoy mode, demonstrate that different passwords produce the intended different messages.

---

# Part X — Final Requirement Summary

| Requirement | Category in source | Priority |
|---|---|---|
| Desktop application on Windows, macOS, and Linux | Basic problem requirement | High; cross-platform support earns extra points |
| Hide a message in an image and recover the exact original | Basic | Must-have |
| Encrypt the message; do not store plaintext in the image | Basic problem intent and submitted abstract | Must-have |
| Wrong password must not crash or reveal whether a message exists | Basic | Must-have |
| Calculate image embedding capacity before hiding | Basic | Must-have |
| Preserve embedded data in an appropriate lossless output format | Basic | Must-have |
| Key-seeded scattering across the image | Advanced | After basic flow |
| Evaluate with chi-square and RS analysis | Advanced | After basic flow |
| Different password-dependent messages in one image | Advanced | After basic flow |
| Decoy message for a designated password | Advanced | After basic flow |
| Use Git and GitHub | Event rule | Mandatory |
| Maximum three members; no cross-year teams | Event rule | Mandatory |
| Maximum two problem statements | Event rule | Mandatory |
| Partial projects evaluated on progress | Event rule | Plan for a demonstrable working core |
| Functionality prioritized over UI | Event rule | Build core workflow first |

## Bottom line

**Abhedya must first prove that it can reliably encrypt a message, hide the ciphertext in an image, export the image without destroying the payload, and recover the exact message only with the correct password—while failing safely otherwise.** Cross-platform compatibility and the advanced scattering, steganalysis, and decoy-message features can then strengthen the submission.

**Important:** This document covers the rules and requirements visible in the supplied problem-statement materials. Check the event coordinators' announcements for logistics not included in those documents, such as deadlines, demo timing, and final submission instructions.
