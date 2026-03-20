// 3-tier jargon translation system
// Tier 1: Replace entirely (user never sees original)
// Tier 2: Simplify + tooltip (show simple term, tooltip with explanation)
// Tier 3: Tooltip only (show original term, tooltip with explanation)

export type JargonTier = 1 | 2 | 3;

export interface JargonEntry {
  tier: JargonTier;
  original: string;
  display: string; // Tier 1: replacement, Tier 2: simplified, Tier 3: same as original
  tooltip?: string; // Tier 2 & 3: explanation shown on hover
}

export const jargonDictionary: Record<string, JargonEntry> = {
  // Tier 1: Replace entirely
  "SUG-MUTZAR-6": {
    tier: 1,
    original: "סוג מוצר 6",
    display: "ביטוח חיים",
  },
  "SUG-MUTZAR-4": {
    tier: 1,
    original: "סוג מוצר 4",
    display: "קופת גמל / קרן השתלמות",
  },
  "SUG-MUTZAR-2": {
    tier: 1,
    original: "סוג מוצר 2",
    display: "פנסיה",
  },
  "STATUS-1": {
    tier: 1,
    original: "סטטוס 1",
    display: "פעיל",
  },
  "STATUS-2": {
    tier: 1,
    original: "סטטוס 2",
    display: "מוקפא",
  },
  "STATUS-3": {
    tier: 1,
    original: "סטטוס 3",
    display: "לא פעיל",
  },

  // Tier 2: Simplify + tooltip
  "DMEI-NIHUL-MITZTVIRA": {
    tier: 2,
    original: "דמי ניהול מצבירה",
    display: "עמלת ניהול חיסכון",
    tooltip: "אחוז שנתי שגובה החברה מהסכום שנצבר בחיסכון שלך",
  },
  "DMEI-NIHUL-MHAFKADA": {
    tier: 2,
    original: "דמי ניהול מהפקדה",
    display: "עמלת ניהול הפקדה",
    tooltip: "אחוז שגובה החברה מכל הפקדה חודשית שנכנסת לחיסכון",
  },
  "TSUA-NETO": {
    tier: 2,
    original: "תשואה נטו",
    display: "רווח נקי",
    tooltip: "הרווח שהשקעות החיסכון שלך הניבו, אחרי ניכוי דמי ניהול",
  },
  "SEIF-14": {
    tier: 2,
    original: "סעיף 14",
    display: "סעיף 14 (פיצויים)",
    tooltip: "הסדר שמבטיח שכספי הפיצויים שהופקדו שייכים לך גם אם תפוטר",
  },
  "PENSIA-VATIKA": {
    tier: 2,
    original: "פנסיה ותיקה",
    display: "פנסיה ותיקה (לפני 1995)",
    tooltip: "קרן פנסיה שנפתחה לפני 1995 עם תנאים מיוחדים ומוגנים",
  },
  "PENSIA-HADASHA": {
    tier: 2,
    original: "פנסיה חדשה",
    display: "פנסיה חדשה",
    tooltip: "קרן פנסיה שנפתחה אחרי 1995, עובדת בשיטת הצבירה",
  },

  // Tier 3: Tooltip only
  "KEREN-HISHTALMUT": {
    tier: 3,
    original: "קרן השתלמות",
    display: "קרן השתלמות",
    tooltip: "חיסכון לטווח בינוני (6 שנים) עם הטבות מס. אפשר למשוך אחרי 6 שנות חברות",
  },
  "KUPAT-GEMEL": {
    tier: 3,
    original: "קופת גמל",
    display: "קופת גמל",
    tooltip: "חיסכון פנסיוני שמשלם קצבה חודשית בפרישה, או סכום חד-פעמי",
  },
  "BITUACH-MENAHALIM": {
    tier: 3,
    original: "ביטוח מנהלים",
    display: "ביטוח מנהלים",
    tooltip: "תוכנית חיסכון פנסיוני דרך חברת ביטוח, כוללת מרכיב ביטוחי",
  },
  "KITZVAT-ZIKNA": {
    tier: 3,
    original: "קצבת זקנה",
    display: "קצבת זקנה",
    tooltip: "הקצבה החודשית שתקבל מקרן הפנסיה אחרי פרישה לגמלאות",
  },
  "KISUI-NECHUT": {
    tier: 3,
    original: "כיסוי נכות",
    display: "כיסוי נכות",
    tooltip: "ביטוח שמשלם קצבה חודשית אם תאבד יכולת עבודה בגלל נכות",
  },
  "SHEERIM": {
    tier: 3,
    original: "שארים",
    display: "שארים",
    tooltip: "תשלום חודשי לבני משפחה (בן/בת זוג, ילדים) במקרה פטירה",
  },
};

export function translateJargon(key: string): JargonEntry | undefined {
  return jargonDictionary[key];
}

export function getJargonByTier(tier: JargonTier): JargonEntry[] {
  return Object.values(jargonDictionary).filter((e) => e.tier === tier);
}
