"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/lib/context";

const ACCEPTED_EXTENSIONS = [".dat", ".xlsx"];

function validateFiles(files: File[]): { valid: File[]; rejected: string[] } {
  const valid: File[] = [];
  const rejected: string[] = [];
  for (const file of files) {
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    if (ACCEPTED_EXTENSIONS.includes(ext)) {
      valid.push(file);
    } else {
      rejected.push(file.name);
    }
  }
  return { valid, rejected };
}

export default function FileUpload() {
  const { addFiles, isLoading } = useAppContext();
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      if (fileArray.length === 0) return;

      const { valid, rejected } = validateFiles(fileArray);
      if (rejected.length > 0) {
        setError(
          `סוג קובץ לא נתמך: ${rejected.join(", ")}. נא להעלות קבצי .DAT או .xlsx בלבד.`,
        );
      } else {
        setError(null);
      }

      if (valid.length > 0) {
        await addFiles(valid);
        router.push("/dashboard");
      }
    },
    [addFiles, router],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) handleFiles(e.target.files);
    },
    [handleFiles],
  );

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
          isDragging
            ? "border-secondary bg-teal-50 scale-[1.02]"
            : "border-gray-300 hover:border-secondary hover:bg-gray-50"
        }`}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <input
          id="file-input"
          type="file"
          multiple
          accept=".dat,.xlsx"
          onChange={handleInputChange}
          className="hidden"
        />

        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin w-10 h-10 border-4 border-secondary border-t-transparent rounded-full" />
            <p className="text-lg font-medium text-gray-600">מעבד קבצים...</p>
          </div>
        ) : (
          <>
            <div className="text-5xl mb-4">📁</div>
            <p className="text-xl font-semibold text-gray-700 mb-2">
              גרור קבצים לכאן
            </p>
            <p className="text-gray-500 mb-4">או לחץ לבחירת קבצים</p>
            <div className="border-t border-gray-200 pt-4 mt-4">
              <p className="text-sm text-gray-500 font-medium mb-2">
                קבצים נתמכים:
              </p>
              <div className="flex justify-center gap-4 text-sm text-gray-600">
                <span className="bg-gray-100 px-3 py-1 rounded-full">
                  מסלקה (.DAT)
                </span>
                <span className="bg-gray-100 px-3 py-1 rounded-full">
                  הר הביטוח (.xlsx)
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 text-center">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
