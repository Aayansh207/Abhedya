import React, { useState, useEffect } from "react";
import Home from "./pages/Home";
import HideMessage from "./pages/HideMessage";
import RevealMessage from "./pages/RevealMessage";
import Steganalysis from "./pages/Steganalysis";
import History from "./pages/History";
import TechSecurity from "./pages/TechSecurity";
import ThemeSwitcher from "./components/ThemeSwitcher";
import WindowControls from "./components/WindowControls";
import {
  ShieldIcon,
  Lock,
  Unlock,
  Activity,
  History as HistIcon,
  Home as HmIcon,
  ShieldCheck,
  Terminal,
  ActivityIcon
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
    { id: "home", label: "COMMAND DECK", icon: HmIcon, shortcut: "01" },
    { id: "hide", label: "HIDE MESSAGE", icon: Lock, shortcut: "02" },
    { id: "reveal", label: "EXTRACT MESSAGE", icon: Unlock, shortcut: "03" },
    { id: "stego", label: "STEGANALYSIS", icon: Activity, shortcut: "04" },
    { id: "history", label: "AUDIT LOG", icon: HistIcon, shortcut: "05" },
    { id: "tech", label: "SPEC & SECURITY", icon: ShieldCheck, shortcut: "06" }
  ];

  const currentNav = navItems.find((n) => n.id === activeTab) || navItems[0];

  return (
    <div className="flex h-screen w-screen bg-[var(--bg-app)] text-[var(--text-primary)] overflow-hidden select-none font-hud relative">
      {/* Ambient Cyber Grid & Glow overlay */}
      <div className="absolute inset-0 tactical-grid-overlay opacity-40 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-48 bg-gradient-to-b from-[var(--accent-brass)]/10 to-transparent blur-3xl pointer-events-none" />

      {/* PERSISTENT TACTICAL CYBER NAVIGATION RAIL */}
      <aside className="w-16 md:w-64 bg-[var(--bg-sidebar)] border-r border-[var(--border-medium)] flex flex-col justify-between shrink-0 z-30 transition-all duration-200 overflow-hidden relative shadow-[4px_0_24px_rgba(0,0,0,0.8)]">
        {/* Subtle Tech Vertical Line Accents */}
        <div className="absolute top-0 bottom-0 right-0 w-[1px] bg-gradient-to-b from-[var(--accent-brass)]/40 via-[var(--border-subtle)] to-[var(--accent-brass)]/40 pointer-events-none" />

        {/* Brand Header */}
        <div className="flex flex-col min-h-0 flex-1 overflow-hidden">
          <div
            onClick={() => setActiveTab("home")}
            className="h-16 px-3.5 flex items-center gap-3 border-b border-[var(--border-medium)] cursor-pointer hover:bg-[var(--bg-surface-hover)] transition-colors app-no-drag shrink-0 relative group"
          >
            {/* Hexagonal Cyber Brand Glyph */}
            <div className="relative w-9 h-9 shrink-0 flex items-center justify-center">
              <div className="absolute inset-0 cyber-hex bg-[var(--accent-brass)]/20 group-hover:bg-[var(--accent-brass)]/30 transition-colors" />
              <div className="absolute inset-[2px] cyber-hex bg-[var(--bg-surface-elevated)] border border-[var(--accent-brass)]/60 flex items-center justify-center text-[var(--accent-brass)] shadow-[0_0_10px_rgba(0,255,136,0.35)]">
                <ShieldIcon size={18} className="text-[var(--accent-brass)]" />
              </div>
            </div>

            <div className="hidden md:flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-display font-bold tracking-widest text-[var(--text-primary)] uppercase truncate cyber-text-glow">
                  ABHEDYA
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-brass)] indicator-pulse" />
              </div>
              <span className="text-[9px] font-mono-technical tracking-widest text-[var(--accent-brass)] uppercase truncate opacity-85">
                VISHANTI CIPHER // HUD
              </span>
            </div>
          </div>

          {/* Navigation Item Stack */}
          <nav className="p-2 md:p-3 space-y-1.5 overflow-y-auto flex-1" aria-label="Main Navigation">
            <div className="hidden md:flex items-center justify-between px-2.5 py-1 text-[9px] font-mono-technical uppercase tracking-widest text-[var(--text-muted)] font-semibold">
              <span>WORKSPACES</span>
              <span className="text-[var(--accent-brass)] opacity-70">[ HUD 2.0 ]</span>
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
                  className={`w-full group relative flex items-center gap-3 px-3 py-2.5 cyber-cut-corner-sm text-xs transition-all duration-150 app-no-drag ${
                    isActive
                      ? "bg-gradient-to-r from-[var(--accent-brass)]/20 to-[var(--bg-surface-elevated)] text-[var(--text-primary)] border border-[var(--accent-brass)] cyber-glow-green-sm"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] border border-transparent hover:border-[var(--border-subtle)]"
                  }`}
                >
                  {/* Active Indicator Cut Bar */}
                  {isActive && (
                    <div className="absolute left-0 top-1 bottom-1 w-1 bg-[var(--accent-brass)] shadow-[0_0_8px_var(--accent-brass)]" />
                  )}

                  <div className={`shrink-0 transition-colors ${isActive ? "text-[var(--accent-brass)]" : "text-[var(--text-muted)] group-hover:text-[var(--accent-brass)]"}`}>
                    <Icon size={16} />
                  </div>

                  <span className={`hidden md:inline truncate font-hud font-semibold text-[11px] tracking-wider uppercase ${isActive ? "text-[var(--text-primary)]" : ""}`}>
                    {item.label}
                  </span>

                  <span className={`hidden md:inline ml-auto text-[9px] font-mono-technical ${isActive ? "text-[var(--accent-brass)] font-bold" : "text-[var(--text-dim)] group-hover:text-[var(--text-secondary)]"}`}>
                    {item.shortcut}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Telemetry Card */}
        <div className="p-3 border-t border-[var(--border-medium)] bg-[var(--bg-inset)] space-y-2 shrink-0">
          <div className="hidden md:flex items-center justify-between text-[11px] font-mono-technical">
            <span className="text-[var(--text-muted)] uppercase tracking-wider text-[10px]">
              ENGINE POSTURE
            </span>
            <span className="flex items-center gap-1.5 text-[var(--accent-brass)] font-semibold text-[10px] cyber-text-glow">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-brass)] indicator-pulse" />
              AIRGAPPED
            </span>
          </div>

          <div className="hidden md:flex items-center justify-between text-[10px] font-mono-technical text-[var(--text-secondary)] pt-1.5 border-t border-[var(--border-subtle)]">
            <span className="text-[var(--text-muted)]">CORE: <strong className="text-[var(--text-primary)]">v{appInfo.version}</strong></span>
            <span className="px-1.5 py-0.2 rounded bg-[var(--bg-surface)] text-[var(--accent-brass)] border border-[var(--border-subtle)]">
              {appInfo.isElectron ? "NATIVE" : "WEB PREVIEW"}
            </span>
          </div>

          {/* Narrow Viewport Indicator Dot */}
          <div className="md:hidden flex justify-center py-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-brass)] indicator-pulse" title="Hardware Isolated" />
          </div>
        </div>
      </aside>

      {/* RIGHT MAIN CONTROL SURFACE WORKSPACE */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-[var(--bg-app)] relative overflow-hidden">
        {/* TOP STATUS & TELEMETRY HEADER / TITLEBAR */}
        <header className="h-16 px-4 sm:px-6 border-b border-[var(--border-medium)] bg-[var(--bg-header)] backdrop-blur-md flex items-center justify-between shrink-0 z-20 app-drag-region relative">
          {/* Subtle Top Glow Accent */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent-brass)]/50 to-transparent pointer-events-none" />

          {/* Breadcrumb / Current View locator */}
          <div className="flex items-center gap-3 min-w-0 app-no-drag">
            <div className="px-2.5 py-1 cyber-cut-corner-sm bg-[var(--bg-inset)] border border-[var(--border-medium)] flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--accent-brass)] shadow-[0_0_6px_var(--accent-brass)]" />
              <span className="text-[10px] font-display font-bold text-[var(--accent-brass)] tracking-widest uppercase">
                {currentNav.shortcut}
              </span>
            </div>

            <div className="flex items-center gap-2 truncate">
              <span className="text-xs font-display font-bold text-[var(--text-primary)] tracking-wider uppercase truncate cyber-text-glow">
                {currentNav.label}
              </span>
            </div>
          </div>

          {/* Right Header Controls: Futuristic Status Badges, Live Clock, Theme Switcher, Window Controls */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs app-no-drag">
            {/* Cipher Algorithm HUD Pill */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 cyber-cut-corner-sm bg-[var(--bg-inset)] border border-[var(--border-medium)] text-[10px] font-mono-technical">
              <span className="text-[var(--text-muted)]">CIPHER:</span>
              <span className="text-[var(--accent-brass)] font-bold">XCHACHA20-POLY1305</span>
            </div>

            {/* Target Container Format Pill */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1 cyber-cut-corner-sm bg-[var(--bg-inset)] border border-[var(--border-medium)] text-[10px] font-mono-technical">
              <span className="text-[var(--text-muted)]">FORMAT:</span>
              <span className="text-[var(--accent-cyan)] font-bold">LOSSLESS PNG</span>
            </div>

            {/* Live Clock with HUD Digital Readout */}
            {currentTime && (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 cyber-cut-corner-sm bg-[var(--bg-inset)] border border-[var(--border-medium)] text-[11px] font-mono-technical text-[var(--text-primary)] shadow-inner">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-brass)] animate-ping" />
                <span className="font-semibold">{currentTime}</span>
              </div>
            )}

            {/* Theme Switcher Component */}
            <ThemeSwitcher />

            {/* Desktop Window Controls */}
            {(api.isElectron || appInfo.isElectron) && (
              <div className="pl-1 border-l border-[var(--border-medium)]">
                <WindowControls />
              </div>
            )}
          </div>
        </header>

        {/* WORKSPACE VIEWPORT ENCLOSURE */}
        <main className="flex-1 p-3.5 sm:p-5 md:p-6 overflow-hidden relative min-h-0 min-w-0">
          {/* Futuristic Screen Outer HUD Chamfered Frame */}
          <div className="h-full w-full max-w-7xl mx-auto overflow-hidden relative cyber-outer-frame cyber-cut-corner bg-[var(--bg-panel)]/40 p-3 sm:p-4 md:p-5 flex flex-col min-h-0">
            {/* Corner Decorative Brackets */}
            <div className="corner-bracket-tl" />
            <div className="corner-bracket-tr" />
            <div className="corner-bracket-bl" />
            <div className="corner-bracket-br" />

            {/* Viewport Content */}
            <div className="flex-1 min-h-0 min-w-0 overflow-hidden relative">
              {activeTab === "home" && <Home onNavigate={(tab) => setActiveTab(tab)} />}
              {activeTab === "hide" && <HideMessage />}
              {activeTab === "reveal" && <RevealMessage />}
              {activeTab === "stego" && <Steganalysis />}
              {activeTab === "history" && <History />}
              {activeTab === "tech" && <TechSecurity />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
