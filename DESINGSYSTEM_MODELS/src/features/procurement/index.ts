import type { NavModule } from "@layouts/index";

export { PurchaseRequestPage } from "./PurchaseRequestPage";

export const procurementModule: NavModule = {
  id: "procurement",
  label: "Procurement",
  icon: "truck",
  items: [
    { id: "suppliers", label: "Suppliers", href: "#/procurement/suppliers" },
    { id: "requests", label: "Purchase Requests", href: "#/procurement/requests", count: 3 },
    { id: "orders", label: "Purchase Orders", href: "#/procurement/orders" },
    { id: "receipts", label: "Goods Receipts", href: "#/procurement/receipts" },
  ],
};
