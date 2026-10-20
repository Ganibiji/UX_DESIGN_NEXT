# Prism Reports — Fluent report dashboards

Static, multi-page report dashboards built on the same Fluent shell and components as `../ux-design-fluent-admin`.

## Pages
- `index.html`: executive overview with the hero metric, KPIs, segment revenue, highlights and the report gallery
- `revenue.html`: revenue & finance. MRR by plan, movement, regional mix and the quarterly P&L.
- `sales.html`: sales pipeline. Funnel conversion, bookings, rep performance and open deals.
- `marketing.html`: marketing performance. Leads by channel, traffic, acquisition cost and campaigns.
- `product.html`: product usage. Active users, cohort retention, feature adoption and platforms.
- `customers.html`: customer health. NPS, satisfaction drivers, account health and churn reasons.
- `operations.html`: support & operations. Ticket flow, priority mix, busy hours and SLA by team.
- `people.html`: people & hiring. Headcount, hiring funnel, attrition and tenure.
- `regions.html`: regional performance. Revenue by country, indexed growth and regional win rates.
- `palette.html`: chart palette (categorical, sequential, diverging, status), validation results and chart rules

## Assets
- `tokens.css`, `components.css`, `core.js`, `admin.css`, `admin.js`: Fluent tokens, components and shell (from the admin template)
- `reports.css`: chart palette as CSS custom properties (light / dark / high contrast) and the report layouts
- `charts.js`: dependency-free SVG chart engine: line, bar (grouped or stacked), horizontal bar (funnel, diverging, stacked), donut, heatmap and tile map

## Adding a chart
```html
<figure class="vz" data-type="line" data-h="260" data-slice aria-label="Revenue">
  <script type="application/json">{"x":["Jan","Feb"],"series":[{"name":"Revenue","v":[10,12]}],"unit":{"pre":"$"}}</script>
</figure>
```
`data-slice` makes the chart follow the page's 3M / 6M / 12M range control. Every chart gets a legend (2+ series), tooltips, keyboard reading (arrow keys), and a table view with CSV download.
