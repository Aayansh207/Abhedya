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
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mode, setMode] = useState("scattered"); // 'scattered' (default) | 'standard'

  const [capacity, setCapacity] = useState({
    maxPayloadBytes: 0,
    overheadBytes: 64,
    isLoading: false
  });

  const [status, setStatus] = useState("idle");
  const [statusPhase, setStatusPhase] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [hideResult, setHideResult] = useState(null);
  const [savedPath, setSavedPath] = useState(null);
  const [saveError, setSaveError] = useState(null);

  const messageBytes = new TextEncoder().encode(message).length;

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

  const isFormValid =
    image &&
    message.trim().length > 0 &&
    password.length >= 8 &&
    password === confirmPassword &&
    messageBytes <= capacity.maxPayloadBytes;

  const handleStartHide = async () => {
    if (!isFormValid) return;

    setStatus("processing");
    setStatusPhase("Deriving Argon2id key and initializing authenticated cipher...");
    setErrorMessage("");
    setSavedPath(null);
    setSaveError(null);

    try {
      setTimeout(() => {
        setStatusPhase("Walking pixel channels and embedding ciphertext...");
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
          <div className="glass-panel p-4 border-[var(--border-medium)] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-display font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                <Terminal size={14} className="text-[var(--accent-brass)]" />
                2. Secret Payload
              </span>
              <span className="text-[10px] font-mono-technical text-[var(--accent-brass)]">
                {messageBytes.toLocaleString()} bytes (UTF-8)
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
                    : !image
                    ? "1. Select Carrier Image Above"
                    : message.trim().length === 0
                    ? "2. Enter Secret Message Above"
                    : password.length < 8
                    ? "3. Enter 8+ Character Passphrase"
                    : password !== confirmPassword
                    ? "4. Passphrase Mismatch"
                    : messageBytes > capacity.maxPayloadBytes
                    ? "Message Exceeds Capacity"
                    : "Encrypt & Embed Payload"}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
