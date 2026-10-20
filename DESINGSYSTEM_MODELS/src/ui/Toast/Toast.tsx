import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "../Icon/Icon";

export interface ToastOptions {
  text: ReactNode;
  tone?: "success" | "error" | "warning" | "info" | "neutral";
  /** e.g. "Undo" or "View". */
  action?: string;
  onAction?: () => void;
  /** ms; default 6000. Paused while hovered or focused. */
  timeout?: number;
}

interface ToastItem extends ToastOptions {
  id: number;
}

const ToastContext = createContext<(t: ToastOptions) => void>(() => undefined);

/** `const toast = useToast(); toast({ text: "3 accounts archived", action: "Undo", onAction })` */
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seq = useRef(0);
  const push = useCallback((t: ToastOptions) => {
    seq.current += 1;
    const id = seq.current;
    setItems((cur) => [...cur.slice(-2), { ...t, id }]);
  }, []);
  const remove = (id: number) => setItems((cur) => cur.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="k-toast-region" role="status" aria-live="polite">
        {items.map((t) => <Toast key={t.id} item={t} onDone={() => remove(t.id)} />)}
      </div>
    </ToastContext.Provider>
  );
}

const ICONS = { success: "check-circle", error: "alert-circle", warning: "alert-triangle", info: "info", neutral: "info" } as const;

function Toast({ item, onDone }: { item: ToastItem; onDone: () => void }) {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const t = window.setTimeout(onDone, item.timeout ?? 6000);
    return () => window.clearTimeout(t);
  }, [paused, item.timeout, onDone]);
  const tone = item.tone ?? "success";
  return (
    <div
      className="k-toast"
      data-tone={tone}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <Icon name={ICONS[tone]} />
      <span className="k-toast__text">{item.text}</span>
      {item.action && <button type="button" className="k-toast__action" onClick={() => { item.onAction?.(); onDone(); }}>{item.action}</button>}
      <button type="button" className="k-toast__close" aria-label="Dismiss" onClick={onDone}><Icon name="x" size="sm" /></button>
    </div>
  );
}
