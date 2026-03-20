"use client";

import { useAppContext } from "@/lib/context";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { formatCurrency, statusLabel } from "@/lib/format";

interface CoverageRow {
  name: string;
  provider: string;
  status: string;
  statusCode: string;
  premium: number;
}

export default function CoverageStatusTable() {
  const { state } = useAppContext();

  const rows: CoverageRow[] = [];

  state.inpFiles.forEach((f) =>
    f.products.forEach((p) => {
      rows.push({
        name: p.planName || p.policyNumber || "ביטוח",
        provider: f.provider.name,
        status: statusLabel(p.status).label,
        statusCode: p.status,
        premium: p.totalInsurancePremium || 0,
      });
    })
  );

  if (rows.length === 0) return null;

  const badgeStatus = (code: string) => {
    if (code === "1") return "active" as const;
    if (code === "2") return "missing" as const;
    return "expired" as const;
  };

  return (
    <div className="bg-card rounded-lg border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        סטטוס כיסויים ביטוחיים
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="table">
          <thead>
            <tr className="border-b text-right">
              <th className="pb-2 pr-2 font-medium text-muted-foreground">מוצר</th>
              <th className="pb-2 pr-2 font-medium text-muted-foreground">ספק</th>
              <th className="pb-2 pr-2 font-medium text-muted-foreground">סטטוס</th>
              <th className="pb-2 pr-2 font-medium text-muted-foreground">פרמיה</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b last:border-b-0">
                <td className="py-2 pr-2 font-medium">{row.name}</td>
                <td className="py-2 pr-2 text-muted-foreground">{row.provider}</td>
                <td className="py-2 pr-2">
                  <StatusBadge
                    status={badgeStatus(row.statusCode)}
                    label={row.status}
                  />
                </td>
                <td className="py-2 pr-2 tabular-nums">
                  {row.premium > 0 ? formatCurrency(row.premium) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
