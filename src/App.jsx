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
    { id: "home", label: "Overview", icon: HmIcon, shortcut: "01" },
    { id: "hide", label: "Hide Message", icon: Lock, shortcut: "02" },
    { id: "reveal", label: "Extract Message", icon: Unlock, shortcut: "03" },
    { id: "stego", label: "Steganalysis", icon: Activity, shortcut: "04" },
    { id: "history", label: "Audit History", icon: HistIcon, shortcut: "05" },
    { id: "tech", label: "Security & Specs", icon: ShieldCheck, shortcut: "06" }
  ];

  const currentNav = navItems.find((n) => n.id === activeTab) || navItems[0];

  return (
    <div className="flex h-screen w-screen bg-[var(--bg-app)] text-[var(--text-primary)] overflow-hidden select-none font-hud relative">
      {/* Background Reticle Grid */}
      <div className="absolute inset-0 tactical-grid-overlay opacity-30 pointer-events-none" />

      {/* PERSISTENT TACTICAL CYBER NAVIGATION RAIL */}
      <aside className="w-16 md:w-60 bg-[var(--bg-sidebar)] border-r border-[var(--border-subtle)] flex flex-col justify-between shrink-0 z-30 transition-all duration-200 overflow-hidden relative">
        <div className="flex flex-col min-h-0 flex-1 overflow-hidden">
          {/* Brand Header */}
          <div
            onClick={() => setActiveTab("home")}
            className="h-14 px-3.5 flex items-center gap-3 border-b border-[var(--border-subtle)] cursor-pointer hover:bg-[var(--bg-surface-hover)] transition-colors app-no-drag shrink-0 group"
          >
            {/* Hexagonal Cyber Brand Glyph */}
            <div className="relative w-8 h-8 shrink-0 flex items-center justify-center">
              <div className="absolute inset-0 cyber-hex bg-[var(--accent-brass)]/20 group-hover:bg-[var(--accent-brass)]/30 transition-colors" />
              <div className="absolute inset-[2px] cyber-hex bg-[var(--bg-surface-elevated)] border border-[var(--accent-brass)] flex items-center justify-center text-[var(--accent-brass)]">
                <ShieldIcon size={16} />
              </div>
            </div>

            <div className="hidden md:flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-display font-bold tracking-widest text-[var(--text-primary)] uppercase truncate cyber-text-glow">
                  ABHEDYA
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-brass)] indicator-pulse" />
              </div>
              <span className="text-[9px] font-mono-technical tracking-wider text-[var(--accent-brass)] uppercase truncate opacity-80">
                VISHANTI CIPHER
              </span>
            </div>
          </div>

          {/* Navigation Item Stack */}
          <nav className="p-2 md:p-2.5 space-y-1 overflow-y-auto flex-1" aria-label="Main Navigation">
            <div className="hidden md:block px-2.5 py-1 text-[9px] font-mono-technical uppercase tracking-widest text-[var(--text-muted)] font-semibold">
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
                  className={`w-full group relative flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs transition-all duration-150 app-no-drag ${
                    isActive
                      ? "bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] border border-[var(--accent-brass)] shadow-[0_0_12px_rgba(0,255,136,0.15)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] border border-transparent"
                  }`}
                >
                  {/* Active Indicator Bar */}
                  {isActive && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-[var(--accent-brass)] shadow-[0_0_8px_var(--accent-brass)]" />
                  )}

                  <div className={`shrink-0 transition-colors ${isActive ? "text-[var(--accent-brass)]" : "text-[var(--text-muted)] group-hover:text-[var(--accent-brass)]"}`}>
                    <Icon size={16} />
                  </div>

                  <span className={`hidden md:inline truncate font-hud font-semibold text-[11px] tracking-wide uppercase ${isActive ? "text-[var(--text-primary)]" : ""}`}>
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
        <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-inset)] space-y-1.5 shrink-0">
          <div className="hidden md:flex items-center justify-between text-[10px] font-mono-technical">
            <span className="text-[var(--text-muted)] uppercase tracking-wider">
              POSTURE
            </span>
            <span className="flex items-center gap-1.5 text-[var(--accent-brass)] font-semibold text-[10px] cyber-text-glow">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-brass)] indicator-pulse" />
              AIRGAPPED
            </span>
          </div>

          <div className="hidden md:flex items-center justify-between text-[9px] font-mono-technical text-[var(--text-secondary)] pt-1 border-t border-[var(--border-subtle)]">
            <span>CORE v{appInfo.version}</span>
            <span className="text-[var(--text-muted)]">{appInfo.isElectron ? "DESKTOP" : "WEB"}</span>
          </div>

          {/* Narrow Viewport Indicator Dot */}
          <div className="md:hidden flex justify-center py-1">
            <span className="w-2 h-2 rounded-full bg-[var(--accent-brass)] indicator-pulse" title="Hardware Isolated" />
          </div>
        </div>
      </aside>

      {/* RIGHT MAIN CONTROL SURFACE WORKSPACE */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-[var(--bg-app)] relative overflow-hidden">
        {/* TOP STATUS HEADER */}
        <header className="h-14 px-4 sm:px-6 border-b border-[var(--border-subtle)] bg-[var(--bg-header)] backdrop-blur-md flex items-center justify-between shrink-0 z-20 app-drag-region">
          {/* Breadcrumb locator */}
          <div className="flex items-center gap-2.5 min-w-0 app-no-drag">
            <span className="text-[10px] font-mono-technical text-[var(--accent-brass)] uppercase tracking-wider font-bold">
              {currentNav.shortcut}
            </span>
            <span className="text-[var(--border-strong)]">/</span>
            <span className="text-xs font-display font-bold text-[var(--text-primary)] tracking-wider uppercase truncate cyber-text-glow">
              {currentNav.label}
            </span>
          </div>

          {/* Right Header Controls: Clean & Uncluttered */}
          <div className="flex items-center gap-2.5 text-xs app-no-drag">
            {/* Minimal Airgap Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--bg-inset)] border border-[var(--border-subtle)] text-[10px] font-mono-technical text-[var(--accent-brass)] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-brass)]" />
              <span>AIRGAPPED</span>
            </div>

            {/* Live Clock */}
            {currentTime && (
              <div className="hidden md:inline px-2.5 py-1 rounded-md bg-[var(--bg-inset)] border border-[var(--border-subtle)] text-[11px] font-mono-technical text-[var(--text-secondary)]">
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

        {/* WORKSPACE VIEWPORT (Clean, Spacious, No double-boxed cramping) */}
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
