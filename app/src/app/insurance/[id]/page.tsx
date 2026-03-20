"use client";

import { useParams } from "next/navigation";
import { useAppContext } from "@/lib/context";
import Navbar from "@/components/Navbar";
import Card from "@/components/Card";
import {
  formatCurrency,
  formatDate,
  formatPercent,
  statusLabel,
  feeTypeLabel,
  contributionTypeLabel,
} from "@/lib/format";
import StatusBadge from "@/components/dashboard/StatusBadge";
import ErrorBoundary from "@/components/dashboard/ErrorBoundary";
import Link from "next/link";
import type {
  InsuranceProduct,
  InsuranceCoverage,
  Beneficiary,
  FeeActual,
  FeeStructureEntry,
  Deposit,
} from "@/lib/types";

/* ─── Summary Card (matches savings page pattern) ─── */
function SummaryCard({
  label,
  value,
  accent,
  negative,
  warning,
}: {
  label: string;
  value: string;
  accent?: boolean;
  negative?: boolean;
  warning?: boolean;
}) {
  return (
    <div
      className={`rounded-lg p-3 text-center ${
        accent
          ? "bg-[var(--primary)] text-white"
          : warning
          ? "bg-amber-50 border border-amber-200"
          : "bg-gray-50"
      }`}
    >
      <p
        className={`text-xs mb-1 ${
          accent ? "text-white/70" : "text-gray-500"
        }`}
      >
        {label}
      </p>
      <p
        className={`text-lg font-bold tabular-nums ${
          accent
            ? "text-white"
            : negative
            ? "text-red-600"
            : warning
            ? "text-amber-700"
            : "text-[var(--primary)]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

/* ─── Coverage Card (enhanced design) ─── */
function CoverageDetailCard({ coverage }: { coverage: InsuranceCoverage }) {
  const hasIssues = coverage.hasExclusion || coverage.approvalStatus === "2";
  const borderColor = hasIssues
    ? "border-amber-300"
    : coverage.isUnderwritten
    ? "border-green-300"
    : "border-gray-200";

  return (
    <div
      className={`bg-white border-2 ${borderColor} rounded-xl p-4 transition-all hover:shadow-md`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <h5 className="font-bold text-sm text-[var(--primary)] leading-tight">
          {coverage.coverageName || `כיסוי ${coverage.coverageCode}`}
        </h5>
      </div>

      {/* Key Numbers */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {coverage.insuranceAmount > 0 && (
          <div className="bg-blue-50 rounded-lg p-2.5">
            <p className="text-xs text-gray-500 mb-0.5">סכום ביטוח</p>
            <p className="font-bold text-sm tabular-nums text-[var(--primary)]">
              {formatCurrency(coverage.insuranceAmount)}
            </p>
          </div>
        )}
        <div className="bg-gray-50 rounded-lg p-2.5">
          <p className="text-xs text-gray-500 mb-0.5">פרמיה חודשית</p>
          <p className="font-bold text-sm tabular-nums text-[var(--primary)]">
            {formatCurrency(coverage.premium)}
          </p>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {coverage.isUnderwritten && (
          <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-medium">
            חיתום מלא
          </span>
        )}
        {!coverage.hasExclusion && (
          <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-medium">
            ללא החרגות
          </span>
        )}
        {coverage.hasExclusion && (
          <span className="text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full font-medium">
            קיימת החרגה
          </span>
        )}
        {coverage.hasDiscount && (
          <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
            הנחה {formatPercent(coverage.discountRate)}
            {coverage.discountEndDate &&
              ` עד ${formatDate(coverage.discountEndDate)}`}
          </span>
        )}
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-2 text-xs border-t pt-3">
        {coverage.payer && (
          <div>
            <span className="text-gray-400">משלם:</span>
            <p className="font-medium text-gray-700">{coverage.payer}</p>
          </div>
        )}
        {coverage.paymentMethod && (
          <div>
            <span className="text-gray-400">אופן תשלום:</span>
            <p className="font-medium text-gray-700">
              {coverage.paymentMethod}
            </p>
          </div>
        )}
        {coverage.approvalStatus && (
          <div>
            <span className="text-gray-400">סטטוס אישור:</span>
            <p className="font-medium text-gray-700">
              {coverage.approvalStatus === "1" ? "מאושר" : coverage.approvalStatus}
            </p>
          </div>
        )}
      </div>

      {/* Coverage-level Beneficiaries */}
      {coverage.beneficiaries && coverage.beneficiaries.length > 0 && (
        <div className="border-t pt-3 mt-3">
          <p className="text-xs font-semibold text-gray-500 mb-1.5">
            מוטבים לכיסוי:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {coverage.beneficiaries.map((b, i) => (
              <span
                key={i}
                className="text-xs bg-gray-100 px-2 py-1 rounded-lg"
              >
                {b.firstName} {b.lastName} ({formatPercent(b.percentage)})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Alerts Section ─── */
function AlertsSection({ product }: { product: InsuranceProduct }) {
  const alerts: { type: "error" | "warning" | "info"; text: string; detail?: string }[] = [];

  if (product.debt?.hasDebt) {
    alerts.push({
      type: "error",
      text: "קיים חוב / פיגור בתשלום",
      detail: product.debt.totalDebt
        ? `סכום חוב: ${formatCurrency(product.debt.totalDebt)}`
        : undefined,
    });
  }
  if (product.lien?.hasLien) {
    alerts.push({ type: "warning", text: "קיים שעבוד על הפוליסה" });
  }
  if (product.lien?.hasAttachment) {
    alerts.push({ type: "warning", text: "קיים עיקול על הפוליסה" });
  }
  if (product.loan?.hasLoan) {
    alerts.push({
      type: "info",
      text: "קיימת הלוואה",
      detail: [
        product.loan.loanBalance
          ? `יתרה: ${formatCurrency(product.loan.loanBalance)}`
          : null,
        product.loan.interestRate
          ? `ריבית: ${formatPercent(product.loan.interestRate)}`
          : null,
        product.loan.repaymentAmount
          ? `החזר: ${formatCurrency(product.loan.repaymentAmount)}`
          : null,
      ]
        .filter(Boolean)
        .join(" | "),
    });
  }
  if (product.claim?.hasClaim) {
    alerts.push({
      type: "info",
      text: `תביעה פתוחה${product.claim.claimNumber ? ` #${product.claim.claimNumber}` : ""}`,
      detail: product.claim.claimStatus || undefined,
    });
  }
  if (product.withdrawalPenalty) {
    alerts.push({ type: "warning", text: "קנס על משיכת כספים" });
  }

  // Check for missing beneficiaries
  const hasBeneficiaries =
    (product.beneficiaries && product.beneficiaries.length > 0) ||
    product.coverages.some(
      (c) => c.beneficiaries && c.beneficiaries.length > 0
    );
  if (!hasBeneficiaries) {
    alerts.push({
      type: "error",
      text: "לא הוגדרו מוטבים!",
      detail: "מומלץ לפנות לסוכן הביטוח להגדרת מוטבים",
    });
  }

  if (alerts.length === 0) return null;

  const colorMap = {
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  const iconMap = {
    error: "⚠️",
    warning: "⚡",
    info: "ℹ️",
  };

  return (
    <div className="space-y-2">
      {alerts.map((alert, i) => (
        <div
          key={i}
          className={`rounded-xl border-2 p-4 ${colorMap[alert.type]}`}
        >
          <div className="flex items-start gap-2">
            <span className="text-lg leading-none">{iconMap[alert.type]}</span>
            <div>
              <p className="font-semibold text-sm">{alert.text}</p>
              {alert.detail && (
                <p className="text-sm mt-0.5 opacity-80">{alert.detail}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Main Detail Page ─── */
export default function InsuranceDetailPage() {
  const params = useParams();
  const { state } = useAppContext();
  const id = params.id as string;

  // Parse composite ID: "fileIndex-productIndex"
  const [fileIdxStr, productIdxStr] = id.split("-");
  const fileIdx = parseInt(fileIdxStr, 10);
  const productIdx = parseInt(productIdxStr, 10);

  const file = state.inpFiles[fileIdx];
  const product = file?.products?.[productIdx];

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link
            href="/insurance"
            className="text-sm text-[var(--secondary)] hover:underline mb-4 inline-block"
          >
            → חזרה לרשימת הפוליסות
          </Link>
          <Card className="text-center py-12">
            <p className="text-gray-500">
              לא נמצאה פוליסה. ייתכן שהנתונים לא נטענו.
            </p>
            <Link
              href="/insurance"
              className="text-[var(--secondary)] hover:underline mt-4 inline-block"
            >
              חזרה לדף הביטוח
            </Link>
          </Card>
        </div>
      </>
    );
  }

  const status = statusLabel(product.status);
  const activeCoverages = product.coverages.filter(
    (c) => c.premium > 0 || c.insuranceAmount > 0
  );
  const totalCoverageAmount = product.coverages.reduce(
    (sum, c) => sum + c.insuranceAmount,
    0
  );

  const hasAlerts =
    product.debt?.hasDebt ||
    product.lien?.hasLien ||
    product.lien?.hasAttachment ||
    product.loan?.hasLoan ||
    product.claim?.hasClaim ||
    product.withdrawalPenalty;

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Link
          href="/insurance"
          className="text-sm text-[var(--secondary)] hover:underline mb-4 inline-block"
        >
          → חזרה לרשימת הפוליסות
        </Link>

        <ErrorBoundary>
          <Card className="space-y-6">
            {/* ===== Section 1: Policy Header ===== */}
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div>
                <h1 className="font-bold text-2xl text-[var(--primary)]">
                  {product.planName ||
                    `פוליסה #${product.policyNumber || "ללא מספר"}`}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {product.providerName || product.providerCode}
                  {product.policyNumber && ` | פוליסה ${product.policyNumber}`}
                  {product.policyType && ` | סוג: ${product.policyType}`}
                </p>
                {product.joinDate && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    הצטרפות: {formatDate(product.joinDate)}
                    {product.firstJoinDate &&
                      product.firstJoinDate !== product.joinDate &&
                      ` (ראשונה: ${formatDate(product.firstJoinDate)})`}
                  </p>
                )}
                {product.employer && (
                  <p className="text-sm text-gray-500 mt-1">
                    מעסיק: {product.employer.name}
                    {product.employer.city
                      ? ` — ${product.employer.city}`
                      : ""}
                  </p>
                )}
              </div>
              <StatusBadge
                status={
                  product.status === "1"
                    ? "active"
                    : product.status === "2"
                    ? "missing"
                    : "expired"
                }
                label={status.label}
              />
            </div>

            {/* ===== Section 2: Summary Cards ===== */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <SummaryCard
                label="פרמיה חודשית"
                value={formatCurrency(product.totalInsurancePremium)}
                accent
              />
              <SummaryCard
                label="כיסויים פעילים"
                value={`${activeCoverages.length}`}
              />
              <SummaryCard
                label="סה״כ סכום ביטוח"
                value={
                  totalCoverageAmount > 0
                    ? formatCurrency(totalCoverageAmount)
                    : "—"
                }
              />
              <SummaryCard
                label="דמי ניהול"
                value={
                  product.fees
                    ? formatCurrency(product.fees.totalFees)
                    : "—"
                }
              />
              <SummaryCard
                label="הפקדה אחרונה"
                value={formatDate(product.lastDepositDate)}
              />
              <SummaryCard
                label="התראות"
                value={hasAlerts ? "יש התראות" : "תקין"}
                warning={!!hasAlerts}
              />
            </div>

            {/* ===== Section 3: Alerts (if any) ===== */}
            <AlertsSection product={product} />

            {/* ===== Section 4: Coverages — The Hero Section ===== */}
            {product.coverages.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 border-b pb-1 mb-4 text-lg">
                  כיסויים ביטוחיים ({product.coverages.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {product.coverages.map((cov, ci) => (
                    <CoverageDetailCard key={ci} coverage={cov} />
                  ))}
                </div>
              </div>
            )}

            {/* ===== Section 5: Fee Breakdown ===== */}
            {(product.fees || product.feeStructure.length > 0) && (
              <div>
                <h4 className="font-semibold text-gray-800 border-b pb-1 mb-3">
                  דמי ניהול ועמלות
                </h4>

                {product.fees && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-500 text-xs">דמי ניהול מהפקדה</p>
                      <p className="font-semibold tabular-nums">
                        {formatPercent(product.fees.depositFeeRate)}
                      </p>
                      <p className="text-xs text-gray-400 tabular-nums">
                        {formatCurrency(product.fees.depositFeeTotal)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-500 text-xs">דמי ניהול מצבירה</p>
                      <p className="font-semibold tabular-nums">
                        {formatPercent(product.fees.savingsFeeRate)}
                      </p>
                      <p className="text-xs text-gray-400 tabular-nums">
                        {formatCurrency(product.fees.savingsFeeTotal)}
                      </p>
                    </div>
                    {product.fees.otherFees > 0 && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-gray-500 text-xs">עמלות נוספות</p>
                        <p className="font-semibold tabular-nums">
                          {formatCurrency(product.fees.otherFees)}
                        </p>
                      </div>
                    )}
                    <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                      <p className="text-gray-600 text-xs font-medium">
                        סה״כ עמלות
                      </p>
                      <p className="font-bold tabular-nums text-[var(--primary)]">
                        {formatCurrency(product.fees.totalFees)}
                      </p>
                    </div>
                  </div>
                )}

                {product.feeStructure.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-gray-500">
                          <th className="text-right py-2 pr-2 font-medium">
                            סוג דמי ניהול
                          </th>
                          <th className="text-right py-2 font-medium">
                            שיעור
                          </th>
                          <th className="text-right py-2 font-medium">
                            סוג הפקדה
                          </th>
                          <th className="text-right py-2 font-medium">הנחה</th>
                          <th className="text-right py-2 font-medium">
                            תום הנחה
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {product.feeStructure.map((fs, i) => (
                          <tr key={i} className="border-b border-gray-100">
                            <td className="py-2 pr-2">
                              {feeTypeLabel(fs.feeType)}
                            </td>
                            <td className="py-2 tabular-nums">
                              {formatPercent(fs.feeRate)}
                            </td>
                            <td className="py-2">
                              {contributionTypeLabel(fs.contributionType)}
                            </td>
                            <td className="py-2">
                              {fs.hasDiscount ? (
                                <span className="text-green-600 font-medium">
                                  {formatPercent(fs.discountPercent)} הנחה
                                </span>
                              ) : (
                                <span className="text-gray-400">ללא</span>
                              )}
                            </td>
                            <td className="py-2 text-xs">
                              {fs.discountEndDate
                                ? formatDate(fs.discountEndDate)
                                : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ===== Section 6: Deposit History ===== */}
            {product.deposits && product.deposits.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 border-b pb-1 mb-3">
                  היסטוריית הפקדות
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-gray-500 text-xs">
                        <th className="text-right py-2 font-medium">תאריך</th>
                        <th className="text-right py-2 font-medium">סכום</th>
                        <th className="text-right py-2 font-medium">
                          סוג הפרשה
                        </th>
                        <th className="text-right py-2 font-medium">מפקיד</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.deposits.map((dep, di) => (
                        <tr key={di} className="border-b border-gray-100">
                          <td className="py-2">{formatDate(dep.date)}</td>
                          <td className="py-2 font-medium tabular-nums">
                            {formatCurrency(dep.amount)}
                          </td>
                          <td className="py-2 text-xs">
                            {dep.contributionType || "—"}
                          </td>
                          <td className="py-2 text-xs">
                            {dep.depositorType === "1"
                              ? "עובד"
                              : dep.depositorType === "2"
                              ? "מעסיק"
                              : dep.depositorType === "3"
                              ? "עובד + מעסיק"
                              : dep.depositorType || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ===== Section 7: Beneficiaries ===== */}
            {product.beneficiaries && product.beneficiaries.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 border-b pb-1 mb-3">
                  מוטבים
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {product.beneficiaries.map((b, bi) => (
                    <div
                      key={bi}
                      className="bg-gray-50 rounded-xl p-4 text-sm border border-gray-100"
                    >
                      <p className="font-bold text-[var(--primary)]">
                        {b.firstName} {b.lastName}
                      </p>
                      {b.idNumber && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          ת.ז: ****{b.idNumber.slice(-4)}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        {b.percentage != null && (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                              <div
                                className="bg-[var(--secondary)] h-2 rounded-full"
                                style={{
                                  width: `${Math.min(b.percentage, 100)}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-semibold tabular-nums">
                              {formatPercent(b.percentage)}
                            </span>
                          </div>
                        )}
                      </div>
                      {b.definition && (
                        <p className="text-gray-500 text-xs mt-1.5">
                          {b.definition}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== Section 8: Additional Details ===== */}
            <div>
              <h4 className="font-semibold text-gray-800 border-b pb-1 mb-3">
                פרטים נוספים
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-sm">
                {product.contributionPercent > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500 text-xs">אחוז הפרשה</p>
                    <p className="font-semibold tabular-nums">
                      {formatPercent(product.contributionPercent)}
                    </p>
                  </div>
                )}
                {product.subAnnualRate > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500 text-xs">ריבית תת-שנתית</p>
                    <p className="font-semibold tabular-nums">
                      {formatPercent(product.subAnnualRate)}
                    </p>
                  </div>
                )}
                {product.indexBasis != null && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500 text-xs">מדד בסיס</p>
                    <p className="font-semibold tabular-nums">
                      {product.indexBasis}
                    </p>
                  </div>
                )}
                {product.statusUpdateDate && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500 text-xs">עדכון סטטוס אחרון</p>
                    <p className="font-semibold">
                      {formatDate(product.statusUpdateDate)}
                    </p>
                  </div>
                )}
                {product.planType && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500 text-xs">סוג תוכנית</p>
                    <p className="font-semibold">{product.planType}</p>
                  </div>
                )}
              </div>
            </div>

            {/* ===== Section 9: Employer ===== */}
            {product.employer && (
              <div>
                <h4 className="font-semibold text-gray-800 border-b pb-1 mb-3">
                  פרטי מעסיק
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">שם:</span>
                    <p className="font-medium">{product.employer.name}</p>
                  </div>
                  {product.employer.idNumber && (
                    <div>
                      <span className="text-gray-500">ח.פ / ת.ז:</span>
                      <p className="font-medium">{product.employer.idNumber}</p>
                    </div>
                  )}
                  {product.employer.city && (
                    <div>
                      <span className="text-gray-500">עיר:</span>
                      <p className="font-medium">{product.employer.city}</p>
                    </div>
                  )}
                  {product.employer.phone && (
                    <div>
                      <span className="text-gray-500">טלפון:</span>
                      <p className="font-medium" dir="ltr">
                        {product.employer.phone}
                      </p>
                    </div>
                  )}
                  {product.employer.email && (
                    <div>
                      <span className="text-gray-500">דוא&quot;ל:</span>
                      <p className="font-medium" dir="ltr">
                        {product.employer.email}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        </ErrorBoundary>
      </div>
    </>
  );
}
