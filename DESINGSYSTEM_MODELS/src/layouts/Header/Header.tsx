import { forwardRef, useState } from "react";
import { Dropdown, Icon, type Density, type MenuItem, type Theme } from "@ui/index";

export interface HeaderProps {
  productName: string;
  appName: string;
  organization: { name: string; unit: string };
  organizations: Array<{ name: string; unit: string }>;
  /** Shown for non-production environments only. */
  environment?: "UAT" | "Sandbox" | "Training";
  user: { name: string; role: string; initials: string };
  unreadNotifications: number;
  createItems: MenuItem[];
  theme: Theme;
  density: Density;
  onThemeChange: (t: Theme) => void;
  onDensityChange: (d: Density) => void;
  onToggleNav: () => void;
  navOpen: boolean;
  onSearch: (query: string) => void;
  onShowShortcuts: () => void;
}

/** Ink header: where am I (company, environment) · find anything · create · inbox · help · me. */
export const Header = forwardRef<HTMLInputElement, HeaderProps>(function Header(p, searchRef) {
  const [q, setQ] = useState("");
  const btn = "k-header__btn";

  const userMenu: MenuItem[] = [
    { type: "label", label: "Theme" },
    ...(["light", "dark", "system"] as const).map((t) => ({ type: "radio" as const, label: t === "system" ? "Match system" : t[0].toUpperCase() + t.slice(1), checked: p.theme === t, onSelect: () => p.onThemeChange(t) })),
    { type: "label", label: "Density" },
    ...(["compact", "comfortable", "spacious"] as const).map((d) => ({ type: "radio" as const, label: d[0].toUpperCase() + d.slice(1), checked: p.density === d, onSelect: () => p.onDensityChange(d) })),
    { type: "separator" },
    { label: "Keyboard shortcuts", icon: "keyboard", shortcut: "?", onSelect: p.onShowShortcuts },
    { label: "Sign out", icon: "logout", onSelect: () => undefined },
  ];

  return (
    <header className="k-header">
      <button type="button" className={`${btn} k-header__menu`} aria-label="Open navigation" aria-expanded={p.navOpen} aria-controls="sidebar" onClick={p.onToggleNav}>
        <Icon name="menu" />
      </button>
      <a className="k-header__brand" href="/" aria-label={`${p.productName} ${p.appName}, home`}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="4" fill="#3572c4" /><path d="M8 5.5v13M8 12.5 15.5 6M10.8 10.2 16 18.5" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <span className="k-header__product">{p.productName}</span>
        <span className="k-header__app">{p.appName}</span>
      </a>
      <Dropdown
        label="Switch company"
        items={[{ type: "label", label: "Company · Branch" }, ...p.organizations.map((o) => ({ type: "radio" as const, label: `${o.name} · ${o.unit}`, checked: o.unit === p.organization.unit, onSelect: () => undefined }))]}
        trigger={(t) => (
          <button type="button" className={`${btn} k-header__org`} {...t}>
            <span className="k-header__org-name">{p.organization.name}</span>
            <span className="k-header__org-unit">· {p.organization.unit}</span>
            <Icon name="chevron-down" size="sm" />
          </button>
        )}
      />
      {p.environment && <span className="k-env" data-env={p.environment.toLowerCase()}>{p.environment}</span>}
      <form className="k-header__search" role="search" onSubmit={(e) => { e.preventDefault(); p.onSearch(q); }}>
        <Icon name="search" />
        <input ref={searchRef} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search accounts, orders, invoices, people…" aria-label="Search everything" />
        <kbd aria-hidden="true">/</kbd>
      </form>
      <div className="k-header__actions">
        <Dropdown
          label="Create"
          align="end"
          minWidth={240}
          items={p.createItems}
          trigger={(t) => <button type="button" className={`${btn} k-header__create`} {...t}><Icon name="plus" /><span className="k-header__create-label">Create</span></button>}
        />
        <button type="button" className={btn} aria-label={`Notifications, ${p.unreadNotifications} unread`}>
          <Icon name="bell" />
          {p.unreadNotifications > 0 && <span className="k-badge k-badge--attention" aria-hidden="true">{p.unreadNotifications}</span>}
        </button>
        <button type="button" className={btn} aria-label="Keyboard shortcuts and help" onClick={p.onShowShortcuts}><Icon name="help" /></button>
        <Dropdown
          label="Account"
          align="end"
          minWidth={240}
          items={userMenu}
          trigger={(t) => (
            <button type="button" className={`${btn} k-header__user`} aria-label={`Account and display settings for ${p.user.name}`} {...t}>
              <span className="k-avatar" data-tint="1">{p.user.initials}</span>
              <span className="k-header__user-name">{p.user.name}</span>
            </button>
          )}
        />
      </div>
    </header>
  );
});
