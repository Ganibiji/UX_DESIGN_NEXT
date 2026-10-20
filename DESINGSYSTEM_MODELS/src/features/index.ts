// Module registry: navigation is assembled from feature manifests, so adding
// a module never means editing the shell.
import { crmModule } from "./crm";
import { salesModule } from "./sales";
import { procurementModule } from "./procurement";
import { inventoryModule } from "./inventory";
import { financeModule } from "./finance";
import { reportsLink } from "./reports";
import { administrationLink } from "./administration";

export const NAV = {
  work: [
    { id: "dashboard", label: "Dashboard", icon: "grid", href: "#/dashboard" },
    { id: "approvals", label: "My approvals", icon: "inbox", href: "#/approvals", attention: 4 },
    { id: "tasks", label: "My tasks", icon: "check-square", href: "#/tasks", count: 7 },
  ],
  modules: [crmModule, salesModule, procurementModule, inventoryModule, financeModule],
  utility: [reportsLink, administrationLink],
};
