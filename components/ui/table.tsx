"use client";

import { forwardRef } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown, ArrowUpDown } from "lucide-react";

/* ---- Table Root ---- */
interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export function Table({ children, className = "", ...props }: TableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-neutral-100 bg-white shadow-card">
      <table
        className={["w-full border-collapse text-sm", className].join(" ")}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

/* ---- Table Header ---- */
interface TableHeadProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export function TableHead({ children, className = "", ...props }: TableHeadProps) {
  return (
    <thead className={["bg-neutral-25/80 border-b border-neutral-100", className].join(" ")} {...props}>
      {children}
    </thead>
  );
}

/* ---- Table Body ---- */
interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export function TableBody({ children, className = "", ...props }: TableBodyProps) {
  return (
    <tbody className={["divide-y divide-neutral-50", className].join(" ")} {...props}>
      {children}
    </tbody>
  );
}

/* ---- Table Row ---- */
interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
  clickable?: boolean;
}

export function TableRow({
  children,
  clickable = false,
  className = "",
  ...props
}: TableRowProps) {
  return (
    <tr
      className={[
        "transition-colors duration-150",
        clickable && "cursor-pointer hover:bg-neutral-25",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </tr>
  );
}

/* ---- Table Header Cell ---- */
interface TableHeaderCellProps
  extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  sortable?: boolean;
  sortDirection?: "asc" | "desc" | null;
  onSort?: () => void;
}

export function TableHeaderCell({
  children,
  sortable = false,
  sortDirection,
  onSort,
  className = "",
  ...props
}: TableHeaderCellProps) {
  return (
    <th
      className={[
        "px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500",
        sortable && "cursor-pointer select-none hover:text-neutral-700",
        className,
      ].join(" ")}
      onClick={sortable ? onSort : undefined}
      {...props}
    >
      <div className="flex items-center gap-1.5">
        {children}
        {sortable && (
          <span className="text-neutral-300">
            {sortDirection === "asc" ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : sortDirection === "desc" ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronsUpDown className="h-3.5 w-3.5" />
            )}
          </span>
        )}
      </div>
    </th>
  );
}

/* ---- Table Cell ---- */
interface TableCellProps
  extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

export function TableCell({
  children,
  className = "",
  ...props
}: TableCellProps) {
  return (
    <td
      className={["px-6 py-4 text-sm text-neutral-600", className].join(" ")}
      {...props}
    >
      {children}
    </td>
  );
}
