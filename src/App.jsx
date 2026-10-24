import React, { useState, useEffect } from "react";
import Home from "./pages/Home";
import HideMessage from "./pages/HideMessage";
import RevealMessage from "./pages/RevealMessage";
import Steganalysis from "./pages/Steganalysis";
import History from "./pages/History";
import TechSecurity from "./pages/TechSecurity";
import {
  ShieldIcon,
  LockIcon,
  UnlockIcon,
  ActivityIcon,
  HistoryIcon,
  HomeIcon,
  CpuIcon,
  Layers,
  CrosshairIcon,
  Lock,
  Unlock,
  Activity,
  History as HistIcon,
  Home as HmIcon,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Terminal
} from "./components/Icons";
import { api } from "./services/api";

export default function App() {
  const [activeTab, setActiveTab] = useState("home"); // 'home' | 'hide' | 'reveal' | 'stego' | 'history' | 'tech'
  const [currentTime, setCurrentTime] = useState("");
  const [appInfo, setAppInfo] = useState({
    name: "Abhedya",
    version: "0.1.0",
    platform: "Local",
    isElectron: false
  });

  useEffect(() => {
    api.getAppInfo().then(setAppInfo).catch(() => {});

    // Clock update
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: "home", label: "Overview", icon: HmIcon, shortcut: "01" },
    { id: "hide", label: "Hide Message", icon: Lock, shortcut: "02" },
    { id: "reveal", label: "Extract Message", icon: Unlock, shortcut: "03" },
    { id: "stego", label: "Steganalysis", icon: Activity, shortcut: "04" },
    { id: "history", label: "History", icon: HistIcon, shortcut: "05" },
    { id: "tech", label: "Technology & Security", icon: ShieldCheck, shortcut: "06" }
  ];

  return (
    <div className="flex h-screen w-screen bg-[#07080b] text-[#f2f2ef] overflow-hidden select-none font-sans">
      {/* PERSISTENT TACTICAL LEFT NAVIGATION RAIL */}
      <aside className="w-16 md:w-64 bg-[#0c0d12] border-r border-white/5 flex flex-col justify-between shrink-0 z-30 transition-all duration-200">
        {/* Brand Header */}
        <div>
          <div
            onClick={() => setActiveTab("home")}
            className="h-16 px-4 flex items-center gap-3 border-b border-white/5 cursor-pointer hover:bg-white/[0.02] transition-colors"
          >
            {/* Hexagonal Tactical Brand Glyph */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c5a059] to-[#7f6428] p-[1px] shadow-lg shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-[#0d0e14] rounded-xl flex items-center justify-center text-[#e5be6b]">
                <ShieldIcon size={18} />
              </div>
            </div>

            <div className="hidden md:flex flex-col min-w-0">
              <span className="text-xs font-mono font-bold tracking-widest text-zinc-100 uppercase truncate">
                ABHEDYA
              </span>
              <span className="text-[10px] font-mono tracking-wider text-[#c5a059] uppercase truncate">
                VISHANTI CIPHER
              </span>
            </div>
          </div>

          {/* Navigation Item Stack */}
          <nav className="p-2 md:p-3 space-y-1.5" aria-label="Main Navigation">
            <div className="hidden md:block px-2.5 py-1 text-[9px] font-mono uppercase tracking-widest text-zinc-600 font-semibold">
              WORKSPACES
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  title={item.label}
                  className={`w-full group relative flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-xs font-mono transition-all duration-150 ${
                    isActive
                      ? "bg-[#181a24] text-white shadow-[0_4px_20px_-2px_rgba(0,0,0,0.5)] border border-white/10"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]"
                  }`}
                >
                  {/* Active Indicator Bar */}
                  {isActive && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-[#c5a059] shadow-[0_0_10px_rgba(197,160,89,0.8)]" />
                  )}

                  <div className={`shrink-0 transition-colors ${isActive ? "text-[#c5a059]" : "group-hover:text-zinc-200"}`}>
                    <Icon size={18} />
                  </div>

                  <span className="hidden md:inline truncate font-medium text-[12px] tracking-wide">
                    {item.label}
                  </span>

                  <span className={`hidden md:inline ml-auto text-[9px] font-mono ${isActive ? "text-[#c5a059]/70" : "text-zinc-600 group-hover:text-zinc-400"}`}>
                    {item.shortcut}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Telemetry */}
        <div className="p-3 border-t border-white/5 bg-[#090a0f] space-y-2">
          <div className="hidden md:flex items-center justify-between text-[11px] font-mono">
            <span className="text-zinc-500 uppercase tracking-wider text-[10px]">
              Engine Posture
            </span>
            <span className="flex items-center gap-1.5 text-[#34d399] font-medium text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] indicator-pulse" />
              AIRGAPPED
            </span>
          </div>

          <div className="hidden md:flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1 border-t border-white/5">
            <span>Core v{appInfo.version}</span>
            <span>{appInfo.isElectron ? "Electron Shell" : "Web Preview"}</span>
          </div>

          {/* Minimalist Mobile/Narrow Rail Dot */}
          <div className="md:hidden flex justify-center py-1">
            <span className="w-2 h-2 rounded-full bg-[#10b981] indicator-pulse" title="Hardware Isolated" />
          </div>
        </div>
      </aside>

      {/* RIGHT MAIN CONTROL SURFACE WORKSPACE */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-[#090a0d] relative overflow-hidden">
        {/* TOP STATUS & TELEMETRY HEADER */}
        <header className="h-16 px-6 border-b border-white/5 bg-[#0d0e14]/90 backdrop-blur-md flex items-center justify-between shrink-0 z-20">
          {/* Breadcrumb Module Locator */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-zinc-500 tracking-widest uppercase">
              ABHEDYA // CONSOLE
            </span>
            <span className="text-zinc-700">/</span>
            <span className="text-xs font-mono font-bold text-zinc-200 tracking-wider uppercase">
              {navItems.find((n) => n.id === activeTab)?.label}
            </span>
          </div>

          {/* Live System Telemetry Status Badges */}
          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-black/40 border border-white/5 text-[11px] text-zinc-400">
              <span className="text-zinc-600">CIPHER:</span>
              <span className="text-zinc-200 font-semibold">XCHACHA20-POLY1305</span>
            </div>

            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-black/40 border border-white/5 text-[11px] text-zinc-400">
              <span className="text-zinc-600">FORMAT:</span>
              <span className="text-[#e5be6b] font-semibold">LOSSLESS PNG</span>
            </div>

            {currentTime && (
              <div className="px-3 py-1 rounded-lg bg-black/40 border border-white/5 text-[11px] font-mono text-zinc-300">
                {currentTime}
              </div>
            )}
          </div>
        </header>

        {/* WORKSPACE VIEWPORT */}
        <main className="flex-1 p-5 md:p-6 overflow-hidden relative">
          {activeTab === "home" && <Home onNavigate={(tab) => setActiveTab(tab)} />}
          {activeTab === "hide" && <HideMessage />}
          {activeTab === "reveal" && <RevealMessage />}
          {activeTab === "stego" && <Steganalysis />}
          {activeTab === "history" && <History />}
          {activeTab === "tech" && <TechSecurity />}
        </main>
      </div>
    </div>
  );
}
