import type { OwnershipEstimateInput } from "@/server/estimates/estimate-types";

export type VehicleMarketEstimateRequest = Pick<
  OwnershipEstimateInput,
  "make" | "model" | "startYear" | "endYear" | "province"
>;

export type VehicleListing = {
  id: string;
  source: string;
  title?: string;
  make: string;
  model: string;
  year: number;
  province?: string;
  city?: string;
  price: number;
  mileageKilometers?: number;
  url?: string;
  dealerName?: string;
  capturedAt: string;
};

export type MarketDataSourceType = "real" | "fallback" | "cached";

export type MarketDataConfidence = "low" | "medium" | "high";

export type VehicleMarketEstimate = {
  estimatedPurchasePrice: number;
  averageListingPrice?: number;
  medianListingPrice?: number;
  minListingPrice?: number;
  maxListingPrice?: number;
  listingCount: number;
  currency: "CAD";
  source: {
    providerId: string;
    providerName: string;
    sourceType: MarketDataSourceType;
    confidence: MarketDataConfidence;
    lastUpdated?: string;
  };
  assumptions: string[];
  sampleListings?: VehicleListing[];
};

export type VehicleMarketEstimateProviderResult =
  | {
      ok: true;
      estimate: VehicleMarketEstimate;
    }
  | {
      ok: false;
      providerId: string;
      providerName: string;
      error: string;
    };