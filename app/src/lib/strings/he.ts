export const strings = {
  // App
  appName: "InsuranceViewer",
  appTagline: "העלה. ראה. הבן.",
  trustMessage: "המידע שלך לא נשמר, לא נשלח לשום מקום. הכל קורה בדפדפן שלך.",
  dataFreshness: "נתונים מתאריך",
  loading: "טוען נתונים",
  skipToContent: "דלג לתוכן הראשי",

  // Navigation
  nav: {
    dashboard: "לוח בקרה",
    insurance: "ביטוח",
    savings: "קופות גמל",
    pension: "פנסיה",
    harHabituach: "הר הביטוח",
    fileStatus: "סטטוס קבצים",
  },

  // Upload
  upload: {
    dragDrop: "גרור קבצים לכאן",
    orClick: "או לחץ לבחירת קבצים",
    acceptedFormats: "קבצי מסלקה (.DAT) והר הביטוח (.xlsx)",
    howToDownload: "איך להוריד את הקבצים?",
    invalidFileType: "סוג קובץ לא נתמך. נא להעלות קבצי .DAT או .xlsx בלבד.",
    fileParseError: "שגיאה בקריאת הקובץ",
    tryAgain: "נסה שוב",
  },

  // KPIs
  kpi: {
    totalSavings: "סה״כ חיסכון",
    totalSavingsSentence: "יש לך חיסכון כולל של",
    monthlyPension: "קצבה חודשית צפויה",
    monthlyPensionSentence: "הקצבה החודשית הצפויה שלך בגיל 67",
    coverageSnapshot: "כיסויים ביטוחיים",
    coverageSentenceFn: (active: number, total: number) =>
      `יש לך ${active} כיסויים פעילים מתוך ${total}`,
  },

  // Orientation bar
  orientation: {
    sentenceFn: (products: number, providers: number, employers: number) =>
      `יש לך ${products} מוצרים, ${providers} ספקים, ${employers} מעסיקים`,
    partial: "חלק מהנתונים חסרים",
  },

  // Action items
  actions: {
    annualFees: "את/ה משלם/ת",
    annualFeesSuffix: "בשנה על ניהול",
    withdrawalEligible: "מוצרים זמינים למשיכה",
  },

  // Empty states
  empty: {
    noData: "אין מידע זמין בנושא זה",
    noFiles: "טרם הועלו קבצים",
    partialData: (available: number, total: number) =>
      `מבוסס על ${available} מתוך ${total} מוצרים`,
    needFile: (type: string) => `כדי לראות נתונים אלו, נא להעלות קובץ ${type}`,
  },

  // Status labels
  status: {
    active: "פעיל",
    frozen: "מוקפא",
    inactive: "לא פעיל",
    unknown: "לא ידוע",
    missing: "חסר",
    expired: "לא פעיל",
  },

  // Product types
  productType: {
    pension: "פנסיה",
    savings: "קופת גמל / קרן השתלמות",
    insurance: "ביטוח",
  },

  // File status
  fileStatus: {
    success: "נטען בהצלחה",
    error: "שגיאה",
    partial: "נטען חלקית",
    productsFound: "מוצרים נמצאו",
    recordsFound: "רשומות נמצאו",
  },

  // Agent view
  agent: {
    uploadInstructions: "גרור קבצים לכאן",
    viewAsUser: "צפייה כמשתמש",
    footer:
      "יש לך שאלות? דבר/י עם הסוכן שלך · המידע מבוסס על קבצים שהועלו ואינו מהווה ייעוץ פיננסי",
  },

  // Fees
  fees: {
    depositFee: "דמי ניהול מהפקדה",
    savingsFee: "דמי ניהול מצבירה",
    perYear: "בשנה",
  },

  // Accessibility
  a11y: {
    kpiValue: (label: string, value: string) => `${label}: ${value}`,
    chartSummary: (description: string) => `תרשים: ${description}`,
    loadingSection: "טוען נתונים",
  },
} as const;
