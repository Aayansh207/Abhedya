import React, { useEffect, useState } from "react";
import {
  LockIcon,
  UnlockIcon,
  ShieldIcon,
  ActivityIcon,
  HistoryIcon,
  CpuIcon,
  CrosshairIcon,
  KeyIcon,
  CheckIcon,
  AlertCircleIcon,
  ChevronRight,
  Terminal,
  Layers,
  Sparkles
} from "../components/Icons";
import { historyStore } from "../services/history";
import { api } from "../services/api";

export default function Home({ onNavigate }) {
  const [recentOps, setRecentOps] = useState([]);
  const [appInfo, setAppInfo] = useState({ version: "0.1.0", platform: "Local", isElectron: false });

  useEffect(() => {
    setRecentOps(historyStore.getHistory().slice(0, 4));
    api.getAppInfo().then(setAppInfo).catch(() => {});
  }, []);

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto pr-1">
      {/* Top Banner / System HUD Status */}
      <div className="glass-panel p-6 border-white/10 bg-[#0e1017]/80 relative overflow-hidden">
        {/* Subtle decorative tactical corner reticle */}
        <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-[#c5a059]/40" />
        <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-[#c5a059]/40" />
        <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-[#c5a059]/40" />
        <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-[#c5a059]/40" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#c5a059]/20 text-[#e5be6b] border border-[#c5a059]/30 tracking-widest uppercase">
                VISHANTI CIPHER CONSOLE
              </span>
              <span className="flex items-center gap-1 text-[11px] font-mono text-[#34d399]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] indicator-pulse" />
                LOCAL ENGINE ACTIVE
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              <span>Abhedya</span>
              <span className="text-xs font-mono font-normal text-zinc-400 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                v{appInfo.version}
              </span>
            </h1>
            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
              Industrial-grade authenticated encryption and discrete pixel steganography. Conceal high-entropy ciphertext into lossless carrier imagery with key-seeded pixel scattering.
            </p>
          </div>

          {/* Quick telemetry indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 shrink-0 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
              <span className="block text-[10px] text-zinc-500 uppercase">Cipher Suite</span>
              <span className="font-semibold text-zinc-200">XChaCha20-Poly1305</span>
            </div>
            <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
              <span className="block text-[10px] text-zinc-500 uppercase">Key Derivation</span>
              <span className="font-semibold text-[#e5be6b]">Argon2id / Scrypt</span>
            </div>
            <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 col-span-2 sm:col-span-1">
              <span className="block text-[10px] text-zinc-500 uppercase">Environment</span>
              <span className="font-semibold text-[#34d399]">
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
          className="group relative p-6 rounded-xl glass-panel border-white/10 hover:border-[#c5a059]/50 bg-[#0f1118]/85 hover:bg-[#151824] transition-all duration-200 cursor-pointer shadow-xl flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-[#c5a059]/10 border border-[#c5a059]/30 flex items-center justify-center text-[#e5be6b] group-hover:scale-105 transition-transform">
                <LockIcon size={22} />
              </div>
              <span className="text-[11px] font-mono text-[#d8b671] bg-[#c5a059]/10 px-2 py-0.5 rounded border border-[#c5a059]/20 flex items-center gap-1">
                PRIMARY WORKSPACE <ChevronRight size={12} />
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-white group-hover:text-[#e5be6b] transition-colors">
                Hide Secret Message
              </h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Encrypt confidential text with authenticated ciphers, calculate exact carrier capacity, and embed payload imperceptibly via sequential or key-seeded scattering.
              </p>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>Inputs: Image + Secret + Passphrase</span>
            <span className="text-[#d8b671] font-semibold group-hover:translate-x-1 transition-transform">
              Launch Encoder →
            </span>
          </div>
        </div>

        {/* EXTRACT / REVEAL WORKSPACE TILE */}
        <div
          onClick={() => onNavigate("reveal")}
          className="group relative p-6 rounded-xl glass-panel border-white/10 hover:border-[#34d399]/50 bg-[#0f1118]/85 hover:bg-[#151824] transition-all duration-200 cursor-pointer shadow-xl flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-[#10b981]/10 border border-[#10b981]/30 flex items-center justify-center text-[#34d399] group-hover:scale-105 transition-transform">
                <UnlockIcon size={22} />
              </div>
              <span className="text-[11px] font-mono text-[#34d399] bg-[#10b981]/10 px-2 py-0.5 rounded border border-[#10b981]/20 flex items-center gap-1">
                DECODE WORKSPACE <ChevronRight size={12} />
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-white group-hover:text-[#34d399] transition-colors">
                Extract Hidden Message
              </h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Ingest an encoded lossless PNG, verify the cryptographic Poly1305 MAC authentication tag, and safely recover the original plaintext message.
              </p>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>Inputs: Encoded PNG + Passphrase</span>
            <span className="text-[#34d399] font-semibold group-hover:translate-x-1 transition-transform">
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
          className="p-4 rounded-xl glass-panel border-white/10 hover:border-white/20 bg-[#0e1017]/70 cursor-pointer transition-colors flex items-center gap-4 group"
        >
          <div className="w-10 h-10 rounded-lg bg-zinc-800/80 border border-white/10 flex items-center justify-center text-zinc-300 group-hover:text-[#c5a059] group-hover:border-[#c5a059]/40 transition-colors shrink-0">
            <ActivityIcon size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-mono font-semibold uppercase text-zinc-200 group-hover:text-white transition-colors">
              Steganalysis Laboratory
            </h4>
            <p className="text-[11px] text-zinc-400 truncate">
              Chi-Square Pair-of-Values & RS mask analysis to test statistical detectability.
            </p>
          </div>
          <ChevronRight size={16} className="text-zinc-500 group-hover:text-white transition-colors" />
        </div>

        {/* Technology & Security Quick Entry */}
        <div
          onClick={() => onNavigate("tech")}
          className="p-4 rounded-xl glass-panel border-white/10 hover:border-white/20 bg-[#0e1017]/70 cursor-pointer transition-colors flex items-center gap-4 group"
        >
          <div className="w-10 h-10 rounded-lg bg-zinc-800/80 border border-white/10 flex items-center justify-center text-zinc-300 group-hover:text-[#34d399] group-hover:border-[#34d399]/40 transition-colors shrink-0">
            <ShieldIcon size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-mono font-semibold uppercase text-zinc-200 group-hover:text-white transition-colors">
              Technology & Security Architecture
            </h4>
            <p className="text-[11px] text-zinc-400 truncate">
              Detailed breakdown of key derivation, authenticated encryption, and pixel walks.
            </p>
          </div>
          <ChevronRight size={16} className="text-zinc-500 group-hover:text-white transition-colors" />
        </div>
      </div>

      {/* Security Architecture Posture Matrix */}
      <div className="glass-panel p-5 border-white/10 bg-[#0e1017]/80 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <ShieldIcon size={14} className="text-[#c5a059]" />
            Security & Cryptographic Foundation
          </h3>
          <span className="text-[10px] font-mono text-zinc-500">INTEGRITY VERIFIED</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-zinc-200">
              <CheckIcon size={13} className="text-[#10b981]" />
              <span>Zero-Cloud Local Isolation</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              No outbound network traffic. Cryptographic keys and raw pixel buffers remain confined entirely to local memory.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-zinc-200">
              <CheckIcon size={13} className="text-[#10b981]" />
              <span>Authenticated Encryption</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Poly1305 MAC prevents tampering or corruption. Invalid passwords fail safely in constant time without leaking plaintext.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-zinc-200">
              <CheckIcon size={13} className="text-[#10b981]" />
              <span>Lossless PNG Enforcement</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Strict output format validation prevents lossy JPEG compression artifacts from destroying embedded least-significant bits.
            </p>
          </div>
        </div>
      </div>

      {/* Transmission Advisory Banner */}
      <div className="p-4 rounded-xl bg-[#14151e]/80 border border-[#c5a059]/20 flex items-start gap-3.5">
        <AlertCircleIcon size={18} className="text-[#c5a059] shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed text-zinc-300">
          <strong className="text-white font-semibold">Operational Transmission Rule:</strong> Instant messaging applications (WhatsApp, Telegram, Discord) automatically recompress photos into lossy formats, obliterating concealed LSB bits. Always transmit encoded PNGs as a <em>"Document"</em>, <em>"Uncompressed File"</em>, or via encrypted file transfer.
        </div>
      </div>
    </div>
  );
}
