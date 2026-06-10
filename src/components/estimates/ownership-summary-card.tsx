import type { OwnershipEstimateResult } from "@/server/estimates/estimate-types";

type OwnershipSummaryCardProps = {
  estimate: OwnershipEstimateResult;
};

const currencyFormatter = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
});

const monthlyCurrencyFormatter = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 2,
});

export function OwnershipSummaryCard({ estimate }: OwnershipSummaryCardProps) {
  const { input, costs } = estimate;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            Estimated ownership cost
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-950">
            {input.startYear}-{input.endYear} {input.make} {input.model}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {input.province} · {input.ownershipYears} years ·{" "}
            {input.annualKilometers.toLocaleString("en-CA")} km/year
          </p>
        </div>

        <div className="rounded-xl bg-slate-950 px-5 py-4 text-white">
          <p className="text-sm text-slate-300">Monthly cost</p>
          <p className="text-3xl font-bold">
            {monthlyCurrencyFormatter.format(costs.monthlyCost)}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <SummaryStat
          label="Total cost"
          value={currencyFormatter.format(costs.totalCost)}
        />
        <SummaryStat
          label="Purchase price"
          value={currencyFormatter.format(costs.purchasePrice)}
        />
        <SummaryStat
          label="Depreciation credit"
          value={currencyFormatter.format(costs.depreciation)}
        />
      </div>
    </div>
  );
}

type SummaryStatProps = {
  label: string;
  value: string;
};

function SummaryStat({ label, value }: SummaryStatProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}