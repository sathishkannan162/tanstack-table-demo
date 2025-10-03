import type { ColumnDef } from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import type { User } from "../../lib/dummyData";
import { formatCurrency, formatDate } from "./utils";
import React from "react";

const columnHelper = createColumnHelper<User>();

export function getUserColumns(): ColumnDef<User, any>[] {
  return [
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
      cell: (info: any) => formatCurrency(info.getValue() as number),
      enableColumnFilter: false,
    }),
    columnHelper.accessor("hireDate", {
      header: () => "Hire Date",
      cell: (info: any) => formatDate(info.getValue() as Date),
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
}