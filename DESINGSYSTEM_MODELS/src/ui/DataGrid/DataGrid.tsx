import { Fragment, useEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent, type ReactNode } from "react";
import { cx, readPrefs, writePrefs } from "../utils";
import { Icon } from "../Icon/Icon";
import { Checkbox } from "../Input/Input";
import { Dropdown } from "../Dropdown/Dropdown";
import { EmptyState } from "../EmptyState/EmptyState";

export type Align = "start" | "end" | "center";

export interface Column<T> {
  key: string;
  header: string;
  /** Default width in px. Columns are never equal-width by default. */
  width: number;
  minWidth?: number;
  align?: Align;
  /** Cell content. Defaults to String(row[key]). */
  render?: (row: T) => ReactNode;
  /** Value used for sorting; defaults to row[key]. */
  sortValue?: (row: T) => string | number;
  sortable?: boolean;
  /** Can be hidden from the column menu. Primary column should be false. */
  hideable?: boolean;
  hiddenByDefault?: boolean;
  /** Identifier font (codes, GSTIN). */
  mono?: boolean;
  /** Secondary text colour. */
  secondary?: boolean;
  /** Inline edit. Return a promise; a rejection shows the error on the cell. */
  edit?: {
    kind: "text" | "number" | "select";
    options?: string[];
    getValue: (row: T) => string;
    onCommit: (row: T, value: string) => Promise<void> | void;
    validate?: (value: string) => string | null;
  };
  /** Accessible header label when header text is visually short. */
  label?: string;
}

export interface SortRule {
  key: string;
  dir: "asc" | "desc";
}

export interface BulkAction<T> {
  label: string;
  icon?: string;
  danger?: boolean;
  onAction: (rows: T[]) => void;
}

export interface DataGridProps<T> {
  /** Persists widths and visible columns per user. */
  id: string;
  label: string;
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  /** Total matching records on the server (for “select all 1,284”). */
  totalCount?: number;
  selectable?: boolean;
  bulkActions?: BulkAction<T>[];
  rowActions?: (row: T) => Array<{ label: string; danger?: boolean; onSelect: () => void }>;
  /** Expandable detail row. */
  renderDetail?: (row: T) => ReactNode;
  /** Row-level attention state (credit hold, shortage). Not the only signal. */
  rowAttention?: (row: T) => boolean;
  initialSort?: SortRule[];
  /** Controlled server-side sorting. If omitted, sorts client-side. */
  onSortChange?: (rules: SortRule[]) => void;
  loading?: boolean;
  /** Re-fetching: keep rows, show progress bar. */
  refreshing?: boolean;
  error?: ReactNode;
  empty?: ReactNode;
  toolbar?: ReactNode;
  footer?: ReactNode;
  /** Sticky selection + first data column. */
  stickyFirstColumn?: boolean;
  /** Fill remaining viewport height (list pages). */
  fill?: boolean;
  /** Stack rows as cards on phones. */
  stackOnMobile?: boolean;
}

/**
 * Enterprise data grid: sticky header, resize, column visibility, sort and
 * Shift-click multi-sort, row selection with Shift-range, bulk bar, inline
 * edit, expandable rows, loading/refresh/error/empty states.
 */
export function DataGrid<T>(props: DataGridProps<T>) {
  const {
    id, label, rows, columns, rowKey, totalCount, selectable, bulkActions = [], rowActions, renderDetail, rowAttention,
    initialSort = [], onSortChange, loading, refreshing, error, empty, toolbar, footer, stickyFirstColumn = true, fill, stackOnMobile = true,
  } = props;

  // ---- Persisted column preferences ----------------------------------------
  const saved = readPrefs().grids?.[id];
  const [widths, setWidths] = useState<Record<string, number>>(() => saved?.widths ?? {});
  const [hidden, setHidden] = useState<string[]>(() => saved?.hidden ?? columns.filter((c) => c.hiddenByDefault).map((c) => c.key));
  useEffect(() => {
    const grids = readPrefs().grids ?? {};
    writePrefs({ grids: { ...grids, [id]: { widths, hidden } } });
  }, [id, widths, hidden]);

  const visible = columns.filter((c) => !hidden.includes(c.key));

  // ---- Sorting ----------------------------------------------------------------
  const [sort, setSort] = useState<SortRule[]>(initialSort);
  const toggleSort = (key: string, additive: boolean) => {
    setSort((cur) => {
      const ex = cur.find((s) => s.key === key);
      let next: SortRule[];
      if (additive) {
        next = !ex ? [...cur, { key, dir: "asc" }] : ex.dir === "asc" ? cur.map((s) => (s.key === key ? { key, dir: "desc" } : s)) : cur.filter((s) => s.key !== key);
      } else {
        next = !ex || cur.length > 1 ? [{ key, dir: "asc" }] : ex.dir === "asc" ? [{ key, dir: "desc" }] : [];
      }
      onSortChange?.(next);
      return next;
    });
  };
  const sorted = useMemo(() => {
    if (onSortChange || !sort.length) return rows;
    const value = (r: T, c: Column<T>) => (c.sortValue ? c.sortValue(r) : ((r as Record<string, unknown>)[c.key] as string | number));
    return [...rows].sort((a, b) => {
      for (const s of sort) {
        const c = columns.find((x) => x.key === s.key);
        if (!c) continue;
        const va = value(a, c), vb = value(b, c);
        if (va < vb) return s.dir === "asc" ? -1 : 1;
        if (va > vb) return s.dir === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [rows, sort, columns, onSortChange]);

  // ---- Selection ------------------------------------------------------------------
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [allMatching, setAllMatching] = useState(false);
  const lastIndex = useRef<number | null>(null);
  const keys = sorted.map(rowKey);
  const nSel = selected.size;
  const toggleRow = (index: number, e: MouseEvent) => {
    const k = keys[index];
    setAllMatching(false);
    setSelected((cur) => {
      const next = new Set(cur);
      const on = !cur.has(k);
      if (e.shiftKey && lastIndex.current !== null) {
        const [a, b] = [Math.min(lastIndex.current, index), Math.max(lastIndex.current, index)];
        keys.slice(a, b + 1).forEach((x) => (on ? next.add(x) : next.delete(x)));
      } else if (on) next.add(k);
      else next.delete(k);
      return next;
    });
    lastIndex.current = index;
  };
  const toggleAll = () => { setAllMatching(false); setSelected(nSel === keys.length ? new Set() : new Set(keys)); };
  const selectedRows = sorted.filter((r) => selected.has(rowKey(r)));

  // ---- Expansion --------------------------------------------------------------------
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // ---- Resize -------------------------------------------------------------------------
  const startResize = (col: Column<T>, e: PointerEvent<HTMLSpanElement>) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = widths[col.key] ?? col.width;
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    el.classList.add("is-resizing");
    const move = (ev: globalThis.PointerEvent) => setWidths((w) => ({ ...w, [col.key]: Math.max(col.minWidth ?? 56, startW + ev.clientX - startX) }));
    const up = () => { el.classList.remove("is-resizing"); el.removeEventListener("pointermove", move); };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up, { once: true });
  };
  const keyResize = (col: Column<T>, e: KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    setWidths((w) => ({ ...w, [col.key]: Math.max(col.minWidth ?? 56, (w[col.key] ?? col.width) + (e.key === "ArrowRight" ? 16 : -16)) }));
  };

  // ---- Inline edit ----------------------------------------------------------------------
  const [editing, setEditing] = useState<{ row: string; col: string; value: string } | null>(null);
  const [cellError, setCellError] = useState<{ row: string; col: string; message: string } | null>(null);
  const commit = async (row: T, col: Column<T>, value: string) => {
    setEditing(null);
    const err = col.edit?.validate?.(value) ?? null;
    if (err) { setCellError({ row: rowKey(row), col: col.key, message: err }); return; }
    try {
      await col.edit?.onCommit(row, value);
      setCellError(null);
    } catch (e) {
      setCellError({ row: rowKey(row), col: col.key, message: e instanceof Error ? e.message : "Couldn’t save" });
    }
  };

  const sortState = (key: string) => sort.find((s) => s.key === key);
  const colSpan = visible.length + (selectable ? 1 : 0) + (renderDetail ? 1 : 0) + (rowActions ? 1 : 0);

  const columnMenu = columns.filter((c) => c.hideable !== false).map((c) => ({
    type: "checkbox" as const,
    label: c.header,
    checked: !hidden.includes(c.key),
    onSelect: () => setHidden((h) => (h.includes(c.key) ? h.filter((x) => x !== c.key) : [...h, c.key])),
  }));

  const stickyLeft = selectable ? 40 : 0;

  return (
    <section className={cx("k-grid", fill && "k-grid--fill", refreshing && "is-refreshing")} aria-label={label}>
      {nSel > 0 && bulkActions.length > 0 ? (
        <div className="k-grid__bulkbar">
          <span className="k-grid__selection" aria-live="polite">{allMatching && totalCount ? `All ${totalCount.toLocaleString("en-IN")}` : nSel} selected</span>
          {totalCount && nSel === keys.length && !allMatching && totalCount > keys.length && (
            <button type="button" className="k-btn k-btn--link k-btn--sm" onClick={() => setAllMatching(true)}>Select all {totalCount.toLocaleString("en-IN")} matching</button>
          )}
          <div className="k-grid__divider" aria-hidden="true" />
          {bulkActions.map((a) => (
            <button key={a.label} type="button" className={cx("k-btn k-btn--sm", a.danger && "k-btn--danger-outline")} onClick={() => a.onAction(selectedRows)}>
              {a.icon && <Icon name={a.icon} size="sm" />}{a.label}
            </button>
          ))}
          <span className="k-grid__spacer" />
          <button type="button" className="k-btn k-btn--subtle k-btn--sm" onClick={() => setSelected(new Set())}>Clear selection</button>
        </div>
      ) : (
        <div className="k-grid__toolbar">
          {toolbar}
          <span className="k-grid__spacer" />
          <Dropdown
            label="Show columns"
            align="end"
            items={[{ type: "label", label: "Show columns" }, ...columnMenu]}
            trigger={(p) => <button type="button" className="k-btn k-btn--subtle" {...p}><Icon name="columns" /><span className="u-hide-md">Columns</span></button>}
          />
        </div>
      )}

      <div className="k-grid__scroll" tabIndex={0} role="region" aria-label={`${label}, scrollable`}>
        {refreshing && <div className="k-grid__progress" role="progressbar" aria-label="Refreshing" />}
        <table className={cx("k-table", stackOnMobile && "k-table--stack")} aria-busy={loading || refreshing || undefined}>
          <colgroup>
            {renderDetail && <col style={{ width: 36 }} />}
            {selectable && <col style={{ width: 40 }} />}
            {visible.map((c) => <col key={c.key} style={{ width: widths[c.key] ?? c.width }} />)}
            {rowActions && <col style={{ width: 48 }} />}
          </colgroup>
          <thead>
            <tr>
              {renderDetail && <th className="k-table__expand" scope="col"><span className="k-sr-only">Expand</span></th>}
              {selectable && (
                <th className={cx("k-table__select", stickyFirstColumn && "is-sticky-start")} style={stickyFirstColumn ? { left: 0 } : undefined} scope="col">
                  <Checkbox aria-label="Select all rows on this page" checked={nSel > 0 && nSel === keys.length} indeterminate={nSel > 0 && nSel < keys.length} onChange={toggleAll} />
                </th>
              )}
              {visible.map((c, i) => {
                const s = sortState(c.key);
                const sticky = stickyFirstColumn && i === 0;
                return (
                  <th
                    key={c.key}
                    scope="col"
                    className={cx(c.align === "end" && "is-num", c.align === "center" && "is-center", sticky && "is-sticky-start")}
                    style={sticky ? { left: stickyLeft } : undefined}
                    aria-sort={c.sortable ? (s ? (s.dir === "asc" ? "ascending" : "descending") : "none") : undefined}
                  >
                    {c.sortable ? (
                      <button type="button" className="k-th" onClick={(e) => toggleSort(c.key, e.shiftKey)} title="Click to sort · Shift-click to add">
                        <span>{c.header}</span>
                        <Icon name="arrow-up" size="xs" className="k-th__sort" />
                        {s && sort.length > 1 && <span className="k-th__priority">{sort.indexOf(s) + 1}</span>}
                      </button>
                    ) : (
                      c.header
                    )}
                    <span
                      className="k-table__resizer"
                      role="separator"
                      aria-orientation="vertical"
                      aria-label={`Resize ${c.header} column`}
                      tabIndex={0}
                      onPointerDown={(e) => startResize(c, e)}
                      onKeyDown={(e) => keyResize(c, e)}
                    />
                  </th>
                );
              })}
              {rowActions && <th className="k-table__actions is-sticky-end" scope="col"><span className="k-sr-only">Actions</span></th>}
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 6 }, (_, r) => (
                <tr key={`sk-${r}`} aria-hidden="true">
                  <td colSpan={colSpan}><span className="k-skeleton" style={{ width: `${60 + ((r * 17) % 35)}%` }} /></td>
                </tr>
              ))}
            {!loading && error && (
              <tr><td colSpan={colSpan} style={{ height: "auto", whiteSpace: "normal" }}>{error}</td></tr>
            )}
            {!loading && !error && sorted.length === 0 && (
              <tr><td colSpan={colSpan} style={{ height: "auto", whiteSpace: "normal" }}>{empty ?? <EmptyState compact icon="search" title="No records" />}</td></tr>
            )}
            {!loading && !error && sorted.map((row, index) => {
              const k = rowKey(row);
              const isSel = selected.has(k);
              const isOpen = expanded.has(k);
              return (
                <Fragment key={k}>
                  <tr className={cx(isSel && "is-selected", rowAttention?.(row) && "is-attention")}>
                    {renderDetail && (
                      <td className="k-table__expand">
                        <button
                          type="button"
                          className="k-expand-btn"
                          aria-expanded={isOpen}
                          aria-label={isOpen ? "Hide details" : "Show details"}
                          onClick={() => setExpanded((cur) => { const n = new Set(cur); if (n.has(k)) n.delete(k); else n.add(k); return n; })}
                        >
                          <Icon name="chevron-right" size="sm" />
                        </button>
                      </td>
                    )}
                    {selectable && (
                      <td className={cx("k-table__select", stickyFirstColumn && "is-sticky-start")} style={stickyFirstColumn ? { left: 0 } : undefined}>
                        <Checkbox aria-label="Select row" checked={isSel} onChange={() => undefined} onClick={(e) => toggleRow(index, e)} />
                      </td>
                    )}
                    {visible.map((c, i) => {
                      const isEditing = editing?.row === k && editing.col === c.key;
                      const err = cellError?.row === k && cellError.col === c.key ? cellError.message : null;
                      const sticky = stickyFirstColumn && i === 0;
                      return (
                        <td
                          key={c.key}
                          data-label={i === 0 ? undefined : c.header}
                          className={cx(
                            i === 0 && "k-table__primary",
                            c.align === "end" && "is-num",
                            c.align === "center" && "is-center",
                            c.mono && "is-id",
                            c.secondary && "is-secondary",
                            c.edit && "is-editable",
                            isEditing && "is-editing",
                            err && "has-error",
                            sticky && "is-sticky-start",
                          )}
                          style={sticky ? { left: stickyLeft } : undefined}
                          title={err ?? undefined}
                          tabIndex={c.edit ? 0 : undefined}
                          onDoubleClick={() => c.edit && setEditing({ row: k, col: c.key, value: c.edit.getValue(row) })}
                          onKeyDown={(e) => {
                            if (c.edit && !isEditing && (e.key === "Enter" || e.key === "F2")) {
                              e.preventDefault();
                              setEditing({ row: k, col: c.key, value: c.edit.getValue(row) });
                            }
                          }}
                        >
                          {isEditing && c.edit ? (
                            <CellEditor
                              kind={c.edit.kind}
                              options={c.edit.options}
                              label={c.label ?? c.header}
                              initial={editing.value}
                              numeric={c.align === "end"}
                              onCommit={(v) => commit(row, c, v)}
                              onCancel={() => setEditing(null)}
                            />
                          ) : c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? "")}
                        </td>
                      );
                    })}
                    {rowActions && (
                      <td className="k-table__actions is-sticky-end">
                        <Dropdown
                          align="end"
                          items={rowActions(row).map((a) => ({ label: a.label, danger: a.danger, onSelect: a.onSelect }))}
                          trigger={(p) => <button type="button" className="k-row-action" aria-label="Row actions" {...p}><Icon name="more" /></button>}
                        />
                      </td>
                    )}
                  </tr>
                  {renderDetail && isOpen && (
                    <tr className="k-table__detail"><td colSpan={colSpan}>{renderDetail(row)}</td></tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {footer && <div className="k-grid__footer">{footer}</div>}
    </section>
  );
}

interface CellEditorProps {
  kind: "text" | "number" | "select";
  options?: string[];
  label: string;
  initial: string;
  numeric: boolean;
  onCommit: (value: string) => void;
  onCancel: () => void;
}

function CellEditor({ kind, options = [], label, initial, numeric, onCommit, onCancel }: CellEditorProps) {
  const [value, setValue] = useState(initial);
  const done = useRef(false);
  const finish = (save: boolean) => {
    if (done.current) return;
    done.current = true;
    if (save && value !== initial) onCommit(value);
    else onCancel();
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); finish(true); }
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); finish(false); }
  };
  if (kind === "select") {
    return (
      <select className="k-select k-select--sm" aria-label={label} autoFocus value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={onKeyDown} onBlur={() => finish(true)}>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    );
  }
  return (
    <input
      className={cx("k-input k-input--sm", numeric && "k-input--num")}
      aria-label={label}
      autoFocus
      inputMode={kind === "number" ? "decimal" : undefined}
      value={value}
      onFocus={(e) => e.currentTarget.select()}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={onKeyDown}
      onBlur={() => finish(true)}
    />
  );
}
