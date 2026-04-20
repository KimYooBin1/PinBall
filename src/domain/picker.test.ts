import { describe, expect, it } from "vitest";
import { drawWeightedWinners, drawWinners, normalizeCandidates } from "./picker.js";

describe("normalizeCandidates", () => {
  it("deduplicates users across multiple reactions and excludes bots", () => {
    const normalized = normalizeCandidates([
      { userId: "U1", isBot: false },
      { userId: "U1", isBot: false },
      { userId: "U2", isBot: true },
      { userId: "U3", isBot: false }
    ]);

    expect(normalized).toEqual(["U1", "U3"]);
  });
});

describe("drawWinners", () => {
  it("draws the requested number of unique winners in deterministic order", () => {
    const winners = drawWinners(
      ["U1", "U2", "U3"],
      2,
      () => 0
    );

    expect(winners).toEqual(["U1", "U2"]);
  });

  it("throws when requested winners exceed available candidates", () => {
    expect(() => drawWinners(["U1"], 2, () => 0)).toThrow(
      "Requested 2 winners but only 1 candidates are available."
    );
  });

  it("throws when winner count is less than one", () => {
    expect(() => drawWinners(["U1"], 0, () => 0)).toThrow(
      "Winner count must be at least 1."
    );
  });
});

describe("drawWeightedWinners", () => {
  it("increases winning odds by treating each reaction as one ticket", () => {
    const winners = drawWeightedWinners(
      ["U1", "U1", "U2"],
      1,
      () => 0.5
    );

    expect(winners).toEqual(["U1"]);
  });

  it("draws unique winners by removing all tickets for a selected user", () => {
    const winners = drawWeightedWinners(
      ["U1", "U1", "U2", "U3"],
      2,
      () => 0
    );

    expect(winners).toEqual(["U1", "U2"]);
  });

  it("throws when requested winners exceed unique weighted candidates", () => {
    expect(() => drawWeightedWinners(["U1", "U1"], 2, () => 0)).toThrow(
      "Requested 2 winners but only 1 candidates are available."
    );
  });
});
