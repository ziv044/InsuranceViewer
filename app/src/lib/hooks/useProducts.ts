"use client";

import { usePortfolioContext } from "@/lib/context/PortfolioContext";
import type {
  InsuranceProduct,
  SavingsProduct,
  PensionProduct,
} from "@/lib/types";

type ProductType = "INP" | "KGM" | "PNN";

export function useProducts(type: ProductType) {
  const { state } = usePortfolioContext();

  switch (type) {
    case "INP":
      return state.inpFiles.flatMap((f) => f.products) as InsuranceProduct[];
    case "KGM":
      return state.kgmFiles.flatMap((f) => f.products) as SavingsProduct[];
    case "PNN":
      return state.pnnFiles.flatMap((f) => f.products) as PensionProduct[];
    default:
      return [];
  }
}
