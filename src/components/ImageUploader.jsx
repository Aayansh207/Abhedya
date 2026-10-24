import React, { useState } from "react";
import { UploadIcon, ImageIcon, AlertCircleIcon } from "./Icons";

export default function ImageUploader({ onSelect, requirePng = false, label = "Select Image" }) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState("");

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    setDragError("");

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (requirePng && !file.name.toLowerCase().endsWith(".png")) {
      setDragError("The target image must be a lossless PNG file.");
      return;
    }

    // In Electron, file.path is the native file path; in browser fallback, use file
    const pathOrFile = file.path || file;
    if (onSelect) {
      onSelect(pathOrFile);
    }
  };

  return (
    <div className="image-uploader-wrapper">
      <div
        className={`image-dropzone ${isDragging ? "dragging" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => onSelect && onSelect()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onSelect && onSelect();
          }
        }}
      >
        <div className="dropzone-icon">
          <UploadIcon size={32} />
        </div>
        <div className="dropzone-text">
          <p className="dropzone-title">{label}</p>
          <p className="dropzone-subtitle">
            Click to browse with native dialog or drag & drop here
          </p>
        </div>
        <div className="dropzone-badges">
          {requirePng ? (
            <span className="badge badge-png">PNG Only (Lossless)</span>
          ) : (
            <>
              <span className="badge">PNG</span>
              <span className="badge">JPEG</span>
              <span className="badge">WebP</span>
              <span className="badge">BMP</span>
            </>
          )}
          <span className="badge badge-dim">Max 50MB · Up to 8192×8192</span>
        </div>
      </div>

      {dragError && (
        <div className="form-error">
          <AlertCircleIcon size={16} />
          <span>{dragError}</span>
        </div>
      )}
    </div>
  );
}
