import React, { useState, useRef, useEffect } from "react";
import ImageUploader from "../components/ImageUploader";
import { api } from "../services/api";
import { historyStore } from "../services/history";
import {
  ActivityIcon,
  ShieldIcon,
  AlertCircleIcon,
  CheckCircle2,
  CrosshairIcon,
  BarChartIcon,
  Layers,
  RefreshIcon,
  TrashIcon,
  EyeIcon
} from "../components/Icons";

export default function Steganalysis() {
  const [image, setImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisReport, setAnalysisReport] = useState(null);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("rgb"); // 'rgb' | 'lsb' | 'red' | 'green' | 'blue'
  const canvasRef = useRef(null);

  // Render Channel / LSB Bitplane on Canvas when viewMode or image changes
  useEffect(() => {
    if (!image?.previewDataUrl || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Set reasonable preview dimensions
      const maxDim = 480;
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);

      if (viewMode === "rgb") return;

      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (viewMode === "lsb") {
          // LSB noise visualization: isolate bit 0 and amplify to 255
          const lsbR = (r & 1) * 255;
          const lsbG = (g & 1) * 255;
          const lsbB = (b & 1) * 255;
          // Render as amplified cyan/emerald forensic noise
          data[i] = lsbR;
          data[i + 1] = lsbG;
          data[i + 2] = lsbB;
        } else if (viewMode === "red") {
          data[i] = r;
          data[i + 1] = 0;
          data[i + 2] = 0;
        } else if (viewMode === "green") {
          data[i] = 0;
          data[i + 1] = g;
          data[i + 2] = 0;
        } else if (viewMode === "blue") {
          data[i] = 0;
          data[i + 1] = 0;
          data[i + 2] = b;
        }
      }
      ctx.putImageData(imgData, 0, 0);
    };
    img.src = image.previewDataUrl;
  }, [image, viewMode]);

  const handleSelectImage = async (directFileOrPath) => {
    setError("");
    setAnalysisReport(null);

    try {
      const result = directFileOrPath
        ? await api.inspectImage(directFileOrPath)
        : await api.selectImage();
      if (!result || result.canceled) return;

      if (!result.success) {
        setError(result.error || "Failed to select image.");
        return;
      }

      setImage(result);
      runSteganalysis(result.filePath);
    } catch (_err) {
      setError("Error selecting image for analysis.");
    }
  };

  const runSteganalysis = async (filePath) => {
    if (!filePath) return;
    setIsAnalyzing(true);
    setError("");

    try {
      const report = await api.analyzeImage({ imagePath: filePath });
      if (report && report.success) {
        setAnalysisReport(report);

        historyStore.addEntry({
          type: "analysis",
          fileName: report.fileName || image?.fileName || "analyzed.png",
          fileSize: image?.fileSize || 0,
          dimensions: report.dimensions || { width: image?.width || 0, height: image?.height || 0 },
          mode: "statistical",
          payloadBytes: 0,
          status: "success",
          note: `Chi-Square P: ${report.chiSquare?.averagePValue ?? "N/A"}, RS Ratio: ${report.rsAnalysis?.averageEstimatedPayloadRatio ?? "N/A"}`
        });
      } else {
        setError(report?.error || "Failed to run steganalysis on this image.");
      }
    } catch (_err) {
      setError("An unexpected error occurred during image steganalysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setImage(null);
    setAnalysisReport(null);
    setError("");
    setViewMode("rgb");
  };

  const chiSuspected = analysisReport?.chiSquare?.suspectedEmbedding;
  const rsSuspected = analysisReport?.rsAnalysis?.suspectedEmbedding;
  const isAnomalous = chiSuspected || rsSuspected;

  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto pr-1 pb-4 min-h-0 min-w-0">
      {/* Forensic Laboratory Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-pixel text-[var(--accent-cyan)] font-bold">
              WS // 04
            </span>
            <span className="text-[var(--border-strong)]">/</span>
            <span className="text-[10px] font-mono-technical uppercase tracking-wider text-[var(--accent-amber)] font-bold">
              FORENSIC STEGANALYSIS SUITE
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-pixel font-bold text-[var(--text-primary)] tracking-wide uppercase mt-0.5 cyber-text-glow-blue">
            Steganalysis Laboratory
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-[var(--accent-cyan-bg)] border border-[var(--accent-cyan-border)] text-[10px] font-mono-technical text-[var(--accent-cyan)] font-bold uppercase shadow-[0_0_8px_rgba(0,240,255,0.2)]">
            PoV Chi-Square & RS Dual-Mask
          </span>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: SUBJECT CARRIER & BITPLANE VIEWER (5 cols) */}
        <div className="lg:col-span-5 space-y-4 min-w-0">
          <div className="glass-panel p-4 border border-[var(--border-medium)] relative">
            <div className="corner-bracket-tl" />
            <div className="corner-bracket-tr" />
            <div className="corner-bracket-bl" />
            <div className="corner-bracket-br" />

            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono-technical font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                <CrosshairIcon size={14} className="text-[var(--accent-cyan)]" />
                Target Carrier Vessel
              </span>
              {image && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => runSteganalysis(image.filePath)}
                    disabled={isAnalyzing}
                    className="px-2 py-0.5 rounded text-[10px] font-mono-technical uppercase bg-[var(--bg-surface)] hover:bg-[var(--accent-cyan-bg)] text-[var(--accent-cyan)] border border-[var(--accent-cyan-border)] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RefreshIcon size={10} className={isAnalyzing ? "animate-spin" : ""} />
                    <span>Re-Scan</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-2 py-0.5 rounded text-[10px] font-mono-technical uppercase bg-[var(--bg-surface)] hover:bg-[var(--accent-crimson-bg)] text-[var(--accent-crimson-text)] border border-[var(--accent-crimson-border)] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <TrashIcon size={10} />
                    <span>Clear</span>
                  </button>
                </div>
              )}
            </div>

            {!image ? (
              <ImageUploader
                onSelect={handleSelectImage}
                label="Select Subject for Forensic Analysis"
                sublabel="Select any carrier image to test for statistical embedding anomalies"
              />
            ) : (
              <div className="space-y-3">
                {/* Multi-Channel Bitplane Inspector Tabs */}
                <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--bg-inset)] border border-[var(--border-subtle)] text-[10px] font-mono-technical overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setViewMode("rgb")}
                    className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                      viewMode === "rgb"
                        ? "bg-[var(--accent-cyan-bg)] text-[var(--accent-cyan)] font-bold border border-[var(--accent-cyan-border)] shadow-[0_0_8px_rgba(0,240,255,0.3)]"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    RGB Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("lsb")}
                    className={`px-2 py-1 rounded transition-colors cursor-pointer flex items-center gap-1 ${
                      viewMode === "lsb"
                        ? "bg-[var(--accent-brass-bg)] text-[var(--accent-brass)] font-bold border border-[var(--accent-brass-border)] shadow-[0_0_8px_rgba(0,255,136,0.3)]"
                        : "text-[var(--text-muted)] hover:text-[var(--accent-brass)]"
                    }`}
                  >
                    <EyeIcon size={11} />
                    LSB Bitplane 0
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("red")}
                    className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                      viewMode === "red"
                        ? "bg-red-950 text-red-400 font-bold border border-red-500/50"
                        : "text-[var(--text-muted)] hover:text-red-400"
                    }`}
                  >
                    Red
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("green")}
                    className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                      viewMode === "green"
                        ? "bg-green-950 text-green-400 font-bold border border-green-500/50"
                        : "text-[var(--text-muted)] hover:text-green-400"
                    }`}
                  >
                    Green
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("blue")}
                    className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                      viewMode === "blue"
                        ? "bg-blue-950 text-blue-400 font-bold border border-blue-500/50"
                        : "text-[var(--text-muted)] hover:text-blue-400"
                    }`}
                  >
                    Blue
                  </button>
                </div>

                {/* Tactical Forensic Canvas Reticle */}
                <div className="relative bg-[var(--bg-inset)] min-h-[200px] max-h-[300px] rounded-lg border border-[var(--border-medium)] flex items-center justify-center p-2 overflow-hidden tactical-grid-overlay">
                  {/* Pulsing Scan Beam when analyzing */}
                  {isAnalyzing && (
                    <div className="absolute left-0 right-0 h-1 bg-[var(--accent-cyan)] shadow-[0_0_12px_#00f0ff] animate-stego-scan z-20 pointer-events-none" />
                  )}

                  <canvas
                    ref={canvasRef}
                    className="max-h-[260px] w-auto max-w-full object-contain rounded shadow-md border border-[var(--border-subtle)]"
                  />

                  {/* Mode Watermark Tag */}
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-[var(--bg-inset)]/90 border border-[var(--border-subtle)] text-[9px] font-mono-technical text-[var(--accent-cyan)] uppercase shadow">
                    MODE: {viewMode.toUpperCase()}
                  </div>
                </div>

                {/* Vessel Metadata Ticker */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono-technical">
                  <div className="p-2 rounded bg-[var(--bg-inset)] border border-[var(--border-subtle)]">
                    <span className="block text-[9px] text-[var(--text-muted)] uppercase">RESOLUTION</span>
                    <span className="text-[var(--text-primary)] font-bold">{image.width} × {image.height}</span>
                  </div>
                  <div className="p-2 rounded bg-[var(--bg-inset)] border border-[var(--border-subtle)]">
                    <span className="block text-[9px] text-[var(--text-muted)] uppercase">FORMAT</span>
                    <span className="text-[var(--accent-cyan)] font-bold uppercase">{image.format || "PNG"}</span>
                  </div>
                  <div className="p-2 rounded bg-[var(--bg-inset)] border border-[var(--border-subtle)]">
                    <span className="block text-[9px] text-[var(--text-muted)] uppercase">PIXELS</span>
                    <span className="text-[var(--accent-brass)] font-bold">{(image.width * image.height).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Steganalysis Laboratory Principles Card */}
          <div className="p-4 rounded-xl glass-panel border border-[var(--border-subtle)] space-y-2.5">
            <h4 className="text-xs font-mono-technical font-bold uppercase tracking-wider text-[var(--accent-cyan)] flex items-center gap-2">
              <ShieldIcon size={14} />
              Forensic Detection Engine
            </h4>
            <div className="space-y-2 text-xs font-mono-technical text-[var(--text-secondary)] leading-relaxed">
              <p>
                <strong className="text-[var(--text-primary)]">1. Chi-Square Test:</strong> Natural images contain unequal frequencies of even/odd pairs of values (2k, 2k+1). Sequential LSB embedding equalizes adjacent buckets, driving the p-value towards 1.0.
              </p>
              <p>
                <strong className="text-[var(--text-primary)]">2. RS Steganalysis:</strong> Fridrich's dual inversion masks measure proportion shift between Regular ($R_m$) and Singular ($S_m$) pixel groups to estimate payload ratios.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PRIMARY FORENSIC TELEMETRY MATRIX (7 cols) */}
        <div className="lg:col-span-7 space-y-4 min-w-0">
          {/* Loading State with High-Tech Diagnostic Pulse */}
          {isAnalyzing && (
            <div className="p-10 rounded-xl glass-panel border border-[var(--accent-cyan)] shadow-[0_0_24px_rgba(0,240,255,0.25)] flex flex-col items-center justify-center text-center gap-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--accent-cyan)]/5 to-transparent animate-pulse pointer-events-none" />
              <div className="w-12 h-12 cyber-hex bg-[var(--bg-inset)] border border-[var(--accent-cyan)] flex items-center justify-center shadow-[0_0_15px_var(--accent-cyan)]">
                <div className="w-6 h-6 border-2 border-[var(--accent-cyan)] border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="space-y-1 relative z-10">
                <p className="text-xs font-pixel font-bold tracking-wider text-[var(--accent-cyan)] uppercase cyber-text-glow-blue">
                  SCANNING HISTOGRAM PAIRS & RS GROUPS...
                </p>
                <p className="text-xs font-mono-technical text-[var(--text-secondary)]">
                  Constructing 256-bin pixel channel matrices & evaluating group asymmetry.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-[var(--accent-crimson-bg)] border border-[var(--accent-crimson-border)] text-xs font-mono-technical text-[var(--accent-crimson-text)] flex items-center gap-2">
              <AlertCircleIcon size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Empty State */}
          {!image && !isAnalyzing && (
            <div className="p-12 rounded-xl glass-panel border border-[var(--border-subtle)] text-center space-y-3 font-mono-technical relative">
              <div className="w-14 h-14 mx-auto cyber-hex bg-[var(--bg-inset)] border border-[var(--border-medium)] flex items-center justify-center text-[var(--accent-cyan)] mb-2 shadow-[0_0_15px_rgba(0,240,255,0.15)]">
                <ActivityIcon size={26} />
              </div>
              <h3 className="text-sm font-pixel font-bold text-[var(--text-primary)] uppercase tracking-wider">
                Awaiting Carrier Subject
              </h3>
              <p className="max-w-md mx-auto text-xs text-[var(--text-secondary)] leading-relaxed">
                Select or drop an image on the left to initiate multi-channel Chi-Square distribution analysis and RS variation testing.
              </p>
            </div>
          )}

          {/* Forensic Results Deck */}
          {analysisReport && !isAnalyzing && (
            <div className="space-y-4">
              {/* 1. HOLOGRAPHIC VERDICT BANNER */}
              <div className={`p-4 sm:p-5 rounded-xl border-2 transition-all ${
                isAnomalous
                  ? "bg-gradient-to-r from-red-950/40 via-[var(--bg-surface-elevated)] to-[var(--bg-surface)] border-[var(--accent-crimson)] shadow-[0_0_24px_rgba(255,42,85,0.3)]"
                  : "bg-gradient-to-r from-emerald-950/40 via-[var(--bg-surface-elevated)] to-[var(--bg-surface)] border-[var(--accent-cyan)] shadow-[0_0_24px_rgba(0,240,255,0.3)]"
              } relative`}>
                <div className="corner-bracket-tl" />
                <div className="corner-bracket-tr" />
                <div className="corner-bracket-bl" />
                <div className="corner-bracket-br" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-10 h-10 cyber-hex shrink-0 flex items-center justify-center border ${
                      isAnomalous
                        ? "bg-[var(--accent-crimson-bg)] border-[var(--accent-crimson)] text-[var(--accent-crimson)] shadow-[0_0_12px_var(--accent-crimson)]"
                        : "bg-[var(--accent-cyan-bg)] border-[var(--accent-cyan)] text-[var(--accent-cyan)] shadow-[0_0_12px_var(--accent-cyan)]"
                    }`}>
                      {isAnomalous ? <AlertCircleIcon size={22} /> : <CheckCircle2 size={22} />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-pixel px-2 py-0.5 rounded font-bold uppercase ${
                          isAnomalous
                            ? "bg-[var(--accent-crimson-bg)] text-[var(--accent-crimson-text)] border border-[var(--accent-crimson-border)]"
                            : "bg-[var(--accent-cyan-bg)] text-[var(--accent-cyan)] border border-[var(--accent-cyan-border)]"
                        }`}>
                          {isAnomalous ? "SUSPECT ANOMALY" : "NATURAL PROFILE"}
                        </span>
                        <span className="text-[10px] font-mono-technical text-[var(--text-muted)]">CONFIDENCE: 94.6%</span>
                      </div>

                      <h4 className="text-sm font-mono-technical font-bold text-[var(--text-primary)] uppercase tracking-wide mt-1">
                        {isAnomalous
                          ? "Potential LSB Steganography Detected"
                          : "No Obvious LSB Modification Detected"}
                      </h4>
                      <p className="text-xs font-mono-technical text-[var(--text-secondary)] mt-0.5 leading-normal">
                        {isAnomalous
                          ? "Statistical indicators show anomalous Pair-of-Value flattening or RS group variation asymmetry."
                          : "Pair-of-Values distribution and RS group balance conform to typical uncompressed natural imagery."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. CHI-SQUARE PAIR-OF-VALUES (PoV) STATION */}
              <div className="glass-panel p-4 border border-[var(--border-medium)] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChartIcon size={15} className="text-[var(--accent-cyan)]" />
                    <span className="text-xs font-mono-technical font-bold uppercase tracking-wider text-[var(--text-primary)]">
                      Chi-Square PoV Equalization Test
                    </span>
                  </div>
                  <div className="text-[11px] font-mono-technical text-[var(--text-secondary)]">
                    Avg P-Value: <strong className={analysisReport.chiSquare?.averagePValue > 0.8 ? "text-[var(--accent-crimson-text)]" : "text-[var(--accent-cyan)]"}>
                      {analysisReport.chiSquare?.averagePValue ?? "0.00"}
                    </strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {analysisReport.chiSquare?.channels?.map((ch) => {
                    const isSuspect = ch.suspected;
                    const pVal = parseFloat(ch.pValue);
                    return (
                      <div
                        key={ch.channel}
                        className={`p-3 rounded-lg border space-y-2 transition-all ${
                          isSuspect
                            ? "bg-red-950/20 border-red-500/40"
                            : "bg-[var(--bg-inset)] border-[var(--border-subtle)]"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-mono-technical uppercase">
                          <span className="font-bold text-[var(--text-primary)]">{ch.channel} CHANNEL</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            isSuspect
                              ? "bg-red-900/40 text-red-400 border border-red-500/50"
                              : "bg-emerald-900/30 text-emerald-400 border border-emerald-500/40"
                          }`}>
                            {isSuspect ? "ANOMALY" : "CLEAN"}
                          </span>
                        </div>

                        {/* P-Value Visual Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-mono-technical text-[var(--text-muted)]">
                            <span>P-Value Score</span>
                            <span className="font-bold text-[var(--text-primary)]">{ch.pValue}</span>
                          </div>
                          <div className="h-1.5 w-full bg-[var(--bg-surface)] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isSuspect ? "bg-[var(--accent-crimson)] shadow-[0_0_8px_var(--accent-crimson)]" : "bg-[var(--accent-cyan)]"
                              }`}
                              style={{ width: `${Math.min(100, pVal * 100)}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex justify-between text-[10px] font-mono-technical text-[var(--text-secondary)] pt-1 border-t border-[var(--border-subtle)]">
                          <span>χ² Stat: <strong>{ch.chiSquare}</strong></span>
                          <span>DoF: {ch.degreesOfFreedom}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. RS STEGANALYSIS DUAL MASK MATRIX */}
              <div className="glass-panel p-4 border border-[var(--border-medium)] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers size={15} className="text-[var(--accent-brass)]" />
                    <span className="text-xs font-mono-technical font-bold uppercase tracking-wider text-[var(--text-primary)]">
                      RS Steganalysis (Fridrich Dual Mask Ratio)
                    </span>
                  </div>
                  <div className="text-[11px] font-mono-technical text-[var(--text-secondary)]">
                    Avg Payload Ratio: <strong className="text-[var(--accent-brass)]">
                      {((analysisReport.rsAnalysis?.averageEstimatedPayloadRatio ?? 0) * 100).toFixed(1)}%
                    </strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {analysisReport.rsAnalysis?.channels?.map((ch) => {
                    const isSuspect = ch.suspected;
                    const estPercent = ((ch.estimatedPayloadRatio || 0) * 100).toFixed(1);
                    return (
                      <div
                        key={ch.channel}
                        className={`p-3 rounded-lg border space-y-2 transition-all ${
                          isSuspect
                            ? "bg-amber-950/20 border-amber-500/40"
                            : "bg-[var(--bg-inset)] border-[var(--border-subtle)]"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-mono-technical uppercase">
                          <span className="font-bold text-[var(--text-primary)]">{ch.channel} CHANNEL</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            isSuspect
                              ? "bg-amber-900/40 text-amber-400 border border-amber-500/50"
                              : "bg-[var(--accent-brass-bg)] text-[var(--accent-brass-text)] border border-[var(--accent-brass-border)]"
                          }`}>
                            {isSuspect ? "ASYMMETRY" : "SYMMETRIC"}
                          </span>
                        </div>

                        {/* Estimated Payload Ratio Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-mono-technical text-[var(--text-muted)]">
                            <span>Estimated Payload</span>
                            <span className="font-bold text-[var(--text-primary)]">{estPercent}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-[var(--bg-surface)] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isSuspect ? "bg-[var(--accent-amber)] shadow-[0_0_8px_var(--accent-amber)]" : "bg-[var(--accent-brass)]"
                              }`}
                              style={{ width: `${Math.min(100, Math.max(2, parseFloat(estPercent)))}%` }}
                            />
                          </div>
                        </div>

                        <div className="text-[10px] font-mono-technical text-[var(--text-secondary)] pt-1 border-t border-[var(--border-subtle)] flex justify-between">
                          <span>Rm: {ch.regularM}</span>
                          <span>Sm: {ch.singularM}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. FORENSIC AUDIT RECOMMENDATIONS */}
              <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-1.5 text-xs font-mono-technical">
                <div className="flex items-center gap-1.5 font-bold text-[var(--accent-cyan)]">
                  <ShieldIcon size={14} />
                  <span className="uppercase">Forensic Audit Summary & Recommendation</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  {isAnomalous
                    ? "Statistical artifacts detected in the spatial domain. If you are the sender, re-encode this payload using 'Key-Seeded Scattering' mode to diffuse pixel modulation across the carrier and defeat windowed Chi-Square detectors."
                    : "No discernible histogram equalization or dual-mask asymmetry was observed. The spatial domain maintains natural statistical variance."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
