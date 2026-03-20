"use client";

import { usePortfolioContext } from "@/lib/context/PortfolioContext";

export function usePortfolio() {
  const { state, addFiles, clearAll, isLoading } = usePortfolioContext();
  return {
    ...state,
    addFiles,
    clearAll,
    isLoading,
    hasData: state.files.some((f) => f.success),
  };
}
