import React, { useEffect, useState } from "react";
import AbhedyaLogo from "../components/AbhedyaLogo";
import {
  LockIcon,
  UnlockIcon,
  ActivityIcon,
  HistoryIcon,
  ShieldCheck,
  CpuIcon
} from "../components/Icons";
import { api } from "../services/api";

export default function Home({ onNavigate }) {
  const [appInfo, setAppInfo] = useState({ version: "0.1.0", isElectron: false });

  useEffect(() => {
    api.getAppInfo().then(setAppInfo).catch(() => {});
  }, []);

  return (
    <div className="h-full flex flex-col justify-between max-w-6xl mx-auto px-4 py-4 sm:py-6 overflow-y-auto min-h-0 min-w-0 carbon-mesh-bg">
      {/* Top Header Banner */}
      <div className="text-center space-y-2 shrink-0 mb-4 sm:mb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--bg-inset)] border border-[var(--border-medium)] shadow-[0_0_12px_rgba(0,240,255,0.15)]">
          <span className="w-2 h-2 rounded-full bg-[var(--accent-brass)] indicator-pulse" />
          <span className="text-xs font-mono-technical font-medium text-[var(--accent-cyan)] tracking-wider">
            AIRGAPPED & LOCAL · v{appInfo.version} // HARDWARE ISOLATED
          </span>
        </div>

        <h1 className="text-sm sm:text-base md:text-lg font-pixel cyber-pixel-title text-[var(--accent-cyan)] uppercase tracking-widest select-none">
          ABHEDYA // SYSTEM INFOGRAPHIC
        </h1>
      </div>

      {/* Main Luxury Infographic Grid (Reference Layout: 3 Capsules Left, Medallion Center, 3 Capsules Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-center my-auto shrink-0">
        
        {/* LEFT COLUMN: 3 CAPSULES (01, 02, 06) */}
        <div className="lg:col-span-4 flex flex-col gap-3.5 sm:gap-4 order-2 lg:order-1">
          {/* CAPSULE 01: HIDE MESSAGE */}
          <div
            onClick={() => onNavigate("hide")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onNavigate("hide")}
            className="group cursor-pointer infographic-capsule p-2.5 sm:p-3 pr-4 sm:pr-5 flex items-center gap-3 sm:gap-3.5"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full infographic-node-disc flex items-center justify-center text-[#070c14] shrink-0 font-bold group-hover:scale-105 transition-transform">
              <LockIcon size={20} />
            </div>
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-[var(--border-strong)] to-transparent shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[var(--accent-brass)] font-mono-technical font-bold text-xs sm:text-sm tracking-wider">
                  01
                </span>
                <span className="font-pixel text-[10px] sm:text-[11px] text-[var(--text-primary)] group-hover:text-[var(--accent-cyan)] transition-colors uppercase tracking-wider truncate">
                  HIDE MESSAGE
                </span>
              </div>
              <p className="font-mono-technical text-[10px] sm:text-[11px] text-[var(--text-secondary)] leading-tight line-clamp-2">
                Key-seeded PRNG spatial pixel concealment with XChaCha20-Poly1305.
              </p>
            </div>
          </div>

          {/* CAPSULE 02: EXTRACT MESSAGE */}
          <div
            onClick={() => onNavigate("reveal")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onNavigate("reveal")}
            className="group cursor-pointer infographic-capsule p-2.5 sm:p-3 pr-4 sm:pr-5 flex items-center gap-3 sm:gap-3.5"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full infographic-node-disc flex items-center justify-center text-[#070c14] shrink-0 font-bold group-hover:scale-105 transition-transform">
              <UnlockIcon size={20} />
            </div>
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-[var(--border-strong)] to-transparent shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[var(--accent-brass)] font-mono-technical font-bold text-xs sm:text-sm tracking-wider">
                  02
                </span>
                <span className="font-pixel text-[10px] sm:text-[11px] text-[var(--text-primary)] group-hover:text-[var(--accent-cyan)] transition-colors uppercase tracking-wider truncate">
                  EXTRACT MESSAGE
                </span>
              </div>
              <p className="font-mono-technical text-[10px] sm:text-[11px] text-[var(--text-secondary)] leading-tight line-clamp-2">
                Multi-carrier recovery with Argon2id passphrase authentication.
              </p>
            </div>
          </div>

          {/* CAPSULE 06: AIRGAP POSTURE */}
          <div
            onClick={() => onNavigate("tech")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onNavigate("tech")}
            className="group cursor-pointer infographic-capsule p-2.5 sm:p-3 pr-4 sm:pr-5 flex items-center gap-3 sm:gap-3.5"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full infographic-node-disc flex items-center justify-center text-[#070c14] shrink-0 font-bold group-hover:scale-105 transition-transform">
              <ShieldCheck size={20} />
            </div>
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-[var(--border-strong)] to-transparent shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[var(--accent-brass)] font-mono-technical font-bold text-xs sm:text-sm tracking-wider">
                  06
                </span>
                <span className="font-pixel text-[10px] sm:text-[11px] text-[var(--text-primary)] group-hover:text-[var(--accent-cyan)] transition-colors uppercase tracking-wider truncate">
                  AIRGAP POSTURE
                </span>
              </div>
              <p className="font-mono-technical text-[10px] sm:text-[11px] text-[var(--text-secondary)] leading-tight line-clamp-2">
                Zero cloud telemetry, strict hardware isolation and local execution.
              </p>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: GRAND CONCENTRIC MEDALLION ORB */}
        <div className="lg:col-span-4 flex items-center justify-center order-1 lg:order-2 my-2 lg:my-0">
          <div className="w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 rounded-full relative flex items-center justify-center p-3 sm:p-4 infographic-orb-outer">
            {/* Outer Concentric Pulse Rings */}
            <div className="absolute inset-2 rounded-full border border-dashed border-[var(--accent-cyan)]/40 pointer-events-none" />
            <div className="absolute inset-4 rounded-full border border-[var(--accent-brass)]/30 pointer-events-none" />

            {/* Core Circular Emblem */}
            <div className="w-full h-full rounded-full bg-gradient-to-b from-[#0e1726] to-[#05080e] border-2 border-[var(--accent-cyan)]/60 flex flex-col items-center justify-center p-4 text-center shadow-[inset_0_0_30px_rgba(0,240,255,0.25)] relative overflow-hidden">
              {/* Subtle radial shine */}
              <div className="absolute inset-0 bg-radial from-[rgba(0,240,255,0.12)] to-transparent pointer-events-none" />

              <AbhedyaLogo size={46} />
              
              <h2 className="text-sm sm:text-base md:text-lg font-pixel cyber-pixel-title text-[var(--accent-cyan)] uppercase tracking-widest mt-2 select-none">
                ABHEDYA
              </h2>
              
              <span className="text-[9px] sm:text-[10px] font-terminal tracking-widest text-[var(--accent-brass)] uppercase mt-0.5">
                VISHANTI CIPHER // CORE
              </span>

              <span className="mt-2 text-[8px] font-mono-technical uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--accent-brass-bg)] text-[var(--accent-brass-text)] border border-[var(--accent-brass-border)] font-bold">
                SECURE · ACTIVE
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 3 CAPSULES (03, 05, 04) */}
        <div className="lg:col-span-4 flex flex-col gap-3.5 sm:gap-4 order-3">
          {/* CAPSULE 03: STEGANALYSIS */}
          <div
            onClick={() => onNavigate("stego")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onNavigate("stego")}
            className="group cursor-pointer infographic-capsule p-2.5 sm:p-3 pr-4 sm:pr-5 flex items-center gap-3 sm:gap-3.5"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full infographic-node-disc flex items-center justify-center text-[#070c14] shrink-0 font-bold group-hover:scale-105 transition-transform">
              <ActivityIcon size={20} />
            </div>
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-[var(--border-strong)] to-transparent shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[var(--accent-cyan)] font-mono-technical font-bold text-xs sm:text-sm tracking-wider">
                  03
                </span>
                <span className="font-pixel text-[10px] sm:text-[11px] text-[var(--text-primary)] group-hover:text-[var(--accent-cyan)] transition-colors uppercase tracking-wider truncate">
                  STEGANALYSIS
                </span>
              </div>
              <p className="font-mono-technical text-[10px] sm:text-[11px] text-[var(--text-secondary)] leading-tight line-clamp-2">
                Chi-Square PoV equalization & Fridrich RS dual-mask anomaly scanner.
              </p>
            </div>
          </div>

          {/* CAPSULE 05: SECURITY SPECS */}
          <div
            onClick={() => onNavigate("tech")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onNavigate("tech")}
            className="group cursor-pointer infographic-capsule p-2.5 sm:p-3 pr-4 sm:pr-5 flex items-center gap-3 sm:gap-3.5"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full infographic-node-disc flex items-center justify-center text-[#070c14] shrink-0 font-bold group-hover:scale-105 transition-transform">
              <CpuIcon size={20} />
            </div>
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-[var(--border-strong)] to-transparent shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[var(--accent-cyan)] font-mono-technical font-bold text-xs sm:text-sm tracking-wider">
                  05
                </span>
                <span className="font-pixel text-[10px] sm:text-[11px] text-[var(--text-primary)] group-hover:text-[var(--accent-cyan)] transition-colors uppercase tracking-wider truncate">
                  SECURITY SPECS
                </span>
              </div>
              <p className="font-mono-technical text-[10px] sm:text-[11px] text-[var(--text-secondary)] leading-tight line-clamp-2">
                AEAD encryption primitives, 256-bit entropy, and memory-hard KDF.
              </p>
            </div>
          </div>

          {/* CAPSULE 04: AUDIT TRAIL */}
          <div
            onClick={() => onNavigate("history")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onNavigate("history")}
            className="group cursor-pointer infographic-capsule p-2.5 sm:p-3 pr-4 sm:pr-5 flex items-center gap-3 sm:gap-3.5"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full infographic-node-disc flex items-center justify-center text-[#070c14] shrink-0 font-bold group-hover:scale-105 transition-transform">
              <HistoryIcon size={20} />
            </div>
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-[var(--border-strong)] to-transparent shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[var(--accent-cyan)] font-mono-technical font-bold text-xs sm:text-sm tracking-wider">
                  04
                </span>
                <span className="font-pixel text-[10px] sm:text-[11px] text-[var(--text-primary)] group-hover:text-[var(--accent-cyan)] transition-colors uppercase tracking-wider truncate">
                  AUDIT TRAIL
                </span>
              </div>
              <p className="font-mono-technical text-[10px] sm:text-[11px] text-[var(--text-secondary)] leading-tight line-clamp-2">
                Local cryptographic session logs with zero plaintext retention.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Telemetry & Specifications (Matching Lower Template Section in Blue & Green) */}
      <div className="text-center pt-4 sm:pt-6 border-t border-[var(--border-subtle)] shrink-0 space-y-2.5">
        <h3 className="text-xs font-pixel text-[var(--accent-brass)] uppercase tracking-widest select-none">
          THE VISHANTI CIPHER SPECIFICATION
        </h3>
        
        <p className="text-[11px] sm:text-xs font-mono-technical text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
          Authenticated symmetric cryptography (XChaCha20-Poly1305 + Argon2id) fused with discrete spatial least-significant-bit steganography. Engineered for undetectable transmission and uncompromising confidentiality.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto pt-1 text-left">
          <div className="p-2.5 rounded-lg bg-[var(--bg-inset)] border border-[var(--border-subtle)] space-y-0.5">
            <span className="text-[10px] font-mono-technical font-bold text-[var(--accent-cyan)] uppercase tracking-wider">
              [01] LOCAL INTEGRITY AUDIT
            </span>
            <p className="text-[10px] font-mono-technical text-[var(--text-muted)] leading-normal">
              Full airgap isolation. Zero network packets dispatched. Memory wiped upon buffer disposal.
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-[var(--bg-inset)] border border-[var(--border-subtle)] space-y-0.5">
            <span className="text-[10px] font-mono-technical font-bold text-[var(--accent-brass)] uppercase tracking-wider">
              [02] SPATIAL CARRIER DEFENSE
            </span>
            <p className="text-[10px] font-mono-technical text-[var(--text-muted)] leading-normal">
              Key-seeded PRNG random walk protects against linear Chi-Square and RS sample-pair steganalysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
