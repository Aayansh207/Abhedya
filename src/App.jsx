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
    { id: "home", label: "Overview", icon: HmIcon, shortcut: "01" },
    { id: "hide", label: "Hide Message", icon: Lock, shortcut: "02" },
    { id: "reveal", label: "Extract Message", icon: Unlock, shortcut: "03" },
    { id: "stego", label: "Steganalysis", icon: Activity, shortcut: "04" },
    { id: "history", label: "History", icon: HistIcon, shortcut: "05" },
    { id: "tech", label: "Technology & Security", icon: ShieldCheck, shortcut: "06" }
  ];

  const currentNav = navItems.find((n) => n.id === activeTab) || navItems[0];

  return (
    <div className="flex h-screen w-screen bg-[var(--bg-app)] text-[var(--text-primary)] overflow-hidden select-none font-sans">
      {/* PERSISTENT TACTICAL LEFT NAVIGATION RAIL */}
      <aside className="w-16 md:w-60 bg-[var(--bg-sidebar)] border-r border-[var(--border-subtle)] flex flex-col justify-between shrink-0 z-30 transition-all duration-200 overflow-hidden">
        {/* Brand Header & Nav Area */}
        <div className="flex flex-col min-h-0 flex-1 overflow-hidden">
          <div
            onClick={() => setActiveTab("home")}
            className="h-14 px-3.5 flex items-center gap-3 border-b border-[var(--border-subtle)] cursor-pointer hover:bg-[var(--bg-surface-hover)] transition-colors app-no-drag shrink-0"
          >
            {/* Tactical Brand Glyph */}
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-brass-bg)] border border-[var(--accent-brass-border)] shrink-0 flex items-center justify-center text-[var(--accent-brass)] shadow-sm">
              <ShieldIcon size={18} />
            </div>

            <div className="hidden md:flex flex-col min-w-0">
              <span className="text-xs font-mono font-bold tracking-widest text-[var(--text-primary)] uppercase truncate">
                ABHEDYA
              </span>
              <span className="text-[9px] font-mono tracking-wider text-[var(--accent-brass)] uppercase truncate">
                VISHANTI CIPHER
              </span>
            </div>
          </div>

          {/* Navigation Item Stack */}
          <nav className="p-2 md:p-2.5 space-y-1 overflow-y-auto flex-1" aria-label="Main Navigation">
            <div className="hidden md:block px-2.5 py-1 text-[9px] font-mono uppercase tracking-widest text-[var(--text-dim)] font-semibold">
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
                  className={`w-full group relative flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-mono transition-all duration-150 app-no-drag ${
                    isActive
                      ? "bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] shadow-sm border border-[var(--border-medium)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
                  }`}
                >
                  {/* Active Indicator Bar */}
                  {isActive && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-[var(--accent-brass)]" />
                  )}

                  <div className={`shrink-0 transition-colors ${isActive ? "text-[var(--accent-brass)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"}`}>
                    <Icon size={16} />
                  </div>

                  <span className="hidden md:inline truncate font-medium text-[12px] tracking-wide">
                    {item.label}
                  </span>

                  <span className={`hidden md:inline ml-auto text-[9px] font-mono ${isActive ? "text-[var(--accent-brass)]" : "text-[var(--text-dim)] group-hover:text-[var(--text-muted)]"}`}>
                    {item.shortcut}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Telemetry */}
        <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-inset)] space-y-1.5 shrink-0">
          <div className="hidden md:flex items-center justify-between text-[11px] font-mono">
            <span className="text-[var(--text-muted)] uppercase tracking-wider text-[10px]">
              Engine Posture
            </span>
            <span className="flex items-center gap-1.5 text-[var(--accent-jade)] font-medium text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-jade)] indicator-pulse" />
              AIRGAPPED
            </span>
          </div>

          <div className="hidden md:flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)] pt-1 border-t border-[var(--border-subtle)]">
            <span>v{appInfo.version}</span>
            <span>{appInfo.isElectron ? "Electron" : "Web Preview"}</span>
          </div>

          {/* Minimalist Mobile/Narrow Rail Dot */}
          <div className="md:hidden flex justify-center py-1">
            <span className="w-2 h-2 rounded-full bg-[var(--accent-jade)] indicator-pulse" title="Hardware Isolated" />
          </div>
        </div>
      </aside>

      {/* RIGHT MAIN CONTROL SURFACE WORKSPACE */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-[var(--bg-app)] relative overflow-hidden">
        {/* TOP STATUS & TELEMETRY HEADER / TITLEBAR */}
        <header className="h-14 px-4 sm:px-6 border-b border-[var(--border-subtle)] bg-[var(--bg-header)] backdrop-blur-md flex items-center justify-between shrink-0 z-20 app-drag-region">
          {/* Breadcrumb Module Locator */}
          <div className="flex items-center gap-2.5 min-w-0 app-no-drag">
            <span className="text-[10px] font-mono text-[var(--text-muted)] tracking-widest uppercase hidden sm:inline">
              ABHEDYA
            </span>
            <span className="text-[var(--border-strong)] hidden sm:inline">/</span>
            <span className="text-xs font-mono font-bold text-[var(--text-primary)] tracking-wider uppercase truncate">
              {currentNav.label}
            </span>
          </div>

          {/* Right Header Controls: Status Badges, Theme Switcher, Clock, Window Controls */}
          <div className="flex items-center gap-2 sm:gap-3 font-mono text-xs app-no-drag">
            {/* Technical Badges */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--bg-inset)] border border-[var(--border-subtle)] text-[10px] text-[var(--text-secondary)]">
              <span className="text-[var(--text-muted)]">CIPHER:</span>
              <span className="text-[var(--text-primary)] font-semibold">XCHACHA20-POLY1305</span>
            </div>

            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--bg-inset)] border border-[var(--border-subtle)] text-[10px] text-[var(--text-secondary)]">
              <span className="text-[var(--text-muted)]">FORMAT:</span>
              <span className="text-[var(--accent-brass)] font-semibold">LOSSLESS PNG</span>
            </div>

            {/* Live Clock */}
            {currentTime && (
              <div className="hidden md:inline px-2.5 py-1 rounded-md bg-[var(--bg-inset)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)]">
                {currentTime}
              </div>
            )}

            {/* Theme Switcher */}
            <ThemeSwitcher />

            {/* Desktop Window Controls */}
            {(api.isElectron || appInfo.isElectron) && (
              <div className="pl-1 border-l border-[var(--border-subtle)]">
                <WindowControls />
              </div>
            )}
          </div>
        </header>

        {/* WORKSPACE VIEWPORT */}
        <main className="flex-1 p-4 md:p-6 overflow-hidden relative min-h-0 min-w-0">
          <div className="h-full w-full max-w-7xl mx-auto overflow-hidden">
            {activeTab === "home" && <Home onNavigate={(tab) => setActiveTab(tab)} />}
            {activeTab === "hide" && <HideMessage />}
            {activeTab === "reveal" && <RevealMessage />}
            {activeTab === "stego" && <Steganalysis />}
            {activeTab === "history" && <History />}
            {activeTab === "tech" && <TechSecurity />}
          </div>
        </main>
      </div>
    </div>
  );
}
