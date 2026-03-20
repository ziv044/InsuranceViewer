"use client";

import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { CHART_COLORS, hebrewCurrencyFormatter } from "./chartConfig";

interface DepositPoint {
  month: string;
  amount: number;
}

interface DepositHistorySparklineProps {
  data: DepositPoint[];
  label: string;
  trend?: "up" | "down" | "flat";
}

const trendColor = {
  up: CHART_COLORS.teal,
  down: "#ef4444",
  flat: CHART_COLORS.slate400,
};

export default function DepositHistorySparkline({
  data,
  label,
  trend = "flat",
}: DepositHistorySparklineProps) {
  if (data.length === 0) return null;

  const color = trendColor[trend];

  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: `${color}20`,
            color,
          }}
        >
          {trend === "up" ? "עולה" : trend === "down" ? "יורד" : "יציב"}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={60}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.2} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="month" hide />
          <Tooltip
            formatter={(value) => hebrewCurrencyFormatter.format(Number(value))}
            labelFormatter={(label) => String(label)}
            contentStyle={{ direction: "rtl", fontSize: 12 }}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke={color}
            fill={`url(#grad-${label})`}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
