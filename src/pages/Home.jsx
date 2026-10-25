import React, { useEffect, useState } from "react";
import {
  LockIcon,
  UnlockIcon,
  ActivityIcon,
  HistoryIcon,
  ShieldCheck,
  ChevronRight,
  ShieldIcon,
  CpuIcon,
  Layers,
  Terminal
} from "../components/Icons";
import { api } from "../services/api";

export default function Home({ onNavigate }) {
  const [appInfo, setAppInfo] = useState({ version: "0.1.0", isElectron: false });

  useEffect(() => {
    api.getAppInfo().then(setAppInfo).catch(() => {});
  }, []);

  return (
    <div className="h-full flex flex-col justify-between max-w-6xl mx-auto px-2 sm:px-4 py-3 sm:py-5 overflow-y-auto min-h-0 min-w-0 space-y-5">
      {/* HUD Telemetry Top Header Banner (Inspired by Reference Profile Header) */}
      <div className="relative glass-panel cyber-cut-corner p-4 sm:p-5 border border-[var(--border-strong)] bg-gradient-to-r from-[var(--bg-surface)] via-[var(--bg-surface-elevated)] to-[var(--bg-surface)] overflow-hidden">
        {/* Corner HUD Markers */}
        <div className="corner-bracket-tl" />
        <div className="corner-bracket-tr" />
        <div className="corner-bracket-bl" />
        <div className="corner-bracket-br" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          {/* Cyber Avatar & Core Identity */}
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 flex items-center justify-center">
              <div className="absolute inset-0 cyber-hex bg-[var(--accent-brass)]/20 animate-pulse" />
              <div className="absolute inset-[3px] cyber-hex bg-[var(--bg-inset)] border-2 border-[var(--accent-brass)] flex items-center justify-center text-[var(--accent-brass)] shadow-[0_0_15px_rgba(0,255,136,0.4)]">
                <ShieldIcon size={26} className="text-[var(--accent-brass)]" />
              </div>
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-display font-black tracking-widest text-[var(--text-primary)] uppercase cyber-text-glow">
                  ABHEDYA // CIPHER
                </h1>
                <span className="px-2 py-0.5 cyber-cut-corner-sm text-[10px] font-mono-technical font-bold bg-[var(--accent-brass-bg)] text-[var(--accent-brass-text)] border border-[var(--accent-brass-border)] uppercase">
                  ACTIVE AIRGAP
                </span>
              </div>
              <p className="text-xs font-mono-technical text-[var(--text-secondary)]">
                ID: <span className="text-[var(--text-primary)] font-semibold">ABH-VISHANTI-7468</span> · CORE v{appInfo.version}
              </p>
            </div>
          </div>

          {/* Quick Stats Grid (Inspired by Reference Statistics Row: Games, Wins, Rate, Earned) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 shrink-0">
            <div className="px-3 py-2 cyber-cut-corner-sm bg-[var(--bg-inset)] border border-[var(--border-medium)] text-center">
              <span className="block text-[9px] font-mono-technical uppercase text-[var(--text-muted)] tracking-wider">
                CIPHER
              </span>
              <span className="text-xs font-display font-bold text-[var(--accent-brass)] tracking-wide">
                POLY1305
              </span>
            </div>

            <div className="px-3 py-2 cyber-cut-corner-sm bg-[var(--bg-inset)] border border-[var(--border-medium)] text-center">
              <span className="block text-[9px] font-mono-technical uppercase text-[var(--text-muted)] tracking-wider">
                SCATTER
              </span>
              <span className="text-xs font-display font-bold text-[var(--accent-brass)] tracking-wide">
                PRNG WALK
              </span>
            </div>

            <div className="px-3 py-2 cyber-cut-corner-sm bg-[var(--bg-inset)] border border-[var(--border-medium)] text-center">
              <span className="block text-[9px] font-mono-technical uppercase text-[var(--text-muted)] tracking-wider">
                LEAKAGE
              </span>
              <span className="text-xs font-display font-bold text-[var(--accent-brass)] tracking-wide">
                0.0%
              </span>
            </div>
          </div>
        </div>

        {/* Tactical XP / Integrity Progress Track (Inspired by Reference XP Level Bar) */}
        <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono-technical">
            <span className="text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-brass)] indicator-pulse" />
              SYSTEM ENTROPY POOL INTEGRITY
            </span>
            <span className="text-[var(--accent-brass)] font-bold">100% SECURE // LOCAL MEMORY ONLY</span>
          </div>
          <div className="h-2 w-full bg-[var(--bg-inset)] cyber-cut-corner-sm border border-[var(--border-subtle)] overflow-hidden p-[1px]">
            <div className="h-full bg-gradient-to-r from-[var(--accent-brass)]/70 via-[var(--accent-brass)] to-[var(--accent-brass)] w-full shadow-[0_0_10px_var(--accent-brass)]" />
          </div>
        </div>
      </div>

      {/* Primary Operation Modules: Hide & Extract (Matching Reference Game Cards) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-display font-bold tracking-widest text-[var(--accent-brass)] uppercase">
            PRIMARY OPERATIONS // EXECUTION DECK
          </span>
          <span className="text-[10px] font-mono-technical text-[var(--text-muted)] uppercase">
            SELECT WORKSPACE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* HIDE A MESSAGE (ENCODER) */}
          <div
            onClick={() => onNavigate("hide")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onNavigate("hide")}
            className="group relative p-5 sm:p-6 cyber-cut-corner glass-panel border-2 border-[var(--border-medium)] hover:border-[var(--accent-brass)] bg-gradient-to-b from-[var(--bg-surface-elevated)] to-[var(--bg-surface)] transition-all duration-200 cursor-pointer cyber-glow-green-sm hover:cyber-glow-green flex flex-col justify-between"
          >
            {/* Corner Decorative HUD Brackets */}
            <div className="corner-bracket-tl" />
            <div className="corner-bracket-tr" />
            <div className="corner-bracket-bl" />
            <div className="corner-bracket-br" />

            <div className="space-y-4">
              <div className="flex items-start justify-between">
                {/* Hexagonal Cyber Icon Frame */}
                <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
                  <div className="absolute inset-0 cyber-hex bg-[var(--accent-brass)]/20 group-hover:bg-[var(--accent-brass)]/40 transition-colors" />
                  <div className="absolute inset-[2px] cyber-hex bg-[var(--bg-inset)] border border-[var(--accent-brass)] flex items-center justify-center text-[var(--accent-brass)] group-hover:scale-105 transition-transform duration-200 shadow-[0_0_12px_rgba(0,255,136,0.4)]">
                    <LockIcon size={20} />
                  </div>
                </div>

                <span className="px-2.5 py-1 cyber-cut-corner-sm text-[10px] font-mono-technical font-bold uppercase bg-[var(--accent-brass-bg)] text-[var(--accent-brass-text)] border border-[var(--accent-brass-border)] tracking-wider">
                  WORKSPACE // 01
                </span>
              </div>

              <div className="space-y-1.5">
                <h2 className="text-base sm:text-lg font-display font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-brass)] transition-colors uppercase tracking-wider cyber-text-glow">
                  Hide Secret Message
                </h2>
                <p className="text-xs font-hud text-[var(--text-secondary)] leading-relaxed">
                  Encrypt confidential text using authenticated symmetric ciphers and embed the ciphertext imperceptibly into pixel channels with key-seeded PRNG scattering.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono-technical font-bold text-[var(--accent-brass)] tracking-widest uppercase">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-brass)] group-hover:animate-ping" />
                INITIATE ENCODER
              </span>
              <span className="group-hover:translate-x-1.5 transition-transform duration-200">
                [ ACCESS → ]
              </span>
            </div>
          </div>

          {/* EXTRACT A MESSAGE (DECODER) */}
          <div
            onClick={() => onNavigate("reveal")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onNavigate("reveal")}
            className="group relative p-5 sm:p-6 cyber-cut-corner glass-panel border-2 border-[var(--border-medium)] hover:border-[var(--accent-brass)] bg-gradient-to-b from-[var(--bg-surface-elevated)] to-[var(--bg-surface)] transition-all duration-200 cursor-pointer cyber-glow-green-sm hover:cyber-glow-green flex flex-col justify-between"
          >
            {/* Corner Decorative HUD Brackets */}
            <div className="corner-bracket-tl" />
            <div className="corner-bracket-tr" />
            <div className="corner-bracket-bl" />
            <div className="corner-bracket-br" />

            <div className="space-y-4">
              <div className="flex items-start justify-between">
                {/* Hexagonal Cyber Icon Frame */}
                <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
                  <div className="absolute inset-0 cyber-hex bg-[var(--accent-brass)]/20 group-hover:bg-[var(--accent-brass)]/40 transition-colors" />
                  <div className="absolute inset-[2px] cyber-hex bg-[var(--bg-inset)] border border-[var(--accent-brass)] flex items-center justify-center text-[var(--accent-brass)] group-hover:scale-105 transition-transform duration-200 shadow-[0_0_12px_rgba(0,255,136,0.4)]">
                    <UnlockIcon size={20} />
                  </div>
                </div>

                <span className="px-2.5 py-1 cyber-cut-corner-sm text-[10px] font-mono-technical font-bold uppercase bg-[var(--accent-brass-bg)] text-[var(--accent-brass-text)] border border-[var(--accent-brass-border)] tracking-wider">
                  WORKSPACE // 02
                </span>
              </div>

              <div className="space-y-1.5">
                <h2 className="text-base sm:text-lg font-display font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-brass)] transition-colors uppercase tracking-wider cyber-text-glow">
                  Extract Hidden Message
                </h2>
                <p className="text-xs font-hud text-[var(--text-secondary)] leading-relaxed">
                  Provide an encoded PNG image along with your passphrase to authenticate the Poly1305 MAC tag and recover the confidential plaintext with zero cloud leakage.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono-technical font-bold text-[var(--accent-brass)] tracking-widest uppercase">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-brass)] group-hover:animate-ping" />
                INITIATE DECODER
              </span>
              <span className="group-hover:translate-x-1.5 transition-transform duration-200">
                [ ACCESS → ]
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Operations Grid (Inspired by Reference Games Played Section: Texas Holdem, Blackjack, Omaha) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-display font-bold tracking-widest text-[var(--text-muted)] uppercase">
            DIAGNOSTICS & AUDIT SUITE
          </span>
          <span className="text-[10px] font-mono-technical text-[var(--accent-brass)] uppercase">
            3 ACTIVE SUBSYSTEMS
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Steganalysis */}
          <div
            onClick={() => onNavigate("stego")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onNavigate("stego")}
            className="group p-4 cyber-cut-corner glass-panel border border-[var(--border-medium)] hover:border-[var(--accent-brass)] hover:bg-[var(--bg-surface-hover)] transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 cyber-hex bg-[var(--bg-inset)] border border-[var(--border-strong)] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--accent-brass)] group-hover:border-[var(--accent-brass)] transition-colors shadow-sm">
                  <ActivityIcon size={16} />
                </div>
                <span className="text-[9px] font-mono-technical text-[var(--text-muted)]">WS // 03</span>
              </div>

              <div>
                <h3 className="text-xs font-display font-bold uppercase text-[var(--text-primary)] group-hover:text-[var(--accent-brass)] tracking-wider transition-colors">
                  Steganalysis Lab
                </h3>
                <p className="text-[11px] font-hud text-[var(--text-secondary)] mt-1 leading-normal">
                  Chi-Square PoV equalization & RS dual-mask statistical testing.
                </p>
              </div>
            </div>

            <div className="mt-3.5 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] font-mono-technical font-bold text-[var(--text-muted)] group-hover:text-[var(--accent-brass)] transition-colors">
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
            className="group p-4 cyber-cut-corner glass-panel border border-[var(--border-medium)] hover:border-[var(--accent-brass)] hover:bg-[var(--bg-surface-hover)] transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 cyber-hex bg-[var(--bg-inset)] border border-[var(--border-strong)] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--accent-brass)] group-hover:border-[var(--accent-brass)] transition-colors shadow-sm">
                  <HistoryIcon size={16} />
                </div>
                <span className="text-[9px] font-mono-technical text-[var(--text-muted)]">WS // 04</span>
              </div>

              <div>
                <h3 className="text-xs font-display font-bold uppercase text-[var(--text-primary)] group-hover:text-[var(--accent-brass)] tracking-wider transition-colors">
                  Audit History
                </h3>
                <p className="text-[11px] font-hud text-[var(--text-secondary)] mt-1 leading-normal">
                  Air-gapped operation telemetry and cryptographic execution logs.
                </p>
              </div>
            </div>

            <div className="mt-3.5 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] font-mono-technical font-bold text-[var(--text-muted)] group-hover:text-[var(--accent-brass)] transition-colors">
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
            className="group p-4 cyber-cut-corner glass-panel border border-[var(--border-medium)] hover:border-[var(--accent-brass)] hover:bg-[var(--bg-surface-hover)] transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 cyber-hex bg-[var(--bg-inset)] border border-[var(--border-strong)] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--accent-brass)] group-hover:border-[var(--accent-brass)] transition-colors shadow-sm">
                  <ShieldCheck size={16} />
                </div>
                <span className="text-[9px] font-mono-technical text-[var(--text-muted)]">WS // 05</span>
              </div>

              <div>
                <h3 className="text-xs font-display font-bold uppercase text-[var(--text-primary)] group-hover:text-[var(--accent-brass)] tracking-wider transition-colors">
                  Security Manual
                </h3>
                <p className="text-[11px] font-hud text-[var(--text-secondary)] mt-1 leading-normal">
                  AEAD specifications, Argon2id KDF derivation, and attack resistance.
                </p>
              </div>
            </div>

            <div className="mt-3.5 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] font-mono-technical font-bold text-[var(--text-muted)] group-hover:text-[var(--accent-brass)] transition-colors">
              <span>EXPLORE</span>
              <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
