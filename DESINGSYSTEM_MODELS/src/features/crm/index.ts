import type { NavModule } from "@layouts/index";

export { AccountsPage } from "./AccountsPage";
export { AccountForm } from "./AccountForm";
export * from "./data";

export const crmModule: NavModule = {
  id: "crm",
  label: "CRM",
  icon: "users",
  items: [
    { id: "leads", label: "Leads", href: "#/crm/leads", count: 12 },
    { id: "accounts", label: "Accounts", href: "#/crm/accounts" },
    { id: "contacts", label: "Contacts", href: "#/crm/contacts" },
    { id: "opportunities", label: "Opportunities", href: "#/crm/opportunities" },
    { id: "activities", label: "Activities", href: "#/crm/activities" },
    { id: "campaigns", label: "Campaigns", href: "#/crm/campaigns" },
  ],
};
