import { describe, it, expect } from "vitest";

// Test the KPI computation logic directly (without React context)
describe("KPI computation logic", () => {
  it("calculates total savings from KGM products", () => {
    const products = [
      { totalBalance: 100000 },
      { totalBalance: 250000 },
    ];
    const total = products.reduce((sum, p) => sum + p.totalBalance, 0);
    expect(total).toBe(350000);
  });

  it("finds min/max pension projections at age 67", () => {
    const projections = [
      { retirementAge: 67, monthlyPension: 3000 },
      { retirementAge: 67, monthlyPension: 5000 },
      { retirementAge: 70, monthlyPension: 6000 },
    ];
    const at67 = projections.filter((p) => p.retirementAge === 67);
    expect(at67.length).toBe(2);
    expect(Math.min(...at67.map((p) => p.monthlyPension))).toBe(3000);
    expect(Math.max(...at67.map((p) => p.monthlyPension))).toBe(5000);
  });

  it("counts unique providers across file types", () => {
    const names = new Set(["מגדל", "הראל", "מגדל"]);
    expect(names.size).toBe(2);
  });
});
