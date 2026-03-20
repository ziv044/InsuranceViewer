// Shared chart configuration for RTL Hebrew Recharts
export const CHART_COLORS = {
  navy: "#1e3a5f",
  teal: "#0d9488",
  slate500: "#64748b",
  slate400: "#94a3b8",
} as const;

export const CHART_PALETTE = [
  CHART_COLORS.navy,
  CHART_COLORS.teal,
  CHART_COLORS.slate500,
  CHART_COLORS.slate400,
];

// RTL number formatter for chart axes
export const hebrewNumberFormatter = new Intl.NumberFormat("he-IL");
export const hebrewCurrencyFormatter = new Intl.NumberFormat("he-IL", {
  style: "currency",
  currency: "ILS",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
export const hebrewPercentFormatter = new Intl.NumberFormat("he-IL", {
  style: "percent",
  minimumFractionDigits: 2,
});

export const CHART_MIN_HEIGHT = {
  mobile: 240,
  desktop: 320,
};
