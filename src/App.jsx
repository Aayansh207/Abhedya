import React, { useState, useEffect } from "react";
import Home from "./pages/Home";
import HideMessage from "./pages/HideMessage";
import RevealMessage from "./pages/RevealMessage";
import Steganalysis from "./pages/Steganalysis";
import History from "./pages/History";
import TechSecurity from "./pages/TechSecurity";
import ThemeSwitcher from "./components/ThemeSwitcher";
import WindowControls from "./components/WindowControls";
import AbhedyaLogo from "./components/AbhedyaLogo";
import {
  Lock,
  Unlock,
  Activity,
  History as HistIcon,
  Home as HmIcon,
  ShieldCheck
} from "./components/Icons";
import { api } from "./services/api";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
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
    { id: "home", label: "Overview", icon: HmIcon, shortcut: "01", accent: "text-[var(--accent-cyan)]" },
    { id: "hide", label: "Hide Message", icon: Lock, shortcut: "02", accent: "text-[var(--accent-brass)]" },
    { id: "reveal", label: "Extract Message", icon: Unlock, shortcut: "03", accent: "text-[var(--accent-cyan)]" },
    { id: "stego", label: "Steganalysis Lab", icon: Activity, shortcut: "04", accent: "text-[var(--accent-amber)]", badge: "CORE" },
    { id: "history", label: "Audit History", icon: HistIcon, shortcut: "05", accent: "text-[var(--accent-purple)]" },
    { id: "tech", label: "Security & Specs", icon: ShieldCheck, shortcut: "06", accent: "text-[var(--accent-cyan)]" }
  ];

  const currentNav = navItems.find((n) => n.id === activeTab) || navItems[0];

  return (
    <div className="flex h-screen w-screen bg-[var(--bg-app)] text-[var(--text-primary)] overflow-hidden select-none font-mono-technical relative">
      {/* Background Reticle Grid */}
      <div className="absolute inset-0 tactical-grid-overlay opacity-25 pointer-events-none" />

      {/* PERSISTENT CYBER NAVIGATION RAIL */}
      <aside className="w-16 md:w-64 bg-[var(--bg-sidebar)] border-r border-[var(--border-subtle)] flex flex-col justify-between shrink-0 z-30 transition-all duration-200 overflow-hidden relative shadow-[4px_0_24px_rgba(0,0,0,0.6)]">
        <div className="flex flex-col min-h-0 flex-1 overflow-hidden">
          {/* Brand Header */}
          <div
            onClick={() => setActiveTab("home")}
            className="h-16 px-3.5 flex items-center gap-3 border-b border-[var(--border-subtle)] cursor-pointer hover:bg-[var(--bg-surface-hover)] transition-colors app-no-drag shrink-0 group"
          >
            {/* Custom High-Tech Pixel Shield Logo */}
            <AbhedyaLogo size={34} />

            <div className="hidden md:flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-pixel cyber-pixel-title text-[var(--accent-cyan)] uppercase truncate select-none">
                  ABHEDYA
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-brass)] indicator-pulse" />
              </div>
              <span className="text-[10px] font-terminal tracking-widest text-[var(--text-secondary)] uppercase truncate">
                VISHANTI CIPHER // CORE
              </span>
            </div>
          </div>

          {/* Navigation Item Stack */}
          <nav className="p-2 md:p-3 space-y-1.5 overflow-y-auto flex-1" aria-label="Main Navigation">
            <div className="hidden md:flex items-center justify-between px-2.5 py-1 text-[9px] font-mono-technical uppercase tracking-widest text-[var(--text-muted)] font-bold">
              <span>WORKSPACES</span>
              <span className="text-[var(--accent-cyan)] text-[8px] font-pixel">[HUD]</span>
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
                  className={`w-full group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-all duration-200 app-no-drag cursor-pointer ${
                    isActive
                      ? "bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] border border-[var(--accent-cyan)] shadow-[0_0_16px_rgba(0,240,255,0.3)]"
                      : "text-[var(--text-secondary)] hover:text-[#f8fafc] hover:bg-[var(--bg-surface-hover)] hover:border-[var(--accent-cyan)] hover:shadow-[0_0_15px_rgba(0,240,255,0.25)] border border-transparent"
                  }`}
                >
                  {/* Active Indicator Bar with Blue Glow */}
                  {isActive && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-[var(--accent-cyan)] shadow-[0_0_10px_var(--accent-cyan)]" />
                  )}

                  <div className={`shrink-0 transition-colors ${isActive ? item.accent : "text-[var(--text-muted)] group-hover:text-[var(--accent-cyan)]"}`}>
                    <Icon size={16} />
                  </div>

                  <span className={`hidden md:inline truncate font-mono-technical font-semibold text-[12px] tracking-wide uppercase ${isActive ? "text-[var(--text-primary)] font-bold" : ""}`}>
                    {item.label}
                  </span>

                  {item.badge && (
                    <span className="hidden md:inline-block ml-auto text-[8px] font-pixel px-1.5 py-0.5 rounded bg-[var(--accent-amber-bg)] text-[var(--accent-amber-text)] border border-[var(--accent-amber-border)]">
                      {item.badge}
                    </span>
                  )}

                  {!item.badge && (
                    <span className={`hidden md:inline ml-auto text-[10px] font-mono-technical ${isActive ? "text-[var(--accent-cyan)] font-bold" : "text-[var(--text-dim)] group-hover:text-[var(--accent-cyan)]"}`}>
                      {item.shortcut}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Telemetry Card */}
        <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-inset)] space-y-1.5 shrink-0">
          <div className="hidden md:flex items-center justify-between text-[11px] font-mono-technical">
            <span className="text-[var(--text-muted)] uppercase tracking-wider text-[10px]">
              POSTURE
            </span>
            <span className="flex items-center gap-1.5 text-[var(--accent-brass)] font-semibold text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-brass)] indicator-pulse" />
              AIRGAPPED
            </span>
          </div>

          <div className="hidden md:flex items-center justify-between text-[10px] font-mono-technical text-[var(--text-secondary)] pt-1 border-t border-[var(--border-subtle)]">
            <span>CORE v{appInfo.version}</span>
            <span className="text-[var(--text-muted)]">{appInfo.isElectron ? "DESKTOP" : "WEB"}</span>
          </div>

          <div className="md:hidden flex justify-center py-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-cyan)] indicator-pulse" title="Hardware Isolated" />
          </div>
        </div>
      </aside>

      {/* RIGHT MAIN CONTROL SURFACE WORKSPACE */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-[var(--bg-app)] relative overflow-hidden">
        {/* TOP STATUS HEADER */}
        <header className="h-14 px-4 sm:px-6 border-b border-[var(--border-subtle)] bg-[var(--bg-header)] backdrop-blur-md flex items-center justify-between shrink-0 z-20 app-drag-region">
          {/* Breadcrumb locator */}
          <div className="flex items-center gap-2.5 min-w-0 app-no-drag">
            <span className="text-[9px] font-pixel text-[var(--accent-cyan)] font-bold">
              {currentNav.shortcut}
            </span>
            <span className="text-[var(--border-strong)]">/</span>
            <span className="text-xs font-mono-technical font-bold text-[var(--text-primary)] tracking-wider uppercase truncate">
              {currentNav.label}
            </span>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2.5 text-xs app-no-drag">
            {/* Minimal Airgap Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--bg-inset)] border border-[var(--border-medium)] text-[10px] font-mono-technical text-[var(--accent-brass)] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-brass)] shadow-[0_0_6px_var(--accent-brass)]" />
              <span>ISOLATED</span>
            </div>

            {/* Live Clock with terminal font */}
            {currentTime && (
              <div className="hidden md:inline px-2.5 py-0.5 rounded-md bg-[var(--bg-inset)] border border-[var(--border-subtle)] text-[13px] font-terminal text-[var(--accent-cyan)] tracking-wider">
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
        <main className="flex-1 p-3.5 sm:p-5 md:p-6 overflow-hidden relative min-h-0 min-w-0">
          <div className="h-full w-full max-w-6xl mx-auto overflow-hidden relative flex flex-col min-h-0">
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
