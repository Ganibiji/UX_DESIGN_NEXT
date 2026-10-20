import { useEffect, useState, type ReactNode } from "react";
import { Button, Dropdown, Icon, Tag, type MenuItem } from "@ui/index";
import { PageLayout, type Crumb } from "@layouts/index";

export interface SavedView {
  id: string;
  label: string;
  group: "mine" | "shared";
  isDefault?: boolean;
}

export interface AppliedFilter {
  key: string;
  label: string;
  value: string;
}

export interface CrudPageProps {
  title: string;
  description: string;
  breadcrumb: Crumb[];
  /** Singular noun, used in "New account", "Search accounts". */
  noun: string;
  onCreate: () => void;
  secondaryActions?: ReactNode;
  views: SavedView[];
  activeView: string;
  /** True when filters/columns differ from the saved view. */
  viewModified?: boolean;
  onViewChange: (id: string) => void;
  onSaveView?: () => void;
  search: string;
  onSearchChange: (q: string) => void;
  searchHint: string;
  filters: AppliedFilter[];
  onRemoveFilter: (key: string) => void;
  onClearFilters: () => void;
  onOpenFilters: () => void;
  /** The DataGrid. Its own toolbar is used for the pieces below. */
  children: (toolbar: ReactNode) => ReactNode;
}

/**
 * List screen: page header → saved view · search · filters · grid · pagination.
 * Alt+N opens Create. Filters are always visible as removable tags.
 */
export function CrudPage(p: CrudPageProps) {
  const [q, setQ] = useState(p.search);
  useEffect(() => {
    const t = window.setTimeout(() => p.onSearchChange(q), 250);
    return () => window.clearTimeout(t);
  }, [q]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.altKey && e.key.toLowerCase() === "n") { e.preventDefault(); p.onCreate(); } };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [p.onCreate]); // eslint-disable-line react-hooks/exhaustive-deps

  const current = p.views.find((v) => v.id === p.activeView);
  const viewItems: MenuItem[] = [
    { type: "label", label: "My views" },
    ...p.views.filter((v) => v.group === "mine").map((v) => ({ type: "radio" as const, label: v.label, checked: v.id === p.activeView, onSelect: () => p.onViewChange(v.id) })),
    { type: "label", label: "Shared with team" },
    ...p.views.filter((v) => v.group === "shared").map((v) => ({ type: "radio" as const, label: v.label, checked: v.id === p.activeView, onSelect: () => p.onViewChange(v.id) })),
    { type: "separator" },
    { label: "Save changes to this view", disabled: !p.viewModified, onSelect: () => p.onSaveView?.() },
    { label: "Save as new view…", onSelect: () => undefined },
  ];

  const toolbar = (
    <>
      <div className="k-view-select">
        <Dropdown
          label="Saved views"
          minWidth={260}
          items={viewItems}
          trigger={(t) => <button type="button" className="k-btn k-btn--subtle" {...t}><span>{current?.label}</span><Icon name="chevron-down" size="sm" /></button>}
        />
        {p.viewModified && <span className="k-view-select__modified">Modified</span>}
      </div>
      <div className="k-grid__divider u-hide-sm" aria-hidden="true" />
      <div className="k-search">
        <Icon name="search" />
        <input className="k-input" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={p.searchHint} aria-label={`Search ${p.noun}s`} />
      </div>
      <Button icon="filter" count={p.filters.length || undefined} onClick={p.onOpenFilters} aria-label={`Filters, ${p.filters.length} applied`}>Filters</Button>
    </>
  );

  return (
    <PageLayout
      variant="fill"
      breadcrumb={p.breadcrumb}
      title={p.title}
      description={p.description}
      actions={<>{p.secondaryActions}<Button variant="primary" icon="plus" onClick={p.onCreate} title="Alt + N">New {p.noun}</Button></>}
    >
      {p.filters.length > 0 && (
        <div className="k-filterbar" aria-label="Applied filters" style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)" }}>
          <span className="k-filterbar__label">Filtered by</span>
          {p.filters.map((f) => <Tag key={f.key} label={f.label} value={f.value} onRemove={() => p.onRemoveFilter(f.key)} />)}
          <button type="button" className="k-btn k-btn--link k-btn--sm" onClick={p.onClearFilters}>Clear all</button>
        </div>
      )}
      {p.children(toolbar)}
    </PageLayout>
  );
}

export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  noun: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function Pagination({ page, pageSize, total, noun, onPageChange, onPageSizeChange }: PaginationProps) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total ? (page - 1) * pageSize + 1 : 0;
  const to = Math.min(total, page * pageSize);
  const window = [1, page - 1, page, page + 1, pages].filter((n, i, a) => n >= 1 && n <= pages && a.indexOf(n) === i).sort((a, b) => a - b);
  return (
    <nav className="k-pagination u-w-full" aria-label="Pagination">
      <span className="k-pagination__range"><strong>{from.toLocaleString("en-IN")}–{to.toLocaleString("en-IN")}</strong> of <strong>{total.toLocaleString("en-IN")}</strong> {noun}s</span>
      <label className="k-pagination__size">Rows per page
        <select className="k-select k-select--sm" value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}>
          {[25, 50, 100].map((n) => <option key={n}>{n}</option>)}
        </select>
      </label>
      <span className="k-pagination__pages">
        <button type="button" className="k-pagination__page k-pagination__step" disabled={page === 1} aria-label="Previous page" onClick={() => onPageChange(page - 1)}><Icon name="chevron-left" size="sm" /></button>
        {window.map((n, i) => (
          <span key={n} style={{ display: "contents" }}>
            {i > 0 && n - window[i - 1] > 1 && <span className="k-pagination__gap">…</span>}
            <button type="button" className="k-pagination__page" aria-current={n === page ? "page" : undefined} onClick={() => onPageChange(n)}>{n}</button>
          </span>
        ))}
        <button type="button" className="k-pagination__page k-pagination__step" disabled={page === pages} aria-label="Next page" onClick={() => onPageChange(page + 1)}><Icon name="chevron-right" size="sm" /></button>
      </span>
    </nav>
  );
}
