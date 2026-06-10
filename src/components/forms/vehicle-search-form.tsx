"use client";

import { useState } from "react";
import type {
  OwnershipEstimateInput,
  OwnershipEstimateResult,
} from "@/server/estimates/estimate-types";
import { MOCK_VEHICLE_OPTIONS } from "@/server/vehicles/mock-vehicles";
import type { VehicleOption } from "@/server/vehicles/mock-vehicles";
import { VehicleCombobox } from "@/components/forms/vehicle-combobox";
import { OwnershipSummaryCard } from "@/components/estimates/ownership-summary-card";
import { CostBreakdownTable } from "@/components/estimates/cost-breakdown-table";
import { EstimateAssumptionsCard } from "@/components/estimates/estimate-assumptions-card";

const PROVINCES: OwnershipEstimateInput["province"][] = [
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
];

type FormState = {
  selectedVehicle: VehicleOption;
  startYear: string;
  endYear: string;
  province: OwnershipEstimateInput["province"];
  ownershipYears: string;
  annualKilometers: string;
  fuelPricePerLiter: string;
  estimatedFuelConsumptionLPer100Km: string;
};

const initialFormState: FormState = {
  selectedVehicle: {
    make: "Toyota",
    model: "Corolla",
  },
  startYear: "2017",
  endYear: "2020",
  province: "BC",
  ownershipYears: "5",
  annualKilometers: "15000",
  fuelPricePerLiter: "1.85",
  estimatedFuelConsumptionLPer100Km: "7.2",
};

export function VehicleSearchForm() {
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [estimate, setEstimate] = useState<OwnershipEstimateResult | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) {
    setFormState((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function buildPayload(): OwnershipEstimateInput {
    return {
      make: formState.selectedVehicle.make,
      model: formState.selectedVehicle.model,
      startYear: Number(formState.startYear),
      endYear: Number(formState.endYear),
      province: formState.province,
      ownershipYears: Number(formState.ownershipYears),
      annualKilometers: Number(formState.annualKilometers),
      fuelPricePerLiter: Number(formState.fuelPricePerLiter),
      estimatedFuelConsumptionLPer100Km: Number(
        formState.estimatedFuelConsumptionLPer100Km,
      ),
    };
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setErrorMessage(null);
    setEstimate(null);

    try {
      const response = await fetch("/api/estimates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildPayload()),
      });

      if (!response.ok) {
        throw new Error("Estimate request failed.");
      }

      const data = (await response.json()) as OwnershipEstimateResult;
      setEstimate(data);
    } catch {
      setErrorMessage(
        "Something went wrong while calculating the estimate. Please check your inputs and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <h2 className="text-xl font-semibold text-slate-950">
            Vehicle details
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Search for a vehicle and enter your ownership assumptions.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <VehicleCombobox
            vehicles={MOCK_VEHICLE_OPTIONS}
            selectedVehicle={formState.selectedVehicle}
            onSelect={(vehicle) => updateField("selectedVehicle", vehicle)}
          />

          <NumberInput
            label="Start year"
            value={formState.startYear}
            onChange={(value) => updateField("startYear", value)}
          />

          <NumberInput
            label="End year"
            value={formState.endYear}
            onChange={(value) => updateField("endYear", value)}
          />

          <label className="space-y-1.5">
            <span className="text-sm font-medium text-slate-700">
              Province
            </span>
            <select
              value={formState.province}
              onChange={(event) =>
                updateField(
                  "province",
                  event.target.value as OwnershipEstimateInput["province"],
                )
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-slate-900"
            >
              {PROVINCES.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </label>

          <NumberInput
            label="Ownership years"
            value={formState.ownershipYears}
            onChange={(value) => updateField("ownershipYears", value)}
          />

          <NumberInput
            label="Annual kilometres"
            value={formState.annualKilometers}
            onChange={(value) => updateField("annualKilometers", value)}
          />

          <NumberInput
            label="Fuel price per litre"
            value={formState.fuelPricePerLiter}
            step="0.01"
            onChange={(value) => updateField("fuelPricePerLiter", value)}
          />

          <NumberInput
            label="Fuel consumption L/100km"
            value={formState.estimatedFuelConsumptionLPer100Km}
            step="0.1"
            onChange={(value) =>
              updateField("estimatedFuelConsumptionLPer100Km", value)
            }
          />
        </div>

        {errorMessage ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Calculating..." : "Calculate ownership cost"}
        </button>
      </form>

      <section className="space-y-5">
        {estimate ? (
          <>
            <OwnershipSummaryCard estimate={estimate} />
            <CostBreakdownTable costs={estimate.costs} />
            <EstimateAssumptionsCard assumptions={estimate.assumptions} />
          </>
        ) : (
          <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <div className="max-w-sm space-y-2">
              <h2 className="text-lg font-semibold text-slate-950">
                Your estimate will appear here
              </h2>
              <p className="text-sm text-slate-500">
                Submit the form to see total cost, monthly cost, and a detailed
                ownership breakdown.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

type NumberInputProps = {
  label: string;
  value: string;
  step?: string;
  onChange: (value: string) => void;
};

function NumberInput({
  label,
  value,
  step = "1",
  onChange,
}: NumberInputProps) {
  return (
    <label className="space-y-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type="number"
        value={value}
        step={step}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-slate-900"
      />
    </label>
  );
}