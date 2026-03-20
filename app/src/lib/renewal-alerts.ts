import type { ParsedINP, InsuranceProduct } from "./types";

export interface RenewalAlert {
  productIndex: number;
  fileIndex: number;
  providerName: string;
  policyNumber: string;
  planName: string;
  endDate: string; // YYYYMMDD
  daysRemaining: number;
  source: "coverage" | "fee"; // where the date came from
}

/**
 * Parse a YYYYMMDD string into a Date object.
 * Returns null if invalid.
 */
function parseYYYYMMDD(dateStr: string): Date | null {
  if (!dateStr || dateStr.length < 8) return null;
  const y = parseInt(dateStr.substring(0, 4));
  const m = parseInt(dateStr.substring(4, 6)) - 1;
  const d = parseInt(dateStr.substring(6, 8));
  const date = new Date(y, m, d);
  if (isNaN(date.getTime())) return null;
  return date;
}

/**
 * Find the earliest upcoming discount end date for a product.
 * Checks both coverage discounts and fee structure discounts.
 */
function getEarliestEndDate(
  product: InsuranceProduct,
  today: Date,
): { date: string; source: "coverage" | "fee" } | null {
  let earliest: { date: string; parsed: Date; source: "coverage" | "fee" } | null = null;

  // Check coverage discount end dates
  for (const cov of product.coverages) {
    if (!cov.discountEndDate) continue;
    const parsed = parseYYYYMMDD(cov.discountEndDate);
    if (!parsed || parsed <= today) continue;
    if (!earliest || parsed < earliest.parsed) {
      earliest = { date: cov.discountEndDate, parsed, source: "coverage" };
    }
  }

  // Check fee structure discount end dates
  for (const fee of product.feeStructure) {
    if (!fee.discountEndDate) continue;
    const parsed = parseYYYYMMDD(fee.discountEndDate);
    if (!parsed || parsed <= today) continue;
    if (!earliest || parsed < earliest.parsed) {
      earliest = { date: fee.discountEndDate, parsed, source: "fee" };
    }
  }

  return earliest ? { date: earliest.date, source: earliest.source } : null;
}

/**
 * Scan all INP files for active products with upcoming renewal dates
 * (discount end dates within the given threshold).
 *
 * @param inpFiles - parsed INP file array
 * @param thresholdDays - number of days to look ahead (default 60)
 * @returns sorted array of renewal alerts, most urgent first
 */
export function getRenewalAlerts(
  inpFiles: ParsedINP[],
  thresholdDays = 60,
): RenewalAlert[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const alerts: RenewalAlert[] = [];

  for (let fi = 0; fi < inpFiles.length; fi++) {
    const file = inpFiles[fi];
    for (let pi = 0; pi < file.products.length; pi++) {
      const product = file.products[pi];

      // Only active products
      if (product.status !== "1") continue;

      const endDateInfo = getEarliestEndDate(product, today);
      if (!endDateInfo) continue;

      const parsed = parseYYYYMMDD(endDateInfo.date);
      if (!parsed) continue;

      const diffMs = parsed.getTime() - today.getTime();
      const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (daysRemaining > thresholdDays) continue;

      alerts.push({
        fileIndex: fi,
        productIndex: pi,
        providerName: product.providerName || file.provider.name,
        policyNumber: product.policyNumber,
        planName: product.planName,
        endDate: endDateInfo.date,
        daysRemaining,
        source: endDateInfo.source,
      });
    }
  }

  // Sort by most urgent first
  return alerts.sort((a, b) => a.daysRemaining - b.daysRemaining);
}

/**
 * Get urgency tier styling based on days remaining.
 */
export function getUrgencyTier(daysRemaining: number): {
  label: string;
  bg: string;
  border: string;
  text: string;
  badgeBg: string;
} {
  if (daysRemaining <= 14) {
    return {
      label: "דחוף",
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      badgeBg: "bg-red-100",
    };
  }
  if (daysRemaining <= 30) {
    return {
      label: "בקרוב",
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-800",
      badgeBg: "bg-amber-100",
    };
  }
  return {
    label: "מתקרב",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-800",
    badgeBg: "bg-yellow-100",
  };
}
