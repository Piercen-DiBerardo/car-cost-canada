type EstimateAssumptionsCardProps = {
  assumptions: string[];
};

export function EstimateAssumptionsCard({
  assumptions,
}: EstimateAssumptionsCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">Assumptions</h2>

      <p className="mt-1 text-sm text-slate-500">
        These values are temporary MVP assumptions and can be replaced with real
        market data later.
      </p>

      <ul className="mt-4 space-y-2">
        {assumptions.map((assumption) => (
          <li
            key={assumption}
            className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700"
          >
            {assumption}
          </li>
        ))}
      </ul>
    </div>
  );
}