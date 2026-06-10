# TrueCost Auto

A Canadian vehicle total cost of ownership calculator that helps drivers estimate what a car actually costs to buy and own.

TrueCost Auto combines real market listing data with ownership-cost modelling to estimate purchase price, tax, insurance, fuel, maintenance, repairs, depreciation, total cost, and monthly cost over a selected ownership period.

## Why This Exists

Most car shopping tools focus on the sticker price.

That is not the real cost.

A cheaper vehicle can become expensive once insurance, fuel, repairs, depreciation, and taxes are included. TrueCost Auto is built to make those hidden costs easier to compare, especially for Canadian buyers.

The goal is not fake precision. The goal is useful, transparent estimates that help answer:

> “What will this car probably cost me over the next few years?”

I built this because car shopping sucks, total ownership costs are confusing, and I didn't want to make another giant Excel sheet just to compare cars. Hope you enjoy :)

## Features

* Searchable vehicle selector
* Province-based ownership estimate inputs
* Real vehicle market price estimates from AutoTrader Canada data through Apify
* Median purchase price estimation from live listing results
* Province tax estimate
* Fuel cost calculation using annual kilometres, fuel price, and L/100km
* Insurance estimate assumptions
* Maintenance and repair estimates
* Depreciation estimate
* Total ownership cost over selected years
* Estimated monthly ownership cost
* Assumptions panel explaining how the estimate was calculated
* Clean provider architecture for adding more data sources later

## Tech Stack

* Next.js App Router
* TypeScript
* Tailwind CSS
* Zod
* React
* Apify API for AutoTrader Canada listing data

Planned later:

* shadcn/ui
* Drizzle ORM
* Neon Postgres
* Trigger.dev background jobs
* Cached market listing summaries
* Vehicle comparison dashboard
* Additional providers such as MarketCheck, VinAudit, or Canadian Black Book

## Current Data Flow

```txt
User input
  -> POST /api/estimates
  -> Zod validation
  -> market data provider
  -> Apify AutoTrader Canada actor
  -> listing normalization
  -> median listing price calculation
  -> ownership cost calculator
  -> estimate response with assumptions and source info
```

## Example Estimate Response

```json
{
  "costs": {
    "purchasePrice": 16993,
    "tax": 2039,
    "insurance": 15000,
    "fuel": 9990,
    "maintenance": 4500,
    "repairs": 3500,
    "depreciation": 5948,
    "totalCost": 46075,
    "monthlyCost": 768
  },
  "source": {
    "providerId": "apify-autotrader-ca",
    "providerName": "AutoTrader Canada via Apify",
    "sourceType": "real",
    "confidence": "medium"
  },
  "assumptions": [
    "Purchase price estimated from AutoTrader Canada listing data accessed through Apify.",
    "Estimated purchase price uses the median listing price.",
    "Province tax rate used: 12.00%",
    "Insurance estimated at $250/month.",
    "Maintenance estimated at $900/year.",
    "Repairs estimated at $700/year.",
    "Depreciation estimated at 35% of purchase price over ownership period."
  ]
}
```

## Environment Variables

Create a `.env.local` file:

```bash
APIFY_TOKEN=your_apify_token_here
APIFY_AUTOTRADER_ACTOR_ID=your_actor_id_here
```

Example:

```bash
APIFY_AUTOTRADER_ACTOR_ID=fayoussef/autotrader-ca
```

Do not expose these values on the client.

## Running Locally

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Test the Estimate API

```bash
curl -X POST http://localhost:3000/api/estimates \
  -H "Content-Type: application/json" \
  -d '{
    "make": "Toyota",
    "model": "Corolla",
    "startYear": 2017,
    "endYear": 2020,
    "province": "BC",
    "ownershipYears": 5,
    "annualKilometers": 15000,
    "fuelPricePerLiter": 1.85,
    "estimatedFuelConsumptionLPer100Km": 7.2
  }'
```

## Architecture

```txt
src/
  app/
    api/
      estimates/
        route.ts
    estimates/
      new/
        page.tsx

  components/
    forms/
    estimates/

  server/
    estimates/
      calculate-ownership-cost.ts
      estimate-types.ts

    market-data/
      market-data-types.ts
      market-data-provider.ts
      get-vehicle-market-estimate.ts
      providers/
        apify-autotrader-market-data-provider.ts

    vehicles/
      mock-vehicles.ts
```

## Market Data Provider Design

The market data system uses a provider pattern so new sources can be added without rewriting the ownership calculator.

Current provider:

```txt
AutoTrader Canada via Apify
```

Future providers:

```txt
MarketCheck
VinAudit
Canadian Black Book
Cached internal database values
User-provided purchase price override
```

## What This Project Demonstrates

* Full-stack TypeScript
* Next.js App Router API routes
* Server-side input validation with Zod
* External API integration
* Real-world data normalization
* Clean provider architecture
* Ownership cost modelling
* Canadian province-specific assumptions
* Transparent calculation assumptions
* Portfolio-ready product thinking

## Roadmap

* Add purchase price override
* Show sample listing cards in the UI
* Add comparison mode for 2 to 4 vehicles
* Add charts for cost breakdowns
* Cache listing results in Postgres
* Add background refresh jobs
* Improve insurance estimation model
* Improve maintenance and repair model
* Add depreciation model by make/model/year
* Add methodology page
* Add loading and error states for slow provider responses

## Disclaimer

TrueCost Auto provides estimates only.

Vehicle prices, taxes, insurance, maintenance, repairs, depreciation, and fuel costs can vary significantly based on location, vehicle condition, mileage, driver profile, market conditions, and data availability.

This app is intended for research, comparison, and portfolio demonstration purposes. It should not be treated as financial, insurance, legal, or purchasing advice.
