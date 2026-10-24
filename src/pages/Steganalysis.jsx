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
  Terminal,
  RefreshIcon
} from "../components/Icons";

export default function Steganalysis() {
  const [image, setImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisReport, setAnalysisReport] = useState(null);
  const [error, setError] = useState("");

  const handleSelectImage = async () => {
    setError("");
    setAnalysisReport(null);

    try {
      const result = await api.selectImage();
      if (result.canceled) return;

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

        // Record in local history store
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
    <div className="h-full flex flex-col gap-5 overflow-y-auto pr-1">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#c5a059]">
              WORKSPACE // 03
            </span>
            <span className="text-zinc-600">/</span>
            <span className="text-[10px] font-mono uppercase text-zinc-400">
              STATISTICAL INSPECTION
            </span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
            Steganalysis Laboratory
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-[#c5a059]/10 border border-[#c5a059]/25 text-[11px] font-mono text-[#e5be6b] flex items-center gap-1.5">
            <ActivityIcon size={12} />
            <span>Chi-Square PoV & RS Groups</span>
          </span>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Image Selection & Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-4 bg-[#0f1118]/85 border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-semibold uppercase text-zinc-300 flex items-center gap-2">
                <CrosshairIcon size={14} className="text-[#c5a059]" />
                Target Image under Test
              </span>
              {image && (
                <button
                  type="button"
                  onClick={() => runSteganalysis(image.filePath)}
                  disabled={isAnalyzing}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 flex items-center gap-1 transition-colors"
                >
                  <RefreshIcon size={10} className={isAnalyzing ? "animate-spin" : ""} />
                  Re-analyze
                </button>
              )}
            </div>

            {!image ? (
              <ImageUploader
                onSelect={handleSelectImage}
                label="Select Image for Steganalysis"
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

          {/* Steganalysis Educational Overview */}
          <div className="p-4 rounded-xl glass-panel bg-[#0e1017]/80 border-white/10 space-y-3">
            <h4 className="text-xs font-mono font-semibold uppercase text-zinc-300 flex items-center gap-2">
              <ShieldIcon size={14} className="text-[#c5a059]" />
              Steganalysis Methodologies
            </h4>
            <div className="space-y-2 text-xs text-zinc-400 leading-relaxed">
              <p>
                <strong className="text-zinc-200">Chi-Square Test:</strong> Evaluates Pairs of Values (PoVs) (2k, 2k+1) across color channels. Sequential LSB embedding equalizes frequencies of adjacent values, shifting the p-value towards 1.0.
              </p>
              <p>
                <strong className="text-zinc-200">RS Steganalysis:</strong> Evaluates variation increases/decreases across pixel groups under positive/negative inversion masks (+M / -M). Identifies asymmetry caused by LSB embedding.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Analysis Telemetry & Diagnostic Report (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {isAnalyzing && (
            <div className="p-8 rounded-xl glass-panel bg-[#0f1118]/90 border border-[#c5a059]/30 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-[#c5a059] border-t-transparent animate-spin" />
              <div className="space-y-1">
                <p className="text-xs font-mono font-bold tracking-wider text-zinc-200 uppercase">
                  Performing Pixel Distribution & RS Mask Analysis...
                </p>
                <p className="text-xs font-mono text-zinc-400">
                  Constructing 256-bin histograms and testing pixel group variation.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/40 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircleIcon size={16} className="text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!image && !isAnalyzing && (
            <div className="p-12 rounded-xl glass-panel bg-[#0f1118]/60 border-white/5 text-center space-y-2 text-zinc-500 font-mono text-xs">
              <ActivityIcon size={32} className="mx-auto text-zinc-600 mb-2" />
              <p className="text-zinc-400 font-medium">No Image Loaded for Inspection</p>
              <p className="max-w-md mx-auto text-[11px]">
                Select an image on the left to initiate Chi-Square Pair-of-Values distribution analysis and RS variation evaluations.
              </p>
            </div>
          )}

          {analysisReport && !isAnalyzing && (
            <div className="space-y-4">
              {/* Overall Diagnostic Assessment Summary */}
              <div className={`p-4 rounded-xl border ${
                chiSuspected || rsSuspected
                  ? "bg-amber-950/20 border-amber-600/40"
                  : "bg-[#101814]/80 border-[#10b981]/30"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {chiSuspected || rsSuspected ? (
                      <AlertCircleIcon size={18} className="text-amber-400 shrink-0" />
                    ) : (
                      <CheckCircle2 size={18} className="text-[#34d399] shrink-0" />
                    )}
                    <div>
                      <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                        {chiSuspected || rsSuspected
                          ? "Potential LSB Embedding Detected"
                          : "No Obvious LSB Anomalies Detected"}
                      </h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        {chiSuspected || rsSuspected
                          ? "Statistical indicators show anomalous Pair-of-Value equalization or RS group asymmetry."
                          : "Histogram pairs and RS group variation fall within normal natural image thresholds."}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase shrink-0 ${
                    chiSuspected || rsSuspected
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-[#10b981]/20 text-[#34d399] border border-[#10b981]/30"
                  }`}>
                    {chiSuspected || rsSuspected ? "SUSPECT" : "CLEAN"}
                  </span>
                </div>
              </div>

              {/* Chi-Square Test Details */}
              <div className="glass-panel p-4 bg-[#0f1118]/85 border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold uppercase text-zinc-200 flex items-center gap-2">
                    <BarChartIcon size={14} className="text-[#c5a059]" />
                    Chi-Square Test (Pair-of-Values Flattening)
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">
                    Avg P-Value: <strong className="text-zinc-200">{analysisReport.chiSquare?.averagePValue ?? "0.00"}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {analysisReport.chiSquare?.channels?.map((ch) => (
                    <div key={ch.channel} className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono uppercase">
                        <span className="font-bold text-zinc-300">{ch.channel}</span>
                        <span className={`text-[10px] ${ch.suspected ? "text-amber-400" : "text-[#34d399]"}`}>
                          {ch.suspected ? "SUSPECT" : "NORMAL"}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-zinc-400">
                        χ²: <span className="text-zinc-200 font-semibold">{ch.chiSquare}</span>
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500">
                        p: {ch.pValue} (DoF {ch.degreesOfFreedom})
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RS Analysis Details */}
              <div className="glass-panel p-4 bg-[#0f1118]/85 border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold uppercase text-zinc-200 flex items-center gap-2">
                    <Layers size={14} className="text-[#34d399]" />
                    RS Steganalysis (Dual Mask Variation)
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">
                    Est. Payload Ratio: <strong className="text-zinc-200">
                      {((analysisReport.rsAnalysis?.averageEstimatedPayloadRatio ?? 0) * 100).toFixed(1)}%
                    </strong>
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {analysisReport.rsAnalysis?.channels?.map((ch) => (
                    <div key={ch.channel} className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1 text-xs font-mono">
                      <div className="flex items-center justify-between text-[11px] uppercase">
                        <span className="font-bold text-zinc-300">{ch.channel}</span>
                        <span className={`text-[10px] ${ch.suspected ? "text-amber-400" : "text-[#34d399]"}`}>
                          {ch.suspected ? "ANOMALY" : "BALANCED"}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        Asymmetry: <span className="text-zinc-200">{ch.asymmetry}</span>
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        Rm: {ch.regularM} · Sm: {ch.singularM}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scientific Caveat / Limitations Notice */}
              <div className="p-3.5 rounded-xl bg-[#14151e]/80 border border-white/10 text-xs text-zinc-400 leading-relaxed space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-zinc-200">
                  <AlertCircleIcon size={14} className="text-[#c5a059]" />
                  <span>Steganalysis Limitations & False Positives</span>
                </div>
                <p className="text-[11px]">
                  Statistical steganalysis tools are heuristic evaluations, not infallible proofs. Natural images with smooth gradients or uniform noise can trigger false positives, while key-seeded pseudo-random scattering actively disrupts contiguous Pair-of-Value patterns. Never rely on a single analysis score as definitive confirmation.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
