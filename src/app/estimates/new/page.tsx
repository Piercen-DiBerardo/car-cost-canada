import { VehicleSearchForm } from "@/components/forms/vehicle-search-form";

export default function NewEstimatePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            Canadian Car Cost Calculator
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Estimate total ownership cost
          </h1>

          <p className="max-w-2xl text-slate-600">
            Compare realistic vehicle ownership costs across purchase price,
            tax, insurance, fuel, maintenance, repairs, and depreciation.
          </p>
        </section>

        <VehicleSearchForm />
      </div>
    </main>
  );
}