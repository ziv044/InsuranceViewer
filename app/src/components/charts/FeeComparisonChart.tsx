"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import { CHART_PALETTE, hebrewPercentFormatter, CHART_MIN_HEIGHT } from "./chartConfig";
import { useAppContext } from "@/lib/context";

interface FeeItem {
  name: string;
  depositFee: number;
  savingsFee: number;
}

export default function FeeComparisonChart() {
  const { state } = useAppContext();

  const data: FeeItem[] = [];

  // Collect fees from all product types
  state.inpFiles.forEach((f) =>
    f.products.forEach((p) => {
      if (p.fees) {
        data.push({
          name: p.planName || p.policyNumber || "ביטוח",
          depositFee: p.fees.depositFeeRate || 0,
          savingsFee: p.fees.savingsFeeRate || 0,
        });
      }
    })
  );

  state.kgmFiles.forEach((f) =>
    f.products.forEach((p) => {
      if (p.fees) {
        data.push({
          name: p.planName || p.accountNumber || "קופת גמל",
          depositFee: p.fees.depositFeeRate || 0,
          savingsFee: p.fees.savingsFeeRate || 0,
        });
      }
    })
  );

  state.pnnFiles.forEach((f) =>
    f.products.forEach((p) => {
      if (p.fees) {
        data.push({
          name: p.planName || p.accountNumber || "פנסיה",
          depositFee: p.fees.depositFeeRate || 0,
          savingsFee: p.fees.savingsFeeRate || 0,
        });
      }
    })
  );

  if (data.length === 0) return null;

  return (
    <div className="bg-card rounded-lg border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        השוואת דמי ניהול
      </h3>
      <div style={{ minHeight: CHART_MIN_HEIGHT.mobile }}>
        <ResponsiveContainer width="100%" height={CHART_MIN_HEIGHT.desktop}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
          >
            <XAxis
              type="number"
              tickFormatter={(v: number) => hebrewPercentFormatter.format(v / 100)}
              domain={[0, "auto"]}
              orientation="bottom"
            />
            <YAxis
              type="category"
              dataKey="name"
              width={150}
              tick={{ fontSize: 12, textAnchor: "end" }}
              orientation="right"
            />
            <Tooltip
              formatter={(value, name) => [
                hebrewPercentFormatter.format(Number(value) / 100),
                name === "depositFee" ? "דמי ניהול מהפקדה" : "דמי ניהול מצבירה",
              ]}
              contentStyle={{ direction: "rtl" }}
            />
            <Bar dataKey="depositFee" name="דמי ניהול מהפקדה" radius={[4, 0, 0, 4]}>
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_PALETTE[0]} />
              ))}
            </Bar>
            <Bar dataKey="savingsFee" name="דמי ניהול מצבירה" radius={[4, 0, 0, 4]}>
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_PALETTE[1]} />
              ))}
            </Bar>
            <Legend
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ direction: "rtl", fontSize: 12 }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
