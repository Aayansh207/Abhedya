import React, { useEffect, useState } from "react";
import AbhedyaLogo from "../components/AbhedyaLogo";
import {
  LockIcon,
  UnlockIcon,
  ActivityIcon,
  HistoryIcon,
  ShieldCheck,
  ChevronRight
} from "../components/Icons";
import { api } from "../services/api";

export default function Home({ onNavigate }) {
  const [appInfo, setAppInfo] = useState({ version: "0.1.0", isElectron: false });

  useEffect(() => {
    api.getAppInfo().then(setAppInfo).catch(() => {});
  }, []);

  return (
    <div className="h-full flex flex-col justify-center max-w-5xl mx-auto px-4 py-4 sm:py-6 overflow-y-auto min-h-0 min-w-0">
      {/* Sleek, Pixel-Art Cyber Hero */}
      <div className="text-center space-y-3.5 mb-7 shrink-0">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-inset)] border border-[var(--border-medium)] shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[var(--accent-brass)] indicator-pulse" />
          <span className="text-xs font-mono-technical font-medium text-[var(--accent-cyan)] tracking-wider">
            AIRGAPPED & LOCAL · v{appInfo.version}
          </span>
        </div>

        {/* Central Logo & Pixelated Heading */}
        <div className="flex flex-col items-center justify-center gap-3">
          <AbhedyaLogo size={56} />
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-pixel cyber-pixel-title text-[var(--accent-cyan)] uppercase select-none">
            ABHEDYA
          </h1>
        </div>

        <p className="text-sm sm:text-base font-terminal text-[var(--text-secondary)] max-w-xl mx-auto tracking-wide leading-relaxed">
          THE VISHANTI CIPHER // AUTHENTICATED SYMMETRIC CRYPTOGRAPHY MEETS SPATIAL IMAGE STEGANOGRAPHY.
        </p>
      </div>

      {/* Primary Workspaces: Hide & Extract (With Electric Blue Hover Glow Effect) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {/* HIDE A MESSAGE */}
        <div
          onClick={() => onNavigate("hide")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onNavigate("hide")}
          className="group relative p-6 sm:p-7 rounded-xl glass-panel border border-[var(--border-medium)] cyber-hover-blue bg-gradient-to-b from-[var(--bg-surface-elevated)] to-[var(--bg-surface)] cursor-pointer shadow-lg flex flex-col justify-between"
        >
          <div className="corner-bracket-tl" />
          <div className="corner-bracket-tr" />
          <div className="corner-bracket-bl" />
          <div className="corner-bracket-br" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 cyber-hex bg-[var(--bg-inset)] border border-[var(--accent-brass)] flex items-center justify-center text-[var(--accent-brass)] group-hover:border-[var(--accent-cyan)] group-hover:text-[var(--accent-cyan)] group-hover:scale-105 transition-all duration-200 shadow-[0_0_12px_rgba(0,255,136,0.2)] group-hover:shadow-[0_0_15px_rgba(0,240,255,0.4)]">
                <LockIcon size={22} />
              </div>

              <span className="text-[9px] font-pixel px-2 py-1 rounded bg-[var(--accent-brass-bg)] text-[var(--accent-brass-text)] border border-[var(--accent-brass-border)] uppercase tracking-wider group-hover:bg-[var(--accent-cyan-bg)] group-hover:text-[var(--accent-cyan)] group-hover:border-[var(--accent-cyan-border)] transition-colors">
                WS // 01
              </span>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-sm sm:text-base font-pixel font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-cyan)] transition-colors uppercase tracking-wider">
                Hide Message
              </h2>
              <p className="text-xs font-mono-technical text-[var(--text-secondary)] leading-relaxed">
                Encrypt confidential plaintext with authenticated ciphers and conceal it imperceptibly inside lossless carrier pixels using key-seeded PRNG scattering.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono-technical font-bold text-[var(--accent-brass)] group-hover:text-[var(--accent-cyan)] uppercase tracking-wider transition-colors">
            <span>[ INITIATE ENCODER ]</span>
            <span className="group-hover:translate-x-1.5 transition-transform duration-200">→</span>
          </div>
        </div>

        {/* EXTRACT A MESSAGE */}
        <div
          onClick={() => onNavigate("reveal")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onNavigate("reveal")}
          className="group relative p-6 sm:p-7 rounded-xl glass-panel border border-[var(--border-medium)] cyber-hover-blue bg-gradient-to-b from-[var(--bg-surface-elevated)] to-[var(--bg-surface)] cursor-pointer shadow-lg flex flex-col justify-between"
        >
          <div className="corner-bracket-tl" />
          <div className="corner-bracket-tr" />
          <div className="corner-bracket-bl" />
          <div className="corner-bracket-br" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 cyber-hex bg-[var(--bg-inset)] border border-[var(--accent-cyan)] flex items-center justify-center text-[var(--accent-cyan)] group-hover:scale-105 transition-all duration-200 shadow-[0_0_12px_rgba(0,240,255,0.25)] group-hover:shadow-[0_0_18px_rgba(0,240,255,0.45)]">
                <UnlockIcon size={22} />
              </div>

              <span className="text-[9px] font-pixel px-2 py-1 rounded bg-[var(--accent-cyan-bg)] text-[var(--accent-cyan)] border border-[var(--accent-cyan-border)] uppercase tracking-wider">
                WS // 02
              </span>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-sm sm:text-base font-pixel font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-cyan)] transition-colors uppercase tracking-wider">
                Extract Message
              </h2>
              <p className="text-xs font-mono-technical text-[var(--text-secondary)] leading-relaxed">
                Provide an encoded PNG image along with your passphrase to authenticate the Poly1305 MAC tag and recover the original plaintext.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono-technical font-bold text-[var(--accent-cyan)] uppercase tracking-wider">
            <span>[ INITIATE DECODER ]</span>
            <span className="group-hover:translate-x-1.5 transition-transform duration-200">→</span>
          </div>
        </div>
      </div>

      {/* Secondary Features: Steganalysis (Heart), History, Security */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Steganalysis - HIGHLIGHTED AS CORE */}
        <div
          onClick={() => onNavigate("stego")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onNavigate("stego")}
          className="group p-4 rounded-xl glass-panel border border-[var(--accent-amber-border)] cyber-hover-blue cursor-pointer shadow-sm flex flex-col justify-between"
        >
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 cyber-hex bg-[var(--bg-inset)] border border-[var(--accent-amber)] flex items-center justify-center text-[var(--accent-amber)] group-hover:text-[var(--accent-cyan)] group-hover:border-[var(--accent-cyan)] transition-colors">
                <ActivityIcon size={16} />
              </div>
              <span className="text-[8px] font-pixel px-1.5 py-0.5 rounded bg-[var(--accent-amber-bg)] text-[var(--accent-amber-text)] border border-[var(--accent-amber-border)]">
                CORE
              </span>
            </div>

            <div>
              <h3 className="text-xs font-pixel font-bold uppercase text-[var(--text-primary)] group-hover:text-[var(--accent-cyan)] transition-colors tracking-wide">
                Steganalysis
              </h3>
              <p className="text-xs font-mono-technical text-[var(--text-secondary)] mt-1 leading-relaxed">
                Chi-Square PoV equalization & RS dual-mask statistical forensic scanner.
              </p>
            </div>
          </div>
          <div className="mt-3.5 flex items-center justify-between text-[11px] font-mono-technical font-bold text-[var(--accent-amber)] group-hover:text-[var(--accent-cyan)] transition-colors">
            <span>OPEN LAB</span>
            <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Audit History */}
        <div
          onClick={() => onNavigate("history")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onNavigate("history")}
          className="group p-4 rounded-xl glass-panel border border-[var(--border-subtle)] cyber-hover-blue cursor-pointer shadow-sm flex flex-col justify-between"
        >
          <div className="space-y-2.5">
            <div className="w-8 h-8 cyber-hex bg-[var(--bg-inset)] border border-[var(--accent-purple-border)] flex items-center justify-center text-[var(--accent-purple-text)] group-hover:text-[var(--accent-cyan)] group-hover:border-[var(--accent-cyan)] transition-colors">
              <HistoryIcon size={16} />
            </div>
            <div>
              <h3 className="text-xs font-pixel font-bold uppercase text-[var(--text-primary)] group-hover:text-[var(--accent-cyan)] transition-colors tracking-wide">
                Audit History
              </h3>
              <p className="text-xs font-mono-technical text-[var(--text-secondary)] mt-1 leading-relaxed">
                Inspect local operation logs and cryptographic execution history.
              </p>
            </div>
          </div>
          <div className="mt-3.5 flex items-center justify-between text-[11px] font-mono-technical font-semibold text-[var(--text-muted)] group-hover:text-[var(--accent-cyan)] transition-colors">
            <span>VIEW LOGS</span>
            <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Security Guide */}
        <div
          onClick={() => onNavigate("tech")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onNavigate("tech")}
          className="group p-4 rounded-xl glass-panel border border-[var(--border-subtle)] cyber-hover-blue cursor-pointer shadow-sm flex flex-col justify-between"
        >
          <div className="space-y-2.5">
            <div className="w-8 h-8 cyber-hex bg-[var(--bg-inset)] border border-[var(--border-medium)] flex items-center justify-center text-[var(--accent-cyan)] group-hover:text-[var(--accent-cyan)] group-hover:border-[var(--accent-cyan)] transition-colors">
              <ShieldCheck size={16} />
            </div>
            <div>
              <h3 className="text-xs font-pixel font-bold uppercase text-[var(--text-primary)] group-hover:text-[var(--accent-cyan)] transition-colors tracking-wide">
                Security Guide
              </h3>
              <p className="text-xs font-mono-technical text-[var(--text-secondary)] mt-1 leading-relaxed">
                Explore AEAD architecture, Argon2id KDF, and cryptographic proofs.
              </p>
            </div>
          </div>
          <div className="mt-3.5 flex items-center justify-between text-[11px] font-mono-technical font-semibold text-[var(--text-muted)] group-hover:text-[var(--accent-cyan)] transition-colors">
            <span>EXPLORE</span>
            <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
}
