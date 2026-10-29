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
    api.getAppInfo().then(setAppInfo).catch(() => { });
  }, []);

  return (
    <div className="h-full flex flex-col justify-between max-w-6xl mx-auto px-4 py-4 sm:py-6 overflow-y-auto min-h-0 min-w-0 carbon-mesh-bg">
      {/* Clean Top Status */}
      <div className="text-center shrink-0 mb-3 sm:mb-5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#121212] border border-[#ff3b30]/30 shadow-[0_0_12px_rgba(255,59,48,0.15)]">
          <span className="w-2 h-2 rounded-full bg-[#ff3b30] indicator-pulse" />
          <span className="text-xs font-mono-technical font-semibold text-[#ffffff] tracking-wider uppercase">
            AIRGAPPED & LOCAL · v{appInfo.version}
          </span>
        </div>
      </div>

      {/* Main Infographic Grid: 3 Capsules Left, Central Red Circle, 3 Capsules Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-center my-auto shrink-0">

        {/* LEFT COLUMN: CAPSULES 01, 02, 06 */}
        <div className="lg:col-span-4 flex flex-col gap-3.5 sm:gap-4 order-2 lg:order-1">
          {/* CAPSULE 01: HIDE MESSAGE */}
          <div
            onClick={() => onNavigate("hide")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onNavigate("hide")}
            className="group cursor-pointer infographic-capsule p-2.5 sm:p-3 pr-4 sm:pr-5 flex items-center gap-3 sm:gap-3.5"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#ff3b30] flex items-center justify-center text-[#ffffff] shrink-0 font-bold shadow-[0_0_18px_rgba(255,59,48,0.7)] group-hover:scale-105 transition-transform">
              <LockIcon size={20} />
            </div>
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-[#ffffff]/20 to-transparent shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[#ff3b30] font-mono-technical font-bold text-xs sm:text-sm tracking-wider">
                  01
                </span>
                <span className="font-pixel text-[10px] sm:text-[11px] text-[#ffffff] group-hover:text-[#ff3b30] transition-colors uppercase tracking-wider truncate">
                  HIDE MESSAGE
                </span>
              </div>
              <p className="font-mono-technical text-[10px] sm:text-[11px] text-[#d1d5db] leading-tight line-clamp-2">
                Conceal encrypted ciphertext into carrier pixels using PRNG scattering.
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
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#ff3b30] flex items-center justify-center text-[#ffffff] shrink-0 font-bold shadow-[0_0_18px_rgba(255,59,48,0.7)] group-hover:scale-105 transition-transform">
              <UnlockIcon size={20} />
            </div>
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-[#ffffff]/20 to-transparent shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[#ff3b30] font-mono-technical font-bold text-xs sm:text-sm tracking-wider">
                  02
                </span>
                <span className="font-pixel text-[10px] sm:text-[11px] text-[#ffffff] group-hover:text-[#ff3b30] transition-colors uppercase tracking-wider truncate">
                  EXTRACT MESSAGE
                </span>
              </div>
              <p className="font-mono-technical text-[10px] sm:text-[11px] text-[#d1d5db] leading-tight line-clamp-2">
                Authenticate Poly1305 MAC and recover original secret plaintext.
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
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#ff3b30] flex items-center justify-center text-[#ffffff] shrink-0 font-bold shadow-[0_0_18px_rgba(255,59,48,0.7)] group-hover:scale-105 transition-transform">
              <ShieldCheck size={20} />
            </div>
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-[#ffffff]/20 to-transparent shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[#ff3b30] font-mono-technical font-bold text-xs sm:text-sm tracking-wider">
                  06
                </span>
                <span className="font-pixel text-[10px] sm:text-[11px] text-[#ffffff] group-hover:text-[#ff3b30] transition-colors uppercase tracking-wider truncate">
                  AIRGAP POSTURE
                </span>
              </div>
              <p className="font-mono-technical text-[10px] sm:text-[11px] text-[#d1d5db] leading-tight line-clamp-2">
                Zero network egress, strict hardware isolation, and ephemeral RAM.
              </p>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: CLEAN RED MEDALLION (NO EXTRA TEXT) */}
        <div className="lg:col-span-4 flex items-center justify-center order-1 lg:order-2 my-2 lg:my-0">
          <div className="w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 rounded-full relative flex items-center justify-center p-3 sm:p-4 infographic-orb-red">
            {/* Concentric Pulse Rings */}
            <div className="absolute inset-2 rounded-full border border-dashed border-[#ff3b30]/50 pointer-events-none" />
            <div className="absolute inset-4 rounded-full border border-[#ffffff]/20 pointer-events-none" />

            {/* Core Circular Red Emblem */}
            <div className="w-full h-full rounded-full bg-gradient-to-b from-[#1c0808] via-[#120404] to-[#080202] border-2 border-[#ff3b30] flex flex-col items-center justify-center p-4 text-center shadow-[inset_0_0_35px_rgba(255,59,48,0.45)] relative overflow-hidden">
              {/* Subtle radial shine in crimson */}
              <div className="absolute inset-0 bg-radial from-[rgba(255,59,48,0.22)] to-transparent pointer-events-none" />

              <AbhedyaLogo size={52} />

              <h2 className="text-base sm:text-lg md:text-xl font-pixel cyber-pixel-title text-[#ffffff] uppercase tracking-widest mt-3 select-none">
                ABHEDYA
              </h2>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CAPSULES 03, 05, 04 */}
        <div className="lg:col-span-4 flex flex-col gap-3.5 sm:gap-4 order-3">
          {/* CAPSULE 03: STEGANALYSIS */}
          <div
            onClick={() => onNavigate("stego")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onNavigate("stego")}
            className="group cursor-pointer infographic-capsule p-2.5 sm:p-3 pr-4 sm:pr-5 flex items-center gap-3 sm:gap-3.5"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#ff3b30] flex items-center justify-center text-[#ffffff] shrink-0 font-bold shadow-[0_0_18px_rgba(255,59,48,0.7)] group-hover:scale-105 transition-transform">
              <ActivityIcon size={20} />
            </div>
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-[#ffffff]/20 to-transparent shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[#ff3b30] font-mono-technical font-bold text-xs sm:text-sm tracking-wider">
                  03
                </span>
                <span className="font-pixel text-[10px] sm:text-[11px] text-[#ffffff] group-hover:text-[#ff3b30] transition-colors uppercase tracking-wider truncate">
                  STEGANALYSIS
                </span>
              </div>
              <p className="font-mono-technical text-[10px] sm:text-[11px] text-[#d1d5db] leading-tight line-clamp-2">
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
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#ff3b30] flex items-center justify-center text-[#ffffff] shrink-0 font-bold shadow-[0_0_18px_rgba(255,59,48,0.7)] group-hover:scale-105 transition-transform">
              <CpuIcon size={20} />
            </div>
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-[#ffffff]/20 to-transparent shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[#ff3b30] font-mono-technical font-bold text-xs sm:text-sm tracking-wider">
                  05
                </span>
                <span className="font-pixel text-[10px] sm:text-[11px] text-[#ffffff] group-hover:text-[#ff3b30] transition-colors uppercase tracking-wider truncate">
                  SECURITY SPECS
                </span>
              </div>
              <p className="font-mono-technical text-[10px] sm:text-[11px] text-[#d1d5db] leading-tight line-clamp-2">
                AEAD cipher specifications, 256-bit entropy, and Argon2id KDF.
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
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#ff3b30] flex items-center justify-center text-[#ffffff] shrink-0 font-bold shadow-[0_0_18px_rgba(255,59,48,0.7)] group-hover:scale-105 transition-transform">
              <HistoryIcon size={20} />
            </div>
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-[#ffffff]/20 to-transparent shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[#ff3b30] font-mono-technical font-bold text-xs sm:text-sm tracking-wider">
                  04
                </span>
                <span className="font-pixel text-[10px] sm:text-[11px] text-[#ffffff] group-hover:text-[#ff3b30] transition-colors uppercase tracking-wider truncate">
                  AUDIT TRAIL
                </span>
              </div>
              <p className="font-mono-technical text-[10px] sm:text-[11px] text-[#d1d5db] leading-tight line-clamp-2">
                Local cryptographic session logs with zero plaintext retention.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Clean Telemetry Footer (Unnecessary text removed) */}
      <div className="pt-4 border-t border-[#ff3b30]/20 shrink-0 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono-technical text-[#888888] gap-2">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b30]" />
          <span className="uppercase text-[#ffffff] font-semibold">AIRGAP ACTIVE</span>
          <span className="text-[#333333]">|</span>
          <span>ZERO CLOUD TELEMETRY</span>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span>XCHACHA20-POLY1305</span>
          <span>·</span>
          <span>ARGON2ID</span>
          <span>·</span>
          <span>LSB PRNG</span>
        </div>
      </div>
    </div>
  );
}
