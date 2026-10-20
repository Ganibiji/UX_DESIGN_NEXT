import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "../utils";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  /** Marks tabs that contain fields with errors after a failed save. */
  hasError?: boolean;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  value: string;
  onChange: (id: string) => void;
  label: string;
  size?: "sm" | "md";
  /** Render function for the active panel. Only the active panel is mounted. */
  children?: (activeId: string) => ReactNode;
  /**
   * Stable prefix for tab/panel ids. Pass it (and omit children) to render the
   * panel elsewhere, e.g. below a sticky record header — see TabPanel.
   */
  idPrefix?: string;
}

/** WAI-ARIA tabs, automatic activation; ←/→ Home/End move between tabs. */
export function Tabs({ tabs, value, onChange, label, size = "md", children, idPrefix }: TabsProps) {
  const generated = useId();
  const base = idPrefix ?? generated;
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const enabled = tabs.filter((t) => !t.disabled);

  const onKeyDown = (e: KeyboardEvent) => {
    const i = enabled.findIndex((t) => t.id === value);
    const map: Record<string, number> = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: enabled.length - 1 };
    if (!(e.key in map)) return;
    e.preventDefault();
    const next = enabled[(map[e.key] + enabled.length) % enabled.length];
    onChange(next.id);
    refs.current[next.id]?.focus();
  };

  return (
    <>
      <div className={cx("k-tabs", size === "sm" && "k-tabs--sm")} role="tablist" aria-label={label} onKeyDown={onKeyDown}>
        {tabs.map((t) => (
          <button
            key={t.id}
            ref={(el) => { refs.current[t.id] = el; }}
            type="button"
            role="tab"
            id={`${base}-tab-${t.id}`}
            aria-controls={`${base}-panel-${t.id}`}
            aria-selected={t.id === value}
            aria-disabled={t.disabled || undefined}
            tabIndex={t.id === value ? 0 : -1}
            className="k-tab"
            onClick={() => !t.disabled && onChange(t.id)}
          >
            {t.label}
            {t.count != null && <span className="k-tab__count">{t.count}</span>}
            {t.hasError && <span className="k-tab__error" aria-label="contains errors" />}
          </button>
        ))}
      </div>
      {children && <TabPanel idPrefix={base} value={value}>{children(value)}</TabPanel>}
    </>
  );
}

/** The panel for the active tab, when rendered apart from the tablist. */
export function TabPanel({ idPrefix, value, children }: { idPrefix: string; value: string; children: ReactNode }) {
  return (
    <div className="k-tabpanel" role="tabpanel" id={`${idPrefix}-panel-${value}`} aria-labelledby={`${idPrefix}-tab-${value}`} tabIndex={0}>
      {children}
    </div>
  );
}
