import type { ReactNode } from "react";
import { cx } from "@ui/index";

export type FlowState = "done" | "current" | "upcoming" | "blocked";

export interface FlowStep {
  id: string;
  name: string;
  state: FlowState;
  /** Document reference or short status: "QT-5512 · Accepted". */
  doc?: ReactNode;
}

/**
 * Document flow across a business process, e.g.
 * Purchase request → Approval → PO → Goods receipt → Supplier invoice → Payment.
 * Not a wizard: steps are other documents, each link opens that document.
 */
export function DocumentFlow({ steps, label, compact }: { steps: FlowStep[]; label: string; compact?: boolean }) {
  return (
    <ol className={cx("k-flow", compact && "k-flow--compact")} aria-label={label}>
      {steps.map((s) => (
        <li key={s.id} className={cx("k-flow__step", s.state !== "upcoming" && `is-${s.state}`)} aria-current={s.state === "current" ? "step" : undefined}>
          <span className="k-flow__name">{s.name}{s.state === "done" && <span className="k-sr-only"> (completed)</span>}{s.state === "blocked" && <span className="k-sr-only"> (blocked)</span>}</span>
          {s.doc && <span className="k-flow__doc">{s.doc}</span>}
        </li>
      ))}
    </ol>
  );
}

/** Canonical process definitions shared by all modules. */
export const PROCESSES = {
  procureToPay: ["Purchase request", "Approval", "Purchase order", "Goods receipt", "Supplier invoice", "Payment"],
  orderToCash: ["Lead", "Opportunity", "Quotation", "Sales order", "Delivery", "Invoice", "Payment"],
  inventory: ["Purchase", "Receipt", "Warehouse", "Stock", "Transfer", "Adjustment"],
} as const;

/** Builds steps for a process given the index of the current step. */
export function stepsFor(process: readonly string[], currentIndex: number, docs: Record<number, ReactNode> = {}, blockedIndex?: number): FlowStep[] {
  return process.map((name, i) => ({
    id: name,
    name,
    doc: docs[i],
    state: i === blockedIndex ? "blocked" : i < currentIndex ? "done" : i === currentIndex ? "current" : "upcoming",
  }));
}
