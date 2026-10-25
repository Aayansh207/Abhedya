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
    <div className="flex flex-col h-screen w-screen bg-[var(--bg-app)] text-[var(--text-primary)] overflow-hidden select-none font-mono-technical relative">
      {/* Background Reticle Grid */}
      <div className="absolute inset-0 tactical-grid-overlay opacity-25 pointer-events-none" />

      {/* TOP STATUS & NAVIGATION HEADER */}
      <header className="h-14 px-4 sm:px-6 border-b border-[var(--border-subtle)] bg-[var(--bg-header)] backdrop-blur-md flex items-center justify-between shrink-0 z-30 app-drag-region">
        {/* Left: Brand Logo & Title */}
        <div
          onClick={() => setActiveTab("home")}
          className="flex items-center gap-2.5 cursor-pointer app-no-drag group hover:opacity-90 transition-opacity shrink-0"
        >
          <AbhedyaLogo size={28} />
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-pixel cyber-pixel-title text-[#ffffff] uppercase select-none">
              ABHEDYA
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b30] indicator-pulse" />
          </div>
        </div>

        {/* Center: Top Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 app-no-drag mx-4 overflow-x-auto" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono-technical uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#1c1c1c] text-[#ff3b30] border border-[#ff3b30] shadow-[0_0_12px_rgba(255,59,48,0.3)] font-bold"
                    : "text-[#d1d5db] hover:text-[#ffffff] hover:bg-[#222222] hover:border-[#ff3b30] border border-transparent"
                }`}
              >
                <Icon size={14} className={isActive ? "text-[#ff3b30]" : "text-[#888888]"} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[8px] font-pixel px-1.5 py-0.5 rounded bg-[#ff3b30]/15 text-[#ff3b30] border border-[#ff3b30]/40">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2.5 text-xs app-no-drag shrink-0">
          {/* Minimal Airgap Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#121212] border border-[#ff3b30]/30 text-[10px] font-mono-technical text-[#ffffff] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b30] shadow-[0_0_6px_#ff3b30]" />
            <span>AIRGAPPED</span>
          </div>

          {/* Live Clock with terminal font */}
          {currentTime && (
            <div className="hidden lg:inline px-2.5 py-0.5 rounded-md bg-[#121212] border border-white/10 text-[13px] font-terminal text-[#ff3b30] tracking-wider">
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

      {/* Mobile Sub-Navigation Bar (for smaller viewports) */}
      <div className="md:hidden flex items-center gap-1 px-3 py-1.5 border-b border-[var(--border-subtle)] bg-[var(--bg-sidebar)] overflow-x-auto shrink-0 z-20">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono-technical uppercase tracking-wide flex items-center gap-1 shrink-0 ${
                isActive
                  ? "bg-[var(--bg-surface-elevated)] text-[var(--accent-cyan)] border border-[var(--accent-cyan)] font-bold"
                  : "text-[var(--text-muted)]"
              }`}
            >
              <Icon size={12} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

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
  );
}
