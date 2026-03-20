"use client";

import { useState } from "react";

type ViewMode = "agent" | "user";

interface ViewToggleProps {
  onToggle: (mode: ViewMode) => void;
  defaultMode?: ViewMode;
}

export default function ViewToggle({
  onToggle,
  defaultMode = "agent",
}: ViewToggleProps) {
  const [mode, setMode] = useState<ViewMode>(defaultMode);

  const toggle = () => {
    const next = mode === "agent" ? "user" : "agent";
    setMode(next);
    onToggle(next);
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 text-sm bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md transition-colors"
      aria-label={mode === "agent" ? "צפייה כמשתמש" : "צפייה כסוכן"}
    >
      <span className="text-xs">
        {mode === "agent" ? "👁️ צפייה כמשתמש" : "🔙 חזרה לתצוגת סוכן"}
      </span>
    </button>
  );
}
