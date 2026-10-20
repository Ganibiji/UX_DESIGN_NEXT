# Ledger Admin 2 (Fluent, enterprise)

An advanced enterprise admin template. It extends `../ux-design-fluent-admin` (Ledger Admin v1) and uses the Fluent-inspired tokens and components from `../ux-design-fluent-lab`.
Open `index.html`. Every page is static HTML; behaviour lives in `assets/admin.js` (shell) and `assets/enterprise.js` (enterprise features).

## Enterprise features
- Organization (tenant) switcher with sandbox / staging warning bar
- Command palette (Ctrl+K), keyboard shortcuts (?, G then D/U/A/R/S), compact mode, light / dark / high contrast
- Customisable dashboard: reorder (drag or arrow buttons), hide and restore widgets, saved per browser
- Users data grid: 64 users, sorting, paging, search, saved views, column chooser, condition-based filter builder, inline role editing with undo, bulk actions, CSV export, quick-view drawer
- Approvals inbox with live SLA timers, bulk approve, reject with required reason, delegation and approval chain
- Access control: role inheritance, permission matrix, field-level access, time-bound access requests, access reviews
- Workflow builder: trigger, conditions and actions with a live plain-language summary, test run, enable / disable, undoable delete
- Data import wizard: CSV upload (real parsing) or sample file, column mapping, validation preview, import progress
- Report builder: metric × breakdown × chart type with live chart and table, scheduling
- Audit log with before / after change diffs
- Security center: live security score, policies, IP allowlist with CIDR validation, sessions, timeout warning preview
- Integrations: webhook endpoints, delivery log with retry, test events, API keys with scopes (shown once)
- Feature flags per environment with rollout percentages
- Billing & usage metering, compliance (data subject requests, retention, legal holds), system status with 90-day uptime
- Organization settings: SAML SSO test, SCIM token, region and currency formatting (Intl), brand colour, session policy
- Sign-in with two-step verification (any 6 digits work in the demo)

All data is fictional. Preferences and saved items are stored in this browser only.
