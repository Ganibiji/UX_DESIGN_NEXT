import type { ReactNode } from "react";
import { cx } from "../utils";
import { Icon } from "../Icon/Icon";

export type StatusTone = "neutral" | "info" | "progress" | "warning" | "success" | "danger" | "muted";

/**
 * Canonical mapping from business status to tone. Features should use this
 * instead of choosing colours per screen, so “Pending” looks the same in
 * Sales, Procurement and Finance.
 */
export const STATUS_TONES: Record<string, StatusTone> = {
  Draft: "neutral", New: "neutral", Prospect: "neutral", Archived: "neutral", Prospecting: "neutral",
  Submitted: "info", Assigned: "info", Confirmed: "info", Open: "info", Reserved: "info", Qualification: "info", Proposal: "info",
  "Under review": "progress", Processing: "progress", Contacted: "progress", Negotiation: "progress", "Partially paid": "progress", "Partially delivered": "progress",
  Pending: "warning", "On hold": "warning", "Credit hold": "warning", "Changes requested": "warning", "Below reorder": "warning",
  Approved: "success", Completed: "success", Paid: "success", Delivered: "success", Won: "success", Active: "success", Qualified: "success", Converted: "success",
  Rejected: "danger", Overdue: "danger", Failed: "danger", Lost: "danger", "Out of stock": "danger",
  Cancelled: "muted", Disqualified: "muted", Void: "muted",
};

export interface StatusProps {
  /** Business status label. Tone is looked up unless given. */
  children: string;
  tone?: StatusTone;
  /** Tinted fill — record headers only. */
  strong?: boolean;
  title?: string;
}

/** Marker shape + text. Never colour alone. */
export function Status({ children, tone, strong, title }: StatusProps) {
  return (
    <span className={cx("k-status", strong && "k-status--strong")} data-tone={tone ?? STATUS_TONES[children] ?? "neutral"} title={title}>
      {children}
    </span>
  );
}

export interface BadgeProps {
  children: ReactNode;
  variant?: "neutral" | "primary" | "attention" | "outline";
  /** Required when the badge is a bare number. */
  "aria-label"?: string;
}

/** Counts and short metadata. Not for status. */
export function Badge({ children, variant = "neutral", ...rest }: BadgeProps) {
  return <span className={cx("k-badge", variant !== "neutral" && `k-badge--${variant}`)} {...rest}>{children}</span>;
}

export interface TagProps {
  label?: string;
  value: string;
  onRemove?: () => void;
}

/** Applied filter or label. Removable tags get a labelled remove button. */
export function Tag({ label, value, onRemove }: TagProps) {
  return (
    <span className="k-tag">
      {label && <span className="k-tag__key">{label}:</span>}
      <span className="k-tag__value">{value}</span>
      {onRemove && (
        <button type="button" className="k-tag__remove" aria-label={`Remove filter ${label ? `${label}: ` : ""}${value}`} onClick={onRemove}>
          <Icon name="x" size="xs" />
        </button>
      )}
    </span>
  );
}

export interface AvatarProps {
  name: string;
  size?: "xs" | "sm" | "md" | "lg";
  /** Organisations are square; people are round. */
  org?: boolean;
  src?: string;
}

const tintFor = (name: string) => (Array.from(name).reduce((h, c) => h + c.charCodeAt(0), 0) % 4) + 1;
const initialsOf = (name: string) => name.replace(/^(Dr|Mr|Ms|Mrs)\.?\s+/i, "").split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();

export function Avatar({ name, size = "md", org, src }: AvatarProps) {
  return (
    <span className={cx("k-avatar", size !== "md" && `k-avatar--${size}`, org && "k-avatar--org")} data-tint={tintFor(name)} title={name} aria-hidden="true">
      {src ? <img src={src} alt="" /> : initialsOf(name)}
    </span>
  );
}

export function Person({ name, size = "xs" }: { name: string; size?: AvatarProps["size"] }) {
  return (
    <span className="k-person">
      <Avatar name={name} size={size} />
      <span className="k-person__name">{name}</span>
    </span>
  );
}
