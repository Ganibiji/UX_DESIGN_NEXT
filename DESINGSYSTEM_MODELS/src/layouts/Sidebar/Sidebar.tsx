import { useState, type MouseEvent } from "react";
import { Icon, readPrefs, writePrefs } from "@ui/index";

export interface NavLink {
  id: string;
  label: string;
  href: string;
  count?: number;
}

export interface NavModule {
  id: string;
  label: string;
  icon: string;
  items: NavLink[];
}

export interface WorkItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  /** Items waiting on *this user* — shown as an attention badge. */
  attention?: number;
  count?: number;
}

export interface SidebarProps {
  work: WorkItem[];
  modules: NavModule[];
  utility: WorkItem[];
  /** "crm.accounts" — module id + screen id. */
  current: string;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onNavigate: (href: string) => void;
}

/**
 * Three levels of weight: work queue (counts) → modules (icon, semibold,
 * collapsible) → screens (indented, no icon). Utility links sit at the bottom.
 */
export function Sidebar({ work, modules, utility, current, collapsed, onToggleCollapsed, onNavigate }: SidebarProps) {
  const [mod, screen] = current.split(".");
  const [open, setOpen] = useState<Record<string, boolean>>(() => readPrefs().navOpen ?? { [mod]: true });

  const toggle = (id: string) => {
    if (collapsed) onToggleCollapsed();
    setOpen((o) => {
      const next = { ...o, [id]: collapsed ? true : !o[id] };
      writePrefs({ navOpen: next });
      return next;
    });
  };

  const link = (href: string) => (e: MouseEvent) => { e.preventDefault(); onNavigate(href); };

  const workLink = (w: WorkItem) => (
    <li key={w.id}>
      <a className="k-nav__item" href={w.href} aria-current={w.id === mod ? "page" : undefined} title={w.label} onClick={link(w.href)}>
        <Icon name={w.icon} />
        <span className="k-nav__text">{w.label}</span>
        {w.attention ? <span className="k-badge k-badge--attention" aria-label={`${w.attention} waiting`}>{w.attention}</span> : w.count ? <span className="k-nav__count">{w.count}</span> : null}
      </a>
    </li>
  );

  return (
    <nav className="k-sidebar" id="sidebar" aria-label="Main navigation">
      <div className="k-sidebar__scroll">
        <div className="k-sidebar__section"><ul className="k-nav">{work.map(workLink)}</ul></div>
        <div className="k-sidebar__section">
          <span className="k-sidebar__label" id="nav-modules">Modules</span>
          <ul className="k-nav" aria-labelledby="nav-modules">
            {modules.map((m) => {
              const expanded = open[m.id] ?? m.id === mod;
              return (
                <li key={m.id}>
                  <button type="button" className={`k-nav__group-btn${m.id === mod ? " has-current" : ""}`} aria-expanded={expanded} title={m.label} onClick={() => toggle(m.id)}>
                    <Icon name={m.icon} />
                    <span className="k-nav__text">{m.label}</span>
                    <Icon name="chevron-right" size="sm" className="k-nav__chevron" />
                  </button>
                  <ul className="k-nav__sub">
                    {m.items.map((i) => (
                      <li key={i.id}>
                        <a className="k-nav__subitem" href={i.href} aria-current={m.id === mod && i.id === screen ? "page" : undefined} onClick={link(i.href)}>
                          <span className="k-nav__text">{i.label}</span>
                          {i.count ? <span className="k-nav__count">{i.count}</span> : null}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div className="k-sidebar__footer">
        <ul className="k-nav k-nav--utility">
          {utility.map(workLink)}
          <li>
            <button type="button" className="k-nav__item k-sidebar__collapse" aria-label={collapsed ? "Expand navigation" : "Collapse navigation"} onClick={onToggleCollapsed}>
              <Icon name="sidebar" />
              <span className="k-nav__text">Collapse</span>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
