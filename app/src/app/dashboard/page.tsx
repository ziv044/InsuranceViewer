"use client";

import { useRouter } from "next/navigation";
import { useAppContext } from "@/lib/context";
import Navbar from "@/components/Navbar";
import KPIFusionCard from "@/components/dashboard/KPIFusionCard";
import OrientationBar from "@/components/dashboard/OrientationBar";
import EmptyStateCard from "@/components/dashboard/EmptyStateCard";
import ErrorBoundary from "@/components/dashboard/ErrorBoundary";
import FeeComparisonChart from "@/components/charts/FeeComparisonChart";
import CoverageStatusTable from "@/components/charts/CoverageStatusTable";
import SavingsAllocationDonut from "@/components/charts/SavingsAllocationDonut";
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

  // --- Total annual fees ---
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

  // --- Unique employers ---
  const employers = new Map<string, { name: string; city: string; street: string }>();

  state.inpFiles.forEach((f) => {
    f.products.forEach((p) => {
      if (p.employer?.name) {
        employers.set(p.employer.idNumber || p.employer.name, {
          name: p.employer.name, city: p.employer.city, street: p.employer.street,
        });
      }
    });
  });
  state.kgmFiles.forEach((f) => {
    f.products.forEach((p) => {
      if (p.employer?.name) {
        employers.set(p.employer.idNumber || p.employer.name, {
          name: p.employer.name, city: p.employer.city, street: p.employer.street,
        });
      }
    });
  });
  state.pnnFiles.forEach((f) => {
    f.products.forEach((p) => {
      p.employers.forEach((emp) => {
        if (emp.name) {
          employers.set(emp.idNumber || emp.name, {
            name: emp.name, city: emp.city, street: emp.street,
          });
        }
      });
    });
  });

  // --- Total products count ---
  const totalProducts =
    totalInsuranceProducts +
    state.kgmFiles.reduce((s, f) => s + f.products.length, 0) +
    state.pnnFiles.reduce((s, f) => s + f.products.length, 0);

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

  if (!hasData) {
    return (
      <>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <EmptyStateCard message="לא הועלו קבצים עדיין" />
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

  const pensionValue =
    minPension > 0
      ? minPension === maxPension
        ? formatCurrency(minPension)
        : `${formatCurrency(minPension)} - ${formatCurrency(maxPension)}`
      : "—";

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold text-[var(--primary)]">סיכום כללי</h1>

        {/* Personal Info */}
        {client && (
          <Card title={`${client.firstName} ${client.lastName}`} icon="👤">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 text-sm">
              {client.idNumber && (
                <div><span className="text-gray-500">ת.ז: </span><span className="font-medium">{client.idNumber}</span></div>
              )}
              {client.birthDate && (
                <div><span className="text-gray-500">תאריך לידה: </span><span className="font-medium">{formatDate(client.birthDate)}</span></div>
              )}
              {client.gender && (
                <div><span className="text-gray-500">מין: </span><span className="font-medium">{genderLabel(client.gender)}</span></div>
              )}
              {client.maritalStatus && (
                <div><span className="text-gray-500">מצב משפחתי: </span><span className="font-medium">{maritalStatusLabel(client.maritalStatus)}</span></div>
              )}
              {(client.city || client.street) && (
                <div><span className="text-gray-500">כתובת: </span><span className="font-medium">{[client.street, client.houseNumber, client.city].filter(Boolean).join(" ")}{client.zipCode ? ` (${client.zipCode})` : ""}</span></div>
              )}
              {client.cellphone && (
                <div><span className="text-gray-500">נייד: </span><span className="font-medium">{client.cellphone}</span></div>
              )}
              {client.email && (
                <div><span className="text-gray-500">דוא״ל: </span><span className="font-medium">{client.email}</span></div>
              )}
            </div>
          </Card>
        )}

        {/* Orientation Bar */}
        <OrientationBar
          products={totalProducts}
          providers={providers.size}
          employers={employers.size}
        />

        {/* KPI Fusion Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KPIFusionCard
            value={totalSavingsAllProducts > 0 ? formatCurrency(totalSavingsAllProducts) : "—"}
            sentence="סה״כ חיסכון מצטבר בכל המוצרים"
            status={totalSavingsAllProducts > 0 ? "healthy" : "neutral"}
            detailsLink={
              totalSavingsBalance > 0
                ? { label: "צפייה בקופות גמל ←", onClick: () => router.push("/savings") }
                : undefined
            }
          />
          <KPIFusionCard
            value={pensionValue}
            sentence="קצבת פנסיה חודשית צפויה בגיל 67"
            status={minPension > 0 ? "healthy" : "neutral"}
            detailsLink={
              relevantProjections.length > 0
                ? { label: "צפייה בפנסיה ←", onClick: () => router.push("/pension") }
                : undefined
            }
          />
          <KPIFusionCard
            value={totalInsuranceProducts > 0 ? `${totalInsuranceProducts} כיסויים` : "—"}
            sentence={
              totalInsurancePremium > 0
                ? `פרמיה חודשית: ${formatCurrency(totalInsurancePremium)}`
                : "כיסויים ביטוחיים"
            }
            status={totalInsuranceProducts > 0 ? "healthy" : "neutral"}
            detailsLink={
              totalInsuranceProducts > 0
                ? { label: "צפייה בביטוח ←", onClick: () => router.push("/insurance") }
                : undefined
            }
          />
        </div>

        {/* Action Items Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {totalMonthlyFees > 0 && (
            <KPIFusionCard
              value={formatCurrency(totalMonthlyFees * 12)}
              sentence="סה״כ דמי ניהול בשנה"
              status="attention"
            />
          )}
          {withdrawalEligibleCount > 0 && (
            <KPIFusionCard
              value={`${withdrawalEligibleCount} קופות`}
              sentence="זכאות למשיכה"
              status="attention"
              detailsLink={{ label: "צפייה בקופות ←", onClick: () => router.push("/savings") }}
            />
          )}
          {harRecords > 0 && (
            <KPIFusionCard
              value={`${harRecords} רשומות`}
              sentence="נמצאו בהר הביטוח"
              detailsLink={{ label: "צפייה ←", onClick: () => router.push("/har-habituach") }}
            />
          )}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ErrorBoundary>
            <SavingsAllocationDonut />
          </ErrorBoundary>
          <ErrorBoundary>
            <FeeComparisonChart />
          </ErrorBoundary>
        </div>

        {/* Coverage Status Table */}
        <ErrorBoundary>
          <CoverageStatusTable />
        </ErrorBoundary>

        {/* Providers */}
        {providers.size > 0 && (
          <Card title="חברות ביטוח ופנסיה" icon="🏢">
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
          <Card title="מעסיקים" icon="👔">
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
