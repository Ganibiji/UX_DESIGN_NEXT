import { useEffect, useId, useRef, type ReactNode } from "react";
import { cx } from "../utils";
import { Icon } from "../Icon/Icon";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Visual cue for consequential decisions. */
  tone?: "default" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  /** Actions, right-aligned. Put the safe action first; destructive last. */
  footer?: ReactNode;
  footerStart?: ReactNode;
  /** Show a close button in the header (omit for forced decisions). */
  dismissible?: boolean;
}

/**
 * Native <dialog>.showModal(): focus trap, inert background and Esc for free.
 * Focus returns to whatever opened it. Use for blocking decisions only.
 */
export function Modal({ open, onClose, title, tone = "default", size = "md", children, footer, footerStart, dismissible = true }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const opener = useRef<Element | null>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      opener.current = document.activeElement;
      d.showModal();
    } else if (!open && d.open) {
      d.close();
      (opener.current as HTMLElement | null)?.focus?.();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={cx("k-modal", size !== "md" && `k-modal--${size}`)}
      aria-labelledby={titleId}
      onCancel={(e) => { e.preventDefault(); if (dismissible) onClose(); }}
    >
      <div className="k-modal__header">
        {tone !== "default" && (
          <span className={cx("k-modal__icon", `k-modal__icon--${tone}`)}>
            <Icon name={tone === "danger" ? "alert-circle" : "alert-triangle"} size="lg" />
          </span>
        )}
        <h2 className="k-modal__title" id={titleId}>{title}</h2>
        {dismissible && (
          <button type="button" className="k-btn k-btn--subtle k-btn--icon k-btn--sm" aria-label="Close" onClick={onClose}>
            <Icon name="x" />
          </button>
        )}
      </div>
      <div className="k-modal__body">{children}</div>
      {footer && (
        <div className="k-modal__footer">
          {footerStart && <span className="k-modal__footer-start">{footerStart}</span>}
          {footer}
        </div>
      )}
    </dialog>
  );
}
