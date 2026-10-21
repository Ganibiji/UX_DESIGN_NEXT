# Analytics (v5) — colour-forward reporting workspace

Version 5 (copied from `../ux-design-fluent-reports4`) adds a vivid, coordinated colour system on top of the v4 product shell:
- **Module colours**: Home indigo→violet, Dashboards blue, Business violet→fuchsia, Charts pink→orange, Layouts amber, Builder teal→sky, Libraries orange→rose, Design emerald. Each module colours its rail icon, section panel and page banner.
- **Gradient page banners** holding breadcrumbs, title, live status, actions and section tabs; gradient frame and colour glows on the canvas.
- **Vivid KPI cards**, each in its own palette hue (tinted gradient, coloured icon chip, matching sparkline); the selected KPI fills with colour.
- **New categorical palette** (indigo, rose, sky, amber, purple, emerald, orange, pink), validated for colour-blind separation in light (worst adjacent ΔE 11.5) and dark (ΔE 10.0); indigo sequential ramp; indigo↔rose diverging pair.
- **Gradient-filled bars and areas** in all three engines, coloured chart-type chips, coloured insights, activity, table status pills and product initials, gradient primary buttons and active filter pills.
- Light, dark (deep navy, dimmed banners) and high contrast (colour layer switched off) all supported.

## Earlier: Analytics (v4) — product-grade Fluent reporting workspace

Version 4 of the Reports & Analytics showcase (copied from `../ux-design-fluent-reports3`) redesigned to feel like a real analytics product rather than a component catalog.

## What changed in v4
- **App frame**: dark top bar and module rail (Home, Dashboards, Business, Charts, Layouts, Builder, Libraries, Design) with a contextual section panel — filterable, grouped, with **pinned** (☆ next to any page title) and **recent** pages. The panel collapses (`[`) and becomes a drawer on tablets and phones.
- **Command palette** (`Ctrl K`, `/` or the search bar): jump to any page, switch chart engine or theme, refresh, open filters, create a report.
- **Workspace switcher** (company and financial year) and an **Export** menu (PDF, slides, Excel, scheduled e-mail, alerts).
- **Page header**: pin star, live “updated n min ago” status, demo-data tag, refresh, share, export, and **section tabs** that track your scroll position.
- **Filter pills** with popovers, a **Compare** pill (previous period, last year, plan, none) that relabels every KPI, active-filter chips and reset.
- **KPI strip**: one surface with dividers, count-up values, delta pills and sparklines. On flagship dashboards a KPI switches the main chart.
- **Chart views**: switch metrics inside a chart card (Revenue / Orders / Profit); actions appear on hover; skeleton while loading; grey comparison series.
- **Insights panel** on Executive, Sales and Inventory: anomalies and wins with *Show in chart*, which scrolls to and highlights the chart.
- **Home** is an app home: greeting, KPI strip, pinned dashboards, an inbox of things needing attention, live trend and recent activity.
- Refined tokens: layered neutrals, softer elevation, 10px card radius, display type for headings, dark-mode surfaces tuned for the frame.

# Reports & Analytics — Fluent enterprise reporting design system

A standalone HTML/CSS/JS showcase of enterprise ERP/CRM reporting: dashboards, chart galleries, layout combinations, a report builder, a chart-library comparison and the design system behind them. Open `index.html` in a browser — no server or build step is needed to view it. All figures are **illustrative sample data** for a fictional Indian manufacturer-distributor (Oct 2025 – Sep 2026).

## Three chart engines, one spec
Every chart is declared once as a neutral JSON spec and drawn by **Apache ECharts 5.5.1**, **Highcharts 11.4.8** or **Chart.js 4.4.4**. Switch engines in the header (or add `?engine=highcharts` to any URL); every chart re-renders. When an engine has no native form for a type (for example candlestick in Highcharts core or box plot in Chart.js), ECharts draws that card and its badge says “fallback”. Libraries are vendored in `assets/vendor/` and load on demand.

> Highcharts is free for non-commercial use only; commercial use requires a licence. ECharts (Apache-2.0) and Chart.js (MIT) are free.

## What’s inside (62 pages)
| Area | Pages |
|---|---|
| Dashboards | `dashboards/` executive, operations, management, KPI, custom (reorder / resize / remove / add widgets) |
| Business dashboards | inventory, sales, procurement, finance, customers (CRM), HR, projects, supply chain, plant operations |
| Chart galleries | `reports/` pie, bar, column, line, area, combo, scatter, bubble, radar, funnel, gauge, heatmap, treemap, waterfall, sankey, box plot, histogram, candlestick, mixed — each with variants, a permutation explorer and a permutation matrix |
| Layouts | `layouts/` 15 combinations (single, two/three column, grid, KPI + chart, chart + table, dashboard grid, executive summary, layouts A/B/C/E, master–detail, small multiples, wallboard) plus a gallery |
| Report builder | `report-builder/` drag/drop, move, resize, duplicate, delete, undo/redo, data source, metric, dimension, aggregation, filters, grouping, sorting, top N, calculated fields, format, export (PDF, PNG, CSV, JSON); hash routes `#create #edit #filters #data-source #visualization #grouping #sorting #calculations #export` |
| Chart library | `libraries/` comparison (10 criteria), native-support matrix, same spec in three engines, one showcase per engine |
| Design system | `design-system/` colors, typography, components (buttons, inputs, dropdowns, tabs, breadcrumbs, badges, tooltips, modals, drawers), cards, KPI cards (11 variants), filters (toolbar, inline, collapsible panel, drawer, dialog), tables, legends & tooltips, empty/loading/error states |

## Interaction model
- **Every chart card**: title opens *Chart details* (type, source, metrics, dimensions, filters, sort, aggregation, colors, legend, tooltip — editable), engine badge, full screen, and a ⋮ menu with View data, Filter, Drill down, Reset zoom, Export PNG, Export CSV, Copy spec, Full screen.
- **Filters**: date range in the header and page filter bars; filters, cross-filter clicks (charts marked with a dimension) and drill-down (click a slice/bar that has detail) all re-render the page. Refreshes dim the previous render instead of flashing skeletons.
- **Tables**: search, status filter, sort, pagination, column chooser, column resize (drag or keyboard), sticky header and first column, grouping with subtotals and expand/collapse, totals, selection, row actions, CSV export.
- **Shell**: collapsible sidebar with search, nested groups, badges and icon-only rail with flyouts (drawer on tablets/phones); header search, date range, engine switch, refresh, notifications, help, theme (Light / Dark / High contrast / System) and account menus. Keyboard: `/` search, `[` toggle navigation, `?` shortcuts.

## Design decisions
- Fluent 2 neutrals, blue brand, type ramp and elevation; 8px spacing; 4px controls, 6px cards.
- Data colors use one CVD-validated categorical order (worst adjacent ΔE 9.1 light / 8.4 dark), a blue sequential ramp, a blue↔red diverging pair and a separate status palette that always pairs with icon + label.
- Combo charts with different units use **stacked panels on a shared time axis** instead of dual y-axes; the combo gallery shows the indexed alternative too.
- Legends appear for two or more series; every chart has a table view (View data).

## Structure
```
index.html                      home
dashboards/ reports/ layouts/   generated pages
report-builder/ libraries/ design-system/
assets/css/tokens.css           theme tokens (light, dark, high contrast) + data-viz palette
assets/css/app.css              shell, components, layouts
assets/js/core.js               shell, theme, engine loading, filters, menus, dialogs, drawers, toasts
assets/js/charts.js             spec → ECharts / Highcharts / Chart.js adapters, chart card, explorer
assets/js/table.js              enterprise report table
assets/js/builder.js            report builder
assets/js/custom.js layouts.js ds.js   page-specific behaviour
assets/vendor/                  echarts, highcharts (+ modules), chart.js (+ plugins)
assets/icons/fluent/            Fluent UI System Icons (MIT), inlined as a sprite
tools/                          Python generator for every page
```

## Editing pages
Pages are generated so the shell, navigation and data stay consistent:
```
python tools/build.py
```
Page content lives in `tools/pages_dash.py` (dashboards), `tools/pages_reports.py` (galleries) and `tools/pages_misc.py` (layouts, builder, libraries, design system, home); shared shell and components in `tools/lib.py`. A chart is one call:
```python
cc('Revenue by region', 'Click a region to cross-filter',
   {'type': 'column', 'categories': REGIONS, 'unit': INR, 'dim': 'region',
    'series': [S('Revenue', REGION_REV)]}, h=280, span='s-6')
```
