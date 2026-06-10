import type {
  EstimateSourceInfo,
  OwnershipEstimateInput,
  OwnershipEstimateResult,
} from "./estimate-types";

const PROVINCE_TAX_RATES: Record<OwnershipEstimateInput["province"], number> = {
  AB: 0.05,
  BC: 0.12,
  MB: 0.12,
  NB: 0.15,
  NL: 0.15,
  NS: 0.15,
  NT: 0.05,
  NU: 0.05,
  ON: 0.13,
  PE: 0.15,
  QC: 0.14975,
  SK: 0.11,
  YT: 0.05,
};

type CalculateOwnershipCostParams = {
  input: OwnershipEstimateInput;
  estimatedPurchasePrice: number;
  source: EstimateSourceInfo;
  marketDataAssumptions?: string[];
};

export function calculateOwnershipCost({
  input,
  estimatedPurchasePrice,
  source,
  marketDataAssumptions = [],
}: CalculateOwnershipCostParams): OwnershipEstimateResult {
  const taxRate = PROVINCE_TAX_RATES[input.province];

  const tax = estimatedPurchasePrice * taxRate;

  const annualFuelCost =
    (input.annualKilometers / 100) *
    input.estimatedFuelConsumptionLPer100Km *
    input.fuelPricePerLiter;

  const fuel = annualFuelCost * input.ownershipYears;

  const monthlyInsuranceEstimate = 250;
  const insurance = monthlyInsuranceEstimate * 12 * input.ownershipYears;

  const annualMaintenanceEstimate = 900;
  const maintenance = annualMaintenanceEstimate * input.ownershipYears;

  const annualRepairEstimate = 700;
  const repairs = annualRepairEstimate * input.ownershipYears;

  const depreciation = estimatedPurchasePrice * 0.35;

  const totalCost =
    estimatedPurchasePrice +
    tax +
    insurance +
    fuel +
    maintenance +
    repairs -
    depreciation;

  const monthlyCost = totalCost / (input.ownershipYears * 12);

  return {
    input,
    costs: {
      purchasePrice: Math.round(estimatedPurchasePrice),
      tax: Math.round(tax),
      insurance: Math.round(insurance),
      fuel: Math.round(fuel),
      maintenance: Math.round(maintenance),
      repairs: Math.round(repairs),
      depreciation: Math.round(depreciation),
      totalCost: Math.round(totalCost),
      monthlyCost: Math.round(monthlyCost),
    },
    assumptions: [
      ...marketDataAssumptions,
      `Province tax rate used: ${(taxRate * 100).toFixed(2)}%`,
      `Insurance estimated at $${monthlyInsuranceEstimate}/month.`,
      `Maintenance estimated at $${annualMaintenanceEstimate}/year.`,
      `Repairs estimated at $${annualRepairEstimate}/year.`,
      `Depreciation estimated at 35% of purchase price over ownership period.`,
    ],
    source,
  };
}