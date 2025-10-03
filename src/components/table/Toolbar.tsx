"use client";

import React, { useState } from "react";
import type { Table as ReactTable } from "@tanstack/react-table";
import type { User } from "../../lib/dummyData";

export interface ToolbarProps {
  table: ReactTable<User>;
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
}

export function Toolbar({ table, globalFilter, setGlobalFilter }: ToolbarProps) {
  const [showColumnMenu, setShowColumnMenu] = useState(false);

  return (
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
                        onChange={(e) => col.toggleVisibility(e.target.checked)}
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
  );
}