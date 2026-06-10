import { z } from "zod";
import type { VehicleMarketDataProvider } from "../market-data-provider";
import type {
  VehicleListing,
  VehicleMarketEstimateRequest,
} from "../market-data-types";

const nullableString = z.string().nullable().optional();
const nullableNumberOrString = z
  .union([z.number(), z.string()])
  .nullable()
  .optional();

const apifyListingSchema = z
  .object({
    id: z.union([z.string(), z.number()]).nullable().optional(),
    listingId: z.union([z.string(), z.number()]).nullable().optional(),
    ad_id: z.union([z.string(), z.number()]).nullable().optional(),
    vin: nullableString,

    title: nullableString,
    heading: nullableString,

    make: nullableString,
    model: nullableString,
    year: nullableNumberOrString,

    price: nullableNumberOrString,
    price_cad: nullableNumberOrString,
    price_formatted: nullableString,

    mileage: nullableNumberOrString,
    mileageKm: nullableNumberOrString,
    mileage_km: nullableNumberOrString,
    mileage_formatted: nullableString,
    odometer: nullableNumberOrString,

    province: nullableString,
    location: nullableString,
    city: nullableString,
        
    url: nullableString,
    listingUrl: nullableString,
    listing_url: nullableString,

    dealerName: nullableString,
    sellerName: nullableString,
    seller_name: nullableString,
    dealer_address_full: nullableString,
    dealer_city_province: nullableString,

    data_source: nullableString,
    trim: nullableString,
    body_type: nullableString,
    fuel_combined_l_100km: nullableNumberOrString,
  })
  .passthrough();

const apifyDatasetResponseSchema = z.array(apifyListingSchema);

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name} environment variable.`);
  }

  return value;
}

function encodeActorId(actorId: string) {
  return actorId.replace("/", "~");
}

function parseNumber(value: unknown) {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const numericValue = Number(value.replace(/[^\d.]/g, ""));

  if (!Number.isFinite(numericValue)) {
    return undefined;
  }

  return numericValue;
}

function parseYear(value: unknown) {
  const year = parseNumber(value);

  if (!year) {
    return undefined;
  }

  return Math.round(year);
}

function calculateMedian(values: number[]) {
  const sortedValues = [...values].sort((a, b) => a - b);

  if (sortedValues.length === 0) {
    return null;
  }

  const middleIndex = Math.floor(sortedValues.length / 2);

  if (sortedValues.length % 2 === 0) {
    return (sortedValues[middleIndex - 1] + sortedValues[middleIndex]) / 2;
  }

  return sortedValues[middleIndex];
}

function removeExtremeOutliers(prices: number[]) {
  if (prices.length < 8) {
    return prices;
  }

  const sortedPrices = [...prices].sort((a, b) => a - b);
  const lowerIndex = Math.floor(sortedPrices.length * 0.1);
  const upperIndex = Math.ceil(sortedPrices.length * 0.9);

  return sortedPrices.slice(lowerIndex, upperIndex);
}

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

const PROVINCE_SEARCH_LOCATIONS: Record<string, string> = {
  AB: "Calgary, AB",
  BC: "Vancouver, BC",
  MB: "Winnipeg, MB",
  NB: "Moncton, NB",
  NL: "St. John's, NL",
  NS: "Halifax, NS",
  NT: "Yellowknife, NT",
  NU: "Iqaluit, NU",
  ON: "Toronto, ON",
  PE: "Charlottetown, PE",
  QC: "Montreal, QC",
  SK: "Saskatoon, SK",
  YT: "Whitehorse, YT",
};

function buildAutoTraderSearchUrl(request: VehicleMarketEstimateRequest) {
  const make = encodeURIComponent(request.make.toLowerCase());
  const model = encodeURIComponent(request.model.toLowerCase());
  const location = encodeURIComponent(
    PROVINCE_SEARCH_LOCATIONS[request.province] ?? request.province,
  );

  return `https://www.autotrader.ca/cars/${make}/${model}/?rcp=50&rcs=0&srt=35&yRng=${request.startYear}%2C${request.endYear}&prx=-1&loc=${location}`;
}

function createApifyRunUrl() {
  const token = getRequiredEnv("APIFY_TOKEN");
  const actorId = getRequiredEnv("APIFY_AUTOTRADER_ACTOR_ID");
  const encodedActorId = encodeActorId(actorId);

  return `https://api.apify.com/v2/acts/${encodedActorId}/run-sync-get-dataset-items?token=${token}`;
}

function createActorInput(request: VehicleMarketEstimateRequest) {
  const startUrl = buildAutoTraderSearchUrl(request);

  return {
    start_urls: [
      {
        url: startUrl,
      },
    ],

    // Keep a few common variants because different Apify actors
    // may read different names. The actor will usually ignore extras.
    max_items: 50,
    maxItems: 50,
    max_results: 50,
    maxResults: 50,

    proxyConfiguration: {
      useApifyProxy: true,
    },
  };
}

function getListingSearchText(
  listing: z.infer<typeof apifyListingSchema>,
) {
  return [
    listing.title,
    listing.heading,
    listing.make,
    listing.model,
    listing.trim,
    listing.body_type,
    listing.description,
    listing.url,
    listing.listingUrl,
    listing.listing_url,
  ]
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .toLowerCase();
}

function mapApifyListingToVehicleListing(
  listing: z.infer<typeof apifyListingSchema>,
  request: VehicleMarketEstimateRequest,
): VehicleListing | null {
  const price =
    parseNumber(listing.price_cad) ??
    parseNumber(listing.price) ??
    parseNumber(listing.price_formatted);

  if (!price || price <= 0) {
    return null;
  }

  const searchText = getListingSearchText(listing);

  const makeMatches = searchText.includes(request.make.toLowerCase());
  const modelMatches = searchText.includes(request.model.toLowerCase());

  if (!makeMatches || !modelMatches) {
    return null;
  }

  const parsedYear = parseYear(listing.year);
  const yearFromText = searchText.match(/\b(19|20)\d{2}\b/)?.[0];
  const year = parsedYear ?? (yearFromText ? Number(yearFromText) : undefined);

  if (!year || year < request.startYear || year > request.endYear) {
    return null;
  }

  const mileageKilometers =
    parseNumber(listing.mileage_km) ??
    parseNumber(listing.mileageKm) ??
    parseNumber(listing.mileage) ??
    parseNumber(listing.mileage_formatted) ??
    parseNumber(listing.odometer);

  return {
    id: String(
      listing.id ??
        listing.listingId ??
        listing.ad_id ??
        listing.vin ??
        crypto.randomUUID(),
    ),
    source: listing.data_source ?? "AutoTrader Canada via Apify",
    title:
      listing.title ??
      listing.heading ??
      `${year} ${request.make} ${request.model}`,
    make: listing.make || request.make,
    model: listing.model || request.model,
    year,
    province: listing.province ?? request.province,
    city:
      listing.city ??
      listing.dealer_city_province ??
      listing.location ??
      undefined,
    price: Math.round(price),
    mileageKilometers: mileageKilometers
      ? Math.round(mileageKilometers)
      : undefined,
    url: listing.url ?? listing.listingUrl ?? listing.listing_url ?? undefined,
    dealerName:
      listing.dealerName ??
      listing.sellerName ??
      listing.seller_name ??
      undefined,
    capturedAt: new Date().toISOString(),
  };
}

export const apifyAutoTraderMarketDataProvider: VehicleMarketDataProvider = {
  id: "apify-autotrader-ca",
  name: "AutoTrader Canada via Apify",

  async getMarketEstimate(request) {
    try {
      const response = await fetch(createApifyRunUrl(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(createActorInput(request)),
        cache: "no-store",
      });

      if (!response.ok) {
        const responseText = await response.text();

        return {
          ok: false,
          providerId: this.id,
          providerName: this.name,
          error: `Apify AutoTrader request failed with status ${response.status}: ${responseText}`,
        };
      }

      const rawData: unknown = await response.json();

        console.log("Apify raw data type:", Array.isArray(rawData) ? "array" : typeof rawData);

        if (Array.isArray(rawData)) {
        console.log("Apify raw listing count:", rawData.length);
        console.log("Apify raw first listing:", JSON.stringify(rawData[0], null, 2));
        console.log("Apify raw first listing keys:", Object.keys(rawData[0] ?? {}));
        } else {
        console.log("Apify raw response:", JSON.stringify(rawData, null, 2));
        }

        const parsedListings = apifyDatasetResponseSchema.parse(rawData);

        console.log("Parsed listing count:", parsedListings.length);

        const sampleListings = parsedListings
        .map((listing) => mapApifyListingToVehicleListing(listing, request))
        .filter((listing): listing is VehicleListing => listing !== null);

        console.log("Usable listing count:", sampleListings.length);
        console.log("Usable listing sample:", JSON.stringify(sampleListings[0], null, 2));

      const rawPrices = sampleListings.map((listing) => listing.price);
      const filteredPrices = removeExtremeOutliers(rawPrices);

      const medianListingPrice = calculateMedian(filteredPrices);

      if (!medianListingPrice) {
        return {
          ok: false,
          providerId: this.id,
          providerName: this.name,
          error: `No usable AutoTrader listings found for ${request.startYear}-${request.endYear} ${request.make} ${request.model} in ${request.province}.`,
        };
      }

      const averageListingPrice =
        filteredPrices.reduce((sum, price) => sum + price, 0) /
        filteredPrices.length;

      const minListingPrice = Math.min(...filteredPrices);
      const maxListingPrice = Math.max(...filteredPrices);

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
            sourceType: "real",
            confidence:
              filteredPrices.length >= 20
                ? "high"
                : filteredPrices.length >= 8
                  ? "medium"
                  : "low",
            lastUpdated: new Date().toISOString(),
          },
          assumptions: [
            `Purchase price estimated from AutoTrader Canada listing data accessed through Apify.`,
            `Search target: ${request.startYear}-${request.endYear} ${request.make} ${request.model} in ${request.province}.`,
            `Used ${filteredPrices.length} usable listing prices after basic filtering.`,
            `Estimated purchase price uses the median listing price.`,
            `Source freshness: live Apify actor run at request time.`,
          ],
          sampleListings,
        },
      };
    } catch (error) {
      return {
        ok: false,
        providerId: this.id,
        providerName: this.name,
        error:
          error instanceof Error
            ? error.message
            : "Unknown Apify AutoTrader provider error.",
      };
    }
  },
};