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
    <div className="h-full flex flex-col gap-5 overflow-y-auto pr-1 pb-4 min-h-0 min-w-0">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--accent-brass)]">
              WORKSPACE // 04
            </span>
            <span className="text-[var(--border-strong)]">/</span>
            <span className="text-[10px] font-mono uppercase text-[var(--text-secondary)]">
              AUDIT LOG
            </span>
          </div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight mt-0.5">
            Operation History
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-[var(--accent-crimson-text)] hover:opacity-90 bg-[var(--accent-crimson-bg)] border border-[var(--accent-crimson-border)] transition-colors"
            >
              <TrashIcon size={12} />
              <span>Clear Log</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Security Notice Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-xl glass-panel border-[var(--border-subtle)]">
        <div className="flex flex-wrap items-center gap-2">
          <Filter size={13} className="text-[var(--accent-brass)]" />
          <span className="text-xs font-mono text-[var(--text-secondary)] uppercase">Filter:</span>
          <div className="flex items-center gap-1 text-xs font-mono">
            {["all", "encode", "decode", "analysis"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className={`px-2.5 py-1 rounded capitalize transition-colors ${
                  filter === cat
                    ? "bg-[var(--accent-brass-bg)] text-[var(--accent-brass-text)] font-bold border border-[var(--accent-brass-border)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-inset)] hover:bg-[var(--bg-surface-hover)]"
                }`}
              >
                {cat === "all" ? "All Logs" : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--text-secondary)]">
          <ShieldIcon size={13} className="text-[var(--accent-jade)]" />
          <span>Local session storage only · No plaintexts or keys persisted</span>
        </div>
      </div>

      {/* History Log List */}
      <div className="space-y-2.5">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center rounded-xl glass-panel border-[var(--border-subtle)] space-y-2 text-[var(--text-muted)] font-mono text-xs">
            <HistoryIcon size={32} className="mx-auto text-[var(--text-dim)] mb-2" />
            <p className="text-[var(--text-primary)] font-medium">No Operations Logged</p>
            <p className="max-w-md mx-auto text-[11px] text-[var(--text-muted)]">
              Cryptographic encoding, decoding, and steganalysis runs will be audited here during your current session.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-3.5 sm:p-4 rounded-xl glass-panel border-[var(--border-subtle)] hover:border-[var(--border-medium)] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                  item.type === "encode"
                    ? "bg-[var(--accent-brass-bg)] border-[var(--accent-brass-border)] text-[var(--accent-brass)]"
                    : item.type === "decode"
                    ? "bg-[var(--accent-jade-bg)] border-[var(--accent-jade-border)] text-[var(--accent-jade)]"
                    : "bg-[var(--bg-surface-elevated)] border-[var(--border-medium)] text-[var(--text-secondary)]"
                }`}>
                  {item.type === "encode" ? (
                    <LockIcon size={15} />
                  ) : item.type === "decode" ? (
                    <UnlockIcon size={15} />
                  ) : (
                    <ActivityIcon size={15} />
                  )}
                </div>

                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[var(--text-primary)] uppercase tracking-wide">
                      {item.type === "encode"
                        ? "Message Concealment"
                        : item.type === "decode"
                        ? "Message Extraction"
                        : "Steganalysis Scan"}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono uppercase font-semibold ${
                      item.status === "success"
                        ? "bg-[var(--accent-jade-bg)] text-[var(--accent-jade-text)] border border-[var(--accent-jade-border)]"
                        : "bg-[var(--accent-crimson-bg)] text-[var(--accent-crimson-text)] border border-[var(--accent-crimson-border)]"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-[var(--text-secondary)] truncate">
                    File: <span className="text-[var(--text-primary)] font-medium truncate">{item.fileName}</span>
                    {item.dimensions?.width ? ` (${item.dimensions.width}×${item.dimensions.height}px)` : ""}
                    {item.payloadBytes > 0 ? ` · ${item.payloadBytes} bytes` : ""}
                    {item.mode ? ` · Mode: ${item.mode}` : ""}
                  </div>
                  {item.note && (
                    <p className="text-[10px] font-mono text-[var(--text-muted)] truncate">{item.note}</p>
                  )}
                </div>
              </div>

              <div className="text-[11px] font-mono text-[var(--text-muted)] shrink-0 sm:text-right">
                {formatTimestamp(item.timestamp)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
