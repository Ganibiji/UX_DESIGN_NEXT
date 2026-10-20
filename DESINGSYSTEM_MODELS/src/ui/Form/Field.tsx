import { createContext, useContext, useId, type ReactNode } from "react";
import { cx } from "../utils";
import { Icon } from "../Icon/Icon";

/** Wiring that a Field passes down to its control (Input, Select, Textarea…). */
export interface FieldContextValue {
  id: string;
  describedBy?: string;
  invalid: boolean;
  required: boolean;
}

const FieldContext = createContext<FieldContextValue | null>(null);
export const useField = () => useContext(FieldContext);

export interface FieldProps {
  label: ReactNode;
  /** Control id. Pass one when something else links to the field (error summary). */
  id?: string;
  required?: boolean;
  /** Shows "optional" — use when most fields in the section are required. */
  optional?: boolean;
  help?: ReactNode;
  /** Error message: says how to fix it, not just that it’s wrong. */
  error?: ReactNode;
  warning?: ReactNode;
  success?: ReactNode;
  /** Right-aligned hint in the label row, e.g. a character counter. */
  hint?: ReactNode;
  span?: 2 | 3 | "full";
  inline?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Label above control, help or message below. The control receives id,
 * aria-describedby, aria-invalid and aria-required through context.
 */
export function Field({ id: idProp, label, required, optional, help, error, warning, success, hint, span, inline, className, children }: FieldProps) {
  const generated = useId();
  const id = idProp ?? generated;
  const helpId = `${id}-help`;
  const msgId = `${id}-msg`;
  const message = error ?? warning ?? success;
  const tone = error ? "error" : warning ? "warning" : success ? "success" : null;
  const describedBy = [help && !message ? helpId : null, message ? msgId : null].filter(Boolean).join(" ") || undefined;

  return (
    <FieldContext.Provider value={{ id, describedBy, invalid: Boolean(error), required: Boolean(required) }}>
      <div className={cx("k-field", inline && "k-field--inline", span && (span === "full" ? "k-span-full" : `k-span-${span}`), className)}>
        <label className="k-label" htmlFor={id}>
          {label}
          {required && <span className="k-label__req" aria-hidden="true">*</span>}
          {optional && <span className="k-label__optional">optional</span>}
          {hint && <span className="k-label__hint">{hint}</span>}
        </label>
        {children}
        {help && !message && <span className="k-field__help" id={helpId}>{help}</span>}
        {message && (
          <span className={cx("k-field__message", `k-field__message--${tone}`)} id={msgId} role={error ? "alert" : undefined}>
            <Icon name={tone === "error" ? "alert-circle" : tone === "warning" ? "alert-triangle" : "check-circle"} />
            {message}
          </span>
        )}
      </div>
    </FieldContext.Provider>
  );
}

export interface FormSectionProps {
  id?: string;
  title: string;
  description?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
}

/** A form section: heading + one-line purpose + grid. Not a card. */
export function FormSection({ id, title, description, aside, children }: FormSectionProps) {
  const headingId = useId();
  return (
    <section className="k-form-section" id={id} aria-labelledby={headingId}>
      <header className="k-form-section__head">
        <h3 className="k-form-section__title" id={headingId}>{title}</h3>
        {description && <p className="k-form-section__desc">{description}</p>}
        {aside && <div className="k-form-section__aside">{aside}</div>}
      </header>
      {children}
    </section>
  );
}

export function FormGrid({ columns = 2, children }: { columns?: 1 | 2 | 3 | 4; children: ReactNode }) {
  return <div className={cx("k-form-grid", columns !== 2 && `k-form-grid--${columns}`)}>{children}</div>;
}

export type SaveState = "pristine" | "dirty" | "saving" | "saved" | "error";

export interface FormFooterProps {
  state: SaveState;
  dirtyCount?: number;
  children: ReactNode;
}

const STATE_TEXT: Record<SaveState, string> = {
  pristine: "No changes yet",
  dirty: "Unsaved changes",
  saving: "Saving…",
  saved: "All changes saved",
  error: "Couldn’t save — fix the highlighted fields",
};

/** Sticky footer that always shows save state next to the actions. */
export function FormFooter({ state, dirtyCount, children }: FormFooterProps) {
  const text = state === "dirty" && dirtyCount ? `${dirtyCount} unsaved change${dirtyCount > 1 ? "s" : ""}` : STATE_TEXT[state];
  return (
    <div className="k-form-footer">
      <span className={cx("k-form-footer__state", state === "dirty" && "is-dirty", state === "saved" && "is-saved")} aria-live="polite">{text}</span>
      {children}
    </div>
  );
}

export interface ErrorSummaryProps {
  errors: Array<{ fieldId: string; message: string }>;
  noun?: string;
}

/** Shown after a failed submit; each item focuses its field. */
export function ErrorSummary({ errors, noun = "record" }: ErrorSummaryProps) {
  if (!errors.length) return null;
  return (
    <div className="k-error-summary" tabIndex={-1}>
      <div className="k-alert" data-tone="error" role="alert">
        <Icon name="alert-circle" />
        <div className="k-alert__body">
          <div className="k-alert__title">Fix {errors.length} field{errors.length > 1 ? "s" : ""} to save this {noun}</div>
          <ul className="k-alert__list">
            {errors.map((e) => (
              <li key={e.fieldId}>
                <a href={`#${e.fieldId}`} onClick={(ev) => { ev.preventDefault(); document.getElementById(e.fieldId)?.focus(); }}>{e.message}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
