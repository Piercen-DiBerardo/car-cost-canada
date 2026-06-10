"use client";

import { useMemo, useState } from "react";
import type { VehicleOption } from "@/server/vehicles/mock-vehicles";

type VehicleComboboxProps = {
  vehicles: VehicleOption[];
  selectedVehicle: VehicleOption;
  onSelect: (vehicle: VehicleOption) => void;
};

export function VehicleCombobox({
  vehicles,
  selectedVehicle,
  onSelect,
}: VehicleComboboxProps) {
  const [query, setQuery] = useState(
    `${selectedVehicle.make} ${selectedVehicle.model}`,
  );
  const [isOpen, setIsOpen] = useState(false);

  const filteredVehicles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return vehicles;
    }

    return vehicles.filter((vehicle) => {
      const label = `${vehicle.make} ${vehicle.model}`.toLowerCase();
      return label.includes(normalizedQuery);
    });
  }, [query, vehicles]);

  function handleSelect(vehicle: VehicleOption) {
    setQuery(`${vehicle.make} ${vehicle.model}`);
    setIsOpen(false);
    onSelect(vehicle);
  }

  return (
    <div className="relative space-y-1.5 sm:col-span-2">
      <label
        htmlFor="vehicle"
        className="text-sm font-medium text-slate-700"
      >
        Vehicle
      </label>

      <input
        id="vehicle"
        type="text"
        value={query}
        placeholder="Search make or model..."
        onChange={(event) => {
          setQuery(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-slate-900"
      />

      {isOpen ? (
        <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {filteredVehicles.length > 0 ? (
            filteredVehicles.map((vehicle) => {
              const label = `${vehicle.make} ${vehicle.model}`;

              return (
                <button
                  key={label}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSelect(vehicle)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm transition hover:bg-slate-100"
                >
                  <span className="font-medium text-slate-950">{label}</span>
                  <span className="text-xs text-slate-500">{vehicle.make}</span>
                </button>
              );
            })
          ) : (
            <div className="px-3 py-3 text-sm text-slate-500">
              No vehicles found.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}