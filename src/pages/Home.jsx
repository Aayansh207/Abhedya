import React, { useEffect, useState } from "react";
import {
  LockIcon,
  UnlockIcon,
  ActivityIcon,
  HistoryIcon,
  ShieldCheck,
  ChevronRight,
  ShieldIcon
} from "../components/Icons";
import { api } from "../services/api";

export default function Home({ onNavigate }) {
  const [appInfo, setAppInfo] = useState({ version: "0.1.0", isElectron: false });

  useEffect(() => {
    api.getAppInfo().then(setAppInfo).catch(() => {});
  }, []);

  return (
    <div className="h-full flex flex-col justify-center max-w-5xl mx-auto px-4 py-6 overflow-y-auto min-h-0 min-w-0">
      {/* Sleek, Clean Cyber Hero (No fake cluttered stats) */}
      <div className="text-center space-y-3 mb-8 shrink-0">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-inset)] border border-[var(--border-subtle)] shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[var(--accent-brass)] indicator-pulse" />
          <span className="text-xs font-mono-technical font-medium text-[var(--accent-brass)]">
            AIRGAPPED & LOCAL · v{appInfo.version}
          </span>
        </div>

        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 cyber-hex bg-[var(--bg-inset)] border border-[var(--accent-brass)] flex items-center justify-center text-[var(--accent-brass)] shadow-[0_0_12px_rgba(0,255,136,0.3)]">
            <ShieldIcon size={20} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-widest text-[var(--text-primary)] uppercase cyber-text-glow">
            ABHEDYA
          </h1>
        </div>

        <p className="text-xs sm:text-sm font-hud text-[var(--text-secondary)] max-w-lg mx-auto leading-relaxed">
          Authenticated symmetric cryptography meets spatial image steganography.
          Conceal and recover confidential payloads with zero cloud exposure.
        </p>
      </div>

      {/* Primary Workspaces: Hide & Extract (Matching Reference Game Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {/* HIDE A MESSAGE */}
        <div
          onClick={() => onNavigate("hide")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onNavigate("hide")}
          className="group relative p-6 sm:p-7 rounded-xl glass-panel border border-[var(--border-medium)] hover:border-[var(--accent-brass)] bg-gradient-to-b from-[var(--bg-surface-elevated)] to-[var(--bg-surface)] transition-all duration-200 cursor-pointer shadow-lg hover:shadow-[0_0_24px_rgba(0,255,136,0.2)] flex flex-col justify-between"
        >
          {/* Subtle Corner Markers */}
          <div className="corner-bracket-tl" />
          <div className="corner-bracket-tr" />
          <div className="corner-bracket-bl" />
          <div className="corner-bracket-br" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 cyber-hex bg-[var(--bg-inset)] border border-[var(--accent-brass)] flex items-center justify-center text-[var(--accent-brass)] group-hover:scale-105 transition-transform duration-200 shadow-[0_0_12px_rgba(0,255,136,0.25)]">
                <LockIcon size={22} />
              </div>

              <span className="text-[10px] font-mono-technical font-bold px-2 py-0.5 rounded bg-[var(--accent-brass-bg)] text-[var(--accent-brass-text)] border border-[var(--accent-brass-border)] uppercase tracking-wider">
                WORKSPACE // 01
              </span>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-base sm:text-lg font-display font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-brass)] transition-colors uppercase tracking-wider">
                Hide a Message
              </h2>
              <p className="text-xs font-hud text-[var(--text-secondary)] leading-relaxed">
                Encrypt sensitive text using authenticated ciphers and embed it imperceptibly inside any carrier image with key-seeded pixel scattering.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono-technical font-bold text-[var(--accent-brass)] uppercase tracking-wider">
            <span>OPEN ENCODER</span>
            <span className="group-hover:translate-x-1.5 transition-transform duration-200">→</span>
          </div>
        </div>

        {/* EXTRACT A MESSAGE */}
        <div
          onClick={() => onNavigate("reveal")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onNavigate("reveal")}
          className="group relative p-6 sm:p-7 rounded-xl glass-panel border border-[var(--border-medium)] hover:border-[var(--accent-brass)] bg-gradient-to-b from-[var(--bg-surface-elevated)] to-[var(--bg-surface)] transition-all duration-200 cursor-pointer shadow-lg hover:shadow-[0_0_24px_rgba(0,255,136,0.2)] flex flex-col justify-between"
        >
          {/* Subtle Corner Markers */}
          <div className="corner-bracket-tl" />
          <div className="corner-bracket-tr" />
          <div className="corner-bracket-bl" />
          <div className="corner-bracket-br" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 cyber-hex bg-[var(--bg-inset)] border border-[var(--accent-brass)] flex items-center justify-center text-[var(--accent-brass)] group-hover:scale-105 transition-transform duration-200 shadow-[0_0_12px_rgba(0,255,136,0.25)]">
                <UnlockIcon size={22} />
              </div>

              <span className="text-[10px] font-mono-technical font-bold px-2 py-0.5 rounded bg-[var(--accent-brass-bg)] text-[var(--accent-brass-text)] border border-[var(--accent-brass-border)] uppercase tracking-wider">
                WORKSPACE // 02
              </span>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-base sm:text-lg font-display font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-brass)] transition-colors uppercase tracking-wider">
                Extract a Message
              </h2>
              <p className="text-xs font-hud text-[var(--text-secondary)] leading-relaxed">
                Provide an encoded PNG image along with your passphrase to authenticate the ciphertext and recover your original message.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono-technical font-bold text-[var(--accent-brass)] uppercase tracking-wider">
            <span>OPEN DECODER</span>
            <span className="group-hover:translate-x-1.5 transition-transform duration-200">→</span>
          </div>
        </div>
      </div>

      {/* Secondary Features: Steganalysis, History, Security */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Steganalysis */}
        <div
          onClick={() => onNavigate("stego")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onNavigate("stego")}
          className="group p-4 rounded-xl glass-panel border border-[var(--border-subtle)] hover:border-[var(--accent-brass)] hover:bg-[var(--bg-surface-hover)] transition-all duration-200 cursor-pointer shadow-sm flex flex-col justify-between"
        >
          <div className="space-y-2.5">
            <div className="w-8 h-8 cyber-hex bg-[var(--bg-inset)] border border-[var(--border-medium)] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--accent-brass)] group-hover:border-[var(--accent-brass)] transition-colors">
              <ActivityIcon size={16} />
            </div>
            <div>
              <h3 className="text-xs font-display font-bold uppercase text-[var(--text-primary)] group-hover:text-[var(--accent-brass)] transition-colors tracking-wider">
                Steganalysis
              </h3>
              <p className="text-xs font-hud text-[var(--text-secondary)] mt-1 leading-relaxed">
                Test images for statistical anomalies using Chi-Square and RS detection.
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[11px] font-mono-technical font-semibold text-[var(--text-muted)] group-hover:text-[var(--accent-brass)] transition-colors">
            <span>INSPECT</span>
            <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Audit History */}
        <div
          onClick={() => onNavigate("history")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onNavigate("history")}
          className="group p-4 rounded-xl glass-panel border border-[var(--border-subtle)] hover:border-[var(--accent-brass)] hover:bg-[var(--bg-surface-hover)] transition-all duration-200 cursor-pointer shadow-sm flex flex-col justify-between"
        >
          <div className="space-y-2.5">
            <div className="w-8 h-8 cyber-hex bg-[var(--bg-inset)] border border-[var(--border-medium)] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--accent-brass)] group-hover:border-[var(--accent-brass)] transition-colors">
              <HistoryIcon size={16} />
            </div>
            <div>
              <h3 className="text-xs font-display font-bold uppercase text-[var(--text-primary)] group-hover:text-[var(--accent-brass)] transition-colors tracking-wider">
                Audit History
              </h3>
              <p className="text-xs font-hud text-[var(--text-secondary)] mt-1 leading-relaxed">
                Inspect local operation logs from your current application session.
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[11px] font-mono-technical font-semibold text-[var(--text-muted)] group-hover:text-[var(--accent-brass)] transition-colors">
            <span>VIEW LOG</span>
            <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Security Guide */}
        <div
          onClick={() => onNavigate("tech")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onNavigate("tech")}
          className="group p-4 rounded-xl glass-panel border border-[var(--border-subtle)] hover:border-[var(--accent-brass)] hover:bg-[var(--bg-surface-hover)] transition-all duration-200 cursor-pointer shadow-sm flex flex-col justify-between"
        >
          <div className="space-y-2.5">
            <div className="w-8 h-8 cyber-hex bg-[var(--bg-inset)] border border-[var(--border-medium)] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--accent-brass)] group-hover:border-[var(--accent-brass)] transition-colors">
              <ShieldCheck size={16} />
            </div>
            <div>
              <h3 className="text-xs font-display font-bold uppercase text-[var(--text-primary)] group-hover:text-[var(--accent-brass)] transition-colors tracking-wider">
                Security Guide
              </h3>
              <p className="text-xs font-hud text-[var(--text-secondary)] mt-1 leading-relaxed">
                Explore the technical architecture, AEAD ciphers, and security proofs.
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[11px] font-mono-technical font-semibold text-[var(--text-muted)] group-hover:text-[var(--accent-brass)] transition-colors">
            <span>EXPLORE</span>
            <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
}
