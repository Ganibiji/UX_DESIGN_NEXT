import { useEffect, useState } from "react";
import { EmptyState, ToastProvider, Button } from "@ui/index";
import { AppShell } from "@layouts/index";
import { NAV } from "@features/index";
import { AccountForm, AccountsPage } from "@features/crm";
import { SalesDashboard, SalesOrderPage } from "@features/sales";
import { PurchaseRequestPage } from "@features/procurement";
import { StockPage } from "@features/inventory";

/** Minimal hash router — the product uses the platform router; this keeps the demo dependency-free. */
function useHashRoute() {
  const read = () => window.location.hash.replace(/^#\/?/, "") || "dashboard";
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const on = () => setRoute(read());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  const go = (href: string) => { window.location.hash = href.replace(/^#/, ""); };
  return { route, go };
}

const CURRENT: Record<string, string> = {
  dashboard: "dashboard",
  approvals: "approvals",
  "crm/accounts": "crm.accounts",
  "crm/accounts/new": "crm.accounts",
  "sales/orders": "sales.orders",
  "procurement/requests": "procurement.requests",
  "inventory/stock": "inventory.stock",
};

export function App() {
  const { route, go } = useHashRoute();

  const page = (() => {
    switch (route) {
      case "dashboard": return <SalesDashboard />;
      case "crm/accounts": return <AccountsPage onOpen={() => go("#/sales/orders")} onCreate={() => go("#/crm/accounts/new")} />;
      case "crm/accounts/new": return <AccountForm onDone={() => go("#/crm/accounts")} />;
      case "sales/orders": return <SalesOrderPage />;
      case "approvals":
      case "procurement/requests": return <PurchaseRequestPage />;
      case "inventory/stock": return <StockPage />;
      default:
        return (
          <div className="k-page"><div className="k-state-page">
            <EmptyState icon="file" title="This screen isn’t in the demo" actions={<Button onClick={() => go("#/dashboard")}>Go to dashboard</Button>}>
              The full static prototype in <code>site/</code> covers more screens and states.
            </EmptyState>
          </div></div>
        );
    }
  })();

  return (
    <ToastProvider>
      <AppShell
        nav={NAV}
        current={CURRENT[route] ?? route.replace("/", ".")}
        onNavigate={go}
        createItems={[
          { type: "label", label: "Recently used" },
          { label: "Account", icon: "building", shortcut: "Alt N", onSelect: () => go("#/crm/accounts/new") },
          { label: "Quotation", icon: "receipt", onSelect: () => undefined },
          { type: "separator" },
          { label: "Purchase request", icon: "truck", onSelect: () => undefined },
          { label: "Stock transfer", icon: "transfer", onSelect: () => undefined },
        ]}
      >
        {page}
      </AppShell>
    </ToastProvider>
  );
}
