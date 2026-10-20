import type { NavModule } from "@layouts/index";

export { StockPage } from "./StockPage";

export const inventoryModule: NavModule = {
  id: "inventory",
  label: "Inventory",
  icon: "box",
  items: [
    { id: "products", label: "Products", href: "#/inventory/products" },
    { id: "warehouses", label: "Warehouses", href: "#/inventory/warehouses" },
    { id: "stock", label: "Stock", href: "#/inventory/stock" },
    { id: "transfers", label: "Transfers", href: "#/inventory/transfers" },
    { id: "adjustments", label: "Adjustments", href: "#/inventory/adjustments" },
  ],
};
