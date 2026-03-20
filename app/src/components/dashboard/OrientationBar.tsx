"use client";

interface OrientationBarProps {
  products: number;
  providers: number;
  employers: number;
}

export default function OrientationBar({
  products,
  providers,
  employers,
}: OrientationBarProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-slate-50 rounded-lg px-4 py-2.5 text-sm text-slate-600"
    >
      יש לך{" "}
      <span className="font-bold text-foreground">{products}</span> מוצרים,{" "}
      <span className="font-bold text-foreground">{providers}</span> ספקים,{" "}
      <span className="font-bold text-foreground">{employers}</span> מעסיקים
    </div>
  );
}
