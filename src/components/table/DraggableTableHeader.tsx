"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type {
  ColumnResizeDirection,
  ColumnResizeMode,
  Header,
  Table as ReactTable,
} from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { type CSSProperties, memo } from "react";
import {
  MAX_COL_SIZE as DEFAULT_MAX,
  MIN_COL_SIZE as DEFAULT_MIN,
  getPinnedOffset,
} from "./utils";

export interface DraggableTableHeaderProps {
  header: Header<any, unknown>;
  table: ReactTable<any>;
  columnResizeMode: ColumnResizeMode;
  columnResizeDirection: ColumnResizeDirection;
  minColSize?: number;
  maxColSize?: number;
}

export const DraggableTableHeader = memo(function DraggableTableHeader({
  header,
  table,
  columnResizeMode,
  columnResizeDirection,
  minColSize = DEFAULT_MIN,
  maxColSize = DEFAULT_MAX,
}: DraggableTableHeaderProps) {
  const { attributes, isDragging, listeners, setNodeRef, transform } =
    useSortable({
      id: header.column.id,
    });

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    whiteSpace: "nowrap",
    width: header.getSize(),
    zIndex:
      header.column.getIsPinned() === "right" ||
      header.column.getIsPinned() === "left"
        ? 10
        : isDragging
          ? 1
          : 0,
  };

  return (
    <th
      ref={setNodeRef}
      colSpan={header.colSpan}
      onClick={header.column.getToggleSortingHandler()}
      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 relative z-50 ${
        header.column.getCanSort() ? "cursor-pointer" : ""
      } ${header.column.getIsPinned() ? "sticky z-10 bg-gray-50 shadow-lg" : ""} ${
        header.column.getIsPinned() === "left"
          ? "left-0 border-r border-gray-300"
          : ""
      } ${
        header.column.getIsPinned() === "right"
          ? "right-0 border-l border-gray-300"
          : ""
      }`}
      style={{
        left:
          header.column.getIsPinned() === "left"
            ? `${getPinnedOffset(table, header.column)}px`
            : undefined,
        right:
          header.column.getIsPinned() === "right"
            ? `${getPinnedOffset(table, header.column)}px`
            : undefined,
        width: header.getSize(),
        ...style,
      }}
    >
      <div
        style={{
          transform: CSS.Transform.toString(transform),
          transition: "transform 0.2s ease-in-out",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {header.isPlaceholder
              ? null
              : flexRender(header.column.columnDef.header, header.getContext())}
            {{
              asc: " 🔼",
              desc: " 🔽",
            }[header.column.getIsSorted() as string] ?? null}
          </div>
          <div className="flex items-center space-x-1">
            {/* Drag handle */}
            <button
              type="button"
              {...attributes}
              {...listeners}
              onClick={(e) => e.stopPropagation()}
              className="text-xs px-1 py-0.5 border border-gray-300 rounded hover:bg-gray-100 bg-white"
              title="Reorder column"
            >
              🟰
            </button>
            {header.column.getCanPin() ? (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    header.column.pin("left");
                  }}
                  className="text-xs px-1 py-0.5 border border-gray-300 rounded hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  title="Pin Left"
                >
                  📌
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    header.column.pin("right");
                  }}
                  className="text-xs px-1 py-0.5 border border-gray-300 rounded hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  title="Pin Right"
                >
                  📍
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    header.column.pin(false);
                  }}
                  className="text-xs px-1 py-0.5 border border-gray-300 rounded hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  title="Unpin"
                >
                  ➤
                </button>
              </>
            ) : null}
            {header.column.getCanResize() ? (
              <button
                type="button"
                aria-label={`Resize ${String(
                  typeof header.column.columnDef.header === "string"
                    ? header.column.columnDef.header
                    : header.column.id,
                )} column`}
                tabIndex={0}
                onKeyDown={(e) => {
                  const step = e.shiftKey ? 20 : 10;
                  const current = header.getSize();
                  if (e.key === "ArrowLeft") {
                    e.preventDefault();
                    const next = Math.max(current - step, minColSize);
                    table.setColumnSizing((sizing) => ({
                      ...sizing,
                      [header.column.id]: next,
                    }));
                  } else if (e.key === "ArrowRight") {
                    e.preventDefault();
                    const next = Math.min(current + step, maxColSize);
                    table.setColumnSizing((sizing) => ({
                      ...sizing,
                      [header.column.id]: next,
                    }));
                  }
                }}
                onDoubleClick={() => header.column.resetSize()}
                onMouseDown={header.getResizeHandler()}
                onTouchStart={header.getResizeHandler()}
                className={`resizer ${columnResizeDirection} ${
                  header.column.getIsResizing() ? "isResizing" : ""
                }`}
                style={{
                  transform:
                    columnResizeMode === "onEnd" &&
                    header.column.getIsResizing()
                      ? `translateX(${
                          (columnResizeDirection === "rtl" ? -1 : 1) *
                          (table.getState().columnSizingInfo.deltaOffset ?? 0)
                        }px)`
                      : undefined,
                }}
              />
            ) : null}
          </div>
        </div>
        {/* Column Filter */}
        {header.column.getCanFilter() ? (
          <div className="mt-1">
            {header.column.id === "isActive" ? (
              <select
                value={(header.column.getFilterValue() ?? "") as string}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                onChange={(e) => {
                  header.column.setFilterValue(
                    e.target.value === ""
                      ? undefined
                      : e.target.value === "true",
                  );
                }}
                className="w-20 px-1 py-1 text-xs border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            ) : (
              <input
                value={(header.column.getFilterValue() ?? "") as string}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                onChange={(e) => header.column.setFilterValue(e.target.value)}
                placeholder={`Filter ${header.column.id}...`}
                className="w-20 px-2 py-1 text-xs border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
            )}
          </div>
        ) : null}
      </div>
    </th>
  );
});
