# Prism Dashboards — Fluent dashboards

Static, dashboards-only set modelled on the CRM dashboard reference in `../dashboard/dashboard1.jpg`. Built on the same Fluent shell and chart engine as `../ux-design-fluent-reports`, with a violet brand.

## Navigation
The sidebar's **Main menu** has two expandable groups (open/closed state is remembered; the group holding the current page always starts open):
- **Dashboard** → Dashboard 1, Dashboard 2
- **Reports** → All reports, plus the eight reports below

## Dashboards
- `index.html` Dashboard 1: the large dashboard in the reference image. Total employees, leave, new employees and happiness KPIs; working format, project employment, total applications, staff turnover and recruitment progress.
- `dashboard2.html` Dashboard 2: customers and revenue, combining elements from the smaller reference dashboards. Colour tiles, revenue vs target with a recent activity timeline, sales pipeline, leads by source, quarter goal gauge, top accounts and revenue by channel.

## Reports
- `reports.html`: report gallery with key figures for each report and the source image (`../dashboard/dashboard1.jpg`)
- `workforce.html`: headcount by department, hiring funnel, attrition, tenure, working format trend, leave and open roles
- `hospital.html`: consultation, lab, staff and bed tiles; outpatients vs inpatients, patient satisfaction, patients and waiting time by division, doctors on duty
- `projects.html`: overall progress gauge, project stages, launch countdown, revenue vs target, budget, overdue tasks, hours
- `education.html`: students and fees KPIs, revenue report, upcoming events, attendance by grade, complaints, faculty
- `ecommerce.html`: revenue, orders, returns and AOV; income vs expense, monthly sales, profit by channel, popular products, reviews
- `sales.html`: pipeline KPIs, pipeline pyramid, leads by source, top performer, sales analytics, revenue by region, recent deals
- `analytics.html`: project status rings, revenue vs target (bar + line), recent activity, daily orders, sales by channel
- `production.html`: store status, sales, profit and revenue; sales overview, production by unit, plant productivity heatmap, order overview

## Assets
- `tokens.css`, `components.css`, `core.js`, `admin.css`, `admin.js`, `reports.css`: Fluent tokens, components, shell and chart palette (from Prism Reports)
- `dashboards.css`: violet brand tokens (light / dark / high contrast) and the dashboard blocks: delta KPIs, colour tiles, icon KPIs, share bars, rings, timeline, events, project stages, brand cards, mini stats, reviews
- `charts.js`: the Prism Reports chart engine plus `gauge`, `pyramid`, combo bars (`"line": true` series) and `.rng` progress rings

## Adding a chart
```html
<figure class="vz" data-type="gauge" aria-label="Overall progress">
  <script type="application/json">{"v":76,"max":100,"unit":{"suf":"%"},"label":"complete","c":7}</script>
</figure>
<div class="rng" data-v="62" data-c="--s4" role="img" aria-label="62% of target"></div>
```
`data-slice` makes a monthly chart follow the page's 3M / 6M / 12M control. Every chart gets a legend (2+ series), tooltips and a table view with CSV download.
