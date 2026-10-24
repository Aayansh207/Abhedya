import React, { useState, useEffect } from "react";
import { historyStore } from "../services/history";
import {
  HistoryIcon,
  LockIcon,
  UnlockIcon,
  ActivityIcon,
  TrashIcon,
  CheckCircle2,
  AlertCircleIcon,
  ShieldIcon,
  Clock,
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
    <div className="h-full flex flex-col gap-5 overflow-y-auto pr-1">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#c5a059]">
              WORKSPACE // 04
            </span>
            <span className="text-zinc-600">/</span>
            <span className="text-[10px] font-mono uppercase text-zinc-400">
              AUDIT LOG
            </span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
            Operation History
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-rose-400 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
            >
              <TrashIcon size={13} />
              <span>Clear Log</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Security Notice Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-xl glass-panel bg-[#0e1017]/80 border-white/10">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-[#c5a059]" />
          <span className="text-xs font-mono text-zinc-400 uppercase">Filter Operations:</span>
          <div className="flex items-center gap-1 text-xs font-mono">
            {["all", "encode", "decode", "analysis"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className={`px-2.5 py-1 rounded capitalize transition-colors ${
                  filter === cat
                    ? "bg-[#c5a059]/20 text-[#e5be6b] font-bold border border-[#c5a059]/30"
                    : "text-zinc-400 hover:text-zinc-200 bg-black/20"
                }`}
              >
                {cat === "all" ? "All Logs" : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
          <ShieldIcon size={13} className="text-[#10b981]" />
          <span>Local session storage only · No plaintexts or keys persisted</span>
        </div>
      </div>

      {/* History Log List */}
      <div className="space-y-2.5">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center rounded-xl glass-panel bg-[#0f1118]/50 border-white/5 space-y-2 text-zinc-500 font-mono text-xs">
            <HistoryIcon size={32} className="mx-auto text-zinc-600 mb-2" />
            <p className="text-zinc-300 font-medium">No Operations Logged</p>
            <p className="max-w-md mx-auto text-[11px]">
              Cryptographic encoding, decoding, and steganalysis runs will be audited here during your current session.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl glass-panel bg-[#0f1118]/85 border-white/10 hover:border-white/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                  item.type === "encode"
                    ? "bg-[#c5a059]/15 border-[#c5a059]/30 text-[#e5be6b]"
                    : item.type === "decode"
                    ? "bg-[#10b981]/15 border-[#10b981]/30 text-[#34d399]"
                    : "bg-blue-500/15 border-blue-500/30 text-blue-400"
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
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-zinc-200 uppercase tracking-wide">
                      {item.type === "encode"
                        ? "Message Concealment"
                        : item.type === "decode"
                        ? "Message Extraction"
                        : "Steganalysis Scan"}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono uppercase ${
                      item.status === "success"
                        ? "bg-[#10b981]/20 text-[#34d399]"
                        : "bg-rose-500/20 text-rose-300"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-zinc-400 truncate">
                    File: <span className="text-zinc-200 font-medium">{item.fileName}</span>
                    {item.dimensions?.width ? ` (${item.dimensions.width}×${item.dimensions.height}px)` : ""}
                    {item.payloadBytes > 0 ? ` · ${item.payloadBytes} bytes` : ""}
                    {item.mode ? ` · Mode: ${item.mode}` : ""}
                  </div>
                  {item.note && (
                    <p className="text-[10px] font-mono text-zinc-500">{item.note}</p>
                  )}
                </div>
              </div>

              <div className="text-[11px] font-mono text-zinc-500 shrink-0 sm:text-right">
                {formatTimestamp(item.timestamp)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
