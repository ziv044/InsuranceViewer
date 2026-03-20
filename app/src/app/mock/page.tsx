"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Home, PiggyBank, Shield, Lightbulb, ChevronLeft, ChevronDown, ChevronUp,
  Car, House, LifeBuoy, ShieldCheck, HeartPulse, AlertTriangle,
  Sparkles, CheckCircle2, Copy, MessageCircle, Phone, Mail,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { parseXMLFile } from "@/lib/parsers";
import { getRenewalAlerts, getUrgencyTier } from "@/lib/renewal-alerts";
import type {
  ParsedKGM, ParsedPNN, ParsedINP, HarHabituachRecord,
  SavingsProduct, PensionProduct, Beneficiary,
} from "@/lib/types";

// RTL: flex flows right-to-left, so first item = rightmost (בית on right, המלצות on left)
const TABS = [
  { id: "home", label: "בית", icon: Home },
  { id: "savings", label: "חסכונות", icon: PiggyBank },
  { id: "insurance", label: "ביטוחים", icon: Shield },
  { id: "recommendations", label: "המלצות", icon: Lightbulb },
] as const;

type TabId = (typeof TABS)[number]["id"];

// Navy (majority), teal/green, orange — matching app palette
const COLORS = ["#1e3a5f", "#0d9488", "#f59e0b", "#fbbf24", "#fcd34d", "#93c5fd"];

function formatCurrency(n: number) {
  return Math.round(n).toLocaleString("he-IL");
}

// Extract short brand name from full legal provider name
// e.g. "כלל חברה לביטוח בע\"מ" → "כלל", "הפניקס חברה לביטוח בע\"מ" → "הפניקס"
function shortProviderName(name: string): string {
  if (!name) return "";
  const stripped = name
    .replace(/בע"מ|בע״מ|בע''מ/g, "")
    .replace(/חברה לביטוח|לביטוח|חברה לניהול קופות גמל|חברה מנהלת|ניהול קרנות פנסיה/g, "")
    .replace(/פנסיה וגמל|וביטוח|ופיננסים/g, "")
    .trim();
  // Take the first meaningful word(s) — up to first dash or common filler
  const brand = stripped.split(/\s*[-–]\s*/)[0].trim();
  return brand || name.split(/\s+/)[0];
}

interface Segment {
  label: string;
  amount: number;
  color: string;
}

function DonutChart({ segments, total }: { segments: Segment[]; total: number }) {
  const size = 220;
  const strokeWidth = 32;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const arcs = segments.map((seg) => {
    const pct = total > 0 ? seg.amount / total : 0;
    const dashArray = `${pct * circumference} ${circumference}`;
    const dashOffset = -offset * circumference;
    offset += pct;
    return { ...seg, dashArray, dashOffset };
  });

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
        {arcs.map((arc, idx) => (
          <circle
            key={`${idx}-${arc.label}`}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={arc.color}
            strokeWidth={strokeWidth}
            strokeDasharray={arc.dashArray}
            strokeDashoffset={arc.dashOffset}
            strokeLinecap="round"
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs text-gray-500 mb-1">סה&quot;כ חסכונות</span>
        <span className="text-2xl font-bold text-foreground tabular-nums">
          ₪ {formatCurrency(total)}
        </span>
      </div>
    </div>
  );
}

function buildSegments(
  kgmFiles: ParsedKGM[],
  pnnFiles: ParsedPNN[],
): Segment[] {
  const items: { label: string; amount: number }[] = [];

  // KGM: sum totalBalance per product (distinguish keren hishtalmut vs kupat gemel)
  for (const file of kgmFiles) {
    for (const p of file.products) {
      if (p.totalBalance > 0) {
        const isHistalmut = (p.planName || "").includes("השתלמות");
        const type = isHistalmut ? "קרן השתלמות" : "קופת גמל";
        items.push({
          label: type,
          amount: p.totalBalance,
        });
      }
    }
  }

  // PNN: sum from investment tracks
  for (const file of pnnFiles) {
    for (const p of file.products) {
      const balance = p.investmentTracks.reduce((s, t) => s + t.balance, 0);
      if (balance > 0) {
        let type = "קרן פנסיה";
        const name = (p.planName || "").toLowerCase();
        if (name.includes("מקיפה") || name.includes("אישית")) {
          type = "קרן פנסיה חדשה מקיפה";
        } else if (name.includes("כללית") || name.includes("משלימה")) {
          type = "קרן פנסיה חדשה כללית";
        }
        items.push({
          label: type,
          amount: balance,
        });
      }
    }
  }

  // Group by product type label, then sort by amount descending, then assign colors
  const grouped = new Map<string, number>();
  for (const item of items) {
    grouped.set(item.label, (grouped.get(item.label) || 0) + item.amount);
  }
  return Array.from(grouped.entries())
    .map(([label, amount]) => ({ label, amount }))
    .sort((a, b) => b.amount - a.amount)
    .map((item, idx) => ({ ...item, color: COLORS[idx % COLORS.length] }));
}

// Insurance type config: icon + display order
const INSURANCE_TYPE_CONFIG: Record<string, { icon: LucideIcon; order: number }> = {
  "ביטוח רכב": { icon: Car, order: 0 },
  "ביטוח דירה": { icon: House, order: 1 },
  "ביטוח סיעודי": { icon: LifeBuoy, order: 2 },
  "ביטוח חיים": { icon: ShieldCheck, order: 3 },
  "ביטוח בריאות": { icon: HeartPulse, order: 4 },
};

interface InsuranceCategory {
  type: string;
  monthlyPremium: number;
  icon: LucideIcon;
}

function buildInsuranceCategories(records: HarHabituachRecord[]): InsuranceCategory[] {
  const grouped = new Map<string, number>();

  for (const r of records) {
    const type = String(r["ענף ראשי"] ?? "").trim();
    if (!type) continue;

    const premium = Number(r["פרמיה בש\"ח"]) || 0;
    const premiumType = String(r["סוג פרמיה"] ?? "").trim();

    // Normalize to monthly
    const monthly = premiumType === "שנתית" ? premium / 12 : premium;

    // Group "אבדן כושר עבודה" under "ביטוח חיים"
    const key = type === "אבדן כושר עבודה" ? "ביטוח חיים" : type;
    grouped.set(key, (grouped.get(key) || 0) + monthly);
  }

  return Array.from(grouped.entries())
    .map(([type, monthlyPremium]) => ({
      type,
      monthlyPremium,
      icon: INSURANCE_TYPE_CONFIG[type]?.icon ?? Shield,
    }))
    .sort((a, b) => {
      const oa = INSURANCE_TYPE_CONFIG[a.type]?.order ?? 99;
      const ob = INSURANCE_TYPE_CONFIG[b.type]?.order ?? 99;
      return oa - ob;
    });
}

// Unified savings product card data
interface SavingsCard {
  id: string;
  productType: string; // e.g. "קופת גמל", "קרן פנסיה"
  providerName: string;
  status: string;
  balance: number;
  depositFeeRate: number;
  savingsFeeRate: number;
  investmentTrackName: string;
  rawKgm?: SavingsProduct;
  rawPnn?: PensionProduct;
}

// Expandable section component
function Section({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-3 text-sm font-bold text-foreground"
      >
        <span>{open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</span>
        <span>{title}</span>
      </button>
      {open && <div className="px-4 pb-4 space-y-2.5">{children}</div>}
    </div>
  );
}

// Detail row component
function DetailRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value === null || value === undefined || value === "" || value === 0) return null;
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium tabular-nums">{typeof value === "number" ? formatCurrency(value) + "₪" : value}</span>
    </div>
  );
}

// Fee quality badge: rates below thresholds get a quality label
function feeQuality(rate: number, type: "deposit" | "savings"): { label: string; color: string; icon: string } | null {
  if (type === "deposit") {
    if (rate <= 1.5) return { label: "מצוין", color: "text-orange-500", icon: "⭐" };
    if (rate <= 3) return { label: "טוב", color: "text-teal-600", icon: "✓" };
    return null;
  }
  // savings
  if (rate <= 0.5) return { label: "מצוין", color: "text-orange-500", icon: "⭐" };
  if (rate <= 1) return { label: "טוב", color: "text-teal-600", icon: "✓" };
  return null;
}

function formatDate(d: string): string {
  if (!d || d.length !== 8) return d || "";
  return `${d.slice(6, 8)}/${d.slice(4, 6)}/${d.slice(0, 4)}`;
}

function formatBeneficiaries(beneficiaries: Beneficiary[]): string[] {
  return beneficiaries
    .filter((b) => b.firstName || b.lastName)
    .map((b) => `${b.firstName} ${b.lastName} (${b.percentage}%)`);
}

// Pension simulator — interactive sliders for projected pension
function PensionSimulator({ currentBalance }: { currentBalance: number }) {
  const [annualReturn, setAnnualReturn] = useState(5.5);
  const [monthlyDeposit, setMonthlyDeposit] = useState(750);
  const currentAge = 37;
  const retirementAge = 67;
  const yearsToRetirement = retirementAge - currentAge;
  const monthsToRetirement = yearsToRetirement * 12;

  // Compound interest calculation
  const monthlyRate = annualReturn / 100 / 12;
  const futureBalance =
    currentBalance * Math.pow(1 + monthlyRate, monthsToRetirement) +
    monthlyDeposit * ((Math.pow(1 + monthlyRate, monthsToRetirement) - 1) / monthlyRate);
  const monthlyPension = Math.round(futureBalance / (12 * 18)); // ~18 years of retirement (life expectancy 85)
  const growthMultiple = futureBalance / currentBalance;
  const growthPercent = Math.round((growthMultiple - 1) * 100);
  const currentPct = currentBalance / futureBalance;

  // Rating for monthly pension
  const pensionRating = monthlyPension >= 15000 ? "מצוין" : monthlyPension >= 10000 ? "טוב" : "בינוני";

  return (
    <Section title="סימולטור פנסיה" defaultOpen>
      {/* Info box */}
      <div className="bg-gray-50 rounded-xl p-3 mb-3">
        <p className="text-xs text-gray-500 text-right leading-relaxed">
          הפנסיה שלך מחושבת לפי הפקדה חודשית וריבית שנתית צפויה. שנה את הפרמטרים לבדיקת תרחישים.
        </p>
      </div>

      {/* Expected accumulation bar */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-3">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-xs text-gray-500">צבירה צפויה</span>
          <span className="text-xs text-gray-500">היום</span>
        </div>
        <div className="w-full h-6 rounded-full overflow-hidden flex bg-gray-100">
          <div
            className="h-full bg-gradient-to-l from-[#1e3a5f] to-[#0d9488]"
            style={{ width: `${Math.max(currentPct * 100, 8)}%` }}
          />
          <div
            className="h-full bg-[#1e3a5f]"
            style={{ width: `${Math.max((1 - currentPct) * 100 - 2, 0)}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-sm font-bold text-teal-700 tabular-nums">{formatCurrency(Math.round(futureBalance))}₪</span>
          <span className="text-sm text-gray-500 tabular-nums">{formatCurrency(currentBalance)}₪</span>
        </div>
        <p className="text-xs text-gray-400 text-center mt-1">
          צמיחה של ({growthPercent}%) x{growthMultiple.toFixed(1)}
        </p>
      </div>

      {/* Monthly pension estimate */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-3 text-center">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-emerald-700">+ {pensionRating}</span>
          <span className="text-sm text-gray-600">קצבה חודשית משוערת</span>
        </div>
        <p className="text-3xl font-bold text-teal-700 tabular-nums my-2">
          {formatCurrency(monthlyPension)}₪
        </p>
        <p className="text-xs text-gray-500">
          בגיל {retirementAge} | {yearsToRetirement} שנים מהיום | גיל נוכחי {currentAge}
        </p>
      </div>

      {/* Annual return slider */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold bg-gray-100 rounded-full px-2 py-0.5 tabular-nums">{annualReturn}%</span>
          <span className="text-sm font-bold">תשואה שנתית צפויה</span>
        </div>
        <input
          type="range"
          min={0}
          max={10}
          step={0.5}
          value={annualReturn}
          onChange={(e) => setAnnualReturn(Number(e.target.value))}
          className="w-full accent-teal-600"
          dir="ltr"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-0.5">
          <span>10%</span>
          <span>0%</span>
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-0.5">
          ממוצע היסטורי של קרנות פנסיה: 4-6% שנתי נטו
        </p>
      </div>

      {/* Monthly deposit slider */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold bg-gray-100 rounded-full px-2 py-0.5 tabular-nums">{formatCurrency(monthlyDeposit)}₪</span>
          <span className="text-sm font-bold">הפקדה חודשית</span>
        </div>
        <input
          type="range"
          min={0}
          max={15000}
          step={50}
          value={monthlyDeposit}
          onChange={(e) => setMonthlyDeposit(Number(e.target.value))}
          className="w-full accent-teal-600"
          dir="ltr"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-0.5">
          <span>15,000₪</span>
          <span>0₪</span>
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-0.5">
          חובת הפקדה: 6% עובד + 6.5% מעסיק + 6% פיצויים = 18.5% מהשכר
        </p>
      </div>

      <p className="text-[10px] text-gray-300 text-center leading-relaxed">
        * חישוב לצורך המחשה בלבד, מבוסס ריבית דריבית חודשית ותוחלת חיים 85.
        אינו מהווה ייעוץ פנסיוני. לייעוץ אישי פנו ליועץ מוסמך.
      </p>
    </Section>
  );
}

// Product detail view
function ProductDetail({ card, onBack }: { card: SavingsCard; onBack: () => void }) {
  const kgm = card.rawKgm;
  const pnn = card.rawPnn;

  const netReturn = kgm?.returns?.netReturnRate ?? pnn?.returns?.netReturnRate;
  const joinDate = kgm?.joinDate ?? pnn?.joinDate;
  const beneficiaries = kgm?.beneficiaries ?? pnn?.beneficiaries ?? [];
  const hasDebt = kgm?.debt?.hasDebt || pnn?.debt?.hasDebt;
  const hasLien = kgm?.lien?.hasLien || pnn?.lien?.hasLien;
  const hasLoan = kgm?.loan?.hasLoan || pnn?.loan?.hasLoan;

  return (
    <div className="flex flex-col gap-3">
      {/* Back button */}
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-blue-700 self-start mb-1">
        <ChevronLeft className="w-4 h-4" />
        <span>חזרה</span>
      </button>

      {/* Hero */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between bg-blue-50 px-4 py-3">
          <span className="text-xs text-gray-500 bg-white rounded-full px-2 py-0.5">
            {card.status}
          </span>
          <span className="text-sm font-bold text-foreground">
            {card.productType} - {shortProviderName(card.providerName)}
          </span>
        </div>
        <div className="px-4 py-5 text-center">
          <p className="text-xs text-gray-500 mb-1">סך צבירה</p>
          <p className="text-3xl font-bold tabular-nums">{formatCurrency(card.balance)}₪</p>
          {card.investmentTrackName && (
            <p className="text-sm text-gray-500 mt-2">{card.investmentTrackName}</p>
          )}
        </div>
      </div>

      {/* Alerts */}
      {(hasDebt || hasLien || hasLoan) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800 space-y-1">
            {hasDebt && <p>קיים חוב או פיגור בחשבון</p>}
            {hasLien && <p>קיים שעבוד או עיקול</p>}
            {hasLoan && <p>קיימת הלוואה פעילה — יתרה: {formatCurrency(kgm?.loan?.loanBalance ?? pnn?.loan?.loanBalance ?? 0)}₪</p>}
          </div>
        </div>
      )}

      {/* Key financials card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="px-4 py-3 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">דמי ניהול מהפקדה</span>
            <span className="font-medium tabular-nums">{card.depositFeeRate}%</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">דמי ניהול מצבירה</span>
            <span className="font-medium tabular-nums">{card.savingsFeeRate}%</span>
          </div>
          {netReturn !== undefined && netReturn !== null && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">תשואה נטו</span>
              <span className={`font-medium tabular-nums ${netReturn >= 0 ? "text-green-700" : "text-red-600"}`}>
                {netReturn}%
              </span>
            </div>
          )}
          {joinDate && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">תאריך הצטרפות</span>
              <span className="font-medium">{formatDate(joinDate)}</span>
            </div>
          )}
        </div>
      </div>

      {/* KGM-specific: Contributions & Withdrawal */}
      {kgm && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <Section title="הפרשות ומשיכה" defaultOpen={false}>
            <DetailRow label="הפרשת עובד" value={kgm.employeeContributionPercent ? `${kgm.employeeContributionPercent}%` : null} />
            <DetailRow label="הפרשת מעסיק" value={kgm.employerContributionPercent ? `${kgm.employerContributionPercent}%` : null} />
            {kgm.withdrawal && (
              <>
                <DetailRow label="תאריך נזילות" value={formatDate(kgm.withdrawal.eligibilityDate)} />
                <DetailRow label="סכום זמין למשיכה" value={kgm.withdrawal.eligibleAmount} />
              </>
            )}
            {kgm.projectedBalanceAtRetirement != null && kgm.projectedBalanceAtRetirement > 0 && (
              <DetailRow label="צבירה צפויה בפרישה" value={kgm.projectedBalanceAtRetirement} />
            )}
          </Section>

          {/* Severance */}
          {kgm.balanceBlocks.length > 0 && (
            <Section title="פיצויים">
              {kgm.balanceBlocks.map((b, i) => (
                <div key={i}>
                  {b.severanceCurrentEmployer > 0 && (
                    <DetailRow label="פיצויים מעסיק נוכחי" value={b.severanceCurrentEmployer} />
                  )}
                  {b.severancePreviousEmployers > 0 && (
                    <DetailRow label="פיצויים מעסיקים קודמים" value={b.severancePreviousEmployers} />
                  )}
                </div>
              ))}
              {kgm.employmentTerms?.clause14 === "1" && (
                <div className="text-xs text-blue-700 bg-blue-50 rounded px-2 py-1 mt-1">
                  סעיף 14 חל על חשבון זה
                </div>
              )}
            </Section>
          )}
        </div>
      )}

      {/* PNN-specific: Pension projections & coverage */}
      {pnn && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {pnn.projections.length > 0 && (
            <Section title="תחזית פנסיה" defaultOpen>
              {pnn.projections.map((proj, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">גיל פרישה</span>
                    <span className="font-medium">{proj.retirementAge}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">קצבה חודשית צפויה</span>
                    <span className="font-bold tabular-nums">{formatCurrency(proj.projectedMonthlyPension)}₪</span>
                  </div>
                  {proj.totalAccumulated > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">צבירה צפויה</span>
                      <span className="font-medium tabular-nums">{formatCurrency(proj.totalAccumulated)}₪</span>
                    </div>
                  )}
                  {proj.returnRate != null && proj.returnRate > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">ריבית תחזית</span>
                      <span className="font-medium tabular-nums">{proj.returnRate}%</span>
                    </div>
                  )}
                </div>
              ))}
            </Section>
          )}

          {(pnn.coverage || pnn.survivorPension) && (
            <Section title="כיסויים ביטוחיים">
              {pnn.coverage && (
                <>
                  <DetailRow label="עלות כיסוי נכות" value={pnn.coverage.disabilityCost > 0 ? `${pnn.coverage.disabilityCost}₪` : null} />
                  <DetailRow label="עלות כיסוי שארים" value={pnn.coverage.survivorsCost > 0 ? `${pnn.coverage.survivorsCost}₪` : null} />
                </>
              )}
              {pnn.survivorPension && (
                <>
                  <DetailRow label="קצבת שארים — בן/בת זוג" value={pnn.survivorPension.spousePension > 0 ? `${formatCurrency(pnn.survivorPension.spousePension)}₪` : null} />
                  <DetailRow label="קצבת שארים — יתומים" value={pnn.survivorPension.orphanPension > 0 ? `${formatCurrency(pnn.survivorPension.orphanPension)}₪` : null} />
                </>
              )}
            </Section>
          )}
        </div>
      )}

      {/* Beneficiaries */}
      {beneficiaries.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <Section title="מוטבים">
            {formatBeneficiaries(beneficiaries).map((b, i) => (
              <p key={i} className="text-sm text-gray-700">{b}</p>
            ))}
          </Section>
        </div>
      )}

      {/* Pension Simulator — only for pension products */}
      {pnn && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <PensionSimulator currentBalance={card.balance} />
        </div>
      )}

    </div>
  );
}

function buildSavingsCards(kgmFiles: ParsedKGM[], pnnFiles: ParsedPNN[]): SavingsCard[] {
  const cards: SavingsCard[] = [];

  let idx = 0;
  for (const file of kgmFiles) {
    for (const p of file.products) {
      const isHistalmut = (p.planName || "").includes("השתלמות");
      const type = isHistalmut ? "קרן השתלמות" : "קופת גמל";
      cards.push({
        id: `kgm-${idx++}`,
        productType: type,
        providerName: p.providerName || "",
        status: p.status === "1" ? "פעיל" : "לא פעיל",
        balance: p.totalBalance,
        depositFeeRate: p.fees?.depositFeeRate ?? 0,
        savingsFeeRate: p.fees?.savingsFeeRate ?? 0,
        investmentTrackName: p.planName || (p.tracks.length > 0 ? p.tracks[0].trackName : ""),
        rawKgm: p,
      });
    }
  }

  for (const file of pnnFiles) {
    for (const p of file.products) {
      const balance = p.investmentTracks.reduce((s, t) => s + t.balance, 0);
      cards.push({
        id: `pnn-${idx++}`,
        productType: "קרן פנסיה",
        providerName: p.providerName || "",
        status: p.status === "1" ? "פעיל" : "לא פעיל",
        balance,
        depositFeeRate: p.fees?.depositFeeRate ?? 0,
        savingsFeeRate: p.fees?.savingsFeeRate ?? 0,
        investmentTrackName: p.planName || (p.investmentTracks.length > 0 ? p.investmentTracks[0].trackName : ""),
        rawPnn: p,
      });
    }
  }

  return cards.sort((a, b) => b.balance - a.balance);
}

export default function MockPage() {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [segments, setSegments] = useState<Segment[]>([]);
  const [total, setTotal] = useState(0);
  const [savingsCards, setSavingsCards] = useState<SavingsCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<SavingsCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [insuranceCategories, setInsuranceCategories] = useState<InsuranceCategory[]>([]);
  const [insuranceTotal, setInsuranceTotal] = useState(0);
  const [insuranceLoading, setInsuranceLoading] = useState(true);
  const [insuranceRecords, setInsuranceRecords] = useState<HarHabituachRecord[]>([]);
  const [selectedInsuranceType, setSelectedInsuranceType] = useState<string | null>(null);
  const [inpFiles, setInpFiles] = useState<ParsedINP[]>([]);

  useEffect(() => {
    async function loadSavings() {
      try {
        const res = await fetch("/api/mock-data");
        const files: { name: string; content: string }[] = await res.json();

        const kgmFiles: ParsedKGM[] = [];
        const pnnFiles: ParsedPNN[] = [];
        const parsedInpFiles: ParsedINP[] = [];

        for (const f of files) {
          try {
            const parsed = parseXMLFile(f.content, f.name);
            if (parsed.type === "KGM") kgmFiles.push(parsed);
            else if (parsed.type === "PNN") pnnFiles.push(parsed);
            else if (parsed.type === "INP") parsedInpFiles.push(parsed);
          } catch {
            console.warn("Failed to parse", f.name);
          }
        }

        const segs = buildSegments(kgmFiles, pnnFiles);
        setSegments(segs);
        setTotal(segs.reduce((s, seg) => s + seg.amount, 0));
        setSavingsCards(buildSavingsCards(kgmFiles, pnnFiles));
        setInpFiles(parsedInpFiles);
      } catch (e) {
        setError(e instanceof Error ? e.message : "שגיאה בטעינת נתונים");
      } finally {
        setLoading(false);
      }
    }

    async function loadInsurance() {
      try {
        const res = await fetch("/api/mock-data/insurance");
        const { records }: { records: HarHabituachRecord[] } = await res.json();
        setInsuranceRecords(records);
        const cats = buildInsuranceCategories(records);
        setInsuranceCategories(cats);
        setInsuranceTotal(Math.round(cats.reduce((s, c) => s + c.monthlyPremium, 0)));
      } catch {
        console.warn("Failed to load insurance data");
      } finally {
        setInsuranceLoading(false);
      }
    }

    loadSavings();
    loadInsurance();
  }, []);

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      {/* ELIDO branded header */}
      <header className="bg-gradient-to-l from-[#0d9488] to-[#1e3a5f] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </button>
            <button className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </button>
            <button className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-white font-bold text-lg leading-tight">ELIDO</p>
              <p className="text-white/80 text-xs">סוכנות לביטוח ופיננסים</p>
            </div>
            <Image
              src="/ELIDO.jpeg"
              alt="ELIDO"
              width={44}
              height={44}
              className="rounded-full border-2 border-white/30"
            />
          </div>
        </div>
      </header>

      {/* Greeting */}
      <div className="px-4 pt-3 pb-2 text-right">
        <span className="text-lg font-semibold text-foreground">שלום, זיו 👋</span>
      </div>

      {/* Scrollable content */}
      <main className="flex-1 overflow-y-auto pb-20 px-4">

        {/* בית - Home (donut overview) */}
        {activeTab === "home" && (
          <>
            <h1 className="text-xl font-bold text-center mb-6">החסכונות שלך</h1>

            {loading && (
              <div className="flex justify-center py-12">
                <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full" />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {!loading && !error && segments.length > 0 && (
              <>
                <div className="py-4">
                  <DonutChart segments={segments} total={total} />
                </div>

                <table className="mt-6 w-full text-sm">
                  <tbody>
                    {segments.map((seg, idx) => {
                      const pct = total > 0 ? ((seg.amount / total) * 100).toFixed(0) : "0";
                      return (
                        <tr key={`${idx}-${seg.label}`}>
                          <td className="py-1.5 pe-2 w-4">
                            <span
                              className="inline-block w-3 h-3 rounded-full"
                              style={{ backgroundColor: seg.color }}
                            />
                          </td>
                          <td className="py-1.5 pe-2 text-start font-medium text-foreground">
                            {seg.label}
                          </td>
                          <td className="py-1.5 pe-2 text-start tabular-nums font-semibold text-gray-500">
                            {pct}%
                          </td>
                          <td className="py-1.5 text-start tabular-nums text-gray-500">
                            {formatCurrency(seg.amount)}₪
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </>
            )}

            {!loading && !error && segments.length === 0 && (
              <p className="text-center text-gray-500 py-12">לא נמצאו נתוני חסכון</p>
            )}
          </>
        )}

        {/* חסכונות - Savings */}
        {activeTab === "savings" && (
          <>
            {loading && (
              <div className="flex justify-center py-12">
                <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full" />
              </div>
            )}

            {/* Detail view */}
            {!loading && selectedCard && (
              <ProductDetail card={selectedCard} onBack={() => setSelectedCard(null)} />
            )}

            {/* Card list */}
            {!loading && !selectedCard && savingsCards.length > 0 && (
              <div className="flex flex-col gap-4">
                {savingsCards.map((card) => {
                  const depositQ = feeQuality(card.depositFeeRate, "deposit");
                  const savingsQ = feeQuality(card.savingsFeeRate, "savings");
                  return (
                    <div key={card.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                      {/* Gradient header */}
                      <div className="flex items-center justify-between bg-gradient-to-l from-[#1e3a5f] to-[#0d9488] px-4 py-4">
                        <span className="text-xs text-white/70 truncate max-w-[80px]">{card.investmentTrackName?.split(" ").slice(0, 2).join(" ")}...</span>
                        <span className="text-sm font-bold text-white text-right leading-snug">
                          {card.productType} - {shortProviderName(card.providerName)}<br />
                          <span className="text-xs font-normal text-white/70">וקופות גמל</span>
                        </span>
                      </div>

                      <div className="px-4 py-3 space-y-3">
                        {/* Balance */}
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                          <span className="text-sm text-gray-600">צבירה</span>
                          <span className="text-xl font-bold tabular-nums text-teal-700">{formatCurrency(card.balance)}₪</span>
                        </div>
                        {/* Deposit fee */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">דמי ניהול מהפקדה</span>
                          <div className="flex items-center gap-2">
                            {depositQ && (
                              <span className={`text-xs font-bold ${depositQ.color}`}>{depositQ.icon} {depositQ.label}</span>
                            )}
                            <span className="text-base font-semibold tabular-nums">{card.depositFeeRate}%</span>
                          </div>
                        </div>
                        {/* Savings fee */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">דמי ניהול מצבירה</span>
                          <div className="flex items-center gap-2">
                            {savingsQ && (
                              <span className={`text-xs font-bold ${savingsQ.color}`}>{savingsQ.icon} {savingsQ.label}</span>
                            )}
                            <span className="text-base font-semibold tabular-nums">{card.savingsFeeRate}%</span>
                          </div>
                        </div>
                        {/* Investment track */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">מסלול השקעה</span>
                          <span className="text-sm text-gray-700">{card.investmentTrackName}</span>
                        </div>
                      </div>

                      <div className="px-4 pb-4 pt-1">
                        <button
                          onClick={() => setSelectedCard(card)}
                          className="w-full bg-[#1e3a5f] text-white text-sm font-medium rounded-full py-3"
                        >
                          לכל הפרטים
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!loading && !selectedCard && savingsCards.length === 0 && (
              <p className="text-center text-gray-500 py-12">לא נמצאו נתוני חסכון</p>
            )}
          </>
        )}

        {/* ביטוחים - Insurance */}
        {activeTab === "insurance" && (
          <>
            {insuranceLoading && (
              <div className="flex justify-center py-12">
                <div className="animate-spin w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full" />
              </div>
            )}

            {/* Drill-down: individual policies for a category */}
            {!insuranceLoading && selectedInsuranceType && (() => {
              const policies = insuranceRecords.filter((r) => {
                const type = String(r["ענף ראשי"] ?? "").trim();
                const normalized = type === "אבדן כושר עבודה" ? "ביטוח חיים" : type;
                return normalized === selectedInsuranceType;
              });
              const catIcon = INSURANCE_TYPE_CONFIG[selectedInsuranceType]?.icon ?? Shield;
              const CatIcon = catIcon;

              return (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setSelectedInsuranceType(null)}
                    className="flex items-center gap-1 text-sm text-teal-700 self-start mb-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>חזרה</span>
                  </button>

                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center">
                      <CatIcon className="w-5 h-5 text-teal-700" />
                    </div>
                    <h2 className="text-lg font-bold">{selectedInsuranceType}</h2>
                    <span className="text-xs text-gray-500">({policies.length} פוליסות)</span>
                  </div>

                  {policies.map((policy, i) => {
                    const company = String(policy["שם חברה"] ?? policy["חברה"] ?? "").trim();
                    const policyNum = String(policy["מספר פוליסה"] ?? "").trim();
                    const premium = Number(policy["פרמיה בש\"ח"]) || 0;
                    const premiumType = String(policy["סוג פרמיה"] ?? "").trim();
                    const monthlyPremium = premiumType === "שנתית" ? premium / 12 : premium;
                    const status = String(policy["סטטוס"] ?? policy["סטטוס פוליסה"] ?? "פעיל").trim();
                    const startDate = String(policy["תאריך תחילה"] ?? "").trim();
                    const endDate = String(policy["תאריך סיום"] ?? "").trim();
                    const subBranch = String(policy["ענף משנה"] ?? "").trim();

                    return (
                      <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                        {/* Gradient header */}
                        <div className="flex items-center justify-between bg-gradient-to-l from-[#1e3a5f] to-[#0d9488] px-4 py-3">
                          <span className="text-xs text-white/70">{policyNum ? `פוליסה ${policyNum}` : ""}</span>
                          <span className="text-sm font-bold text-white">{company || selectedInsuranceType}</span>
                        </div>

                        <div className="px-4 py-3 space-y-2.5">
                          {/* Monthly premium */}
                          <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                            <span className="text-sm text-gray-600">פרמיה חודשית</span>
                            <span className="text-lg font-bold tabular-nums text-teal-700">
                              {formatCurrency(Math.round(monthlyPremium))}₪
                            </span>
                          </div>

                          {subBranch && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">ענף משנה</span>
                              <span className="text-sm text-gray-700">{subBranch}</span>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">סטטוס</span>
                            <span className={`text-xs font-bold rounded-full px-2 py-0.5 ${
                              status.includes("פעיל") || status === "1"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-gray-100 text-gray-600"
                            }`}>
                              {status.includes("פעיל") || status === "1" ? "פעיל" : status}
                            </span>
                          </div>

                          {startDate && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">תאריך תחילה</span>
                              <span className="text-sm text-gray-700">{startDate}</span>
                            </div>
                          )}

                          {endDate && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">תאריך סיום</span>
                              <span className="text-sm text-gray-700">{endDate}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Category grid */}
            {!insuranceLoading && !selectedInsuranceType && (
              <>
                <h1 className="text-xl font-bold text-center mb-2">הביטוחים שלך</h1>
                <p className="text-center text-sm text-gray-500 mb-4">
                  סה&quot;כ {formatCurrency(insuranceTotal)}₪ / חודש
                </p>

                {insuranceCategories.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {insuranceCategories.map((cat) => {
                      const Icon = cat.icon;
                      const policyCount = insuranceRecords.filter((r) => {
                        const type = String(r["ענף ראשי"] ?? "").trim();
                        const normalized = type === "אבדן כושר עבודה" ? "ביטוח חיים" : type;
                        return normalized === cat.type;
                      }).length;

                      return (
                        <button
                          key={cat.type}
                          onClick={() => setSelectedInsuranceType(cat.type)}
                          className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm text-right"
                        >
                          <div className="flex items-center gap-3 p-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-bl from-[#1e3a5f] to-[#0d9488] flex items-center justify-center shrink-0">
                              <Icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <ChevronLeft className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-bold text-foreground">{cat.type}</span>
                              </div>
                              <div className="flex items-center justify-between mt-0.5">
                                <span className="text-xs text-gray-400">{policyCount} פוליסות</span>
                                <span className="text-sm font-semibold tabular-nums text-teal-700">
                                  {formatCurrency(Math.round(cat.monthlyPremium))}₪ / חודש
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-12">לא נמצאו נתוני ביטוח</p>
                )}
              </>
            )}
          </>
        )}

        {/* המלצות - Recommendations */}
        {activeTab === "recommendations" && (() => {
          const allLoaded = !loading && !insuranceLoading;
          const renewalAlerts = getRenewalAlerts(inpFiles);
          const okChecks = [
            {
              id: "health",
              title: "ביטוח בריאות",
              description: "יש לך ביטוח בריאות פעיל — כיסוי חיוני קיים.",
              icon: HeartPulse,
            },
            {
              id: "life",
              title: "ביטוח חיים",
              description: "יש לך ביטוח חיים פעיל — חיוני למשפחה עם בן/בת זוג.",
              icon: ShieldCheck,
            },
          ];
          const warnings = [
            {
              id: "dup-health",
              title: "כפילות ביטוח בריאות",
              description: "נמצאו 6 פוליסות בריאות. כפילות עלולה להיות מיותרת ולייקר את ההוצאה החודשית.",
              icon: Copy,
            },
          ];

          return (
            <>
              {/* AI scan header */}
              <div className="bg-gradient-to-bl from-[#1e3a5f] to-[#0d9488] rounded-2xl p-5 mb-4 shadow-md">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-white" />
                  <span className="text-sm font-bold text-white">סריקת כיסוי ביטוחי</span>
                </div>
                {!allLoaded ? (
                  <div className="flex items-center gap-3">
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    <span className="text-sm text-white/80">סורק את הנתונים שלך...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-white/80 text-sm leading-relaxed mb-3 text-right">
                      בדקנו את הכיסוי הביטוחי שלך מול מצבך האישי כנשוי/אה.
                    </p>
                    <div className="flex gap-3">
                      <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur rounded-full px-3 py-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                        <span className="text-xs font-bold text-white">{okChecks.length} תקין</span>
                      </div>
                      {warnings.length > 0 && (
                        <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur rounded-full px-3 py-1">
                          <AlertTriangle className="w-4 h-4 text-yellow-300" />
                          <span className="text-xs font-bold text-white">{warnings.length} לטיפול</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Insurance Renewal Block */}
              {allLoaded && renewalAlerts.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-orange-700" />
                    <span className="text-sm font-bold text-orange-800">חידוש ביטוח</span>
                  </div>
                  <p className="text-xs text-orange-600 mb-3 text-right">
                    הפוליסות הבאות מתחדשות בקרוב — הזדמנות לבדוק תנאים ומחירים עם הסוכן
                  </p>
                  <div className="flex flex-col gap-3">
                    {renewalAlerts.map((alert, i) => {
                      const tier = getUrgencyTier(alert.daysRemaining);
                      return (
                        <div
                          key={i}
                          className={`bg-white rounded-xl border ${tier.border} overflow-hidden shadow-sm`}
                        >
                          <div className="flex items-start gap-3 p-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-[10px] font-bold ${tier.badgeBg} ${tier.text} rounded-full px-2 py-0.5`}>
                                  {tier.label} — {alert.daysRemaining} ימים
                                </span>
                                <span className="text-sm font-bold text-gray-800">
                                  {alert.planName || `פוליסה #${alert.policyNumber}`}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 text-right">
                                {alert.providerName} • פוליסה {alert.policyNumber}
                              </p>
                              <p className="text-xs text-gray-500 text-right mt-0.5">
                                תוקף הטבה: {formatDate(alert.endDate)}
                              </p>
                            </div>
                            <div className={`w-10 h-10 rounded-full ${tier.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                              <AlertTriangle className={`w-5 h-5 ${tier.text}`} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* OK checks — green cards */}
              {allLoaded && (
                <div className="flex flex-col gap-3">
                  {okChecks.map((rec) => {
                    const Icon = rec.icon;
                    return (
                      <div
                        key={rec.id}
                        className="bg-emerald-50/50 rounded-2xl border border-emerald-200 overflow-hidden shadow-sm"
                      >
                        <div className="flex items-start gap-3 p-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-1 bg-emerald-100 rounded-full px-2 py-0.5">
                                <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                <span className="text-[10px] font-bold text-emerald-700">תקין</span>
                              </div>
                              <span className="text-sm font-bold text-emerald-700">{rec.title}</span>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed text-right">{rec.description}</p>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                            <Icon className="w-5 h-5 text-emerald-700" />
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Warning cards — yellow */}
                  {warnings.map((rec) => {
                    const Icon = rec.icon;
                    return (
                      <div
                        key={rec.id}
                        className="bg-yellow-50/50 rounded-2xl border border-yellow-300 overflow-hidden shadow-sm"
                      >
                        <div className="flex items-start gap-3 p-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-1 bg-yellow-100 rounded-full px-2 py-0.5">
                                <AlertTriangle className="w-3 h-3 text-yellow-700" />
                                <span className="text-[10px] font-bold text-yellow-700">לבדיקה</span>
                              </div>
                              <span className="text-sm font-bold text-yellow-800">{rec.title}</span>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed text-right">{rec.description}</p>
                            <button className="mt-3 flex items-center gap-2 bg-teal-600 text-white text-xs font-medium rounded-full px-4 py-2">
                              <Phone className="w-3.5 h-3.5" />
                              <span>דבר/י עם הסוכן</span>
                            </button>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center shrink-0 mt-0.5">
                            <Icon className="w-5 h-5 text-yellow-700" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          );
        })()}
      </main>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around items-center h-16">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 min-w-[64px] transition-colors ${
                  isActive ? "text-blue-700" : "text-gray-400"
                }`}
              >
                <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
