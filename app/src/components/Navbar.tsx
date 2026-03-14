"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppContext } from "@/lib/context";

const navItems = [
  { href: "/dashboard", label: "לוח בקרה", icon: "📊" },
  { href: "/insurance", label: "ביטוח", icon: "🛡️" },
  { href: "/savings", label: "קופות גמל", icon: "💰" },
  { href: "/pension", label: "פנסיה", icon: "🏦" },
  { href: "/har-habituach", label: "הר הביטוח", icon: "🏔️" },
  { href: "/file-status", label: "קבצים", icon: "📁" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { clearAll } = useAppContext();

  return (
    <nav className="bg-[var(--primary)] text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="font-bold text-lg flex items-center gap-2" onClick={clearAll}>
            📊 InsuranceViewer
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-white/20 text-white"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <span className="ml-1">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          <Link
            href="/"
            className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-md transition-colors"
            onClick={clearAll}
          >
            🔄 העלה מחדש
          </Link>
        </div>
      </div>
    </nav>
  );
}
