import type { NavModule } from "@layouts/index";

// Not enabled for this tenant. Kept as a manifest so navigation, permissions
// and routing are wired the same way as every other module when it is.
export const hrModule: NavModule = {
  id: "hr",
  label: "People",
  icon: "user",
  items: [
    { id: "employees", label: "Employees", href: "#/hr/employees" },
    { id: "leave", label: "Leave", href: "#/hr/leave" },
  ],
};
