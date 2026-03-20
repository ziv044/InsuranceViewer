"use client";

interface EmptyStateCardProps {
  message?: string;
  fileType?: string;
}

export default function EmptyStateCard({
  message = "אין מידע זמין בנושא זה",
  fileType,
}: EmptyStateCardProps) {
  return (
    <div className="bg-slate-50 border-dashed border-slate-200 border-2 rounded-lg p-8 text-center">
      <p className="text-slate-400 text-base">{message}</p>
      {fileType && (
        <p className="text-slate-400 text-sm mt-2">
          כדי לראות נתונים אלו, נא להעלות קובץ {fileType}
        </p>
      )}
    </div>
  );
}
