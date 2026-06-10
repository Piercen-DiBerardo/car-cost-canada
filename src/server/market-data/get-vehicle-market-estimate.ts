import type { OwnershipEstimateInput } from "@/server/estimates/estimate-types";
import type { VehicleMarketEstimate } from "./market-data-types";
import type { VehicleMarketDataProvider } from "./market-data-provider";
import { apifyAutoTraderMarketDataProvider } from "./providers/apify-autotrader-market-data-provider";

const marketDataProviders: VehicleMarketDataProvider[] = [
  apifyAutoTraderMarketDataProvider,
];

export async function getVehicleMarketEstimate(
  input: OwnershipEstimateInput,
): Promise<VehicleMarketEstimate> {
  const request = {
    make: input.make,
    model: input.model,
    startYear: input.startYear,
    endYear: input.endYear,
    province: input.province,
  };

  const providerErrors: string[] = [];

  for (const provider of marketDataProviders) {
    const result = await provider.getMarketEstimate(request);

    if (result.ok) {
      return {
        ...result.estimate,
        assumptions: [
          ...result.estimate.assumptions,
          `Market data provider used: ${result.estimate.source.providerName}.`,
        ],
      };
    }

    providerErrors.push(`${result.providerName}: ${result.error}`);
  }

  return {
    estimatedPurchasePrice: 0,
    listingCount: 0,
    currency: "CAD",
    source: {
      providerId: "no-real-market-data",
      providerName: "No Real Market Data Available",
      sourceType: "fallback",
      confidence: "low",
      lastUpdated: new Date().toISOString(),
    },
    assumptions: [
      "No real AutoTrader market estimate could be created.",
      ...providerErrors,
      "No fake purchase price was used.",
    ],
    sampleListings: [],
  };
}