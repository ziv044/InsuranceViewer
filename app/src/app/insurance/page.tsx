"use client";

import { useAppContext } from "@/lib/context";
import Navbar from "@/components/Navbar";
import Card from "@/components/Card";
import { formatCurrency, formatDate, formatPercent, statusLabel } from "@/lib/format";
import { getRenewalAlerts, getUrgencyTier } from "@/lib/renewal-alerts";
import type { RenewalAlert } from "@/lib/renewal-alerts";
import StatusBadge from "@/components/dashboard/StatusBadge";
import ErrorBoundary from "@/components/dashboard/ErrorBoundary";
import Link from "next/link";
import type { InsuranceProduct, InsuranceCoverage, Beneficiary, FeeActual, FeeStructureEntry, Deposit } from "@/lib/types";

function BeneficiaryList({ beneficiaries }: { beneficiaries: Beneficiary[] }) {
  if (!beneficiaries || beneficiaries.length === 0) return null;
  return (
    <div className="mt-2">
      <p className="text-xs font-semibold text-gray-500 mb-1">מוטבים:</p>
      <div className="flex flex-wrap gap-2">
        {beneficiaries.map((b, i) => (
          <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">
            {b.firstName} {b.lastName} — {formatPercent(b.percentage)}
          </span>
        ))}
      </div>
    </div>
  );
}

function CoverageCard({ coverage }: { coverage: InsuranceCoverage }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <h5 className="font-semibold text-sm text-[var(--primary)]">
          {coverage.coverageName || `כיסוי ${coverage.coverageCode}`}
        </h5>
        <span className="text-sm font-bold tabular-nums text-[var(--primary)]">
          {formatCurrency(coverage.premium)}
          <span className="text-xs text-gray-400 font-normal mr-1">/ חודש</span>
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
        {coverage.insuranceAmount > 0 && (
          <div>
            <span className="text-gray-500">סכום ביטוח:</span>
            <p className="font-medium tabular-nums">{formatCurrency(coverage.insuranceAmount)}</p>
          </div>
        )}
        {coverage.paymentMethod && (
          <div>
            <span className="text-gray-500">אופן תשלום:</span>
            <p className="font-medium">{coverage.paymentMethod}</p>
          </div>
        )}
        {coverage.payer && (
          <div>
            <span className="text-gray-500">משלם:</span>
            <p className="font-medium">{coverage.payer}</p>
          </div>
        )}
        {coverage.approvalStatus && (
          <div>
            <span className="text-gray-500">סטטוס אישור:</span>
            <p className="font-medium">{coverage.approvalStatus}</p>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {coverage.isUnderwritten && (
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">חיתום</span>
        )}
        {coverage.hasExclusion && (
          <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded">החרגה</span>
        )}
        {coverage.hasDiscount && (
          <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">
            הנחה {formatPercent(coverage.discountRate)}
            {coverage.discountEndDate && ` עד ${formatDate(coverage.discountEndDate)}`}
          </span>
        )}
      </div>
      <BeneficiaryList beneficiaries={coverage.beneficiaries} />
    </div>
  );
}

function FeesSection({ fees, feeStructure }: { fees: FeeActual | null; feeStructure: FeeStructureEntry[] }) {
  if (!fees && feeStructure.length === 0) return null;
  return (
    <div className="mt-4 border-t pt-4">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">דמי ניהול ועמלות</h4>
      {fees && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <span className="text-gray-500 text-xs">דמי ניהול מהפקדה</span>
            <p className="font-medium tabular-nums">{formatPercent(fees.depositFeeRate)}</p>
            <p className="text-xs text-gray-400 tabular-nums">{formatCurrency(fees.depositFeeTotal)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <span className="text-gray-500 text-xs">דמי ניהול מצבירה</span>
            <p className="font-medium tabular-nums">{formatPercent(fees.savingsFeeRate)}</p>
            <p className="text-xs text-gray-400 tabular-nums">{formatCurrency(fees.savingsFeeTotal)}</p>
          </div>
          {fees.otherFees > 0 && (
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-gray-500 text-xs">עמלות נוספות</span>
              <p className="font-medium tabular-nums">{formatCurrency(fees.otherFees)}</p>
            </div>
          )}
          <div className="bg-gray-50 rounded-lg p-3">
            <span className="text-gray-500 text-xs">סה"כ עמלות</span>
            <p className="font-bold tabular-nums text-[var(--primary)]">{formatCurrency(fees.totalFees)}</p>
          </div>
        </div>
      )}
      {feeStructure.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="text-right py-1 font-medium">סוג</th>
                <th className="text-right py-1 font-medium">שיעור</th>
                <th className="text-right py-1 font-medium">הטבה</th>
                <th className="text-right py-1 font-medium">תום הטבה</th>
              </tr>
            </thead>
            <tbody>
              {feeStructure.map((fs, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-1">{fs.feeType === "1" ? "מצבירה" : fs.feeType === "2" ? "מהפקדה" : fs.feeType}</td>
                  <td className="py-1 tabular-nums">{formatPercent(fs.feeRate)}</td>
                  <td className="py-1">
                    {fs.hasDiscount ? (
                      <span className="text-green-600">{formatPercent(fs.discountPercent)}</span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-1">{fs.discountEndDate ? formatDate(fs.discountEndDate) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function DepositsTable({ deposits }: { deposits: Deposit[] }) {
  if (!deposits || deposits.length === 0) return null;
  return (
    <div className="mt-4 border-t pt-4">
      <h4 className="text-sm font-semibold text-gray-700 mb-2">היסטוריית הפקדות</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-gray-500 text-xs">
              <th className="text-right py-1 font-medium">תאריך</th>
              <th className="text-right py-1 font-medium">סכום</th>
              <th className="text-right py-1 font-medium">סוג הפרשה</th>
              <th className="text-right py-1 font-medium">מפקיד</th>
            </tr>
          </thead>
          <tbody>
            {deposits.map((dep, di) => (
              <tr key={di} className="border-b border-gray-50">
                <td className="py-1.5">{formatDate(dep.date)}</td>
                <td className="py-1.5 font-medium tabular-nums">{formatCurrency(dep.amount)}</td>
                <td className="py-1.5 text-xs">{dep.contributionType || "—"}</td>
                <td className="py-1.5 text-xs">
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
  );
}

function ProductCard({ product, detailHref }: { product: InsuranceProduct; detailHref: string }) {
  const status = statusLabel(product.status);

  return (
    <Card>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-4">
        <div>
          <h3 className="font-bold text-lg text-[var(--primary)]">
            {product.planName || `פוליסה #${product.policyNumber || "ללא מספר"}`}
          </h3>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1">
            <span>ספק: {product.providerName || product.providerCode}</span>
            <span>פוליסה: {product.policyNumber || "—"}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge
            status={product.status === "1" ? "active" : product.status === "2" ? "missing" : "expired"}
            label={status.label}
          />
          {product.totalInsurancePremium > 0 && (
            <span className="text-sm font-bold tabular-nums bg-[var(--primary)] text-white px-3 py-1 rounded-full">
              {formatCurrency(product.totalInsurancePremium)} / חודש
            </span>
          )}
        </div>
      </div>

      {/* Key details grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div>
          <span className="text-gray-500">תאריך הצטרפות:</span>
          <p className="font-medium">{formatDate(product.joinDate)}</p>
        </div>
        {product.firstJoinDate && product.firstJoinDate !== product.joinDate && (
          <div>
            <span className="text-gray-500">הצטרפות ראשונה:</span>
            <p className="font-medium">{formatDate(product.firstJoinDate)}</p>
          </div>
        )}
        <div>
          <span className="text-gray-500">אחוז הפרשה:</span>
          <p className="font-medium tabular-nums">{formatPercent(product.contributionPercent)}</p>
        </div>
        <div>
          <span className="text-gray-500">ריבית תת-שנתית:</span>
          <p className="font-medium tabular-nums">{formatPercent(product.subAnnualRate)}</p>
        </div>
        <div>
          <span className="text-gray-500">הפקדה אחרונה:</span>
          <p className="font-medium">{formatDate(product.lastDepositDate)}</p>
        </div>
        {product.indexBasis != null && (
          <div>
            <span className="text-gray-500">מדד בסיס:</span>
            <p className="font-medium tabular-nums">{product.indexBasis}</p>
          </div>
        )}
        {product.statusUpdateDate && (
          <div>
            <span className="text-gray-500">עדכון סטטוס:</span>
            <p className="font-medium">{formatDate(product.statusUpdateDate)}</p>
          </div>
        )}
        {product.withdrawalPenalty && (
          <div className="col-span-2">
            <span className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded">קנס משיכת כספים</span>
          </div>
        )}
      </div>

      {/* Alerts: debt, lien, loan, claim */}
      {(product.debt?.hasDebt || product.lien?.hasLien || product.lien?.hasAttachment || product.loan?.hasLoan || product.claim?.hasClaim) && (
        <div className="flex flex-wrap gap-2 mt-3">
          {product.debt?.hasDebt && (
            <span className="text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-1 rounded">
              חוב/פיגור {product.debt.totalDebt ? `— ${formatCurrency(product.debt.totalDebt)}` : ""}
            </span>
          )}
          {product.lien?.hasLien && (
            <span className="text-xs bg-orange-50 text-orange-700 border border-orange-200 px-2 py-1 rounded">שעבוד</span>
          )}
          {product.lien?.hasAttachment && (
            <span className="text-xs bg-orange-50 text-orange-700 border border-orange-200 px-2 py-1 rounded">עיקול</span>
          )}
          {product.loan?.hasLoan && (
            <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-1 rounded">
              הלוואה {product.loan.loanBalance ? `— ${formatCurrency(product.loan.loanBalance)}` : ""}
            </span>
          )}
          {product.claim?.hasClaim && (
            <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2 py-1 rounded">
              תביעה {product.claim.claimNumber ? `#${product.claim.claimNumber}` : ""}
            </span>
          )}
        </div>
      )}

      {/* Coverages */}
      {product.coverages.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            כיסויים ביטוחיים ({product.coverages.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {product.coverages.map((cov, ci) => (
              <CoverageCard key={ci} coverage={cov} />
            ))}
          </div>
        </div>
      )}

      {/* Beneficiaries (product-level) */}
      {product.beneficiaries && product.beneficiaries.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">מוטבים כלליים</h4>
          <div className="flex flex-wrap gap-2">
            {product.beneficiaries.map((b, i) => (
              <span key={i} className="text-sm bg-gray-100 px-3 py-1 rounded">
                {b.firstName} {b.lastName} — {formatPercent(b.percentage)}
                {b.definition && <span className="text-gray-400 mr-1">({b.definition})</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Fees */}
      <FeesSection fees={product.fees} feeStructure={product.feeStructure} />

      {/* Deposits */}
      <DepositsTable deposits={product.deposits} />

      {/* Employer */}
      {product.employer && (
        <div className="mt-4 border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">פרטי מעסיק</h4>
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
                <p className="font-medium" dir="ltr">{product.employer.phone}</p>
              </div>
            )}
            {product.employer.email && (
              <div>
                <span className="text-gray-500">דוא"ל:</span>
                <p className="font-medium" dir="ltr">{product.employer.email}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detail View Link */}
      <div className="mt-4 border-t pt-4 text-center">
        <Link
          href={detailHref}
          className="inline-flex items-center gap-2 bg-[var(--primary)] text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
        >
          צפה בפירוט המלא
          <span className="text-lg">←</span>
        </Link>
      </div>
    </Card>
  );
}

function RenewalAlertsSection({ alerts }: { alerts: RenewalAlert[] }) {
  if (alerts.length === 0) return null;
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-5 h-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-base font-bold text-amber-800">חידוש ביטוח קרוב</h2>
      </div>
      <div className="space-y-3">
        {alerts.map((alert, i) => {
          const tier = getUrgencyTier(alert.daysRemaining);
          return (
            <div key={i} className={`${tier.bg} border ${tier.border} rounded-lg p-4`}>
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                <div>
                  <h3 className="font-semibold text-sm text-[var(--primary)]">
                    {alert.planName || `פוליסה #${alert.policyNumber || "ללא מספר"}`}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                    <span>ספק: {alert.providerName}</span>
                    {alert.policyNumber && <span>פוליסה: {alert.policyNumber}</span>}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    תוקף הטבה מסתיים: {formatDate(alert.endDate)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${tier.badgeBg} ${tier.text} rounded-full px-3 py-1`}>
                    {tier.label} — נותרו {alert.daysRemaining} ימים
                  </span>
                </div>
              </div>
              <div className="mt-3">
                <Link
                  href={`/insurance/${alert.fileIndex}-${alert.productIndex}`}
                  className="inline-flex items-center gap-1 bg-[var(--secondary)] text-white px-4 py-2 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
                >
                  צפה בפרטי הפוליסה
                  <span className="text-sm">←</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function InsurancePage() {
  const { state } = useAppContext();
  const renewalAlerts = getRenewalAlerts(state.inpFiles);

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Link href="/dashboard" className="text-sm text-[var(--secondary)] hover:underline mb-4 inline-block">
          &larr; חזרה ללוח בקרה
        </Link>

        <h1 className="text-2xl font-bold text-[var(--primary)] mb-6">
          מוצרי ביטוח
        </h1>
        <p className="text-gray-500 mb-6">נתונים מקבצי מסלקה — INP</p>

        <RenewalAlertsSection alerts={renewalAlerts} />

        {state.inpFiles.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-500">לא נמצאו נתוני ביטוח. העלה קובץ INP מהמסלקה.</p>
          </Card>
        ) : (
          state.inpFiles.map((file, fi) => (
            <div key={fi} className="mb-8">
              {/* Provider Header */}
              <div className="bg-[var(--primary)] text-white rounded-t-xl p-4">
                <h2 className="text-lg font-bold">{file.provider.name}</h2>
                <div className="flex gap-4 text-sm text-white/80 mt-1">
                  {file.provider.contact.phone && (
                    <span>Tel: {file.provider.contact.phone}</span>
                  )}
                  {file.provider.contact.email && (
                    <span>Email: {file.provider.contact.email}</span>
                  )}
                </div>
              </div>

              {/* Products */}
              <div className="space-y-4 bg-gray-50 rounded-b-xl p-4">
                {file.products.map((product, pi) => (
                  <ErrorBoundary key={pi}>
                    <ProductCard product={product} detailHref={`/insurance/${fi}-${pi}`} />
                  </ErrorBoundary>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
