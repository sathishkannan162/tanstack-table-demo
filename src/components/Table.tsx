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
} from "@dnd-kit/sortable";
import type {
  ColumnFiltersState,
  ColumnPinningState,
  ColumnResizeDirection,
  ColumnResizeMode,
  PaginationState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import type { User } from "../lib/dummyData";

import { getUserColumns } from "./table/columns";
import { DragAlongCell } from "./table/DragAlongCell";
import { DraggableTableHeader } from "./table/DraggableTableHeader";
import { Pagination } from "./table/Pagination";
import { Summary } from "./table/Summary";
import { Toolbar } from "./table/Toolbar";
import { DEFAULT_COL_SIZE, MAX_COL_SIZE, MIN_COL_SIZE } from "./table/utils";

interface TableProps {
  data: User[];
}

export function Table({ data }: TableProps) {
  // Global/filter/sort/pagination/pinning/visibility state
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

  // Columns definition (reusable)
  const columns = useMemo(() => getUserColumns(), []);

  // Column order state for DnD
  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    (columns as any[])
      .map((c) => (c.id ?? (c as any).accessorKey) as string)
      .filter(Boolean),
  );

  const table = useReactTable<User>({
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

  return (
    <div className="w-full">
      {/* Toolbar with Global Filter and Column Visibility */}
      <Toolbar
        table={table}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
      />

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
                        <DraggableTableHeader
                          key={header.id}
                          header={header}
                          table={table}
                          columnResizeMode={columnResizeMode}
                          columnResizeDirection={columnResizeDirection}
                          minColSize={MIN_COL_SIZE}
                          maxColSize={MAX_COL_SIZE}
                        />
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
                      <DragAlongCell key={cell.id} cell={cell} table={table} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </DndContext>
        </div>

        {/* Pagination */}
        <Pagination table={table} />

        {/* Applied Filters, Sorting, and Pinning Summary */}
        <Summary
          table={table}
          globalFilter={globalFilter}
          columnFilters={columnFilters}
          sorting={sorting}
        />
      </div>
    </div>
  );
}
