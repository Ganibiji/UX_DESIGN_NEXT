import { useEffect, useRef, useState, type ReactNode } from "react";
import { Modal, readPrefs, useDisplayPrefs, writePrefs, type MenuItem } from "@ui/index";
import { Header } from "../Header/Header";
import { Sidebar, type NavModule, type WorkItem } from "../Sidebar/Sidebar";

export interface AppShellProps {
  nav: { work: WorkItem[]; modules: NavModule[]; utility: WorkItem[] };
  current: string;
  onNavigate: (href: string) => void;
  createItems: MenuItem[];
  /** Page-level banners (offline, period closing). */
  banners?: ReactNode;
  children: ReactNode;
}

const SHORTCUTS: Array<[string, string]> = [
  ["/", "Search everything"], ["Ctrl K", "Search everything"], ["?", "Keyboard shortcuts"],
  ["Alt N", "New record on list pages"], ["Ctrl S", "Save form"], ["Esc", "Close menu, dialog or drawer"],
];

/**
 * Header + sidebar + main. Main is the only scroll container, so toolbars,
 * table headers and form footers stick inside it.
 */
export function AppShell({ nav, current, onNavigate, createItems, banners, children }: AppShellProps) {
  const { theme, setTheme, density, setDensity } = useDisplayPrefs();
  const [collapsed, setCollapsed] = useState(() => readPrefs().sidebar === "collapsed");
  const [navOpen, setNavOpen] = useState(false);
  const [shortcuts, setShortcuts] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      const typing = el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); searchRef.current?.focus(); return; }
      if (typing) return;
      if (e.key === "/") { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === "?") { e.preventDefault(); setShortcuts(true); }
      if (e.key === "Escape") setNavOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const toggleCollapsed = () => setCollapsed((c) => { writePrefs({ sidebar: c ? "expanded" : "collapsed" }); return !c; });

  return (
    <div className={`k-app${navOpen ? " is-nav-open" : ""}`} data-sidebar={collapsed ? "collapsed" : undefined}>
      <a className="k-skip-link" href="#main">Skip to content</a>
      <Header
        ref={searchRef}
        productName="Kestrel"
        appName="Business Suite"
        organization={{ name: "Sahyadri Industrial Supplies", unit: "Pune HQ" }}
        organizations={[{ name: "Sahyadri Industrial Supplies", unit: "Pune HQ" }, { name: "Sahyadri Industrial Supplies", unit: "Chennai Plant" }]}
        environment="UAT"
        user={{ name: "Priya Deshmukh", role: "Sales Manager · West", initials: "PD" }}
        unreadNotifications={3}
        createItems={createItems}
        theme={theme}
        density={density}
        onThemeChange={setTheme}
        onDensityChange={setDensity}
        navOpen={navOpen}
        onToggleNav={() => setNavOpen((o) => !o)}
        onSearch={() => undefined}
        onShowShortcuts={() => setShortcuts(true)}
      />
      <Sidebar
        {...nav}
        current={current}
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
        onNavigate={(href) => { setNavOpen(false); onNavigate(href); }}
      />
      <div className="k-app__scrim" onClick={() => setNavOpen(false)} />
      <div className="k-app__banners" aria-live="polite">{banners}</div>
      <main className="k-main" id="main" tabIndex={-1}>{children}</main>
      <Modal open={shortcuts} onClose={() => setShortcuts(false)} title="Keyboard shortcuts">
        <table className="k-audit"><tbody>
          {SHORTCUTS.map(([k, l]) => <tr key={l}><td style={{ width: 120 }}>{k.split(" ").map((x) => <kbd key={x} style={{ marginRight: 4 }}>{x}</kbd>)}</td><td>{l}</td></tr>)}
        </tbody></table>
      </Modal>
    </div>
  );
}
