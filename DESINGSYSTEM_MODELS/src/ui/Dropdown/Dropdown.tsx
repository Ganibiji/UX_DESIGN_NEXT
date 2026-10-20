import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "../utils";
import { Icon } from "../Icon/Icon";

export type MenuItem =
  | { type?: "item"; label: string; icon?: string; shortcut?: string; danger?: boolean; disabled?: boolean; onSelect: () => void }
  | { type: "checkbox"; label: string; checked: boolean; disabled?: boolean; onSelect: () => void }
  | { type: "radio"; label: string; checked: boolean; onSelect: () => void }
  | { type: "label"; label: string }
  | { type: "separator" };

export interface TriggerProps {
  "aria-haspopup": "menu";
  "aria-expanded": boolean;
  "aria-controls": string;
  onClick: () => void;
  onKeyDown: (e: KeyboardEvent) => void;
  ref: (el: HTMLButtonElement | null) => void;
}

export interface DropdownProps {
  items: MenuItem[];
  trigger: (props: TriggerProps) => ReactNode;
  align?: "start" | "end";
  label?: string;
  minWidth?: number;
}

/**
 * Menu button (WAI-ARIA APG). ↓/↑ move, Home/End jump, Esc closes and returns
 * focus to the trigger, Tab closes. Menus never hold form state.
 */
export function Dropdown({ items, trigger, align = "start", label, minWidth }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const focusFirst = useRef(false);

  const enabled = () => Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role^="menuitem"]:not([aria-disabled="true"])') ?? []);

  useEffect(() => {
    if (!open) return;
    if (focusFirst.current) enabled()[0]?.focus();
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node) && !triggerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const close = (returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  const onMenuKey = (e: KeyboardEvent) => {
    const list = enabled();
    const i = list.indexOf(document.activeElement as HTMLElement);
    const go = (n: number) => { e.preventDefault(); list[(n + list.length) % list.length]?.focus(); };
    if (e.key === "ArrowDown") go(i + 1);
    else if (e.key === "ArrowUp") go(i - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(list.length - 1);
    else if (e.key === "Escape") { e.preventDefault(); close(true); }
    else if (e.key === "Tab") close(false);
  };

  return (
    <div className="k-dropdown">
      {trigger({
        "aria-haspopup": "menu",
        "aria-expanded": open,
        "aria-controls": id,
        ref: (el) => { triggerRef.current = el; },
        onClick: () => { focusFirst.current = false; setOpen((o) => !o); },
        onKeyDown: (e) => {
          if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") { e.preventDefault(); focusFirst.current = true; setOpen(true); }
        },
      })}
      {open && (
        <div ref={menuRef} id={id} role="menu" aria-label={label} className={cx("k-menu", align === "end" && "k-menu--end")} style={{ minWidth }} onKeyDown={onMenuKey}>
          {items.map((item, idx) => {
            if (item.type === "separator") return <div key={idx} className="k-menu__sep" role="separator" />;
            if (item.type === "label") return <div key={idx} className="k-menu__label">{item.label}</div>;
            const role = item.type === "checkbox" ? "menuitemcheckbox" : item.type === "radio" ? "menuitemradio" : "menuitem";
            const danger = item.type === undefined || item.type === "item" ? item.danger : false;
            const disabled = "disabled" in item ? item.disabled : false;
            return (
              <button
                key={idx}
                type="button"
                role={role}
                tabIndex={-1}
                className={cx("k-menu__item", danger && "k-menu__item--danger")}
                aria-checked={"checked" in item ? item.checked : undefined}
                aria-disabled={disabled || undefined}
                onClick={() => {
                  if (disabled) return;
                  item.onSelect();
                  if (role === "menuitem") close(true);
                }}
              >
                {"icon" in item && item.icon && <Icon name={item.icon} />}
                {item.label}
                {"shortcut" in item && item.shortcut && <span className="k-menu__shortcut">{item.shortcut}</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
