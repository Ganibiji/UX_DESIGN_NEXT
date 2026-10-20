import type { ReactNode } from "react";
import { cx } from "../utils";
import { Icon } from "../Icon/Icon";

export interface EmptyStateProps {
  icon?: string;
  tone?: "neutral" | "error" | "warning" | "success";
  /** What happened — specific (“No customers match your current filters”). */
  title: string;
  /** Why, and what will help. One or two sentences. */
  children?: ReactNode;
  actions?: ReactNode;
  /** Technical detail for support (error ID, approver name). */
  meta?: ReactNode;
  compact?: boolean;
  role?: "status" | "alert";
}

export function EmptyState({ icon = "info", tone = "neutral", title, children, actions, meta, compact, role }: EmptyStateProps) {
  return (
    <div className={cx("k-empty", compact && "k-empty--compact")} role={role}>
      <span className="k-empty__icon" data-tone={tone === "neutral" ? undefined : tone}><Icon name={icon} /></span>
      <h3 className="k-empty__title">{title}</h3>
      {children && <p className="k-empty__text">{children}</p>}
      {actions && <div className="k-empty__actions">{actions}</div>}
      {meta && <p className="k-empty__meta">{meta}</p>}
    </div>
  );
}

export interface AlertProps {
  tone?: "info" | "success" | "warning" | "error" | "neutral";
  title?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  onDismiss?: () => void;
}

const ALERT_ICON = { info: "info", success: "check-circle", warning: "alert-triangle", error: "alert-circle", neutral: "info" } as const;

/** Inline message, placed where the related decision is made. */
export function Alert({ tone = "info", title, children, actions, onDismiss }: AlertProps) {
  return (
    <div className="k-alert" data-tone={tone} role={tone === "error" ? "alert" : undefined}>
      <Icon name={ALERT_ICON[tone]} />
      <div className="k-alert__body">
        {title && <div className="k-alert__title">{title}</div>}
        {children && <div className="k-alert__text">{children}</div>}
        {actions && <div className="k-alert__actions">{actions}</div>}
      </div>
      {onDismiss && (
        <button type="button" className="k-btn k-btn--subtle k-btn--icon k-btn--sm k-alert__close" aria-label="Dismiss" onClick={onDismiss}>
          <Icon name="x" />
        </button>
      )}
    </div>
  );
}
