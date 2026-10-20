import { forwardRef, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import { cx } from "../utils";
import { useField } from "../Form/Field";
import { Icon } from "../Icon/Icon";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "prefix"> {
  /** Right-aligned, tabular figures (amounts, quantities). */
  numeric?: boolean;
  /** Text addon before the field, e.g. "₹" or "+91". */
  prefix?: ReactNode;
  /** Text addon after the field, e.g. "m" or "%". */
  suffix?: ReactNode;
  /** Icon inside the field (search, calendar). */
  icon?: string;
  /** Async validation / lookup in progress. */
  loading?: boolean;
  /** Valid state after async check (e.g. GSTIN verified). */
  valid?: boolean;
  size?: "sm" | "md";
  /** Identifier font (codes, GSTIN, SKUs). */
  mono?: boolean;
}

/**
 * Text input. Inside a <Field>, id / aria-describedby / aria-invalid /
 * aria-required are wired automatically.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { numeric, prefix, suffix, icon, loading, valid, size = "md", mono, className, ...rest },
  ref,
) {
  const field = useField();
  const input = (
    <input
      ref={ref}
      id={field?.id}
      aria-describedby={field?.describedBy}
      aria-invalid={field?.invalid || undefined}
      aria-required={field?.required || undefined}
      aria-busy={loading || undefined}
      className={cx("k-input", numeric && "k-input--num", size === "sm" && "k-input--sm", valid && "is-valid", mono && "k-id", className)}
      {...rest}
    />
  );
  if (!prefix && !suffix && !icon && !loading) return input;
  return (
    <div className={cx("k-input-group", loading && "is-loading")}>
      {prefix && <span className="k-input-group__addon">{prefix}</span>}
      {icon && <span className="k-input-group__icon"><Icon name={icon} /></span>}
      {input}
      {suffix && <span className="k-input-group__addon">{suffix}</span>}
    </div>
  );
});

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ className, ...rest }, ref) {
  const field = useField();
  return (
    <textarea
      ref={ref}
      id={field?.id}
      aria-describedby={field?.describedBy}
      aria-invalid={field?.invalid || undefined}
      aria-required={field?.required || undefined}
      className={cx("k-textarea", className)}
      {...rest}
    />
  );
});

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode;
  description?: ReactNode;
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox({ label, description, indeterminate, className, ...rest }, ref) {
  return (
    <label className={cx("k-check", !label && "k-check--bare", className)}>
      <input
        ref={(el) => {
          if (el) el.indeterminate = Boolean(indeterminate);
          if (typeof ref === "function") ref(el);
          else if (ref) ref.current = el;
        }}
        type="checkbox"
        {...rest}
      />
      {label && <span>{label}{description && <span className="k-check__desc">{description}</span>}</span>}
    </label>
  );
});

export interface RadioGroupProps<T extends string> {
  legend: string;
  name: string;
  value: T;
  options: Array<{ value: T; label: ReactNode; disabled?: boolean }>;
  onChange: (value: T) => void;
  inline?: boolean;
  required?: boolean;
}

export function RadioGroup<T extends string>({ legend, name, value, options, onChange, inline = true, required }: RadioGroupProps<T>) {
  return (
    <fieldset className="k-choice-group">
      <legend className="k-label">{legend}{required && <span className="k-label__req" aria-hidden="true">*</span>}</legend>
      <div className={cx("k-choice-group", inline && "k-choice-group--row")}>
        {options.map((o) => (
          <label key={o.value} className="k-radio">
            <input type="radio" name={name} value={o.value} checked={value === o.value} disabled={o.disabled} onChange={() => onChange(o.value)} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "role"> {
  label: ReactNode;
}

/** For settings that apply immediately. Never inside a form with Save. */
export function Switch({ label, checked, ...rest }: SwitchProps) {
  return (
    <label className="k-switch">
      <input type="checkbox" role="switch" checked={checked} {...rest} />
      <span>{label}</span>
      <span className="k-switch__state" aria-hidden="true">{checked ? "On" : "Off"}</span>
    </label>
  );
}
