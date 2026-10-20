import type { ReactNode } from "react";
import { cx, Icon } from "@ui/index";

export type Trend = "up-good" | "up-bad" | "down-good" | "down-bad" | "flat";

export interface KpiProps {
  label: string;
  value: ReactNode;
  unit?: string;
  /** Always name the baseline: "vs Q2 (31%)". */
  comparison?: { delta: string; trend: Trend; baseline: string };
  meta?: ReactNode;
  /** 0–100, e.g. target attainment. */
  progress?: { value: number; label: string };
  href?: string;
}

/**
 * KPI tile. Delta colour follows meaning, not direction: receivables going
 * down is good. One row of 3–5 KPIs per dashboard, never a wall of cards.
 */
export function Kpi({ label, value, unit, comparison, meta, progress, href }: KpiProps) {
  const Tag = href ? "a" : "div";
  return (
    <Tag className="k-kpi" href={href}>
      <span className="k-kpi__label">{label}</span>
      <span className="k-kpi__value">{value}{unit && <small> {unit}</small>}</span>
      {comparison && (
        <span className="k-kpi__meta">
          <span className="k-kpi__delta" data-trend={comparison.trend}>
            {comparison.trend !== "flat" && <Icon name={comparison.trend.startsWith("up") ? "trend-up" : "trend-down"} size="xs" />}
            {comparison.delta}
          </span>
          {comparison.baseline}
        </span>
      )}
      {meta && <span className="k-kpi__meta">{meta}</span>}
      {progress && (
        <div className="k-kpi__bar">
          <div className="k-meter">
            <div className="k-progress" role="progressbar" aria-label={label} aria-valuenow={progress.value} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${progress.value}%` }} /></div>
            <span>{progress.label}</span>
          </div>
        </div>
      )}
    </Tag>
  );
}

export function KpiRow({ children, label = "Key figures" }: { children: ReactNode; label?: string }) {
  return <section className="k-kpis" aria-label={label}>{children}</section>;
}

/** 12-column dashboard grid. Children take className="k-col-N". */
export function DashboardGrid({ children }: { children: ReactNode }) {
  return <div className="k-dash">{children}</div>;
}

export interface BarListItem {
  label: string;
  value: number;
  /** Optional inner portion (e.g. weighted pipeline), drawn darker. */
  part?: number;
  display: string;
  sub?: string;
}

/** Horizontal bars — usually clearer than a funnel or donut for stage totals. */
export function BarList({ items, label }: { items: BarListItem[]; label: string }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="k-barlist" aria-label={label}>
      {items.map((i) => (
        <li key={i.label}>
          <span className="k-barlist__label">{i.label}</span>
          <span className="k-barlist__track">
            <span className={cx("k-barlist__fill", i.part !== undefined && "k-barlist__fill--muted")} style={{ width: `${(i.value / max) * 100}%` }} />
            {i.part !== undefined && <span className="k-barlist__fill" style={{ width: `${(i.part / max) * 100}%` }} />}
          </span>
          <span className="k-barlist__value">{i.display}{i.sub && <small>{i.sub}</small>}</span>
        </li>
      ))}
    </ul>
  );
}

export interface DashboardFiltersProps {
  periods: string[];
  period: string;
  onPeriodChange: (p: string) => void;
  updatedLabel: string;
  children?: ReactNode;
}

/** One filter row controls the whole dashboard. */
export function DashboardFilters({ periods, period, onPeriodChange, updatedLabel, children }: DashboardFiltersProps) {
  return (
    <div className="k-dash-filters" role="group" aria-label="Dashboard filters">
      <div className="k-btn-group" role="group" aria-label="Period">
        {periods.map((p) => <button key={p} type="button" className="k-btn k-btn--sm" aria-pressed={p === period} onClick={() => onPeriodChange(p)}>{p}</button>)}
      </div>
      {children}
      <span className="k-dash-filters__updated">{updatedLabel}</span>
    </div>
  );
}
