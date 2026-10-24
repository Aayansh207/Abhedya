import React, { useState } from "react";
import {
  ShieldIcon,
  CpuIcon,
  LockIcon,
  UnlockIcon,
  ActivityIcon,
  Layers,
  KeyIcon,
  CheckIcon,
  AlertCircleIcon,
  Terminal,
  CrosshairIcon,
  ExternalLink,
  ChevronRight,
  Info
} from "../components/Icons";

export default function TechSecurity() {
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview", label: "Technology Overview" },
    { id: "secure-flow", label: "How Message Is Secured" },
    { id: "recovery-flow", label: "Message Recovery Process" },
    { id: "data-privacy", label: "Data Protection & Privacy" },
    { id: "architecture", label: "Technical Architecture" },
    { id: "steganalysis-limits", label: "Steganalysis & Limitations" },
    { id: "advanced-features", label: "Advanced Security Capabilities" }
  ];

  return (
    <div className="h-full flex flex-col gap-5 overflow-y-auto pr-1">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#c5a059]">
              WORKSPACE // 05
            </span>
            <span className="text-zinc-600">/</span>
            <span className="text-[10px] font-mono uppercase text-zinc-400">
              SPECIFICATION & SECURITY AUDIT
            </span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
            Technology & Security Architecture
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-[#c5a059]/10 border border-[#c5a059]/25 text-[11px] font-mono text-[#e5be6b] flex items-center gap-1.5">
            <ShieldIcon size={12} />
            <span>Cryptographic Reference Manual</span>
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-white/5 text-xs font-mono">
        {sections.map((sec) => (
          <button
            key={sec.id}
            type="button"
            onClick={() => setActiveSection(sec.id)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeSection === sec.id
                ? "bg-[#c5a059]/20 text-[#e5be6b] font-bold border border-[#c5a059]/40"
                : "text-zinc-400 hover:text-zinc-200 bg-white/5 hover:bg-white/10 border border-white/5"
            }`}
          >
            {sec.label}
          </button>
        ))}
      </div>

      {/* SECTION 1: TECHNOLOGY OVERVIEW */}
      {activeSection === "overview" && (
        <div className="space-y-4">
          <div className="glass-panel p-5 bg-[#0f1118]/85 border-white/10 space-y-3">
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <CpuIcon size={16} className="text-[#c5a059]" />
              Core Technologies & Engine Mechanisms
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Abhedya operates as an air-gapped, zero-cloud desktop application combining state-of-the-art authenticated cryptography with spatial pixel steganography.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-lg bg-black/40 border border-white/5 space-y-1">
                <span className="text-xs font-mono font-bold text-[#e5be6b]">
                  Desktop Application Shell
                </span>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  <strong>Electron + React 19:</strong> A hardened Electron runtime with strict context isolation, disabled Node integration in the renderer, and restrictive Content Security Policy (CSP) with zero remote telemetry.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-black/40 border border-white/5 space-y-1">
                <span className="text-xs font-mono font-bold text-[#e5be6b]">
                  Core Processing Engine
                </span>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  <strong>Modular JavaScript / Sharp / Libsodium:</strong> High-performance pixel decoding, PRNG position generation, binary payload packing, and lossless image encoding running strictly in Node process memory.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-black/40 border border-white/5 space-y-1">
                <span className="text-xs font-mono font-bold text-[#34d399]">
                  Cryptographic Encryption
                </span>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  <strong>XChaCha20-Poly1305 / AES-256-GCM:</strong> Payloads are encrypted with authenticated ciphers providing AEAD (Authenticated Encryption with Associated Data). Ciphertext integrity is cryptographically verified before any decryption occurs.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-black/40 border border-white/5 space-y-1">
                <span className="text-xs font-mono font-bold text-[#34d399]">
                  Key Derivation Function (KDF)
                </span>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  <strong>Argon2id / Scrypt / PBKDF2:</strong> Passwords are never used directly as keys. A memory-hard key derivation function derives high-entropy 256-bit keys using a randomly generated 16-byte cryptographic salt.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-black/40 border border-white/5 space-y-1">
                <span className="text-xs font-mono font-bold text-blue-400">
                  Image Steganography
                </span>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  <strong>Least-Significant Bit (LSB) Modulation:</strong> Modulates the least significant bits of Red, Green, and Blue pixel channels. Supports both standard sequential walk and password-seeded PRNG scattering.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-black/40 border border-white/5 space-y-1">
                <span className="text-xs font-mono font-bold text-blue-400">
                  Lossless PNG Preservation
                </span>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  <strong>Discrete Pixel Integrity:</strong> All encoded output is strictly produced in Portable Network Graphics (PNG) format using Deflate lossless compression to prevent lossy DCT frequency quantization from destroying hidden bits.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: HOW A MESSAGE IS SECURED */}
      {activeSection === "secure-flow" && (
        <div className="space-y-4">
          <div className="glass-panel p-5 bg-[#0f1118]/85 border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <LockIcon size={16} className="text-[#c5a059]" />
                How a Message Is Secured (6-Stage Pipeline)
              </h3>
              <span className="text-[11px] font-mono text-[#e5be6b] bg-[#c5a059]/15 px-2 py-0.5 rounded border border-[#c5a059]/30">
                ENCRYPTION + STEGANOGRAPHY
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-[#c5a059]/10 border border-[#c5a059]/25 text-xs text-zinc-300 leading-relaxed">
              <strong className="text-[#e5be6b]">Fundamental Distinction:</strong> <em>Encryption</em> protects the <strong>contents</strong> of a message by converting plaintext into ciphertext that is indecipherable without the key. <em>Steganography</em> conceals the <strong>existence</strong> of the communication by embedding ciphertext into an innocuous carrier. Abhedya unites both disciplines in a multi-layered defense. Plaintext is <strong>never</strong> embedded directly.
            </div>

            <div className="space-y-3 pt-1">
              {[
                {
                  step: "Step 01",
                  title: "Enter the Secret & Credentials",
                  desc: "The user inputs confidential text and a secret passphrase. The application verifies passphrase length and entropy without logging or caching."
                },
                {
                  step: "Step 02",
                  title: "Derive the Cryptographic Key",
                  desc: "A secure random 16-byte salt is generated via crypto.randomBytes(). A password-based key derivation function (Argon2id/Scrypt) derives a high-entropy 256-bit encryption key."
                },
                {
                  step: "Step 03",
                  title: "Authenticated Encryption (AEAD)",
                  desc: "The plaintext is encrypted with XChaCha20-Poly1305. A 24-byte random nonce is created. A 16-byte Poly1305 Message Authentication Code (MAC) tag is computed over the ciphertext and header."
                },
                {
                  step: "Step 04",
                  title: "Prepare & Package Binary Payload",
                  desc: "The binary payload is structured with strict magic bytes ('ABHD'), Mode indicator, Salt, Nonce, Payload Length, Ciphertext, and Poly1305 MAC tag (~64-66 bytes overhead)."
                },
                {
                  step: "Step 05",
                  title: "Conceal Payload in Carrier Pixels",
                  desc: "The steganography engine modifies discrete RGB pixel LSB values. Under Key-Seeded Scattering, a PRNG seeded with the derived key generates a deterministic pseudo-random pixel traversal path."
                },
                {
                  step: "Step 06",
                  title: "Export Lossless PNG Vessel",
                  desc: "The altered pixel buffer is compressed into a lossless PNG file. Visual changes are mathematically bounded to ±1 color unit per channel, remaining imperceptible to the human eye."
                }
              ].map((s) => (
                <div key={s.step} className="p-3.5 rounded-lg bg-black/40 border border-white/5 flex items-start gap-3.5">
                  <span className="px-2 py-1 rounded bg-[#c5a059]/15 border border-[#c5a059]/30 text-[10px] font-mono font-bold text-[#e5be6b] shrink-0">
                    {s.step}
                  </span>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-mono font-bold text-zinc-100">{s.title}</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: HOW MESSAGE RECOVERY WORKS */}
      {activeSection === "recovery-flow" && (
        <div className="space-y-4">
          <div className="glass-panel p-5 bg-[#0f1118]/85 border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <UnlockIcon size={16} className="text-[#34d399]" />
                How Message Recovery Works (Reverse Verification Pipeline)
              </h3>
              <span className="text-[11px] font-mono text-[#34d399] bg-[#10b981]/15 px-2 py-0.5 rounded border border-[#10b981]/30">
                AUTHENTICATED DECRYPTION
              </span>
            </div>

            <div className="space-y-3">
              {[
                {
                  step: "Phase 01",
                  title: "Vessel Ingestion & PNG Validation",
                  desc: "The user selects an encoded image. File validation strictly inspects magic bytes ([0x89, 0x50, 0x4E, 0x47]) to verify it is an authentic lossless PNG. Lossy formats (JPEG/WebP) are rejected."
                },
                {
                  step: "Phase 02",
                  title: "Extract & Validate Header Structure",
                  desc: "The extraction engine traverses pixels (via sequential walk or PRNG scattered walk) to recover the binary header. The application checks the 'ABHD' magic signature and mode flags."
                },
                {
                  step: "Phase 03",
                  title: "Extract Cryptographic Metadata",
                  desc: "The salt (16 bytes), nonce (24 bytes), ciphertext length, and Poly1305 authentication MAC tag (16 bytes) are isolated from the carrier bitstream."
                },
                {
                  step: "Phase 04",
                  title: "Derive Candidate Decryption Key",
                  desc: "The candidate key is derived using the passphrase provided by the recipient and the salt retrieved from the header."
                },
                {
                  step: "Phase 05",
                  title: "Authenticate Ciphertext & Verify MAC Tag",
                  desc: "Before any plaintext is returned, the cipher engine verifies the Poly1305 MAC tag. If a single bit in the ciphertext or header was altered, or if the passphrase was wrong, verification fails immediately."
                },
                {
                  step: "Phase 06",
                  title: "Safe Constant-Time Failure Handling",
                  desc: "Upon authentication failure, the application outputs a uniform generic error message. Detailed cryptographic stack traces and partial plaintexts are suppressed to eliminate side-channel leakage."
                }
              ].map((p) => (
                <div key={p.step} className="p-3.5 rounded-lg bg-black/40 border border-white/5 flex items-start gap-3.5">
                  <span className="px-2 py-1 rounded bg-[#10b981]/15 border border-[#10b981]/30 text-[10px] font-mono font-bold text-[#34d399] shrink-0">
                    {p.step}
                  </span>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-mono font-bold text-zinc-100">{p.title}</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: DATA PROTECTION AND PRIVACY */}
      {activeSection === "data-privacy" && (
        <div className="space-y-4">
          <div className="glass-panel p-5 bg-[#0f1118]/85 border-white/10 space-y-4">
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <ShieldIcon size={16} className="text-[#c5a059]" />
              Data Protection, Threat Model & Privacy Guarantees
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
              <div className="p-4 rounded-lg bg-black/40 border border-white/5 space-y-1.5">
                <span className="font-mono font-bold text-zinc-100 flex items-center gap-1.5">
                  <CheckIcon size={14} className="text-[#10b981]" />
                  Local Execution & Zero Outbound Telemetry
                </span>
                <p className="text-zinc-400 leading-relaxed">
                  All cryptography, pixel manipulations, and key derivations occur in the local device process. Content Security Policy headers block outbound network requests. No user files, hashes, or credentials are submitted to external servers.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-black/40 border border-white/5 space-y-1.5">
                <span className="font-mono font-bold text-zinc-100 flex items-center gap-1.5">
                  <CheckIcon size={14} className="text-[#10b981]" />
                  Ephemeral In-Memory Credential Handling
                </span>
                <p className="text-zinc-400 leading-relaxed">
                  Plaintext passphrases and derived cryptographic keys are held only in ephemeral memory buffers during operation execution. Passwords are never saved to disk, logged to console, or written to temporary files.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-black/40 border border-white/5 space-y-1.5">
                <span className="font-mono font-bold text-zinc-100 flex items-center gap-1.5">
                  <CheckIcon size={14} className="text-[#10b981]" />
                  Tampering & Bit-Rot Detection
                </span>
                <p className="text-zinc-400 leading-relaxed">
                  Authenticated encryption (AEAD) mathematically binds the ciphertext to an authentication tag. Any manual alteration, pixel noise, or compression artifacts will cause the MAC tag validation to fail, preventing execution of corrupted plaintexts.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-black/40 border border-white/5 space-y-1.5">
                <span className="font-mono font-bold text-zinc-100 flex items-center gap-1.5">
                  <CheckIcon size={14} className="text-[#10b981]" />
                  Magic Byte & Path Validation
                </span>
                <p className="text-zinc-400 leading-relaxed">
                  File paths and buffers are validated before disk access. File headers are checked against standard byte signatures to reject spoofed extensions, path traversal, and out-of-bounds memory allocations.
                </p>
              </div>
            </div>

            {/* Frank Disclosures of Limitations */}
            <div className="p-4 rounded-lg bg-[#181926]/90 border border-[#c5a059]/30 space-y-2 text-xs">
              <span className="font-mono font-bold text-[#e5be6b] flex items-center gap-1.5">
                <AlertCircleIcon size={14} className="text-[#c5a059]" />
                Technical Truthfulness & Implementation Boundaries
              </span>
              <ul className="list-disc list-inside space-y-1 text-zinc-300 text-[11px] leading-relaxed">
                <li>Operating system virtual memory paging (swap files) is managed by the host OS kernel and cannot be unconditionally prevented by user-space Node.js runtimes.</li>
                <li>Temporary file cleanup depends on standard Node.js garbage collection and process lifecycle.</li>
                <li>Steganography does not protect an image against lossy re-encoding; transmitting an encoded PNG through image-compressing social media platforms will permanently erase the embedded secret.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: TECHNICAL ARCHITECTURE */}
      {activeSection === "architecture" && (
        <div className="space-y-4">
          <div className="glass-panel p-5 bg-[#0f1118]/85 border-white/10 space-y-4">
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Layers size={16} className="text-[#c5a059]" />
              System Architecture & Component Data Flow
            </h3>

            {/* ASCII/Visual Data Flow Pipeline */}
            <div className="p-4 rounded-lg bg-black/60 border border-white/10 font-mono text-xs text-zinc-300 overflow-x-auto space-y-3">
              <div className="text-[#c5a059] font-bold text-[11px]">
                CONCEALMENT DATA FLOW:
              </div>
              <div className="text-zinc-300 whitespace-pre leading-relaxed text-[11px]">
                [React UI] 
                    ──(ipcRenderer.invoke)──▶ 
                [Electron Preload ContextBridge] 
                    ──(ipcMain Handler)──▶ 
                [Security File Validation] 
                    ──(Core Engine)──▶ 
                [Argon2id KDF + XChaCha20 Cipher] 
                    ──(Binary Payload Serialization)──▶ 
                [Pixel Traversal & LSB Modulation] 
                    ──(Sharp PNG Deflate)──▶ 
                [Lossless Output File]
              </div>

              <div className="text-[#34d399] font-bold text-[11px] pt-2">
                EXTRACTION DATA FLOW:
              </div>
              <div className="text-zinc-300 whitespace-pre leading-relaxed text-[11px]">
                [Encoded PNG] 
                    ──(Magic Byte Check)──▶ 
                [Decode Pixel Buffer] 
                    ──(PRNG / Sequential LSB Extraction)──▶ 
                [Header & Ciphertext Extraction] 
                    ──(Candidate Key Derivation)──▶ 
                [Poly1305 MAC Verification] 
                    ──(Authenticated Decrypt)──▶ 
                [Plaintext Surfaced in UI]
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-lg bg-black/40 border border-white/5 space-y-1">
                <span className="font-mono font-bold text-zinc-200">1. Renderer Layer (React 19)</span>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Responsible for UI presentation, password strength computation, byte calculation, user interaction feedback, and local session auditing. Completely isolated from Node runtime.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-black/40 border border-white/5 space-y-1">
                <span className="font-mono font-bold text-zinc-200">2. Preload Security Bridge</span>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Exposes a strictly vetted, frozen API via Electron's contextBridge. Disallows arbitrary IPC messaging, Node modules, or unrestricted filesystem access.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-black/40 border border-white/5 space-y-1">
                <span className="font-mono font-bold text-zinc-200">3. Main Process IPC Layer</span>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Validates file sizes, inspects magic byte signatures, coordinates native open/save dialogs, and delegates heavy steganographic computations to the core engine.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-black/40 border border-white/5 space-y-1">
                <span className="font-mono font-bold text-zinc-200">4. Core Cryptographic Engine</span>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Contains mathematical implementations for key derivation, authenticated symmetric ciphers, PRNG pixel traversal walk, and statistical Chi-square / RS steganalysis algorithms.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: STEGANALYSIS AND LIMITATIONS */}
      {activeSection === "steganalysis-limits" && (
        <div className="space-y-4">
          <div className="glass-panel p-5 bg-[#0f1118]/85 border-white/10 space-y-4">
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <ActivityIcon size={16} className="text-[#c5a059]" />
              Steganalysis Principles & Honest Limitations
            </h3>

            <div className="space-y-3 text-xs text-zinc-300 leading-relaxed">
              <p>
                Steganalysis is the science of detecting concealed messages inside carrier media. Unlike cryptography (which seeks to prevent eavesdroppers from reading message content), steganography seeks to prevent adversaries from detecting that communication is taking place.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="p-4 rounded-lg bg-black/40 border border-white/5 space-y-2">
                  <span className="font-mono font-bold text-[#e5be6b] block">
                    Chi-Square PoV Analysis
                  </span>
                  <p className="text-[11px] text-zinc-400">
                    Natural images possess unequal counts of even and odd pixel color values (2k and 2k+1). Sequential LSB embedding replaces the lowest bit with high-entropy ciphertext bits, equalizing pairs of values. A high p-value indicates anomalous equalization characteristic of sequential embedding.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-black/40 border border-white/5 space-y-2">
                  <span className="font-mono font-bold text-[#34d399] block">
                    RS Steganalysis (Fridrich et al.)
                  </span>
                  <p className="text-[11px] text-zinc-400">
                    Partitions pixels into contiguous groups and applies dual inversion masks (+M and -M). In clean images, the proportion of regular (R) and singular (S) groups remains symmetric. LSB replacement creates detectable asymmetry between R and S proportions.
                  </p>
                </div>
              </div>

              {/* Crucial caveats */}
              <div className="p-4 rounded-lg bg-[#141620] border border-white/10 space-y-2 text-[11px]">
                <span className="font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <AlertCircleIcon size={14} className="text-[#c5a059]" />
                  What Statistical Analysis Can & Cannot Establish
                </span>
                <ul className="list-disc list-inside space-y-1 text-zinc-400">
                  <li><strong>Steganography does not guarantee mathematical invisibility:</strong> While changes are visually imperceptible, embedding large payloads creates statistical artifacts.</li>
                  <li><strong>False Positives:</strong> High-ISO photographic grain, sensor noise, or heavily textured images can naturally exhibit anomalous group variation without hidden payloads.</li>
                  <li><strong>False Negatives:</strong> Small payloads occupying less than 5% of carrier capacity are frequently below detection thresholds of Chi-square and RS tests.</li>
                  <li><strong>Mitigation via Scattering:</strong> Key-seeded pixel scattering diffuses bits across the entire spatial matrix, preventing contiguous block degradation and complicating localized detection.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 7: ADVANCED SECURITY FEATURES */}
      {activeSection === "advanced-features" && (
        <div className="space-y-4">
          <div className="glass-panel p-5 bg-[#0f1118]/85 border-white/10 space-y-4">
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <CrosshairIcon size={16} className="text-[#c5a059]" />
              Advanced Cryptography & Plausible Deniability Capabilities
            </h3>

            <div className="space-y-3">
              {[
                {
                  title: "Key-Seeded Pixel Scattering",
                  status: "OPERATIONAL",
                  statusClass: "bg-[#10b981]/20 text-[#34d399] border-[#10b981]/30",
                  desc: "Instead of writing bytes sequentially across consecutive scanlines (which concentrates statistical anomalies), a pseudo-random number generator (PRNG) is seeded with a key derived from the password. Bits are scattered across coordinates across the image, resisting linear window detectors."
                },
                {
                  title: "Decoy Mode & Multi-Message Embedding",
                  status: "OPERATIONAL (CORE ENGINE)",
                  statusClass: "bg-[#c5a059]/20 text-[#e5be6b] border-[#c5a059]/30",
                  desc: "Allows two distinct messages to be embedded into the same image with separate passphrases. Entering Password A reveals an innocuous decoy message, while Password B recovers the authentic classified secret under plausible deniability constraints."
                },
                {
                  title: "Statistical Steganalysis Suite",
                  status: "OPERATIONAL",
                  statusClass: "bg-[#10b981]/20 text-[#34d399] border-[#10b981]/30",
                  desc: "Integrated Chi-Square Pair-of-Values test and RS group variation evaluations to allow operators to audit candidate carrier images for detectability prior to transmission."
                },
                {
                  title: "Frequency Domain Transform (DCT/DWT) Embedding",
                  status: "PLANNED ROADMAP",
                  statusClass: "bg-zinc-800 text-zinc-400 border-white/10",
                  desc: "Future expansion to embed payloads within discrete cosine transform (DCT) coefficients to provide resistance against minor lossy compression and image rescaling."
                }
              ].map((feat) => (
                <div key={feat.title} className="p-4 rounded-lg bg-black/40 border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-zinc-100">{feat.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${feat.statusClass}`}>
                      {feat.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
