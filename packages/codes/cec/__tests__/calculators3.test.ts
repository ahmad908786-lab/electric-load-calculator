import { describe, it, expect } from "vitest";
import { codeContext } from "../../../registry";
import { conduitFillCalc } from "../calculators/conduit";
import { arcFlashCalc } from "../calculators/arc-flash";
import { generalSizingCalc, buriedCableCalc } from "../calculators/extra";

const ctx = codeContext("CEC");
const primary = (r: { summary: { primary?: boolean; value: string }[] }) => r.summary.find((s) => s.primary)?.value;
const num = (r: { summary: { primary?: boolean; value: string }[] }) => parseFloat(primary(r)!);

describe("conduit fill", () => {
  it("computes fill % and passes for lightly filled conduit", () => {
    const r = conduitFillCalc.compute({ size: "12", count: 10, conduit: '3/4"' }, ctx);
    const pct = num(r);
    expect(pct).toBeGreaterThan(20);
    expect(pct).toBeLessThan(30);
    expect(r.summary[1].value).toBe("PASS");
  });
});

describe("general sizing", () => {
  it("100 A copper, 90/75 → 3 AWG", () => {
    expect(primary(generalSizingCalc.compute({ required: 100, material: "cu", insulation: "90", termination: "75", ambient: 30 }, ctx))).toBe("3 AWG");
  });
});

describe("buried cable (delegates to cable-size)", () => {
  it("returns a conductor size and flags the Appendix D approximation", () => {
    const r = buriedCableCalc.compute({ current: 100, system: "1ph", voltage: 240, material: "cu", insulation: "90", termination: "75", depth: 600, ambient: 20, length: 60, vdLimit: 3 }, ctx);
    expect(primary(r)).toMatch(/AWG|kcmil/);
    expect(r.warnings.some((w) => /Appendix D|approximation|in-raceway/i.test(w.message))).toBe(true);
  });
});

describe("arc flash (IEEE 1584-2002 screening)", () => {
  it("gives positive incident energy that rises with clearing time", () => {
    const fast = num(arcFlashCalc.compute({ equipment: "panel", voltage: 0.48, boltedKa: 25, grounded: true, time: 0.1, distance: 455 }, ctx));
    const slow = num(arcFlashCalc.compute({ equipment: "panel", voltage: 0.48, boltedKa: 25, grounded: true, time: 0.4, distance: 455 }, ctx));
    expect(fast).toBeGreaterThan(0);
    expect(slow).toBeGreaterThan(fast);
  });
});
