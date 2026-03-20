"use client";

type KPIStatus = "healthy" | "attention" | "neutral";

interface KPIFusionCardProps {
  value: string;
  sentence: string;
  status?: KPIStatus;
  detailsLink?: { label: string; onClick: () => void };
  ariaLabel?: string;
}

const statusStyles: Record<KPIStatus, string> = {
  healthy: "bg-emerald-500/5 border-emerald-500/10",
  attention: "border-amber-500/10",
  neutral: "",
};

export default function KPIFusionCard({
  value,
  sentence,
  status = "neutral",
  detailsLink,
  ariaLabel,
}: KPIFusionCardProps) {
  return (
    <div
      className={`bg-card rounded-lg border p-6 ${statusStyles[status]}`}
      aria-label={ariaLabel || `${sentence} ${value}`}
    >
      <div className="text-4xl font-bold font-sans tabular-nums text-foreground">
        {value}
      </div>
      <p className="text-base text-muted-foreground mt-2">{sentence}</p>
      {detailsLink && (
        <button
          onClick={detailsLink.onClick}
          className="text-sm text-secondary mt-3 hover:underline"
        >
          {detailsLink.label}
        </button>
      )}
    </div>
  );
}
