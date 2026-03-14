export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  // Format: YYYYMMDD or YYYYMM
  if (dateStr.length >= 8) {
    const y = dateStr.substring(0, 4);
    const m = dateStr.substring(4, 6);
    const d = dateStr.substring(6, 8);
    return `${d}/${m}/${y}`;
  }
  if (dateStr.length === 6) {
    const y = dateStr.substring(0, 4);
    const m = dateStr.substring(4, 6);
    return `${m}/${y}`;
  }
  return dateStr;
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("he-IL").format(n);
}

export function statusLabel(code: string): { label: string; color: string } {
  switch (code) {
    case "1":
      return { label: "פעיל", color: "text-green-600" };
    case "2":
      return { label: "מוקפא", color: "text-yellow-600" };
    case "3":
      return { label: "לא פעיל", color: "text-red-600" };
    default:
      return { label: code || "לא ידוע", color: "text-gray-500" };
  }
}

export function productTypeLabel(code: string): string {
  switch (code) {
    case "2":
      return "פנסיה";
    case "4":
      return "קופת גמל / קרן השתלמות";
    case "6":
      return "ביטוח";
    default:
      return `סוג ${code}`;
  }
}

export function feeTypeLabel(code: string): string {
  switch (code) {
    case "1":
      return "דמי ניהול מצבירה";
    case "2":
      return "דמי ניהול מהפקדה";
    default:
      return `סוג ${code}`;
  }
}

export function contributionTypeLabel(code: string): string {
  switch (code) {
    case "1":
      return "תגמולי עובד + מעסיק";
    case "2":
      return "תגמולי עובד";
    case "3":
      return "פיצויים";
    case "8":
      return "עובד";
    case "9":
      return "מעסיק";
    default:
      return code || "—";
  }
}

export function clause14Label(code: string): string {
  switch (code) {
    case "1":
      return "חל סעיף 14";
    case "2":
      return "לא חל סעיף 14";
    case "3":
      return "לא ידוע";
    default:
      return code || "—";
  }
}

export function genderLabel(code: string): string {
  switch (code) {
    case "1":
      return "זכר";
    case "2":
      return "נקבה";
    default:
      return "—";
  }
}

export function maritalStatusLabel(code: string): string {
  switch (code) {
    case "1":
      return "רווק/ה";
    case "2":
      return "נשוי/אה";
    case "3":
      return "גרוש/ה";
    case "4":
      return "אלמן/ה";
    default:
      return code || "—";
  }
}

export function isWithdrawalEligible(dateStr: string): boolean {
  if (!dateStr || dateStr.length < 8) return false;
  const y = parseInt(dateStr.substring(0, 4));
  const m = parseInt(dateStr.substring(4, 6)) - 1;
  const d = parseInt(dateStr.substring(6, 8));
  const eligDate = new Date(y, m, d);
  return eligDate <= new Date();
}
