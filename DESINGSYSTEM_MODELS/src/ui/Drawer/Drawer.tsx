import { useEffect, useId, useRef, type MouseEvent, type ReactNode } from "react";
import { cx } from "../utils";
import { Icon } from "../Icon/Icon";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  side?: "end" | "start";
  size?: "md" | "lg";
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Side panel for work that needs the page behind it: filters, quick create,
 * quick view. Clicking the backdrop closes it (unlike Modal).
 */
export function Drawer({ open, onClose, title, side = "end", size = "md", children, footer }: DrawerProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const onBackdrop = (e: MouseEvent<HTMLDialogElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    if (e.target === e.currentTarget && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) onClose();
  };

  return (
    <dialog
      ref={ref}
      className={cx("k-drawer", side === "start" && "k-drawer--left", size === "lg" && "k-drawer--lg")}
      aria-labelledby={titleId}
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      onClick={onBackdrop}
    >
      <div className="k-drawer__header">
        <h2 className="k-drawer__title" id={titleId}>{title}</h2>
        <button type="button" className="k-btn k-btn--subtle k-btn--icon k-btn--sm" aria-label={`Close ${title}`} onClick={onClose}>
          <Icon name="x" />
        </button>
      </div>
      <div className="k-drawer__body">{children}</div>
      {footer && <div className="k-drawer__footer">{footer}</div>}
    </dialog>
  );
}
