import React from "react";
import { ImageIcon, TrashIcon } from "./Icons";

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export default function ImagePreview({ image, onClear, onChange }) {
  if (!image) return null;

  const { fileName, fileSize, width, height, format, previewDataUrl } = image;

  return (
    <div className="image-preview-card">
      <div className="preview-thumbnail-container">
        {previewDataUrl ? (
          <img src={previewDataUrl} alt={fileName || "Selected preview"} className="preview-thumbnail" />
        ) : (
          <div className="preview-placeholder">
            <ImageIcon size={36} />
          </div>
        )}
      </div>

      <div className="preview-details">
        <div className="preview-header">
          <h4 className="preview-filename" title={fileName}>
            {fileName || "Selected Image"}
          </h4>
          <span className="badge badge-format">{format ? format.toUpperCase() : "IMG"}</span>
        </div>

        <div className="preview-meta-grid">
          <div className="preview-meta-item">
            <span className="meta-label">Dimensions</span>
            <span className="meta-value">
              {width && height ? `${width} × ${height} px` : "Inspecting..."}
            </span>
          </div>

          <div className="preview-meta-item">
            <span className="meta-label">File Size</span>
            <span className="meta-value">{formatBytes(fileSize)}</span>
          </div>

          <div className="preview-meta-item">
            <span className="meta-label">Pixel Count</span>
            <span className="meta-value">
              {width && height ? `${(width * height).toLocaleString()} px` : "—"}
            </span>
          </div>
        </div>

        <div className="preview-actions">
          {onChange && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={onChange}>
              Change Image
            </button>
          )}
          {onClear && (
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={onClear}
              title="Remove image"
            >
              <TrashIcon size={14} />
              <span>Remove</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
