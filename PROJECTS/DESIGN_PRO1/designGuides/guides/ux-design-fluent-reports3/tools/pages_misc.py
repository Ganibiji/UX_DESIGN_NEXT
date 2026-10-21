"""Layouts (15 combinations), report builder, chart libraries, design system and home."""
from lib import *
from pages_dash import S, REV, REV_LY, ORDERS, REGION_REV, CAT_SALES, PRODUCTS, PROD_REV, unit_rows, INV_STATUS, tilemap_spec

LAY = ('Report layouts', 'layouts/index.html')

# ------------------------------------------------------------------ reusable chart blocks for layouts
def c_rev(span='s-8', h=300, t='Revenue trend'):
    return cc(t, 'Monthly revenue vs last year', {'type': 'line', 'categories': M12, 'unit': INR, 'smooth': True, 'zoom': True, 'series': [S('This year', REV, type='area'), S('Last year', REV_LY, dashed=True, c=8)]}, h=h, span=span)
def c_reg(span='s-6', h=260):
    return cc('Sales by region', 'Click a region to cross-filter', {'type': 'column', 'categories': REGIONS, 'unit': INR, 'labels': True, 'dim': 'region', 'series': [S('Revenue', REGION_REV)]}, h=h, span=span)
def c_cat(span='s-6', h=260):
    return cc('Sales by category', 'Revenue share', {'type': 'pie', 'donut': True, 'unit': INR, 'labels': False, 'centerLabel': 'Revenue', 'data': [{'name': c, 'value': v} for c, v in zip(CATS, CAT_SALES)]}, h=h, span=span)
def c_prod(span='s-6', h=260):
    return cc('Top products', 'Revenue, top 6', {'type': 'bar', 'categories': PRODUCTS[:6], 'unit': INR, 'labels': True, 'series': [S('Revenue', PROD_REV[:6])]}, h=h, span=span)
def c_inv(span='s-6', h=260):
    return cc('Inventory by warehouse', 'Stock value', {'type': 'column', 'categories': WHS, 'unit': INR, 'labels': True, 'series': [S('Stock value', [2.41e7, 1.96e7, 1.72e7, 1.12e7, .99e7])]}, h=h, span=span)
def c_proc(span='s-6', h=260):
    return cc('Procurement spend', 'PO value by month', {'type': 'column', 'categories': M12, 'unit': INR, 'series': [S('PO value', trend(4.4e6, 6.1e6, seed=63, season=SEASON))], 'c': 2}, h=h, span=span)
def c_fin(span='s-6', h=260):
    return cc('Cash flow bridge', 'This quarter', {'type': 'waterfall', 'unit': INR, 'labels': False, 'categories': ['Opening', 'Collections', 'Payments', 'Payroll', 'Capex', 'Closing'], 'data': [3.2e7, 9.8e7, -7.1e7, -1.6e7, -.9e7, {'total': True}]}, h=h, span=span)
def c_fun(span='s-4', h=260):
    return cc('Sales funnel', 'This quarter', {'type': 'funnel', 'palette': 'ordinal', 'conv': True, 'data': [{'name': n, 'value': v} for n, v in [('Leads', 2960), ('Qualified', 1420), ('Quoted', 820), ('Won', 486)]]}, h=h, span=span)
def c_gauge(span='s-4', h=260):
    return cc('OTIF', 'On time in full', {'type': 'gauge', 'value': 92.6, 'unit': PCT, 'label': 'OTIF', 'bands': [[85, 'crit'], [92, 'warn'], [100, 'good']]}, h=h, span=span)
def c_heat(span='s-4', h=260):
    return cc('Dispatch load', 'Weekday × hour', {'type': 'heatmap', 'x': [f'{h_}' for h_ in range(8, 20, 2)], 'y': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], 'labels': False, 'data': [[x, y, 20 + (x * 7 + y * 11) % 38] for y in range(5) for x in range(6)]}, h=h, span=span)
def c_orders(span='s-4', h=260):
    return cc('Orders', 'Per month', {'type': 'column', 'categories': M12, 'series': [S('Orders', ORDERS)]}, h=h, span=span)
def k4():
    return kpis(kpi('Revenue', 12.4e7, INR, '18.4%', sub='vs last year', spark=[round(v / 1e6, 1) for v in REV]), kpi('Orders', 4820, CNT, '12.2%', sub='vs last year', spark=ORDERS),
                kpi('Customers', 18420, CNT, '6.3%', sub='active'), kpi('Profit', 2.8e7, INR, '4.1%', good=False, up=False, sub='EBITDA'))
def tbl(n=10, title='Inventory detail'):
    return dtable({'caption': title, 'noun': 'SKUs', 'pageSize': n, 'statusMap': INV_STATUS, 'columns': [{'key': 'product', 'label': 'Product', 'type': 'prod', 'w': 220}, {'key': 'category', 'label': 'Category', 'group': True}, {'key': 'warehouse', 'label': 'Warehouse', 'group': True},
                   {'key': 'value', 'label': 'Value', 'type': 'inr', 'agg': 'sum'}, {'key': 'growth', 'label': 'Movement', 'type': 'growth'}, {'key': 'status', 'label': 'Status', 'type': 'status', 'group': True}], 'rows': unit_rows(17)}, title=title, sub='Sorting, grouping, totals and export')

LAYOUTS = [
    ('single', 'Single Chart', 'One chart gets the whole canvas — for deep dives and presentations.', [('c', 12, 5)],
     lambda: grid(c_rev('s-9', 420, 'Revenue trend — deep dive'), card('Insights', '<ul class="lst">' + ''.join(f'<li><div class="lst__m"><b>{a}</b><span>{b}</span></div></li>' for a, b in [('Festive peak in December', '+9% over the seasonal norm'), ('Gap to last year widened from March', 'Distributor price revision'), ('September is a record month', '₹1.24 Cr, 23% above last September')]) + '</ul>', sub='Written by the analyst', span='s-3'))),
    ('two-column', 'Two Column', 'Pairs of related charts side by side; collapses to one column on tablets.', [('c', 6, 2), ('c', 6, 2), ('c', 6, 2), ('c', 6, 2)],
     lambda: grid(c_reg(), c_cat(), c_prod(), c_inv())),
    ('three-column', 'Three Column', 'Three peers per row for compact comparisons.', [('c', 4, 2)] * 6,
     lambda: grid(c_fun(), c_gauge(), c_heat(), c_orders(), cc('Customer segments', 'Active customers', {'type': 'pie', 'donut': True, 'labels': False, 'data': [{'name': n, 'value': v} for n, v in [('SMB', 11240), ('Mid-market', 4680), ('Enterprise', 1820), ('Government', 680)]]}, h=260, span='s-4'), c_fin('s-4'))),
    ('grid', 'Grid', 'An even 2 × 2 grid — every chart has equal weight.', [('c', 6, 2)] * 4,
     lambda: grid(c_rev('s-6', 280), c_reg('s-6', 280), c_cat('s-6', 280), c_proc('s-6', 280))),
    ('kpi-chart', 'KPI + Chart', 'A KPI rail beside one large chart — the number first, then its story.', [('k', 3, 1), ('c', 9, 4), ('k', 3, 1), ('k', 3, 1), ('k', 3, 1)],
     lambda: grid('<div class="stack s-3">' + kpi('Revenue', 12.4e7, INR, '18.4%', sub='vs last year') + kpi('Orders', 4820, CNT, '12.2%', sub='vs last year') + kpi('Average order', 25726, {'pre': '₹'}, '5.5%', sub='vs last year') + kpi('Margin', 32.6, PCT, '1.2 pts', good=False, up=False, sub='vs last year') + '</div>', c_rev('s-9', 460))),
    ('chart-table', 'Chart + Table', 'The chart summarises; the table below holds the detail it came from.', [('c', 12, 2), ('t', 12, 3)],
     lambda: grid(c_inv('s-12', 280), tbl(8))),
    ('dashboard-grid', 'Dashboard Grid', 'Mixed widths on a 12-column grid: 8 + 4, 4 + 4 + 4, 6 + 6.', [('c', 8, 2), ('c', 4, 2), ('c', 4, 2), ('c', 4, 2), ('c', 4, 2), ('c', 6, 2), ('c', 6, 2)],
     lambda: grid(c_rev('s-8', 280), c_cat('s-4', 280), c_fun(), c_gauge(), c_heat(), c_reg(), c_prod())),
    ('executive-summary', 'Executive Summary', 'Layout D — written summary, KPI row, revenue chart, then one chart per function.', [('x', 12, 1), ('k', 3, 1), ('k', 3, 1), ('k', 3, 1), ('k', 3, 1), ('c', 12, 2), ('c', 6, 2), ('c', 6, 2), ('c', 6, 2), ('c', 6, 2)],
     lambda: card('Executive summary — September 2026', '<ul class="lst">' + ''.join(f'<li>{ic(i)}<div class="lst__m"><b>{a}</b><span>{b}</span></div></li>' for i, a, b in [('arrow_trending_lines', 'Revenue ₹12.4 Cr, up 18.4% on last year', 'Ahead of plan for the third month running; North and West lead.'), ('warning', 'Margin down 1.2 pts to 32.6%', 'Copper prices rose 18% since October; price revision planned for November.'), ('box', 'Inventory at ₹8.7 Cr, 14 SKUs below reorder point', 'Chennai WH-2 accounts for 9 of them.'), ('money', 'DSO at 58 days vs 45 target', 'Three distributor accounts over 90 days.')]) + '</ul>', sub='Prepared by Finance & Ops Analytics · sample data', span='s-12', cls='card--accent')
     + k4() + grid(c_rev('s-12', 280), cc('Sales', 'Revenue by region', {'type': 'column', 'categories': REGIONS, 'unit': INR, 'series': [S('Revenue', REGION_REV)], 'labels': True}, h=240), c_inv('s-6', 240), c_proc('s-6', 240), c_fin('s-6', 240))),
    ('layout-a', 'Layout A — KPI rail', 'Four stacked KPIs on the left; two charts, then a chart and a table.', [('k', 3, 1), ('c', 9, 2), ('k', 3, 1), ('k', 3, 1), ('c', 9, 2), ('k', 3, 1)],
     lambda: grid('<div class="stack s-3">' + kpi('Revenue', 12.4e7, INR, '18.4%') + kpi('Orders', 4820, CNT, '12.2%') + kpi('Customers', 18420, CNT, '6.3%') + kpi('Profit', 2.8e7, INR, '4.1%', good=False, up=False) + '</div>',
                  '<div class="g s-9" style="align-content:start">' + c_reg('s-6', 240) + c_cat('s-6', 240) + c_prod('s-6', 280) + tbl(5, 'Stock detail').replace('card s-12', 'card s-6') + '</div>')),
    ('layout-b', 'Layout B — Hero chart', 'A large chart with two small KPIs beside it, then three charts.', [('c', 8, 2), ('k', 4, 1), ('k', 4, 1), ('c', 4, 2), ('c', 4, 2), ('c', 4, 2)],
     lambda: grid(c_rev('s-8', 300), '<div class="stack s-4">' + kpi('Revenue', 12.4e7, INR, '18.4%', sub='vs last year', spark=[round(v / 1e6, 1) for v in REV]) + kpi('Gross margin', 32.6, PCT, '1.2 pts', good=False, up=False, sub='vs last year', target=(93, 'Target 35%', 'warn')) + '</div>', c_fun(), c_gauge(), c_heat())),
    ('layout-c', 'Layout C — KPI, hero, pair, table', 'Three KPIs, a large chart, a pie and a bar, then the table.', [('k', 4, 1), ('k', 4, 1), ('k', 4, 1), ('c', 12, 2), ('c', 6, 2), ('c', 6, 2), ('t', 12, 2)],
     lambda: kpis(kpi('Revenue', 12.4e7, INR, '18.4%'), kpi('Orders', 4820, CNT, '12.2%'), kpi('Profit', 2.8e7, INR, '4.1%', good=False, up=False), n=3) + grid(c_rev('s-12', 300), c_cat(), c_prod(), tbl(6))),
    ('layout-e', 'Layout E — Side filters', 'A filter panel beside the content: KPI row, 2-column charts, 3-column charts, data table.', [('f', 3, 6), ('k', 3, 1), ('k', 3, 1), ('k', 3, 1), ('c', 4, 2), ('c', 5, 2), ('c', 3, 1), ('c', 3, 1), ('c', 3, 1), ('t', 9, 2)],
     lambda: '<div class="g">' + f'<aside class="side-filters s-3" aria-label="Filters"><h3>Filters</h3>' + ''.join(f'<div class="field"><label for="lf-{d}">{d.title()}</label><select class="select" id="lf-{d}" data-filter="{d}"><option value="All">All</option>{"".join(f"<option>{esc(v)}</option>" for v in DIMS[d])}</select></div>' for d in ('region', 'category', 'warehouse', 'customer')) + f'<div class="field"><span class="lbl">Date range</span><button type="button" class="btn" data-range-menu aria-haspopup="true" aria-expanded="false">{ic("calendar_ltr")}<span data-range-label>Last 30 days</span></button></div><button type="button" class="btn btn--subtle" data-chip-clear>{ic("arrow_reset")}Reset filters</button></aside>'
     + '<div class="stack s-9"><div class="fbar__chips" data-chips></div>' + kpis(kpi('Revenue', 12.4e7, INR, '18.4%'), kpi('Orders', 4820, CNT, '12.2%'), kpi('Profit', 2.8e7, INR, '4.1%', good=False, up=False), n=3) + grid(c_reg('s-6', 240), c_cat('s-6', 240)) + grid(c_fun('s-4', 220), c_gauge('s-4', 220), c_orders('s-4', 220)) + tbl(6) + '</div></div>'),
    ('master-detail', 'Master – Detail', 'Pick an item in the list; the detail pane re-renders for it.', [('t', 4, 4), ('c', 8, 2), ('c', 4, 2), ('c', 4, 2)],
     lambda: grid(card('Regions', '<div class="presets" role="listbox" aria-label="Regions">' + ''.join(f'<button type="button" class="menu__i" role="option" data-md="{r_}" aria-selected="{str(i == 0).lower()}"><span class="grow">{r_}</span><b class="num">{fmt(v, INR)}</b></button>' for i, (r_, v) in enumerate(zip(REGIONS, REGION_REV))) + '</div>' + note('Selecting a region sets the page’s region filter, so every chart on the right re-renders for it.'), sub='Revenue, last 12 months', span='s-4'),
                  '<div class="g s-8" style="align-content:start">' + c_rev('s-12', 260, 'Revenue trend — selected region') + c_cat('s-6', 240) + c_prod('s-6', 240) + '</div>')),
    ('small-multiples', 'Small Multiples', 'The same small chart for each region on a shared design — compare shapes, not legends.', [('c', 4, 1)] * 6,
     lambda: grid(*[cc(r_, 'Revenue vs last year', {'type': 'line', 'categories': M12, 'unit': INR, 'legend': False, 'series': [S('This year', [round(v * f) for v in REV]), S('Last year', [round(v * f) for v in REV_LY], dashed=True, c=8)]}, h=160, span='s-4') for r_, f in zip(REGIONS + ['All India'], [.28, .24, .22, .15, .11, 1])])),
    ('wallboard', 'Operations Wallboard', 'Large-type, dark wallboard for a warehouse or NOC screen; refreshes on its own.', [('k', 3, 1)] * 4 + [('c', 6, 2), ('c', 6, 2)],
     lambda: '<div data-theme="dark" style="background:var(--canvas);padding:16px;border-radius:6px;display:flex;flex-direction:column;gap:16px" data-wallboard>' + f'<div class="row" style="color:var(--fg1)">{ic("pulse")}<b>Pune WH-1 · live</b><span class="muted" data-wb-clock style="margin-left:auto"></span></div>' + kpis(
         kpi('Orders today', 1284, CNT, '6%', sub='vs same day last week', cls='kpi--hero'), kpi('Dispatched', 1012, CNT, '79%', sub='of today’s orders', cls='kpi--hero'), kpi('On-time', 94.2, PCT, '1.1 pts', sub='SLA 95%', cls='kpi--hero', status='warn'), kpi('Exceptions', 7, CNT, '2', good=False, sub='need action', cls='kpi--hero', status='crit'))
         + grid(cc('Dispatches by hour', 'Today', {'type': 'column', 'categories': [f'{h_}:00' for h_ in range(6, 20)], 'series': [S('Dispatched', [12, 28, 64, 92, 118, 126, 104, 98, 112, 120, 96, 72, 40, 18])], 'vary': False}, h=260, span='s-6'),
                cc('Pick rate', 'Lines per hour vs target', {'type': 'line', 'categories': [f'{h_}:00' for h_ in range(6, 20)], 'target': {'value': 900, 'label': 'Target'}, 'series': [S('Pick rate', [420, 610, 820, 930, 980, 940, 870, 910, 960, 990, 940, 860, 720, 520])], 'vary': False}, h=260, span='s-6')) + '</div>'),
]

def layouts():
    cards_ = ''
    for slug, title, desc, cells, fn in LAYOUTS:
        cards_ += f'<a class="card card--int lay-card" href="{slug}.html">{wf(cells)}<b>{esc(title)}</b><span>{esc(desc)}</span></a>'
        bp = f'<div class="blueprint">{wf(cells, "wf--s")}<p><b>Blueprint</b>{esc(desc)} On tablets columns collapse to two, on phones to one; KPI rows go 4 → 2 → 1.</p></div>'
        page(f'layouts/{slug}.html', title, desc + ' <b>Sample data.</b>', bp + fbar(('region', 'category')) + fn(), crumbs=[LAY], scripts=('charts', 'table', 'layouts'))
    legend = '<div class="legend-demo">' + ''.join(f'<span><i style="--c:var({c})"></i>{t}</span>' for c, t in [('--brand-bg3', 'KPI'), ('--bg1', 'Chart'), ('--stroke3', 'Table'), ('--bg4', 'Filters'), ('--brand-bg3', 'Summary')]) + '</div>'
    page('layouts/index.html', 'Dashboard Layout Combinations', 'Fifteen layouts built on the same 12-column grid, 16px gutters and card system. Each opens as a working page with live charts.',
         sec('All combinations', 'Pick the layout by the question: one deep chart, comparison of peers, KPI first, or detail table.', legend + f'<div class="lay-cards">{cards_}</div>') +
         sec('Grid rules', '', '<div class="g">' + card('Spacing', '<p class="spec">8px spacing system; <code>16px</code> gutters between cards; <code>24px</code> page padding (16 on tablet, 12 on phone).</p>', span='s-4') + card('Columns', '<p class="spec">12 columns. Spans 12 · 8 · 6 · 4 · 3. Below 1280px, 3/4 spans become 6; below 1024px everything is 12.</p>', span='s-4') + card('Reading order', '<p class="spec">Filters → KPIs → hero trend → breakdowns → detail table. Left-to-right, top-to-bottom, most important first.</p>', span='s-4') + '</div>'),
         crumbs=[], scripts=('charts',))

# ------------------------------------------------------------------ report builder
def builder():
    comp = lambda k, i, t: f'<button type="button" class="rb-comp" draggable="true" data-rb-add="{k}" aria-label="Add {t}">{ic(i)}{t}</button>'
    body = (f'<div class="rb"><div class="rb-tool" role="toolbar" aria-label="Report builder"><div class="rb-tool__t">{ic("design_ideas")}<label class="sr" for="rb-title">Report title</label><input id="rb-title" value=""><span class="badge badge--tint" data-route-label>Edit report</span></div>'
            f'<button type="button" class="btn btn--s btn--subtle" data-rb-new>{ic("document_add")}New</button><button type="button" class="btn btn--s btn--subtle btn--icon" data-rb-undo aria-label="Undo (Ctrl+Z)" data-tip="Undo">{ic("arrow_reset")}</button><button type="button" class="btn btn--s btn--subtle btn--icon" data-rb-redo aria-label="Redo (Ctrl+Y)" data-tip="Redo">{ic("arrow_clockwise")}</button><span class="sep" aria-hidden="true"></span>'
            f'<button type="button" class="btn btn--s btn--subtle" data-rb-save>{ic("save")}Save</button><button type="button" class="btn btn--s btn--subtle" data-rb-preview aria-pressed="false">{ic("eye")}Preview</button><button type="button" class="btn btn--s btn--subtle" data-rb-share>{ic("share")}Share</button>'
            f'<span class="grow"></span><span class="muted" style="font:var(--t-cap)" data-rb-saved aria-live="polite">All changes saved</span><button type="button" class="btn btn--s btn--primary" data-rb-export>{ic("arrow_download")}Export</button></div>'
            f'<aside class="rb-pal" aria-label="Components"><h3>Charts</h3><div class="rb-pal__grid">{comp("c-column", "data_bar_vertical", "Column")}{comp("c-bar", "data_bar_horizontal", "Bar")}{comp("c-line", "data_line", "Line")}{comp("c-area", "data_area", "Area")}{comp("c-pie", "data_pie", "Donut")}{comp("c-funnel", "data_funnel", "Funnel")}{comp("c-treemap", "data_treemap", "Treemap")}{comp("c-combo", "chart_multiple", "Combo")}</div>'
            f'<h3>Data</h3><div class="rb-pal__grid">{comp("table", "table", "Table")}{comp("kpi", "data_trending", "KPI")}</div><h3>Content</h3><div class="rb-pal__grid">{comp("text", "text_t", "Text")}{comp("image", "image", "Image")}</div>'
            f'<p class="spec" style="margin-top:12px">Drag onto the canvas, or click to add after the selected widget. Keyboard: select a widget and press <kbd class="kbd">Delete</kbd>, <kbd class="kbd">Alt</kbd>+arrows to move, <kbd class="kbd">Shift</kbd>+←/→ to resize.</p></aside>'
            f'<div class="rb-canvas"><div class="rb-page"><header class="rb-page__h"><h2></h2><p></p></header><div class="rb-grid" aria-label="Report canvas"></div></div></div>'
            f'<aside class="rb-props" aria-label="Properties"></aside></div>')
    page('report-builder/index.html', 'Report Builder', 'Build a report visually.', body, raw=True, scripts=('charts', 'table', 'builder'))

# ------------------------------------------------------------------ libraries
LIBS = {
    'echarts': dict(name='Apache ECharts', short='ECharts', ver='5.5.1', lic='Apache-2.0 (free, commercial use allowed)', size='1.0 MB min (single file)', render='Canvas (default) or SVG', color='#e43961',
                    files='echarts.min.js', strengths=['Widest native type coverage: candlestick, box plot, sankey, treemap, radar, gauge, polar, heatmap', 'Built-in data zoom, brushing, visual maps and ARIA descriptions', 'Handles 10k+ points well on canvas'],
                    limits=['Large single bundle unless you build a custom one', 'Option objects get verbose; theming means mapping tokens yourself', 'Accessibility is description-based, no keyboard point navigation'],
                    snippet="echarts.init(el).setOption({\n  series: [{ type: 'bar', data: spec.series[0].data,\n            itemStyle: { color: T.cat[0], borderRadius: [4,4,0,0] } }],\n  xAxis: { type: 'category', data: spec.categories },\n  yAxis: { axisLabel: { formatter: v => fmt(v, spec.unit) } }\n});"),
    'highcharts': dict(name='Highcharts', short='Highcharts', ver='11.4.8', lic='Commercial licence for business use; free for non-commercial', size='279 KB core + 12 modules (~640 KB)', render='SVG', color='#2b908f',
                       files='highcharts.js, highcharts-more, heatmap, treemap, sankey, funnel, solid-gauge, bullet, exporting, offline-exporting, export-data, accessibility', strengths=['Best-in-class accessibility module: keyboard navigation, screen-reader summaries, sonification', 'Polished defaults, client-side PNG/SVG/CSV export', 'Mature enterprise support and documentation'],
                       limits=['Licence cost for commercial products', 'Candlestick needs Highcharts Stock (not loaded here — falls back)', 'SVG slows with very large point counts'],
                       snippet="Highcharts.chart(el, {\n  chart: { type: 'column' },\n  xAxis: { categories: spec.categories },\n  series: [{ name: 'Revenue', data: spec.series[0].data, color: T.cat[0] }],\n  accessibility: { enabled: true }\n});"),
    'chartjs': dict(name='Chart.js', short='Chart.js', ver='4.4.4', lic='MIT (free, commercial use allowed)', size='205 KB + plugins (matrix, treemap, sankey, zoom)', render='Canvas', color='#ff6384',
                    files='chart.umd.js, chartjs-plugin-zoom, chartjs-chart-matrix, chartjs-chart-treemap, chartjs-chart-sankey, hammer.js', strengths=['Small, fast and easy to theme', 'Large plugin ecosystem; simple mental model (datasets + scales)', 'Great for KPI tiles, sparklines and the common business charts'],
                    limits=['No native box plot, candlestick, radial bar or banded gauge here (fall back)', 'Canvas only; accessibility must be supplied by the host (we add a table view)', 'Heatmap / treemap / sankey rely on community plugins'],
                    snippet="new Chart(canvas, {\n  type: 'bar',\n  data: { labels: spec.categories,\n          datasets: [{ label: 'Revenue', data: spec.series[0].data,\n                       backgroundColor: T.cat[0], borderRadius: 4 }] },\n  options: { maintainAspectRatio: false }\n});"),
}
TYPES = ['column', 'bar', 'line', 'area', 'combo (panels)', 'pie / donut', 'rose pie', 'scatter', 'bubble', 'radar', 'funnel', 'gauge', 'gauge with bands', 'radial bar', 'bullet', 'heatmap', 'treemap', 'sankey', 'waterfall', 'box plot', 'histogram', 'candlestick', 'polar area']
NATIVE = {'highcharts': set(TYPES) - {'candlestick', 'radial bar', 'rose pie'}, 'chartjs': set(TYPES) - {'candlestick', 'box plot', 'radial bar', 'rose pie', 'gauge with bands'}, 'echarts': set(TYPES)}

def lib_gallery(k):
    w = lambda *a, **kw: cc(*a, **kw)
    return f'<div class="g" data-engine="{k}">' + ''.join([
        w('Revenue by month', 'Column with labels', {'type': 'column', 'categories': M12, 'unit': INR, 'series': [S('Revenue', REV)], 'labels': True}, h=260, span='s-8'),
        w('Channel mix', 'Donut', {'type': 'pie', 'donut': True, 'unit': INR, 'labels': False, 'data': [{'name': n, 'value': v} for n, v in [('Distributors', 5.21e7), ('Direct B2B', 3.47e7), ('E-commerce', 2.11e7), ('Modern trade', 1.61e7)]]}, h=260, span='s-4'),
        w('Revenue vs last year', 'Line + zoom', {'type': 'line', 'categories': M12, 'unit': INR, 'zoom': True, 'series': [S('This year', REV), S('Last year', REV_LY, dashed=True, c=8)]}, h=260, span='s-6'),
        w('Revenue and margin', 'Two panels, shared axis', {'type': 'combo', 'categories': M12, 'unit': INR, 'unit2': PCT, 'panelNames': ['Revenue', 'Margin'], 'series': [S('Revenue', REV), S('Margin', trend(34, 32.6, seed=3, dp=1), type='line', panel=1, c=7)]}, h=260, span='s-6'),
        w('Dispatch load', 'Heatmap', {'type': 'heatmap', 'x': ['8', '10', '12', '14', '16', '18'], 'y': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], 'data': [[x, y, 20 + (x * 7 + y * 11) % 38] for y in range(5) for x in range(6)]}, h=240, span='s-4'),
        w('Stock by category', 'Treemap', {'type': 'treemap', 'unit': INR, 'data': [{'name': c, 'value': v} for c, v in zip(CATS, [2.31e7, 1.74e7, 1.32e7, 1.21e7, .96e7, 1.16e7])]}, h=240, span='s-4'),
        w('SLA', 'Gauge', {'type': 'gauge', 'value': 94.2, 'unit': PCT, 'label': 'within SLA'}, h=240, span='s-4'),
        w('Supplier performance', 'Bubble', {'type': 'bubble', 'xName': 'On-time %', 'yName': 'Quality', 'zName': 'Spend', 'zUnit': INR, 'series': [S('Suppliers', [[96, 92, 8.4e7], [93, 95, 4.1e7], [88, 90, 5.6e7], [97, 97, 2.2e7], [84, 86, 1.9e7]])]}, h=260, span='s-6'),
        w('Lead time by supplier', 'Box plot (native or fallback)', {'type': 'boxplot', 'categories': SUPPLIERS[:5], 'unit': {'suf': ' d'}, 'data': [[6, 9, 11, 13, 18], [5, 7, 8, 10, 14], [7, 10, 12, 15, 21], [4, 6, 7, 8, 11], [8, 11, 14, 17, 24]]}, h=260, span='s-6'),
    ]) + '</div>'

def libraries():
    rate = lambda n: '<div class="rate" aria-label="' + f'{n} of 5' + '">' + ''.join(f'<i class="{"on" if i < n else ""}"></i>' for i in range(5)) + '</div>'
    rows = [('Rendering style', ('Canvas or SVG', 4), ('SVG', 4), ('Canvas', 3)),
            ('Chart types supported', ('Widest — all 23 types here natively', 5), ('20 of 23 natively; Stock adds candlestick', 4), ('18 of 23 with plugins', 3)),
            ('Interaction', ('Zoom, brush, drill (treemap), legend toggles, data zoom slider', 5), ('Zoom, drilldown module, point select, legend toggles', 5), ('Hover, legend toggles; zoom via plugin', 3)),
            ('Accessibility', ('ARIA auto description; no keyboard point navigation', 3), ('Accessibility module: keyboard, screen reader, sonification', 5), ('Canvas only; host must provide text alternatives', 2)),
            ('Responsive behaviour', ('Resize API; media queries in option', 4), ('Responsive rules, reflow', 5), ('Responsive by default, maintainAspectRatio', 4)),
            ('Enterprise suitability', ('Apache project, no licence cost, large ecosystem', 4), ('Commercial support and SLAs; licence needed', 5), ('Fine for internal tools; fewer advanced types', 3)),
            ('Customisation', ('Very deep option tree, custom series', 5), ('Deep, plus plugin API', 5), ('Scriptable options, plugins', 4)),
            ('Performance', ('Canvas, progressive rendering, 100k+ points', 5), ('Good to ~10k points; Boost module for more', 3), ('Fast canvas; decimation plugin', 4)),
            ('Export', ('PNG/SVG via getDataURL; toolbox', 4), ('PNG, JPEG, SVG, PDF, CSV, XLS (offline modules)', 5), ('PNG via canvas; CSV is up to the host', 2)),
            ('Licence', ('Apache-2.0', 5), ('Commercial (non-commercial free)', 2), ('MIT', 5))]
    head = '<tr><th scope="col">Criterion</th>' + ''.join(f'<th scope="col"><span class="lib-h"><i class="lib-dot" style="background:{LIBS[k]["color"]}"></i>{LIBS[k]["short"]} {LIBS[k]["ver"]}</span></th>' for k in ('echarts', 'highcharts', 'chartjs')) + '</tr>'
    tb = ''.join(f'<tr><th scope="row">{esc(r_[0])}</th>' + ''.join(f'<td>{rate(n)}<br>{esc(t)}</td>' for t, n in r_[1:]) + '</tr>' for r_ in rows)
    cmp = f'<div class="card"><div class="dt__wrap" style="border-top:0;max-height:none"><table class="cmp">{head}<tbody>{tb}</tbody></table></div></div>'
    sup = '<tr><th scope="col">Chart type</th>' + ''.join(f'<th scope="col">{LIBS[k]["short"]}</th>' for k in ('echarts', 'highcharts', 'chartjs')) + '</tr>'
    sup += ''.join(f'<tr><th scope="row">{esc(t)}</th>' + ''.join(f'<td>{"<span class=\"st st--good\">" + ic("checkmark_circle") + "Native</span>" if t in NATIVE[k] else "<span class=\"st st--warn\">" + ic("arrow_swap") + "ECharts fallback</span>"}</td>' for k in ('echarts', 'highcharts', 'chartjs')) + '</tr>' for t in TYPES)
    same = lambda title, spec: grid(*[cc(f'{title} · {LIBS[k]["short"]}', 'Same spec, forced engine', spec, h=240, span='s-4', engine=k) for k in ('echarts', 'highcharts', 'chartjs')])
    body = (note('<b>Recommendation:</b> make ECharts the default engine (licence-free, widest coverage), offer Highcharts where its accessibility module or export is required and a licence is in place, and use Chart.js for lightweight embedded widgets. Because every chart is a neutral spec, the choice is a setting, not a rewrite.')
            + sec('Library comparison', 'Ratings are a qualitative summary for enterprise ERP/CRM reporting.', cmp)
            + sec('Same spec, three engines', 'Each row is one JSON spec drawn three times. Colors, labels and number formats come from the same tokens.', same('Revenue vs plan', {'type': 'combo', 'categories': M12, 'unit': INR, 'series': [S('Revenue', REV), S('Plan', trend(9.0e6, 11.6e6, seed=51, noise=0), type='line', c=8, dashed=True)]}) + same('Channel mix', {'type': 'pie', 'donut': True, 'unit': INR, 'labels': False, 'data': [{'name': n, 'value': v} for n, v in [('Distributors', 5.21e7), ('Direct B2B', 3.47e7), ('E-commerce', 2.11e7), ('Modern trade', 1.61e7)]]}) + same('Dispatch load', {'type': 'heatmap', 'x': ['8', '10', '12', '14', '16', '18'], 'y': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], 'data': [[x, y, 20 + (x * 7 + y * 11) % 38] for y in range(5) for x in range(6)]}))
            + sec('Native support matrix', 'Where an engine has no native form, the card is drawn by ECharts and badged “fallback”, so no page is ever empty.', f'<div class="card"><div class="dt__wrap" style="border-top:0;max-height:none"><table class="cmp" style="min-width:560px">{sup}</table></div></div>')
            + sec('Architecture', '', grid(card('One spec', '<pre class="code">{\n  "type": "combo",\n  "categories": ["Oct", "Nov", …],\n  "unit": {"cur": "inr"},\n  "series": [\n    {"name": "Revenue", "data": […]},\n    {"name": "Plan", "type": "line", "data": […]}\n  ]\n}</pre>', sub='Declared in the page', span='s-4'),
                                           card('Three adapters', '<p class="spec">assets/js/charts.js maps the spec to <code>echarts.setOption</code>, <code>Highcharts.chart</code> or <code>new Chart</code>. Engines load on demand the first time they are chosen.</p>', sub='Lazy-loaded', span='s-4'),
                                           card('Shared chrome', '<p class="spec">Card header, engine badge, ⋮ menu (view data, filter, drill down, export PNG/CSV, full screen, details), cross-filtering and drill-down are engine-independent.</p>', sub='Same UX everywhere', span='s-4'))))
    page('libraries/index.html', 'Chart Library Comparison', 'ECharts, Highcharts and Chart.js behind one chart spec — compare them, then switch the engine in the header.', body, crumbs=[], actions='')
    for k, L in LIBS.items():
        info = f'<dl class="kv"><dt>Version</dt><dd>{L["ver"]}</dd><dt>Licence</dt><dd>{esc(L["lic"])}</dd><dt>Size</dt><dd>{esc(L["size"])}</dd><dt>Rendering</dt><dd>{esc(L["render"])}</dd><dt>Files loaded</dt><dd class="mono">{esc(L["files"])}</dd></dl>'
        lists = lambda t, xs, i: card(t, '<ul class="lst">' + ''.join(f'<li>{ic(i)}<div class="lst__m"><span style="white-space:normal;color:var(--fg1);font:var(--t-body)">{esc(x)}</span></div></li>' for x in xs) + '</ul>', span='s-4')
        body = (grid(card(f'{L["name"]} at a glance', info, span='s-4'), lists('Strengths', L['strengths'], 'checkmark_circle'), lists('Limits', L['limits'], 'warning'))
                + note(f'Every chart on this page is forced to <b>{L["short"]}</b> (a <code>data-engine</code> attribute on the container), whatever the header switch says. Fallback badges show where ECharts stands in.')
                + sec('Live gallery', 'Nine common report charts drawn by this engine.', lib_gallery(k))
                + sec('Adapter mapping', 'What charts.js generates for a simple column spec.', f'<pre class="code">{esc(L["snippet"])}</pre>'))
        page(f'libraries/{k}.html', f'{L["short"]} Showcase', f'{L["name"]} {L["ver"]} rendering the shared chart specs. <b>Sample data.</b>', body, crumbs=[('Chart library', 'libraries/index.html')], actions=f'<a class="btn" href="index.html">{ic("arrow_swap")}Compare libraries</a>')

# ------------------------------------------------------------------ design system
DS = ('Design system', 'design-system/index.html')

def ds_index():
    sw = lambda var, name, ink='#fff': f'<div class="sw"><div class="sw__c" style="--c:var({var});--ink:{ink}"></div><div class="sw__m"><b>{name}</b><code data-hex="{var}">{var}</code></div></div>'
    colors = (sec('Brand and semantic', 'UI colors. Status colors in the UI always pair with an icon and label.', '<div class="sw-grid">' + sw('--brand', 'Primary') + sw('--brand-hover', 'Primary hover') + sw('--brand-bg2', 'Primary subtle', 'var(--fg1)') + sw('--fg2', 'Secondary (neutral)')
               + sw('--ok-fg', 'Success') + sw('--warn-fg', 'Warning') + sw('--err-fg', 'Error') + sw('--info-fg', 'Info') + '</div>', sid='colors')
              + sec('Neutrals', 'Surfaces, strokes and text.', '<div class="sw-grid">' + ''.join(sw(v, n, 'var(--fg1)') for v, n in [('--canvas', 'Canvas'), ('--bg1', 'Surface'), ('--bg3', 'Surface sunk'), ('--hover', 'Hover'), ('--stroke1', 'Stroke'), ('--stroke2', 'Divider')]) + sw('--fg1', 'Text primary') + sw('--fg3', 'Text tertiary') + '</div>')
              + sec('Data visualization', 'Categorical order is fixed and CVD-validated in light and dark (worst adjacent ΔE 9.1 / 8.4). Assign in order, never cycle; a 9th series folds into “Other”.',
                    '<div class="sw-grid">' + ''.join(sw(f'--c{i}', f'Series {i}') for i in range(1, 9)) + '</div><div class="g"><div class="s-4"><p class="lbl">Sequential (magnitude)</p><div class="ramp">' + ''.join(f'<i style="--c:var(--q{i})"></i>' for i in range(1, 10)) + '</div></div><div class="s-4"><p class="lbl">Diverging (sign)</p><div class="ramp"><i style="--c:var(--dv-neg)"></i><i style="--c:var(--dv-mid)"></i><i style="--c:var(--dv-pos)"></i></div></div><div class="s-4"><p class="lbl">Chart status (never a series)</p><div class="ramp"><i style="--c:var(--st-good)"></i><i style="--c:var(--st-warn)"></i><i style="--c:var(--st-serious)"></i><i style="--c:var(--st-crit)"></i></div></div></div>'))
    typ = ''.join(f'<div class="type-row"><span>{n}</span><span style="font:var({v})">Revenue ₹12.4 Cr</span><code>{s}</code></div>' for n, v, s in [('Display', '--t-display', '68 / 92 semibold'), ('Large title', '--t-large', '40 / 52 semibold'), ('Title 1 · H1', '--t-title1', '32 / 40 semibold'), ('Title 3 · page H1', '--t-title3', '24 / 32 semibold'), ('Subtitle 1 · H2', '--t-sub1', '20 / 28 semibold'), ('Subtitle 2 · H3', '--t-sub2', '16 / 22 semibold'), ('Body', '--t-body', '14 / 20 regular'), ('Caption', '--t-cap', '12 / 16 regular')])
    typ += '<div class="type-row"><span>Label</span><span class="lbl">Warehouse</span><code>14 / 20 semibold</code></div><p class="spec">Segoe UI Variable / Segoe UI with system fallbacks. Hero and KPI numbers use proportional figures; tables and axes use <code>tabular-nums</code>.</p>'
    btns = (f'<div class="demo"><button class="btn btn--primary">{ic("arrow_download")}Primary</button><button class="btn">Default</button><button class="btn btn--outline">Outline</button><button class="btn btn--subtle">{ic("filter")}Subtle</button><button class="btn" disabled>Disabled</button><button class="btn btn--icon" aria-label="Settings">{ic("settings")}</button><button class="btn btn--danger">{ic("delete")}Delete</button></div>'
            f'<div class="demo"><button class="btn btn--primary btn--s">Small</button><button class="btn btn--primary">Medium</button><button class="btn btn--primary btn--l">Large</button><div class="seg" role="group" aria-label="Segmented"><button aria-pressed="true">Day</button><button aria-pressed="false">Week</button><button aria-pressed="false">Month</button></div><button class="btn" aria-pressed="true">Toggle on</button></div>')
    inputs = (f'<div class="demo" style="align-items:flex-start"><div class="field" style="min-width:220px"><label for="d1">Customer</label><label class="input">{ic("search")}<input id="d1" placeholder="Search customers"></label><span class="hint">Helper text</span></div>'
              f'<div class="field is-err" style="min-width:220px"><label for="d2">PO number</label><input class="input" id="d2" value="PO-77" aria-invalid="true" aria-describedby="d2h"><span class="hint" id="d2h">{ic("error_circle", "ic--s")} Enter a 4-digit PO number</span></div>'
              f'<div class="field" style="min-width:200px"><label for="d3">Warehouse</label><select class="select" id="d3">{"".join(f"<option>{w}</option>" for w in WHS)}</select></div>'
              f'<div class="field" style="min-width:260px"><label for="d4">Comment</label><textarea class="input" id="d4">Approve after GRN.</textarea></div></div>'
              f'<div class="demo"><label class="check"><input type="checkbox" checked>Include returns</label><label class="check"><input type="checkbox">Show zero rows</label><label class="check"><input type="radio" name="dr" checked>Gross</label><label class="check"><input type="radio" name="dr">Net</label><label class="switch"><input type="checkbox" checked>Auto refresh</label></div>')
    dd = f'<div class="demo"><button class="btn" data-demo-menu aria-haspopup="true" aria-expanded="false">{ic("arrow_download")}Export{ic("chevron_down", "ic--s")}</button><button class="btn" data-range-menu aria-haspopup="true" aria-expanded="false">{ic("calendar_ltr")}<span data-range-label>Last 30 days</span>{ic("chevron_down", "ic--s")}</button><button class="ibtn" data-demo-menu aria-label="More" aria-haspopup="true" aria-expanded="false">{ic("more_vertical")}</button></div>'
    tabs = ('<div class="tabs" role="tablist" aria-label="Report sections">' + ''.join(f'<button class="tab" role="tab" id="dt{i}" aria-controls="dp{i}" aria-selected="{str(i == 0).lower()}" tabindex="{0 if i == 0 else -1}">{t}</button>' for i, t in enumerate(['Overview', 'Regions', 'Products', 'Customers'])) + '</div>'
            + ''.join(f'<div class="demo" role="tabpanel" id="dp{i}" aria-labelledby="dt{i}"{"" if i == 0 else " hidden"}>Panel: {t}</div>' for i, t in enumerate(['Overview', 'Regions', 'Products', 'Customers']))
            + '<div class="tabs tabs--s" role="tablist" aria-label="Small tabs" style="margin-top:12px">' + ''.join(f'<button class="tab" role="tab" aria-selected="{str(i == 1).lower()}" tabindex="{0 if i == 1 else -1}">{t}</button>' for i, t in enumerate(['Visual', 'Data', 'Format'])) + '</div>')
    bcs = f'<div class="demo"><nav aria-label="Breadcrumb example"><ol class="bc"><li><a href="#">Home</a></li><li>{ic("chevron_right")}<a href="#">Business dashboards</a></li><li>{ic("chevron_right")}<a href="#">Inventory</a></li><li>{ic("chevron_right")}<span aria-current="page">Chennai WH-2</span></li></ol></nav></div>'
    badges = ('<div class="demo"><span class="badge">Brand</span><span class="badge badge--tint">Tint</span><span class="badge badge--subtle">Subtle</span><span class="badge badge--outline">Outline</span><span class="badge badge--ok">Success</span><span class="badge badge--warn">Warning</span><span class="badge badge--err">Error</span><span class="badge badge--sq">Square</span>'
              f'<span class="chip">Region: North<button aria-label="Remove">{ic("dismiss")}</button></span></div><div class="demo"><span class="st st--good">{ic("checkmark_circle")}On track</span><span class="st st--warn">{ic("warning")}At risk</span><span class="st st--serious">{ic("warning")}Serious</span><span class="st st--crit">{ic("error_circle")}Off track</span><span class="st st--info">{ic("info")}Info</span></div>')
    tips = f'<div class="demo"><button class="btn" data-tip="Tooltips name the action">Hover me</button><button class="ibtn" aria-label="Refresh" data-tip="Refresh data">{ic("arrow_clockwise")}</button><div class="tt-demo"><b>Sep 2026</b><div><i style="--c:var(--c1)"></i><span>This year</span><span>₹1.24 Cr</span></div><div><i style="--c:var(--c8)"></i><span>Last year</span><span>₹1.01 Cr</span></div></div></div>'
    mods = f'<div class="demo"><button class="btn btn--primary" data-demo-modal>{ic("open")}Open dialog</button><button class="btn" data-open-filter-modal>{ic("filter")}Filter dialog</button><button class="btn" data-toast="Saved" data-kind="ok">{ic("checkmark_circle")}Toast</button></div>'
    drws = f'<div class="demo"><button class="btn btn--primary" data-open-filters>{ic("panel_right")}Right filter drawer</button><button class="btn" data-demo-drawer>{ic("panel_right")}Details drawer</button><button class="btn" data-demo-drawer-left>Left drawer</button></div>'
    elev = '<div class="demo">' + ''.join(f'<div class="card" style="box-shadow:var({v});padding:16px;min-width:120px;text-align:center"><b>{n}</b><br><code class="mono">{v}</code></div>' for v, n in [('--sh2', 'Card'), ('--sh8', 'Toast'), ('--sh16', 'Menu'), ('--sh64', 'Dialog')]) + '</div>'
    body = (sec('Colors', 'Tokens resolve per theme — switch Light, Dark or High contrast in the header and the values below update.', colors, sid='colors')
            + sec('Typography', 'Fluent 2 type ramp.', f'<div class="card" style="padding:0 16px">{typ}</div>', sid='typography')
            + sec('Buttons', 'Primary once per area; subtle in toolbars; icon buttons always carry an accessible name.', btns, sid='buttons')
            + sec('Inputs', 'Label above, helper or error below. Error text names the fix.', inputs, sid='inputs')
            + sec('Dropdowns', 'Menu buttons open a popover menu; arrow keys move, Esc closes.', dd, sid='dropdowns')
            + sec('Tabs', 'Arrow keys move between tabs.', tabs, sid='tabs')
            + sec('Breadcrumbs', 'Every page shows where it sits.', bcs, sid='breadcrumbs')
            + sec('Badges and status', 'Status is icon + label, never color alone.', badges, sid='badges')
            + sec('Tooltips', 'UI tooltips and the chart tooltip pattern (see Legends & tooltips for charts).', tips)
            + sec('Modals and toasts', 'Dialogs trap focus and close with Esc.', mods, sid='modals')
            + sec('Drawers', 'Right drawers for filters and details; left for navigation on mobile.', drws, sid='drawers')
            + sec('Elevation, radius and spacing', '4px controls, 6px cards, 8px dialogs; 8px spacing system.', elev))
    page('design-system/index.html', 'Design System', 'Foundations and components of the Reports & Analytics UI — Fluent 2 tokens, type, controls and data-viz palette.', body, crumbs=[], actions='', scripts=('charts', 'table', 'ds'))

def ds_cards():
    body = sec('Card variants', 'One card component; variants change emphasis, not structure.', grid(
        card('Basic card', '<p>Title, optional subtitle, content. 6px radius, hairline border, shadow 2.</p>', sub='Default', span='s-4'),
        card('With actions', '<p>Header actions sit top-right: icon buttons with names.</p>', sub='Header actions', span='s-4', actions=f'<button class="ibtn ibtn--s" aria-label="Refresh">{ic("arrow_clockwise")}</button><button class="ibtn ibtn--s" aria-label="More">{ic("more_vertical")}</button>'),
        card('With footer', '<p>Footers hold provenance: source and refresh time.</p>', sub='Footer', span='s-4', foot=f'{ic("database", "ic--s")}Source: Sales orders · refreshed 06:00 IST'),
        card('Selected', '<p>Brand stroke marks the selected card (builder, compare).</p>', sub='Selected state', span='s-4', cls='card--sel'),
        f'<a class="card card--int s-4" href="../dashboards/inventory.html" style="padding:16px;color:inherit;text-decoration:none"><b>Interactive card</b><p class="muted" style="margin-top:4px">Whole card is a link; hover raises elevation.</p></a>',
        card('Flat / sunk', '<p>For nested groups inside a card or panel.</p>', sub='No shadow', span='s-4', cls='card--sunk'),
        card('Accent', '<p>Top accent for summaries and callouts — use sparingly.</p>', sub='Accent', span='s-6', cls='card--accent'),
        card('List card', lst([('Bharat Infra', 'Enterprise · West', '₹1.42 Cr', '↑ 21%', ('BI', 2)), ('Apex Retail', 'Mid-market · North', '₹1.18 Cr', '↑ 9%', ('AR', 1))]), sub='Top customers', span='s-6'))) + \
        sec('Chart card anatomy', 'Title opens Chart details · engine badge · full screen · ⋮ actions · selection read-out.', grid(
            cc('Revenue by region', 'Subtitle states measure and period', {'type': 'column', 'categories': REGIONS, 'unit': INR, 'labels': True, 'dim': 'region', 'series': [S('Revenue', REGION_REV)]}, h=260, span='s-6'),
            card('Anatomy', '<dl class="kv"><dt>Title</dt><dd>Button — opens the Chart details drawer</dd><dt>Subtitle</dt><dd>Measure, period, interaction hint</dd><dt>Engine badge</dt><dd>Which library drew it; amber when a fallback is used</dd><dt>Full screen</dt><dd>Overlay with Esc to close</dd><dt>⋮ menu</dt><dd>View data, Filter, Drill down, Export PNG / CSV, Full screen, Chart details</dd><dt>Selection</dt><dd>Live region reports the clicked mark</dd></dl>', span='s-6')))
    page('design-system/cards.html', 'Cards', 'Card variants and the chart card anatomy used across every dashboard.', body, crumbs=[DS], actions='')

def ds_kpis():
    sp = [round(v / 1e6, 1) for v in REV]
    v = [
        ('Basic KPI', kpi('Revenue', 12.4e7, INR, sub='Year to date')),
        ('KPI with icon', kpi('Orders', 4820, CNT, '12.2%', sub='vs last year', icon='cart', cls='kpi--ico')),
        ('KPI with trend', kpi('Revenue', 12.4e7, INR, '18.4%', sub='vs last year')),
        ('KPI with percentage', kpi('Gross margin', 32.6, PCT, '1.2 pts', good=False, up=False, sub='vs last year')),
        ('KPI with sparkline', kpi('Revenue', 12.4e7, INR, '18.4%', sub='12 months', spark=sp)),
        ('KPI with target', kpi('Revenue vs plan', 12.4e7, INR, '3.3%', sub='above plan', target=(103, 'Plan ₹12.0 Cr — 103%', 'ok'))),
        ('KPI with progress', kpi('Budget utilised', 72.4, PCT, sub='₹46.3 Cr of ₹64.0 Cr', target=(72, '9 of 12 months elapsed', 'warn'))),
        ('KPI with comparison', kpi('Profit', 2.8e7, INR, '4.1%', good=False, up=False, sub='vs last year', cmp=[('This year', '₹2.80 Cr'), ('Last year', '₹2.92 Cr')])),
        ('KPI with status', kpi('DSO', 58, {'suf': ' days'}, '6 days', good=False, sub='target 45', status='crit')),
        ('KPI with mini chart', kpi('Orders', 4820, CNT, '12.2%', sub='per month', spark=ORDERS, spark_kind='bars')),
        ('KPI with action', kpi('Pending approvals', 46, CNT, '6', good=False, sub='6 waiting for you', action=f'<a class="btn btn--s btn--primary" href="../dashboards/procurement.html" style="margin-left:auto">Review</a>')),
        ('Hero KPI', kpi('Revenue', 12.4e7, INR, '18.4%', sub='vs last year', cls='kpi--hero')),
    ]
    body = sec('Eleven variants plus a hero', 'Same anatomy: label, value, delta (color = good/bad, arrow = direction), context. Values update when filters change.',
               '<div class="kpis" style="grid-template-columns:repeat(auto-fill,minmax(240px,1fr))">' + ''.join(f'<div class="stack" style="gap:6px"><span class="lbl" style="font:var(--t-cap);font-weight:600;color:var(--fg3)">{n}</span>{h}</div>' for n, h in v) + '</div>')
    body += sec('Examples', 'From the brief.', kpis(kpi('Revenue', 12.4e7, INR, '18.4%', sub='vs last year'), kpi('Orders', 4820, CNT, '12.2%', sub='vs last year'), kpi('Profit', 2.8e7, INR, '4.1%', good=False, up=False, sub='vs last year'), n=3))
    body += sec('Rules', '', guide_html('<ul><li>Green/red follows <b>good vs bad</b>, the arrow follows <b>direction</b> — cost down is green with a down arrow.</li><li>Always say what the delta compares against.</li><li>Large numbers use proportional figures; units ₹ Cr / L in Indian style.</li></ul>', '<ul><li>More than six KPIs in a row.</li><li>Color without a label or arrow.</li><li>Sparklines with axes — they show shape only.</li></ul>'))
    page('design-system/kpi-cards.html', 'KPI Cards', 'KPI card variants — trend, target, progress, comparison, status, mini chart and action. <b>Sample data.</b>', body, crumbs=[DS], actions='')

def guide_html(do, dont):
    return f'<div class="do-dont"><div><b>{ic("checkmark_circle")}Do</b>{do}</div><div><b>{ic("dismiss")}Don’t</b>{dont}</div></div>'

def ds_filters():
    presets = '<div class="presets" role="listbox" aria-label="Date presets">' + ''.join(f'<button type="button" class="menu__i" role="option" aria-selected="{str(r_ == "Last 30 days").lower()}" data-preset="{r_}">{ic("checkmark", "chk") if r_ == "Last 30 days" else "<span style=width:18px></span>"}<span>{r_}</span></button>' for r_ in ['Today', 'Yesterday', 'Last 7 days', 'Last 30 days', 'This month', 'This quarter', 'This year']) + '</div>'
    inline = '<div class="row">' + ''.join(f'<label class="field" style="min-width:150px"><span class="lbl" style="font:var(--t-cap);font-weight:600">{d.title()}</span><select class="select" data-filter="{d}"><option value="All">All</option>{"".join(f"<option>{esc(x)}</option>" for x in DIMS[d])}</select></label>' for d in ('region', 'department', 'warehouse', 'category', 'product', 'customer', 'supplier', 'status')) + '</div>'
    panel = f'<details class="fpanel"><summary>{ic("filter")}Advanced filters<span class="badge badge--subtle">8 fields</span>{ic("chevron_down")}</summary><div class="fpanel__b">' + ''.join(f'<div class="field"><label for="fp-{d}">{d.title()}</label><select class="select" id="fp-{d}" data-filter="{d}"><option value="All">All</option>{"".join(f"<option>{esc(x)}</option>" for x in DIMS[d])}</select></div>' for d in DIMS) + f'<div class="fpanel__f"><button type="button" class="btn btn--subtle" data-chip-clear>Reset</button></div></div></details>'
    body = (note('Filters on this page are live: change any of them and the KPI and chart below re-render. One filter row scopes everything below it.')
            + sec('Toolbar', 'Page-level filter bar with date range, dimension selects, active-filter chips and “More filters”.', fbar(('region', 'warehouse', 'category')))
            + sec('Header date range', 'The date range in the app header applies everywhere (Today, Yesterday, Last 7/30 days, This month/quarter/year, custom).', f'<div class="demo"><button class="btn" data-range-menu aria-haspopup="true" aria-expanded="false">{ic("calendar_ltr")}<span data-range-label>Last 30 days</span>{ic("chevron_down", "ic--s")}</button><div class="card" style="padding:4px;width:220px">{presets}</div></div>')
            + sec('Inline row', 'Labelled selects for every dimension.', f'<div class="demo">{inline}</div>')
            + sec('Collapsible filter panel', 'For secondary fields; collapsed by default.', panel)
            + sec('Right-side filter drawer and modal dialog', '', f'<div class="demo"><button class="btn btn--primary" data-open-filters>{ic("panel_right")}Open filter drawer</button><button class="btn" data-open-filter-modal>{ic("open")}Open filter dialog</button><div class="fbar__chips" data-chips></div></div>')
            + sec('Result', 'Everything above filters this.', kpis(kpi('Revenue', 12.4e7, INR, '18.4%', sub='filtered slice'), kpi('Orders', 4820, CNT, '12.2%', sub='filtered slice'), kpi('Inventory', 8.7e7, INR, '4.6%', good=False, sub='filtered slice'), n=3)
                  + grid(cc('Revenue by region', 'Click a bar to cross-filter', {'type': 'column', 'categories': REGIONS, 'unit': INR, 'labels': True, 'dim': 'region', 'series': [S('Revenue', REGION_REV)]}, h=260, span='s-6'), cc('Revenue trend', 'Responds to every filter', {'type': 'line', 'categories': M12, 'unit': INR, 'series': [S('Revenue', REV)]}, h=260, span='s-6'))))
    page('design-system/filters.html', 'Filters', 'Filter patterns: toolbar, header date range, inline row, collapsible panel, right drawer and modal dialog.', body, crumbs=[DS], actions='', scripts=('charts', 'table', 'ds'))

def ds_tables():
    rows = unit_rows(23)
    body = (sec('Enterprise report table', 'Search · status filter · sort · pagination · column chooser · drag to resize columns · sticky header and first column · group by with subtotals · expand/collapse · totals · selection · row actions · CSV export.',
                dtable({'caption': 'Product sales report', 'noun': 'products', 'pageSize': 10, 'select': True, 'sort': {'key': 'sales', 'dir': 'desc'}, 'statusMap': {'Growing': 'good', 'Stable': 'info', 'Declining': 'warn', 'Discontinued': 'crit'},
                        'columns': [{'key': 'product', 'label': 'Product', 'type': 'prod', 'w': 220, 'sticky': True}, {'key': 'category', 'label': 'Category', 'group': True}, {'key': 'warehouse', 'label': 'Warehouse', 'group': True}, {'key': 'sales', 'label': 'Sales', 'type': 'inr', 'agg': 'sum', 'w': 150},
                                    {'key': 'qty', 'label': 'Qty', 'type': 'num', 'agg': 'sum'}, {'key': 'growth', 'label': 'Growth', 'type': 'growth'}, {'key': 'days', 'label': 'Days of cover', 'type': 'num', 'agg': 'avg', 'hidden': True}, {'key': 'status', 'label': 'Status', 'type': 'status', 'group': True}],
                        'rows': [{**r_, 'sales': r_['value'] * 3, 'status': 'Growing' if r_['growth'] > 8 else 'Declining' if r_['growth'] < -6 else 'Discontinued' if r_['days'] > 180 else 'Stable'} for r_ in rows]}, title='Product | Category | Sales | Qty | Growth | Status', sub='48 rows of sample data · “Days of cover” is hidden — show it from Columns'))
            + sec('Grouped by default', 'Subtotals on group rows, grand total in the sticky footer.', dtable({'caption': 'Spend by supplier', 'noun': 'POs', 'groupBy': 'sup', 'pageSize': 50, 'statusMap': {'Received': 'good', 'Approved': 'info', 'Pending': 'warn'},
                        'columns': [{'key': 'po', 'label': 'PO', 'w': 120}, {'key': 'sup', 'label': 'Supplier', 'group': True}, {'key': 'val', 'label': 'Value', 'type': 'inr', 'agg': 'sum'}, {'key': 'lead', 'label': 'Lead time', 'type': 'num', 'agg': 'avg'}, {'key': 'st', 'label': 'Status', 'type': 'status', 'group': True}],
                        'rows': [{'po': f'PO-{7700 + i * 3}', 'sup': SUPPLIERS[i % 4], 'val': (i * 137 % 90 + 10) * 1e4, 'lead': 6 + i * 5 % 17, 'st': ['Received', 'Approved', 'Pending'][i % 3]} for i in range(16)]}, title='Grouped table', sub='Expand or collapse each supplier'))
            + sec('Rules', '', guide_html('<ul><li>Numbers right-aligned with tabular figures; currency in full Indian format.</li><li>First column sticky, header sticky, totals sticky.</li><li>Status as icon + label.</li></ul>', '<ul><li>Zebra stripes and heavy grid lines.</li><li>Truncating numbers.</li><li>Hiding the export of what the user sees.</li></ul>')))
    page('design-system/tables.html', 'Tables', 'Enterprise report tables with every interaction a reporting user expects. <b>Sample data.</b>', body, crumbs=[DS], actions='')

def ds_legends():
    leg = lambda items, cls='': '<div class="legend-demo">' + ''.join(f'<span class="{o}"><i class="{cls}" style="--c:var(--c{i})"></i>{t}</span>' for i, t, o in items) + '</div>'
    two = {'type': 'line', 'categories': M12, 'unit': INR, 'series': [S('This year', REV), S('Last year', REV_LY, dashed=True, c=8)]}
    body = (sec('Legends', 'Shown for two or more series; none for one (the title names it). Up to four series also get direct labels.', grid(
                card('Legend anatomy', leg([(1, 'Distributors', ''), (2, 'Direct B2B', ''), (3, 'E-commerce', ''), (4, 'Modern trade', '')]) + '<p class="spec" style="margin-top:8px">10px rounded swatch for bars and areas, 16 × 3px line swatch for lines, dot for scatter. Text uses ink tokens, never the series color.</p>' + leg([(1, 'Line series', '')], 'ln') + leg([(3, 'Scatter series', '')], 'dt'), sub='Swatches by mark type', span='s-4'),
                card('Toggled off', leg([(1, 'Distributors', ''), (2, 'Direct B2B', 'off'), (3, 'E-commerce', '')]) + '<p class="spec" style="margin-top:8px">Hidden series: outlined swatch, struck-through label. Other series keep their colors.</p>', sub='Interactive legend', span='s-4'),
                card('Position', '<p class="spec">Top-left above the plot (default) · right for donuts in wide cards · bottom for pies in narrow cards.</p>', sub='Placement', span='s-4'),
                cc('Legend top + direct labels', 'Click legend items to toggle', {**two, 'labels': 'end'}, h=260, span='s-6'),
                cc('Legend right', 'Donut in a wide card', {'type': 'pie', 'donut': True, 'legendRight': True, 'labels': False, 'unit': INR, 'data': [{'name': c, 'value': v} for c, v in zip(CATS, CAT_SALES)]}, h=260, span='s-6')), sid='legends')
            + sec('Tooltips', 'Tooltips enhance, never gate: every value is also in View data. Shared crosshair on line/area, per-mark on bars and dots.', grid(
                card('Anatomy', '<div class="tt-demo"><b>Sep 2026</b><div><i style="--c:var(--c1)"></i><span>This year</span><span>₹1.24 Cr</span></div><div><i style="--c:var(--c8)"></i><span>Last year</span><span>₹1.01 Cr</span></div></div><p class="spec" style="margin-top:8px">Header = category · rows = swatch, series, value in full format · surface color, shadow 16, 4px radius.</p>', sub='Multi-series', span='s-4'),
                card('Formats', '<dl class="kv"><dt>Currency</dt><dd>₹1,24,00,000 in tooltips; ₹1.24 Cr on axes</dd><dt>Percent</dt><dd>32.6%</dd><dt>Count</dt><dd>4,820</dd><dt>Range</dt><dd>₹11.5 L – ₹13.5 L</dd></dl>', sub='Number formats', span='s-4'),
                card('Behaviour', '<ul class="lst"><li><div class="lst__m"><span style="white-space:normal">Hit areas are larger than the mark</span></div></li><li><div class="lst__m"><span style="white-space:normal">Keyboard users get the same data in View data</span></div></li><li><div class="lst__m"><span style="white-space:normal">Turn off for print and small multiples</span></div></li></ul>', sub='Rules', span='s-4'),
                cc('Shared tooltip', 'Hover anywhere along the time axis', two, h=260, span='s-6'),
                cc('Per-mark tooltip', 'Hover a bar', {'type': 'column', 'categories': REGIONS, 'unit': INR, 'series': [S('Revenue', REGION_REV)]}, h=260, span='s-6')), sid='tooltips'))
    page('design-system/legends.html', 'Legends & Tooltips', 'How charts name their series and reveal values.', body, crumbs=[DS], actions='')

def ds_states():
    st = lambda kind, icon, title, text, act='', cls='': f'<div class="state {cls}"><div class="state__ico">{icon}</div><b>{title}</b><p>{text}</p><div class="row">{act}</div></div>'
    sk = '<div style="padding:16px;display:grid;gap:10px"><div class="skel" style="height:14px;width:40%"></div><div class="skel" style="height:10px;width:60%"></div><div class="skel-chart"><div class="skel" style="height:40%"></div><div class="skel" style="height:70%"></div><div class="skel" style="height:55%"></div><div class="skel" style="height:90%"></div><div class="skel" style="height:65%"></div><div class="skel" style="height:80%"></div></div></div>'
    frame = lambda t, inner, extra='': f'<section class="card s-3" aria-label="{t} state"><header class="card__h"><div class="card__t"><h3>Revenue by region</h3><p>{t}</p></div></header>{extra}<div class="card__b" style="padding:0">{inner}</div></section>'
    body = sec('Report component states', 'Every chart, KPI and table handles these eight states. Buttons here are live.', '<div class="g" data-states>' + ''.join([
        frame('Loading', st('', '<span class="spinner" role="progressbar" aria-label="Loading"></span>', 'Loading report…', 'Fetching 12 months of sales orders.')),
        frame('Empty', st('', ic('data_bar_vertical'), 'No report configured', 'Choose a data source and a visualization to get started.', f'<a class="btn btn--primary btn--s" href="../report-builder/index.html#create">{ic("add")}Create report</a>')),
        frame('No data', st('', ic('filter'), 'No data for these filters', 'Nothing matches Region = Central and Category = Spares for Yesterday.', f'<button class="btn btn--s" data-chip-clear>{ic("arrow_reset")}Clear filters</button>')),
        frame('Error', st('', ic('error_circle'), 'Couldn’t load this report', 'The sales service timed out. Error ID 7F3A-21.', f'<button class="btn btn--s btn--primary" data-state-retry>{ic("arrow_clockwise")}Retry</button><button class="btn btn--s btn--subtle" data-toast="Error details copied" data-kind="ok">Copy details</button>', 'state--err')),
        frame('Permission denied', st('', ic('lock_closed'), 'You don’t have access', 'Finance reports are limited to the Finance group.', f'<button class="btn btn--s btn--primary" data-toast="Access requested from Finance admins" data-kind="ok">Request access</button>', 'state--lock')),
        frame('Offline', st('', ic('wifi_off'), 'Showing cached data', 'You’re offline. Data as of 06:00 today; it will refresh when you reconnect.', '', 'state--warn'), f'<div class="offline-bar">{ic("wifi_off", "ic--s")}Offline · cached 06:00</div>'),
        f'<div class="s-3" data-state-refresh>' + cc('Revenue by region', 'Refreshing — previous render held at reduced opacity', {'type': 'column', 'categories': REGIONS, 'unit': INR, 'series': [S('Revenue', REGION_REV)]}, h=200, span='', cls='is-busy') + f'<button class="btn btn--s" data-state-refresh-btn style="margin-top:8px">{ic("arrow_clockwise")}Refresh again</button></div>',
        frame('Skeleton', sk),
    ]) + '</div>') + sec('KPI and table states', '', grid(
        '<section class="card kpi s-3"><div class="kpi__l">Revenue</div><div class="skel" style="height:32px;width:60%"></div><div class="skel" style="height:12px;width:40%"></div></section>',
        '<section class="card kpi s-3"><div class="kpi__l">Revenue</div><div class="kpi__v">—</div><div class="kpi__m"><span>No data for this period</span></div></section>',
        f'<section class="card kpi s-3 kpi--status is-crit"><div class="kpi__l">Revenue</div><div class="kpi__v" style="font:var(--t-sub1)">Couldn’t load</div><div class="kpi__m"><button class="btn btn--s" data-state-retry>{ic("arrow_clockwise")}Retry</button></div></section>',
        f'<section class="card kpi s-3"><div class="kpi__l">Revenue {ic("lock_closed", "ic--s")}</div><div class="kpi__v" style="font:var(--t-sub1)">Restricted</div><div class="kpi__m"><span>Ask Finance for access</span></div></section>',
        dtable({'caption': 'Empty table', 'noun': 'rows', 'columns': [{'key': 'a', 'label': 'Product'}, {'key': 'b', 'label': 'Sales', 'type': 'inr'}], 'rows': []}, title='Empty table', sub='No matching rows', span='s-6'))) + sec('Rules', '', guide_html('<ul><li>Say what happened and what to do next.</li><li>Keep the card size stable across states.</li><li>On refresh, hold the previous chart at reduced opacity.</li></ul>', '<ul><li>Flashing a skeleton on every refetch.</li><li>Technical errors without an ID or a retry.</li><li>Empty states with no action.</li></ul>'))
    page('design-system/states.html', 'Empty, Loading & Error States', 'Loading, empty, no data, error, permission denied, offline, refreshing and skeleton — for charts, KPIs and tables.', body, crumbs=[DS], actions='', scripts=('charts', 'table', 'ds'))

# ------------------------------------------------------------------ home
def home():
    tile = lambda href, icon, t, d, tags: f'<a class="card card--int tile" href="{href}"><div class="tile__h"><span class="kpi__ico">{ic(icon)}</span><b>{t}</b></div><p>{d}</p><ul>{"".join(f"<li>{x}</li>" for x in tags)}</ul></a>'
    hero = (f'<section class="hero"><div><span class="badge badge--tint">Fluent 2 · Enterprise reporting</span><h1 style="margin-top:12px">Reports &amp; Analytics design system</h1>'
            f'<p>Dashboards, chart galleries, layout combinations, a report builder and the design system behind them — for ERP and CRM applications. Every chart is one neutral spec drawn by <b>ECharts</b>, <b>Highcharts</b> or <b>Chart.js</b>; switch engines in the header and watch the whole app re-render.</p>'
            f'<div class="row" style="margin-top:16px"><a class="btn btn--primary" href="dashboards/executive.html">{ic("board")}Open executive dashboard</a><a class="btn" href="reports/pie.html">{ic("data_pie")}Browse charts</a><a class="btn btn--subtle" href="report-builder/index.html#edit">{ic("design_ideas")}Report builder</a></div></div>'
            f'<div class="hero__stats">' + ''.join(f'<div><b>{a}</b><span>{b}</span></div>' for a, b in [('14', 'dashboards'), ('19', 'chart galleries'), ('15', 'layout combinations'), ('3', 'chart engines'), ('23', 'chart types'), ('8', 'component states')]) + '</div></section>')
    tiles = '<div class="tiles">' + ''.join([
        tile('dashboards/executive.html', 'board', 'Dashboards', 'Executive, operations, management, KPI and a customizable dashboard.', ['Executive', 'Operations', 'Management', 'KPI', 'Custom']),
        tile('dashboards/inventory.html', 'apps', 'Business dashboards', 'Nine function dashboards with filters, cross-filtering, drill-down and report tables.', ['Inventory', 'Sales', 'Procurement', 'Finance', 'Customers', 'HR', 'Projects', 'Supply chain', 'Operations']),
        tile('reports/bar.html', 'data_pie', 'Chart galleries', 'Every chart type with variants, a live permutation explorer and usage rules.', ['Pie', 'Bar', 'Line', 'Combo', 'Heatmap', 'Sankey', '+13']),
        tile('layouts/index.html', 'layout_column_two', 'Layout combinations', 'Fifteen ways to arrange KPIs, charts, filters and tables on the 12-column grid.', ['Single', 'Two/three column', 'KPI + chart', 'Executive summary', 'Wallboard']),
        tile('report-builder/index.html#edit', 'design_ideas', 'Report builder', 'Drag, resize, configure data, filters, grouping, sorting, calculations and export.', ['Canvas', 'Properties', 'Calculated fields', 'Undo']),
        tile('libraries/index.html', 'chart_multiple', 'Chart libraries', 'ECharts vs Highcharts vs Chart.js — comparison, support matrix and the same spec three ways.', ['ECharts', 'Highcharts', 'Chart.js']),
        tile('design-system/index.html', 'color', 'Design system', 'Colors, type, components, KPI cards, filters, tables, legends, tooltips and states.', ['Tokens', 'KPI cards', 'Tables', 'States']),
    ]) + '</div>'
    snap = (sec('How charts combine into a dashboard', 'Headline numbers first, then the trend that explains them, then the breakdowns. Change the engine or theme in the header — this snapshot re-renders.',
                flow('Filters', 'KPIs', 'Trend', 'Mix', 'Breakdown', 'Detail') + kpis(kpi('Revenue', 12.4e7, INR, '18.4%', sub='vs last year', spark=[round(v / 1e6, 1) for v in REV]), kpi('Orders', 4820, CNT, '12.2%', sub='vs last year', spark=ORDERS, spark_kind='bars'), kpi('Inventory', 8.7e7, INR, '4.6%', good=False, sub='working capital'), kpi('Purchase orders', 1284, CNT, '7.5%', sub='vs last year'))
                + grid(cc('Revenue trend', 'This year vs last year', {'type': 'line', 'categories': M12, 'unit': INR, 'smooth': True, 'series': [S('This year', REV, type='area'), S('Last year', REV_LY, dashed=True, c=8)]}, h=280, span='s-8'),
                       cc('Sales by category', 'Revenue share', {'type': 'pie', 'donut': True, 'unit': INR, 'labels': False, 'centerLabel': 'Revenue', 'data': [{'name': c, 'value': v} for c, v in zip(CATS, CAT_SALES)]}, h=280, span='s-4'))))
    body = hero + sec('Explore', '', tiles) + snap + note('All figures are <b>illustrative sample data</b> for a fictional Indian manufacturer-distributor (Oct 2025 – Sep 2026). Highcharts is used here for evaluation; commercial use requires a licence.')
    page('index.html', 'Reports & Analytics', 'Enterprise reporting and dashboard design system in the Fluent 2 style.', f'<div class="page">{body}</div>', raw=True, crumbs=[])

def build():
    layouts(); builder(); libraries(); ds_index(); ds_cards(); ds_kpis(); ds_filters(); ds_tables(); ds_legends(); ds_states(); home()
