// tests/steganalysis.test.js
import { describe, it, expect } from "vitest";
import sharp from "sharp";
import { analyzeChiSquare, analyzeRS, compareSteganalysis, hideMessage } from "../core/index.js";

describe("Steganalysis Evaluation Suite (Chi-Square & RS Analysis)", () => {
  // Generate a smooth gradient test image with natural distribution
  async function generateGradientPng(width = 200, height = 200) {
    const raw = Buffer.alloc(width * height * 4);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        raw[idx + 0] = Math.floor((x / width) * 255);
        raw[idx + 1] = Math.floor((y / height) * 255);
        raw[idx + 2] = Math.floor(((x + y) / (width + height)) * 255);
        raw[idx + 3] = 255;
      }
    }
    return sharp(raw, { raw: { width, height, channels: 4 } })
      .png()
      .toBuffer();
  }

  it("should perform Chi-Square analysis and compute degrees of freedom and p-values", async () => {
    const png = await generateGradientPng(150, 150);
    const report = await analyzeChiSquare(png);

    expect(report.test).toBe("ChiSquare");
    expect(report.channels.length).toBe(3);
    for (const ch of report.channels) {
      expect(ch.degreesOfFreedom).toBeGreaterThan(0);
      expect(typeof ch.pValue).toBe("number");
      expect(ch.pValue).toBeGreaterThanOrEqual(0);
      expect(ch.pValue).toBeLessThanOrEqual(1);
    }
  });

  it("should perform RS analysis and report regular and singular group fractions", async () => {
    const png = await generateGradientPng(150, 150);
    const report = await analyzeRS(png);

    expect(report.test).toBe("RSAnalysis");
    expect(report.channels.length).toBe(3);
    for (const ch of report.channels) {
      expect(ch.regularM).toBeGreaterThanOrEqual(0);
      expect(ch.singularM).toBeGreaterThanOrEqual(0);
      expect(ch.regularMinusM).toBeGreaterThanOrEqual(0);
      expect(ch.singularMinusM).toBeGreaterThanOrEqual(0);
      expect(typeof ch.asymmetry).toBe("number");
    }
  });

  it("should run comparative steganalysis between original and encoded images", async () => {
    const origPng = await generateGradientPng(180, 180);
    const largeMessage = "A".repeat(2000); // embed significant payload

    const { pngBuffer: encPng } = await hideMessage({
      imageBuffer: origPng,
      message: largeMessage,
      password: "SteganalysisPassword123!",
      mode: "basic"
    });

    const comparison = await compareSteganalysis({
      originalImage: origPng,
      encodedImage: encPng
    });

    expect(comparison.original.chiSquare.test).toBe("ChiSquare");
    expect(comparison.encoded.chiSquare.test).toBe("ChiSquare");
    expect(comparison.original.rsAnalysis.test).toBe("RSAnalysis");
    expect(comparison.encoded.rsAnalysis.test).toBe("RSAnalysis");
  });
});
