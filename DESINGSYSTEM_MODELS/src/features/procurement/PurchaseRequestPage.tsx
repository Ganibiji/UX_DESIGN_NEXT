import { useState } from "react";
import { Alert, Table, Totals, formatINR, useToast } from "@ui/index";
import { ApprovalChain, DecisionBar, DetailBody, DetailPage, DocumentFlow, Panel, PROCESSES, stepsFor, type ApprovalStep } from "@patterns/index";

interface PrLine { no: number; item: string; code: string; qty: number; rate: number; supplier: string }

const LINES: PrLine[] = [
  { no: 1, item: "Servo motor 0.75 kW, demo grade", code: "SM-0750", qty: 4, rate: 28500, supplier: "Arihant Motion Controls" },
  { no: 2, item: "Servo drive 0.75 kW, EtherCAT", code: "SD-0750", qty: 4, rate: 19800, supplier: "Arihant Motion Controls" },
  { no: 3, item: "Portable demo enclosure with 7\" HMI", code: "FAB-DEMO-02", qty: 2, rate: 48000, supplier: "Precision Sheetmetal Works" },
  { no: 4, item: "Transit flight case, foam insert", code: "CASE-FL-60", qty: 4, rate: 9300, supplier: "Any approved vendor" },
  { no: 5, item: "Cable & connector kit", code: "KIT-CBL-DM", qty: 4, rate: 15000, supplier: "Arihant Motion Controls" },
];
const TOTAL = LINES.reduce((s, l) => s + l.qty * l.rate, 0); // ₹3,86,400

type Decision = "pending" | "approved" | "rejected" | "changes";

/** Procurement › PR-2026-0418 — approver’s view of a rule-based approval chain. */
export function PurchaseRequestPage() {
  const toast = useToast();
  const [decision, setDecision] = useState<Decision>("pending");

  const chain: ApprovalStep[] = [
    { id: "r", name: "Rohit Kulkarni", role: "Requester · Sr. Account Executive", state: "submitted", when: "20 Oct 09:52" },
    { id: "me", name: "Priya Deshmukh (you)", role: "Cost centre owner · CC-SW-310", state: decision === "pending" ? "current" : decision === "approved" ? "approved" : "rejected", rule: "all requests on own cost centre", when: decision === "pending" ? "Waiting 3 h" : "Just now" },
    { id: "p", name: "Suresh Menon", role: "Head of Procurement", state: "upcoming", rule: "value > ₹2,00,000" },
    { id: "f", name: "Finance Controller", role: "Not required · value below ₹5,00,000", state: "skipped" },
  ];

  const status = { pending: "Under review", approved: "Pending procurement", rejected: "Rejected", changes: "Changes requested" }[decision];

  return (
    <DetailPage
      breadcrumb={[{ label: "Home", href: "/" }, { label: "My approvals", href: "#" }, { label: "PR-2026-0418" }]}
      recordType="Purchase request · 1 of 4 waiting for you"
      title="Demo & trial kits — Q3 customer trials"
      statuses={[{ label: status, tone: decision === "rejected" ? "danger" : decision === "changes" ? "warning" : "progress" }]}
      subtitle={<><span className="k-id">PR-2026-0418</span> · Requested by Rohit Kulkarni · Cost centre <span className="k-id">CC-SW-310</span></>}
      actions={null}
      facts={[
        { label: "Estimated value", value: `${formatINR(TOTAL)} excl. GST`, hero: true },
        { label: "Needed by", value: "05 Nov 2026" },
        { label: "Deliver to", value: "Pune Main Warehouse" },
        { label: "Budget after this", value: "84% used" },
      ]}
      tabs={[{ id: "details", label: "Details" }, { id: "history", label: "History" }]}
    >
      {() => (
        <DetailBody
          main={
            <>
              {decision === "pending" && (
                <DecisionBar
                  title="Approve as cost centre owner"
                  detail="After you, it goes to Procurement (Suresh Menon) because the value is above ₹2,00,000."
                  onApprove={() => { setDecision("approved"); toast({ text: "Approved. Sent to Suresh Menon (Procurement).", action: "Undo", onAction: () => setDecision("pending"), timeout: 10000 }); }}
                  onReject={() => { setDecision("rejected"); toast({ text: "Request rejected. Rohit has been notified.", tone: "neutral" }); }}
                  onRequestChanges={() => { setDecision("changes"); toast({ text: "Sent back to Rohit for changes." }); }}
                />
              )}
              <section>
                <h2 className="k-text-label u-mb-2">Procure to pay</h2>
                <DocumentFlow label="Procure to pay" steps={stepsFor(PROCESSES.procureToPay, decision === "approved" ? 2 : 1, { 0: "PR-2026-0418", 1: decision === "approved" ? "Approved by you" : "Step 2 of 3 · you" })} />
              </section>
              <Panel title="Items" meta="5 lines" flush footer={<div className="u-flex u-w-full u-justify-end"><Totals lines={[]} total={{ label: "Total estimated (excl. GST)", value: formatINR(TOTAL) }} /></div>}>
                <Table<PrLine>
                  plain
                  stackOnMobile
                  rows={LINES}
                  rowKey={(l) => String(l.no)}
                  columns={[
                    { key: "item", header: "Item" },
                    { key: "code", header: "Code", width: 110, mono: true },
                    { key: "qty", header: "Qty", width: 56, align: "end" },
                    { key: "rate", header: "Est. rate", width: 96, align: "end", render: (l) => formatINR(l.rate) },
                    { key: "amount", header: "Amount", width: 104, align: "end", render: (l) => formatINR(l.qty * l.rate) },
                    { key: "supplier", header: "Suggested supplier", width: 190 },
                  ]}
                />
              </Panel>
              <Alert tone="info" title="Line 3 has a single quotation">Policy asks for 3 quotes above ₹50,000 for custom fabrication. Procurement will source two more before raising the PO — this doesn’t block your approval.</Alert>
            </>
          }
          side={
            <>
              <Panel title="Approval chain"><ApprovalChain steps={chain} /></Panel>
              <Panel title="Budget check" actions={<span className="k-status" data-tone="success">Within budget</span>}>
                <Totals lines={[{ label: "Annual budget", value: "₹18,00,000" }, { label: "Consumed + committed", value: "₹11,20,000" }, { label: "This request", value: formatINR(TOTAL) }]} total={{ label: "Remaining after", value: "₹2,93,600" }} />
              </Panel>
            </>
          }
        />
      )}
    </DetailPage>
  );
}
