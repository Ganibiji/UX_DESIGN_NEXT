import { useState, type ReactNode } from "react";
import { Button, Field, Icon, Modal, Textarea } from "@ui/index";

export type ApprovalState = "submitted" | "approved" | "rejected" | "current" | "upcoming" | "skipped";

export interface ApprovalStep {
  id: string;
  name: string;
  role: string;
  state: ApprovalState;
  /** Why this approver is in the chain: "value > ₹2,00,000". */
  rule?: string;
  comment?: string;
  when?: string;
}

/** Who decides, in which order, by which rule — and what they said. */
export function ApprovalChain({ steps }: { steps: ApprovalStep[] }) {
  let n = 0;
  return (
    <ol className="k-approval">
      {steps.map((s) => {
        n += s.state === "skipped" || s.state === "submitted" ? 0 : 1;
        const done = s.state === "approved" || s.state === "submitted";
        return (
          <li key={s.id} className="k-approval__step">
            <span
              className="k-approval__badge"
              data-state={done ? "approved" : s.state === "upcoming" ? undefined : s.state}
              aria-label={{ submitted: "Submitted", approved: "Approved", rejected: "Rejected", current: "Waiting", upcoming: "Upcoming", skipped: "Not required" }[s.state]}
            >
              {done ? <Icon name="check" size="sm" /> : s.state === "rejected" ? <Icon name="x" size="sm" /> : s.state === "skipped" ? "–" : n + 1}
            </span>
            <div className="k-approval__who">
              <div className={`k-approval__name${s.state === "skipped" ? " u-muted" : ""}`}>{s.name}</div>
              <div className="k-approval__role">{s.role}</div>
              {s.rule && <div className="k-approval__rule">Rule: {s.rule}</div>}
              {s.comment && <div className="k-approval__comment">{s.comment}</div>}
            </div>
            <div className="k-approval__when">{s.when}</div>
          </li>
        );
      })}
    </ol>
  );
}

export interface DecisionBarProps {
  title: ReactNode;
  /** What happens after approval, and why the user is asked. */
  detail: ReactNode;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onRequestChanges?: (note: string) => void;
}

/**
 * Shown only to the person who must decide. Approve needs no confirmation
 * (the caller should offer Undo); Reject requires a reason.
 */
export function DecisionBar({ title, detail, onApprove, onReject, onRequestChanges }: DecisionBarProps) {
  const [mode, setMode] = useState<"reject" | "changes" | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (!text.trim()) { setError(mode === "reject" ? "Add a reason so the requester knows what to do next" : "Say what should change"); return; }
    if (mode === "reject") onReject(text.trim());
    else onRequestChanges?.(text.trim());
    setMode(null); setText(""); setError(null);
  };

  return (
    <>
      <div className="k-decision" role="region" aria-label="Your decision">
        <div className="k-decision__text"><strong>{title}</strong><small>{detail}</small></div>
        <div className="k-decision__actions">
          {onRequestChanges && <Button onClick={() => setMode("changes")}>Request changes</Button>}
          <Button variant="danger-outline" onClick={() => setMode("reject")}>Reject</Button>
          <Button variant="primary" onClick={onApprove}>Approve</Button>
        </div>
      </div>
      <Modal
        open={mode !== null}
        onClose={() => setMode(null)}
        size="sm"
        title={mode === "reject" ? "Reject request" : "Request changes"}
        footer={<><Button onClick={() => setMode(null)}>Cancel</Button><Button variant={mode === "reject" ? "danger" : "primary"} onClick={submit}>{mode === "reject" ? "Reject request" : "Send back"}</Button></>}
      >
        <p>{mode === "reject" ? "The requester is notified and the request closes." : "The request returns as a draft; approvals restart when resubmitted."}</p>
        <Field label={mode === "reject" ? "Reason" : "What should change?"} required error={error}>
          <Textarea value={text} onChange={(e) => { setText(e.target.value); setError(null); }} style={{ minHeight: 72 }} />
        </Field>
      </Modal>
    </>
  );
}
