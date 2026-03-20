"use client";

type BadgeStatus = "active" | "missing" | "expired" | "withdrawal";

interface StatusBadgeProps {
  status: BadgeStatus;
  label: string;
}

const badgeStyles: Record<BadgeStatus, string> = {
  active: "bg-emerald-100 text-emerald-700",
  missing: "bg-amber-100 text-amber-700",
  expired: "bg-slate-100 text-slate-600",
  withdrawal: "bg-teal-100 text-teal-700",
};

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeStyles[status]}`}
      aria-label={`${label}`}
    >
      {label}
    </span>
  );
}
