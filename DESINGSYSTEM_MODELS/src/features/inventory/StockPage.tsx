import { useState } from "react";
import { Button, DataGrid, Status, formatINR, type Column } from "@ui/index";
import { DocumentFlow, MasterDetail, PROCESSES, Tree, stepsFor, type TreeNode } from "@patterns/index";
import { PageLayout } from "@layouts/index";

interface StockRow { sku: string; name: string; bin: string; onHand: number; reserved: number; reorder: number; cost: number; uom?: string }

const STOCK: StockRow[] = [
  { sku: "CBL-4C25", name: "Shielded motor cable 4C × 2.5 sq mm", bin: "B-14-03", onHand: 180, reserved: 180, reorder: 400, cost: 265, uom: "m" },
  { sku: "ENC-1024", name: "Incremental encoder 1024 ppr", bin: "A-07-02", onHand: 6, reserved: 2, reorder: 10, cost: 7400 },
  { sku: "HB-M10-50", name: "Hex bolt M10 × 50 zinc plated", bin: "A-21-08", onHand: 4820, reserved: 400, reorder: 2000, cost: 6 },
  { sku: "PLC-2416", name: "PLC controller, 24 DI / 16 DO", bin: "A-05-04", onHand: 16, reserved: 2, reorder: 8, cost: 54000 },
  { sku: "SMPS-24-10", name: "Power supply 24 V DC, 10 A DIN", bin: "A-09-03", onHand: 0, reserved: 0, reorder: 15, cost: 4650 },
];

const LOCATIONS: TreeNode[] = [
  { id: "all", label: "All warehouses", icon: "warehouse", meta: "₹4.82 Cr", children: [
    { id: "pnq", label: "Pune Main · PNQ-01", meta: "₹2.91 Cr", children: [
      { id: "pnq-a", label: "Zone A · Fast movers", meta: "412 bins" },
      { id: "pnq-b", label: "Zone B · Bulk & cable", meta: "208 bins" },
      { id: "pnq-q", label: "Quarantine", meta: "11 items" },
    ] },
    { id: "ckn", label: "Chakan · CKN-02", meta: "₹1.12 Cr", children: [{ id: "ckn-m", label: "Main store" }] },
    { id: "transit", label: "In transit", meta: "2 transfers" },
  ] },
];

/** Availability drives the status, not on-hand alone. */
const statusOf = (r: StockRow) =>
  r.onHand === 0 ? "Out of stock" : r.onHand - r.reserved <= 0 ? "Short for orders" : r.onHand < r.reorder ? "Below reorder" : "In stock";

/** Inventory › Stock — MasterDetail with a location Tree and a stock DataGrid. */
export function StockPage() {
  const [loc, setLoc] = useState("pnq");
  const [expanded, setExpanded] = useState(new Set(["all", "pnq"]));

  const columns: Column<StockRow>[] = [
    { key: "sku", header: "SKU", width: 110, mono: true, sortable: true, hideable: false },
    { key: "name", header: "Product", width: 250, sortable: true },
    { key: "bin", header: "Bin", width: 96, mono: true },
    { key: "onHand", header: "On hand", width: 96, align: "end", sortable: true, render: (r) => <>{r.onHand.toLocaleString("en-IN")}{r.uom && <span className="u-muted"> {r.uom}</span>}</> },
    { key: "reserved", header: "Reserved", width: 92, align: "end" },
    { key: "available", header: "Available", width: 96, align: "end", sortable: true, sortValue: (r) => r.onHand - r.reserved, render: (r) => <span className={r.onHand - r.reserved <= 0 ? "k-text-error" : undefined}>{(r.onHand - r.reserved).toLocaleString("en-IN")}</span> },
    { key: "reorder", header: "Reorder pt.", width: 100, align: "end", secondary: true, edit: { kind: "number", getValue: (r) => String(r.reorder), onCommit: () => undefined } },
    { key: "value", header: "Value", width: 120, align: "end", sortable: true, sortValue: (r) => r.onHand * r.cost, render: (r) => formatINR(r.onHand * r.cost) },
    { key: "status", header: "Status", width: 150, render: (r) => { const s = statusOf(r); return <Status tone={s === "In stock" ? "success" : s === "Below reorder" ? "warning" : "danger"}>{s}</Status>; } },
  ];

  return (
    <PageLayout
      variant="fill"
      breadcrumb={[{ label: "Home", href: "/" }, { label: "Inventory" }, { label: "Stock" }]}
      title="Stock on hand"
      description="Quantities update as receipts, deliveries and transfers are posted. Valuation: moving average."
      actions={<><Button icon="sliders">Adjust stock</Button><Button variant="primary" icon="transfer">New transfer</Button></>}
    >
      <DocumentFlow compact label="Inventory flow, today" steps={stepsFor(PROCESSES.inventory, 1, { 0: "6 POs due this week", 1: "3 awaiting put-away", 3: "17 below reorder point", 4: "2 in transit", 5: "1 awaiting approval" })} />
      <MasterDetail master={<Tree nodes={LOCATIONS} label="Warehouses and locations" selected={loc} expanded={expanded} onSelect={setLoc} onToggle={(id) => setExpanded((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; })} />}>
        <DataGrid
          id="inventory.stock"
          label="Stock at selected location"
          rows={STOCK}
          columns={columns}
          rowKey={(r) => r.sku}
          selectable
          fill
          stickyFirstColumn={false}
          rowAttention={(r) => r.onHand - r.reserved <= 0}
          bulkActions={[{ label: "Transfer", onAction: () => undefined }, { label: "Create purchase request", onAction: () => undefined }]}
          toolbar={<strong className="k-text-subsection">Pune Main · PNQ-01</strong>}
        />
      </MasterDetail>
    </PageLayout>
  );
}
