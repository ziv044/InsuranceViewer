"use client";

import { useState, useEffect } from "react";
import { Home, PiggyBank, Shield, Lightbulb, User } from "lucide-react";
import { parseXMLFile } from "@/lib/parsers";
import type { ParsedKGM, ParsedPNN } from "@/lib/types";

// RTL: flex flows right-to-left, so first item = rightmost (בית on right, המלצות on left)
const TABS = [
  { id: "home", label: "בית", icon: Home },
  { id: "savings", label: "חסכונות", icon: PiggyBank },
  { id: "insurance", label: "ביטוחים", icon: Shield },
  { id: "recommendations", label: "המלצות", icon: Lightbulb },
] as const;

type TabId = (typeof TABS)[number]["id"];

// Blue (majority), red, yellow shades — matching report palette
const COLORS = ["#3b82f6", "#ef4444", "#f59e0b", "#fbbf24", "#fcd34d", "#93c5fd"];

function formatCurrency(n: number) {
  return Math.round(n).toLocaleString("he-IL");
}

interface Segment {
  label: string;
  amount: number;
  color: string;
}

function DonutChart({ segments, total }: { segments: Segment[]; total: number }) {
  const size = 220;
  const strokeWidth = 32;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const arcs = segments.map((seg) => {
    const pct = total > 0 ? seg.amount / total : 0;
    const dashArray = `${pct * circumference} ${circumference}`;
    const dashOffset = -offset * circumference;
    offset += pct;
    return { ...seg, dashArray, dashOffset };
  });

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
        {arcs.map((arc, idx) => (
          <circle
            key={`${idx}-${arc.label}`}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={arc.color}
            strokeWidth={strokeWidth}
            strokeDasharray={arc.dashArray}
            strokeDashoffset={arc.dashOffset}
            strokeLinecap="round"
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-foreground tabular-nums">
          {formatCurrency(total)} ₪
        </span>
      </div>
    </div>
  );
}

function buildSegments(
  kgmFiles: ParsedKGM[],
  pnnFiles: ParsedPNN[],
): Segment[] {
  const items: { label: string; amount: number }[] = [];

  // KGM: sum totalBalance per product (distinguish keren hishtalmut vs kupat gemel)
  for (const file of kgmFiles) {
    for (const p of file.products) {
      if (p.totalBalance > 0) {
        const isHistalmut = (p.planName || "").includes("השתלמות");
        const type = isHistalmut ? "קרן השתלמות" : "קופת גמל";
        const name = p.providerName || p.planName || "";
        items.push({
          label: type,
          amount: p.totalBalance,
        });
      }
    }
  }

  // PNN: sum from investment tracks
  for (const file of pnnFiles) {
    for (const p of file.products) {
      const balance = p.investmentTracks.reduce((s, t) => s + t.balance, 0);
      if (balance > 0) {
        let type = "קרן פנסיה";
        const name = (p.planName || "").toLowerCase();
        if (name.includes("מקיפה") || name.includes("אישית")) {
          type = "קרן פנסיה חדשה מקיפה";
        } else if (name.includes("כללית") || name.includes("משלימה")) {
          type = "קרן פנסיה חדשה כללית";
        }
        items.push({
          label: type,
          amount: balance,
        });
      }
    }
  }

  // Group by product type label, then sort by amount descending, then assign colors
  const grouped = new Map<string, number>();
  for (const item of items) {
    grouped.set(item.label, (grouped.get(item.label) || 0) + item.amount);
  }
  return Array.from(grouped.entries())
    .map(([label, amount]) => ({ label, amount }))
    .sort((a, b) => b.amount - a.amount)
    .map((item, idx) => ({ ...item, color: COLORS[idx % COLORS.length] }));
}

export default function MockPage() {
  const [activeTab, setActiveTab] = useState<TabId>("savings");
  const [segments, setSegments] = useState<Segment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/mock-data");
        const files: { name: string; content: string }[] = await res.json();

        const kgmFiles: ParsedKGM[] = [];
        const pnnFiles: ParsedPNN[] = [];

        for (const f of files) {
          try {
            const parsed = parseXMLFile(f.content, f.name);
            if (parsed.type === "KGM") kgmFiles.push(parsed);
            else if (parsed.type === "PNN") pnnFiles.push(parsed);
          } catch {
            console.warn("Failed to parse", f.name);
          }
        }

        const segs = buildSegments(kgmFiles, pnnFiles);
        setSegments(segs);
        setTotal(segs.reduce((s, seg) => s + seg.amount, 0));
      } catch (e) {
        setError(e instanceof Error ? e.message : "שגיאה בטעינת נתונים");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 pt-3 pb-2">
        <User className="w-7 h-7 text-gray-500" />
        <div className="w-7" />
      </header>

      {/* Scrollable content */}
      <main className="flex-1 overflow-y-auto pb-20 px-4">

        {/* בית - Home */}
        {activeTab === "home" && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Home className="w-12 h-12 mb-3" />
            <p className="text-lg font-medium">בית</p>
          </div>
        )}

        {/* חסכונות - Savings */}
        {activeTab === "savings" && (
          <>
            <h1 className="text-xl font-bold text-center mb-6">החסכונות שלך</h1>

            {loading && (
              <div className="flex justify-center py-12">
                <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full" />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {!loading && !error && segments.length > 0 && (
              <>
                {/* Donut */}
                <div className="py-4">
                  <DonutChart segments={segments} total={total} />
                </div>

                {/* Legend table */}
                <table className="mt-6 w-full text-sm">
                  <tbody>
                    {segments.map((seg, idx) => {
                      const pct = total > 0 ? ((seg.amount / total) * 100).toFixed(0) : "0";
                      return (
                        <tr key={`${idx}-${seg.label}`}>
                          <td className="py-1.5 pe-2 text-start tabular-nums text-gray-500">
                            {formatCurrency(seg.amount)}₪
                          </td>
                          <td className="py-1.5 pe-2 text-start tabular-nums font-semibold text-gray-500">
                            {pct}%
                          </td>
                          <td className="py-1.5 pe-2 text-start font-medium text-foreground">
                            {seg.label}
                          </td>
                          <td className="py-1.5 w-4">
                            <span
                              className="inline-block w-3 h-3 rounded-full"
                              style={{ backgroundColor: seg.color }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </>
            )}

            {!loading && !error && segments.length === 0 && (
              <p className="text-center text-gray-500 py-12">לא נמצאו נתוני חסכון</p>
            )}
          </>
        )}

        {/* ביטוחים - Insurance */}
        {activeTab === "insurance" && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Shield className="w-12 h-12 mb-3" />
            <p className="text-lg font-medium">ביטוחים</p>
          </div>
        )}

        {/* המלצות - Recommendations */}
        {activeTab === "recommendations" && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Lightbulb className="w-12 h-12 mb-3" />
            <p className="text-lg font-medium">המלצות</p>
          </div>
        )}
      </main>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around items-center h-16">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 min-w-[64px] transition-colors ${
                  isActive ? "text-blue-700" : "text-gray-400"
                }`}
              >
                <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
