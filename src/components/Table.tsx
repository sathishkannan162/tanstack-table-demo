"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import type { User } from "../lib/dummyData";

const columnHelper = createColumnHelper<User>();

interface TableProps {
  data: User[];
}

export function Table({ data }: TableProps) {
  const columns = [
    columnHelper.accessor("id", {
      header: "ID",
      cell: (info: any) => info.getValue(),
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
    }),
    columnHelper.accessor("department", {
      header: "Department",
      cell: (info: any) => info.getValue(),
    }),
    columnHelper.accessor("salary", {
      header: () => "Salary",
      cell: (info: any) => `$${info.getValue().toLocaleString()}`,
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
    }),
    columnHelper.accessor("isActive", {
      header: () => "Active",
      cell: (info: any) => (
        <span className={info.getValue() ? "text-green-600" : "text-red-600"}>
          {info.getValue() ? "Yes" : "No"}
        </span>
      ),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className={row.index % 2 === 0 ? "bg-white" : "bg-gray-50"}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
