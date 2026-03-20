"use client";

import FileUpload from "@/components/FileUpload";

export default function AgentUploadZone() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          העלאת קבצי לקוח
        </h2>
        <p className="text-sm text-muted-foreground">
          גרור קבצים לכאן כדי לצפות בנתוני הלקוח
        </p>
      </div>
      <FileUpload />
      <p className="text-center text-xs text-muted-foreground mt-4">
        המידע מעובד בדפדפן בלבד — לא נשמר ולא נשלח לשום מקום
      </p>
    </div>
  );
}
