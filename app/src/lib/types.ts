// Shared types for parsed insurance data

export interface FileHeader {
  sugMimshak: string;
  xmlVersion: string;
  executionDate: string;
  senderCode: string;
  senderName: string;
  operatorCode: string;
  operatorName: string;
}

export interface ContactInfo {
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  street: string;
  houseNumber: string;
  zipCode: string;
  phone: string;
  cellphone: string;
  fax: string;
  email: string;
}

export interface Provider {
  code: string;
  name: string;
  contact: ContactInfo;
}

export interface Employer {
  code: string;
  idNumber: string;
  name: string;
  city: string;
  street: string;
  zipCode: string;
  phone: string;
  cellphone: string;
  email: string;
}

export interface ClientInfo {
  idType: string;
  idNumber: string;
  firstName: string;
  lastName: string;
  gender: string; // 1=male, 2=female
  birthDate: string;
  maritalStatus: string; // 1=single, 2=married
  city: string;
  street: string;
  houseNumber: string;
  zipCode: string;
  phone: string;
  cellphone: string;
  email: string;
}

// Shared sub-types
export interface Deposit {
  date: string;
  amount: number;
  depositType?: string; // KOD-SUG-HAFKADA
  contributionType?: string; // SUG-HAFRASHA
  depositorType?: string; // SUG-MAFKID (1=employee, 2=employer, 3=both)
}

export interface Beneficiary {
  idType: string;
  idNumber: string;
  firstName: string;
  lastName: string;
  percentage: number;
  definition: string; // HAGDARAT-MUTAV
  type: string; // MAHUT-MUTAV
}

export interface FeeActual {
  depositFeeRate: number;
  depositFeeTotal: number;
  savingsFeeRate: number;
  savingsFeeTotal: number;
  otherFees: number;
  totalFees: number;
  avgDepositFeeRate: number;
  avgDepositFeeTotal: number;
  insurancePremiumCollected: number | null; // SACH-DMEI-BITUAH-SHENIGBOO
}

export interface FeeStructureEntry {
  feeType: string; // SUG-HOTZAA: 1=savings, 2=deposit
  feeRate: number; // SHEUR-DMEI-NIHUL
  contributionType: string; // OFEN-HAFRASHA
  hasDiscount: boolean; // KAYEMET-HATAVA
  discountPercent: number; // ACHOZ-HATAVA
  discountEndDate: string; // TAARICH-SIUM-HATAVA
}

export interface ReturnData {
  netReturnRate: number; // SHEUR-TSUA-NETO
  guaranteedReturnRate: number | null; // SHEUR-TSUA-MOVTACHAT-MEYOADOT
  profitLoss: number; // REVACH-HEFSED-BENIKOI-HOZAHOT
  profitLossSign: string; // SIMAN-REVACH-HEFSED (1=profit, 2=loss)
  guaranteedReturn: number | null; // ACHUZ-TSUA-MUVTAHT
}

export interface DebtInfo {
  hasDebt: boolean; // KAYAM-CHOV-O-PIGUR
  debtStartDate: string;
  monthsInArrears: number | null;
  debtType: string;
  totalDebt: number | null;
}

export interface LoanInfo {
  hasLoan: boolean;
  loanAmount: number | null;
  loanStartDate: string;
  loanEndDate: string;
  loanBalance: number | null;
  interestRate: number | null;
  interestType: string;
  repaymentAmount: number | null;
}

export interface ClaimInfo {
  hasClaim: boolean;
  claimNumber: string;
  claimType: string;
  claimStatus: string;
}

export interface LienInfo {
  hasLien: boolean; // HUTAL-SHIABUD
  hasAttachment: boolean; // HUTAL-IKUL
}

// INP - Insurance Products
export interface InsuranceCoverage {
  coverageCode: string; // MISPAR-KISUI-BE-YATZRAN
  coverageName: string; // SHEM-KISUI-YATZRAN
  attachmentCode: string; // KOD-NISPACH-KISUY
  insuranceAmount: number; // SCHUM-BITUACH
  paymentMethod: string; // OFEN-TASHLUM-SCHUM-BITUACH
  premium: number; // DMEI-BITUAH-LETASHLUM-BAPOAL
  payer: string; // MESHALEM-HAKISUY
  approvalStatus: string; // KOD-ISHUN
  isUnderwritten: boolean; // IND-CHITUM
  hasExclusion: boolean; // HACHRAGA
  hasDiscount: boolean; // HANACHA
  discountRate: number; // SHIUR-HANACHA-BEKISUI
  discountEndDate: string; // MOED-SIUM-TKUFAT-HANACHA
  beneficiaries: Beneficiary[];
}

export interface InsuranceProduct {
  providerCode: string;
  providerName: string;
  productType: string;
  planName: string; // SHEM-TOCHNIT
  policyNumber: string;
  status: string;
  policyType: string; // SUG-POLISA
  planType: string; // SUG-TOCHNIT-O-CHESHBON
  joinDate: string;
  firstJoinDate: string;
  statusUpdateDate: string;
  indexBasis: number | null; // MADAD-BASIS
  contributionPercent: number;
  subAnnualRate: number;
  lastDepositDate: string;
  deposits: Deposit[];
  coverages: InsuranceCoverage[];
  fees: FeeActual | null;
  feeStructure: FeeStructureEntry[];
  beneficiaries: Beneficiary[];
  debt: DebtInfo | null;
  lien: LienInfo | null;
  loan: LoanInfo | null;
  claim: ClaimInfo | null;
  employer?: Employer;
  client?: ClientInfo;
  withdrawalPenalty: boolean; // KENAS-MESHICHAT-KESAFIM
  totalInsurancePremium: number; // sum of all coverage premiums
}

// KGM - Savings Funds (Kupot Gemel / Keren Hishtalmut)
export interface InvestmentTrack {
  trackCode: string;
  trackType: string;
  contributionType: string; // KOD-SUG-HAFRASHA (8=employee, 9=employer)
  trackName: string;
  balance: number;
  netReturn: number;
  allocationPercent: number;
  depositFeeRate: number | null;
  savingsFeeRate: number | null;
  annualCostRate: number | null; // SHIUR-ALUT-SHNATIT-ZPUIA-LMSLUL-HASHKAH
}

export interface BalanceBlock {
  balanceType: string; // KOD-SUG-ITRA
  taxLayer: string; // KOD-TECHULAT-SHICHVA
  totalAccumulated: number; // TOTAL-CHISACHON-MTZBR
  severanceCurrentEmployer: number; // ERECH-PIDION-PITZUIM-MAASIK-NOCHECHI
  severanceCurrentComponent: number; // ERECH-PIDION-MARKIV-PITZUIM-LEMAS-NOCHECHI
  severancePreviousEmployers: number; // ERECH-PIDION-PITZUIM-LEHON-MAAVIDIM-KODMIM
  severanceContinuity: number; // ERECH-PIDION-PITZUIM-MAAVIDIM-KODMIM-RETZEF-ZEHUYUT
  hasSeveranceContinuityPension: boolean; // KAYAM-RETZEF-PITZUIM-KITZBA
  hasSeveranceRightsContinuity: boolean; // KAYAM-RETZEF-ZECHUYOT-PITZUIM
}

export interface WithdrawalEligibility {
  eligibilityDate: string; // MOED-NEZILUT-TAGMULIM
  eligibleAmount: number; // YITRAT-KASPEY-TAGMULIM
}

export interface EmploymentTerms {
  planType: string; // SUG-TOCHNIT-O-CHESHBON
  employerStatus: string; // STATUS-MAASIK
  unconditionalRight: string; // ZAKAUT-LELO-TNAI
  clause14: string; // SEIF-14
  salaryCalculation: string; // KOD-CHISHUV-SACHAR-POLISA-O-HESHBON
  salary: number; // SACHAR-POLISA
  salaryDate: string; // TAARICH-MASKORET
}

export interface SavingsProduct {
  providerCode: string;
  providerName: string;
  productType: string;
  planName: string; // SHEM-TOCHNIT
  accountNumber: string;
  status: string;
  joinDate: string;
  employeeContributionPercent: number;
  employerContributionPercent: number;
  totalNetReturn: number;
  tracks: InvestmentTrack[];
  totalBalance: number;
  yearEndBalance: number | null; // YITRAT-SOF-SHANA
  returns: ReturnData | null;
  fees: FeeActual | null;
  feeStructure: FeeStructureEntry[];
  balanceBlocks: BalanceBlock[];
  withdrawal: WithdrawalEligibility | null;
  employmentTerms: EmploymentTerms | null;
  beneficiaries: Beneficiary[];
  debt: DebtInfo | null;
  lien: LienInfo | null;
  loan: LoanInfo | null;
  projectedBalanceAtRetirement: number | null; // TOTAL-CHISACHON-MITZTABER-TZAFUY from YitraLefiGilPrisha
  employer?: Employer;
  client?: ClientInfo;
}

// PNN - Pension
export interface PensionProjection {
  retirementAge: number; // GIL-PRISHA
  monthlyPension: number;
  projectedMonthlyPension: number; // KITZVAT-HODSHIT-TZFUYA
  totalAccumulated: number;
  totalAccumulatedWithoutPremiums: number;
  returnRate: number;
}

export interface PensionCoverage {
  disabilityCost: number; // ALUT-KISUI-NECHUT
  survivorPensionCost: number; // ALUT-KISUI-PNS-SHRM-NECHE
  survivorsCost: number; // ALUT-KISUY-SHEERIM
}

export interface SurvivorPension {
  spousePension: number; // KITZBAT-SHEERIM-LEALMAN-O-ALMANA
  orphanPension: number; // KITZBAT-SHEERIM-LEYATOM
  dependentParentPension: number; // KITZBAT-SHEERIM-LEHORE-NITMACH
}

export interface PensionProduct {
  providerCode: string;
  providerName: string;
  productType: string;
  planName: string; // SHEM-TOCHNIT
  pensionFundType: string;
  isNewPension: boolean;
  insuranceTrackCode: string;
  insuranceTrackName: string;
  accountNumber: string;
  status: string;
  joinDate: string;
  statutoryRetirementAge: number | null; // GIL-PRISHA-LEPENSIYAT-ZIKNA
  projections: PensionProjection[];
  coverage: PensionCoverage | null;
  survivorPension: SurvivorPension | null;
  returns: ReturnData | null;
  fees: FeeActual | null;
  feeStructure: FeeStructureEntry[];
  investmentTracks: InvestmentTrack[];
  balanceBlocks: BalanceBlock[];
  yearEndBalance: number | null;
  employers: Employer[];
  beneficiaries: Beneficiary[];
  debt: DebtInfo | null;
  lien: LienInfo | null;
  loan: LoanInfo | null;
  claim: ClaimInfo | null;
  hasPowerOfAttorney: boolean; // KAYAM-MEYUPE-KOACH
  hasInsuranceDiscount: boolean; // HATAVA-BITUCHIT
  client?: ClientInfo;
}

// Har Habituach - Insurance Mountain (Excel)
export interface HarHabituachRecord {
  [key: string]: string | number | null;
}

// Parsed file results
export interface ParsedINP {
  type: "INP";
  header: FileHeader;
  provider: Provider;
  products: InsuranceProduct[];
  fileName: string;
}

export interface ParsedKGM {
  type: "KGM";
  header: FileHeader;
  provider: Provider;
  products: SavingsProduct[];
  fileName: string;
}

export interface ParsedPNN {
  type: "PNN";
  header: FileHeader;
  provider: Provider;
  products: PensionProduct[];
  fileName: string;
}

export interface ParsedHarHabituach {
  type: "HAR_HABITUACH";
  records: HarHabituachRecord[];
  columns: string[];
  fileName: string;
}

export type ParsedFile = ParsedINP | ParsedKGM | ParsedPNN | ParsedHarHabituach;

export interface FileParseResult {
  success: boolean;
  data?: ParsedFile;
  error?: string;
  fileName: string;
}

export interface AppState {
  files: FileParseResult[];
  inpFiles: ParsedINP[];
  kgmFiles: ParsedKGM[];
  pnnFiles: ParsedPNN[];
  harHabituachFiles: ParsedHarHabituach[];
}
