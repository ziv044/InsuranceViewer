import type { ReactNode } from "react";

interface CardProps {
  title?: string;
  icon?: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
}

export default function Card({ title, icon, children, className = "", onClick }: CardProps) {
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 transition-all ${
        onClick ? "hover:shadow-md hover:border-[var(--secondary-light)] cursor-pointer" : ""
      } ${className}`}
    >
      {title && (
        <h3 className="text-lg font-semibold text-[var(--primary)] mb-3 flex items-center gap-2">
          {icon && <span>{icon}</span>}
          {title}
        </h3>
      )}
      {children}
    </Wrapper>
  );
}

export function StatCard({
  icon,
  label,
  value,
  subtitle,
  onClick,
}: {
  icon: string;
  label: string;
  value: string;
  subtitle?: string;
  onClick?: () => void;
}) {
  return (
    <Card onClick={onClick} className="text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-[var(--primary)] tabular-nums">{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      {onClick && (
        <p className="text-xs text-[var(--secondary)] mt-2 font-medium">
          צפה בפרטים ←
        </p>
      )}
    </Card>
  );
}
