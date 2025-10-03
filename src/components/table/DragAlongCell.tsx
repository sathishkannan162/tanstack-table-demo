"use client";

import React, { memo, type CSSProperties } from "react";
import type { Cell, Table as ReactTable } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { getPinnedOffset } from "./utils";

export interface DragAlongCellProps {
  cell: Cell<any, unknown>;
  table: ReactTable<any>;
}

export const DragAlongCell = memo(function DragAlongCell({
  cell,
  table,
}: DragAlongCellProps) {
  const style: CSSProperties = {
    position: "relative",
    width: cell.column.getSize(),
    whiteSpace: "nowrap",
  };

  return (
    <td
      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
        cell.column.getIsPinned() ? "sticky z-10 bg-white shadow-lg" : ""
      } ${
        cell.column.getIsPinned() === "left" ? "left-0 border-r border-gray-300" : ""
      } ${
        cell.column.getIsPinned() === "right" ? "right-0 border-l border-gray-300" : ""
      }`}
      style={{
        left:
          cell.column.getIsPinned() === "left"
            ? `${getPinnedOffset(table, cell.column)}px`
            : undefined,
        right:
          cell.column.getIsPinned() === "right"
            ? `${getPinnedOffset(table, cell.column)}px`
            : undefined,
        width: cell.column.getSize(),
        ...style,
      }}
    >
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </td>
  );
});