import React, { useEffect, useState } from "react";
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
    <div className="h-full flex flex-col justify-center max-w-5xl mx-auto px-4 py-6 overflow-y-auto min-h-0 min-w-0">
      {/* Sleek, Friendly Hero Header */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-inset)] border border-[var(--border-subtle)] shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[var(--accent-jade)] indicator-pulse" />
          <span className="text-xs font-mono font-medium text-[var(--text-secondary)]">
            Air-gapped & Local · v{appInfo.version}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Abhedya
        </h1>

        <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-lg mx-auto leading-relaxed">
          Authenticated symmetric cryptography meets spatial image steganography.
          Conceal and recover secret payloads with zero cloud exposure.
        </p>
      </div>

      {/* Primary Workspaces: Hide & Extract */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {/* HIDE A MESSAGE */}
        <div
          onClick={() => onNavigate("hide")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onNavigate("hide")}
          className="group relative p-6 sm:p-7 rounded-2xl glass-panel border border-[var(--border-subtle)] hover:border-[var(--accent-brass-border)] hover:bg-[var(--bg-surface-hover)] transition-all duration-200 cursor-pointer shadow-sm flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent-brass-bg)] border border-[var(--accent-brass-border)] flex items-center justify-center text-[var(--accent-brass)] group-hover:scale-105 transition-transform duration-200 shadow-sm">
              <LockIcon size={22} />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-brass)] transition-colors">
                Hide a Message
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Encrypt sensitive text using authenticated ciphers and embed it imperceptibly inside any carrier image with key-seeded pixel scattering.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono font-semibold text-[var(--accent-brass)]">
            <span>Open Encoder</span>
            <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
          </div>
        </div>

        {/* EXTRACT A MESSAGE */}
        <div
          onClick={() => onNavigate("reveal")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onNavigate("reveal")}
          className="group relative p-6 sm:p-7 rounded-2xl glass-panel border border-[var(--border-subtle)] hover:border-[var(--accent-jade-border)] hover:bg-[var(--bg-surface-hover)] transition-all duration-200 cursor-pointer shadow-sm flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent-jade-bg)] border border-[var(--accent-jade-border)] flex items-center justify-center text-[var(--accent-jade)] group-hover:scale-105 transition-transform duration-200 shadow-sm">
              <UnlockIcon size={22} />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-jade)] transition-colors">
                Extract a Message
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Provide an encoded PNG image along with your passphrase to authenticate the ciphertext and recover your original message.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono font-semibold text-[var(--accent-jade)]">
            <span>Open Decoder</span>
            <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
          </div>
        </div>
      </div>

      {/* Secondary Features: Steganalysis, History, Security */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Steganalysis */}
        <div
          onClick={() => onNavigate("stego")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onNavigate("stego")}
          className="group p-4 sm:p-5 rounded-2xl glass-panel border border-[var(--border-subtle)] hover:border-[var(--border-medium)] hover:bg-[var(--bg-surface-hover)] transition-all duration-200 cursor-pointer shadow-sm flex flex-col justify-between"
        >
          <div className="space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--bg-inset)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--accent-brass)] group-hover:border-[var(--accent-brass-border)] transition-colors">
              <ActivityIcon size={18} />
            </div>
            <div>
              <h3 className="text-xs font-mono font-bold uppercase text-[var(--text-primary)] group-hover:text-[var(--accent-brass)] transition-colors">
                Steganalysis
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                Test images for statistical anomalies using Chi-Square and RS detection.
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[11px] font-mono font-medium text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors">
            <span>Inspect</span>
            <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Audit History */}
        <div
          onClick={() => onNavigate("history")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onNavigate("history")}
          className="group p-4 sm:p-5 rounded-2xl glass-panel border border-[var(--border-subtle)] hover:border-[var(--border-medium)] hover:bg-[var(--bg-surface-hover)] transition-all duration-200 cursor-pointer shadow-sm flex flex-col justify-between"
        >
          <div className="space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--bg-inset)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--accent-brass)] group-hover:border-[var(--accent-brass-border)] transition-colors">
              <HistoryIcon size={18} />
            </div>
            <div>
              <h3 className="text-xs font-mono font-bold uppercase text-[var(--text-primary)] group-hover:text-[var(--accent-brass)] transition-colors">
                Audit History
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                Inspect local operation logs from your current application session.
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[11px] font-mono font-medium text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors">
            <span>View Log</span>
            <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Security Guide */}
        <div
          onClick={() => onNavigate("tech")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onNavigate("tech")}
          className="group p-4 sm:p-5 rounded-2xl glass-panel border border-[var(--border-subtle)] hover:border-[var(--border-medium)] hover:bg-[var(--bg-surface-hover)] transition-all duration-200 cursor-pointer shadow-sm flex flex-col justify-between"
        >
          <div className="space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--bg-inset)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--accent-jade)] group-hover:border-[var(--accent-jade-border)] transition-colors">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="text-xs font-mono font-bold uppercase text-[var(--text-primary)] group-hover:text-[var(--accent-jade)] transition-colors">
                Security Guide
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                Explore the technical architecture, AEAD ciphers, and security proofs.
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[11px] font-mono font-medium text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors">
            <span>Explore</span>
            <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
}
