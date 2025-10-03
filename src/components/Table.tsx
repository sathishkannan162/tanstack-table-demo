"use client";

import type {
  ColumnFiltersState,
  ColumnPinningState,
  PaginationState,
  SortingState,
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
import { useState } from "react";
import type { User } from "../lib/dummyData";

const columnHelper = createColumnHelper<User>();

interface TableProps {
  data: User[];
}

export function Table({ data }: TableProps) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    left: [],
    right: [],
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const columns = [
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
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      columnFilters,
      columnPinning,
      sorting,
      pagination,
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onColumnPinningChange: setColumnPinning,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: "includesString",
    enableColumnPinning: true,
    debugTable: true,
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
        <div className="text-sm text-gray-700">
          Showing {table.getRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} rows
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 ${
                      header.column.getCanSort() ? "cursor-pointer" : ""
                    } ${header.column.getIsPinned() ? "sticky z-10 bg-gray-50 shadow-lg" : ""} ${
                      header.column.getIsPinned() === "left" ? "left-0 border-r border-gray-300" : ""
                    } ${
                      header.column.getIsPinned() === "right" ? "right-0 border-l border-gray-300" : ""
                    }`}
                    style={{
                      left: header.column.getIsPinned() === "left" ? `${header.index * 200}px` : undefined,
                      right: header.column.getIsPinned() === "right" ? `${(table.getVisibleLeafColumns().length - 1 - header.index) * 200}px` : undefined,
                      width: header.getSize(),
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                        {{
                          asc: " 🔼",
                          desc: " 🔽",
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                      <div className="flex items-center space-x-1">
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
                          <div
                            className="w-2 h-4 cursor-col-resize bg-transparent hover:bg-gray-300 mx-1 -mr-2"
                            onMouseDown={header.getResizeHandler()}
                            onTouchStart={header.getResizeHandler()}
                            aria-hidden="true"
                          />
                        ) : null}
                      </div>
                    </div>
                    {/* Column Filter */}
                    {header.column.getCanFilter() ? (
                      <div className="mt-1">
                        {header.column.id === "isActive" ? (
                          <select
                            value={
                              (header.column.getFilterValue() ?? "") as string
                            }
                            onChange={(e) => {
                              // sets true or false based on yes or no
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
                            value={
                              (header.column.getFilterValue() ?? "") as string
                            }
                            onChange={(e) =>
                              header.column.setFilterValue(e.target.value)
                            }
                            placeholder={`Filter ${header.column.id}...`}
                            className="w-20 px-2 py-1 text-xs border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        )}
                      </div>
                    ) : null}
                  </th>
                ))}
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
                  row.getVisibleCells().some(cell => cell.column.getIsPinned())
                    ? "relative"
                    : ""
                }`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                      cell.column.getIsPinned() ? "sticky z-10 bg-white shadow-lg" : ""
                    } ${
                      cell.column.getIsPinned() === "left" ? "left-0 border-r border-gray-300" : ""
                    } ${
                      cell.column.getIsPinned() === "right" ? "right-0 border-l border-gray-300" : ""
                    }`}
                    style={{
                      left: cell.column.getIsPinned() === "left" ? `${cell.column.getPinnedIndex() * 200}px` : undefined,
                      right: cell.column.getIsPinned() === "right" ? `${(table.getVisibleLeafColumns().length - 1 - cell.column.getPinnedIndex()) * 200}px` : undefined,
                      width: cell.column.getSize(),
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
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
                  let value = filter.value;
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
              const leftPinned = table.getLeftLeafColumns().map(col => col.id);
              const rightPinned = table.getRightLeafColumns().map(col => col.id);
              if (leftPinned.length > 0) {
                summaries.push(`Left pinned: ${leftPinned.join(', ')}`);
              }
              if (rightPinned.length > 0) {
                summaries.push(`Right pinned: ${rightPinned.join(', ')}`);
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
