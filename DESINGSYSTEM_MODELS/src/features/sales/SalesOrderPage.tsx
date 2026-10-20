import { useState } from "react";
import { Button, Dropdown, EmptyState, Field, Input, Modal, Person, Status, Table, Totals, formatINR, useToast } from "@ui/index";
import {
  ApprovalChain, AuditLog, DecisionBar, DetailBody, DetailPage, DocumentFlow, Panel, PROCESSES, Timeline, stepsFor,
} from "@patterns/index";

interface Line {
  no: number;
  item: string;
  sku: string;
  qty: number;
  uom: string;
  rate: number;
  delivery: string;
}

const LINES: Line[] = [
  { no: 1, item: "Industrial servo motor 2.2 kW, 3000 rpm", sku: "SM-2200", qty: 4, uom: "nos", rate: 62500, delivery: "Delivered" },
  { no: 2, item: "Servo drive 2.2 kW, EtherCAT", sku: "SD-2200", qty: 4, uom: "nos", rate: 38400, delivery: "Delivered" },
  { no: 3, item: "PLC controller, 24 DI / 16 DO", sku: "PLC-2416", qty: 2, uom: "nos", rate: 54000, delivery: "Reserved" },
  { no: 4, item: "HMI touch panel 7\", IP65 front", sku: "HMI-07", qty: 2, uom: "nos", rate: 31500, delivery: "Reserved" },
  { no: 5, item: "Shielded motor cable 4C × 2.5 sq mm", sku: "CBL-4C25", qty: 300, uom: "m", rate: 265, delivery: "Short 120 m" },
  { no: 6, item: "Mounting bracket & accessories kit", sku: "ACC-MB04", qty: 4, uom: "sets", rate: 6500, delivery: "Reserved" },
  { no: 7, item: "On-site commissioning (engineer-day)", sku: "SRV-COM", qty: 2, uom: "days", rate: 18000, delivery: "Scheduled 28 Oct" },
];

const subtotal = LINES.reduce((s, l) => s + l.qty * l.rate, 0); // 7,16,100
const gst = Math.round(subtotal * 0.09);                          // 64,449 each
const total = Math.round(subtotal + 2 * gst);                     // 8,44,998 → round off 2

/** Sales › SO-10234 — reference DetailPage + Approval + Workflow implementation. */
export function SalesOrderPage() {
  const toast = useToast();
  const [pending, setPending] = useState(true);
  const [cancelOpen, setCancelOpen] = useState(false);

  const approve = () => {
    setPending(false);
    toast({ text: "Revision 2 approved. Anjali Nair has been notified.", action: "Undo", onAction: () => setPending(true), timeout: 10000 });
  };

  return (
    <>
    <DetailPage
      breadcrumb={[{ label: "Home", href: "/" }, { label: "Sales" }, { label: "Sales orders", href: "#" }, { label: "SO-10234" }]}
      recordType="Sales order · Revision 2"
      title="SO-10234"
      statuses={[{ label: "Confirmed" }, ...(pending ? [{ label: "Revision pending approval", tone: "warning" as const }] : [])]}
      subtitle={<><a href="#">ABC Technologies Pvt Ltd</a> · Pune · Customer PO <span className="k-id">ABC/PO/2026/0912</span></>}
      actions={
        <>
          <Button icon="edit">Edit</Button>
          <Button icon="printer">Print</Button>
          <Dropdown
            align="end"
            items={[
              { type: "label", label: "Next steps" },
              { label: "Create delivery", icon: "truck", onSelect: () => undefined },
              { label: "Create invoice", icon: "receipt", onSelect: () => undefined },
              { type: "separator" },
              { label: "Cancel order…", icon: "x-circle", danger: true, onSelect: () => setCancelOpen(true) },
            ]}
            trigger={(t) => <button type="button" className="k-btn" {...t}>More</button>}
          />
          {pending && <Button variant="primary" icon="check" onClick={approve}>Approve revision</Button>}
        </>
      }
      facts={[
        { label: "Order value", value: formatINR(total + 2), hero: true },
        { label: "Order date", value: "12 Oct 2026" },
        { label: "Delivery by", value: "24 Oct 2026" },
        { label: "Payment terms", value: pending ? "Net 30 → Net 45 pending" : "Net 45" },
        { label: "Delivered", value: "2 of 7 lines" },
        { label: "Sales owner", value: <Person name="Anjali Nair" /> },
      ]}
      tabs={[
        { id: "overview", label: "Overview" },
        { id: "items", label: "Items", count: 7 },
        { id: "payments", label: "Payments", count: 0 },
        { id: "history", label: "History" },
      ]}
      mobileActions={pending ? <><Button onClick={() => undefined}>Reject</Button><Button variant="primary" onClick={approve}>Approve</Button></> : undefined}
    >
      {(tab) => {
        if (tab === "payments")
          return (
            <DetailBody main={<Panel title="Payments" flush><EmptyState title="No payments yet" icon="receipt" actions={<Button variant="primary">Create invoice for DL-7781</Button>}>Payments are recorded against invoices. DL-7781 is delivered and can be invoiced now (₹4,76,248 incl. GST).</EmptyState></Panel>} />
          );
        if (tab === "history")
          return (
            <DetailBody main={<Panel title="Change history" meta="Field-level audit" flush><AuditLog entries={[
              { id: "1", when: "20 Oct 2026, 09:40", who: "Anjali Nair", field: "Payment terms", from: "Net 30", to: "Net 45", source: "Web" },
              { id: "2", when: "16 Oct 2026, 15:20", who: "System", field: "Delivery status", from: "Not delivered", to: "Partially delivered", source: "DL-7781 posting" },
              { id: "3", when: "12 Oct 2026, 17:30", who: "Priya Deshmukh", field: "Status", from: "Draft", to: "Confirmed", source: "Mobile" },
            ]} /></Panel>} />
          );
        const lines = (
          <Table<Line>
            plain
            stackOnMobile
            rows={LINES}
            rowKey={(l) => String(l.no)}
            rowClassName={(l) => (l.delivery.startsWith("Short") ? "is-attention" : undefined)}
            columns={[
              { key: "no", header: "#", width: 36, align: "end" },
              { key: "item", header: "Item" },
              { key: "sku", header: "SKU", width: 100, mono: true },
              { key: "qty", header: "Qty", width: 84, align: "end", render: (l) => <>{l.qty} <span className="u-muted">{l.uom}</span></> },
              { key: "rate", header: "Rate", width: 96, align: "end", render: (l) => formatINR(l.rate) },
              { key: "amount", header: "Amount", width: 108, align: "end", render: (l) => formatINR(l.qty * l.rate) },
              { key: "delivery", header: "Delivery", width: 148, render: (l) => <Status tone={l.delivery === "Delivered" ? "success" : l.delivery.startsWith("Short") ? "warning" : l.delivery === "Reserved" ? "info" : "neutral"}>{l.delivery}</Status> },
            ]}
          />
        );
        if (tab === "items") return <DetailBody main={<Panel title="Order lines" flush>{lines}</Panel>} />;
        return (
          <DetailBody
            main={
              <>
                {pending && (
                  <DecisionBar
                    title="Your approval is needed for Revision 2"
                    detail="Anjali Nair changed payment terms Net 30 → Net 45 and split delivery into two shipments. Terms beyond Net 30 need Sales Manager approval."
                    onApprove={approve}
                    onReject={(reason) => { setPending(false); toast({ text: `Revision rejected: ${reason}`, tone: "neutral" }); }}
                  />
                )}
                <section>
                  <h2 className="k-text-label u-mb-2">Document flow</h2>
                  <DocumentFlow compact label="Order to cash" steps={stepsFor(PROCESSES.orderToCash.slice(1), 2, { 0: "OPP-2291", 1: "QT-5512 · Accepted", 2: "SO-10234 · Rev 2", 3: "DL-7781 · 1 of 2", 4: "Not created" })} />
                </section>
                <Panel title="Order lines" meta="7 lines · Pune Main Warehouse" flush footer={
                  <div className="u-flex u-w-full u-justify-end">
                    <Totals lines={[{ label: "Subtotal", value: formatINR(subtotal, 2) }, { label: "CGST 9%", value: formatINR(gst, 2) }, { label: "SGST 9%", value: formatINR(gst, 2) }, { label: "Round off", value: formatINR(845000 - total, 2) }]} total={{ label: "Total", value: formatINR(845000, 2) }} />
                  </div>
                }>{lines}</Panel>
              </>
            }
            side={
              <>
                <Panel title="Approval · Revision 2">
                  <ApprovalChain steps={[
                    { id: "s", name: "Anjali Nair", role: "Submitted · Account Executive", state: "submitted", comment: "Customer’s FY closes in March; they asked for Net 45 on this order only.", when: "Today 10:12" },
                    { id: "m", name: "Priya Deshmukh (you)", role: "Sales Manager · West", state: pending ? "current" : "approved", rule: "payment terms > Net 30", when: pending ? "Waiting" : "Just now" },
                  ]} />
                </Panel>
                <Panel title="Recent activity">
                  <Timeline events={[
                    { id: "1", icon: "send", tone: "warning", title: <><strong>Anjali Nair</strong> submitted Revision 2</>, time: "10:12" },
                    { id: "2", icon: "truck", tone: "primary", title: <><strong>DL-7781</strong> dispatched</>, time: "16 Oct", body: "8 items · MH12 QW 4471" },
                    { id: "3", icon: "check", tone: "success", title: <><strong>Priya Deshmukh</strong> confirmed the order</>, time: "12 Oct" },
                  ]} />
                </Panel>
              </>
            }
          />
        );
      }}
    </DetailPage>
    {/* Typed confirmation: irreversible, and a delivery is already posted */}
    <CancelOrderModal open={cancelOpen} onClose={() => setCancelOpen(false)} onConfirm={() => { setCancelOpen(false); toast({ text: "SO-10234 cancelled. Reserved stock released.", tone: "neutral" }); }} />
    </>
  );
}

export function CancelOrderModal({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  const [text, setText] = useState("");
  return (
    <Modal open={open} onClose={onClose} tone="danger" size="sm" title="Cancel SO-10234?"
      footer={<><Button onClick={onClose}>Keep order</Button><Button variant="danger" disabled={text.trim().toUpperCase() !== "SO-10234"} onClick={onConfirm}>Cancel order</Button></>}>
      <p>This can’t be undone. DL-7781 is already posted — create a return for those items separately.</p>
      <Field label={<>Type <strong className="k-id">SO-10234</strong> to confirm</>}><Input mono value={text} onChange={(e) => setText(e.target.value)} autoComplete="off" /></Field>
    </Modal>
  );
}
