"use client";

import { useRouter } from "next/navigation";
import { useAppContext } from "@/lib/context";
import Navbar from "@/components/Navbar";
import { StatCard } from "@/components/Card";
import Card from "@/components/Card";
import { formatCurrency, formatDate, genderLabel, maritalStatusLabel } from "@/lib/format";
import type { PensionProjection, ClientInfo } from "@/lib/types";

export default function Dashboard() {
  const { state } = useAppContext();
  const router = useRouter();

  const hasData = state.files.length > 0;

  // --- Insurance products ---
  const totalInsuranceProducts = state.inpFiles.reduce(
    (sum, f) => sum + f.products.length,
    0
  );

  // Total insurance premium (sum of totalInsurancePremium across all INP products)
  const totalInsurancePremium = state.inpFiles.reduce(
    (sum, f) =>
      sum + f.products.reduce((s, p) => s + (p.totalInsurancePremium || 0), 0),
    0
  );

  // --- Savings (KGM) ---
  const totalSavingsBalance = state.kgmFiles.reduce(
    (sum, f) => sum + f.products.reduce((s, p) => s + p.totalBalance, 0),
    0
  );

  const totalSavingsTracks = state.kgmFiles.reduce(
    (sum, f) => sum + f.products.reduce((s, p) => s + p.tracks.length, 0),
    0
  );

  // Withdrawal eligibility count from KGM
  const withdrawalEligibleCount = state.kgmFiles.reduce(
    (sum, f) =>
      sum +
      f.products.filter(
        (p) => p.withdrawal && p.withdrawal.eligibleAmount > 0
      ).length,
    0
  );

  // --- Pension projections (use age 67 or last projection) ---
  const getRelevantProjection = (
    projections: PensionProjection[]
  ): PensionProjection | undefined => {
    if (projections.length === 0) return undefined;
    const at67 = projections.find((pr) => pr.retirementAge === 67);
    return at67 || projections[projections.length - 1];
  };

  const relevantProjections = state.pnnFiles.flatMap((f) =>
    f.products
      .map((p) => getRelevantProjection(p.projections))
      .filter((pr): pr is PensionProjection => pr !== undefined)
  );

  const pensionTotalAccumulated = relevantProjections.reduce(
    (sum, pr) => sum + pr.totalAccumulated,
    0
  );

  const minPension =
    relevantProjections.length > 0
      ? Math.min(...relevantProjections.map((p) => p.monthlyPension))
      : 0;
  const maxPension =
    relevantProjections.length > 0
      ? Math.max(...relevantProjections.map((p) => p.monthlyPension))
      : 0;

  // --- Total savings across all products ---
  const totalSavingsAllProducts = totalSavingsBalance + pensionTotalAccumulated;

  // --- Total monthly fees across all products ---
  const totalMonthlyFees =
    state.inpFiles.reduce(
      (sum, f) =>
        sum +
        f.products.reduce((s, p) => s + (p.fees?.totalFees || 0), 0),
      0
    ) +
    state.kgmFiles.reduce(
      (sum, f) =>
        sum +
        f.products.reduce((s, p) => s + (p.fees?.totalFees || 0), 0),
      0
    ) +
    state.pnnFiles.reduce(
      (sum, f) =>
        sum +
        f.products.reduce((s, p) => s + (p.fees?.totalFees || 0), 0),
      0
    );

  // --- Har Habituach ---
  const harRecords = state.harHabituachFiles.reduce(
    (sum, f) => sum + f.records.length,
    0
  );

  // --- Unique providers ---
  const providers = new Set<string>();
  state.inpFiles.forEach((f) => providers.add(f.provider.name));
  state.kgmFiles.forEach((f) => providers.add(f.provider.name));
  state.pnnFiles.forEach((f) => providers.add(f.provider.name));

  // --- Unique employers from all file types ---
  const employers = new Map<
    string,
    { name: string; city: string; street: string }
  >();

  // INP products have employer?: Employer
  state.inpFiles.forEach((f) => {
    f.products.forEach((p) => {
      if (p.employer?.name) {
        employers.set(p.employer.idNumber || p.employer.name, {
          name: p.employer.name,
          city: p.employer.city,
          street: p.employer.street,
        });
      }
    });
  });

  // KGM products have employer?: Employer
  state.kgmFiles.forEach((f) => {
    f.products.forEach((p) => {
      if (p.employer?.name) {
        employers.set(p.employer.idNumber || p.employer.name, {
          name: p.employer.name,
          city: p.employer.city,
          street: p.employer.street,
        });
      }
    });
  });

  // PNN products have employers: Employer[]
  state.pnnFiles.forEach((f) => {
    f.products.forEach((p) => {
      p.employers.forEach((emp) => {
        if (emp.name) {
          employers.set(emp.idNumber || emp.name, {
            name: emp.name,
            city: emp.city,
            street: emp.street,
          });
        }
      });
    });
  });

  // --- Client personal info (take first available) ---
  let client: ClientInfo | undefined;
  for (const f of state.pnnFiles) {
    for (const p of f.products) {
      if (p.client?.firstName) { client = p.client; break; }
    }
    if (client) break;
  }
  if (!client) {
    for (const f of state.kgmFiles) {
      for (const p of f.products) {
        if (p.client?.firstName) { client = p.client; break; }
      }
      if (client) break;
    }
  }
  if (!client) {
    for (const f of state.inpFiles) {
      for (const p of f.products) {
        if (p.client?.firstName) { client = p.client; break; }
      }
      if (client) break;
    }
  }

  const successFiles = state.files.filter((f) => f.success).length;
  const errorFiles = state.files.filter((f) => !f.success).length;

  if (!hasData) {
    return (
      <>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <p className="text-xl text-gray-500">לא הועלו קבצים עדיין</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 bg-[var(--primary)] text-white px-6 py-2 rounded-lg hover:bg-[var(--primary-light)] transition-colors"
          >
            העלה קבצים
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-[var(--primary)] mb-6">
          סיכום כללי
        </h1>

        {/* Personal Info */}
        {client && (
          <Card title={`${client.firstName} ${client.lastName}`} icon="👤" className="mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 text-sm">
              {client.idNumber && (
                <div>
                  <span className="text-gray-500">ת.ז: </span>
                  <span className="font-medium">{client.idNumber}</span>
                </div>
              )}
              {client.birthDate && (
                <div>
                  <span className="text-gray-500">תאריך לידה: </span>
                  <span className="font-medium">{formatDate(client.birthDate)}</span>
                </div>
              )}
              {client.gender && (
                <div>
                  <span className="text-gray-500">מין: </span>
                  <span className="font-medium">{genderLabel(client.gender)}</span>
                </div>
              )}
              {client.maritalStatus && (
                <div>
                  <span className="text-gray-500">מצב משפחתי: </span>
                  <span className="font-medium">{maritalStatusLabel(client.maritalStatus)}</span>
                </div>
              )}
              {(client.city || client.street) && (
                <div>
                  <span className="text-gray-500">כתובת: </span>
                  <span className="font-medium">
                    {[client.street, client.houseNumber, client.city].filter(Boolean).join(" ")}
                    {client.zipCode ? ` (${client.zipCode})` : ""}
                  </span>
                </div>
              )}
              {client.cellphone && (
                <div>
                  <span className="text-gray-500">נייד: </span>
                  <span className="font-medium">{client.cellphone}</span>
                </div>
              )}
              {client.phone && (
                <div>
                  <span className="text-gray-500">טלפון: </span>
                  <span className="font-medium">{client.phone}</span>
                </div>
              )}
              {client.email && (
                <div>
                  <span className="text-gray-500">דוא״ל: </span>
                  <span className="font-medium">{client.email}</span>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon="🏦"
            label="קצבת פנסיה חודשית צפויה"
            value={
              minPension > 0
                ? minPension === maxPension
                  ? formatCurrency(minPension)
                  : `${formatCurrency(minPension)} - ${formatCurrency(maxPension)}`
                : "—"
            }
            subtitle="לחודש בפרישה"
            onClick={
              relevantProjections.length > 0
                ? () => router.push("/pension")
                : undefined
            }
          />
          <StatCard
            icon="💰"
            label="סה״כ חיסכון מצטבר"
            value={
              totalSavingsAllProducts > 0
                ? formatCurrency(totalSavingsAllProducts)
                : "—"
            }
            subtitle={
              [
                pensionTotalAccumulated > 0 ? "פנסיה" : "",
                totalSavingsBalance > 0
                  ? `קופות גמל (${totalSavingsTracks} מסלולים)`
                  : "",
              ]
                .filter(Boolean)
                .join(" + ") || undefined
            }
            onClick={
              totalSavingsBalance > 0 ? () => router.push("/savings") : undefined
            }
          />
          <StatCard
            icon="🛡️"
            label="כיסוי ביטוחי"
            value={
              totalInsuranceProducts > 0
                ? `${totalInsuranceProducts} מוצרים`
                : "—"
            }
            subtitle={
              totalInsurancePremium > 0
                ? `פרמיה: ${formatCurrency(totalInsurancePremium)}`
                : providers.size > 0
                  ? `אצל ${providers.size} חברות`
                  : undefined
            }
            onClick={
              totalInsuranceProducts > 0
                ? () => router.push("/insurance")
                : undefined
            }
          />
          <StatCard
            icon="💸"
            label="סה״כ דמי ניהול חודשיים"
            value={
              totalMonthlyFees > 0 ? formatCurrency(totalMonthlyFees) : "—"
            }
            subtitle="בכל המוצרים"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {withdrawalEligibleCount > 0 && (
            <StatCard
              icon="🔓"
              label="זכאות למשיכה"
              value={`${withdrawalEligibleCount} קופות`}
              subtitle="קופות גמל עם זכאות למשיכה"
              onClick={() => router.push("/savings")}
            />
          )}
          <StatCard
            icon="🏔️"
            label="הר הביטוח"
            value={harRecords > 0 ? `${harRecords} רשומות` : "—"}
            subtitle="פוליסות מהמאגר הממשלתי"
            onClick={
              harRecords > 0 ? () => router.push("/har-habituach") : undefined
            }
          />
          <StatCard
            icon="📁"
            label="קבצים שהועלו"
            value={`${successFiles} קבצים`}
            subtitle={errorFiles > 0 ? `${errorFiles} שגיאות` : "בהצלחה"}
            onClick={() => router.push("/file-status")}
          />
        </div>

        {/* Providers */}
        {providers.size > 0 && (
          <Card title="חברות ביטוח ופנסיה שנמצאו" icon="🏢" className="mb-6">
            <div className="flex flex-wrap gap-3">
              {Array.from(providers).map((name) => (
                <span
                  key={name}
                  className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium"
                >
                  {name}
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* Employers */}
        {employers.size > 0 && (
          <Card title="מעסיקים שנמצאו" icon="👔">
            <div className="space-y-2">
              {Array.from(employers.values()).map((emp, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-800">{emp.name}</span>
                  {(emp.city || emp.street) && (
                    <span className="text-gray-500">
                      — {[emp.city, emp.street].filter(Boolean).join(", ")}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
