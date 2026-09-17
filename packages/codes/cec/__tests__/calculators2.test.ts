import { describe, it, expect } from "vitest";
import { codeContext } from "../../../registry";
import { motorFlaCalc } from "../calculators/motor";
import { transformerSizingCalc } from "../calculators/transformer";
import { powerFactorCalc, threePhaseCalc, faultCurrentCalc } from "../calculators/power";
import { batterySizeCalc } from "../calculators/battery";

const ctx = codeContext("CEC");
const primary = (r: { summary: { primary?: boolean; value: string }[] }) => r.summary.find((s) => s.primary)?.value;
const numPrimary = (r: { summary: { primary?: boolean; value: string }[] }) => parseFloat(primary(r)!);

describe("motor FLA", () => {
  it("10 hp, 480 V, 3ph ≈ 11.7 A", () => {
    const a = numPrimary(motorFlaCalc.compute({ phase: "3ph", powerUnit: "hp", power: 10, voltage: 480, efficiency: 0.9, pf: 0.85 }, ctx));
    expect(a).toBeGreaterThan(11);
    expect(a).toBeLessThan(12.5);
  });
});

describe("transformer sizing", () => {
  it("100 kVA load + 25% growth → 150 kVA standard", () => {
    expect(primary(transformerSizingCalc.compute({ phase: "3ph", loadKva: 100, growth: 25, primaryV: 600, secondaryV: 208 }, ctx))).toBe("150");
  });
});

describe("power factor correction", () => {
  it("100 kW, 0.75 → 0.95 ≈ 55 kVAR", () => {
    const kvar = numPrimary(powerFactorCalc.compute({ kw: 100, pf1: 0.75, pf2: 0.95 }, ctx));
    expect(kvar).toBeGreaterThan(54);
    expect(kvar).toBeLessThan(57);
  });
});

describe("three-phase power", () => {
  it("480 V, 50 A ≈ 41.6 kVA", () => {
    const kva = numPrimary(threePhaseCalc.compute({ voltage: 480, current: 50, pf: 0.9 }, ctx));
    expect(kva).toBeCloseTo(41.6, 0);
  });
});

describe("fault current", () => {
  it("500 kVA, 208 V, 5% Z ≈ 27.8 kA", () => {
    const ka = numPrimary(faultCurrentCalc.compute({ phase: "3ph", kva: 500, voltage: 208, impedance: 5, motor: false }, ctx));
    expect(ka).toBeGreaterThan(27);
    expect(ka).toBeLessThan(28.5);
  });
});

describe("battery sizing", () => {
  it("500 W, 8 h, 48 V, 80% DoD, 90% eff ≈ 116 Ah", () => {
    const ah = numPrimary(batterySizeCalc.compute({ loadUnit: "w", load: 500, hours: 8, systemV: 48, dod: 80, efficiency: 90 }, ctx));
    expect(ah).toBeGreaterThan(110);
    expect(ah).toBeLessThan(122);
  });
});
