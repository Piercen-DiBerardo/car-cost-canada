import type { VehicleMarketDataProvider } from "../market-data-provider";
import type {
  VehicleListing,
  VehicleMarketEstimateRequest,
} from "../market-data-types";

type MockVehiclePriceProfile = {
  make: string;
  model: string;
  basePriceByYear: Record<number, number>;
};

const MOCK_PRICE_PROFILES: MockVehiclePriceProfile[] = [
  {
    make: "Toyota",
    model: "Corolla",
    basePriceByYear: {
      2017: 16500,
      2018: 17500,
      2019: 19000,
      2020: 20500,
      2021: 22500,
      2022: 24500,
    },
  },
  {
    make: "Toyota",
    model: "Camry",
    basePriceByYear: {
      2017: 19000,
      2018: 20500,
      2019: 22500,
      2020: 24500,
      2021: 27000,
      2022: 29500,
    },
  },
  {
    make: "Toyota",
    model: "RAV4",
    basePriceByYear: {
      2017: 23000,
      2018: 24500,
      2019: 28500,
      2020: 31500,
      2021: 34500,
      2022: 37000,
    },
  },
  {
    make: "Honda",
    model: "Civic",
    basePriceByYear: {
      2017: 16000,
      2018: 17500,
      2019: 19500,
      2020: 21500,
      2021: 24000,
      2022: 26500,
    },
  },
  {
    make: "Honda",
    model: "CR-V",
    basePriceByYear: {
      2017: 22500,
      2018: 24500,
      2019: 27000,
      2020: 30500,
      2021: 33500,
      2022: 36500,
    },
  },
  {
    make: "Mazda",
    model: "Mazda3",
    basePriceByYear: {
      2017: 15000,
      2018: 16500,
      2019: 19000,
      2020: 21500,
      2021: 24000,
      2022: 26500,
    },
  },
  {
    make: "Hyundai",
    model: "Elantra",
    basePriceByYear: {
      2017: 13500,
      2018: 15000,
      2019: 17000,
      2020: 19000,
      2021: 22000,
      2022: 24500,
    },
  },
];

const DEFAULT_ESTIMATED_PRICE = 18500;

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function findPriceProfile(request: VehicleMarketEstimateRequest) {
  return MOCK_PRICE_PROFILES.find(
    (profile) =>
      normalize(profile.make) === normalize(request.make) &&
      normalize(profile.model) === normalize(request.model),
  );
}

function getPricesForYearRange(
  profile: MockVehiclePriceProfile,
  startYear: number,
  endYear: number,
) {
  return Object.entries(profile.basePriceByYear)
    .map(([year, price]) => ({
      year: Number(year),
      price,
    }))
    .filter(({ year }) => year >= startYear && year <= endYear);
}

function calculateMedian(values: number[]) {
  const sortedValues = [...values].sort((a, b) => a - b);
  const middleIndex = Math.floor(sortedValues.length / 2);

  if (sortedValues.length % 2 === 0) {
    return (sortedValues[middleIndex - 1] + sortedValues[middleIndex]) / 2;
  }

  return sortedValues[middleIndex];
}

function createMockListings(params: {
  request: VehicleMarketEstimateRequest;
  pricesByYear: Array<{ year: number; price: number }>;
}): VehicleListing[] {
  const capturedAt = new Date().toISOString();

  return params.pricesByYear.flatMap(({ year, price }) => [
    {
      id: `mock-${params.request.make}-${params.request.model}-${year}-low`,
      source: "Mock Market Data Provider",
      make: params.request.make,
      model: params.request.model,
      year,
      province: params.request.province,
      price: Math.round(price * 0.94),
      mileageKilometers: 120000,
      capturedAt,
    },
    {
      id: `mock-${params.request.make}-${params.request.model}-${year}-mid`,
      source: "Mock Market Data Provider",
      make: params.request.make,
      model: params.request.model,
      year,
      province: params.request.province,
      price,
      mileageKilometers: 90000,
      capturedAt,
    },
    {
      id: `mock-${params.request.make}-${params.request.model}-${year}-high`,
      source: "Mock Market Data Provider",
      make: params.request.make,
      model: params.request.model,
      year,
      province: params.request.province,
      price: Math.round(price * 1.08),
      mileageKilometers: 65000,
      capturedAt,
    },
  ]);
}

export const mockMarketDataProvider: VehicleMarketDataProvider = {
  id: "mock-market-data",
  name: "Mock Market Data Provider",

  async getMarketEstimate(request) {
    const profile = findPriceProfile(request);

    if (!profile) {
      return {
        ok: true,
        estimate: {
          estimatedPurchasePrice: DEFAULT_ESTIMATED_PRICE,
          listingCount: 0,
          currency: "CAD",
          source: {
            providerId: this.id,
            providerName: this.name,
            sourceType: "fallback",
            confidence: "low",
            lastUpdated: new Date().toISOString(),
          },
          assumptions: [
            `No mock market profile found for ${request.make} ${request.model}.`,
            `Used default fallback purchase price of $${DEFAULT_ESTIMATED_PRICE.toLocaleString("en-CA")} CAD.`,
          ],
          sampleListings: [],
        },
      };
    }

    const pricesByYear = getPricesForYearRange(
      profile,
      request.startYear,
      request.endYear,
    );

    if (pricesByYear.length === 0) {
      return {
        ok: true,
        estimate: {
          estimatedPurchasePrice: DEFAULT_ESTIMATED_PRICE,
          listingCount: 0,
          currency: "CAD",
          source: {
            providerId: this.id,
            providerName: this.name,
            sourceType: "fallback",
            confidence: "low",
            lastUpdated: new Date().toISOString(),
          },
          assumptions: [
            `Mock market profile exists for ${request.make} ${request.model}, but not for years ${request.startYear}-${request.endYear}.`,
            `Used default fallback purchase price of $${DEFAULT_ESTIMATED_PRICE.toLocaleString("en-CA")} CAD.`,
          ],
          sampleListings: [],
        },
      };
    }

    const sampleListings = createMockListings({
      request,
      pricesByYear,
    });

    const listingPrices = sampleListings.map((listing) => listing.price);
    const averageListingPrice =
      listingPrices.reduce((sum, price) => sum + price, 0) /
      listingPrices.length;

    const medianListingPrice = calculateMedian(listingPrices);
    const minListingPrice = Math.min(...listingPrices);
    const maxListingPrice = Math.max(...listingPrices);

    return {
      ok: true,
      estimate: {
        estimatedPurchasePrice: Math.round(medianListingPrice),
        averageListingPrice: Math.round(averageListingPrice),
        medianListingPrice: Math.round(medianListingPrice),
        minListingPrice,
        maxListingPrice,
        listingCount: sampleListings.length,
        currency: "CAD",
        source: {
          providerId: this.id,
          providerName: this.name,
          sourceType: "mock",
          confidence: "medium",
          lastUpdated: new Date().toISOString(),
        },
        assumptions: [
          `Used mock market data for ${request.make} ${request.model}.`,
          `Estimated price is based on mock listings from ${request.startYear}-${request.endYear}.`,
          "This provider is shaped like a real listing provider and can be replaced later.",
        ],
        sampleListings,
      },
    };
  },
};