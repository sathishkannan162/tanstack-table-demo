"use client";

// dnd-kit imports for column drag & drop
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type {
  Cell,
  Column,
  ColumnFiltersState,
  ColumnPinningState,
  ColumnResizeDirection,
  ColumnResizeMode,
  Header,
  PaginationState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { CSSProperties } from "react";
import { memo, useCallback, useMemo, useState } from "react";
import type { User } from "../lib/dummyData";

const columnHelper = createColumnHelper<User>();

interface TableProps {
  data: User[];
}

export function Table({ data }: TableProps) {
  // Column sizing constants
  const DEFAULT_COL_SIZE = 200;
  const MIN_COL_SIZE = 60;
  const MAX_COL_SIZE = 600;
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    left: [],
    right: [],
  });
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [columnResizeMode, setColumnResizeMode] =
    useState<ColumnResizeMode>("onChange");
  const [columnResizeDirection, setColumnResizeDirection] =
    useState<ColumnResizeDirection>("ltr");

  // Columns definition
  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "ID",
        cell: (info: any) => info.getValue(),
        enableColumnFilter: false,
      }),
      columnHelper.accessor("firstName", {
        header: "First Name",
        cell: (info: any) => info.getValue(),
      }),
      columnHelper.accessor("lastName", {
        header: "Last Name",
        cell: (info: any) => info.getValue(),
      }),
      columnHelper.accessor("email", {
        header: "Email",
        cell: (info: any) => info.getValue(),
      }),
      columnHelper.accessor("phone", {
        header: "Phone",
        cell: (info: any) => info.getValue(),
        filterFn: "includesString",
        enableColumnFilter: true,
      }),
      columnHelper.accessor("department", {
        header: "Department",
        cell: (info: any) => info.getValue(),
        filterFn: "includesString",
        enableColumnFilter: true,
      }),
      columnHelper.accessor("salary", {
        header: () => "Salary",
        cell: (info: any) => `$${info.getValue().toLocaleString()}`,
        enableColumnFilter: false,
      }),
      columnHelper.accessor("hireDate", {
        header: () => "Hire Date",
        cell: (info: any) => {
          const date = info.getValue() as Date;
          return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }).format(date);
        },
        enableColumnFilter: false,
      }),
      columnHelper.accessor("isActive", {
        header: () => "Active",
        cell: (info: any) => (
          <span className={info.getValue() ? "text-green-600" : "text-red-600"}>
            {info.getValue() ? "Yes" : "No"}
          </span>
        ),
        filterFn: "equals",
        enableColumnFilter: true,
      }),
    ],
    [],
  );

  // Column order state for DnD
  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    // Ensure stable ids for DnD: prefer explicit id, then accessorKey
    (columns as any[])
      .map((c) => (c.id ?? c.accessorKey) as string)
      .filter(Boolean),
  );
  const [showColumnMenu, setShowColumnMenu] = useState(false);

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      columnFilters,
      columnPinning,
      columnVisibility,
      sorting,
      pagination,
      columnOrder,
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onColumnPinningChange: setColumnPinning,
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: "includesString",
    enableColumnPinning: true,
    enableColumnResizing: true,
    columnResizeMode,
    columnResizeDirection,
    defaultColumn: {
      size: DEFAULT_COL_SIZE,
      minSize: MIN_COL_SIZE,
      maxSize: MAX_COL_SIZE,
    },
    debugTable: true,
  });

  const getPinnedOffset = (column: any) => {
    if (column.getIsPinned && column.getIsPinned() === "left") {
      let offset = 0;
      for (const c of table.getLeftLeafColumns()) {
        if (c.id === column.id) break;
        offset += c.getSize();
      }
      return offset;
    }
    if (column.getIsPinned && column.getIsPinned() === "right") {
      let offset = 0;
      for (const c of table.getRightLeafColumns()) {
        if (c.id === column.id) break;
        offset += c.getSize();
      }
      return offset;
    }
    return 0;
  };

  // DnD handlers and sensors
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setColumnOrder((prev) => {
        const oldIndex = prev.indexOf(active.id as string);
        const newIndex = prev.indexOf(over.id as string);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }, []);

  const sensors = useSensors(
    // Small activation constraints help avoid accidental sort clicks
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {}),
  );

  // Header cell component with drag handle
  const DraggableTableHeader = memo(function DraggableTableHeader({
    header,
  }: {
    header: Header<User, unknown>;
  }) {
    const { attributes, isDragging, listeners, setNodeRef, transform } =
      useSortable({
        id: header.column.id,
      });

    const style: CSSProperties = {
      opacity: isDragging ? 0.8 : 1,
      position: "relative",
      transform: CSS.Transform.toString(transform),
      transition: "transform 0.2s ease-in-out, width 0.2s ease-in-out",
      whiteSpace: "nowrap",
      width: header.getSize(),
      zIndex: isDragging ? 1 : 0,
    };

    return (
      <th
        ref={setNodeRef}
        colSpan={header.colSpan}
        onClick={header.column.getToggleSortingHandler()}
        className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 relative ${
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
              ? `${getPinnedOffset(header.column)}px`
              : undefined,
          right:
            header.column.getIsPinned() === "right"
              ? `${getPinnedOffset(header.column)}px`
              : undefined,
          width: header.getSize(),
          ...style,
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
                    const next = Math.max(current - step, MIN_COL_SIZE);
                    table.setColumnSizing((sizing) => ({
                      ...sizing,
                      [header.column.id]: next,
                    }));
                  } else if (e.key === "ArrowRight") {
                    e.preventDefault();
                    const next = Math.min(current + step, MAX_COL_SIZE);
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
                onChange={(e) => header.column.setFilterValue(e.target.value)}
                placeholder={`Filter ${header.column.id}...`}
                className="w-20 px-2 py-1 text-xs border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
            )}
          </div>
        ) : null}
      </th>
    );
  });

  // Body cell — no sortable bindings to avoid duplicate droppable ids
  const DragAlongCell = memo(function DragAlongCell({
    cell,
  }: {
    cell: Cell<User, unknown>;
  }) {
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
          cell.column.getIsPinned() === "left"
            ? "left-0 border-r border-gray-300"
            : ""
        } ${
          cell.column.getIsPinned() === "right"
            ? "right-0 border-l border-gray-300"
            : ""
        }`}
        style={{
          left:
            cell.column.getIsPinned() === "left"
              ? `${getPinnedOffset(cell.column)}px`
              : undefined,
          right:
            cell.column.getIsPinned() === "right"
              ? `${getPinnedOffset(cell.column)}px`
              : undefined,
          width: cell.column.getSize(),
          ...style,
        }}
      >
        {flexRender(cell.column.columnDef.cell, cell.getContext())}
      </td>
    );
  });

  return (
    <div className="w-full">
      {/* Global Filter */}
      <div className="mb-4 flex justify-between items-center">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(String(e.target.value))}
            placeholder="Search all columns..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-700">
            Showing {table.getRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} rows
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColumnMenu((v) => !v)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm rounded-md text-gray-700 bg-white hover:bg-gray-50"
              aria-haspopup="menu"
              aria-expanded={showColumnMenu}
            >
              Columns ▾
            </button>
            {showColumnMenu ? (
              <div
                className="absolute right-0 mt-2 w-64 rounded-md border border-gray-200 bg-white shadow-lg z-20 p-2 max-h-72 overflow-auto"
                role="menu"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600">
                    Toggle columns
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className="px-2 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-50"
                      onClick={() => table.resetColumnVisibility()}
                      title="Reset to default visibility"
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      className="px-2 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-50"
                      onClick={() => {
                        table.getAllLeafColumns().forEach((col) => {
                          col.toggleVisibility(true);
                        });
                      }}
                      title="Show all columns"
                    >
                      All
                    </button>
                    <button
                      type="button"
                      className="px-2 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-50"
                      onClick={() => {
                        table.getAllLeafColumns().forEach((col) => {
                          col.toggleVisibility(false);
                        });
                      }}
                      title="Hide all columns"
                    >
                      None
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  {table
                    .getAllLeafColumns()
                    .filter((col) => col.getCanHide())
                    .map((col) => (
                      <label
                        key={col.id}
                        className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={col.getIsVisible()}
                          onChange={(e) =>
                            col.toggleVisibility(e.target.checked)
                          }
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <span className="truncate">
                          {typeof col.columnDef.header === "string"
                            ? col.columnDef.header
                            : col.id}
                        </span>
                      </label>
                    ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          {/* DndContext must not be nested directly inside <table> */}
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToHorizontalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
          >
            <table
              className="min-w-full divide-y divide-gray-200"
              style={{ width: table.getTotalSize() }}
            >
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    <SortableContext
                      items={headerGroup.headers.map((h) => h.column.id)}
                      strategy={horizontalListSortingStrategy}
                    >
                      {headerGroup.headers.map((header) => (
                        <DraggableTableHeader key={header.id} header={header} />
                      ))}
                    </SortableContext>
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={`${
                      row.index % 2 === 0
                        ? "bg-white"
                        : "bg-gray-50 hover:bg-gray-100"
                    } ${
                      row
                        .getVisibleCells()
                        .some((cell) => cell.column.getIsPinned())
                        ? "relative"
                        : ""
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <DragAlongCell key={cell.id} cell={cell} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </DndContext>
        </div>

        {/* Pagination */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                type="button"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div className="flex items-center">
                <span className="text-sm text-gray-700 mr-4">
                  Page{" "}
                  <strong>
                    {table.getState().pagination.pageIndex + 1} of{" "}
                    {table.getPageCount()}
                  </strong>
                </span>
                <select
                  value={table.getState().pagination.pageSize}
                  onChange={(e) => {
                    table.setPageSize(Number(e.target.value));
                  }}
                  className="ml-2 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <option key={pageSize} value={pageSize}>
                      Show {pageSize}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed mr-2"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Applied Filters, Sorting, and Pinning Summary */}
        <div className="px-6 py-3 bg-gray-100 border-t border-gray-200">
          <div className="text-sm text-gray-700">
            {(() => {
              const summaries: string[] = [];

              // Global filter summary
              if (globalFilter) {
                summaries.push(`Global search: "${globalFilter}"`);
              }

              // Column filters summary
              const columnFilterSummaries = columnFilters
                .filter(
                  (filter) => filter.value !== undefined && filter.value !== "",
                )
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
              const leftPinned = table
                .getLeftLeafColumns()
                .map((col) => col.id);
              const rightPinned = table
                .getRightLeafColumns()
                .map((col) => col.id);
              if (leftPinned.length > 0) {
                summaries.push(`Left pinned: ${leftPinned.join(", ")}`);
              }
              if (rightPinned.length > 0) {
                summaries.push(`Right pinned: ${rightPinned.join(", ")}`);
              }

              if (summaries.length === 0) {
                return <span>No filters, sorting, or pinning applied</span>;
              }

              return <span>Applied: {summaries.join(", ")}</span>;
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
