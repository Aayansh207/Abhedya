import React, { useEffect, useState } from "react";
import {
  LockIcon,
  UnlockIcon,
  ShieldIcon,
  ActivityIcon,
  ChevronRight,
  CheckIcon,
  AlertCircleIcon,
  CpuIcon
} from "../components/Icons";
import { api } from "../services/api";

export default function Home({ onNavigate }) {
  const [appInfo, setAppInfo] = useState({ version: "0.1.0", platform: "Local", isElectron: false });

  useEffect(() => {
    api.getAppInfo().then(setAppInfo).catch(() => {});
  }, []);

  return (
    <div className="h-full flex flex-col gap-5 overflow-y-auto pr-1 pb-4 min-h-0 min-w-0">
      {/* Top Banner / System HUD Status */}
      <div className="glass-panel p-5 sm:p-6 border-[var(--border-subtle)] relative overflow-hidden shrink-0">
        {/* Corner Reticle Markers */}
        <div className="absolute top-2.5 left-2.5 w-2.5 h-2.5 border-t border-l border-[var(--accent-brass-border)] pointer-events-none" />
        <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 border-t border-r border-[var(--accent-brass-border)] pointer-events-none" />
        <div className="absolute bottom-2.5 left-2.5 w-2.5 h-2.5 border-b border-l border-[var(--accent-brass-border)] pointer-events-none" />
        <div className="absolute bottom-2.5 right-2.5 w-2.5 h-2.5 border-b border-r border-[var(--accent-brass-border)] pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--accent-brass-bg)] text-[var(--accent-brass-text)] border border-[var(--accent-brass-border)] tracking-widest uppercase">
                VISHANTI CIPHER CONSOLE
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--accent-jade-text)] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-jade)] indicator-pulse" />
                LOCAL HARDWARE ISOLATION
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-3">
              <span>Abhedya</span>
              <span className="text-xs font-mono font-normal text-[var(--text-muted)] bg-[var(--bg-inset)] border border-[var(--border-subtle)] px-2.5 py-0.5 rounded-full">
                v{appInfo.version}
              </span>
            </h1>

            <p className="text-xs text-[var(--text-secondary)] max-w-2xl leading-relaxed">
              Desktop security instrument combining authenticated symmetric cryptography with spatial LSB image steganography. Conceal encrypted payloads into lossless carrier imagery with key-seeded pixel scattering.
            </p>
          </div>

          {/* Quick Telemetry Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 shrink-0 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-[var(--bg-inset)] border border-[var(--border-subtle)]">
              <span className="block text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Cipher Suite</span>
              <span className="font-semibold text-[var(--text-primary)] text-[11px] truncate block">XChaCha20-Poly1305</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[var(--bg-inset)] border border-[var(--border-subtle)]">
              <span className="block text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Key Derivation</span>
              <span className="font-semibold text-[var(--accent-brass)] text-[11px] truncate block">Argon2id / Scrypt</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[var(--bg-inset)] border border-[var(--border-subtle)] col-span-2 sm:col-span-1">
              <span className="block text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Environment</span>
              <span className="font-semibold text-[var(--accent-jade-text)] text-[11px] truncate block">
                {appInfo.isElectron ? "Hardened Electron" : "Browser Preview"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Workspace Action Launchers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* HIDE / ENCODE WORKSPACE TILE */}
        <div
          onClick={() => onNavigate("hide")}
          className="group relative p-5 sm:p-6 rounded-xl glass-panel border-[var(--border-subtle)] hover:border-[var(--accent-brass-border)] hover:bg-[var(--bg-surface-hover)] transition-all duration-200 cursor-pointer shadow-md flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-[var(--accent-brass-bg)] border border-[var(--accent-brass-border)] flex items-center justify-center text-[var(--accent-brass)] group-hover:scale-105 transition-transform">
                <LockIcon size={20} />
              </div>
              <span className="text-[10px] font-mono text-[var(--accent-brass-text)] bg-[var(--accent-brass-bg)] px-2 py-0.5 rounded border border-[var(--accent-brass-border)] flex items-center gap-1 font-semibold">
                WORKSPACE 01 <ChevronRight size={11} />
              </span>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-brass)] transition-colors">
                Hide Secret Message
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                Encrypt confidential text with authenticated ciphers, evaluate carrier payload capacity, and conceal data imperceptibly via key-seeded pixel scattering.
              </p>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
            <span>Inputs: Image + Passphrase</span>
            <span className="text-[var(--accent-brass)] font-semibold group-hover:translate-x-1 transition-transform">
              Launch Encoder →
            </span>
          </div>
        </div>

        {/* EXTRACT / REVEAL WORKSPACE TILE */}
        <div
          onClick={() => onNavigate("reveal")}
          className="group relative p-5 sm:p-6 rounded-xl glass-panel border-[var(--border-subtle)] hover:border-[var(--accent-jade-border)] hover:bg-[var(--bg-surface-hover)] transition-all duration-200 cursor-pointer shadow-md flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-[var(--accent-jade-bg)] border border-[var(--accent-jade-border)] flex items-center justify-center text-[var(--accent-jade)] group-hover:scale-105 transition-transform">
                <UnlockIcon size={20} />
              </div>
              <span className="text-[10px] font-mono text-[var(--accent-jade-text)] bg-[var(--accent-jade-bg)] px-2 py-0.5 rounded border border-[var(--accent-jade-border)] flex items-center gap-1 font-semibold">
                WORKSPACE 02 <ChevronRight size={11} />
              </span>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-jade)] transition-colors">
                Extract Hidden Message
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                Ingest an encoded lossless PNG, verify the cryptographic Poly1305 authentication MAC tag, and safely recover the original plaintext message.
              </p>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
            <span>Inputs: PNG Vessel + Key</span>
            <span className="text-[var(--accent-jade)] font-semibold group-hover:translate-x-1 transition-transform">
              Launch Decoder →
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Quick Access Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Steganalysis Quick Entry */}
        <div
          onClick={() => onNavigate("stego")}
          className="p-4 rounded-xl glass-panel border-[var(--border-subtle)] hover:border-[var(--border-medium)] hover:bg-[var(--bg-surface-hover)] cursor-pointer transition-colors flex items-center gap-3.5 group shadow-sm"
        >
          <div className="w-10 h-10 rounded-lg bg-[var(--bg-inset)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--accent-brass)] group-hover:border-[var(--accent-brass-border)] transition-colors shrink-0">
            <ActivityIcon size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-mono font-semibold uppercase text-[var(--text-primary)] group-hover:text-[var(--accent-brass)] transition-colors">
              Steganalysis Laboratory
            </h4>
            <p className="text-[11px] text-[var(--text-secondary)] truncate">
              Chi-Square Pair-of-Values & RS dual-mask statistical evaluations.
            </p>
          </div>
          <ChevronRight size={16} className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors shrink-0" />
        </div>

        {/* Technology & Security Quick Entry */}
        <div
          onClick={() => onNavigate("tech")}
          className="p-4 rounded-xl glass-panel border-[var(--border-subtle)] hover:border-[var(--border-medium)] hover:bg-[var(--bg-surface-hover)] cursor-pointer transition-colors flex items-center gap-3.5 group shadow-sm"
        >
          <div className="w-10 h-10 rounded-lg bg-[var(--bg-inset)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--accent-jade)] group-hover:border-[var(--accent-jade-border)] transition-colors shrink-0">
            <ShieldIcon size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-mono font-semibold uppercase text-[var(--text-primary)] group-hover:text-[var(--accent-jade)] transition-colors">
              Technology & Security Architecture
            </h4>
            <p className="text-[11px] text-[var(--text-secondary)] truncate">
              Detailed technical breakdown of KDF derivations, AEAD ciphers, and pixel walks.
            </p>
          </div>
          <ChevronRight size={16} className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors shrink-0" />
        </div>
      </div>

      {/* Security Architecture Posture Matrix */}
      <div className="glass-panel p-5 border-[var(--border-subtle)] rounded-xl space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
            <ShieldIcon size={14} className="text-[var(--accent-brass)]" />
            Security & Cryptographic Foundation
          </h3>
          <span className="text-[10px] font-mono text-[var(--accent-jade-text)] font-semibold bg-[var(--accent-jade-bg)] px-2 py-0.5 rounded border border-[var(--accent-jade-border)]">
            POSTURE VERIFIED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-lg bg-[var(--bg-inset)] border border-[var(--border-subtle)] space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[var(--text-primary)]">
              <CheckIcon size={13} className="text-[var(--accent-jade)]" />
              <span>Zero-Cloud Local Isolation</span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              No outbound network requests. Passphrases, keys, and raw pixel buffers remain strictly in local memory.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[var(--bg-inset)] border border-[var(--border-subtle)] space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[var(--text-primary)]">
              <CheckIcon size={13} className="text-[var(--accent-jade)]" />
              <span>Authenticated Encryption</span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              Poly1305 MAC tag detects tampering or corruption. Invalid passwords fail safely in constant time.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[var(--bg-inset)] border border-[var(--border-subtle)] space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[var(--text-primary)]">
              <CheckIcon size={13} className="text-[var(--accent-jade)]" />
              <span>Lossless PNG Preservation</span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              Strict output format validation prevents lossy JPEG compression artifacts from destroying hidden LSB bits.
            </p>
          </div>
        </div>
      </div>

      {/* Transmission Advisory Banner */}
      <div className="p-4 rounded-xl bg-[var(--accent-brass-bg)] border border-[var(--accent-brass-border)] flex items-start gap-3">
        <AlertCircleIcon size={18} className="text-[var(--accent-brass)] shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed text-[var(--text-primary)]">
          <strong className="font-semibold">Operational Transmission Rule:</strong> Instant messaging applications (WhatsApp, Telegram, Discord) automatically recompress photos into lossy formats, obliterating concealed LSB bits. Always transmit encoded PNGs as a <em>"Document"</em>, <em>"Uncompressed File"</em>, or via encrypted file transfer.
        </div>
      </div>
    </div>
  );
}
