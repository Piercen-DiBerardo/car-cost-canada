import { z } from "zod";

export const ownershipEstimateInputSchema = z
  .object({
    make: z.string().min(1),
    model: z.string().min(1),
    startYear: z.number().int().min(1990),
    endYear: z.number().int().min(1990),
    province: z.enum([
      "AB",
      "BC",
      "MB",
      "NB",
      "NL",
      "NS",
      "NT",
      "NU",
      "ON",
      "PE",
      "QC",
      "SK",
      "YT",
    ]),
    ownershipYears: z.number().int().min(1).max(10),
    annualKilometers: z.number().int().min(1000).max(100000),
    fuelPricePerLiter: z.number().positive(),
    estimatedFuelConsumptionLPer100Km: z.number().positive(),
  })
  .refine((input) => input.endYear >= input.startYear, {
    message: "End year must be greater than or equal to start year.",
    path: ["endYear"],
  });

export type OwnershipEstimateInput = z.infer<
  typeof ownershipEstimateInputSchema
>;

export type OwnershipCostBreakdown = {
  purchasePrice: number;
  tax: number;
  insurance: number;
  fuel: number;
  maintenance: number;
  repairs: number;
  depreciation: number;
  totalCost: number;
  monthlyCost: number;
};

export type EstimateSourceInfo = {
  providerId: string;
  providerName: string;
  sourceType: "mock" | "real" | "fallback" | "cached";
  confidence: "low" | "medium" | "high";
  lastUpdated?: string;
};

export type OwnershipEstimateResult = {
  input: OwnershipEstimateInput;
  costs: OwnershipCostBreakdown;
  assumptions: string[];
  source: EstimateSourceInfo;
};