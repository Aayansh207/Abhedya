// core/analysis/rsAnalysis.js
import { decodeImage } from "../image/decode.js";
import { analyzeChiSquarePixels } from "./chiSquare.js";

function flip1(x) {
  return (x & 1) === 0 ? x + 1 : x - 1;
}

function flipMinus1(x) {
  return (x & 1) === 0 ? (x === 0 ? 1 : x - 1) : (x === 255 ? 254 : x + 1);
}

function variation(g) {
  return Math.abs(g[1] - g[0]) + Math.abs(g[2] - g[1]) + Math.abs(g[3] - g[2]);
}

/**
 * Performs RS Steganalysis (Fridrich, Goljan, Du) on pixel channel values.
 *
 * @param {Uint8Array | Buffer} pixelBuffer
 * @param {number} width
 * @param {number} height
 * @param {object} [options]
 * @param {number[]} [options.channels=[0, 1, 2]] - Channels to evaluate
 * @returns {object} RS analysis report
 */
export function analyzeRSPixels(pixelBuffer, width, height, options = {}) {
  const channels = options.channels || [0, 1, 2];
  const channelResults = [];

  const mask = [0, 1, 1, 0];

  for (const ch of channels) {
    const totalPixels = width * height;
    const groupCount = Math.floor(totalPixels / 4);

    let countRm = 0;
    let countSm = 0;
    let countR_m = 0;
    let countS_m = 0;

    for (let i = 0; i < groupCount; i++) {
      const base = i * 4;
      const g = [
        pixelBuffer[(base + 0) * 4 + ch],
        pixelBuffer[(base + 1) * 4 + ch],
        pixelBuffer[(base + 2) * 4 + ch],
        pixelBuffer[(base + 3) * 4 + ch]
      ];

      const v = variation(g);

      // Apply M
      const gm = [
        mask[0] === 1 ? flip1(g[0]) : g[0],
        mask[1] === 1 ? flip1(g[1]) : g[1],
        mask[2] === 1 ? flip1(g[2]) : g[2],
        mask[3] === 1 ? flip1(g[3]) : g[3]
      ];
      const vm = variation(gm);
      if (vm > v) countRm++;
      else if (vm < v) countSm++;

      // Apply -M
      const g_m = [
        mask[0] === 1 ? flipMinus1(g[0]) : g[0],
        mask[1] === 1 ? flipMinus1(g[1]) : g[1],
        mask[2] === 1 ? flipMinus1(g[2]) : g[2],
        mask[3] === 1 ? flipMinus1(g[3]) : g[3]
      ];
      const v_m = variation(g_m);
      if (v_m > v) countR_m++;
      else if (v_m < v) countS_m++;
    }

    const rm = countRm / groupCount;
    const sm = countSm / groupCount;
    const r_m = countR_m / groupCount;
    const s_m = countS_m / groupCount;

    // Discrepancy metric
    const diffR = Math.abs(rm - r_m);
    const diffS = Math.abs(sm - s_m);
    const asymmetry = diffR + diffS;

    // Estimated payload ratio p
    let estimatedRatio = 0;
    const denominator = rm - sm;
    if (Math.abs(denominator) > 0.001) {
      estimatedRatio = Math.max(0, Math.min(1, (r_m - rm + sm - s_m) / (2 * denominator)));
    }

    const suspected = asymmetry > 0.04 || estimatedRatio > 0.15;

    channelResults.push({
      channel: ch === 0 ? "red" : ch === 1 ? "green" : "blue",
      regularM: Number(rm.toFixed(4)),
      singularM: Number(sm.toFixed(4)),
      regularMinusM: Number(r_m.toFixed(4)),
      singularMinusM: Number(s_m.toFixed(4)),
      asymmetry: Number(asymmetry.toFixed(4)),
      estimatedPayloadRatio: Number(estimatedRatio.toFixed(4)),
      suspected
    });
  }

  const suspectedEmbedding = channelResults.some((r) => r.suspected);
  const avgPayloadRatio =
    channelResults.reduce((acc, r) => acc + r.estimatedPayloadRatio, 0) / channelResults.length;

  return {
    test: "RSAnalysis",
    suspectedEmbedding,
    averageEstimatedPayloadRatio: Number(avgPayloadRatio.toFixed(4)),
    channels: channelResults
  };
}

/**
 * High-level RS analysis accepting image input (path or buffer).
 *
 * @param {string | Buffer | Uint8Array} input
 * @param {object} [options]
 * @returns {Promise<object>}
 */
export async function analyzeRS(input, options = {}) {
  const decoded = await decodeImage(input);
  return analyzeRSPixels(decoded.data, decoded.width, decoded.height, options);
}

/**
 * Runs comparative steganalysis evaluating original vs encoded images.
 *
 * @param {object} params
 * @param {string | Buffer} params.originalImage
 * @param {string | Buffer} params.encodedImage
 * @returns {Promise<object>} Comparative steganalysis report
 */
export async function compareSteganalysis({ originalImage, encodedImage }) {
  const origDecoded = await decodeImage(originalImage);
  const encDecoded = await decodeImage(encodedImage);

  const origChi = analyzeChiSquarePixels(origDecoded.data, origDecoded.width, origDecoded.height);
  const encChi = analyzeChiSquarePixels(encDecoded.data, encDecoded.width, encDecoded.height);

  const origRS = analyzeRSPixels(origDecoded.data, origDecoded.width, origDecoded.height);
  const encRS = analyzeRSPixels(encDecoded.data, encDecoded.width, encDecoded.height);

  return {
    dimensions: { width: origDecoded.width, height: origDecoded.height },
    original: {
      chiSquare: origChi,
      rsAnalysis: origRS
    },
    encoded: {
      chiSquare: encChi,
      rsAnalysis: encRS
    }
  };
}
