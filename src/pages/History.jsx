import React, { useState, useEffect } from "react";
import { historyStore } from "../services/history";
import {
  HistoryIcon,
  LockIcon,
  UnlockIcon,
  ActivityIcon,
  TrashIcon,
  ShieldIcon,
  Filter
} from "../components/Icons";

function formatTimestamp(isoString) {
  try {
    const d = new Date(isoString);
    return d.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  } catch (_e) {
    return isoString;
  }
}

export default function History() {
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState("all"); // 'all' | 'encode' | 'decode' | 'analysis'

  const loadHistory = () => {
    setHistory(historyStore.getHistory());
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear the local operation history log?")) {
      historyStore.clearHistory();
      setHistory([]);
    }
  };

  const filteredItems = history.filter((item) => {
    if (filter === "all") return true;
    return item.type === filter;
  });

  return (
    <div className="h-full flex flex-col gap-4 sm:gap-5 overflow-y-auto pr-1 pb-4 min-h-0 min-w-0">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-medium)] pb-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-display font-bold uppercase tracking-widest text-[var(--accent-brass)]">
              WORKSPACE // 04
            </span>
            <span className="text-[var(--border-strong)]">/</span>
            <span className="text-[10px] font-mono-technical uppercase text-[var(--text-secondary)]">
              AUDIT LOG
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-display font-bold text-[var(--text-primary)] tracking-wider uppercase mt-0.5 cyber-text-glow">
            Operation History
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="cyber-btn-danger px-3 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <TrashIcon size={12} />
              <span>CLEAR LOG</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Security Notice Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 cyber-cut-corner glass-panel border border-[var(--border-strong)] relative">
        <div className="corner-bracket-tl" />
        <div className="corner-bracket-tr" />
        <div className="corner-bracket-bl" />
        <div className="corner-bracket-br" />

        <div className="flex flex-wrap items-center gap-2">
          <Filter size={13} className="text-[var(--accent-brass)]" />
          <span className="text-xs font-mono-technical text-[var(--text-secondary)] uppercase">FILTER:</span>
          <div className="flex items-center gap-1.5 text-xs font-mono-technical">
            {["all", "encode", "decode", "analysis"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className={`px-3 py-1 cyber-cut-corner-sm uppercase font-bold transition-all ${
                  filter === cat
                    ? "bg-[var(--accent-brass-bg)] text-[var(--accent-brass-text)] border border-[var(--accent-brass)] cyber-glow-green-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-inset)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)]"
                }`}
              >
                {cat === "all" ? "ALL LOGS" : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono-technical text-[var(--text-secondary)]">
          <ShieldIcon size={13} className="text-[var(--accent-brass)]" />
          <span>LOCAL SESSION STORAGE ONLY · ZERO PLAINTEXT PERSISTENCE</span>
        </div>
      </div>

      {/* History Log List */}
      <div className="space-y-2.5">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center cyber-cut-corner glass-panel border border-[var(--border-medium)] space-y-2 text-[var(--text-muted)] font-mono-technical text-xs relative">
            <div className="corner-bracket-tl" />
            <div className="corner-bracket-tr" />
            <div className="corner-bracket-bl" />
            <div className="corner-bracket-br" />
            <HistoryIcon size={32} className="mx-auto text-[var(--text-dim)] mb-2" />
            <p className="text-[var(--text-secondary)] font-bold uppercase tracking-wider">NO OPERATIONS RECORDED</p>
            <p className="max-w-md mx-auto text-[11px] text-[var(--text-muted)]">
              Cryptographic encoding, decoding, and steganalysis runs will be audited here during your current session.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-3.5 sm:p-4 cyber-cut-corner glass-panel border border-[var(--border-medium)] hover:border-[var(--accent-brass)] hover:cyber-glow-green-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs relative group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className={`w-9 h-9 cyber-hex flex items-center justify-center shrink-0 border ${
                  item.type === "encode"
                    ? "bg-[var(--accent-brass-bg)] border-[var(--accent-brass)] text-[var(--accent-brass)] shadow-[0_0_8px_var(--accent-brass)]"
                    : item.type === "decode"
                    ? "bg-[var(--accent-brass-bg)] border-[var(--accent-brass)] text-[var(--accent-brass)] shadow-[0_0_8px_var(--accent-brass)]"
                    : "bg-[var(--bg-surface-elevated)] border-[var(--border-strong)] text-[var(--accent-cyan)] shadow-[0_0_8px_var(--accent-cyan)]"
                }`}>
                  {item.type === "encode" ? (
                    <LockIcon size={16} />
                  ) : item.type === "decode" ? (
                    <UnlockIcon size={16} />
                  ) : (
                    <ActivityIcon size={16} />
                  )}
                </div>

                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-bold text-[var(--text-primary)] uppercase tracking-wider text-xs">
                      {item.type === "encode"
                        ? "MESSAGE CONCEALMENT"
                        : item.type === "decode"
                        ? "MESSAGE EXTRACTION"
                        : "STEGANALYSIS SCAN"}
                    </span>
                    <span className={`px-2 py-0.2 cyber-cut-corner-sm text-[9px] font-mono-technical uppercase font-bold ${
                      item.status === "success"
                        ? "bg-[var(--accent-brass-bg)] text-[var(--accent-brass-text)] border border-[var(--accent-brass-border)]"
                        : "bg-[var(--accent-crimson-bg)] text-[var(--accent-crimson-text)] border border-[var(--accent-crimson-border)]"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono-technical text-[var(--text-secondary)] truncate">
                    FILE: <span className="text-[var(--text-primary)] font-bold">{item.fileName}</span>
                    {item.dimensions?.width ? ` (${item.dimensions.width}×${item.dimensions.height}px)` : ""}
                    {item.payloadBytes > 0 ? ` · ${item.payloadBytes} BYTES` : ""}
                    {item.mode ? ` · MODE: ${item.mode.toUpperCase()}` : ""}
                  </div>
                  {item.note && (
                    <p className="text-[10px] font-mono-technical text-[var(--text-muted)] truncate">{item.note}</p>
                  )}
                </div>
              </div>

              <div className="text-[11px] font-mono-technical text-[var(--accent-brass)] shrink-0 sm:text-right font-semibold">
                {formatTimestamp(item.timestamp)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
