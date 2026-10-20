import type { NavModule } from "@layouts/index";

export { SalesOrderPage, CancelOrderModal } from "./SalesOrderPage";
export { SalesDashboard } from "./SalesDashboard";

export const salesModule: NavModule = {
  id: "sales",
  label: "Sales",
  icon: "receipt",
  items: [
    { id: "quotations", label: "Quotations", href: "#/sales/quotations" },
    { id: "orders", label: "Sales Orders", href: "#/sales/orders" },
    { id: "invoices", label: "Invoices", href: "#/sales/invoices" },
    { id: "payments", label: "Payments", href: "#/sales/payments" },
  ],
};
