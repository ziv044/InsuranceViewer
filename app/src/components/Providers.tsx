"use client";

import { PortfolioProvider } from "@/lib/context/PortfolioContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <PortfolioProvider>{children}</PortfolioProvider>;
}
