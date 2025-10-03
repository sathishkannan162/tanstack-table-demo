"use client";

import type {
  ColumnFiltersState,
  Table as ReactTable,
  SortingState,
} from "@tanstack/react-table";
import type { User } from "../../lib/dummyData";

export interface SummaryProps {
  table: ReactTable<User>;
  globalFilter: string;
  columnFilters: ColumnFiltersState;
  sorting: SortingState;
}

export function Summary({
  table,
  globalFilter,
  columnFilters,
  sorting,
}: SummaryProps) {
  const summaries: string[] = [];

  // Global filter summary
  if (globalFilter) {
    summaries.push(`Global search: "${globalFilter}"`);
  }

  // Column filters summary
  const columnFilterSummaries = columnFilters
    .filter((filter) => filter.value !== undefined && filter.value !== "")
    .map((filter) => {
      let value = filter.value as any;
      if (filter.id === "isActive") {
        value = value ? "Yes" : "No";
      }
      return `${filter.id}: ${value}`;
    });

  if (columnFilterSummaries.length > 0) {
    summaries.push(...columnFilterSummaries);
  }

  // Sorting summary
  const sortingSummaries = sorting
    .filter((sort) => sort.desc !== undefined)
    .map((sort) => {
      const direction = sort.desc ? "Descending" : "Ascending";
      return `${sort.id}: ${direction}`;
    });
  if (sortingSummaries.length > 0) {
    summaries.push(...sortingSummaries);
  }

  // Pinning summary
  const leftPinned = table.getLeftLeafColumns().map((col) => col.id);
  const rightPinned = table.getRightLeafColumns().map((col) => col.id);
  if (leftPinned.length > 0) {
    summaries.push(`Left pinned: ${leftPinned.join(", ")}`);
  }
  if (rightPinned.length > 0) {
    summaries.push(`Right pinned: ${rightPinned.join(", ")}`);
  }

  // Column order summary (visible columns in current order)
  const stateOrder = (table.getState().columnOrder ?? []) as string[];
  if (stateOrder.length > 0) {
    const visibleIds = new Set(table.getVisibleLeafColumns().map((c) => c.id));
    const idToCol = new Map(table.getAllLeafColumns().map((c) => [c.id, c]));
    const labels = stateOrder
      .filter((id) => visibleIds.has(id))
      .map((id) => {
        const col = idToCol.get(id);
        if (!col) return String(id);
        const header = col.columnDef.header as unknown;
        return typeof header === "string" ? (header as string) : col.id;
      });
    if (labels.length > 0) {
      summaries.push(`Column order: ${labels.join(", ")}`);
    }
  }

  return (
    <div className="px-6 py-3 bg-gray-100 border-t border-gray-200">
      <div className="text-sm text-gray-700">
        {summaries.length === 0 ? (
          <span>No filters, sorting, pinning, or reordering applied</span>
        ) : (
          <span>Applied: {summaries.join(", ")}</span>
        )}
      </div>
    </div>
  );
}
