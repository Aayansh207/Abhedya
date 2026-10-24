import React, { useState, useEffect } from "react";
import ImageUploader from "../components/ImageUploader";
import ImagePreview from "../components/ImagePreview";
import PasswordInput from "../components/PasswordInput";
import CapacityMeter from "../components/CapacityMeter";
import OperationStatus from "../components/OperationStatus";
import { api } from "../services/api";
import { LockIcon, ShieldIcon, AlertCircleIcon } from "../components/Icons";

export default function HideMessage() {
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mode, setMode] = useState("standard"); // 'standard' | 'scattered'

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
      let result;
      if (typeof directFileOrPath === "string") {
        result = await api.selectImage();
      } else {
        result = await api.selectImage();
      }

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
      setErrorMessage("Error selecting image file.");
    }
  };

  // Re-estimate capacity if mode changes
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

  // Validation before submission
  const isFormValid =
    image &&
    message.trim().length > 0 &&
    password.length >= 8 &&
    password === confirmPassword &&
    messageBytes <= capacity.maxPayloadBytes;

  const handleStartHide = async () => {
    if (!isFormValid) return;

    setStatus("processing");
    setStatusPhase("Deriving cryptographic keys & initializing cipher...");
    setErrorMessage("");
    setSavedPath(null);
    setSaveError(null);

    try {
      // Step simulation for responsive feedback
      setTimeout(() => {
        setStatusPhase("Embedding encrypted payload into pixel channels...");
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
      } else {
        setStatus("error");
        setErrorMessage(result.error || "Failed to embed message into the image.");
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

      // Ensure data is converted to genuine PNG format via canvas if available
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
        } catch (_canvasErr) {
          // fallback to original preview data url
        }
      }

      const saveRes = await api.saveOutput({
        suggestedName,
        fileData: pngDataUrl,
        dataUrl: pngDataUrl,
        sourcePath: image?.filePath
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
    <div className="page-container workflow-page">
      <div className="workflow-header">
        <div>
          <span className="eyebrow">ENCODE WORKFLOW</span>
          <h2 className="page-title">Hide a Secret Message</h2>
          <p className="page-desc">
            Encrypt confidential text and embed it into carrier image pixels.
          </p>
        </div>
      </div>

      <div className="workflow-grid">
        {/* Left Column: Image Selection & Preview */}
        <div className="workflow-col">
          <div className="panel-card">
            <h3 className="panel-title">1. Carrier Image</h3>
            {!image ? (
              <ImageUploader
                onSelect={handleSelectImage}
                label="Select Carrier Image"
              />
            ) : (
              <ImagePreview
                image={image}
                onClear={handleClearImage}
                onChange={() => handleSelectImage()}
              />
            )}
          </div>

          {image && (
            <div className="panel-card mt-4">
              <h3 className="panel-title">Embedding Mode</h3>
              <div className="radio-pill-group">
                <label className={`radio-pill ${mode === "standard" ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="stego-mode"
                    value="standard"
                    checked={mode === "standard"}
                    onChange={(e) => setMode(e.target.value)}
                  />
                  <div>
                    <strong>Standard Sequential</strong>
                    <span className="pill-sub">Linear RGB pixel least-significant bits</span>
                  </div>
                </label>

                <label className={`radio-pill ${mode === "scattered" ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="stego-mode"
                    value="scattered"
                    checked={mode === "scattered"}
                    onChange={(e) => setMode(e.target.value)}
                  />
                  <div>
                    <strong>Key-Seeded Scattering</strong>
                    <span className="pill-sub">PRNG pseudo-randomized pixel walk</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {image && (
            <div className="panel-card mt-4">
              <CapacityMeter
                messageBytes={messageBytes}
                maxPayloadBytes={capacity.maxPayloadBytes}
                overheadBytes={capacity.overheadBytes}
                isLoading={capacity.isLoading}
              />
            </div>
          )}
        </div>

        {/* Right Column: Message & Password */}
        <div className="workflow-col">
          <div className="panel-card">
            <h3 className="panel-title">2. Secret Message</h3>
            <div className="form-field">
              <label htmlFor="secret-message-input" className="field-label">
                <span>Confidential Text</span>
                <span className="byte-count">{messageBytes.toLocaleString()} bytes</span>
              </label>
              <textarea
                id="secret-message-input"
                className="text-area"
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type or paste the secret message you want to hide..."
              />
            </div>
          </div>

          <div className="panel-card mt-4">
            <h3 className="panel-title">3. Encryption Credentials</h3>
            <PasswordInput
              password={password}
              onPasswordChange={setPassword}
              confirmPassword={confirmPassword}
              onConfirmPasswordChange={setConfirmPassword}
              showConfirmation={true}
              label="Encryption Password"
              idPrefix="hide-pwd"
            />
          </div>

          <div className="mt-4">
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
          </div>

          {status !== "success" && (
            <div className="action-button-panel mt-4">
              <button
                type="button"
                className="btn btn-primary btn-large w-full"
                disabled={!isFormValid || status === "processing"}
                onClick={handleStartHide}
              >
                <LockIcon size={18} />
                <span>
                  {status === "processing" ? "Embedding..." : "Encrypt & Embed Message"}
                </span>
              </button>

              {!image && (
                <p className="field-hint text-center">Please select a carrier image to begin.</p>
              )}
              {image && message.trim().length === 0 && (
                <p className="field-hint text-center">Please enter a secret message.</p>
              )}
              {image && message.trim().length > 0 && password.length < 8 && (
                <p className="field-hint text-center">Password must be at least 8 characters long.</p>
              )}
              {image && password.length >= 8 && password !== confirmPassword && (
                <p className="field-hint text-center text-danger">Passwords do not match.</p>
              )}
              {image && messageBytes > capacity.maxPayloadBytes && (
                <p className="field-hint text-center text-danger">
                  Message exceeds image maximum payload capacity.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
