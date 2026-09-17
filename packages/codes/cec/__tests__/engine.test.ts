import { describe, it, expect } from "vitest";
import { codeContext } from "../../../registry";
import { cableSizeCalc } from "../calculators/cable-size";
import { voltageDropCalc } from "../calculators/voltage-drop";
import { dwellingLoadCalc } from "../calculators/dwelling-load";
import { breakerSizeCalc, kvaToAmpCalc, ampacityLookupCalc } from "../calculators/conversions";

const ctx = codeContext("CEC");
const primary = (r: { summary: { primary?: boolean; value: string }[] }) =>
  r.summary.find((s) => s.primary)?.value;

describe("ampacity lookup (Table 2/4)", () => {
  it("8 AWG copper is 55 A at 90 °C and 50 A at 75 °C", () => {
    expect(primary(ampacityLookupCalc.compute({ material: "cu", size: "8", temp: "90" }, ctx))).toBe("55");
    expect(primary(ampacityLookupCalc.compute({ material: "cu", size: "8", temp: "75" }, ctx))).toBe("50");
  });
});

describe("voltage drop", () => {
  it("8 AWG Cu, 40 A, 240 V 1ph, 40 m ≈ 3.4%", () => {
    const r = voltageDropCalc.compute({ system: "1ph", voltage: 240, current: 40, material: "cu", size: "8", length: 40, limit: 3 }, ctx);
    const pct = parseFloat(primary(r)!);
    expect(pct).toBeGreaterThan(3.2);
    expect(pct).toBeLessThan(3.6);
  });
});

describe("cable size — ampacity vs voltage drop selection", () => {
  it("short run: ampacity governs → 8 AWG", () => {
    const r = cableSizeCalc.compute({ current: 40, voltage: 240, system: "1ph", material: "cu", insulation: "90", termination: "75", install: "raceway", ambient: 30, ccc: 3, length: 10, vdLimit: 3 }, ctx);
    expect(primary(r)).toBe("8 AWG");
  });
  it("long run: voltage drop drives size up → 6 AWG", () => {
    const r = cableSizeCalc.compute({ current: 40, voltage: 240, system: "1ph", material: "cu", insulation: "90", termination: "75", install: "raceway", ambient: 30, ccc: 3, length: 40, vdLimit: 3 }, ctx);
    expect(primary(r)).toBe("6 AWG");
  });
  it("heavy grouping forces a larger conductor", () => {
    // 3 conductors → no grouping penalty; 9 conductors → ×0.7 forces an upsize.
    const few = cableSizeCalc.compute({ current: 40, voltage: 240, system: "1ph", material: "cu", insulation: "90", termination: "75", install: "raceway", ambient: 30, ccc: 3, length: 5, vdLimit: 3 }, ctx);
    const many = cableSizeCalc.compute({ current: 40, voltage: 240, system: "1ph", material: "cu", insulation: "90", termination: "75", install: "raceway", ambient: 30, ccc: 9, length: 5, vdLimit: 3 }, ctx);
    expect(primary(few)).toBe("8 AWG");
    expect(primary(many)).toBe("6 AWG");
  });
});

describe("dwelling load (Rule 8-200)", () => {
  it("150 m², 10 kW heat, 12 kW range, 3 kW WH → 25 kW, 110 A service", () => {
    const r = dwellingLoadCalc.compute({ floorArea: 150, voltage: 240, heating: 10000, ac: 0, rangeKw: 12, waterHeater: 3000, evCharger: 0, other: 0 }, ctx);
    expect(primary(r)).toBe("110");
    const kw = parseFloat(r.summary[1].value);
    expect(kw).toBeCloseTo(25, 1);
  });
  it("enforces the 100 A minimum for homes ≥ 80 m²", () => {
    const r = dwellingLoadCalc.compute({ floorArea: 100, voltage: 240, heating: 0, ac: 0, rangeKw: 0, waterHeater: 0, evCharger: 0, other: 0 }, ctx);
    expect(parseFloat(primary(r)!)).toBeGreaterThanOrEqual(100);
  });
});

describe("breaker size (Rule 14-104)", () => {
  it("40 A continuous → 50 A device", () => {
    expect(primary(breakerSizeCalc.compute({ current: 40, continuous: true, roundUp: true }, ctx))).toBe("50");
  });
  it("40 A non-continuous → 40 A device", () => {
    expect(primary(breakerSizeCalc.compute({ current: 40, continuous: false, roundUp: true }, ctx))).toBe("40");
  });
});

describe("kVA to amps", () => {
  it("75 kVA, 208 V, 3ph ≈ 208 A", () => {
    const a = parseFloat(primary(kvaToAmpCalc.compute({ system: "3ph", kva: 75, voltage: 208 }, ctx))!);
    expect(a).toBeGreaterThan(206);
    expect(a).toBeLessThan(210);
  });
});
