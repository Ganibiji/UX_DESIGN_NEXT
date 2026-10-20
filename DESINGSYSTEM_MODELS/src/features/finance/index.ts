import type { NavModule } from "@layouts/index";

// Screens follow the CrudPage / DetailPage patterns (Receivables = Accounts list
// with ageing columns; Banking = MasterDetail of bank accounts → statement lines).
// "Accounts" is labelled "Chart of Accounts" to avoid clashing with CRM Accounts.
export const financeModule: NavModule = {
  id: "finance",
  label: "Finance",
  icon: "landmark",
  items: [
    { id: "coa", label: "Chart of Accounts", href: "#/finance/coa" },
    { id: "receivables", label: "Receivables", href: "#/finance/receivables" },
    { id: "payables", label: "Payables", href: "#/finance/payables" },
    { id: "banking", label: "Banking", href: "#/finance/banking" },
  ],
};
