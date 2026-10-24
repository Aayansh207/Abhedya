import React, { useState } from "react";
import Home from "./pages/Home";
import HideMessage from "./pages/HideMessage";
import RevealMessage from "./pages/RevealMessage";
import Settings from "./pages/Settings";
import { ShieldIcon, LockIcon, UnlockIcon, SettingsIcon, HomeIcon } from "./components/Icons";

export default function App() {
  const [activeTab, setActiveTab] = useState("home"); // 'home' | 'hide' | 'reveal' | 'settings'

  return (
    <div className="app-root">
      {/* Top Application Navigation Bar */}
      <header className="app-navbar">
        <div className="navbar-container">
          <div
            className="navbar-brand"
            onClick={() => setActiveTab("home")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" ? setActiveTab("home") : null)}
          >
            <div className="brand-icon-wrapper">
              <ShieldIcon size={20} />
            </div>
            <div className="brand-text">
              <span className="brand-title">ABHEDYA</span>
              <span className="brand-tagline">THE VISHANTI CIPHER</span>
            </div>
            <span className="version-pill">v0.1.0</span>
          </div>

          <nav className="navbar-tabs" aria-label="Main Navigation">
            <button
              type="button"
              className={`nav-tab-btn ${activeTab === "home" ? "active" : ""}`}
              onClick={() => setActiveTab("home")}
            >
              <HomeIcon size={16} />
              <span>Home</span>
            </button>

            <button
              type="button"
              className={`nav-tab-btn ${activeTab === "hide" ? "active" : ""}`}
              onClick={() => setActiveTab("hide")}
            >
              <LockIcon size={16} />
              <span>Hide Message</span>
            </button>

            <button
              type="button"
              className={`nav-tab-btn ${activeTab === "reveal" ? "active" : ""}`}
              onClick={() => setActiveTab("reveal")}
            >
              <UnlockIcon size={16} />
              <span>Reveal Message</span>
            </button>

            <button
              type="button"
              className={`nav-tab-btn ${activeTab === "settings" ? "active" : ""}`}
              onClick={() => setActiveTab("settings")}
            >
              <SettingsIcon size={16} />
              <span>Settings</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="app-main-content">
        {activeTab === "home" && <Home onNavigate={(tab) => setActiveTab(tab)} />}
        {activeTab === "hide" && <HideMessage />}
        {activeTab === "reveal" && <RevealMessage />}
        {activeTab === "settings" && <Settings />}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-container">
          <span className="footer-copy">
            Abhedya © 2026 TechBlitz · Local-First Steganography System
          </span>
          <span className="footer-status">
            <span className="status-dot-green" />
            Zero-Cloud Local Isolation Active
          </span>
        </div>
      </footer>
    </div>
  );
}
