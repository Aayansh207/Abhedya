import React, { useState } from "react";
import ImageUploader from "../components/ImageUploader";
import ImagePreview from "../components/ImagePreview";
import PasswordInput from "../components/PasswordInput";
import OperationStatus from "../components/OperationStatus";
import { api } from "../services/api";
import { UnlockIcon, ShieldIcon, AlertCircleIcon } from "../components/Icons";

export default function RevealMessage() {
  const [image, setImage] = useState(null);
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("standard"); // 'standard' | 'scattered'

  const [status, setStatus] = useState("idle"); // 'idle' | 'processing' | 'success' | 'error'
  const [statusPhase, setStatusPhase] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [revealResult, setRevealResult] = useState(null);

  const handleSelectImage = async () => {
    setStatus("idle");
    setErrorMessage("");
    setRevealResult(null);

    try {
      // Require lossless PNG for extraction
      const result = await api.selectImage({ requirePng: true });
      if (result.canceled) return;

      if (!result.success) {
        setErrorMessage(result.error || "Failed to inspect image file.");
        return;
      }

      setImage(result);
    } catch (_err) {
      setErrorMessage("Error selecting image file.");
    }
  };

  const handleClearImage = () => {
    setImage(null);
    setStatus("idle");
    setRevealResult(null);
    setErrorMessage("");
  };

  const isFormValid = image && password.length > 0;

  const handleStartReveal = async () => {
    if (!isFormValid) return;

    setStatus("processing");
    setStatusPhase("Inspecting pixel bitstreams and extracting header...");
    setErrorMessage("");
    setRevealResult(null);

    try {
      setTimeout(() => {
        setStatusPhase("Deriving keys and verifying authenticated decryption tag...");
      }, 400);

      const result = await api.revealMessage({
        imagePath: image.filePath,
        password,
        mode
      });

      if (result.success && result.message) {
        setRevealResult(result);
        setStatus("success");
      } else {
        setStatus("error");
        // Always display the generic failure message required by security rules
        setErrorMessage(
          result.error ||
            "Decryption failed. The password may be incorrect, or the image does not contain a valid encrypted payload."
        );
      }
    } catch (_err) {
      setStatus("error");
      setErrorMessage(
        "Decryption failed. The password may be incorrect, or the image does not contain a valid encrypted payload."
      );
    }
  };

  const handleReset = () => {
    setPassword("");
    setStatus("idle");
    setRevealResult(null);
    setErrorMessage("");
  };

  return (
    <div className="page-container workflow-page">
      <div className="workflow-header">
        <div>
          <span className="eyebrow">DECODE WORKFLOW</span>
          <h2 className="page-title">Reveal a Hidden Message</h2>
          <p className="page-desc">
            Recover and decrypt secret payload data from an encoded lossless PNG image.
          </p>
        </div>
      </div>

      <div className="workflow-grid">
        {/* Left Column: Encoded PNG Selection */}
        <div className="workflow-col">
          <div className="panel-card">
            <h3 className="panel-title">1. Encoded PNG Image</h3>
            {!image ? (
              <ImageUploader
                onSelect={handleSelectImage}
                requirePng={true}
                label="Select Encoded PNG"
              />
            ) : (
              <ImagePreview
                image={image}
                onClear={handleClearImage}
                onChange={handleSelectImage}
              />
            )}
          </div>

          <div className="panel-card mt-4">
            <h3 className="panel-title">Extraction Mode</h3>
            <div className="radio-pill-group">
              <label className={`radio-pill ${mode === "standard" ? "active" : ""}`}>
                <input
                  type="radio"
                  name="reveal-mode"
                  value="standard"
                  checked={mode === "standard"}
                  onChange={(e) => setMode(e.target.value)}
                />
                <div>
                  <strong>Standard Sequential</strong>
                  <span className="pill-sub">Default contiguous bit extraction</span>
                </div>
              </label>

              <label className={`radio-pill ${mode === "scattered" ? "active" : ""}`}>
                <input
                  type="radio"
                  name="reveal-mode"
                  value="scattered"
                  checked={mode === "scattered"}
                  onChange={(e) => setMode(e.target.value)}
                />
                <div>
                  <strong>Key-Seeded Scattering</strong>
                  <span className="pill-sub">Password-derived pseudo-random walk</span>
                </div>
              </label>
            </div>
          </div>

          <div className="info-callout mt-4">
            <ShieldIcon size={18} />
            <div className="callout-text">
              <strong>Zero-Leakage Assurance:</strong> Decrypted plaintexts are only surfaced in memory when the cryptographic authentication tag matches the ciphertext perfectly.
            </div>
          </div>
        </div>

        {/* Right Column: Password & Action */}
        <div className="workflow-col">
          <div className="panel-card">
            <h3 className="panel-title">2. Decryption Password</h3>
            <PasswordInput
              password={password}
              onPasswordChange={setPassword}
              showConfirmation={false}
              label="Decryption Password"
              idPrefix="reveal-pwd"
            />
          </div>

          <div className="mt-4">
            <OperationStatus
              status={status}
              phase={statusPhase}
              error={errorMessage}
              output={revealResult}
              onReset={handleReset}
              type="reveal"
            />
          </div>

          {status !== "success" && (
            <div className="action-button-panel mt-4">
              <button
                type="button"
                className="btn btn-primary btn-large w-full"
                disabled={!isFormValid || status === "processing"}
                onClick={handleStartReveal}
              >
                <UnlockIcon size={18} />
                <span>
                  {status === "processing" ? "Extracting..." : "Extract & Decrypt Message"}
                </span>
              </button>

              {!image && (
                <p className="field-hint text-center">Please select an encoded PNG image to begin.</p>
              )}
              {image && password.length === 0 && (
                <p className="field-hint text-center">Please enter the password used during encoding.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
