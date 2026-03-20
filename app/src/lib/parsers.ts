import { XMLParser } from "fast-xml-parser";
import * as XLSX from "xlsx";
import { HAR_HABITUACH_CONFIG } from "./har-habituach-config";
import type {
  FileHeader,
  Provider,
  ContactInfo,
  Employer,
  ClientInfo,
  Beneficiary,
  FeeActual,
  FeeStructureEntry,
  ReturnData,
  DebtInfo,
  LoanInfo,
  ClaimInfo,
  LienInfo,
  InsuranceCoverage,
  InsuranceProduct,
  SavingsProduct,
  PensionProduct,
  InvestmentTrack,
  PensionProjection,
  PensionCoverage,
  SurvivorPension,
  BalanceBlock,
  WithdrawalEligibility,
  EmploymentTerms,
  Deposit,
  ParsedINP,
  ParsedKGM,
  ParsedPNN,
  ParsedHarHabituach,
  ParsedFile,
  HarHabituachRecord,
} from "./types";

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  isArray: (name) => {
    return [
      "Mutzar",
      "YeshutMaasik",
      "Sheer",
      "Mutav",
      "Kisuim",
      "HeshbonOPolisa",
      "PerutHafkadaAchrona",
      "PerutHafkadotMetchilatShana",
      "PerutMasluleiHashkaa",
      "PerutMivneDmeiNihul",
      "PerutHafrashotLePolisa",
      "YitraLefiGilPrisha",
      "Kupa",
      "BlockItra",
      "ChovPigur",
      "HafkadaShnatit",
      "PirteiKisuiBeMutzar",
      "ZihuiKisui",
      "HanachotBekisui",
      "PirteiTaktziv",
    ].includes(name);
  },
});

// ─── Helpers ───────────────────────────────────────────────

function getVal(obj: Record<string, unknown>, key: string): string {
  const val = obj?.[key];
  if (val === null || val === undefined) return "";
  if (typeof val === "object" && val !== null) return "";
  return String(val);
}

function getNum(obj: Record<string, unknown>, key: string): number {
  const val = getVal(obj, key);
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}

function getNumOrNull(obj: Record<string, unknown>, key: string): number | null {
  const val = getVal(obj, key);
  if (!val) return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

function getBool(obj: Record<string, unknown>, key: string, trueVal = "1"): boolean {
  return getVal(obj, key) === trueVal;
}

function asArray<T>(val: T | T[] | undefined | null): T[] {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}

// ─── Shared Parsers ───────────────────────────────────────

function parseContact(obj: Record<string, unknown>): ContactInfo {
  if (!obj) return { firstName: "", lastName: "", country: "", city: "", street: "", houseNumber: "", zipCode: "", phone: "", cellphone: "", fax: "", email: "" };
  return {
    firstName: getVal(obj, "SHEM-PRATI"),
    lastName: getVal(obj, "SHEM-MISHPACHA"),
    country: getVal(obj, "ERETZ"),
    city: getVal(obj, "SHEM-YISHUV"),
    street: getVal(obj, "SHEM-RECHOV"),
    houseNumber: getVal(obj, "MISPAR-BAIT"),
    zipCode: getVal(obj, "MIKUD"),
    phone: getVal(obj, "MISPAR-TELEPHONE-KAVI"),
    cellphone: getVal(obj, "MISPAR-CELLULARI"),
    fax: getVal(obj, "MISPAR-FAX"),
    email: getVal(obj, "E-MAIL"),
  };
}

function parseHeader(koteretKovetz: Record<string, unknown>): FileHeader {
  return {
    sugMimshak: getVal(koteretKovetz, "SUG-MIMSHAK"),
    xmlVersion: getVal(koteretKovetz, "MISPAR-GIRSAT-XML"),
    executionDate: getVal(koteretKovetz, "TAARICH-BITZUA"),
    senderCode: getVal(koteretKovetz, "KOD-SHOLEACH"),
    senderName: getVal(koteretKovetz, "SHEM-SHOLEACH"),
    operatorCode: getVal(koteretKovetz, "KOD-MEZAHE-METAFEL"),
    operatorName: getVal(koteretKovetz, "SHEM-METAFEL"),
  };
}

function parseProvider(yeshutYatzran: Record<string, unknown>): Provider {
  const contactObj = yeshutYatzran?.["IshKesherYeshutYatzran"] as Record<string, unknown> | undefined;
  return {
    code: getVal(yeshutYatzran, "KOD-MEZAHE-YATZRAN"),
    name: getVal(yeshutYatzran, "SHEM-YATZRAN"),
    contact: parseContact(contactObj || {}),
  };
}

function parseEmployer(maasik: Record<string, unknown>): Employer {
  return {
    code: getVal(maasik, "MPR-MAASIK-BE-YATZRAN"),
    idNumber: getVal(maasik, "MISPAR-MEZAHE-MAASIK"),
    name: getVal(maasik, "SHEM-MAASIK"),
    city: getVal(maasik, "SHEM-YISHUV"),
    street: getVal(maasik, "SHEM-RECHOV"),
    zipCode: getVal(maasik, "MIKUD"),
    phone: getVal(maasik, "MISPAR-TELEPHONE-KAVI"),
    cellphone: getVal(maasik, "MISPAR-CELLULARI"),
    email: getVal(maasik, "E-MAIL"),
  };
}

function parseClient(yeshutLakoach: Record<string, unknown> | undefined): ClientInfo | undefined {
  if (!yeshutLakoach) return undefined;
  return {
    idType: getVal(yeshutLakoach, "SUG-MEZAHE-LAKOACH"),
    idNumber: getVal(yeshutLakoach, "MISPAR-ZIHUY-LAKOACH"),
    firstName: getVal(yeshutLakoach, "SHEM-PRATI"),
    lastName: getVal(yeshutLakoach, "SHEM-MISHPACHA"),
    gender: getVal(yeshutLakoach, "MIN"),
    birthDate: getVal(yeshutLakoach, "TAARICH-LEYDA"),
    maritalStatus: getVal(yeshutLakoach, "MATZAV-MISHPACHTI"),
    city: getVal(yeshutLakoach, "SHEM-YISHUV"),
    street: getVal(yeshutLakoach, "SHEM-RECHOV"),
    houseNumber: getVal(yeshutLakoach, "MISPAR-BAIT"),
    zipCode: getVal(yeshutLakoach, "MIKUD"),
    phone: getVal(yeshutLakoach, "MISPAR-TELEPHONE-KAVI"),
    cellphone: getVal(yeshutLakoach, "MISPAR-CELLULARI"),
    email: getVal(yeshutLakoach, "E-MAIL"),
  };
}

function parseBeneficiary(mutav: Record<string, unknown>): Beneficiary {
  return {
    idType: getVal(mutav, "KOD-ZIHUY-MUTAV"),
    idNumber: getVal(mutav, "MISPAR-ZIHUY-MUTAV"),
    firstName: getVal(mutav, "SHEM-PRATI-MUTAV"),
    lastName: getVal(mutav, "SHEM-MISHPACHA-MUTAV"),
    percentage: getNum(mutav, "ACHUZ-MUTAV"),
    definition: getVal(mutav, "HAGDARAT-MUTAV"),
    type: getVal(mutav, "MAHUT-MUTAV"),
  };
}

function parseFeeActual(hotzaot: Record<string, unknown> | undefined): FeeActual | null {
  if (!hotzaot) return null;
  const bafoal = hotzaot["HotzaotBafoalLehodeshDivoach"] as Record<string, unknown> | undefined;
  if (!bafoal) return null;
  // Some XML files store SHEUR-DMEI-NIHUL-TZVIRA as a decimal fraction (e.g. 0.0067)
  // instead of a percentage (0.67). Normalize: if < 0.1, multiply by 100.
  const rawSavingsRate = getNum(bafoal, "SHEUR-DMEI-NIHUL-TZVIRA");
  const savingsFeeRate = rawSavingsRate > 0 && rawSavingsRate < 0.1 ? rawSavingsRate * 100 : rawSavingsRate;
  return {
    depositFeeRate: getNum(bafoal, "SHEUR-DMEI-NIHUL-HAFKADA"),
    depositFeeTotal: getNum(bafoal, "TOTAL-DMEI-NIHUL-HAFKADA"),
    savingsFeeRate,
    savingsFeeTotal: getNum(bafoal, "TOTAL-DMEI-NIHUL-TZVIRA"),
    otherFees: getNum(bafoal, "SACH-DMEI-NIHUL-ACHERIM"),
    totalFees: getNum(bafoal, "TOTAL-DMEI-NIHUL-POLISA-O-HESHBON"),
    avgDepositFeeRate: getNum(bafoal, "MEMOTZA-SHEUR-DMEI-NIHUL-HAFKADA"),
    avgDepositFeeTotal: getNum(bafoal, "MEMOTZA-TOTAL-DMEI-NIHUL-HAFKADA"),
    insurancePremiumCollected: getNumOrNull(bafoal, "SACH-DMEI-BITUAH-SHENIGBOO"),
  };
}

function parseFeeStructure(mivne: Record<string, unknown> | undefined): FeeStructureEntry[] {
  if (!mivne) return [];
  const entries = asArray(mivne["PerutMivneDmeiNihul"] as Record<string, unknown>[]);
  return entries.map((e) => ({
    feeType: getVal(e, "SUG-HOTZAA"),
    feeRate: getNum(e, "SHEUR-DMEI-NIHUL"),
    contributionType: getVal(e, "OFEN-HAFRASHA"),
    hasDiscount: getBool(e, "KAYEMET-HATAVA"),
    discountPercent: getNum(e, "ACHOZ-HATAVA"),
    discountEndDate: getVal(e, "TAARICH-SIUM-HATAVA"),
  }));
}

function parseReturns(tsua: Record<string, unknown> | undefined): ReturnData | null {
  if (!tsua) return null;
  return {
    netReturnRate: getNum(tsua, "SHEUR-TSUA-NETO"),
    guaranteedReturnRate: getNumOrNull(tsua, "SHEUR-TSUA-MOVTACHAT-MEYOADOT"),
    profitLoss: getNum(tsua, "REVACH-HEFSED-BENIKOI-HOZAHOT"),
    profitLossSign: getVal(tsua, "SIMAN-REVACH-HEFSED"),
    guaranteedReturn: getNumOrNull(tsua, "ACHUZ-TSUA-MUVTAHT"),
  };
}

function parseDebt(chovotPigurim: Record<string, unknown> | undefined): DebtInfo | null {
  if (!chovotPigurim) return null;
  const chovList = asArray(chovotPigurim["ChovPigur"] as Record<string, unknown>[]);
  if (chovList.length === 0) return null;
  const chov = chovList[0];
  return {
    hasDebt: getVal(chov, "KAYAM-CHOV-O-PIGUR") === "1",
    debtStartDate: getVal(chov, "TAARICH-TECHILAT-PIGUR"),
    monthsInArrears: getNumOrNull(chov, "MISPAR-CHODSHEI-PIGUR"),
    debtType: getVal(chov, "SUG-HOV"),
    totalDebt: getNumOrNull(chov, "TOTAL-CHOVOT-O-PIGURIM"),
  };
}

function parseLoan(halvaa: Record<string, unknown> | undefined): LoanInfo | null {
  if (!halvaa) return null;
  return {
    hasLoan: getBool(halvaa, "YESH-HALVAA-BAMUTZAR"),
    loanAmount: getNumOrNull(halvaa, "SCHUM-HALVAA"),
    loanStartDate: getVal(halvaa, "TAARICH-KABALAT-HALVAA"),
    loanEndDate: getVal(halvaa, "TAARICH-SIYUM-HALVAA"),
    loanBalance: getNumOrNull(halvaa, "YITRAT-HALVAA"),
    interestRate: getNumOrNull(halvaa, "RIBIT"),
    interestType: getVal(halvaa, "SUG-RIBIT"),
    repaymentAmount: getNumOrNull(halvaa, "SCHUM-HECHZER-TKUFATI"),
  };
}

function parseClaim(pirteyTvia: Record<string, unknown> | undefined): ClaimInfo | null {
  if (!pirteyTvia) return null;
  return {
    hasClaim: getBool(pirteyTvia, "YESH-TVIA"),
    claimNumber: getVal(pirteyTvia, "MISPAR-TVIA-BE-YATZRAN"),
    claimType: getVal(pirteyTvia, "SUG-HATVIAA"),
    claimStatus: getVal(pirteyTvia, "KOD-STATUS-TVIAA"),
  };
}

function parseLien(perut: Record<string, unknown> | undefined): LienInfo | null {
  if (!perut) return null;
  return {
    hasLien: getBool(perut, "HUTAL-SHIABUD"),
    hasAttachment: getBool(perut, "HUTAL-IKUL"),
  };
}

// ─── Get nested HeshbonOPolisa ────────────────────────────

function getPolisa(mutzar: Record<string, unknown>): Record<string, unknown> {
  const heshbonotOPolisot = mutzar["HeshbonotOPolisot"] as Record<string, unknown> | undefined;
  if (!heshbonotOPolisot) return {};
  const heshbonList = asArray(heshbonotOPolisot["HeshbonOPolisa"] as Record<string, unknown>[]);
  return heshbonList[0] || {};
}

// ─── File Type Detection ──────────────────────────────────

function detectFileType(xml: string): "INP" | "KGM" | "PNN" | null {
  if (xml.includes("CONSLTINP") || xml.includes("INP")) return "INP";
  if (xml.includes("CONSLTKGM") || xml.includes("KGM")) return "KGM";
  if (xml.includes("CONSLTPNN") || xml.includes("PNN")) return "PNN";
  if (xml.includes("<SUG-MUTZAR>6</SUG-MUTZAR>")) return "INP";
  if (xml.includes("<SUG-MUTZAR>4</SUG-MUTZAR>")) return "KGM";
  if (xml.includes("<SUG-MUTZAR>2</SUG-MUTZAR>") && xml.includes("KEREN-PENSIA")) return "PNN";
  return null;
}

// ─── INP Parser ───────────────────────────────────────────

function parseINP(parsed: Record<string, unknown>, fileName: string): ParsedINP {
  const mimshak = parsed["Mimshak"] as Record<string, unknown>;
  const header = parseHeader(mimshak["KoteretKovetz"] as Record<string, unknown>);
  const yeshutYatzran = mimshak["YeshutYatzran"] as Record<string, unknown>;
  const provider = parseProvider(yeshutYatzran);

  const mutzarim = yeshutYatzran["Mutzarim"] as Record<string, unknown>;
  const mutzarList = asArray(mutzarim?.["Mutzar"] as Record<string, unknown>[]);

  const products: InsuranceProduct[] = mutzarList.map((mutzar) => {
    const netunei = (mutzar["NetuneiMutzar"] || {}) as Record<string, unknown>;
    const maasikList = asArray(netunei["YeshutMaasik"] as Record<string, unknown>[]);
    const employer = maasikList.length > 0 ? parseEmployer(maasikList[0]) : undefined;
    const client = parseClient(netunei["YeshutLakoach"] as Record<string, unknown> | undefined);

    const polisa = getPolisa(mutzar);

    // Parse deposits
    const deposits: Deposit[] = [];
    const pirteiHafkada = polisa["PirteiHafkadaAchrona"] as Record<string, unknown> | undefined;
    if (pirteiHafkada) {
      const perut = pirteiHafkada["PerutPirteiHafkadaAchrona"] as Record<string, unknown> | undefined;
      if (perut) {
        const hafkadaList = asArray(perut["PerutHafkadaAchrona"] as Record<string, unknown>[]);
        for (const h of hafkadaList) {
          deposits.push({
            date: getVal(perut, "TAARICH-HAFKADA-ACHARON"),
            amount: getNum(h, "SCHUM-HAFKADA-SHESHULAM"),
            contributionType: getVal(h, "SUG-HAFRASHA"),
            depositorType: getVal(h, "SUG-MAFKID"),
          });
        }
      }
    }
    // Also add year-start deposits
    const yearDeposits = asArray(polisa["PerutHafkadotMetchilatShana"] as Record<string, unknown>[]);
    for (const h of yearDeposits) {
      deposits.push({
        date: getVal(h, "TAARICH-ERECH-HAFKADA"),
        amount: getNum(h, "SCHUM-HAFKADA-SHESHULAM"),
        contributionType: getVal(h, "SUG-HAFRASHA"),
        depositorType: getVal(h, "SUG-MAFKID"),
      });
    }

    // Parse coverages
    const coverages: InsuranceCoverage[] = [];
    const kisuimList = asArray(polisa["Kisuim"] as Record<string, unknown>[]);
    const allBeneficiaries: Beneficiary[] = [];

    for (const kisuimWrapper of kisuimList) {
      const zihuiList = asArray(kisuimWrapper["ZihuiKisui"] as Record<string, unknown>[]);
      for (const zihui of zihuiList) {
        const pirteiList = asArray(zihui["PirteiKisuiBeMutzar"] as Record<string, unknown>[]);
        const pirtei = pirteiList[0] || {};

        const mutavList = asArray(pirtei["Mutav"] as Record<string, unknown>[]);
        const coverageBeneficiaries = mutavList.map(parseBeneficiary);
        allBeneficiaries.push(...coverageBeneficiaries);

        coverages.push({
          coverageCode: getVal(zihui, "MISPAR-KISUI-BE-YATZRAN"),
          coverageName: getVal(zihui, "SHEM-KISUI-YATZRAN"),
          attachmentCode: getVal(pirtei, "KOD-NISPACH-KISUY"),
          insuranceAmount: getNum(pirtei, "SCHUM-BITUACH"),
          paymentMethod: getVal(pirtei, "OFEN-TASHLUM-SCHUM-BITUACH"),
          premium: getNum(pirtei, "DMEI-BITUAH-LETASHLUM-BAPOAL"),
          payer: getVal(pirtei, "MESHALEM-HAKISUY"),
          approvalStatus: getVal(pirtei, "KOD-ISHUN"),
          isUnderwritten: getBool(pirtei, "IND-CHITUM"),
          hasExclusion: getVal(pirtei, "HACHRAGA") === "1",
          hasDiscount: getVal(pirtei, "HANACHA") === "1",
          discountRate: getNum(pirtei, "SHIUR-HANACHA-BEKISUI"),
          discountEndDate: getVal(pirtei, "MOED-SIUM-TKUFAT-HANACHA"),
          beneficiaries: coverageBeneficiaries,
        });
      }
    }

    // Parse fees
    const perutHotzaot = polisa["PerutHotzaot"] as Record<string, unknown> | undefined;
    const fees = parseFeeActual(perutHotzaot);
    const mivneDmeiNihul = perutHotzaot?.["MivneDmeiNihul"] as Record<string, unknown> | undefined;
    const feeStructure = parseFeeStructure(mivneDmeiNihul);

    const totalInsurancePremium = coverages.reduce((sum, c) => sum + c.premium, 0);

    return {
      providerCode: getVal(netunei, "KOD-MEZAHE-YATZRAN"),
      providerName: provider.name,
      productType: getVal(netunei, "SUG-MUTZAR"),
      planName: getVal(polisa, "SHEM-TOCHNIT"),
      policyNumber: getVal(polisa, "MISPAR-POLISA-O-HESHBON"),
      status: getVal(polisa, "STATUS-POLISA-O-CHESHBON"),
      policyType: getVal(polisa, "SUG-POLISA"),
      planType: getVal(polisa, "SUG-TOCHNIT-O-CHESHBON"),
      joinDate: getVal(polisa, "TAARICH-HITZTARFUT-MUTZAR"),
      firstJoinDate: getVal(polisa, "TAARICH-HITZTARFUT-RISHON"),
      statusUpdateDate: getVal(polisa, "TAARICH-IDKUN-STATUS"),
      indexBasis: getNumOrNull(polisa, "MADAD-BASIS"),
      contributionPercent: getNum(polisa, "ACHUZ-HAFRASHA"),
      subAnnualRate: getNum(polisa, "ACHUZ-TAT-SHNATIYOT"),
      lastDepositDate: getVal(polisa, "TAARICH-HAFKADA-ACHARON"),
      deposits,
      coverages,
      fees,
      feeStructure,
      beneficiaries: allBeneficiaries,
      debt: parseDebt(polisa["ChovotPigurim"] as Record<string, unknown> | undefined),
      lien: parseLien(polisa["PerutShiabudIkul"] as Record<string, unknown> | undefined),
      loan: parseLoan(polisa["Halvaa"] as Record<string, unknown> | undefined),
      claim: parseClaim(polisa["PirteyTvia"] as Record<string, unknown> | undefined),
      employer,
      client,
      withdrawalPenalty: getVal(polisa, "KENAS-MESHICHAT-KESAFIM") === "1",
      totalInsurancePremium,
    };
  });

  return { type: "INP", header, provider, products, fileName };
}

// ─── KGM Parser ───────────────────────────────────────────

function parseKGM(parsed: Record<string, unknown>, fileName: string): ParsedKGM {
  const mimshak = parsed["Mimshak"] as Record<string, unknown>;
  const header = parseHeader(mimshak["KoteretKovetz"] as Record<string, unknown>);
  const yeshutYatzran = mimshak["YeshutYatzran"] as Record<string, unknown>;
  const provider = parseProvider(yeshutYatzran);

  const mutzarim = yeshutYatzran["Mutzarim"] as Record<string, unknown>;
  const mutzarList = asArray(mutzarim?.["Mutzar"] as Record<string, unknown>[]);

  const products: SavingsProduct[] = mutzarList.map((mutzar) => {
    const netunei = (mutzar["NetuneiMutzar"] || {}) as Record<string, unknown>;
    const maasikList = asArray(netunei["YeshutMaasik"] as Record<string, unknown>[]);
    const employer = maasikList.length > 0 ? parseEmployer(maasikList[0]) : undefined;
    const client = parseClient(netunei["YeshutLakoach"] as Record<string, unknown> | undefined);

    const polisa = getPolisa(mutzar);

    // Parse investment tracks (directly on polisa or inside PirteiTaktziv)
    const tracks: InvestmentTrack[] = [];
    const masluleiList = asArray(polisa["PerutMasluleiHashkaa"] as Record<string, unknown>[]);
    for (const m of masluleiList) {
      tracks.push({
        trackCode: getVal(m, "KOD-MASLUL-HASHKAA"),
        trackType: getVal(m, "KOD-SUG-MASLUL"),
        contributionType: getVal(m, "KOD-SUG-HAFRASHA"),
        trackName: getVal(m, "SHEM-MASLUL-HASHKAA"),
        balance: getNum(m, "SCHUM-TZVIRA-BAMASLUL"),
        netReturn: getNum(m, "TSUA-NETO"),
        allocationPercent: getNum(m, "ACHUZ-HAFKADA-LEHASHKAA"),
        depositFeeRate: getNumOrNull(m, "SHEUR-DMEI-NIHUL-HAFKADA"),
        savingsFeeRate: getNumOrNull(m, "SHEUR-DMEI-NIHUL-HISACHON"),
        annualCostRate: getNumOrNull(m, "SHIUR-ALUT-SHNATIT-ZPUIA-LMSLUL-HASHKAH"),
      });
    }
    // Also check inside PirteiTaktziv (some KGM files nest tracks there)
    const taktzivList = asArray(polisa["PirteiTaktziv"] as Record<string, unknown>[]);
    for (const taktziv of taktzivList) {
      const masluleiInTaktziv = asArray(taktziv["PerutMasluleiHashkaa"] as Record<string, unknown>[]);
      for (const m of masluleiInTaktziv) {
        tracks.push({
          trackCode: getVal(m, "KOD-MASLUL-HASHKAA"),
          trackType: getVal(m, "KOD-SUG-MASLUL"),
          contributionType: getVal(m, "KOD-SUG-HAFRASHA"),
          trackName: getVal(m, "SHEM-MASLUL-HASHKAA"),
          balance: getNum(m, "SCHUM-TZVIRA-BAMASLUL"),
          netReturn: getNum(m, "TSUA-NETO"),
          allocationPercent: getNum(m, "ACHUZ-HAFKADA-LEHASHKAA"),
          depositFeeRate: getNumOrNull(m, "SHEUR-DMEI-NIHUL-HAFKADA"),
          savingsFeeRate: getNumOrNull(m, "SHEUR-DMEI-NIHUL-HISACHON"),
          annualCostRate: getNumOrNull(m, "SHIUR-ALUT-SHNATIT-ZPUIA-LMSLUL-HASHKAH"),
        });
      }
    }

    const totalBalance = tracks.reduce((sum, t) => sum + t.balance, 0);

    // Contribution percentages from PerutHafrashotLePolisa
    let employeePercent = 0;
    let employerPercent = 0;
    const hafrashotList = asArray(polisa["PerutHafrashotLePolisa"] as Record<string, unknown>[]);
    for (const h of hafrashotList) {
      const sugHafrasha = getVal(h, "SUG-HAFRASHA");
      const pct = getNum(h, "ACHUZ-HAFRASHA");
      if (sugHafrasha === "8") employeePercent = pct;
      else if (sugHafrasha === "9") employerPercent = pct;
    }

    // Returns
    const returns = parseReturns(polisa["Tsua"] as Record<string, unknown> | undefined);

    // Fees
    const perutHotzaot = polisa["PerutHotzaot"] as Record<string, unknown> | undefined;
    const fees = parseFeeActual(perutHotzaot);
    const mivneDmeiNihul = perutHotzaot?.["MivneDmeiNihul"] as Record<string, unknown> | undefined;
    const feeStructure = parseFeeStructure(mivneDmeiNihul);

    // Balance blocks
    const balanceBlocks: BalanceBlock[] = [];
    const blockItrot = polisa["BlockItrot"] as Record<string, unknown> | undefined;
    if (blockItrot) {
      const itraList = asArray(blockItrot["BlockItra"] as Record<string, unknown>[]);
      for (const itra of itraList) {
        balanceBlocks.push({
          balanceType: getVal(itra, "KOD-SUG-ITRA"),
          taxLayer: getVal(itra, "KOD-TECHULAT-SHICHVA"),
          totalAccumulated: getNum(itra, "TOTAL-CHISACHON-MTZBR"),
          severanceCurrentEmployer: getNum(itra, "ERECH-PIDION-PITZUIM-MAASIK-NOCHECHI"),
          severanceCurrentComponent: getNum(itra, "ERECH-PIDION-MARKIV-PITZUIM-LEMAS-NOCHECHI"),
          severancePreviousEmployers: getNum(itra, "ERECH-PIDION-PITZUIM-LEHON-MAAVIDIM-KODMIM"),
          severanceContinuity: getNum(itra, "ERECH-PIDION-PITZUIM-MAAVIDIM-KODMIM-RETZEF-ZEHUYUT"),
          hasSeveranceContinuityPension: getVal(itra, "KAYAM-RETZEF-PITZUIM-KITZBA") === "1",
          hasSeveranceRightsContinuity: getVal(itra, "KAYAM-RETZEF-ZECHUYOT-PITZUIM") === "1",
        });
      }
    }

    // Withdrawal eligibility
    let withdrawal: WithdrawalEligibility | null = null;
    const nesilut = polisa["NesilutTag"] as Record<string, unknown> | undefined;
    if (nesilut) {
      const date = getVal(nesilut, "MOED-NEZILUT-TAGMULIM");
      const amount = getNum(nesilut, "YITRAT-KASPEY-TAGMULIM");
      if (date) withdrawal = { eligibilityDate: date, eligibleAmount: amount };
    }

    // Employment terms
    let employmentTerms: EmploymentTerms | null = null;
    const pirteiTaktziv = polisa["PirteiTaktziv"] as Record<string, unknown> | undefined;
    if (pirteiTaktziv) {
      const pirteiOved = pirteiTaktziv["PirteiOved"] as Record<string, unknown> | undefined;
      const pirteiHaasaka = pirteiTaktziv["PirteiHaasaka"] as Record<string, unknown> | undefined;
      if (pirteiOved || pirteiHaasaka) {
        employmentTerms = {
          planType: getVal(pirteiOved || {}, "SUG-TOCHNIT-O-CHESHBON"),
          employerStatus: getVal(pirteiOved || {}, "STATUS-MAASIK"),
          unconditionalRight: getVal(pirteiHaasaka || {}, "ZAKAUT-LELO-TNAI"),
          clause14: getVal(pirteiHaasaka || {}, "SEIF-14"),
          salaryCalculation: getVal(pirteiHaasaka || {}, "KOD-CHISHUV-SACHAR-POLISA-O-HESHBON"),
          salary: getNum(pirteiHaasaka || {}, "SACHAR-POLISA"),
          salaryDate: getVal(pirteiHaasaka || {}, "TAARICH-MASKORET"),
        };
      }
    }

    // Beneficiaries
    const mutavList = asArray(polisa["Mutav"] as Record<string, unknown>[]);
    const beneficiaries = mutavList.map(parseBeneficiary);

    // Projected balance at retirement
    let projectedBalanceAtRetirement: number | null = null;
    const yitraList = asArray(polisa["YitraLefiGilPrisha"] as Record<string, unknown>[]);
    if (yitraList.length > 0) {
      // Take last projection (highest age)
      const last = yitraList[yitraList.length - 1];
      projectedBalanceAtRetirement = getNumOrNull(last, "TOTAL-CHISACHON-MITZTABER-TZAFUY");
    }

    return {
      providerCode: getVal(netunei, "KOD-MEZAHE-YATZRAN"),
      providerName: provider.name,
      productType: getVal(netunei, "SUG-MUTZAR"),
      planName: getVal(polisa, "SHEM-TOCHNIT"),
      accountNumber: getVal(polisa, "MISPAR-POLISA-O-HESHBON"),
      status: getVal(polisa, "STATUS-POLISA-O-CHESHBON") || getVal(netunei, "STATUS-RESHOMA"),
      joinDate: getVal(polisa, "TAARICH-HITZTARFUT-MUTZAR"),
      employeeContributionPercent: employeePercent,
      employerContributionPercent: employerPercent,
      totalNetReturn: returns?.netReturnRate || 0,
      tracks,
      totalBalance,
      yearEndBalance: getNumOrNull(polisa, "YITRAT-SOF-SHANA"),
      returns,
      fees,
      feeStructure,
      balanceBlocks,
      withdrawal,
      employmentTerms,
      beneficiaries,
      debt: parseDebt(polisa["ChovotPigurim"] as Record<string, unknown> | undefined),
      lien: parseLien(polisa["PerutShiabudIkul"] as Record<string, unknown> | undefined),
      loan: parseLoan(polisa["Halvaa"] as Record<string, unknown> | undefined),
      projectedBalanceAtRetirement,
      employer,
      client,
    };
  });

  return { type: "KGM", header, provider, products, fileName };
}

// ─── PNN Parser ───────────────────────────────────────────

function parsePNN(parsed: Record<string, unknown>, fileName: string): ParsedPNN {
  const mimshak = parsed["Mimshak"] as Record<string, unknown>;
  const header = parseHeader(mimshak["KoteretKovetz"] as Record<string, unknown>);
  const yeshutYatzran = mimshak["YeshutYatzran"] as Record<string, unknown>;
  const provider = parseProvider(yeshutYatzran);

  const mutzarim = yeshutYatzran["Mutzarim"] as Record<string, unknown>;
  const mutzarList = asArray(mutzarim?.["Mutzar"] as Record<string, unknown>[]);

  const products: PensionProduct[] = mutzarList.map((mutzar) => {
    const netunei = (mutzar["NetuneiMutzar"] || {}) as Record<string, unknown>;
    const maasikList = asArray(netunei["YeshutMaasik"] as Record<string, unknown>[]);
    const employers = maasikList.map(parseEmployer);
    const client = parseClient(netunei["YeshutLakoach"] as Record<string, unknown> | undefined);

    const polisa = getPolisa(mutzar);
    const pensionTypeCode = getVal(polisa, "PENSIA-VATIKA-O-HADASHA");

    // Pension projections from YitraLefiGilPrisha
    const projections: PensionProjection[] = [];
    const yitraList = asArray(polisa["YitraLefiGilPrisha"] as Record<string, unknown>[]);
    for (const yitra of yitraList) {
      const kupot = yitra["Kupot"] as Record<string, unknown> | undefined;
      const kupaList = kupot ? asArray(kupot["Kupa"] as Record<string, unknown>[]) : [];
      const kupa = kupaList[0] || {};

      projections.push({
        retirementAge: getNum(yitra, "GIL-PRISHA"),
        monthlyPension: getNum(kupa, "SCHUM-KITZVAT-ZIKNA"),
        projectedMonthlyPension: getNum(kupa, "KITZVAT-HODSHIT-TZFUYA"),
        totalAccumulated: getNum(yitra, "TOTAL-CHISACHON-MITZTABER-TZAFUY"),
        totalAccumulatedWithoutPremiums: getNum(yitra, "TZVIRAT-CHISACHON-CHAZUYA-LELO-PREMIYOT"),
        returnRate: getNum(kupa, "ACHUZ-TSUA-BATACHAZIT"),
      });
    }

    // Coverage in pension (KisuiBKerenPensia)
    let coverage: PensionCoverage | null = null;
    const kisuiKeren = polisa["KisuiBKerenPensia"] as Record<string, unknown> | undefined;
    if (kisuiKeren) {
      coverage = {
        disabilityCost: getNum(kisuiKeren, "ALUT-KISUI-NECHUT"),
        survivorPensionCost: getNum(kisuiKeren, "ALUT-KISUI-PNS-SHRM-NECHE"),
        survivorsCost: getNum(kisuiKeren, "ALUT-KISUY-SHEERIM"),
      };
    }

    // Survivor pension amounts
    let survivorPension: SurvivorPension | null = null;
    const kisuim = polisa["Kisuim"] as Record<string, unknown> | undefined;
    if (kisuim || kisuiKeren) {
      const src = kisuiKeren || kisuim || {};
      const sp = getNum(src as Record<string, unknown>, "KITZBAT-SHEERIM-LEALMAN-O-ALMANA");
      const op = getNum(src as Record<string, unknown>, "KITZBAT-SHEERIM-LEYATOM");
      const dp = getNum(src as Record<string, unknown>, "KITZBAT-SHEERIM-LEHORE-NITMACH");
      if (sp > 0 || op > 0 || dp > 0) {
        survivorPension = { spousePension: sp, orphanPension: op, dependentParentPension: dp };
      }
    }

    // Returns
    const returns = parseReturns(polisa["Tsua"] as Record<string, unknown> | undefined);

    // Fees — in PNN, PerutHotzaot lives inside PirteiTaktziv (per-employer), not directly on polisa
    let fees: FeeActual | null = null;
    let feeStructure: FeeStructureEntry[] = [];
    const taktzivList = asArray(polisa["PirteiTaktziv"] as Record<string, unknown>[]);

    // Aggregate fees across all employer sections
    let totalSavingsFeeRate = 0;
    let totalSavingsFeeTotal = 0;
    let totalDepositFeeRate = 0;
    let totalDepositFeeTotal = 0;
    let totalOtherFees = 0;
    let totalFees = 0;

    for (const taktziv of taktzivList) {
      const perutHotzaot = taktziv["PerutHotzaot"] as Record<string, unknown> | undefined;
      if (perutHotzaot) {
        const singleFee = parseFeeActual(perutHotzaot);
        if (singleFee) {
          totalSavingsFeeRate = Math.max(totalSavingsFeeRate, singleFee.savingsFeeRate);
          totalSavingsFeeTotal += singleFee.savingsFeeTotal;
          totalDepositFeeRate = Math.max(totalDepositFeeRate, singleFee.depositFeeRate);
          totalDepositFeeTotal += singleFee.depositFeeTotal;
          totalOtherFees += singleFee.otherFees;
          totalFees += singleFee.totalFees;
        }
        // Take fee structure from first available
        if (feeStructure.length === 0) {
          const mivneDmeiNihul = perutHotzaot["MivneDmeiNihul"] as Record<string, unknown> | undefined;
          feeStructure = parseFeeStructure(mivneDmeiNihul);
        }
      }
    }

    if (totalFees > 0 || totalSavingsFeeRate > 0) {
      fees = {
        depositFeeRate: totalDepositFeeRate,
        depositFeeTotal: totalDepositFeeTotal,
        savingsFeeRate: totalSavingsFeeRate,
        savingsFeeTotal: totalSavingsFeeTotal,
        otherFees: totalOtherFees,
        totalFees,
        avgDepositFeeRate: totalDepositFeeRate,
        avgDepositFeeTotal: totalDepositFeeTotal,
        insurancePremiumCollected: null,
      };
    }

    // Investment tracks — also inside PirteiTaktziv
    const investmentTracks: InvestmentTrack[] = [];
    for (const taktziv of taktzivList) {
      const masluleiInTaktziv = asArray(taktziv["PerutMasluleiHashkaa"] as Record<string, unknown>[]);
      for (const m of masluleiInTaktziv) {
        investmentTracks.push({
          trackCode: getVal(m, "KOD-MASLUL-HASHKAA"),
          trackType: getVal(m, "KOD-SUG-MASLUL"),
          contributionType: getVal(m, "KOD-SUG-HAFRASHA"),
          trackName: getVal(m, "SHEM-MASLUL-HASHKAA"),
          balance: getNum(m, "SCHUM-TZVIRA-BAMASLUL"),
          netReturn: getNum(m, "TSUA-NETO"),
          allocationPercent: getNum(m, "ACHUZ-HAFKADA-LEHASHKAA"),
          depositFeeRate: getNumOrNull(m, "SHEUR-DMEI-NIHUL-HAFKADA"),
          savingsFeeRate: getNumOrNull(m, "SHEUR-DMEI-NIHUL-HISACHON"),
          annualCostRate: getNumOrNull(m, "SHIUR-ALUT-SHNATIT-ZPUIA-LMSLUL-HASHKAH"),
        });
      }
    }
    // Also check tracks directly on polisa (fallback)
    const masluleiList = asArray(polisa["PerutMasluleiHashkaa"] as Record<string, unknown>[]);
    for (const m of masluleiList) {
      investmentTracks.push({
        trackCode: getVal(m, "KOD-MASLUL-HASHKAA"),
        trackType: getVal(m, "KOD-SUG-MASLUL"),
        contributionType: getVal(m, "KOD-SUG-HAFRASHA"),
        trackName: getVal(m, "SHEM-MASLUL-HASHKAA"),
        balance: getNum(m, "SCHUM-TZVIRA-BAMASLUL"),
        netReturn: getNum(m, "TSUA-NETO"),
        allocationPercent: getNum(m, "ACHUZ-HAFKADA-LEHASHKAA"),
        depositFeeRate: getNumOrNull(m, "SHEUR-DMEI-NIHUL-HAFKADA"),
        savingsFeeRate: getNumOrNull(m, "SHEUR-DMEI-NIHUL-HISACHON"),
        annualCostRate: getNumOrNull(m, "SHIUR-ALUT-SHNATIT-ZPUIA-LMSLUL-HASHKAH"),
      });
    }

    // Balance blocks — inside PirteiTaktziv
    const balanceBlocks: BalanceBlock[] = [];
    for (const taktziv of taktzivList) {
      const blockItrot = taktziv["BlockItrot"] as Record<string, unknown> | undefined;
      if (blockItrot) {
        const itraList = asArray(blockItrot["BlockItra"] as Record<string, unknown>[]);
        for (const itra of itraList) {
          balanceBlocks.push({
            balanceType: getVal(itra, "KOD-SUG-ITRA"),
            taxLayer: getVal(itra, "KOD-TECHULAT-SHICHVA"),
            totalAccumulated: getNum(itra, "TOTAL-CHISACHON-MTZBR"),
            severanceCurrentEmployer: getNum(itra, "ERECH-PIDION-PITZUIM-MAASIK-NOCHECHI"),
            severanceCurrentComponent: getNum(itra, "ERECH-PIDION-MARKIV-PITZUIM-LEMAS-NOCHECHI"),
            severancePreviousEmployers: getNum(itra, "ERECH-PIDION-PITZUIM-LEHON-MAAVIDIM-KODMIM"),
            severanceContinuity: getNum(itra, "ERECH-PIDION-PITZUIM-MAAVIDIM-KODMIM-RETZEF-ZEHUYUT"),
            hasSeveranceContinuityPension: getVal(itra, "KAYAM-RETZEF-PITZUIM-KITZBA") === "1",
            hasSeveranceRightsContinuity: getVal(itra, "KAYAM-RETZEF-ZECHUYOT-PITZUIM") === "1",
          });
        }
      }
    }

    // Beneficiaries
    const mutavList = asArray(polisa["Mutav"] as Record<string, unknown>[]);
    const beneficiaries = mutavList.map(parseBeneficiary);

    return {
      providerCode: getVal(netunei, "KOD-MEZAHE-YATZRAN"),
      providerName: provider.name,
      productType: getVal(netunei, "SUG-MUTZAR"),
      planName: getVal(polisa, "SHEM-TOCHNIT"),
      pensionFundType: getVal(polisa, "SUG-KEREN-PENSIA"),
      isNewPension: pensionTypeCode === "2",
      insuranceTrackCode: getVal(polisa, "MASLUL-BITUACH-BAKEREN-PENSIA"),
      insuranceTrackName: getVal(polisa, "SHEM-MASLUL-HABITUAH"),
      accountNumber: getVal(polisa, "MISPAR-POLISA-O-HESHBON"),
      status: getVal(polisa, "STATUS-POLISA-O-CHESHBON") || getVal(netunei, "STATUS-RESHOMA"),
      joinDate: getVal(polisa, "TAARICH-HITZTARFUT-RISHON"),
      statutoryRetirementAge: getNumOrNull(polisa, "GIL-PRISHA-LEPENSIYAT-ZIKNA"),
      projections,
      coverage,
      survivorPension,
      returns,
      fees,
      feeStructure,
      investmentTracks,
      balanceBlocks,
      yearEndBalance: getNumOrNull(polisa, "YITRAT-SOF-SHANA"),
      employers,
      beneficiaries,
      debt: parseDebt(polisa["ChovotPigurim"] as Record<string, unknown> | undefined),
      lien: parseLien(polisa["PerutShiabudIkul"] as Record<string, unknown> | undefined),
      loan: parseLoan(polisa["Halvaa"] as Record<string, unknown> | undefined),
      claim: parseClaim(polisa["PirteyTvia"] as Record<string, unknown> | undefined),
      hasPowerOfAttorney: getBool(polisa, "KAYAM-MEYUPE-KOACH"),
      hasInsuranceDiscount: getBool(polisa, "HATAVA-BITUCHIT"),
      client,
    };
  });

  return { type: "PNN", header, provider, products, fileName };
}

// ─── Public API ───────────────────────────────────────────

export function parseXMLFile(content: string, fileName: string): ParsedINP | ParsedKGM | ParsedPNN {
  const fileType = detectFileType(fileName + content);
  const parsed = xmlParser.parse(content);

  switch (fileType) {
    case "INP":
      return parseINP(parsed, fileName);
    case "KGM":
      return parseKGM(parsed, fileName);
    case "PNN":
      return parsePNN(parsed, fileName);
    default: {
      const mimshak = parsed?.["Mimshak"] as Record<string, unknown>;
      const yeshut = mimshak?.["YeshutYatzran"] as Record<string, unknown>;
      const mutzarimObj = yeshut?.["Mutzarim"] as Record<string, unknown>;
      const mutzarArr = asArray(mutzarimObj?.["Mutzar"] as Record<string, unknown>[]);
      if (mutzarArr.length > 0) {
        const firstMutzar = mutzarArr[0];
        const net = (firstMutzar["NetuneiMutzar"] || firstMutzar) as Record<string, unknown>;
        const sugMutzar = getVal(net, "SUG-MUTZAR");
        if (sugMutzar === "6") return parseINP(parsed, fileName);
        if (sugMutzar === "4") return parseKGM(parsed, fileName);
        if (sugMutzar === "2") return parsePNN(parsed, fileName);
      }
      throw new Error("לא ניתן לזהות את סוג הקובץ");
    }
  }
}

export function parseExcelFile(data: ArrayBuffer, fileName: string): ParsedHarHabituach {
  const { headerRow, sectionIndicatorColumn, sectionNameColumn, sectionFieldName } = HAR_HABITUACH_CONFIG;

  const workbook = XLSX.read(data, { type: "array" });
  const firstSheet = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheet];

  // Compute actual range from cell keys (worksheet["!ref"] can be inaccurate)
  let maxRow = 0;
  let maxCol = 0;
  for (const key of Object.keys(worksheet)) {
    if (key.startsWith("!")) continue;
    const { r, c } = XLSX.utils.decode_cell(key);
    if (r > maxRow) maxRow = r;
    if (c > maxCol) maxCol = c;
  }

  // Extract header names from the configured header row
  const headers: string[] = [];
  for (let c = 0; c <= maxCol; c++) {
    const addr = XLSX.utils.encode_cell({ r: headerRow, c });
    const cell = worksheet[addr];
    headers.push(cell ? String(cell.v).trim() : `col_${c}`);
  }

  // Parse data rows starting after the header row
  const records: HarHabituachRecord[] = [];
  let currentSection = "";

  for (let r = headerRow + 1; r <= maxRow; r++) {
    const indicatorAddr = XLSX.utils.encode_cell({ r, c: sectionIndicatorColumn });
    const indicatorCell = worksheet[indicatorAddr];
    const indicatorVal = indicatorCell ? String(indicatorCell.v).trim() : "";

    // Empty indicator column = sub-section row; name is in sectionNameColumn
    if (!indicatorVal) {
      const nameAddr = XLSX.utils.encode_cell({ r, c: sectionNameColumn });
      const nameCell = worksheet[nameAddr];
      if (nameCell) {
        currentSection = String(nameCell.v).trim();
      }
      continue; // skip sub-section rows from data
    }

    // Build a data record from the row
    const record: HarHabituachRecord = { [sectionFieldName]: currentSection };
    for (let c = 0; c <= maxCol; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      const cell = worksheet[addr];
      record[headers[c]] = cell ? cell.v as string | number : null;
    }
    records.push(record);
  }

  // Columns list: section field first, then header columns
  const columns = [sectionFieldName, ...headers];

  return {
    type: "HAR_HABITUACH",
    records,
    columns,
    fileName,
  };
}

export async function parseFile(file: File): Promise<ParsedFile> {
  const fileName = file.name;

  if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
    const buffer = await file.arrayBuffer();
    return parseExcelFile(buffer, fileName);
  }

  const text = await file.text();
  return parseXMLFile(text, fileName);
}
