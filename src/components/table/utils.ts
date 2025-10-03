import type { Column, Table as ReactTable } from "@tanstack/react-table";

export const DEFAULT_COL_SIZE = 200;
export const MIN_COL_SIZE = 60;
export const MAX_COL_SIZE = 600;

// Compute the pixel offset for pinned columns based on their pinned siblings
export function getPinnedOffset<TData>(
  table: ReactTable<TData>,
  column: Column<TData, unknown>
): number {
  const pinned = column.getIsPinned();
  if (pinned === "left") {
    let offset = 0;
    for (const c of table.getLeftLeafColumns()) {
      if (c.id === column.id) break;
      offset += c.getSize();
    }
    return offset;
  }
  if (pinned === "right") {
    // For right-pinned columns, compute offset from the right edge.
    // We need to add up the sizes of the columns that are to the RIGHT of the current one,
    // which requires iterating from the end of the right-pinned array backwards.
    const rights = table.getRightLeafColumns();
    let offset = 0;
    for (let i = rights.length - 1; i >= 0; i--) {
      const c = rights[i];
      if (c.id === column.id) break;
      offset += c.getSize();
    }
    return offset;
  }
  return 0;
}

export function formatCurrency(
  value: number,
  locale = "en-US",
  currency = "USD"
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `$${value.toLocaleString()}`;
  }
}

export function formatDate(date: Date, locale = "en-US"): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  } catch {
    return String(date);
  }
}