import React, { useState, useEffect } from "react";
import ImageUploader from "../components/ImageUploader";
import ImagePreview from "../components/ImagePreview";
import PasswordInput from "../components/PasswordInput";
import CapacityMeter from "../components/CapacityMeter";
import OperationStatus from "../components/OperationStatus";
import { api } from "../services/api";
import { historyStore } from "../services/history";
import {
  LockIcon,
  CrosshairIcon,
  Terminal,
  Layers,
  KeyIcon
} from "../components/Icons";

export default function HideMessage() {
  const [image, setImage] = useState(null);
  const [mode, setMode] = useState("scattered"); // 'scattered' (default) | 'decoy' | 'multi' | 'standard'

  // Single-message mode state (scattered & standard)
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Decoy mode state
  const [primaryMessage, setPrimaryMessage] = useState("");
  const [primaryPassword, setPrimaryPassword] = useState("");
  const [primaryConfirmPassword, setPrimaryConfirmPassword] = useState("");
  const [decoyMessage, setDecoyMessage] = useState("");
  const [decoyPassword, setDecoyPassword] = useState("");
  const [decoyConfirmPassword, setDecoyConfirmPassword] = useState("");

  // Multi-carrier mode state (2 to 4 entries)
  const [multiEntries, setMultiEntries] = useState([
    { id: 1, message: "", password: "", confirmPassword: "" },
    { id: 2, message: "", password: "", confirmPassword: "" }
  ]);

  const [capacity, setCapacity] = useState({
    maxPayloadBytes: 0,
    overheadBytes: 66,
    isLoading: false
  });

  const [status, setStatus] = useState("idle");
  const [statusPhase, setStatusPhase] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [hideResult, setHideResult] = useState(null);
  const [savedPath, setSavedPath] = useState(null);
  const [saveError, setSaveError] = useState(null);

  // Byte calculations
  const singleBytes = new TextEncoder().encode(message).length;
  const primaryBytes = new TextEncoder().encode(primaryMessage).length;
  const decoyBytes = new TextEncoder().encode(decoyMessage).length;
  const maxDecoyConsumed = Math.max(primaryBytes, decoyBytes);
  const maxMultiConsumed = Math.max(
    0,
    ...multiEntries.map((e) => new TextEncoder().encode(e.message).length)
  );

  const activePayloadBytes =
    mode === "decoy" ? maxDecoyConsumed : mode === "multi" ? maxMultiConsumed : singleBytes;

  const effectivePartitions =
    mode === "decoy" ? 2 : mode === "multi" ? multiEntries.length : 1;

  const handleSelectImage = async (directFileOrPath) => {
    setStatus("idle");
    setErrorMessage("");

    try {
      const result = directFileOrPath
        ? await api.inspectImage(directFileOrPath)
        : await api.selectImage();
      if (!result || result.canceled) return;

      if (!result.success) {
        setErrorMessage(result.error || "Failed to validate image.");
        return;
      }

      setImage(result);

      setCapacity((prev) => ({ ...prev, isLoading: true }));
      const capResult = await api.estimateCapacity({
        imagePath: result.filePath,
        width: result.width,
        height: result.height,
        mode,
        partitions: effectivePartitions
      });

      if (capResult.success) {
        setCapacity({
          maxPayloadBytes: capResult.maxPayloadBytes,
          overheadBytes: capResult.overheadBytes || 66,
          isLoading: false
        });
      } else {
        setCapacity((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (_err) {
      setErrorMessage("Error selecting carrier image file.");
    }
  };

  useEffect(() => {
    if (image?.filePath) {
      api.estimateCapacity({
        imagePath: image.filePath,
        width: image.width,
        height: image.height,
        mode,
        partitions: effectivePartitions
      }).then((capResult) => {
        if (capResult.success) {
          setCapacity({
            maxPayloadBytes: capResult.maxPayloadBytes,
            overheadBytes: capResult.overheadBytes || 66,
            isLoading: false
          });
        }
      });
    }
  }, [mode, effectivePartitions, image]);

  const handleClearImage = () => {
    setImage(null);
    setCapacity({ maxPayloadBytes: 0, overheadBytes: 66, isLoading: false });
    setStatus("idle");
    setHideResult(null);
    setSavedPath(null);
    setSaveError(null);
  };

  // Multi-carrier entry management
  const handleAddMultiEntry = () => {
    if (multiEntries.length < 4) {
      setMultiEntries((prev) => [
        ...prev,
        { id: Date.now(), message: "", password: "", confirmPassword: "" }
      ]);
    }
  };

  const handleRemoveMultiEntry = (idx) => {
    if (multiEntries.length > 2) {
      setMultiEntries((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const handleUpdateMultiEntry = (idx, field, val) => {
    setMultiEntries((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: val } : item))
    );
  };

  // Validation logic per mode
  const isSingleValid =
    (mode === "scattered" || mode === "standard") &&
    message.trim().length > 0 &&
    password.length >= 8 &&
    password === confirmPassword &&
    singleBytes <= capacity.maxPayloadBytes;

  const isDecoyValid =
    mode === "decoy" &&
    primaryMessage.trim().length > 0 &&
    primaryPassword.length >= 8 &&
    primaryPassword === primaryConfirmPassword &&
    decoyMessage.trim().length > 0 &&
    decoyPassword.length >= 8 &&
    decoyPassword === decoyConfirmPassword &&
    primaryPassword !== decoyPassword &&
    primaryBytes <= capacity.maxPayloadBytes &&
    decoyBytes <= capacity.maxPayloadBytes;

  const passwordsSet = new Set(multiEntries.map((e) => e.password));
  const isMultiValid =
    mode === "multi" &&
    multiEntries.length >= 2 &&
    multiEntries.every(
      (e) =>
        e.message.trim().length > 0 &&
        e.password.length >= 8 &&
        e.password === e.confirmPassword &&
        new TextEncoder().encode(e.message).length <= capacity.maxPayloadBytes
    ) &&
    passwordsSet.size === multiEntries.length;

  const isFormValid = Boolean(
    image &&
      capacity.maxPayloadBytes > 0 &&
      (isSingleValid || isDecoyValid || isMultiValid)
  );

  const getValidationErrorReason = () => {
    if (!image) return "1. Select Carrier Image";
    if (mode === "decoy") {
      if (primaryMessage.trim().length === 0) return "2A. Enter Primary Secret Message";
      if (primaryPassword.length < 8) return "3A. Enter Primary Passphrase (8+ chars)";
      if (primaryPassword !== primaryConfirmPassword) return "Primary Passphrase Mismatch";
      if (decoyMessage.trim().length === 0) return "2B. Enter Decoy Cover Message";
      if (decoyPassword.length < 8) return "3B. Enter Decoy Passphrase (8+ chars)";
      if (decoyPassword !== decoyConfirmPassword) return "Decoy Passphrase Mismatch";
      if (primaryPassword === decoyPassword) return "Primary & Decoy Passphrases Must Differ";
      if (primaryBytes > capacity.maxPayloadBytes) return "Primary Message Exceeds Capacity";
      if (decoyBytes > capacity.maxPayloadBytes) return "Decoy Message Exceeds Capacity";
    } else if (mode === "multi") {
      for (let i = 0; i < multiEntries.length; i++) {
        const item = multiEntries[i];
        if (item.message.trim().length === 0) return `Message #${i + 1} Cannot Be Empty`;
        if (item.password.length < 8) return `Passphrase #${i + 1} Must Be 8+ Chars`;
        if (item.password !== item.confirmPassword) return `Passphrase #${i + 1} Mismatch`;
        if (new TextEncoder().encode(item.message).length > capacity.maxPayloadBytes) {
          return `Message #${i + 1} Exceeds Partition Capacity`;
        }
      }
      if (passwordsSet.size < multiEntries.length) return "All Passphrases Must Be Distinct";
    } else {
      if (message.trim().length === 0) return "2. Enter Secret Message";
      if (password.length < 8) return "3. Enter 8+ Character Passphrase";
      if (password !== confirmPassword) return "Passphrase Mismatch";
      if (singleBytes > capacity.maxPayloadBytes) return "Message Exceeds Capacity";
    }
    return "Encrypt & Embed Payload";
  };

  const handleStartHide = async () => {
    if (!isFormValid) return;

    setStatus("processing");
    setStatusPhase("Deriving Argon2id keys and initializing authenticated ciphers...");
    setErrorMessage("");
    setSavedPath(null);
    setSaveError(null);

    try {
      setTimeout(() => {
        setStatusPhase("Walking pixel channels and embedding ciphertext bitstreams...");
      }, 350);

      let result;
      if (mode === "decoy") {
        result = await api.hideMessage({
          imagePath: image.filePath,
          mode: "decoy",
          primary: { message: primaryMessage, password: primaryPassword },
          decoy: { message: decoyMessage, password: decoyPassword }
        });
      } else if (mode === "multi") {
        result = await api.hideMessage({
          imagePath: image.filePath,
          mode: "multi",
          entries: multiEntries.map((e) => ({ message: e.message, password: e.password }))
        });
      } else {
        result = await api.hideMessage({
          imagePath: image.filePath,
          message,
          password,
          mode
        });
      }

      if (result.success) {
        setHideResult(result);
        setStatus("success");

        historyStore.addEntry({
          type: "encode",
          fileName: image.fileName || "carrier.png",
          fileSize: image.fileSize,
          dimensions: { width: image.width, height: image.height },
          mode,
          payloadBytes: activePayloadBytes,
          status: "success"
        });
      } else {
        setStatus("error");
        setErrorMessage(result.error || "Failed to embed message into the carrier image.");
      }
    } catch (_err) {
      setStatus("error");
      setErrorMessage("An unexpected error occurred during steganography encoding.");
    }
  };

  const handleSaveOutput = async () => {
    setSaveError(null);

    try {
      const suggestedName = hideResult?.suggestedName || `abhedya_secret_${Date.now()}.png`;

      const saveRes = await api.saveOutput({
        suggestedName,
        bytes: hideResult?.pngBuffer,
        dataUrl: hideResult?.previewDataUrl,
        fileData: hideResult?.previewDataUrl,
        sourcePath: hideResult?.outputPath
      });

      if (saveRes?.canceled) return;

      if (saveRes?.success) {
        setSavedPath(saveRes.filePath);
      } else {
        setSaveError(saveRes?.error || "Failed to write encoded image to disk.");
      }
    } catch (_err) {
      setSaveError("An unexpected error occurred while saving the image.");
    }
  };

  const handleReset = () => {
    setMessage("");
    setPassword("");
    setConfirmPassword("");
    setPrimaryMessage("");
    setPrimaryPassword("");
    setPrimaryConfirmPassword("");
    setDecoyMessage("");
    setDecoyPassword("");
    setDecoyConfirmPassword("");
    setMultiEntries([
      { id: 1, message: "", password: "", confirmPassword: "" },
      { id: 2, message: "", password: "", confirmPassword: "" }
    ]);
    setStatus("idle");
    setHideResult(null);
    setSavedPath(null);
    setSaveError(null);
  };

  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto pr-1 pb-4 min-h-0 min-w-0">
      {/* Workspace Header - Clean & Focused */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono-technical uppercase tracking-wider text-[var(--accent-brass)] font-bold">
              WORKSPACE 01
            </span>
            <span className="text-[var(--border-strong)]">/</span>
            <span className="text-[10px] font-mono-technical uppercase text-[var(--text-secondary)]">
              CONCEALMENT
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-display font-bold text-[var(--text-primary)] tracking-wide uppercase mt-0.5 cyber-text-glow">
            Hide Secret Message
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-[var(--accent-brass-bg)] border border-[var(--accent-brass-border)] text-[10px] font-mono-technical text-[var(--accent-brass-text)] font-semibold uppercase">
            XChaCha20-Poly1305
          </span>
        </div>
      </div>

      {/* Main Grid: Left Primary Display, Right Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: CARRIER STAGE & CAPACITY (7 cols) */}
        <div className="lg:col-span-7 space-y-4 min-w-0">
          <div className="glass-panel p-4 border-[var(--border-medium)] relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-display font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                <CrosshairIcon size={14} className="text-[var(--accent-brass)]" />
                1. Carrier Imagery
              </span>
              {image && (
                <span className="text-[10px] font-mono-technical text-[var(--accent-brass-text)] flex items-center gap-1 font-bold uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-brass)] indicator-pulse" />
                  Loaded
                </span>
              )}
            </div>

            {!image ? (
              <ImageUploader
                onSelect={handleSelectImage}
                label="Select Carrier Image"
                sublabel="Select an uncompressed photo or graphic to act as steganographic vessel"
              />
            ) : (
              <ImagePreview
                image={image}
                onClear={handleClearImage}
                onChange={() => handleSelectImage()}
                title="Active Carrier Vessel"
              />
            )}
          </div>

          {/* Embedding Strategy Selector */}
          {image && (
            <div className="glass-panel p-4 border-[var(--border-medium)] space-y-2.5">
              <span className="text-xs font-display font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                <Layers size={14} className="text-[var(--accent-brass)]" />
                Embedding Strategy
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. Key-Seeded Scattering */}
                <label
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    mode === "scattered"
                      ? "bg-[var(--accent-brass-bg)] border-[var(--accent-brass)] shadow-[0_0_10px_rgba(0,255,136,0.15)]"
                      : "bg-[var(--bg-inset)] border-[var(--border-subtle)] hover:border-[var(--accent-cyan)] hover:shadow-[0_0_12px_rgba(0,240,255,0.25)]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-hud font-bold text-[var(--text-primary)] flex items-center gap-2">
                      <input
                        type="radio"
                        name="stego-mode"
                        value="scattered"
                        checked={mode === "scattered"}
                        onChange={(e) => setMode(e.target.value)}
                        className="accent-[var(--accent-brass)]"
                      />
                      Key-Seeded Scattering
                    </span>
                    <span className="text-[9px] font-mono-technical px-1.5 py-0.5 rounded bg-[var(--accent-brass-bg)] text-[var(--accent-brass-text)] font-bold uppercase">
                      Recommended
                    </span>
                  </div>
                  <p className="text-[11px] font-hud text-[var(--text-secondary)] pl-5 leading-normal">
                    PRNG pixel walk seeded with password hash. Disrupts linear Chi-Square detection.
                  </p>
                </label>

                {/* 2. Decoy Mode */}
                <label
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    mode === "decoy"
                      ? "bg-[var(--accent-brass-bg)] border-[var(--accent-brass)] shadow-[0_0_10px_rgba(0,255,136,0.15)]"
                      : "bg-[var(--bg-inset)] border-[var(--border-subtle)] hover:border-[var(--accent-cyan)] hover:shadow-[0_0_12px_rgba(0,240,255,0.25)]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-hud font-bold text-[var(--text-primary)] flex items-center gap-2">
                      <input
                        type="radio"
                        name="stego-mode"
                        value="decoy"
                        checked={mode === "decoy"}
                        onChange={(e) => setMode(e.target.value)}
                        className="accent-[var(--accent-brass)]"
                      />
                      Decoy Mode (Plausible Deniability)
                    </span>
                    <span className="text-[9px] font-mono-technical px-1.5 py-0.5 rounded bg-[var(--accent-amber-bg,rgba(255,170,0,0.15))] text-[var(--accent-amber,#ffaa00)] font-bold uppercase">
                      Dual-Carrier
                    </span>
                  </div>
                  <p className="text-[11px] font-hud text-[var(--text-secondary)] pl-5 leading-normal">
                    Embeds primary secret + innocuous decoy cover message under distinct passphrases.
                  </p>
                </label>

                {/* 3. Multi-Carrier Mode */}
                <label
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    mode === "multi"
                      ? "bg-[var(--accent-brass-bg)] border-[var(--accent-brass)] shadow-[0_0_10px_rgba(0,255,136,0.15)]"
                      : "bg-[var(--bg-inset)] border-[var(--border-subtle)] hover:border-[var(--accent-cyan)] hover:shadow-[0_0_12px_rgba(0,240,255,0.25)]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-hud font-bold text-[var(--text-primary)] flex items-center gap-2">
                      <input
                        type="radio"
                        name="stego-mode"
                        value="multi"
                        checked={mode === "multi"}
                        onChange={(e) => setMode(e.target.value)}
                        className="accent-[var(--accent-brass)]"
                      />
                      Multi-Carrier Mode
                    </span>
                    <span className="text-[9px] font-mono-technical px-1.5 py-0.5 rounded bg-[var(--accent-purple-bg,rgba(168,85,247,0.15))] text-[var(--accent-purple,#c084fc)] font-bold uppercase">
                      2-4 Secrets
                    </span>
                  </div>
                  <p className="text-[11px] font-hud text-[var(--text-secondary)] pl-5 leading-normal">
                    Conceal multiple independent encrypted messages across partitioned channels.
                  </p>
                </label>

                {/* 4. Standard Sequential */}
                <label
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    mode === "standard"
                      ? "bg-[var(--accent-brass-bg)] border-[var(--accent-brass)] shadow-[0_0_10px_rgba(0,255,136,0.15)]"
                      : "bg-[var(--bg-inset)] border-[var(--border-subtle)] hover:border-[var(--accent-cyan)] hover:shadow-[0_0_12px_rgba(0,240,255,0.25)]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-hud font-bold text-[var(--text-primary)] flex items-center gap-2">
                      <input
                        type="radio"
                        name="stego-mode"
                        value="standard"
                        checked={mode === "standard"}
                        onChange={(e) => setMode(e.target.value)}
                        className="accent-[var(--accent-brass)]"
                      />
                      Standard Sequential
                    </span>
                  </div>
                  <p className="text-[11px] font-hud text-[var(--text-secondary)] pl-5 leading-normal">
                    Contiguous RGB channel least-significant bit sequential allocation.
                  </p>
                </label>
              </div>
            </div>
          )}

          {/* Capacity Allocation Meter */}
          {image && (
            <CapacityMeter
              messageBytes={activePayloadBytes}
              maxPayloadBytes={capacity.maxPayloadBytes}
              overheadBytes={capacity.overheadBytes}
              isLoading={capacity.isLoading}
            />
          )}
        </div>

        {/* RIGHT COLUMN: SECRET PAYLOAD & CREDENTIALS (5 cols) */}
        <div className="lg:col-span-5 space-y-4 min-w-0">
          {/* A. DECOY MODE INPUTS */}
          {mode === "decoy" && (
            <>
              {/* Primary Secret Payload */}
              <div className="glass-panel p-4 border-[var(--border-medium)] space-y-3">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
                  <span className="text-xs font-display font-bold uppercase tracking-wider text-[var(--accent-brass)] flex items-center gap-2">
                    <Terminal size={14} className="text-[var(--accent-brass)]" />
                    2A. Primary Secret Payload
                  </span>
                  <span className="text-[10px] font-mono-technical text-[var(--accent-brass)]">
                    {primaryBytes.toLocaleString()} bytes (UTF-8)
                  </span>
                </div>

                <textarea
                  id="primary-message-input"
                  rows={4}
                  value={primaryMessage}
                  onChange={(e) => setPrimaryMessage(e.target.value)}
                  placeholder="Enter genuine classified intelligence to protect..."
                  className="w-full p-3 text-xs font-mono-technical bg-[var(--bg-inset)] border border-[var(--border-medium)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-brass)] focus:ring-1 focus:ring-[var(--accent-brass)] transition-all resize-y leading-relaxed"
                />

                <PasswordInput
                  password={primaryPassword}
                  onPasswordChange={setPrimaryPassword}
                  confirmPassword={primaryConfirmPassword}
                  onConfirmPasswordChange={setPrimaryConfirmPassword}
                  showConfirmation={true}
                  label="Primary Passphrase"
                  idPrefix="primary-pwd"
                />
              </div>

              {/* Decoy Cover Payload */}
              <div className="glass-panel p-4 border-[var(--border-medium)] space-y-3">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
                  <span className="text-xs font-display font-bold uppercase tracking-wider text-[var(--accent-amber,#ffaa00)] flex items-center gap-2">
                    <Terminal size={14} className="text-[var(--accent-amber,#ffaa00)]" />
                    2B. Decoy Cover Payload
                  </span>
                  <span className="text-[10px] font-mono-technical text-[var(--accent-amber,#ffaa00)]">
                    {decoyBytes.toLocaleString()} bytes (UTF-8)
                  </span>
                </div>

                <textarea
                  id="decoy-message-input"
                  rows={4}
                  value={decoyMessage}
                  onChange={(e) => setDecoyMessage(e.target.value)}
                  placeholder="Enter harmless decoy text (e.g. shopping list, recipe) for plausible deniability..."
                  className="w-full p-3 text-xs font-mono-technical bg-[var(--bg-inset)] border border-[var(--border-medium)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-brass)] focus:ring-1 focus:ring-[var(--accent-brass)] transition-all resize-y leading-relaxed"
                />

                <PasswordInput
                  password={decoyPassword}
                  onPasswordChange={setDecoyPassword}
                  confirmPassword={decoyConfirmPassword}
                  onConfirmPasswordChange={setDecoyConfirmPassword}
                  showConfirmation={true}
                  label="Decoy Passphrase"
                  idPrefix="decoy-pwd"
                />

                <p className="text-[10px] font-hud text-[var(--text-secondary)] italic">
                  Note: Providing the decoy passphrase later will extract only this cover message without disclosing the primary secret.
                </p>
              </div>
            </>
          )}

          {/* B. MULTI-CARRIER MODE INPUTS */}
          {mode === "multi" && (
            <div className="space-y-3">
              {multiEntries.map((entry, idx) => {
                const entryBytes = new TextEncoder().encode(entry.message).length;
                return (
                  <div key={entry.id} className="glass-panel p-4 border-[var(--border-medium)] space-y-3">
                    <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
                      <span className="text-xs font-display font-bold uppercase tracking-wider text-[var(--accent-purple,#c084fc)] flex items-center gap-2">
                        <Terminal size={14} className="text-[var(--accent-purple,#c084fc)]" />
                        Secret Message #{idx + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono-technical text-[var(--accent-purple,#c084fc)]">
                          {entryBytes} bytes
                        </span>
                        {multiEntries.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMultiEntry(idx)}
                            className="text-[10px] font-mono-technical text-[var(--accent-crimson-text)] hover:underline uppercase cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>

                    <textarea
                      rows={3}
                      value={entry.message}
                      onChange={(e) => handleUpdateMultiEntry(idx, "message", e.target.value)}
                      placeholder={`Enter secret message #${idx + 1}...`}
                      className="w-full p-2.5 text-xs font-mono-technical bg-[var(--bg-inset)] border border-[var(--border-medium)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-brass)] transition-all resize-y leading-relaxed"
                    />

                    <PasswordInput
                      password={entry.password}
                      onPasswordChange={(v) => handleUpdateMultiEntry(idx, "password", v)}
                      confirmPassword={entry.confirmPassword}
                      onConfirmPasswordChange={(v) => handleUpdateMultiEntry(idx, "confirmPassword", v)}
                      showConfirmation={true}
                      label={`Passphrase for Secret #${idx + 1}`}
                      idPrefix={`multi-pwd-${idx}`}
                    />
                  </div>
                );
              })}

              {multiEntries.length < 4 && (
                <button
                  type="button"
                  onClick={handleAddMultiEntry}
                  className="w-full py-2.5 px-3 rounded-lg border border-dashed border-[var(--accent-purple,#c084fc)]/50 text-[var(--accent-purple,#c084fc)] text-xs font-mono-technical uppercase tracking-wider hover:bg-[var(--accent-purple-bg,rgba(168,85,247,0.1))] transition-all cursor-pointer"
                >
                  + Add Secret Message #{multiEntries.length + 1} (Max 4)
                </button>
              )}
            </div>
          )}

          {/* C. SINGLE MESSAGE INPUTS (SCATTERED & STANDARD) */}
          {(mode === "scattered" || mode === "standard") && (
            <>
              {/* Secret Message Input Panel */}
              <div className="glass-panel p-4 border-[var(--border-medium)] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-display font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                    <Terminal size={14} className="text-[var(--accent-brass)]" />
                    2. Secret Payload
                  </span>
                  <span className="text-[10px] font-mono-technical text-[var(--accent-brass)]">
                    {singleBytes.toLocaleString()} bytes (UTF-8)
                  </span>
                </div>

                <textarea
                  id="secret-message-input"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter confidential plaintext to encrypt and conceal..."
                  className="w-full p-3 text-xs font-mono-technical bg-[var(--bg-inset)] border border-[var(--border-medium)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-brass)] focus:ring-1 focus:ring-[var(--accent-brass)] focus:shadow-[0_0_12px_rgba(0,255,136,0.2)] transition-all resize-y leading-relaxed"
                />

                <div className="flex items-center justify-between text-[10px] font-mono-technical text-[var(--text-muted)]">
                  <span>Plaintext is authenticated before pixel embed</span>
                  {message.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setMessage("")}
                      className="text-[var(--accent-crimson-text)] hover:underline uppercase transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Encryption Credentials */}
              <div className="glass-panel p-4 border-[var(--border-medium)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-display font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                    <KeyIcon size={14} className="text-[var(--accent-brass)]" />
                    3. Encryption Passphrase
                  </span>
                  <span className="text-[9px] font-mono-technical px-2 py-0.5 rounded bg-[var(--bg-inset)] text-[var(--accent-brass)] border border-[var(--border-subtle)] uppercase">
                    Argon2id
                  </span>
                </div>

                <PasswordInput
                  password={password}
                  onPasswordChange={setPassword}
                  confirmPassword={confirmPassword}
                  onConfirmPasswordChange={setConfirmPassword}
                  showConfirmation={true}
                  label="Secret Passphrase"
                  idPrefix="hide-pwd"
                />
              </div>
            </>
          )}

          {/* Execution & Operation Status Component */}
          <OperationStatus
            status={status}
            phase={statusPhase}
            error={errorMessage}
            output={hideResult}
            onSave={handleSaveOutput}
            onReset={handleReset}
            type="hide"
            savedFilePath={savedPath}
            saveError={saveError}
            onShowInFolder={(path) => api.showInFolder(path)}
          />

          {/* Execute Primary Trigger Button */}
          {status !== "success" && (
            <div className="pt-1">
              <button
                type="button"
                disabled={!isFormValid || status === "processing"}
                onClick={handleStartHide}
                className={`w-full py-3.5 px-4 rounded-xl font-display text-xs font-bold tracking-widest uppercase transition-all duration-200 flex items-center justify-center gap-2 ${
                  isFormValid && status !== "processing"
                    ? "cyber-btn-primary cursor-pointer active:scale-[0.99]"
                    : "bg-[var(--bg-inset)] border border-[var(--border-subtle)] text-[var(--text-muted)] cursor-not-allowed opacity-60"
                }`}
              >
                <LockIcon size={15} />
                <span>
                  {status === "processing"
                    ? "Encoding Ciphertext into Pixels..."
                    : getValidationErrorReason()}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
