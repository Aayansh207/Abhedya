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
  AlertCircleIcon,
  CrosshairIcon,
  Terminal,
  ActivityIcon,
  Layers,
  KeyIcon,
  Sparkles
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
      const result = await api.selectImage();
      if (result.canceled) return;

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
      let pngDataUrl = image?.previewDataUrl;

      // In browser fallback, convert canvas to genuine PNG
      if (image?.previewDataUrl && typeof document !== "undefined") {
        try {
          const img = new Image();
          img.src = image.previewDataUrl;
          await new Promise((res) => {
            if (img.complete) res();
            else {
              img.onload = res;
              img.onerror = res;
            }
          });
          const canvas = document.createElement("canvas");
          canvas.width = image.width || img.naturalWidth || 800;
          canvas.height = image.height || img.naturalHeight || 600;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          pngDataUrl = canvas.toDataURL("image/png");
        } catch (_canvasErr) {}
      }

      const saveRes = await api.saveOutput({
        suggestedName,
        fileData: pngDataUrl,
        dataUrl: pngDataUrl,
        sourcePath: image?.filePath,
        bytes: hideResult?.pngBuffer
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
    <div className="h-full flex flex-col gap-5 overflow-y-auto pr-1">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#c5a059]">
              WORKSPACE // 01
            </span>
            <span className="text-zinc-600">/</span>
            <span className="text-[10px] font-mono uppercase text-zinc-400">
              PAYLOAD EMBEDDING
            </span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
            Hide Secret Message
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-[#c5a059]/10 border border-[#c5a059]/25 text-[11px] font-mono text-[#e5be6b] flex items-center gap-1.5">
            <LockIcon size={12} />
            <span>XChaCha20-Poly1305</span>
          </span>
          <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[11px] font-mono text-zinc-400">
            LSB Bitstream
          </span>
        </div>
      </div>

      {/* Main Grid: Left Primary Display, Right Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: CARRIER STAGE & CAPACITY (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel p-4 bg-[#0f1118]/85 border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-semibold uppercase text-zinc-300 flex items-center gap-2">
                <CrosshairIcon size={14} className="text-[#c5a059]" />
                1. Carrier Imagery
              </span>
              {image && (
                <span className="text-[11px] font-mono text-[#34d399] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                  LOADED
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
            <div className="glass-panel p-4 bg-[#0f1118]/85 border-white/10 space-y-3">
              <span className="text-xs font-mono font-semibold uppercase text-zinc-300 flex items-center gap-2">
                <Layers size={14} className="text-[#c5a059]" />
                Embedding Strategy
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <label
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    mode === "scattered"
                      ? "bg-[#c5a059]/10 border-[#c5a059]/60 shadow-[0_0_15px_rgba(197,160,89,0.15)]"
                      : "bg-black/30 border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-bold text-zinc-100 flex items-center gap-1.5">
                      <input
                        type="radio"
                        name="stego-mode"
                        value="scattered"
                        checked={mode === "scattered"}
                        onChange={(e) => setMode(e.target.value)}
                        className="accent-[#c5a059]"
                      />
                      Key-Seeded Scattering
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#c5a059]/20 text-[#e5be6b]">
                      RECOMMENDED
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 pl-5 leading-normal">
                    PRNG pixel walk seeded with password hash. Disrupts linear Chi-Square detection.
                  </p>
                </label>

                <label
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    mode === "standard"
                      ? "bg-[#c5a059]/10 border-[#c5a059]/60 shadow-[0_0_15px_rgba(197,160,89,0.15)]"
                      : "bg-black/30 border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-bold text-zinc-100 flex items-center gap-1.5">
                      <input
                        type="radio"
                        name="stego-mode"
                        value="standard"
                        checked={mode === "standard"}
                        onChange={(e) => setMode(e.target.value)}
                        className="accent-[#c5a059]"
                      />
                      Standard Sequential
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 pl-5 leading-normal">
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
        <div className="lg:col-span-5 space-y-4">
          {/* Secret Message Input Panel */}
          <div className="glass-panel p-4 bg-[#0f1118]/85 border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold uppercase text-zinc-300 flex items-center gap-2">
                <Terminal size={14} className="text-[#c5a059]" />
                2. Secret Payload
              </span>
              <span className="text-[11px] font-mono text-zinc-400">
                {messageBytes.toLocaleString()} bytes (UTF-8)
              </span>
            </div>

            <textarea
              id="secret-message-input"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter confidential plaintext to encrypt and conceal..."
              className="w-full p-3 text-xs font-mono bg-[#090b0e] border border-white/10 rounded-lg text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059]/40 transition-all resize-y leading-relaxed"
            />

            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
              <span>Plaintext will not touch carrier pixels</span>
              {message.length > 0 && (
                <button
                  type="button"
                  onClick={() => setMessage("")}
                  className="text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Encryption Credentials */}
          <div className="glass-panel p-4 bg-[#0f1118]/85 border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold uppercase text-zinc-300 flex items-center gap-2">
                <KeyIcon size={14} className="text-[#c5a059]" />
                3. Encryption Passphrase
              </span>
              <span className="text-[10px] font-mono text-zinc-500">ARGON2ID / SCRYPT</span>
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
            <div className="space-y-2 pt-1">
              <button
                type="button"
                disabled={!isFormValid || status === "processing"}
                onClick={handleStartHide}
                className={`w-full py-3 px-4 rounded-xl font-mono text-xs font-bold tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 shadow-2xl ${
                  isFormValid && status !== "processing"
                    ? "bg-[#c5a059] hover:bg-[#d8b671] text-black shadow-[0_0_20px_rgba(197,160,89,0.3)] active:scale-[0.99] cursor-pointer"
                    : "bg-white/5 border border-white/5 text-zinc-600 cursor-not-allowed"
                }`}
              >
                <LockIcon size={16} />
                <span>
                  {status === "processing"
                    ? "Executing Cipher Embedding..."
                    : "Encrypt & Embed Payload"}
                </span>
              </button>

              {/* Tactical Validation Helper Tips */}
              {!image && (
                <p className="text-[11px] font-mono text-center text-zinc-500">
                  Select a carrier image above to initialize payload buffer.
                </p>
              )}
              {image && message.trim().length === 0 && (
                <p className="text-[11px] font-mono text-center text-zinc-500">
                  Enter your confidential secret message.
                </p>
              )}
              {image && message.trim().length > 0 && password.length < 8 && (
                <p className="text-[11px] font-mono text-center text-amber-500/80">
                  Passphrase must be at least 8 characters.
                </p>
              )}
              {image && password.length >= 8 && password !== confirmPassword && (
                <p className="text-[11px] font-mono text-center text-rose-400">
                  Passphrase confirmation does not match.
                </p>
              )}
              {image && messageBytes > capacity.maxPayloadBytes && (
                <p className="text-[11px] font-mono text-center text-rose-400">
                  Message exceeds maximum carrier payload capacity.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
