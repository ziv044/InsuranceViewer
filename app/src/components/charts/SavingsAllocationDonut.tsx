"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { CHART_PALETTE, hebrewCurrencyFormatter, CHART_MIN_HEIGHT } from "./chartConfig";
import { useAppContext } from "@/lib/context";

interface SliceData {
  name: string;
  value: number;
}

export default function SavingsAllocationDonut() {
  const { state } = useAppContext();

  const slices: SliceData[] = [];

  // Pension accumulated
  const pensionTotal = state.pnnFiles.reduce(
    (sum, f) =>
      sum +
      f.products.reduce((s, p) => {
        const proj = p.projections.find((pr) => pr.retirementAge === 67) ||
          p.projections[p.projections.length - 1];
        return s + (proj?.totalAccumulated || 0);
      }, 0),
    0
  );
  if (pensionTotal > 0) slices.push({ name: "פנסיה", value: pensionTotal });

  // KGM savings
  const kgmTotal = state.kgmFiles.reduce(
    (sum, f) => sum + f.products.reduce((s, p) => s + p.totalBalance, 0),
    0
  );
  if (kgmTotal > 0) slices.push({ name: "קופות גמל / קרנות השתלמות", value: kgmTotal });

  if (slices.length === 0) return null;

  const total = slices.reduce((s, d) => s + d.value, 0);

  return (
    <div className="bg-card rounded-lg border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        חלוקת חיסכון
      </h3>
      <div style={{ minHeight: CHART_MIN_HEIGHT.mobile }}>
        <ResponsiveContainer width="100%" height={CHART_MIN_HEIGHT.desktop}>
          <PieChart>
            <Pie
              data={slices}
              cx="50%"
              cy="45%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              label={false}
            >
              {slices.map((_, i) => (
                <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => hebrewCurrencyFormatter.format(Number(value))}
              contentStyle={{ direction: "rtl" }}
            />
            <Legend
              verticalAlign="bottom"
              align="center"
              formatter={(value, entry) => {
                const slice = slices.find((s) => s.name === value);
                const pct = slice ? ((slice.value / total) * 100).toFixed(0) : "0";
                return `${value} (${pct}%)`;
              }}
              wrapperStyle={{ direction: "rtl", fontSize: 13 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <p className="text-center text-sm text-muted-foreground mt-2">
        סה״כ חיסכון: {hebrewCurrencyFormatter.format(total)}
      </p>
    </div>
  );
}
