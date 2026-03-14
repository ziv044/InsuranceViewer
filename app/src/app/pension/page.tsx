"use client";

import { useAppContext } from "@/lib/context";
import Navbar from "@/components/Navbar";
import Card from "@/components/Card";
import {
  formatCurrency,
  formatPercent,
  formatDate,
  statusLabel,
  feeTypeLabel,
  contributionTypeLabel,
} from "@/lib/format";
import Link from "next/link";
import type { PensionProduct } from "@/lib/types";

function ProductCard({ product }: { product: PensionProduct }) {
  const st = statusLabel(product.status);

  // Find projection at age 67 for summary
  const proj67 = product.projections.find((p) => p.retirementAge === 67);
  // Current balance from balance blocks or year-end balance
  const currentBalance =
    product.balanceBlocks.reduce((sum, b) => sum + b.totalAccumulated, 0) ||
    product.yearEndBalance ||
    0;

  return (
    <Card className="mb-6">
      {/* 1. Header */}
      <div className="flex flex-wrap justify-between items-start mb-5 gap-3">
        <div>
          <h3 className="text-xl font-bold text-[var(--primary)]">
            {product.planName || "תוכנית פנסיה"}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {product.providerName}
            {product.accountNumber && (
              <span className="text-gray-400 mr-2">
                | חשבון: {product.accountNumber}
              </span>
            )}
          </p>
          <div className="flex gap-2 items-center mt-2 flex-wrap">
            <span className={`text-xs font-semibold px-2 py-1 rounded ${
              st.color === "text-green-600"
                ? "bg-green-100 text-green-700"
                : st.color === "text-yellow-600"
                ? "bg-yellow-100 text-yellow-700"
                : st.color === "text-red-600"
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-600"
            }`}>
              {st.label}
            </span>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
              {product.isNewPension ? "פנסיה חדשה" : "פנסיה ותיקה"}
            </span>
            {product.insuranceTrackName && (
              <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded">
                {product.insuranceTrackName}
              </span>
            )}
            {product.hasInsuranceDiscount && (
              <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded">
                הטבה ביטוחית
              </span>
            )}
            {product.hasPowerOfAttorney && (
              <span className="bg-orange-100 text-orange-700 text-xs font-medium px-2 py-1 rounded">
                מיופה כוח
              </span>
            )}
          </div>
          {product.joinDate && (
            <p className="text-xs text-gray-400 mt-2">
              תאריך הצטרפות: {formatDate(product.joinDate)}
            </p>
          )}
          {product.statutoryRetirementAge != null && (
            <p className="text-xs text-gray-400">
              גיל פרישה חוקי: {product.statutoryRetirementAge}
            </p>
          )}
        </div>
      </div>

      {/* 2. Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">קצבה צפויה (גיל 67)</p>
          <p className="text-lg font-bold text-[var(--primary)] tabular-nums">
            {proj67 ? formatCurrency(proj67.monthlyPension) : "—"}
          </p>
          <p className="text-[10px] text-gray-400">לחודש</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">יתרה נוכחית</p>
          <p className="text-lg font-bold text-[var(--primary)] tabular-nums">
            {currentBalance ? formatCurrency(currentBalance) : "—"}
          </p>
        </div>
        <div className="bg-amber-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">תשואה נטו</p>
          <p className="text-lg font-bold text-[var(--primary)] tabular-nums">
            {product.returns ? formatPercent(product.returns.netReturnRate) : "—"}
          </p>
          {product.returns?.profitLoss != null && (
            <p className={`text-[10px] ${product.returns.profitLossSign === "2" ? "text-red-500" : "text-green-600"}`}>
              {product.returns.profitLossSign === "2" ? "הפסד" : "רווח"}{" "}
              {formatCurrency(product.returns.profitLoss)}
            </p>
          )}
        </div>
        <div className="bg-rose-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">סה״כ דמי ניהול</p>
          <p className="text-lg font-bold text-[var(--primary)] tabular-nums">
            {product.fees ? formatCurrency(product.fees.totalFees) : "—"}
          </p>
        </div>
      </div>

      {/* 3. Fees Section */}
      {(product.fees || product.feeStructure.length > 0) && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">
            דמי ניהול
          </h4>

          {product.fees && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <div className="text-sm">
                <span className="text-gray-500">מהפקדה: </span>
                <span className="font-semibold tabular-nums">
                  {formatPercent(product.fees.depositFeeRate)}
                </span>
                <span className="text-xs text-gray-400 mr-1">
                  ({formatCurrency(product.fees.depositFeeTotal)})
                </span>
              </div>
              <div className="text-sm">
                <span className="text-gray-500">מצבירה: </span>
                <span className="font-semibold tabular-nums">
                  {formatPercent(product.fees.savingsFeeRate)}
                </span>
                <span className="text-xs text-gray-400 mr-1">
                  ({formatCurrency(product.fees.savingsFeeTotal)})
                </span>
              </div>
              {product.fees.otherFees > 0 && (
                <div className="text-sm">
                  <span className="text-gray-500">אחר: </span>
                  <span className="font-semibold tabular-nums">
                    {formatCurrency(product.fees.otherFees)}
                  </span>
                </div>
              )}
              {product.fees.insurancePremiumCollected != null && (
                <div className="text-sm">
                  <span className="text-gray-500">דמי ביטוח שנגבו: </span>
                  <span className="font-semibold tabular-nums">
                    {formatCurrency(product.fees.insurancePremiumCollected)}
                  </span>
                </div>
              )}
            </div>
          )}

          {product.feeStructure.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-gray-500">
                    <th className="text-right py-2 pr-2">סוג</th>
                    <th className="text-right py-2">שיעור</th>
                    <th className="text-right py-2">אופן הפרשה</th>
                    <th className="text-right py-2">הנחה</th>
                    <th className="text-right py-2">סיום הנחה</th>
                  </tr>
                </thead>
                <tbody>
                  {product.feeStructure.map((fee, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-2 pr-2">{feeTypeLabel(fee.feeType)}</td>
                      <td className="py-2 tabular-nums">{formatPercent(fee.feeRate)}</td>
                      <td className="py-2">{contributionTypeLabel(fee.contributionType)}</td>
                      <td className="py-2">
                        {fee.hasDiscount ? (
                          <span className="text-green-600 font-medium">
                            {formatPercent(fee.discountPercent)}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-2 tabular-nums">
                        {fee.discountEndDate ? formatDate(fee.discountEndDate) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 4. Coverage Section */}
      {(product.coverage || product.survivorPension) && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">
            כיסויים ביטוחיים
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {product.coverage && (
              <>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">עלות כיסוי נכות</p>
                  <p className="text-sm font-semibold tabular-nums">
                    {formatCurrency(product.coverage.disabilityCost)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">עלות פנסיית שארים (נכה)</p>
                  <p className="text-sm font-semibold tabular-nums">
                    {formatCurrency(product.coverage.survivorPensionCost)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">עלות כיסוי שארים</p>
                  <p className="text-sm font-semibold tabular-nums">
                    {formatCurrency(product.coverage.survivorsCost)}
                  </p>
                </div>
              </>
            )}
            {product.survivorPension && (
              <>
                <div className="bg-indigo-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">קצבת שארים — בן/בת זוג</p>
                  <p className="text-sm font-semibold tabular-nums">
                    {formatCurrency(product.survivorPension.spousePension)}
                  </p>
                </div>
                <div className="bg-indigo-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">קצבת שארים — יתום</p>
                  <p className="text-sm font-semibold tabular-nums">
                    {formatCurrency(product.survivorPension.orphanPension)}
                  </p>
                </div>
                <div className="bg-indigo-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">קצבת שארים — הורה נתמך</p>
                  <p className="text-sm font-semibold tabular-nums">
                    {formatCurrency(product.survivorPension.dependentParentPension)}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 5. Projections Table */}
      {product.projections.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">
            תחזית פנסיה חודשית (קצבת זקנה)
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="text-right py-2 pr-2">גיל פרישה</th>
                  <th className="text-right py-2">קצבה חודשית</th>
                  <th className="text-right py-2">קצבה צפויה</th>
                  <th className="text-right py-2">צבירה כוללת</th>
                  <th className="text-right py-2">צבירה ללא הפקדות</th>
                  <th className="text-right py-2">תשואה</th>
                </tr>
              </thead>
              <tbody>
                {product.projections.map((proj, i) => (
                  <tr
                    key={i}
                    className={`border-b border-gray-100 ${
                      proj.retirementAge === 67 ? "bg-blue-50 font-semibold" : ""
                    }`}
                  >
                    <td className="py-2 pr-2">{proj.retirementAge}</td>
                    <td className="py-2 tabular-nums text-[var(--primary)]">
                      {formatCurrency(proj.monthlyPension)}
                    </td>
                    <td className="py-2 tabular-nums">
                      {formatCurrency(proj.projectedMonthlyPension)}
                    </td>
                    <td className="py-2 tabular-nums">
                      {formatCurrency(proj.totalAccumulated)}
                    </td>
                    <td className="py-2 tabular-nums">
                      {formatCurrency(proj.totalAccumulatedWithoutPremiums)}
                    </td>
                    <td className="py-2 tabular-nums">
                      {formatPercent(proj.returnRate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {product.projections.length === 0 && (
        <p className="text-sm text-gray-400 mb-6">אין תחזיות פנסיה זמינות</p>
      )}

      {/* 6. Investment Tracks */}
      {product.investmentTracks.length > 0 && (() => {
        const hasTrackDepositFee = product.investmentTracks.some(t => t.depositFeeRate != null);
        const hasTrackSavingsFee = product.investmentTracks.some(t => t.savingsFeeRate != null);
        const hasTrackAnnualCost = product.investmentTracks.some(t => t.annualCostRate != null);
        return (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">
            מסלולי השקעה
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="text-right py-2 pr-2">מסלול</th>
                  <th className="text-right py-2">סוג הפרשה</th>
                  <th className="text-right py-2">יתרה</th>
                  <th className="text-right py-2">תשואה נטו</th>
                  <th className="text-right py-2">הקצאה</th>
                  {hasTrackDepositFee && <th className="text-right py-2">ד״נ הפקדה</th>}
                  {hasTrackSavingsFee && <th className="text-right py-2">ד״נ צבירה</th>}
                  {hasTrackAnnualCost && <th className="text-right py-2">עלות שנתית</th>}
                </tr>
              </thead>
              <tbody>
                {product.investmentTracks.map((track, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-2 pr-2 font-medium">{track.trackName || track.trackCode}</td>
                    <td className="py-2">{contributionTypeLabel(track.contributionType)}</td>
                    <td className="py-2 tabular-nums">{formatCurrency(track.balance)}</td>
                    <td className="py-2 tabular-nums">{formatPercent(track.netReturn)}</td>
                    <td className="py-2 tabular-nums">{formatPercent(track.allocationPercent)}</td>
                    {hasTrackDepositFee && (
                      <td className="py-2 tabular-nums">
                        {track.depositFeeRate != null ? formatPercent(track.depositFeeRate) : "—"}
                      </td>
                    )}
                    {hasTrackSavingsFee && (
                      <td className="py-2 tabular-nums">
                        {track.savingsFeeRate != null ? formatPercent(track.savingsFeeRate) : "—"}
                      </td>
                    )}
                    {hasTrackAnnualCost && (
                      <td className="py-2 tabular-nums">
                        {track.annualCostRate != null ? formatPercent(track.annualCostRate) : "—"}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        );
      })()}

      {/* 7. Balance Blocks */}
      {product.balanceBlocks.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">
            יתרות וצבירה
          </h4>
          {product.yearEndBalance != null && (
            <p className="text-sm text-gray-600 mb-2">
              יתרת סוף שנה: <span className="font-semibold tabular-nums">{formatCurrency(product.yearEndBalance)}</span>
            </p>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="text-right py-2 pr-2">צבירה כוללת</th>
                  <th className="text-right py-2">פיצויים מעסיק נוכחי</th>
                  <th className="text-right py-2">מרכיב פיצויים נוכחי</th>
                  <th className="text-right py-2">פיצויים מעסיקים קודמים</th>
                  <th className="text-right py-2">רצף זהות</th>
                  <th className="text-right py-2">רצף פיצויים קצבה</th>
                  <th className="text-right py-2">רצף זכויות</th>
                </tr>
              </thead>
              <tbody>
                {product.balanceBlocks.map((block, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-2 pr-2 tabular-nums font-semibold">
                      {formatCurrency(block.totalAccumulated)}
                    </td>
                    <td className="py-2 tabular-nums">
                      {formatCurrency(block.severanceCurrentEmployer)}
                    </td>
                    <td className="py-2 tabular-nums">
                      {formatCurrency(block.severanceCurrentComponent)}
                    </td>
                    <td className="py-2 tabular-nums">
                      {formatCurrency(block.severancePreviousEmployers)}
                    </td>
                    <td className="py-2 tabular-nums">
                      {formatCurrency(block.severanceContinuity)}
                    </td>
                    <td className="py-2">
                      {block.hasSeveranceContinuityPension ? (
                        <span className="text-green-600">כן</span>
                      ) : (
                        <span className="text-gray-400">לא</span>
                      )}
                    </td>
                    <td className="py-2">
                      {block.hasSeveranceRightsContinuity ? (
                        <span className="text-green-600">כן</span>
                      ) : (
                        <span className="text-gray-400">לא</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. Employers */}
      {product.employers.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">
            מעסיקים
          </h4>
          <div className="grid gap-3">
            {product.employers.map((emp, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-3 flex flex-wrap gap-x-6 gap-y-1 items-center">
                <span className="font-medium text-sm">{emp.name}</span>
                {emp.idNumber && (
                  <span className="text-xs text-gray-500">ח.פ: {emp.idNumber}</span>
                )}
                {emp.city && (
                  <span className="text-xs text-gray-500">
                    {emp.city}{emp.street ? `, ${emp.street}` : ""}
                  </span>
                )}
                {emp.phone && (
                  <span className="text-xs text-gray-500">{emp.phone}</span>
                )}
                {emp.email && (
                  <span className="text-xs text-gray-500">{emp.email}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Beneficiaries */}
      {product.beneficiaries.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">
            מוטבים
          </h4>
          <div className="grid gap-2">
            {product.beneficiaries.map((ben, i) => (
              <div key={i} className="flex gap-4 text-sm items-center">
                <span className="font-medium">
                  {ben.firstName} {ben.lastName}
                </span>
                <span className="tabular-nums text-[var(--primary)] font-semibold">
                  {ben.percentage}%
                </span>
                {ben.definition && (
                  <span className="text-xs text-gray-500">{ben.definition}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts: Debt, Lien, Loan, Claim */}
      {(product.debt?.hasDebt || product.lien?.hasLien || product.lien?.hasAttachment || product.loan?.hasLoan || product.claim?.hasClaim) && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-red-600 mb-3 border-b border-red-200 pb-2">
            התראות
          </h4>
          <div className="grid gap-2">
            {product.debt?.hasDebt && (
              <div className="bg-red-50 rounded-lg p-3 text-sm">
                <span className="font-medium text-red-700">חוב/פיגור</span>
                {product.debt.totalDebt != null && (
                  <span className="mr-2 tabular-nums">{formatCurrency(product.debt.totalDebt)}</span>
                )}
                {product.debt.monthsInArrears != null && (
                  <span className="text-xs text-gray-500 mr-2">
                    {product.debt.monthsInArrears} חודשי פיגור
                  </span>
                )}
              </div>
            )}
            {product.lien?.hasLien && (
              <div className="bg-red-50 rounded-lg p-3 text-sm">
                <span className="font-medium text-red-700">קיים שעבוד</span>
              </div>
            )}
            {product.lien?.hasAttachment && (
              <div className="bg-red-50 rounded-lg p-3 text-sm">
                <span className="font-medium text-red-700">קיים עיקול</span>
              </div>
            )}
            {product.loan?.hasLoan && (
              <div className="bg-yellow-50 rounded-lg p-3 text-sm">
                <span className="font-medium text-yellow-700">הלוואה</span>
                {product.loan.loanBalance != null && (
                  <span className="mr-2 tabular-nums">{formatCurrency(product.loan.loanBalance)}</span>
                )}
                {product.loan.interestRate != null && (
                  <span className="text-xs text-gray-500 mr-2">
                    ריבית: {formatPercent(product.loan.interestRate)}
                  </span>
                )}
              </div>
            )}
            {product.claim?.hasClaim && (
              <div className="bg-yellow-50 rounded-lg p-3 text-sm">
                <span className="font-medium text-yellow-700">תביעה פתוחה</span>
                {product.claim.claimNumber && (
                  <span className="text-xs text-gray-500 mr-2">
                    מספר: {product.claim.claimNumber}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

export default function PensionPage() {
  const { state } = useAppContext();

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Link
          href="/dashboard"
          className="text-sm text-[var(--secondary)] hover:underline mb-4 inline-block"
        >
          &larr; חזרה ללוח בקרה
        </Link>

        <h1 className="text-2xl font-bold text-[var(--primary)] mb-6">
          פנסיה
        </h1>
        <p className="text-gray-500 mb-6">נתונים מקבצי מסלקה — PNN</p>

        {state.pnnFiles.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-500">
              לא נמצאו נתוני פנסיה. העלה קובץ PNN מהמסלקה.
            </p>
          </Card>
        ) : (
          state.pnnFiles.map((file, fi) => (
            <div key={fi} className="mb-8">
              {/* Provider Header */}
              <div className="bg-[var(--primary)] text-white rounded-t-xl p-4">
                <h2 className="text-lg font-bold">{file.provider.name}</h2>
                <div className="flex gap-4 text-sm text-white/80 mt-1 flex-wrap">
                  {file.provider.contact.phone && (
                    <span>טל: {file.provider.contact.phone}</span>
                  )}
                  {file.provider.contact.email && (
                    <span>דוא״ל: {file.provider.contact.email}</span>
                  )}
                  {(file.provider.contact.city ||
                    file.provider.contact.street) && (
                    <span>
                      {[
                        file.provider.contact.city,
                        file.provider.contact.street,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  )}
                </div>
              </div>

              {/* Products */}
              <div className="space-y-4 bg-gray-50 rounded-b-xl p-4">
                {file.products.map((product, pi) => (
                  <ProductCard key={pi} product={product} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
