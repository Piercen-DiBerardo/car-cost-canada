import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ownershipEstimateInputSchema } from "@/server/estimates/estimate-types";
import { calculateOwnershipCost } from "@/server/estimates/calculate-ownership-cost";
import { getVehicleMarketEstimate } from "@/server/market-data/get-vehicle-market-estimate";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = ownershipEstimateInputSchema.parse(body);

    const marketEstimate = await getVehicleMarketEstimate(input);

    if (marketEstimate.estimatedPurchasePrice <= 0) {
      return NextResponse.json(
        {
          error: "Unable to create real AutoTrader market estimate",
          assumptions: marketEstimate.assumptions,
          source: marketEstimate.source,
        },
        {
          status: 502,
        },
      );
    }

    const result = calculateOwnershipCost({
      input,
      estimatedPurchasePrice: marketEstimate.estimatedPurchasePrice,
      source: marketEstimate.source,
      marketDataAssumptions: marketEstimate.assumptions,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Invalid estimate request",
          issues: error.issues,
        },
        {
          status: 400,
        },
      );
    }

    console.error("Estimate API error:", error);

    return NextResponse.json(
      {
        error: "Unable to create estimate",
      },
      {
        status: 500,
      },
    );
  }
}