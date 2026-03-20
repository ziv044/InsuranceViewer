"use client";

import FileUpload from "@/components/FileUpload";

export default function Home() {
  return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-2xl w-full">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-[var(--primary)] mb-3">
                InsuranceViewer
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                העלה. ראה. הבן.
              </p>
            </div>

            {/* Upload Area */}
            <FileUpload />

            {/* Privacy Notice */}
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-green-800 font-medium text-sm">
                המידע שלך לא נשמר ולא נשלח לשום מקום.
              </p>
              <p className="text-green-700 text-sm mt-1">
                הכל מעובד בדפדפן שלך בלבד. סגירת הדף = המידע נמחק.
              </p>
            </div>

            {/* How to get files */}
            <div className="mt-8 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-[var(--primary)] mb-4">
                איך מורידים את הקבצים?
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    מסלקה פנסיונית
                  </h3>
                  <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                    <li>היכנסו לאתר המסלקה הפנסיונית</li>
                    <li>הזדהו עם תעודת זהות</li>
                    <li>בקשו דוח מרכז</li>
                    <li>הקבצים יגיעו תוך 3 ימי עסקים</li>
                  </ol>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    הר הביטוח
                  </h3>
                  <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                    <li>היכנסו לאתר הר הביטוח</li>
                    <li>הזדהו עם תעודת זהות</li>
                    <li>הורידו את דוח הפוליסות כ-Excel</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-sm text-gray-400 pb-8">
              InsuranceViewer — כלי צפייה בלבד — אין המלצות — אין עמלות
            </div>
          </div>
        </div>
      </div>
  );
}
