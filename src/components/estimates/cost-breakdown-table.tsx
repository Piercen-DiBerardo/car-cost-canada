import type { OwnershipCostBreakdown } from "@/server/estimates/estimate-types";

type CostBreakdownTableProps = {
  costs: OwnershipCostBreakdown;
};

const currencyFormatter = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
});

const costRows: {
  key: keyof OwnershipCostBreakdown;
  label: string;
  description: string;
}[] = [
  {
    key: "purchasePrice",
    label: "Purchase price",
    description: "Estimated vehicle purchase price.",
  },
  {
    key: "tax",
    label: "Tax",
    description: "Estimated provincial sales tax.",
  },
  {
    key: "insurance",
    label: "Insurance",
    description: "Estimated insurance over ownership period.",
  },
  {
    key: "fuel",
    label: "Fuel",
    description: "Estimated fuel cost based on driving and consumption.",
  },
  {
    key: "maintenance",
    label: "Maintenance",
    description: "Routine maintenance estimate.",
  },
  {
    key: "repairs",
    label: "Repairs",
    description: "General repair estimate.",
  },
  {
    key: "depreciation",
    label: "Depreciation",
    description: "Estimated resale value offset.",
  },
  {
    key: "totalCost",
    label: "Total cost",
    description: "Estimated net ownership cost.",
  },
];

export function CostBreakdownTable({ costs }: CostBreakdownTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-950">
          Cost breakdown
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Detailed estimate by ownership category.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-6 py-3 font-medium">Category</th>
              <th className="px-6 py-3 font-medium">Description</th>
              <th className="px-6 py-3 text-right font-medium">Amount</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {costRows.map((row) => (
              <tr key={row.key}>
                <td className="px-6 py-4 font-medium text-slate-950">
                  {row.label}
                </td>
                <td className="px-6 py-4 text-slate-500">
                  {row.description}
                </td>
                <td className="px-6 py-4 text-right font-semibold text-slate-950">
                  {currencyFormatter.format(costs[row.key])}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}