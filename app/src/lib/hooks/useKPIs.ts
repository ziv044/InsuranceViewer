"use client";

import { usePortfolioContext } from "@/lib/context/PortfolioContext";

export interface KPIValues {
  totalSavings: number;
  projectedMonthlyPension: { min: number; max: number } | null;
  coverageSnapshot: { active: number; total: number };
  providerCount: number;
  employerCount: number;
  totalAnnualFees: number;
  withdrawalEligibleCount: number;
  productCount: number;
}

export function useKPIs(): KPIValues {
  const { state } = usePortfolioContext();

  // Total savings from KGM
  const kgmProducts = state.kgmFiles.flatMap((f) => f.products);
  const totalSavings = kgmProducts.reduce((sum, p) => sum + p.totalBalance, 0);

  // Projected monthly pension from PNN
  const pnnProducts = state.pnnFiles.flatMap((f) => f.products);
  const allProjections = pnnProducts.flatMap((p) => p.projections);
  const at67 = allProjections.filter((p) => p.retirementAge === 67);
  const projectedMonthlyPension =
    at67.length > 0
      ? {
          min: Math.min(...at67.map((p) => p.monthlyPension)),
          max: Math.max(...at67.map((p) => p.monthlyPension)),
        }
      : null;

  // Coverage snapshot from INP
  const inpProducts = state.inpFiles.flatMap((f) => f.products);
  const coverageSnapshot = {
    active: inpProducts.filter((p) => p.status === "1").length,
    total: inpProducts.length,
  };

  // Provider count
  const providerNames = new Set<string>();
  state.inpFiles.forEach((f) => providerNames.add(f.provider.name));
  state.kgmFiles.forEach((f) => providerNames.add(f.provider.name));
  state.pnnFiles.forEach((f) => providerNames.add(f.provider.name));

  // Employer count
  const employerNames = new Set<string>();
  inpProducts.forEach((p) => p.employer?.name && employerNames.add(p.employer.name));
  kgmProducts.forEach((p) => p.employer?.name && employerNames.add(p.employer.name));
  pnnProducts.forEach((p) => p.employers.forEach((e) => employerNames.add(e.name)));

  // Total annual fees
  const totalAnnualFees = [
    ...inpProducts.map((p) => p.fees?.totalFees ?? 0),
    ...kgmProducts.map((p) => p.fees?.totalFees ?? 0),
    ...pnnProducts.map((p) => p.fees?.totalFees ?? 0),
  ].reduce((sum, f) => sum + f, 0);

  // Withdrawal eligible count
  const now = new Date();
  const withdrawalEligibleCount = kgmProducts.filter((p) => {
    if (!p.withdrawal?.eligibilityDate) return false;
    const d = p.withdrawal.eligibilityDate;
    if (d.length < 8) return false;
    const eligDate = new Date(
      parseInt(d.substring(0, 4)),
      parseInt(d.substring(4, 6)) - 1,
      parseInt(d.substring(6, 8)),
    );
    return eligDate <= now;
  }).length;

  const productCount =
    inpProducts.length + kgmProducts.length + pnnProducts.length;

  return {
    totalSavings,
    projectedMonthlyPension,
    coverageSnapshot,
    providerCount: providerNames.size,
    employerCount: employerNames.size,
    totalAnnualFees,
    withdrawalEligibleCount,
    productCount,
  };
}
