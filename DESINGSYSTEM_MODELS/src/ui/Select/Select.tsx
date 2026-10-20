import { forwardRef, useId, useMemo, useRef, useState, type KeyboardEvent, type SelectHTMLAttributes } from "react";
import { cx } from "../utils";
import { useField } from "../Form/Field";
import { Icon } from "../Icon/Icon";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  options: SelectOption[];
  placeholder?: string;
  size?: "sm" | "md";
}

/**
 * Native select — best keyboard, mobile and screen-reader behaviour for
 * short lists. Use Autocomplete for lists over ~15 items or remote data.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ options, placeholder, size = "md", className, ...rest }, ref) {
  const field = useField();
  return (
    <select
      ref={ref}
      id={field?.id}
      aria-describedby={field?.describedBy}
      aria-invalid={field?.invalid || undefined}
      aria-required={field?.required || undefined}
      className={cx("k-select", size === "sm" && "k-select--sm", className)}
      {...rest}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>)}
    </select>
  );
});

export interface AutocompleteOption {
  value: string;
  label: string;
  /** Disambiguating detail, e.g. "CUST-00129 · Vadodara". */
  meta?: string;
}

export interface AutocompleteProps {
  options: AutocompleteOption[];
  value: AutocompleteOption | null;
  onChange: (option: AutocompleteOption | null) => void;
  placeholder?: string;
  minChars?: number;
  /** Shown when nothing matches; say what the user can do. */
  emptyText?: (query: string) => string;
  loading?: boolean;
}

/** ARIA 1.2 combobox with list autocomplete. */
export function Autocomplete({ options, value, onChange, placeholder, minChars = 2, emptyText, loading }: AutocompleteProps) {
  const field = useField();
  const listId = useId();
  const [query, setQuery] = useState(value?.label ?? "");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q.length < minChars ? [] : options.filter((o) => o.label.toLowerCase().includes(q)).slice(0, 8);
  }, [query, options, minChars]);

  const choose = (o: AutocompleteOption) => { onChange(o); setQuery(o.label); setOpen(false); };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((a) => Math.min(a + 1, matches.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter" && open && matches[active]) { e.preventDefault(); choose(matches[active]); }
    else if (e.key === "Escape") setOpen(false);
  };

  const highlight = (label: string) => {
    const i = label.toLowerCase().indexOf(query.trim().toLowerCase());
    if (i < 0 || !query.trim()) return label;
    const n = query.trim().length;
    return <>{label.slice(0, i)}<mark>{label.slice(i, i + n)}</mark>{label.slice(i + n)}</>;
  };

  return (
    <div className="k-combobox">
      <div className={cx("k-input-group", loading && "is-loading")}>
        <span className="k-input-group__icon"><Icon name="search" /></span>
        <input
          ref={inputRef}
          id={field?.id}
          className="k-input"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open && matches[active] ? `${listId}-${active}` : undefined}
          aria-describedby={field?.describedBy}
          aria-invalid={field?.invalid || undefined}
          autoComplete="off"
          placeholder={placeholder}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setActive(0); if (!e.target.value) onChange(null); }}
          onKeyDown={onKeyDown}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
        />
      </div>
      {open && (
        <ul className="k-listbox" id={listId} role="listbox">
          {query.trim().length < minChars ? (
            <li className="k-listbox__empty">Type at least {minChars} characters</li>
          ) : matches.length ? (
            matches.map((o, i) => (
              <li
                key={o.value}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={value?.value === o.value}
                className={cx("k-option", i === active && "is-active")}
                onMouseDown={(e) => { e.preventDefault(); choose(o); }}
              >
                <span className="k-option__main">{highlight(o.label)}</span>
                {o.meta && <span className="k-option__meta">{o.meta}</span>}
              </li>
            ))
          ) : (
            <li className="k-listbox__empty">{emptyText ? emptyText(query) : `No matches for “${query}”`}</li>
          )}
        </ul>
      )}
    </div>
  );
}
