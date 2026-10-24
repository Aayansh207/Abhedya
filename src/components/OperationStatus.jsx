import React, { useState } from "react";
import { CheckIcon, AlertCircleIcon, DownloadIcon, CopyIcon, ShieldIcon } from "./Icons";

export default function OperationStatus({
  status, // 'idle' | 'processing' | 'success' | 'error'
  statusMessage,
  phase = "",
  error,
  output,
  onSave,
  onReset,
  type = "hide", // 'hide' | 'reveal'
  savedFilePath = null,
  onShowInFolder = null,
  saveError = null
}) {
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [copiedPath, setCopiedPath] = useState(false);

  if (status === "idle") return null;

  const handleCopyMessage = () => {
    if (output?.message) {
      navigator.clipboard.writeText(output.message);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2000);
    }
  };

  const handleCopyPath = () => {
    if (savedFilePath) {
      navigator.clipboard.writeText(savedFilePath);
      setCopiedPath(true);
      setTimeout(() => setCopiedPath(false), 2000);
    }
  };

  return (
    <div className={`operation-status-panel status-${status}`}>
      {status === "processing" && (
        <div className="status-content">
          <div className="status-spinner-wrapper">
            <div className="status-spinner" />
          </div>
          <div className="status-text">
            <h4 className="status-title">
              {type === "hide" ? "Embedding Encrypted Payload..." : "Extracting & Decrypting Payload..."}
            </h4>
            <p className="status-sub">
              {phase || "Applying authenticated cryptographic ciphers and pixel channel operations."}
            </p>
          </div>
        </div>
      )}

      {status === "success" && (
        <div className="status-content">
          <div className="status-icon success-icon">
            <CheckIcon size={24} />
          </div>
          <div className="status-text w-full">
            <h4 className="status-title">
              {type === "hide" ? "Encoding Complete!" : "Message Recovered Successfully!"}
            </h4>
            <p className="status-sub">
              {statusMessage ||
                (type === "hide"
                  ? "Your secret message was encrypted and embedded into the carrier image."
                  : "Authenticated decryption passed. Recovered plaintext message below.")}
            </p>

            {type === "reveal" && output?.message && (
              <div className="recovered-message-box">
                <div className="recovered-message-header">
                  <span className="recovered-label">Decrypted Plaintext</span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleCopyMessage}
                  >
                    {copiedMessage ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                    <span>{copiedMessage ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
                <div className="recovered-message-content">
                  <pre>{output.message}</pre>
                </div>
              </div>
            )}

            {/* Saved File Confirmation Banner */}
            {savedFilePath && (
              <div className="saved-file-confirmation">
                <div className="saved-file-icon">
                  <CheckIcon size={18} />
                </div>
                <div className="saved-file-details">
                  <span className="saved-file-title">File Saved Successfully</span>
                  <span className="saved-file-path" title={savedFilePath}>
                    {savedFilePath}
                  </span>
                </div>
                <div className="saved-file-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleCopyPath}
                    title="Copy full path"
                  >
                    {copiedPath ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
                    <span>{copiedPath ? "Copied" : "Copy Path"}</span>
                  </button>
                  {onShowInFolder && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => onShowInFolder(savedFilePath)}
                    >
                      Show in Folder
                    </button>
                  )}
                </div>
              </div>
            )}

            {saveError && (
              <div className="save-error-banner mt-3">
                <AlertCircleIcon size={16} />
                <span>{saveError}</span>
              </div>
            )}

            <div className="status-action-row">
              {type === "hide" && onSave && (
                <button type="button" className="btn btn-primary" onClick={onSave}>
                  <DownloadIcon size={16} />
                  <span>
                    {savedFilePath ? "Save Another Copy..." : "Save Encoded PNG Image"}
                  </span>
                </button>
              )}

              {onReset && (
                <button type="button" className="btn btn-secondary" onClick={onReset}>
                  <span>{type === "hide" ? "Encode Another" : "Reveal Another"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="status-content">
          <div className="status-icon error-icon">
            <AlertCircleIcon size={24} />
          </div>
          <div className="status-text">
            <h4 className="status-title">Operation Failed</h4>
            <p className="status-sub">
              {error ||
                "An error occurred while processing the request. Please verify your inputs and try again."}
            </p>
            <div className="security-notice">
              <ShieldIcon size={14} />
              <span>
                For security reasons, detailed cryptographic failures are masked to prevent side-channel leaks.
              </span>
            </div>
            {onReset && (
              <div className="status-action-row mt-3">
                <button type="button" className="btn btn-secondary btn-sm" onClick={onReset}>
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
