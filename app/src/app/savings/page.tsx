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
  clause14Label,
  isWithdrawalEligible,
} from "@/lib/format";
import StatusBadge from "@/components/dashboard/StatusBadge";
import ErrorBoundary from "@/components/dashboard/ErrorBoundary";
import Link from "next/link";

export default function SavingsPage() {
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

        <h1 className="text-2xl font-bold text-[var(--primary)] mb-2">
          קופות גמל וקרנות השתלמות
        </h1>
        <p className="text-gray-500 mb-6">נתונים מקבצי מסלקה — KGM</p>

        {state.kgmFiles.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-500">
              לא נמצאו נתוני קופות גמל. העלה קובץ KGM מהמסלקה.
            </p>
          </Card>
        ) : (
          state.kgmFiles.map((file, fi) => (
            <div key={fi} className="mb-8">
              {/* Provider Header */}
              <div className="bg-[var(--primary)] text-white rounded-t-xl p-4">
                <h2 className="text-lg font-bold">{file.provider.name}</h2>
                <div className="flex gap-4 text-sm text-white/80 mt-1">
                  {file.provider.contact.phone && (
                    <span>טלפון: {file.provider.contact.phone}</span>
                  )}
                  {file.provider.contact.email && (
                    <span>דוא״ל: {file.provider.contact.email}</span>
                  )}
                  {file.provider.contact.city && (
                    <span>
                      {file.provider.contact.city}
                      {file.provider.contact.street
                        ? `, ${file.provider.contact.street}`
                        : ""}
                    </span>
                  )}
                </div>
              </div>

              {/* Products */}
              <div className="space-y-6 bg-gray-50 rounded-b-xl p-4">
                {file.products.map((product, pi) => {
                  const status = statusLabel(product.status);
                  const eligible =
                    product.withdrawal?.eligibilityDate
                      ? isWithdrawalEligible(product.withdrawal.eligibilityDate)
                      : false;

                  return (
                    <ErrorBoundary key={pi}>
                    <Card className="space-y-6">
                      {/* ===== 1. Header ===== */}
                      <div className="flex flex-wrap justify-between items-start gap-4">
                        <div>
                          <h3 className="font-bold text-xl text-[var(--primary)]">
                            {product.planName || "ללא שם תוכנית"}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {product.providerName} | חשבון{" "}
                            {product.accountNumber || "—"} | סוג:{" "}
                            {product.productType}
                          </p>
                          {product.joinDate && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              הצטרפות: {formatDate(product.joinDate)}
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
                          status={product.status === "1" ? "active" : product.status === "2" ? "missing" : "expired"}
                          label={status.label}
                        />
                      </div>

                      {/* ===== 2. Summary Cards ===== */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        <SummaryCard
                          label="סה״כ חסכון"
                          value={formatCurrency(product.totalBalance)}
                          accent
                        />
                        <SummaryCard
                          label="יתרה סוף שנה"
                          value={
                            product.yearEndBalance != null
                              ? formatCurrency(product.yearEndBalance)
                              : "—"
                          }
                        />
                        <SummaryCard
                          label="תשואה נטו"
                          value={
                            product.returns?.netReturnRate != null
                              ? formatPercent(product.returns.netReturnRate)
                              : formatPercent(product.totalNetReturn)
                          }
                        />
                        <SummaryCard
                          label="רווח / הפסד"
                          value={
                            product.returns?.profitLoss != null
                              ? `${product.returns.profitLossSign === "2" ? "-" : ""}${formatCurrency(product.returns.profitLoss)}`
                              : "—"
                          }
                          negative={product.returns?.profitLossSign === "2"}
                        />
                        <SummaryCard
                          label="סה״כ דמי ניהול"
                          value={
                            product.fees?.totalFees != null
                              ? formatCurrency(product.fees.totalFees)
                              : "—"
                          }
                        />
                        <SummaryCard
                          label="צפי לגמלאות"
                          value={
                            product.projectedBalanceAtRetirement != null
                              ? formatCurrency(
                                  product.projectedBalanceAtRetirement
                                )
                              : "—"
                          }
                        />
                      </div>

                      {/* ===== 3. Withdrawal Eligibility ===== */}
                      {product.withdrawal && (
                        <div
                          className={`rounded-xl border-2 p-4 ${
                            eligible
                              ? "border-green-400 bg-green-50"
                              : "border-amber-300 bg-amber-50"
                          }`}
                        >
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                              <h4 className="font-semibold text-gray-800 mb-1">
                                זכאות למשיכה
                              </h4>
                              <p className="text-sm text-gray-600">
                                תאריך זכאות:{" "}
                                <span className="font-medium">
                                  {formatDate(
                                    product.withdrawal.eligibilityDate
                                  )}
                                </span>
                              </p>
                              {product.withdrawal.eligibleAmount != null && (
                                <p className="text-sm text-gray-600">
                                  סכום זכאי:{" "}
                                  <span className="font-medium">
                                    {formatCurrency(
                                      product.withdrawal.eligibleAmount
                                    )}
                                  </span>
                                </p>
                              )}
                            </div>
                            {eligible ? (
                              <span className="bg-green-600 text-white text-sm font-bold px-4 py-1.5 rounded-full">
                                זכאי למשיכה
                              </span>
                            ) : (
                              <span className="bg-amber-500 text-white text-sm font-bold px-4 py-1.5 rounded-full">
                                טרם זכאי
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* ===== 4. Fees Section ===== */}
                      {(product.fees || product.feeStructure.length > 0) && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-800 border-b pb-1">
                            דמי ניהול
                          </h4>

                          {/* Actual fees */}
                          {product.fees && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                              {product.fees.depositFeeRate != null && (
                                <div className="bg-yellow-50 rounded-lg p-3">
                                  <p className="text-gray-500">
                                    דמי ניהול מהפקדה
                                  </p>
                                  <p className="font-semibold">
                                    {formatPercent(product.fees.depositFeeRate)}
                                  </p>
                                  {product.fees.depositFeeTotal != null && (
                                    <p className="text-xs text-gray-400">
                                      סה״כ:{" "}
                                      {formatCurrency(
                                        product.fees.depositFeeTotal
                                      )}
                                    </p>
                                  )}
                                </div>
                              )}
                              {product.fees.savingsFeeRate != null && (
                                <div className="bg-yellow-50 rounded-lg p-3">
                                  <p className="text-gray-500">
                                    דמי ניהול מצבירה
                                  </p>
                                  <p className="font-semibold">
                                    {formatPercent(product.fees.savingsFeeRate)}
                                  </p>
                                  {product.fees.savingsFeeTotal != null && (
                                    <p className="text-xs text-gray-400">
                                      סה״כ:{" "}
                                      {formatCurrency(
                                        product.fees.savingsFeeTotal
                                      )}
                                    </p>
                                  )}
                                </div>
                              )}
                              {product.fees.otherFees != null &&
                                product.fees.otherFees > 0 && (
                                  <div className="bg-yellow-50 rounded-lg p-3">
                                    <p className="text-gray-500">עמלות אחרות</p>
                                    <p className="font-semibold">
                                      {formatCurrency(product.fees.otherFees)}
                                    </p>
                                  </div>
                                )}
                              {product.fees.totalFees != null && (
                                <div className="bg-yellow-100 rounded-lg p-3">
                                  <p className="text-gray-600 font-medium">
                                    סה״כ דמי ניהול
                                  </p>
                                  <p className="font-bold text-[var(--primary)]">
                                    {formatCurrency(product.fees.totalFees)}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Fee structure */}
                          {product.feeStructure.length > 0 && (
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b text-gray-500">
                                    <th className="text-right py-2 pr-2">
                                      סוג דמי ניהול
                                    </th>
                                    <th className="text-right py-2">שיעור</th>
                                    <th className="text-right py-2">
                                      סוג הפקדה
                                    </th>
                                    <th className="text-right py-2">הנחה</th>
                                    <th className="text-right py-2">
                                      סיום הנחה
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {product.feeStructure.map((fs, fsi) => (
                                    <tr
                                      key={fsi}
                                      className="border-b border-gray-100"
                                    >
                                      <td className="py-2 pr-2">
                                        {feeTypeLabel(fs.feeType)}
                                      </td>
                                      <td className="py-2 tabular-nums">
                                        {formatPercent(fs.feeRate)}
                                      </td>
                                      <td className="py-2">
                                        {contributionTypeLabel(
                                          fs.contributionType
                                        )}
                                      </td>
                                      <td className="py-2">
                                        {fs.hasDiscount ? (
                                          <span className="text-green-600 font-medium">
                                            {formatPercent(fs.discountPercent)}{" "}
                                            הנחה
                                          </span>
                                        ) : (
                                          <span className="text-gray-400">
                                            ללא
                                          </span>
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

                      {/* ===== 5. Investment Tracks Table ===== */}
                      {product.tracks.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-800 border-b pb-1 mb-3">
                            מסלולי השקעה
                          </h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b text-gray-500">
                                  <th className="text-right py-2 pr-2">
                                    מסלול
                                  </th>
                                  <th className="text-right py-2">סוג</th>
                                  <th className="text-right py-2">יתרה</th>
                                  <th className="text-right py-2">
                                    תשואה נטו
                                  </th>
                                  <th className="text-right py-2">הקצאה</th>
                                  <th className="text-right py-2">
                                    עלות שנתית
                                  </th>
                                  <th className="text-right py-2">
                                    דמי הפקדה
                                  </th>
                                  <th className="text-right py-2">
                                    דמי צבירה
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {product.tracks.map((track, ti) => {
                                  const pct =
                                    product.totalBalance > 0
                                      ? (track.balance / product.totalBalance) *
                                        100
                                      : 0;
                                  return (
                                    <tr
                                      key={ti}
                                      className="border-b border-gray-100"
                                    >
                                      <td className="py-3 pr-2 font-medium">
                                        {track.trackName}
                                        {track.contributionType && (
                                          <span className="block text-xs text-gray-400">
                                            {contributionTypeLabel(
                                              track.contributionType
                                            )}
                                          </span>
                                        )}
                                      </td>
                                      <td className="py-3 text-xs text-gray-500">
                                        {track.trackType || "—"}
                                      </td>
                                      <td className="py-3 tabular-nums font-semibold">
                                        {formatCurrency(track.balance)}
                                      </td>
                                      <td className="py-3 tabular-nums">
                                        {formatPercent(track.netReturn)}
                                      </td>
                                      <td className="py-3">
                                        <div className="flex items-center gap-2">
                                          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[80px]">
                                            <div
                                              className="bg-[var(--secondary)] h-2 rounded-full"
                                              style={{
                                                width: `${Math.min(pct, 100)}%`,
                                              }}
                                            />
                                          </div>
                                          <span className="text-xs text-gray-500 tabular-nums w-12">
                                            {track.allocationPercent != null
                                              ? formatPercent(
                                                  track.allocationPercent
                                                )
                                              : `${pct.toFixed(1)}%`}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="py-3 tabular-nums text-xs">
                                        {track.annualCostRate != null
                                          ? formatPercent(track.annualCostRate)
                                          : "—"}
                                      </td>
                                      <td className="py-3 tabular-nums text-xs">
                                        {track.depositFeeRate != null
                                          ? formatPercent(track.depositFeeRate)
                                          : "—"}
                                      </td>
                                      <td className="py-3 tabular-nums text-xs">
                                        {track.savingsFeeRate != null
                                          ? formatPercent(track.savingsFeeRate)
                                          : "—"}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* ===== 6. Employment Terms ===== */}
                      {product.employmentTerms && (
                        <div>
                          <h4 className="font-semibold text-gray-800 border-b pb-1 mb-3">
                            תנאי העסקה
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                            {product.employmentTerms.clause14 && (
                              <div className="bg-blue-50 rounded-lg p-3">
                                <p className="text-gray-500">סעיף 14</p>
                                <p className="font-semibold">
                                  {clause14Label(
                                    product.employmentTerms.clause14
                                  )}
                                </p>
                              </div>
                            )}
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-gray-500">הפרשת עובד</p>
                              <p className="font-semibold tabular-nums">
                                {formatPercent(
                                  product.employeeContributionPercent
                                )}
                              </p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-gray-500">הפרשת מעסיק</p>
                              <p className="font-semibold tabular-nums">
                                {formatPercent(
                                  product.employerContributionPercent
                                )}
                              </p>
                            </div>
                            {product.employmentTerms.planType && (
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-gray-500">סוג תוכנית</p>
                                <p className="font-semibold">
                                  {product.employmentTerms.planType}
                                </p>
                              </div>
                            )}
                            {product.employmentTerms.employerStatus && (
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-gray-500">סטטוס מעסיק</p>
                                <p className="font-semibold">
                                  {product.employmentTerms.employerStatus}
                                </p>
                              </div>
                            )}
                            {product.employmentTerms.unconditionalRight && (
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-gray-500">זכות ללא תנאי</p>
                                <p className="font-semibold">
                                  {product.employmentTerms.unconditionalRight}
                                </p>
                              </div>
                            )}
                            {product.employmentTerms.salary != null && (
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-gray-500">שכר לחישוב</p>
                                <p className="font-semibold tabular-nums">
                                  {formatCurrency(
                                    product.employmentTerms.salary
                                  )}
                                </p>
                                {product.employmentTerms.salaryDate && (
                                  <p className="text-xs text-gray-400">
                                    נכון ל:{" "}
                                    {formatDate(
                                      product.employmentTerms.salaryDate
                                    )}
                                  </p>
                                )}
                              </div>
                            )}
                            {product.employmentTerms.salaryCalculation && (
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-gray-500">אופן חישוב שכר</p>
                                <p className="font-semibold">
                                  {product.employmentTerms.salaryCalculation}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* ===== 7. Balance Blocks (Severance) ===== */}
                      {product.balanceBlocks.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-800 border-b pb-1 mb-3">
                            פירוט יתרות
                          </h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b text-gray-500">
                                  <th className="text-right py-2 pr-2">
                                    סוג יתרה
                                  </th>
                                  <th className="text-right py-2">
                                    שכבת מס
                                  </th>
                                  <th className="text-right py-2">
                                    סה״כ נצבר
                                  </th>
                                  <th className="text-right py-2">
                                    פיצויים מעסיק נוכחי
                                  </th>
                                  <th className="text-right py-2">
                                    רכיב פיצויים
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {product.balanceBlocks.map((block, bi) => (
                                  <tr
                                    key={bi}
                                    className="border-b border-gray-100"
                                  >
                                    <td className="py-2 pr-2 font-medium">
                                      {block.balanceType || "—"}
                                    </td>
                                    <td className="py-2">
                                      {block.taxLayer || "—"}
                                    </td>
                                    <td className="py-2 tabular-nums">
                                      {block.totalAccumulated != null
                                        ? formatCurrency(block.totalAccumulated)
                                        : "—"}
                                    </td>
                                    <td className="py-2 tabular-nums">
                                      {block.severanceCurrentEmployer != null
                                        ? formatCurrency(
                                            block.severanceCurrentEmployer
                                          )
                                        : "—"}
                                    </td>
                                    <td className="py-2 tabular-nums">
                                      {block.severanceCurrentComponent != null
                                        ? formatCurrency(
                                            block.severanceCurrentComponent
                                          )
                                        : "—"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* ===== 8. Beneficiaries ===== */}
                      {product.beneficiaries.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-800 border-b pb-1 mb-3">
                            מוטבים
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {product.beneficiaries.map((b, bi) => (
                              <div
                                key={bi}
                                className="bg-gray-50 rounded-lg p-3 text-sm"
                              >
                                <p className="font-medium">
                                  {b.firstName} {b.lastName}
                                </p>
                                {b.idNumber && (
                                  <p className="text-xs text-gray-400">
                                    ת.ז: {b.idNumber}
                                  </p>
                                )}
                                {b.percentage != null && (
                                  <p className="text-gray-600">
                                    חלק: {formatPercent(b.percentage)}
                                  </p>
                                )}
                                {b.definition && (
                                  <p className="text-gray-500 text-xs">
                                    הגדרה: {b.definition}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Debt / Lien / Loan notices */}
                      {(product.debt || product.lien || product.loan) && (
                        <div className="space-y-2">
                          {product.debt && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                              <span className="font-semibold">חוב: </span>
                              קיים חוב על החשבון
                            </div>
                          )}
                          {product.lien && (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-700">
                              <span className="font-semibold">שעבוד: </span>
                              קיים שעבוד על החשבון
                            </div>
                          )}
                          {product.loan && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                              <span className="font-semibold">הלוואה: </span>
                              קיימת הלוואה על החשבון
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                    </ErrorBoundary>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

/* ---- Small helper component for summary cards ---- */
function SummaryCard({
  label,
  value,
  accent,
  negative,
}: {
  label: string;
  value: string;
  accent?: boolean;
  negative?: boolean;
}) {
  return (
    <div
      className={`rounded-lg p-3 text-center ${
        accent ? "bg-[var(--primary)] text-white" : "bg-gray-50"
      }`}
    >
      <p
        className={`text-xs mb-1 ${accent ? "text-white/70" : "text-gray-500"}`}
      >
        {label}
      </p>
      <p
        className={`text-lg font-bold tabular-nums ${
          accent
            ? "text-white"
            : negative
            ? "text-red-600"
            : "text-[var(--primary)]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
