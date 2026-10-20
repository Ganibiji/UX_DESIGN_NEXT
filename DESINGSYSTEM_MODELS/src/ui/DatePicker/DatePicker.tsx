import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { cx, formatDate } from "../utils";
import { useField } from "../Form/Field";
import { Icon } from "../Icon/Icon";

export interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  min?: Date;
  max?: Date;
  /** Company holidays / non-working days, shown muted (still selectable). */
  isHoliday?: (d: Date) => boolean;
  placeholder?: string;
}

const DOW = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const SHORT = MONTHS.map((m) => m.slice(0, 3).toLowerCase());

const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** Accepts "12 Oct 2026", "12/10/2026", "12-10-26". Day-first, never month-first. */
export function parseDate(text: string): Date | null {
  const t = text.trim().toLowerCase();
  let m = t.match(/^(\d{1,2})\s+([a-z]{3})[a-z]*\s+(\d{4})$/);
  if (m) {
    const mi = SHORT.indexOf(m[2]);
    if (mi >= 0) return new Date(+m[3], mi, +m[1]);
  }
  m = t.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})$/);
  if (m) {
    const y = m[3].length === 2 ? 2000 + +m[3] : +m[3];
    const d = new Date(y, +m[2] - 1, +m[1]);
    if (d.getMonth() === +m[2] - 1) return d;
  }
  return null;
}

/**
 * Typing is always allowed; the calendar assists. Grid keyboard: arrows move a
 * day/week, PageUp/PageDown change month, Enter selects, Esc closes.
 */
export function DatePicker({ value, onChange, min, max, isHoliday, placeholder = "DD MMM YYYY" }: DatePickerProps) {
  const field = useField();
  const gridId = useId();
  const [text, setText] = useState(value ? formatDate(value) : "");
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState<Date>(value ?? new Date());
  const [invalid, setInvalid] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const today = new Date();

  useEffect(() => { setText(value ? formatDate(value) : ""); }, [value]);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (!wrapRef.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const disabled = (d: Date) => Boolean((min && d < min) || (max && d > max));
  const select = (d: Date) => { if (disabled(d)) return; onChange(d); setInvalid(false); setOpen(false); };

  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const lead = (first.getDay() + 6) % 7;
  const days = Array.from({ length: 42 }, (_, i) => new Date(cursor.getFullYear(), cursor.getMonth(), i - lead + 1));

  const onGridKey = (e: KeyboardEvent) => {
    const step: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (e.key in step) { e.preventDefault(); setCursor((c) => new Date(c.getFullYear(), c.getMonth(), c.getDate() + step[e.key])); }
    else if (e.key === "PageUp" || e.key === "PageDown") { e.preventDefault(); setCursor((c) => new Date(c.getFullYear(), c.getMonth() + (e.key === "PageDown" ? 1 : -1), c.getDate())); }
    else if (e.key === "Enter") { e.preventDefault(); select(cursor); }
    else if (e.key === "Escape") setOpen(false);
  };

  useEffect(() => {
    if (open) wrapRef.current?.querySelector<HTMLButtonElement>(`[data-day="${cursor.toDateString()}"]`)?.focus();
  }, [cursor, open]);

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <div className="k-input-group">
        <input
          id={field?.id}
          className="k-input"
          aria-describedby={field?.describedBy}
          aria-invalid={invalid || field?.invalid || undefined}
          placeholder={placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => {
            if (!text.trim()) { onChange(null); setInvalid(false); return; }
            const d = parseDate(text);
            if (d && !disabled(d)) { onChange(d); setText(formatDate(d)); setInvalid(false); } else setInvalid(true);
          }}
        />
        <button type="button" className="k-btn k-btn--subtle k-btn--icon k-btn--sm k-input-group__action" aria-label="Choose date" aria-expanded={open} aria-controls={gridId} onClick={() => { setCursor(value ?? new Date()); setOpen((o) => !o); }}>
          <Icon name="calendar" />
        </button>
      </div>
      {open && (
        <div className="k-datepicker" role="dialog" aria-label="Choose date" style={{ position: "absolute", top: "calc(100% + 4px)", left: 0 }}>
          <div className="k-datepicker__cal">
            <div className="k-datepicker__head">
              <button type="button" className="k-btn k-btn--subtle k-btn--sm k-btn--icon" aria-label="Previous month" onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))}><Icon name="chevron-left" /></button>
              <span aria-live="polite">{MONTHS[cursor.getMonth()]} {cursor.getFullYear()}</span>
              <button type="button" className="k-btn k-btn--subtle k-btn--sm k-btn--icon" aria-label="Next month" onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))}><Icon name="chevron-right" /></button>
            </div>
            <table className="k-datepicker__grid" role="grid" id={gridId} onKeyDown={onGridKey}>
              <thead><tr>{DOW.map((d) => <th key={d} scope="col">{d}</th>)}</tr></thead>
              <tbody>
                {Array.from({ length: 6 }, (_, w) => (
                  <tr key={w}>
                    {days.slice(w * 7, w * 7 + 7).map((d) => {
                      const sel = value && sameDay(d, value);
                      return (
                        <td key={d.toDateString()}>
                          <button
                            type="button"
                            data-day={d.toDateString()}
                            tabIndex={sameDay(d, cursor) ? 0 : -1}
                            disabled={disabled(d)}
                            aria-pressed={sel || undefined}
                            aria-label={formatDate(d)}
                            className={cx("k-datepicker__day", d.getMonth() !== cursor.getMonth() && "is-outside", sameDay(d, today) && "is-today", isHoliday?.(d) && "is-holiday")}
                            onClick={() => select(d)}
                          >
                            {d.getDate()}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="k-datepicker__foot">
              <button type="button" className="k-btn k-btn--link k-btn--sm" onClick={() => select(today)}>Today</button>
              <span>Type a date or pick one</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
