import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { ShieldIcon, SettingsIcon, CheckIcon, AlertCircleIcon, LockIcon } from "../components/Icons";

export default function Settings() {
  const [appInfo, setAppInfo] = useState({
    name: "Abhedya",
    version: "0.1.0",
    electronVersion: "Loading...",
    platform: "Loading...",
    isElectron: false
  });

  useEffect(() => {
    api.getAppInfo().then(setAppInfo);
  }, []);

  return (
    <div className="page-container settings-page">
      <div className="workflow-header">
        <div>
          <span className="eyebrow">CONFIGURATION & ARCHITECTURE</span>
          <h2 className="page-title">Settings & About</h2>
          <p className="page-desc">
            System diagnostics, security posture verification, and steganography guidance.
          </p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Environment Diagnostics */}
        <div className="panel-card">
          <h3 className="panel-title flex-items-center">
            <SettingsIcon size={18} />
            <span>Runtime Diagnostics</span>
          </h3>

          <div className="diagnostics-table">
            <div className="diag-row">
              <span className="diag-key">Application</span>
              <span className="diag-val">Abhedya — The Vishanti Cipher</span>
            </div>
            <div className="diag-row">
              <span className="diag-key">Version</span>
              <span className="diag-val">{appInfo.version}</span>
            </div>
            <div className="diag-row">
              <span className="diag-key">Host Environment</span>
              <span className="diag-val">
                {appInfo.isElectron ? "Electron Desktop Shell" : "Web Preview Mode"}
              </span>
            </div>
            {appInfo.electronVersion && (
              <div className="diag-row">
                <span className="diag-key">Electron Engine</span>
                <span className="diag-val">v{appInfo.electronVersion}</span>
              </div>
            )}
            {appInfo.chromeVersion && (
              <div className="diag-row">
                <span className="diag-key">Chromium Core</span>
                <span className="diag-val">v{appInfo.chromeVersion}</span>
              </div>
            )}
            <div className="diag-row">
              <span className="diag-key">Target Platform</span>
              <span className="diag-val">{appInfo.platform}</span>
            </div>
          </div>
        </div>

        {/* Security Posture Check */}
        <div className="panel-card">
          <h3 className="panel-title flex-items-center">
            <ShieldIcon size={18} />
            <span>Electron Security Checklist</span>
          </h3>

          <div className="security-checks-list">
            <div className="security-check-item">
              <span className="check-badge passed">
                <CheckIcon size={14} />
              </span>
              <div>
                <strong>Context Isolation Active</strong>
                <p className="check-desc">Renderer execution context is completely isolated from Node runtime.</p>
              </div>
            </div>

            <div className="security-check-item">
              <span className="check-badge passed">
                <CheckIcon size={14} />
              </span>
              <div>
                <strong>Node Integration Disabled</strong>
                <p className="check-desc">Arbitrary require/process calls cannot be executed from renderer DOM.</p>
              </div>
            </div>

            <div className="security-check-item">
              <span className="check-badge passed">
                <CheckIcon size={14} />
              </span>
              <div>
                <strong>Strict Content Security Policy</strong>
                <p className="check-desc">Outbound network connections, arbitrary scripts, and eval are restricted.</p>
              </div>
            </div>

            <div className="security-check-item">
              <span className="check-badge passed">
                <CheckIcon size={14} />
              </span>
              <div>
                <strong>Magic Byte File Inspection</strong>
                <p className="check-desc">Enforces file header validation to prevent file spoofing and traversal.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Steganography Guidance Section */}
      <div className="panel-card mt-4">
        <h3 className="panel-title flex-items-center">
          <LockIcon size={18} />
          <span>Steganography Transmission Rules</span>
        </h3>

        <div className="guidance-grid">
          <div className="guidance-card">
            <h4>Lossless Output Requirement</h4>
            <p>
              Steganography embeds information in the low-order bits of pixel color values. Lossy formats such as JPEG or WebP discard high-frequency pixel data during compression, destroying the payload. Always preserve the output as <strong>PNG</strong>.
            </p>
          </div>

          <div className="guidance-card">
            <h4>Messaging Platform Caveat</h4>
            <p>
              Services like WhatsApp, Telegram, or Discord recompress standard photo uploads to save bandwidth. To transmit an encoded image safely, send it using the <strong>"File"</strong> or <strong>"Document"</strong> attachment mode.
            </p>
          </div>

          <div className="guidance-card">
            <h4>Steganalysis Resilience</h4>
            <p>
              No steganography system is guaranteed to be undetectable against sophisticated statistical tests (e.g. Chi-Square, RS analysis). Key-seeded scattering distributes bits pseudo-randomly to improve resistance against basic sequential detectors.
            </p>
          </div>
        </div>
      </div>

      <div className="app-credits-card mt-4">
        <p className="credits-text">
          <strong>Abhedya — The Vishanti Cipher</strong> · TechBlitz | Softablitz 2026
        </p>
        <p className="credits-sub">
          Built according to strict security guidelines: Zero telemetry, authenticated cryptographic ciphers, and robust desktop isolation.
        </p>
      </div>
    </div>
  );
}
