import React, { useState } from "react";
import ImageUploader from "../components/ImageUploader";
import ImagePreview from "../components/ImagePreview";
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
  RefreshIcon
} from "../components/Icons";

export default function Steganalysis() {
  const [image, setImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisReport, setAnalysisReport] = useState(null);
  const [error, setError] = useState("");

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
  };

  const chiSuspected = analysisReport?.chiSquare?.suspectedEmbedding;
  const rsSuspected = analysisReport?.rsAnalysis?.suspectedEmbedding;

  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto pr-1 pb-4 min-h-0 min-w-0">
      {/* Module Header - Clean & Focused */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono-technical uppercase tracking-wider text-[var(--accent-brass)] font-bold">
              WORKSPACE 03
            </span>
            <span className="text-[var(--border-strong)]">/</span>
            <span className="text-[10px] font-mono-technical uppercase text-[var(--text-secondary)]">
              STEGANALYSIS
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-display font-bold text-[var(--text-primary)] tracking-wide uppercase mt-0.5 cyber-text-glow">
            Steganalysis Laboratory
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-[var(--accent-brass-bg)] border border-[var(--accent-brass-border)] text-[10px] font-mono-technical text-[var(--accent-brass-text)] font-semibold uppercase">
            Chi-Square & RS Analysis
          </span>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Image Selection & Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4 min-w-0">
          <div className="glass-panel p-4 border-[var(--border-medium)] relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-display font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                <CrosshairIcon size={14} className="text-[var(--accent-brass)]" />
                Target Image
              </span>
              {image && (
                <button
                  type="button"
                  onClick={() => runSteganalysis(image.filePath)}
                  disabled={isAnalyzing}
                  className="px-2.5 py-1 rounded text-[10px] font-mono-technical uppercase bg-[var(--bg-surface)] hover:bg-[var(--accent-brass-bg)] text-[var(--accent-brass)] border border-[var(--accent-brass-border)] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshIcon size={10} className={isAnalyzing ? "animate-spin" : ""} />
                  <span>Re-Scan</span>
                </button>
              )}
            </div>

            {!image ? (
              <ImageUploader
                onSelect={handleSelectImage}
                label="Select Image for Inspection"
                sublabel="Select any carrier or suspect image to inspect statistical indicators"
              />
            ) : (
              <ImagePreview
                image={image}
                onClear={handleClear}
                onChange={handleSelectImage}
                title="Inspected Subject"
              />
            )}
          </div>

          {/* Steganalysis Brief Guide */}
          <div className="p-4 rounded-xl glass-panel border border-[var(--border-subtle)] space-y-2">
            <h4 className="text-xs font-display font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
              <ShieldIcon size={14} className="text-[var(--accent-brass)]" />
              Methodologies
            </h4>
            <div className="space-y-1.5 text-xs font-hud text-[var(--text-secondary)] leading-relaxed">
              <p>
                <strong className="text-[var(--text-primary)] font-bold">Chi-Square Test:</strong> Detects equalization across adjacent Pair-of-Values (PoVs) caused by sequential LSB replacement.
              </p>
              <p>
                <strong className="text-[var(--text-primary)] font-bold">RS Steganalysis:</strong> Measures asymmetry between regular and singular pixel group variations under dual inversion masks.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Analysis Telemetry & Diagnostic Report (7 cols) */}
        <div className="lg:col-span-7 space-y-4 min-w-0">
          {isAnalyzing && (
            <div className="p-8 rounded-xl glass-panel border border-[var(--accent-brass)] flex flex-col items-center justify-center text-center gap-3">
              <div className="w-10 h-10 cyber-hex bg-[var(--bg-inset)] border border-[var(--accent-brass)] flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-[var(--accent-brass)] border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-display font-bold tracking-wider text-[var(--accent-brass)] uppercase cyber-text-glow">
                  Analyzing Histogram Pairs & Dual Masks...
                </p>
                <p className="text-xs font-mono-technical text-[var(--text-secondary)]">
                  Evaluating 256-bin pixel distributions across color channels.
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

          {!image && !isAnalyzing && (
            <div className="p-12 rounded-xl glass-panel border border-[var(--border-subtle)] text-center space-y-2 text-[var(--text-muted)] font-mono-technical text-xs relative">
              <ActivityIcon size={32} className="mx-auto text-[var(--text-dim)] mb-2" />
              <p className="text-[var(--text-secondary)] font-bold uppercase tracking-wider">Awaiting Subject Image</p>
              <p className="max-w-md mx-auto text-[11px] text-[var(--text-muted)]">
                Select an image on the left to initiate Chi-Square Pair-of-Values distribution analysis and RS variation evaluations.
              </p>
            </div>
          )}

          {analysisReport && !isAnalyzing && (
            <div className="space-y-4">
              {/* Diagnostic Assessment Banner */}
              <div className={`p-4 rounded-xl border ${
                chiSuspected || rsSuspected
                  ? "bg-[var(--accent-amber-bg)] border-[var(--accent-amber)]"
                  : "bg-[var(--accent-brass-bg)] border-[var(--accent-brass)]"
              }`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {chiSuspected || rsSuspected ? (
                      <AlertCircleIcon size={20} className="text-[var(--accent-amber)] shrink-0" />
                    ) : (
                      <CheckCircle2 size={20} className="text-[var(--accent-brass)] shrink-0" />
                    )}
                    <div className="min-w-0">
                      <h4 className="text-xs font-display font-bold text-[var(--text-primary)] uppercase tracking-wider truncate">
                        {chiSuspected || rsSuspected
                          ? "Potential LSB Embedding Detected"
                          : "No Obvious LSB Anomalies Detected"}
                      </h4>
                      <p className="text-[11px] font-hud text-[var(--text-secondary)] mt-0.5 leading-normal">
                        {chiSuspected || rsSuspected
                          ? "Statistical indicators show anomalous Pair-of-Value equalization or RS group asymmetry."
                          : "Histogram pairs and RS group variation fall within normal natural image thresholds."}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded text-[10px] font-display font-bold uppercase shrink-0 ${
                    chiSuspected || rsSuspected
                      ? "bg-[var(--accent-amber-bg)] text-[var(--accent-amber-text)] border border-[var(--accent-amber-border)]"
                      : "bg-[var(--accent-brass-bg)] text-[var(--accent-brass-text)] border border-[var(--accent-brass-border)]"
                  }`}>
                    {chiSuspected || rsSuspected ? "SUSPECT" : "CLEAN"}
                  </span>
                </div>
              </div>

              {/* Chi-Square Test Details */}
              <div className="glass-panel p-4 border-[var(--border-medium)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-display font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                    <BarChartIcon size={14} className="text-[var(--accent-brass)]" />
                    Chi-Square Test (PoV Flattening)
                  </span>
                  <span className="text-[10px] font-mono-technical text-[var(--text-secondary)]">
                    Avg P-Value: <strong className="text-[var(--accent-brass)]">{analysisReport.chiSquare?.averagePValue ?? "0.00"}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {analysisReport.chiSquare?.channels?.map((ch) => (
                    <div key={ch.channel} className="p-3 rounded-lg bg-[var(--bg-inset)] border border-[var(--border-subtle)] space-y-1 min-w-0">
                      <div className="flex items-center justify-between text-[11px] font-mono-technical uppercase">
                        <span className="font-bold text-[var(--text-primary)]">{ch.channel}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${ch.suspected ? "bg-[var(--accent-amber-bg)] text-[var(--accent-amber-text)] border border-[var(--accent-amber-border)]" : "bg-[var(--accent-brass-bg)] text-[var(--accent-brass-text)] border border-[var(--accent-brass-border)]"}`}>
                          {ch.suspected ? "SUSPECT" : "NORMAL"}
                        </span>
                      </div>
                      <div className="text-xs font-mono-technical text-[var(--text-secondary)]">
                        χ²: <span className="text-[var(--text-primary)] font-bold">{ch.chiSquare}</span>
                      </div>
                      <div className="text-[10px] font-mono-technical text-[var(--text-muted)] truncate">
                        P: {ch.pValue} (DoF {ch.degreesOfFreedom})
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RS Analysis Details */}
              <div className="glass-panel p-4 border-[var(--border-medium)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-display font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                    <Layers size={14} className="text-[var(--accent-brass)]" />
                    RS Steganalysis (Dual Mask Variation)
                  </span>
                  <span className="text-[10px] font-mono-technical text-[var(--text-secondary)]">
                    Est. Payload: <strong className="text-[var(--accent-brass)]">
                      {((analysisReport.rsAnalysis?.averageEstimatedPayloadRatio ?? 0) * 100).toFixed(1)}%
                    </strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {analysisReport.rsAnalysis?.channels?.map((ch) => (
                    <div key={ch.channel} className="p-3 rounded-lg bg-[var(--bg-inset)] border border-[var(--border-subtle)] space-y-1 text-xs font-mono-technical min-w-0">
                      <div className="flex items-center justify-between text-[11px] uppercase">
                        <span className="font-bold text-[var(--text-primary)]">{ch.channel}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${ch.suspected ? "bg-[var(--accent-amber-bg)] text-[var(--accent-amber-text)] border border-[var(--accent-amber-border)]" : "bg-[var(--accent-brass-bg)] text-[var(--accent-brass-text)] border border-[var(--accent-brass-border)]"}`}>
                          {ch.suspected ? "ANOMALY" : "BALANCED"}
                        </span>
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)]">
                        Asymmetry: <span className="text-[var(--text-primary)] font-bold">{ch.asymmetry}</span>
                      </div>
                      <div className="text-[10px] font-mono-technical text-[var(--text-muted)] truncate">
                        Rm: {ch.regularM} · Sm: {ch.singularM}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scientific Caveat */}
              <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-hud text-[var(--text-secondary)] leading-relaxed space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[var(--text-primary)]">
                  <AlertCircleIcon size={14} className="text-[var(--accent-brass)]" />
                  <span className="font-display uppercase text-[10px]">Heuristic Evaluation Boundary</span>
                </div>
                <p className="text-[11px]">
                  Statistical steganalysis tools are heuristic evaluations. High-frequency noise or uniform photographic textures can trigger false positives, while key-seeded pseudo-random scattering diffuses bit patterns across the spatial domain.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
