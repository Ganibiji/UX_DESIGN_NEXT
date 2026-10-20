import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils";
import { Icon } from "../Icon/Icon";

export type ButtonVariant = "primary" | "secondary" | "subtle" | "danger" | "danger-outline" | "link";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** One primary per region. Danger only for irreversible operations. */
  variant?: ButtonVariant;
  size?: "sm" | "md";
  icon?: string;
  /** Icon-only button. `aria-label` is required in this case. */
  iconOnly?: boolean;
  /** Keeps width, shows spinner, blocks repeat submits. */
  loading?: boolean;
  /** Toggle state (view switchers, filters). */
  pressed?: boolean;
  /** Count shown inside the button, e.g. applied filters. */
  count?: number;
  /** Keyboard hint, e.g. "Ctrl S". Decorative; real shortcut is wired elsewhere. */
  shortcut?: string;
  block?: boolean;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", size = "md", icon, iconOnly, loading, pressed, count, shortcut, block, className, children, type = "button", disabled, ...rest },
  ref,
) {
  if (import.meta.env?.DEV && iconOnly && !rest["aria-label"]) {
    console.warn("Button: icon-only buttons need an aria-label.");
  }
  return (
    <button
      ref={ref}
      type={type}
      className={cx(
        "k-btn",
        variant !== "secondary" && `k-btn--${variant}`,
        size === "sm" && "k-btn--sm",
        iconOnly && "k-btn--icon",
        block && "k-btn--block",
        loading && "is-loading",
        className,
      )}
      aria-pressed={pressed}
      aria-busy={loading || undefined}
      disabled={disabled}
      {...rest}
    >
      {icon && <Icon name={icon} size={size === "sm" ? "sm" : "md"} />}
      {!iconOnly && children != null && <span>{children}</span>}
      {count != null && <span className="k-btn__count">{count}</span>}
      {shortcut && <span className="k-btn__kbd" aria-hidden="true">{shortcut}</span>}
    </button>
  );
});

export interface ButtonGroupProps {
  label: string;
  children: ReactNode;
}

/** Segmented control. Children should be Buttons with `pressed`. */
export function ButtonGroup({ label, children }: ButtonGroupProps) {
  return (
    <div className="k-btn-group" role="group" aria-label={label}>
      {children}
    </div>
  );
}
