"use client";

import { useState } from "react";
import { useAppContext } from "@/lib/context";
import Navbar from "@/components/Navbar";
import Card from "@/components/Card";
import Link from "next/link";

export default function HarHabituachPage() {
  const { state } = useAppContext();
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const allRecords = state.harHabituachFiles.flatMap((f) => f.records);
  const columns = state.harHabituachFiles.length > 0 ? state.harHabituachFiles[0].columns : [];

  // Filter
  const filtered = search
    ? allRecords.filter((r) =>
        Object.values(r).some(
          (v) => v !== null && String(v).toLowerCase().includes(search.toLowerCase())
        )
      )
    : allRecords;

  // Sort
  const sorted = sortCol
    ? [...filtered].sort((a, b) => {
        const aVal = a[sortCol] ?? "";
        const bVal = b[sortCol] ?? "";
        const cmp = String(aVal).localeCompare(String(bVal), "he");
        return sortAsc ? cmp : -cmp;
      })
    : filtered;

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(col);
      setSortAsc(true);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Link href="/dashboard" className="text-sm text-[var(--secondary)] hover:underline mb-4 inline-block">
          ← חזרה ללוח בקרה
        </Link>

        <h1 className="text-2xl font-bold text-[var(--primary)] mb-2">
          🏔️ הר הביטוח
        </h1>
        <p className="text-gray-500 mb-6">פוליסות ביטוח מהמאגר הממשלתי</p>

        {state.harHabituachFiles.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-500">לא נמצאו נתוני הר הביטוח. העלה קובץ Excel מהר הביטוח.</p>
          </Card>
        ) : (
          <>
            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="🔍 חיפוש..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-96 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent"
              />
            </div>

            {/* Summary */}
            <div className="mb-4 text-sm text-gray-500">
              מציג {sorted.length} רשומות {search && `(מסוננות מתוך ${allRecords.length})`}
            </div>

            {/* Table */}
            <Card className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    {columns.map((col) => (
                      <th
                        key={col}
                        onClick={() => handleSort(col)}
                        className="text-right py-3 px-3 font-medium text-gray-600 cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                      >
                        {col}
                        {sortCol === col && (
                          <span className="mr-1">{sortAsc ? " ▲" : " ▼"}</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((record, ri) => (
                    <tr key={ri} className="border-b border-gray-50 hover:bg-gray-50">
                      {columns.map((col) => (
                        <td key={col} className="py-2 px-3 whitespace-nowrap">
                          {record[col] !== null ? String(record[col]) : "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              {sorted.length === 0 && (
                <p className="text-center text-gray-400 py-8">
                  {search ? "לא נמצאו תוצאות" : "אין נתונים"}
                </p>
              )}
            </Card>

            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700">
              ⚠️ הנתונים מהר הביטוח הם מעודכנים לתאריך ההורדה מהאתר הממשלתי.
            </div>
          </>
        )}
      </div>
    </>
  );
}
