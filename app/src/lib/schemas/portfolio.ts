import { z } from "zod/v4";

// Graceful field extractors — return defaults instead of throwing
const safeString = z.string().catch("");
const safeNumber = z.number().catch(0);
const safeNumberOrNull = z.number().nullable().catch(null);
const safeBool = z.boolean().catch(false);

// Core schemas
export const fileHeaderSchema = z.object({
  sugMimshak: safeString,
  xmlVersion: safeString,
  executionDate: safeString,
  senderCode: safeString,
  senderName: safeString,
  operatorCode: safeString,
  operatorName: safeString,
});

export const contactInfoSchema = z.object({
  firstName: safeString,
  lastName: safeString,
  country: safeString,
  city: safeString,
  street: safeString,
  houseNumber: safeString,
  zipCode: safeString,
  phone: safeString,
  cellphone: safeString,
  fax: safeString,
  email: safeString,
});

export const providerSchema = z.object({
  code: safeString,
  name: safeString,
  contact: contactInfoSchema,
});

export const employerSchema = z.object({
  code: safeString,
  idNumber: safeString,
  name: safeString,
  city: safeString,
  street: safeString,
  zipCode: safeString,
  phone: safeString,
  cellphone: safeString,
  email: safeString,
});

export const depositSchema = z.object({
  date: safeString,
  amount: safeNumber,
  depositType: safeString.optional(),
  contributionType: safeString.optional(),
  depositorType: safeString.optional(),
});

export const beneficiarySchema = z.object({
  idType: safeString,
  idNumber: safeString,
  firstName: safeString,
  lastName: safeString,
  percentage: safeNumber,
  definition: safeString,
  type: safeString,
});

export const feeActualSchema = z.object({
  depositFeeRate: safeNumber,
  depositFeeTotal: safeNumber,
  savingsFeeRate: safeNumber,
  savingsFeeTotal: safeNumber,
  otherFees: safeNumber,
  totalFees: safeNumber,
  avgDepositFeeRate: safeNumber,
  avgDepositFeeTotal: safeNumber,
  insurancePremiumCollected: safeNumberOrNull,
});

export const feeStructureEntrySchema = z.object({
  feeType: safeString,
  feeRate: safeNumber,
  contributionType: safeString,
  hasDiscount: safeBool,
  discountPercent: safeNumber,
  discountEndDate: safeString,
});

export const investmentTrackSchema = z.object({
  trackCode: safeString,
  trackType: safeString,
  contributionType: safeString,
  trackName: safeString,
  balance: safeNumber,
  netReturn: safeNumber,
  allocationPercent: safeNumber,
  depositFeeRate: safeNumberOrNull,
  savingsFeeRate: safeNumberOrNull,
  annualCostRate: safeNumberOrNull,
});

// Insurance product schema
export const insuranceProductSchema = z.object({
  providerCode: safeString,
  providerName: safeString,
  productType: safeString,
  planName: safeString,
  policyNumber: safeString,
  status: safeString,
  policyType: safeString,
  planType: safeString,
  joinDate: safeString,
  firstJoinDate: safeString,
  statusUpdateDate: safeString,
  indexBasis: safeNumberOrNull,
  contributionPercent: safeNumber,
  subAnnualRate: safeNumber,
  lastDepositDate: safeString,
  deposits: z.array(depositSchema).catch([]),
  coverages: z.array(z.any()).catch([]),
  fees: feeActualSchema.nullable().catch(null),
  feeStructure: z.array(feeStructureEntrySchema).catch([]),
  beneficiaries: z.array(beneficiarySchema).catch([]),
  debt: z.any().nullable().catch(null),
  lien: z.any().nullable().catch(null),
  loan: z.any().nullable().catch(null),
  claim: z.any().nullable().catch(null),
  employer: employerSchema.optional(),
  client: z.any().optional(),
  withdrawalPenalty: safeBool,
  totalInsurancePremium: safeNumber,
});

// Savings product schema
export const savingsProductSchema = z.object({
  providerCode: safeString,
  providerName: safeString,
  productType: safeString,
  planName: safeString,
  accountNumber: safeString,
  status: safeString,
  joinDate: safeString,
  employeeContributionPercent: safeNumber,
  employerContributionPercent: safeNumber,
  totalNetReturn: safeNumber,
  tracks: z.array(investmentTrackSchema).catch([]),
  totalBalance: safeNumber,
  yearEndBalance: safeNumberOrNull,
  returns: z.any().nullable().catch(null),
  fees: feeActualSchema.nullable().catch(null),
  feeStructure: z.array(feeStructureEntrySchema).catch([]),
  balanceBlocks: z.array(z.any()).catch([]),
  withdrawal: z.any().nullable().catch(null),
  employmentTerms: z.any().nullable().catch(null),
  beneficiaries: z.array(beneficiarySchema).catch([]),
  debt: z.any().nullable().catch(null),
  lien: z.any().nullable().catch(null),
  loan: z.any().nullable().catch(null),
  projectedBalanceAtRetirement: safeNumberOrNull,
  employer: employerSchema.optional(),
  client: z.any().optional(),
});

// Pension product schema
export const pensionProductSchema = z.object({
  providerCode: safeString,
  providerName: safeString,
  productType: safeString,
  planName: safeString,
  pensionFundType: safeString,
  isNewPension: safeBool,
  insuranceTrackCode: safeString,
  insuranceTrackName: safeString,
  accountNumber: safeString,
  status: safeString,
  joinDate: safeString,
  statutoryRetirementAge: safeNumberOrNull,
  projections: z.array(z.any()).catch([]),
  coverage: z.any().nullable().catch(null),
  survivorPension: z.any().nullable().catch(null),
  returns: z.any().nullable().catch(null),
  fees: feeActualSchema.nullable().catch(null),
  feeStructure: z.array(feeStructureEntrySchema).catch([]),
  investmentTracks: z.array(investmentTrackSchema).catch([]),
  balanceBlocks: z.array(z.any()).catch([]),
  yearEndBalance: safeNumberOrNull,
  employers: z.array(employerSchema).catch([]),
  beneficiaries: z.array(beneficiarySchema).catch([]),
  debt: z.any().nullable().catch(null),
  lien: z.any().nullable().catch(null),
  loan: z.any().nullable().catch(null),
  claim: z.any().nullable().catch(null),
  hasPowerOfAttorney: safeBool,
  hasInsuranceDiscount: safeBool,
  client: z.any().optional(),
});

// Parsed file schemas
export const parsedINPSchema = z.object({
  type: z.literal("INP"),
  header: fileHeaderSchema,
  provider: providerSchema,
  products: z.array(insuranceProductSchema).catch([]),
  fileName: safeString,
});

export const parsedKGMSchema = z.object({
  type: z.literal("KGM"),
  header: fileHeaderSchema,
  provider: providerSchema,
  products: z.array(savingsProductSchema).catch([]),
  fileName: safeString,
});

export const parsedPNNSchema = z.object({
  type: z.literal("PNN"),
  header: fileHeaderSchema,
  provider: providerSchema,
  products: z.array(pensionProductSchema).catch([]),
  fileName: safeString,
});

export const parsedHarHabituachSchema = z.object({
  type: z.literal("HAR_HABITUACH"),
  records: z.array(z.record(z.string(), z.union([z.string(), z.number(), z.null()]))).catch([]),
  columns: z.array(z.string()).catch([]),
  fileName: safeString,
});

export const parsedFileSchema = z.discriminatedUnion("type", [
  parsedINPSchema,
  parsedKGMSchema,
  parsedPNNSchema,
  parsedHarHabituachSchema,
]);

// Validation helper — returns parsed data + warnings instead of throwing
export interface ValidationResult<T> {
  data: T;
  warnings: string[];
}

export function validateParsedFile(raw: unknown): ValidationResult<z.infer<typeof parsedFileSchema>> {
  const warnings: string[] = [];
  const result = parsedFileSchema.safeParse(raw);
  if (!result.success) {
    warnings.push(...result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`));
    // Still try to return the data with defaults via .parse with catch
    return { data: parsedFileSchema.parse(raw), warnings };
  }
  return { data: result.data, warnings };
}
