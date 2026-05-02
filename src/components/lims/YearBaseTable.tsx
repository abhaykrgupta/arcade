"use client";

import { useState, useMemo, useEffect } from "react";
import { LimsYearBaseData } from "@/types/lims";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FilterBar } from "./FilterBar";

interface YearBaseTableProps {
  data: LimsYearBaseData[];
}

type SortKey = keyof LimsYearBaseData;

// Display columns - showing names instead of IDs
const DISPLAY_COLUMNS: { key: SortKey; label: string }[] = [
  { key: "product_name", label: "Product" },
  { key: "lab_name", label: "Lab Name" },
  { key: "breed_names", label: "Breed" },
  { key: "semen_codes", label: "Semen Code" },
  { key: "ej_no", label: "EJ No" },
  { key: "bach_id", label: "Batch ID" },
  { key: "sample_volume", label: "Sample Volume" },
  { key: "call_cons", label: "Call Cons" },
  { key: "barcode", label: "Barcode" },
  { key: "tube_count", label: "Tube Count" },
  { key: "volume_of_raw", label: "Volume of Raw" },
  { key: "washing_od_reading", label: "Washing OD Reading" },
  { key: "labtech_name", label: "Labtech Name" },
  { key: "qc_status_value", label: "QC Status" },
  { key: "expected_doses", label: "Expected Doses" },
  { key: "datetime", label: "Datetime" },
];

export function YearBaseTable({ data }: YearBaseTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number | "all">(50);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [globalSearch, setGlobalSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(globalSearch), 300);
    return () => clearTimeout(timer);
  }, [globalSearch]);

  // Apply filters to data
  const filteredData = useMemo(() => {
    const search = debouncedSearch.toLowerCase();
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo + "T23:59:59") : null;

    return data.filter((item) => {
      const matchesFilters = Object.entries(activeFilters).every(([key, value]) => {
        if (!value) return true;
        return item[key as keyof LimsYearBaseData] === value;
      });

      if (!matchesFilters) return false;

      if (fromDate || toDate) {
        const itemDate = new Date(item.datetime);
        if (fromDate && itemDate < fromDate) return false;
        if (toDate && itemDate > toDate) return false;
      }

      if (search) {
        return Object.values(item).some((val) =>
          val !== null && String(val).toLowerCase().includes(search)
        );
      }

      return true;
    });
  }, [data, activeFilters, dateFrom, dateTo, debouncedSearch]);

  const handleFilterChange = (key: string, value: string) => {
    setActiveFilters((prev) => {
      const next = { ...prev, [key]: value };
      // Clear semen code when breed changes
      if (key === "breed_names") next["semen_codes"] = "";
      return next;
    });
    setCurrentPage(1);
  };

  // 1. Sorting logic
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue === null) return sortDirection === "asc" ? 1 : -1;
      if (bValue === null) return sortDirection === "asc" ? -1 : 1;

      // Try comparing as numbers if applicable
      if (!isNaN(Number(aValue)) && !isNaN(Number(bValue))) {
        return sortDirection === "asc"
          ? Number(aValue) - Number(bValue)
          : Number(bValue) - Number(aValue);
      }

      // Default string comparison
      return sortDirection === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  }, [filteredData, sortKey, sortDirection]);

  // 2. Pagination logic
  const totalPages = itemsPerPage === "all" ? 1 : Math.ceil(sortedData.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    if (itemsPerPage === "all") return sortedData;
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) return " ↕";
    return sortDirection === "asc" ? " ▲" : " ▼";
  };

  if (!data || data.length === 0) {
    return <div className="p-4 text-center text-zinc-500">No data available</div>;
  }

  return (
    <div className="space-y-4">
      {/* Global Search */}
      <div className="relative">
        <input
          type="text"
          value={globalSearch}
          onChange={(e) => { setGlobalSearch(e.target.value); setCurrentPage(1); }}
          placeholder="Search all fields..."
          className="w-full border border-zinc-300 dark:border-zinc-700 rounded-md px-4 py-2 pr-10 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
        />
        {globalSearch && (
          <button
            onClick={() => { setGlobalSearch(""); setCurrentPage(1); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <FilterBar
        data={data}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={(val) => { setDateFrom(val); setCurrentPage(1); }}
        onDateToChange={(val) => { setDateTo(val); setCurrentPage(1); }}
      />

      <div className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
        <div>
          Showing {itemsPerPage === "all" ? 1 : Math.min(filteredData.length, (currentPage - 1) * (itemsPerPage as number) + 1)} to {itemsPerPage === "all" ? filteredData.length : Math.min(filteredData.length, currentPage * (itemsPerPage as number))} of {filteredData.length} entries
          {Object.values(activeFilters).some(Boolean) && (
            <span className="ml-2 text-blue-600 dark:text-blue-400">(filtered from {data.length} total)</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span>Show</span>
          <select
            className="border border-zinc-300 dark:border-zinc-700 rounded p-1 bg-transparent text-zinc-900 dark:text-zinc-100"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(e.target.value === "all" ? "all" : Number(e.target.value));
              setCurrentPage(1); // Reset to first page
            }}
          >
            <option value={10}>10</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={500}>500</option>
            <option value="all">All</option>
          </select>
          <span>entries</span>
        </div>
      </div>

      <Table className="max-w-none whitespace-nowrap">
          <TableHeader>
            <TableRow>
              {DISPLAY_COLUMNS.map((col) => (
                <TableHead
                  key={col.key}
                  className="cursor-pointer select-none hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors whitespace-nowrap min-w-[120px]"
                  onClick={() => handleSort(col.key)}
                >
                  {col.label}{getSortIcon(col.key)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((item, index) => (
              <TableRow key={`row-${item.id || index}`}>
                {DISPLAY_COLUMNS.map((col) => (
                  <TableCell key={`${item.id}-${col.key}`} className="max-w-xs truncate" title={String(item[col.key] || '')}>
                    {item[col.key] !== null ? String(item[col.key]) : "-"}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>

      {/* Pagination Controls */}
      <div className={`flex items-center justify-between pt-4 pb-2 ${itemsPerPage === "all" ? "invisible" : ""}`}>
        <button 
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-md text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-zinc-900 dark:text-zinc-100"
        >
          Previous
        </button>
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          Page <strong className="text-zinc-900 dark:text-zinc-100">{currentPage}</strong> of <strong className="text-zinc-900 dark:text-zinc-100">{totalPages}</strong>
        </span>
        <button 
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage >= totalPages || totalPages === 0}
          className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-md text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-zinc-900 dark:text-zinc-100"
        >
          Next
        </button>
      </div>
    </div>
  );
}
