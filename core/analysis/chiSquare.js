// core/analysis/chiSquare.js
import { decodeImage } from "../image/decode.js";

/**
 * Computes the complementary error function approximation or regularized incomplete gamma
 * to calculate the p-value from chi-square statistic and degrees of freedom.
 * Uses the Wilson-Hilferty transformation for standard normal approximation.
 *
 * @param {number} chiSquare
 * @param {number} dof - Degrees of freedom
 * @returns {number} p-value in [0, 1]
 */
function chiSquareToPValue(chiSquare, dof) {
  if (dof <= 0 || chiSquare <= 0) return 0;

  // Wilson-Hilferty transformation into a standard normal variable Z
  const s = 2 / (9 * dof);
  const z = (Math.pow(chiSquare / dof, 1 / 3) - (1 - s)) / Math.sqrt(s);

  // Standard normal CDF approximation (Abramowitz and Stegun)
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989422804014327 * Math.exp(-0.5 * z * z);
  const prob =
    d *
    t *
    (0.31938153 +
      t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));

  const cdf = z > 0 ? 1 - prob : prob;
  // In steganalysis: p = 1 - cdf represents the significance of PoV flattening
  return Math.max(0, Math.min(1, 1 - cdf));
}

/**
 * Performs Chi-Square steganalysis on raw pixel channel values.
 *
 * @param {Uint8Array | Buffer} pixelBuffer - Raw RGBA buffer
 * @param {number} width
 * @param {number} height
 * @param {object} [options]
 * @param {number[]} [options.channels=[0, 1, 2]] - Channels to evaluate (0: R, 1: G, 2: B)
 * @returns {object} Chi-square test report
 */
export function analyzeChiSquarePixels(pixelBuffer, width, height, options = {}) {
  const channels = options.channels || [0, 1, 2];
  const channelResults = [];

  for (const ch of channels) {
    // 1. Build histogram of byte values (0-255)
    const hist = new Uint32Array(256);
    const totalPixels = width * height;
    for (let p = 0; p < totalPixels; p++) {
      const val = pixelBuffer[p * 4 + ch];
      hist[val]++;
    }

    // 2. Pair of Values (PoVs): (2k, 2k+1) for k = 0 to 127
    let chiSquare = 0;
    let activePairs = 0;

    for (let k = 0; k < 128; k++) {
      const f2k = hist[2 * k];
      const f2k1 = hist[2 * k + 1];
      const sum = f2k + f2k1;

      if (sum > 0) {
        activePairs++;
        const expected = sum / 2;
        chiSquare += (Math.pow(f2k - expected, 2) + Math.pow(f2k1 - expected, 2)) / expected;
      }
    }

    const dof = Math.max(1, activePairs - 1);
    const pValue = chiSquareToPValue(chiSquare, dof);
    // When p-value is very small (near 0), PoVs are non-random; when close to 1, values are equalized
    const suspected = pValue > 0.85;

    channelResults.push({
      channel: ch === 0 ? "red" : ch === 1 ? "green" : "blue",
      chiSquare: Number(chiSquare.toFixed(4)),
      degreesOfFreedom: dof,
      pValue: Number(pValue.toFixed(4)),
      suspected
    });
  }

  const avgPValue = channelResults.reduce((acc, r) => acc + r.pValue, 0) / channelResults.length;
  const suspectedEmbedding = channelResults.some((r) => r.suspected);

  return {
    test: "ChiSquare",
    suspectedEmbedding,
    averagePValue: Number(avgPValue.toFixed(4)),
    channels: channelResults
  };
}

/**
 * High-level chi-square analysis accepting image input (path or buffer).
 *
 * @param {string | Buffer | Uint8Array} input
 * @param {object} [options]
 * @returns {Promise<object>}
 */
export async function analyzeChiSquare(input, options = {}) {
  const decoded = await decodeImage(input);
  return analyzeChiSquarePixels(decoded.data, decoded.width, decoded.height, options);
}
