import type {
  VehicleMarketEstimateProviderResult,
  VehicleMarketEstimateRequest,
} from "./market-data-types";

export type VehicleMarketDataProvider = {
  id: string;
  name: string;

  getMarketEstimate(
    request: VehicleMarketEstimateRequest,
  ): Promise<VehicleMarketEstimateProviderResult>;
};