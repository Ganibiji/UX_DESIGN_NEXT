import { useId, useState, type ReactNode } from "react";
import { Avatar, Status, TabPanel, Tabs, type StatusTone, type TabItem } from "@ui/index";
import { Breadcrumb, type Crumb } from "@layouts/index";

export interface KeyFact {
  label: string;
  value: ReactNode;
  /** The one figure people look for first (order value, outstanding). */
  hero?: boolean;
}

export interface DetailPageProps {
  breadcrumb: Crumb[];
  /** "Sales order · Revision 2" */
  recordType: string;
  title: ReactNode;
  statuses?: Array<{ label: string; tone?: StatusTone }>;
  subtitle?: ReactNode;
  avatar?: { name: string; org?: boolean };
  actions: ReactNode;
  facts: KeyFact[];
  tabs: TabItem[];
  initialTab?: string;
  /** Renders the active tab’s content. */
  children: (tab: string) => ReactNode;
  /** Mobile thumb-zone actions (replaces header actions under 600px). */
  mobileActions?: ReactNode;
}

/**
 * Record detail: sticky header (identity, status, key facts, actions, tabs)
 * over a main + side body. Status and next action are never scrolled away.
 */
export function DetailPage({ breadcrumb, recordType, title, statuses = [], subtitle, avatar, actions, facts, tabs, initialTab, children, mobileActions }: DetailPageProps) {
  const [tab, setTab] = useState(initialTab ?? tabs[0]?.id);
  const idPrefix = useId();
  return (
    <div className="k-page k-page--flush">
      <header className="k-record-header">
        <div className="k-record-header__inner">
          <Breadcrumb items={breadcrumb} />
          <div className="k-record-header__row">
            <div className="k-record-header__identity">
              {avatar && <Avatar name={avatar.name} org={avatar.org} size="lg" />}
              <div className="u-min-w-0">
                <div className="k-record-header__type">{recordType}</div>
                <h1 className="k-record-header__title">
                  {title}
                  {statuses.map((s) => <Status key={s.label} tone={s.tone} strong>{s.label}</Status>)}
                </h1>
                {subtitle && <div className="k-record-header__sub">{subtitle}</div>}
              </div>
            </div>
            <div className="k-record-header__actions">{actions}</div>
          </div>
          <dl className="k-facts">
            {facts.map((f) => <div key={f.label} className={f.hero ? "k-facts__hero" : undefined}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}
          </dl>
          <Tabs tabs={tabs} value={tab} onChange={setTab} label={`${recordType} sections`} idPrefix={idPrefix} />
        </div>
      </header>
      <TabPanel idPrefix={idPrefix} value={tab}>{children(tab)}</TabPanel>
      {mobileActions && <div className="k-actionbar">{mobileActions}</div>}
    </div>
  );
}

export function DetailBody({ main, side }: { main: ReactNode; side?: ReactNode }) {
  return (
    <div className={side ? "k-detail-body" : "k-detail-body k-detail-body--single"}>
      <div className="k-detail-body__main">{main}</div>
      {side && <aside className="k-detail-body__side">{side}</aside>}
    </div>
  );
}

export interface PanelProps {
  title: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  flush?: boolean;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Page region. Flat, bordered — not a floating card. */
export function Panel({ title, meta, actions, flush, footer, children, className }: PanelProps) {
  return (
    <section className={`k-panel${className ? ` ${className}` : ""}`}>
      <div className="k-panel__header">
        <h2 className="k-panel__title">{title}{meta && <small>{meta}</small>}</h2>
        {actions}
      </div>
      {flush ? children : <div className="k-panel__body">{children}</div>}
      {footer && <div className="k-panel__footer">{footer}</div>}
    </section>
  );
}

export interface TimelineEvent {
  id: string;
  icon: string;
  tone?: "success" | "warning" | "danger" | "primary";
  title: ReactNode;
  time: string;
  body?: ReactNode;
  quote?: string;
}

export function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="k-timeline">
      {events.map((e) => (
        <li key={e.id} className="k-timeline__item">
          <span className="k-timeline__marker" data-tone={e.tone}><svg className="k-icon" aria-hidden="true"><use href={`#i-${e.icon}`} /></svg></span>
          <div className="k-timeline__content">
            <div className="k-timeline__head"><span>{e.title}</span><span className="k-timeline__time">{e.time}</span></div>
            {e.body && <div className="k-timeline__body">{e.body}</div>}
            {e.quote && <div className="k-timeline__quote">{e.quote}</div>}
          </div>
        </li>
      ))}
    </ol>
  );
}

export interface AuditEntry {
  id: string;
  when: string;
  who: string;
  field: string;
  from?: string;
  to: string;
  source?: string;
}

/** Field-level change history. Old value struck, new value plain. */
export function AuditLog({ entries }: { entries: AuditEntry[] }) {
  return (
    <table className="k-audit">
      <thead><tr><th>When</th><th>Who</th><th>Field</th><th>Change</th><th>Source</th></tr></thead>
      <tbody>
        {entries.map((e) => (
          <tr key={e.id}>
            <td>{e.when}</td>
            <td>{e.who}</td>
            <td className="k-audit__field">{e.field}</td>
            <td>{e.from !== undefined && <><span className="k-audit__old">{e.from}</span><span className="k-audit__arrow">→</span></>}<span className="k-audit__new">{e.to}</span></td>
            <td className="k-audit__source">{e.source}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
