# Kestrel Design System

Enterprise design system for **Kestrel Business Suite**, an ERP + CRM product used by
accountants, sales managers, buyers and warehouse operators. HTML + SCSS + CSS custom
properties, with a React + TypeScript layer that maps 1:1 to the same class names.
No utility framework.

> All companies, people and figures in the prototypes are fictional.

## Run it

```bash
npm install
npm run build:css     # styles/ → dist/kestrel.css (+ .min.css)
```

**Static prototypes** — open `site/index.html` in a browser (no server needed). It is the
design-system reference and links to every screen.

**React demo** — `npm run dev`, then open the printed URL (hash routes such as
`#/crm/accounts`, `#/sales/orders`, `#/procurement/requests`, `#/inventory/stock`).

`npm run build` compiles the CSS, typechecks (strict) and builds the demo into `dist-app/`.

Review links: append `?theme=dark` and/or `?density=compact` to any `site/` page.

## What’s here

| Screen (`site/`) | Pattern | Demonstrates |
|---|---|---|
| `index.html` | Reference | Principles, live tokens, type, spacing, density, every component with its state matrix, status vocabulary, responsive rules, accessibility, architecture |
| `dashboard.html` | Dashboard | KPI → trend → operational → detail; one filter row; SVG chart with tooltip + table view |
| `customers.html` | CRUD list | Saved views, filter tags, sort / Shift multi-sort, resize, drag-reorder, column visibility, inline edit + undo, bulk bar, archive confirm + undo, no-results |
| `customer-new.html` (`?mode=edit`) | Create / edit | Sections, 3-col grid, conditional fields, derived values (PIN → city, GSTIN → PAN), validation + error summary, duplicate hint, sticky save state, discard guard |
| `account.html` | CRM 360 | Overview, contacts, opportunities, orders, invoices, activities, documents, notes, timeline |
| `sales-order.html` | Detail + approval | Sticky record header, key facts, document flow, decision bar, expandable lines, tax summary, field-level audit, typed-confirmation cancel, mobile action bar |
| `pipeline.html` | Kanban | Drag or Alt+←/→ to move, stage totals, stale deals, mandatory loss reason, undo |
| `purchase-request.html` | Approval workflow | Procure-to-pay flow, rule-based approval chain, budget check, approve + undo, reject / request changes |
| `stock.html` | Master–detail | Location tree (keyboard), availability-driven status, inventory flow, adjustment drawer |
| `states.html` | UX states | Loading, empty, no results, no permission, error, partial, offline, success, warning, unsaved, session expired, merged record |

## Structure

```
styles/
  tokens/        primitives · spacing · typography · shape · motion · z-index · density · layout · breakpoints
  themes/        _light · _dark          → [data-theme="light|dark"], OS preference when unset
  abstracts/     mixins: focus ring, truncate, breakpoints, floating surface
  foundations/   reset, base, typography roles, icons, skip link
  components/    button · field · choice · status · navigation · menu · pickers · overlay · feedback · table · data-display · business
  layouts/       app-shell · header · sidebar · page
  patterns/      filters · form · dashboard · states
  utilities/     layout glue only
  main.scss
src/
  ui/            Button Input Select Modal Drawer Table DataGrid Tabs Badge Form DatePicker (+ Dropdown, EmptyState, Toast, Icon)
  layouts/       AppShell Sidebar Header PageLayout
  patterns/      CrudPage DetailPage MasterDetail Approval Workflow Dashboard
  features/      crm sales procurement inventory finance hr reports administration (module manifests build the nav)
  app/           demo entry
site/            static reference screens + assets (icons.js sprite, app.js behaviours, boot.js prefs)
```

Theme and density are attribute-scoped, so any subtree can switch:
`<html data-theme="dark" data-density="compact">`.

## Decisions worth knowing

- **One brand colour, colour only for meaning.** Status, validation, the primary action and
  the current location. Modules, rows and categories are never colour-coded.
- **Status is quiet and shaped.** Marker + text, no pill. Each tone has a distinct marker
  shape (ring, dot, half, triangle, diamond, dash), so meaning never relies on colour alone.
  The tinted “strong” badge is reserved for record headers. `STATUS_TONES` in
  `src/ui/Badge` keeps “Pending” identical across modules.
- **Panels, not cards.** Page regions are flat bordered panels; cards exist only for things
  users move or pick (Kanban). Forms use sections separated by rules.
- **13px body, 22px max title.** Large type is reserved for KPI figures.
- **Dark theme is designed, not inverted.** Surfaces lighten as they rise; shadows give way
  to hairline borders; status hues are desaturated; the primary button is a deeper blue
  because a lighter one fails contrast with white text.
- **Undo over confirm.** Confirmation dialogs only for irreversible actions, and they state
  the consequences. Cancelling a posted order needs typed confirmation.
- **Row actions are always visible** (muted, sticky last column) — hover-only actions don’t
  exist for touch or keyboard users.
- **Dates are always `DD MMM YYYY`**, money uses Indian grouping (₹8,45,000) with tabular
  figures, dashboards use L / Cr.
- **Header shows the environment** (UAT) so nobody edits test data thinking it’s production.
- **“Chart of Accounts”**, not “Accounts”, in Finance — avoids a collision with CRM Accounts.

## Accessibility

WCAG 2.2 AA target: ≥ 4.5:1 text contrast in both themes, ≥ 3:1 input borders, one visible
focus ring, native `<dialog>` for modals/drawers, real tables with `aria-sort`, ARIA
menu/tabs/tree/combobox keyboard patterns, keyboard alternative to drag (WCAG 2.5.7),
24px minimum targets (36px on touch), reduced-motion and forced-colors support.
