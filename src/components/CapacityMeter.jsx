import React from "react";
import { CheckIcon, AlertCircleIcon } from "./Icons";

function formatBytes(bytes) {
  if (bytes === undefined || bytes === null || isNaN(bytes)) return "0 B";
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export default function CapacityMeter({
  messageBytes = 0,
  maxPayloadBytes = 0,
  overheadBytes = 64,
  isLoading = false
}) {
  const safeMax = Math.max(0, maxPayloadBytes);
  const fits = safeMax > 0 && messageBytes <= safeMax;
  const isOversized = safeMax > 0 && messageBytes > safeMax;
  const percentage = safeMax > 0 ? Math.min(100, (messageBytes / safeMax) * 100) : 0;

  // Determine indicator color
  let barColor = "#10b981"; // green
  if (percentage > 85) barColor = "#ef4444"; // red
  else if (percentage > 60) barColor = "#f59e0b"; // amber

  if (isLoading) {
    return (
      <div className="capacity-card loading">
        <div className="capacity-header">
          <span className="capacity-title">Calculating image capacity...</span>
        </div>
        <div className="capacity-bar-track">
          <div className="capacity-bar-fill pulse" style={{ width: "40%" }} />
        </div>
      </div>
    );
  }

  return (
    <div className={`capacity-card ${isOversized ? "oversized" : ""}`}>
      <div className="capacity-header">
        <div className="capacity-title-group">
          <span className="capacity-title">Payload Capacity</span>
          <span className="capacity-sub">
            {formatBytes(messageBytes)} used of {formatBytes(safeMax)} available
          </span>
        </div>

        <div>
          {messageBytes === 0 ? (
            <span className="badge badge-neutral">Ready</span>
          ) : fits ? (
            <span className="badge badge-success">
              <CheckIcon size={12} />
              <span>Fits Carrier</span>
            </span>
          ) : (
            <span className="badge badge-danger">
              <AlertCircleIcon size={12} />
              <span>Exceeds Capacity</span>
            </span>
          )}
        </div>
      </div>

      <div className="capacity-bar-track">
        <div
          className="capacity-bar-fill"
          style={{
            width: `${percentage}%`,
            backgroundColor: isOversized ? "#ef4444" : barColor
          }}
        />
      </div>

      <div className="capacity-footer">
        <span className="capacity-stat">
          {percentage.toFixed(1)}% capacity utilized
        </span>
        <span className="capacity-overhead">
          Reserved header: ~{overheadBytes} bytes (Salt, IV, Auth Tag)
        </span>
      </div>

      {isOversized && (
        <div className="capacity-alert">
          <AlertCircleIcon size={16} />
          <span>
            Message is too large by {formatBytes(messageBytes - safeMax)}. Please shorten the message or use a higher resolution carrier image.
          </span>
        </div>
      )}
    </div>
  );
}
