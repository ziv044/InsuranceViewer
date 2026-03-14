"use client";

import { useAppContext } from "@/lib/context";
import Navbar from "@/components/Navbar";
import Card from "@/components/Card";
import { formatDate } from "@/lib/format";
import Link from "next/link";

function fileTypeLabel(type: string): { label: string; description: string } {
  switch (type) {
    case "INP":
      return { label: "ביטוח (INP)", description: "מסלקה — מוצרי ביטוח" };
    case "KGM":
      return { label: "קופות גמל (KGM)", description: "מסלקה — קופות גמל וקרנות השתלמות" };
    case "PNN":
      return { label: "פנסיה (PNN)", description: "מסלקה — פנסיה" };
    case "HAR_HABITUACH":
      return { label: "הר הביטוח (Excel)", description: "הר הביטוח — פוליסות ביטוח" };
    default:
      return { label: "לא ידוע", description: "" };
  }
}

export default function FileStatusPage() {
  const { state } = useAppContext();

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Link href="/dashboard" className="text-sm text-[var(--secondary)] hover:underline mb-4 inline-block">
          ← חזרה ללוח בקרה
        </Link>

        <h1 className="text-2xl font-bold text-[var(--primary)] mb-6">
          📁 סטטוס קבצים שהועלו
        </h1>

        {state.files.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-500">לא הועלו קבצים עדיין.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {state.files.map((file, i) => {
              if (file.success && file.data) {
                const typeInfo = fileTypeLabel(file.data.type);
                return (
                  <Card key={i}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-green-600 text-lg">✅</span>
                          <h3 className="font-semibold">{typeInfo.label}</h3>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>
                            <span className="text-gray-400">שם קובץ:</span>{" "}
                            <span className="font-mono text-xs">{file.fileName}</span>
                          </p>
                          <p>
                            <span className="text-gray-400">סוג:</span> {typeInfo.description}
                          </p>

                          {file.data.type !== "HAR_HABITUACH" && (
                            <>
                              <p>
                                <span className="text-gray-400">שולח:</span>{" "}
                                {file.data.header.senderName}
                              </p>
                              <p>
                                <span className="text-gray-400">תאריך הפקה:</span>{" "}
                                {formatDate(file.data.header.executionDate)}
                              </p>
                              <p>
                                <span className="text-gray-400">גרסת XML:</span>{" "}
                                {file.data.header.xmlVersion}
                              </p>
                              <p>
                                <span className="text-gray-400">חברה:</span>{" "}
                                {file.data.provider.name}
                              </p>
                              <p>
                                <span className="text-gray-400">מוצרים שנמצאו:</span>{" "}
                                {file.data.products.length}
                              </p>
                            </>
                          )}

                          {file.data.type === "HAR_HABITUACH" && (
                            <>
                              <p>
                                <span className="text-gray-400">רשומות שנמצאו:</span>{" "}
                                {file.data.records.length}
                              </p>
                              <p>
                                <span className="text-gray-400">עמודות:</span>{" "}
                                {file.data.columns.length}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                      <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded">
                        נקרא בהצלחה
                      </span>
                    </div>
                  </Card>
                );
              }

              // Error file
              return (
                <Card key={i}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-red-600 text-lg">❌</span>
                        <h3 className="font-semibold text-red-800">שגיאה בקריאת קובץ</h3>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>
                          <span className="text-gray-400">שם קובץ:</span>{" "}
                          <span className="font-mono text-xs">{file.fileName}</span>
                        </p>
                        <p className="text-red-600">{file.error}</p>
                      </div>
                    </div>
                    <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded">
                      שגיאה
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-block bg-[var(--primary)] text-white px-6 py-2 rounded-lg hover:bg-[var(--primary-light)] transition-colors"
          >
            ➕ העלה קבצים נוספים
          </Link>
        </div>
      </div>
    </>
  );
}
