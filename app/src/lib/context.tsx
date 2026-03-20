// Re-export from new location for backwards compatibility
"use client";

export {
  PortfolioProvider as AppProvider,
  usePortfolioContext as useAppContext,
} from "@/lib/context/PortfolioContext";
