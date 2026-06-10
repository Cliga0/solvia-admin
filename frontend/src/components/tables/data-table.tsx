"use client";

import { useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type RowSelectionState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Pagination } from "./pagination";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount?: number;
  pageIndex?: number;
  pageSize?: number;
  onPaginationChange?: (page: number, pageSize: number) => void;
  onRowSelection?: (selectedIds: string[]) => void;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableRowSelection?: boolean;
  getRowId?: (row: TData) => string;
  loading?: boolean;
  className?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  pageIndex = 0,
  pageSize = 20,
  onPaginationChange,
  onRowSelection,
  enableSorting = true,
  enableFiltering = false,
  enableRowSelection = true,
  getRowId,
  loading = false,
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  useEffect(() => {
    if (onRowSelection) {
      const selectedIds = Object.keys(rowSelection);
      onRowSelection(selectedIds);
    }
  }, [rowSelection, onRowSelection]);

  const selectionColumn: ColumnDef<TData, TValue> = {
    id: "__select__",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="h-4 w-4"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="h-4 w-4"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  };

  const allColumns = enableRowSelection
    ? [selectionColumn, ...columns]
    : columns;

  const table = useReactTable({
    data,
    columns: allColumns,
    pageCount: pageCount ?? Math.ceil(data.length / pageSize),
    state: {
      sorting,
      columnFilters,
      rowSelection,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    onSortingChange: enableSorting ? setSorting : undefined,
    onColumnFiltersChange: enableFiltering ? setColumnFilters : undefined,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    manualPagination: !!onPaginationChange,
    getRowId: getRowId || ((row) => (row as { id: string }).id),
  });

  const handlePageChange = (page: number) => {
    if (onPaginationChange) {
      onPaginationChange(page, pageSize);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    if (onPaginationChange) {
      onPaginationChange(0, newPageSize);
    }
  };

  return (
    <div className={className}>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={allColumns.length}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-foreground" />
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={row.getIsSelected() ? "bg-muted/50" : ""}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={allColumns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {onPaginationChange && pageCount && pageCount > 1 && (
        <Pagination
          pageIndex={pageIndex}
          pageSize={pageSize}
          pageCount={pageCount}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          className="mt-4"
        />
      )}
    </div>
  );
}
