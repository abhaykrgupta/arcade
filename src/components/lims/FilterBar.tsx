"use client";

import { useState, useMemo } from "react";
import { LimsYearBaseData } from "@/types/lims";

interface FilterConfig {
  key: keyof Pick<LimsYearBaseData, "product_name" | "lab_name" | "breed_names" | "semen_codes">;
  label: string;
}

const FILTERS: FilterConfig[] = [
  { key: "product_name", label: "Product" },
  { key: "lab_name", label: "Lab" },
  { key: "breed_names", label: "Breed" },
  { key: "semen_codes", label: "Semen Code" },
];

interface FilterBarProps {
  data: LimsYearBaseData[];
  activeFilters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
}

function SearchSelect({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    return options.filter((opt) =>
      opt.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  const handleSelect = (val: string) => {
    onChange(val);
    setSearch("");
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange("");
    setSearch("");
  };

  return (
    <div className="relative min-w-[200px]">
      <div className="relative">
        <input
          type="text"
          value={value || search}
          onChange={(e) => {
            if (value) {
              handleClear();
            } else {
              setSearch(e.target.value);
            }
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            setTimeout(() => setIsOpen(false), 200);
          }}
          placeholder={placeholder}
          className="w-full border border-zinc-300 dark:border-zinc-700 rounded-md px-3 py-2 pr-8 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            ✕
          </button>
        )}
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg">
          {filteredOptions.map((opt) => (
            <button
              key={opt}
              onMouseDown={() => handleSelect(opt)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 ${
                value === opt ? "bg-blue-50 dark:bg-blue-900/30" : ""
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function FilterBar({ data, activeFilters, onFilterChange, dateFrom, dateTo, onDateFromChange, onDateToChange }: FilterBarProps) {
  const uniqueOptions = useMemo(() => {
    const options: Record<string, string[]> = {};
    const selectedBreed = activeFilters["breed_names"];

    FILTERS.forEach(({ key }) => {
      const source = key === "semen_codes" && selectedBreed
        ? data.filter((item) => item.breed_names === selectedBreed)
        : data;
      const unique = [...new Set(source.map((item) => item[key]).filter(Boolean))];
      options[key] = unique.sort();
    });
    return options;
  }, [data, activeFilters]);

  const hasDate = dateFrom || dateTo;

  return (
    <div className="flex flex-wrap gap-3 mb-4 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-md border border-zinc-200 dark:border-zinc-800">
      {FILTERS.map(({ key, label }) => (
        <div key={key} className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            {label}
          </label>
          <SearchSelect
            options={uniqueOptions[key] || []}
            value={activeFilters[key] || ""}
            onChange={(val) => onFilterChange(key, val)}
            placeholder={`Select ${label.toLowerCase()}...`}
          />
        </div>
      ))}

      {/* Date range — two native inputs in one styled box */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Date Range
        </label>
        <div className="flex items-center gap-1 border border-zinc-300 dark:border-zinc-700 rounded-md px-3 py-2 bg-white dark:bg-zinc-900 focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-600">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="text-sm bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none"
          />
          <span className="text-zinc-400 text-xs px-1">→</span>
          <input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => onDateToChange(e.target.value)}
            className="text-sm bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none"
          />
          {hasDate && (
            <button
              onClick={() => { onDateFromChange(""); onDateToChange(""); }}
              className="ml-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
