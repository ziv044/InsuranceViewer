"use client";

import { useState } from "react";
import { Home, PiggyBank, Shield, Lightbulb, User } from "lucide-react";

// RTL: flex flows right-to-left, so first item = rightmost (בית on right, המלצות on left)
const TABS = [
  { id: "home", label: "בית", icon: Home },
  { id: "savings", label: "חסכונות", icon: PiggyBank },
  { id: "insurance", label: "ביטוחים", icon: Shield },
  { id: "recommendations", label: "המלצות", icon: Lightbulb },
] as const;

type TabId = (typeof TABS)[number]["id"];

// Donut chart colors matching the screenshot (dark→light blues)
const SEGMENTS = [
  { label: "קופת גמל", amount: 300082, color: "#1e3a8a" },
  { label: "קרן השתלמות", amount: 247172, color: "#3b82f6" },
  { label: "קופת גמל להשקעה", amount: 115793, color: "#93c5fd" },
  { label: "קרן פנסיה", amount: 100737, color: "#bfdbfe" },
];

const TOTAL = SEGMENTS.reduce((s, seg) => s + seg.amount, 0);

function formatCurrency(n: number) {
  return n.toLocaleString("he-IL");
}

function DonutChart() {
  const size = 220;
  const strokeWidth = 32;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const arcs = SEGMENTS.map((seg) => {
    const pct = seg.amount / TOTAL;
    const dashArray = `${pct * circumference} ${circumference}`;
    const dashOffset = -offset * circumference;
    offset += pct;
    return { ...seg, dashArray, dashOffset };
  });

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
        {arcs.map((arc) => (
          <circle
            key={arc.label}
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
          {formatCurrency(TOTAL)} ₪
        </span>
      </div>
    </div>
  );
}

export default function MockPage() {
  const [activeTab, setActiveTab] = useState<TabId>("home");

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 pt-3 pb-2">
        <User className="w-7 h-7 text-gray-500" />
        <div className="w-7" />
      </header>

      {/* Scrollable content */}
      <main className="flex-1 overflow-y-auto pb-20 px-4">
        <h1 className="text-xl font-bold text-center mb-6">החסכונות שלך</h1>

        {/* Donut */}
        <div className="py-4">
          <DonutChart />
        </div>

        {/* List */}
        <div className="mt-8 divide-y divide-gray-200">
          {SEGMENTS.map((seg) => (
            <div
              key={seg.label}
              className="flex items-center justify-between py-4"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="text-base font-medium text-foreground">
                  {seg.label}
                </span>
              </div>
              <span className="tabular-nums text-base font-medium text-foreground">
                {formatCurrency(seg.amount)} ₪
              </span>
            </div>
          ))}
        </div>
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
