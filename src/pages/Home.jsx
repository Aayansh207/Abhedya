import React from "react";
import { LockIcon, UnlockIcon, ShieldIcon, ImageIcon, AlertCircleIcon } from "../components/Icons";

export default function Home({ onNavigate }) {
  return (
    <div className="page-container home-page">
      <header className="hero-header">
        <div className="brand-badge">
          <ShieldIcon size={14} />
          <span>THE VISHANTI CIPHER</span>
        </div>
        <h1 className="hero-title">Abhedya</h1>
        <p className="hero-subtitle">
          Next-generation local-first desktop steganography. Hide strongly encrypted secrets inside ordinary images without visual distortion.
        </p>
      </header>

      <section className="action-cards-grid">
        <div
          className="action-card primary-action"
          onClick={() => onNavigate("hide")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" ? onNavigate("hide") : null)}
        >
          <div className="action-card-icon lock-gradient">
            <LockIcon size={28} />
          </div>
          <div className="action-card-content">
            <h3 className="action-card-title">Hide a Message</h3>
            <p className="action-card-desc">
              Encrypt your secret text with an authenticated cipher, calculate image capacity, and embed it imperceptibly into image pixels.
            </p>
            <div className="action-card-cta">
              <span>Start Encoding</span>
              <span className="arrow">→</span>
            </div>
          </div>
        </div>

        <div
          className="action-card secondary-action"
          onClick={() => onNavigate("reveal")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" ? onNavigate("reveal") : null)}
        >
          <div className="action-card-icon unlock-gradient">
            <UnlockIcon size={28} />
          </div>
          <div className="action-card-content">
            <h3 className="action-card-title">Reveal a Message</h3>
            <p className="action-card-desc">
              Select an encoded lossless PNG, enter the decryption password, and extract the original plaintext payload safely.
            </p>
            <div className="action-card-cta">
              <span>Start Extraction</span>
              <span className="arrow">→</span>
            </div>
          </div>
        </div>
      </section>

      <section className="security-features-section">
        <h2 className="section-title">Core Security Foundations</h2>
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon">
              <ShieldIcon size={20} />
            </div>
            <div className="feature-body">
              <h4 className="feature-name">Local-Only Processing</h4>
              <p className="feature-text">
                All cryptographic derivation, embedding, and pixel manipulations run strictly in your local device environment with zero external telemetry.
              </p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon">
              <LockIcon size={20} />
            </div>
            <div className="feature-body">
              <h4 className="feature-name">Authenticated Encryption</h4>
              <p className="feature-text">
                Payloads are encrypted using authenticated ciphers. Tampering, bit-rot, or invalid passwords fail safely without leaking partial plaintexts.
              </p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon">
              <ImageIcon size={20} />
            </div>
            <div className="feature-body">
              <h4 className="feature-name">Lossless PNG Integrity</h4>
              <p className="feature-text">
                Outputs are strictly produced in PNG format to preserve discrete least-significant pixel bit values against lossy compression artifacts.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="transmission-tip-box">
        <AlertCircleIcon size={20} />
        <div className="tip-text">
          <strong>Important Transmission Rule:</strong> Instant messaging apps and social platforms often recompress uploaded photos into lossy formats (JPEG/WebP), which destroys hidden pixel bits. Always transmit encoded PNGs as a <em>"Document"</em> or <em>"Raw File"</em>.
        </div>
      </div>
    </div>
  );
}
