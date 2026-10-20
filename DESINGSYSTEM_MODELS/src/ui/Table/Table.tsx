import type { ReactNode } from "react";
import { cx } from "../utils";

export interface TableColumn<T> {
  key: string;
  header: string;
  width?: number | string;
  align?: "start" | "end";
  mono?: boolean;
  render?: (row: T) => ReactNode;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  caption?: string;
  /** Totals row (document summaries, tax tables). */
  footer?: ReactNode;
  /** No sticky header/hover — for line items inside detail panels. */
  plain?: boolean;
  stackOnMobile?: boolean;
  rowClassName?: (row: T) => string | undefined;
}

/**
 * Read-only table for small, fixed data sets (line items, tax breakdowns).
 * Use DataGrid for anything users sort, filter or select.
 */
export function Table<T>({ columns, rows, rowKey, caption, footer, plain, stackOnMobile, rowClassName }: TableProps<T>) {
  return (
    <table className={cx("k-table", plain && "k-table--plain", stackOnMobile && "k-table--stack")}>
      {caption && <caption className="k-sr-only">{caption}</caption>}
      <colgroup>{columns.map((c) => <col key={c.key} style={{ width: c.width }} />)}</colgroup>
      <thead>
        <tr>{columns.map((c) => <th key={c.key} scope="col" className={cx(c.align === "end" && "is-num")}>{c.header}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={rowKey(r)} className={rowClassName?.(r)}>
            {columns.map((c, i) => (
              <td key={c.key} data-label={i === 0 ? undefined : c.header} className={cx(i === 0 && "k-table__primary", c.align === "end" && "is-num", c.mono && "is-id")}>
                {c.render ? c.render(r) : String((r as Record<string, unknown>)[c.key] ?? "")}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
      {footer && <tfoot>{footer}</tfoot>}
    </table>
  );
}

export interface TotalsProps {
  lines: Array<{ label: string; value: string }>;
  total: { label: string; value: string };
}

export function Totals({ lines, total }: TotalsProps) {
  return (
    <table className="k-totals">
      <tbody>
        {lines.map((l) => <tr key={l.label}><th scope="row">{l.label}</th><td>{l.value}</td></tr>)}
        <tr className="k-totals__grand"><th scope="row">{total.label}</th><td>{total.value}</td></tr>
      </tbody>
    </table>
  );
}
