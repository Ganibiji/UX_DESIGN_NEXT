# Ledger Admin (Fluent)

A static admin template built on the Fluent-inspired implementation from `../ux-design-fluent-lab`.
Open `index.html`. Every page is plain HTML you can copy; no build step is needed to use it.

## Pages
- index — Dashboard
- analytics — Analytics
- users — Users list (search, status tabs, selection, bulk actions, add-user drawer)
- user-detail — User profile with tabs
- roles — Roles and permission matrix
- orders — Orders list with status tabs
- order-detail — Order with progress stepper, items, refund dialog
- invoices — Invoices with overdue alert and create dialog
- tasks — Kanban board (drag and drop or arrow buttons)
- calendar — Month view and agenda
- notifications — Notification centre
- reports — Report library and chart
- audit-log — Security events
- settings — Profile, security, notifications, billing, API keys
- components — UI kit reference
- login — Sign-in page
- 404 — Error page

## Assets
- `assets/tokens.css` — Fluent tokens (light, dark, high contrast)
- `assets/components.css` — Fluent component styles (`ds-*`, `dx-*` classes)
- `assets/admin.css` — admin shell and layout
- `assets/core.js` — component behaviour: menus, selects, dialogs, drawers, toasts, tabs, sorting, calendar
- `assets/admin.js` — theme switch, navigation, table search and filters, bulk selection, form validation, kanban

Every page has `<body class="sys-f" data-k="f">`; keep it so tokens and behaviours apply.
Sample data is fictional. Theme and navigation state are saved in the browser only.
