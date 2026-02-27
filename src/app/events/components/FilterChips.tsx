"use client";

import { filterChips } from "@/style/style_event";

export type FilterOption = { key: string; label: string };

type FilterChipsProps = {
  options: FilterOption[];
  selectedFilters: string[];
  onFilterToggle: (filterKey: string) => void;
};

export default function FilterChips({
  options,
  selectedFilters,
  onFilterToggle,
}: FilterChipsProps) {
  return (
    <div style={filterChips.row}>
      {options.map(({ key, label }) => {
        const selected = selectedFilters.includes(key);
        return (
          <button
            key={key}
            type="button"
            onClick={() => onFilterToggle(key)}
            style={{
              ...filterChips.chip,
              ...(selected ? filterChips.chipSelected : {}),
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
