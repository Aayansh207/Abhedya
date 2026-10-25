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
  ShieldIcon,
  CrosshairIcon,
  Terminal,
  Layers,
  KeyIcon,
  CpuIcon
} from "../components/Icons";

export default function HideMessage() {
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mode, setMode] = useState("scattered"); // 'scattered' (default) | 'standard'

  const [capacity, setCapacity] = useState({
    maxPayloadBytes: 0,
    overheadBytes: 64,
    isLoading: false
  });

  const [status, setStatus] = useState("idle"); // 'idle' | 'processing' | 'success' | 'error'
  const [statusPhase, setStatusPhase] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [hideResult, setHideResult] = useState(null);
  const [savedPath, setSavedPath] = useState(null);
  const [saveError, setSaveError] = useState(null);

  // Calculate message byte size (UTF-8)
  const messageBytes = new TextEncoder().encode(message).length;

  // Handle image selection
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

      // Estimate capacity
      setCapacity((prev) => ({ ...prev, isLoading: true }));
      const capResult = await api.estimateCapacity({
        imagePath: result.filePath,
        width: result.width,
        height: result.height,
        mode
      });

      if (capResult.success) {
        setCapacity({
          maxPayloadBytes: capResult.maxPayloadBytes,
          overheadBytes: capResult.overheadBytes || 64,
          isLoading: false
        });
      } else {
        setCapacity((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (_err) {
      setErrorMessage("Error selecting carrier image file.");
    }
  };

  // Re-estimate capacity if mode or image changes
  useEffect(() => {
    if (image?.filePath) {
      api.estimateCapacity({
        imagePath: image.filePath,
        width: image.width,
        height: image.height,
        mode
      }).then((capResult) => {
        if (capResult.success) {
          setCapacity({
            maxPayloadBytes: capResult.maxPayloadBytes,
            overheadBytes: capResult.overheadBytes || 64,
            isLoading: false
          });
        }
      });
    }
  }, [mode, image]);

  const handleClearImage = () => {
    setImage(null);
    setCapacity({ maxPayloadBytes: 0, overheadBytes: 64, isLoading: false });
    setStatus("idle");
    setHideResult(null);
    setSavedPath(null);
    setSaveError(null);
  };

  // Form validation
  const isFormValid =
    image &&
    message.trim().length > 0 &&
    password.length >= 8 &&
    password === confirmPassword &&
    messageBytes <= capacity.maxPayloadBytes;

  const handleStartHide = async () => {
    if (!isFormValid) return;

    setStatus("processing");
    setStatusPhase("Deriving Argon2id/Scrypt key and initializing authenticated cipher...");
    setErrorMessage("");
    setSavedPath(null);
    setSaveError(null);

    try {
      setTimeout(() => {
        setStatusPhase("Walking discrete pixel channels and embedding ciphertext...");
      }, 350);

      const result = await api.hideMessage({
        imagePath: image.filePath,
        message,
        password,
        mode
      });

      if (result.success) {
        setHideResult(result);
        setStatus("success");

        // Record in local history store
        historyStore.addEntry({
          type: "encode",
          fileName: image.fileName || "carrier.png",
          fileSize: image.fileSize,
          dimensions: { width: image.width, height: image.height },
          mode,
          payloadBytes: messageBytes,
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
    setStatus("idle");
    setHideResult(null);
    setSavedPath(null);
    setSaveError(null);
  };

  return (
    <div className="h-full flex flex-col gap-4 sm:gap-5 overflow-y-auto pr-1 pb-4 min-h-0 min-w-0">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-medium)] pb-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-display font-bold uppercase tracking-widest text-[var(--accent-brass)]">
              WORKSPACE // 01
            </span>
            <span className="text-[var(--border-strong)]">/</span>
            <span className="text-[10px] font-mono-technical uppercase text-[var(--text-secondary)]">
              PAYLOAD EMBEDDING
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-display font-bold text-[var(--text-primary)] tracking-wider uppercase mt-0.5 cyber-text-glow">
            Hide Secret Message
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 cyber-cut-corner-sm bg-[var(--accent-brass-bg)] border border-[var(--accent-brass-border)] text-[10px] font-mono-technical text-[var(--accent-brass-text)] flex items-center gap-1.5 font-bold uppercase">
            <LockIcon size={12} />
            <span>XCHACHA20-POLY1305</span>
          </span>
          <span className="px-3 py-1 cyber-cut-corner-sm bg-[var(--bg-inset)] border border-[var(--border-medium)] text-[10px] font-mono-technical text-[var(--text-secondary)] uppercase">
            LSB BITSTREAM
          </span>
        </div>
      </div>

      {/* Main Grid: Left Primary Display, Right Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: CARRIER STAGE & CAPACITY (7 cols) */}
        <div className="lg:col-span-7 space-y-4 min-w-0">
          <div className="glass-panel cyber-cut-corner p-4 border-[var(--border-strong)] relative">
            <div className="corner-bracket-tl" />
            <div className="corner-bracket-tr" />
            <div className="corner-bracket-bl" />
            <div className="corner-bracket-br" />

            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-display font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                <CrosshairIcon size={14} className="text-[var(--accent-brass)]" />
                1. CARRIER IMAGERY
              </span>
              {image && (
                <span className="text-[10px] font-mono-technical text-[var(--accent-brass-text)] flex items-center gap-1.5 font-bold uppercase cyber-glow-green-sm px-2 py-0.5 cyber-cut-corner-sm bg-[var(--accent-brass-bg)] border border-[var(--accent-brass-border)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-brass)] indicator-pulse" />
                  VESSEL READY
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
            <div className="glass-panel cyber-cut-corner p-4 border-[var(--border-strong)] space-y-3 relative">
              <span className="text-xs font-display font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                <Layers size={14} className="text-[var(--accent-brass)]" />
                EMBEDDING STRATEGY
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <label
                  className={`p-3 cyber-cut-corner-sm border cursor-pointer transition-all ${
                    mode === "scattered"
                      ? "bg-[var(--accent-brass-bg)] border-[var(--accent-brass)] cyber-glow-green-sm"
                      : "bg-[var(--bg-inset)] border-[var(--border-medium)] hover:border-[var(--accent-brass)]"
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
                    <span className="text-[9px] font-mono-technical px-1.5 py-0.5 cyber-cut-corner-sm bg-[var(--accent-brass-bg)] text-[var(--accent-brass-text)] font-bold border border-[var(--accent-brass-border)] uppercase">
                      STEALTH
                    </span>
                  </div>
                  <p className="text-[11px] font-hud text-[var(--text-secondary)] pl-6 leading-normal">
                    PRNG pixel walk seeded with password hash. Disrupts linear Chi-Square detection.
                  </p>
                </label>

                <label
                  className={`p-3 cyber-cut-corner-sm border cursor-pointer transition-all ${
                    mode === "standard"
                      ? "bg-[var(--accent-brass-bg)] border-[var(--accent-brass)] cyber-glow-green-sm"
                      : "bg-[var(--bg-inset)] border-[var(--border-medium)] hover:border-[var(--accent-brass)]"
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
                  <p className="text-[11px] font-hud text-[var(--text-secondary)] pl-6 leading-normal">
                    Contiguous RGB channel least-significant bit sequential allocation.
                  </p>
                </label>
              </div>
            </div>
          )}

          {/* Capacity Allocation Meter */}
          {image && (
            <CapacityMeter
              messageBytes={messageBytes}
              maxPayloadBytes={capacity.maxPayloadBytes}
              overheadBytes={capacity.overheadBytes}
              isLoading={capacity.isLoading}
            />
          )}
        </div>

        {/* RIGHT COLUMN: SECRET PAYLOAD & CREDENTIALS (5 cols) */}
        <div className="lg:col-span-5 space-y-4 min-w-0">
          {/* Secret Message Input Panel */}
          <div className="glass-panel cyber-cut-corner p-4 border-[var(--border-strong)] space-y-2.5 relative">
            <div className="corner-bracket-tl" />
            <div className="corner-bracket-tr" />
            <div className="corner-bracket-bl" />
            <div className="corner-bracket-br" />

            <div className="flex items-center justify-between">
              <span className="text-xs font-display font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                <Terminal size={14} className="text-[var(--accent-brass)]" />
                2. SECRET PAYLOAD
              </span>
              <span className="text-[10px] font-mono-technical text-[var(--accent-brass)]">
                {messageBytes.toLocaleString()} BYTES (UTF-8)
              </span>
            </div>

            <textarea
              id="secret-message-input"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter confidential plaintext to encrypt and conceal..."
              className="w-full p-3 text-xs font-mono-technical bg-[var(--bg-inset)] border border-[var(--border-medium)] cyber-cut-corner-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-brass)] focus:ring-1 focus:ring-[var(--accent-brass)] focus:shadow-[0_0_12px_rgba(0,255,136,0.25)] transition-all resize-y leading-relaxed"
            />

            <div className="flex items-center justify-between text-[10px] font-mono-technical text-[var(--text-muted)]">
              <span>PLAINTEXT NEVER EMBEDDED DIRECTLY</span>
              {message.length > 0 && (
                <button
                  type="button"
                  onClick={() => setMessage("")}
                  className="text-[var(--accent-crimson-text)] hover:underline uppercase transition-colors"
                >
                  Clear Buffer
                </button>
              )}
            </div>
          </div>

          {/* Encryption Credentials */}
          <div className="glass-panel cyber-cut-corner p-4 border-[var(--border-strong)] space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-display font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                <KeyIcon size={14} className="text-[var(--accent-brass)]" />
                3. ENCRYPTION PASSPHRASE
              </span>
              <span className="text-[9px] font-mono-technical px-1.5 py-0.5 cyber-cut-corner-sm bg-[var(--bg-inset)] text-[var(--accent-brass)] border border-[var(--border-subtle)] uppercase">
                ARGON2ID
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

          {/* Execute Primary Trigger Button (Styled like "RAISE" in reference) */}
          {status !== "success" && (
            <div className="space-y-2 pt-1">
              <button
                type="button"
                disabled={!isFormValid || status === "processing"}
                onClick={handleStartHide}
                className={`w-full py-3.5 px-4 font-display text-xs font-bold tracking-widest uppercase transition-all duration-200 flex items-center justify-center gap-2 ${
                  isFormValid && status !== "processing"
                    ? "cyber-btn-primary cursor-pointer active:scale-[0.99]"
                    : "bg-[var(--bg-inset)] border border-[var(--border-subtle)] cyber-cut-corner-sm text-[var(--text-muted)] cursor-not-allowed opacity-60"
                }`}
              >
                <LockIcon size={16} />
                <span>
                  {status === "processing"
                    ? "EXECUTING CIPHER EMBEDDING..."
                    : "ENCRYPT & EMBED PAYLOAD"}
                </span>
              </button>

              {/* Validation Helper Tips in Cyber Badges */}
              {!image && (
                <p className="text-[10px] font-mono-technical text-center text-[var(--text-muted)] uppercase">
                  [ STEP 1 ]: Select a carrier image above to initialize payload buffer.
                </p>
              )}
              {image && message.trim().length === 0 && (
                <p className="text-[10px] font-mono-technical text-center text-[var(--text-muted)] uppercase">
                  [ STEP 2 ]: Enter your confidential secret message.
                </p>
              )}
              {image && message.trim().length > 0 && password.length < 8 && (
                <p className="text-[10px] font-mono-technical text-center text-[var(--accent-amber-text)] uppercase">
                  [ SECURITY ]: Passphrase must be at least 8 characters.
                </p>
              )}
              {image && password.length >= 8 && password !== confirmPassword && (
                <p className="text-[10px] font-mono-technical text-center text-[var(--accent-crimson-text)] uppercase">
                  [ ERROR ]: Passphrase confirmation does not match.
                </p>
              )}
              {image && messageBytes > capacity.maxPayloadBytes && (
                <p className="text-[10px] font-mono-technical text-center text-[var(--accent-crimson-text)] uppercase">
                  [ OVERFLOW ]: Message exceeds maximum carrier payload capacity.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
