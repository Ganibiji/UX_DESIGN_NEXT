"""Chart galleries: every chart type with variants, a live permutation explorer and usage guidance."""
from lib import *
from pages_dash import S, REV, REV_LY, ORDERS, REGION_REV, CAT_SALES, CAT_DRILL, PRODUCTS, PROD_REV, tilemap_spec

REP = ('Reports', 'reports/pie.html')
CAT6 = [{'name': c, 'value': v} for c, v in zip(CATS, CAT_SALES)]
INV6 = [{'name': c, 'value': v} for c, v in zip(CATS, [2.31e7, 1.74e7, 1.32e7, 1.21e7, .96e7, 1.16e7])]
SEG4 = [{'name': n, 'value': v} for n, v in [('SMB', 11240), ('Mid-market', 4680), ('Enterprise', 1820), ('Government', 680)]]
EXP5 = [{'name': n, 'value': v} for n, v in [('Materials', 4.9e7), ('Payroll', 2.2e7), ('Logistics', 1.1e7), ('Facilities', .7e7), ('Other', .7e7)]]
ORD4 = [{'name': n, 'value': v} for n, v in [('Delivered', 3912), ('In transit', 486), ('Processing', 318), ('Cancelled', 104)]]

def xp(spec, controls, init=None, title='Permutation explorer', sub='Change one dimension at a time'):
    i = cid('xp')
    cfg = {'spec': spec, 'controls': controls, 'init': init or {}}
    return (f'<div class="xp" id="{i}" data-xp="{esc(J(cfg))}"><div class="xp__ctl" role="group" aria-label="Variant controls"></div>'
            f'<div class="xp__out" data-size="l"><div class="stack" style="width:100%;align-items:center">{cc(title, sub, spec, h=320, span="")}<p class="xp__code" aria-live="polite"></p></div></div></div>')

def matrix(rows):
    head = '<tr><th scope="col">Dimension</th><th scope="col">Variants shown</th><th scope="col">Where to try it</th></tr>'
    return '<div class="dt"><div class="dt__wrap" style="border-top:0"><table class="mx" style="min-width:640px"><thead>' + head + '</thead><tbody>' + ''.join(f'<tr><th scope="row">{esc(a)}</th><td>{esc(b)}</td><td>{esc(c)}</td></tr>' for a, b, c in rows) + '</tbody></table></div></div>'

def std_matrix(orient='Vertical · Horizontal', color='Fluent categorical · Monochrome · Highlight', extra=()):
    return matrix([
        ('Orientation', orient, 'Explorer › Orientation'), ('Color', color, 'Explorer › Color; Chart details › Palette'),
        ('Data density', 'Compact (5) · Regular (8) · Dense (12)', 'Explorer › Data density'), ('Labels', 'Off · On (selective, never every point)', 'Explorer › Data labels'),
        ('Legend', 'On (2+ series) · Off', 'Explorer › Legend; click legend items to filter'), ('Tooltip', 'On · Off', 'Explorer › Tooltip'),
        ('Interaction', 'Hover · click select · cross-filter · drill-down · zoom', 'Variant cards below; ⋮ menu'), ('Dashboard position', 'Hero (8 of 12) · Half (6) · Third (4)', 'Business dashboards'),
        ('Card size', 'Small · Medium · Large', 'Explorer › Card size'), ('Theme', 'Light · Dark · High contrast', 'Explorer › Theme; header theme menu'), *extra])

def guide(do, dont):
    return (f'<div class="do-dont"><div><b>{ic("checkmark_circle")}Use it for</b>{do}</div><div><b>{ic("dismiss")}Avoid</b>{dont}</div></div>')

def used(*links):
    return '<div class="flow">' + ic('board') + '<span>Used in:</span>' + ''.join(f'<a class="badge badge--outline" href="../{h}">{esc(t)}</a>' for t, h in links) + '</div>'

def gallery(slug, title, desc, sections, explorer_html=None, mx=None, gd=None, use=None):
    body = ''
    if gd or use:
        body += (use or '') + (gd or '')
    for t, d, items in sections:
        body += sec(t, d, grid(*items))
    if explorer_html:
        body += sec('Permutation explorer', 'Orientation, color, density, labels, legend, tooltip, size, theme and engine — combine them and watch one chart change.', explorer_html)
    if mx:
        body += sec('Permutation matrix', 'Every major chart type is varied across the same dimensions.', mx)
    page(f'reports/{slug}.html', title, desc, body, crumbs=[REP])

def V(t, s, spec, h=240, span='s-4', **kw):
    return cc(t, s, spec, h=h, span=span, **kw)

# ================================================================== Pie
def pie():
    base = {'type': 'pie', 'unit': INR, 'data': CAT6}
    gallery('pie', 'Pie Charts', 'Part-to-whole at a glance — keep to six slices or fewer and prefer bars when values are close. <b>Sample data.</b>', [
        ('Basic', 'Six forms of the same idea.', [
            V('Standard pie', 'Sales by category', {**base, 'labels': True, 'legend': False}),
            V('Donut', 'Inventory by category', {'type': 'pie', 'donut': True, 'unit': INR, 'data': INV6, 'labels': False, 'centerLabel': 'Stock value'}),
            V('Semi-donut', 'Order status this month', {'type': 'pie', 'donut': True, 'semi': True, 'data': ORD4, 'labels': False, 'centerLabel': 'Orders'}),
            V('Half pie', 'Customer segments', {'type': 'pie', 'semi': True, 'data': SEG4, 'labels': False}),
            V('Nested donut', 'Expenses: Opex / Capex inside, items outside', {'type': 'pie', 'unit': INR, 'innerName': 'Type', 'inner': [{'name': 'Opex', 'value': 8.9e7}, {'name': 'Capex', 'value': 1.5e7}],
              'data': [{'name': 'Materials', 'value': 4.9e7}, {'name': 'Payroll', 'value': 2.2e7}, {'name': 'Logistics', 'value': 1.1e7}, {'name': 'Facilities', 'value': .7e7}, {'name': 'Plant & machinery', 'value': 1.5e7}], 'labels': False}),
            V('Multi-level donut', 'Revenue: region inside, channel outside', {'type': 'pie', 'unit': INR, 'innerName': 'Region', 'inner': [{'name': 'North + West', 'value': 6.13e7}, {'name': 'South + East + Central', 'value': 6.27e7}],
              'data': [{'name': 'Distributors', 'value': 5.21e7}, {'name': 'Direct B2B', 'value': 3.47e7}, {'name': 'E-commerce', 'value': 2.11e7}, {'name': 'Modern trade', 'value': 1.61e7}], 'labels': False}),
        ]),
        ('Styling', 'Same data, different finish. Fluent is the default.', [
            V('Flat', 'No rounding, no labels', {**base, 'flat': True, 'labels': False}),
            V('Minimal', 'Three slices, legend off, labels carry identity', {'type': 'pie', 'donut': True, 'data': [{'name': 'Domestic', 'value': 78}, {'name': 'Export', 'value': 17}, {'name': 'Other', 'value': 5}], 'unit': PCT0, 'legend': False, 'labels': True, 'center': False}),
            V('Fluent', 'Default: 2px surface gaps, 3px corners, legend below', {'type': 'pie', 'donut': True, 'unit': INR, 'data': CAT6[:5], 'labels': False, 'centerLabel': 'Revenue'}),
            V('Monochrome', 'One blue ramp — for print and branded decks', {**base, 'palette': 'mono', 'labels': False, 'donut': True, 'centerLabel': 'Revenue'}),
            V('Gradient', 'Radial shading on each slice', {**base, 'gradient': True, 'labels': False}),
            V('Highlighted slice', 'One slice in color, the rest recede', {**base, 'highlight': 0, 'labels': True, 'legend': False}),
            V('Exploded slice', 'Pull out the slice under discussion', {**base, 'explode': 1, 'labels': True, 'legend': False}),
        ]),
        ('Interaction', 'Hover, tooltip, selection, legend filtering and drill-down.', [
            V('Hover', 'Point at a slice: it grows and others dim', {**base, 'labels': False, 'donut': True, 'centerLabel': 'Revenue'}),
            V('Tooltip', 'Rupees in full plus share of total', {'type': 'pie', 'unit': INR, 'data': EXP5, 'labels': False}),
            V('Click selection', 'Click a slice — the selection is reported below the chart', {**base, 'select': True, 'labels': False}),
            V('Legend filtering', 'Click legend items to hide or show slices', {'type': 'pie', 'donut': True, 'data': SEG4, 'labels': False, 'centerLabel': 'Customers'}),
            V('Drill-down', 'Click Electrical, Hardware or Packaging', {**base, 'drill': CAT_DRILL, 'labels': True, 'legend': False}),
        ]),
        ('Data formats', 'Percentage, currency, count and category distribution.', [
            V('Percentage', 'Share of revenue', {**base, 'labels': True, 'legend': False}),
            V('Currency', 'Value labels in ₹', {'type': 'pie', 'unit': INR, 'data': EXP5, 'labels': True, 'labelMode': 'value', 'legend': False}),
            V('Count', 'Orders by status', {'type': 'pie', 'donut': True, 'data': ORD4, 'labels': True, 'labelMode': 'value', 'legend': False, 'centerLabel': 'Orders'}),
            V('Category distribution', 'Customers by segment', {'type': 'pie', 'data': SEG4, 'labels': True, 'legend': True}),
        ]),
    ], xp({**base, 'labels': False, 'donut': True}, ['pieform', 'palette', 'density', 'labels', 'legend', 'tooltip', 'size', 'theme', 'engine'], {'pieform': 'donut'}, 'Sales by category', 'Explorer — pie variants'),
        std_matrix('Pie · Donut · Semi-donut · Half pie · Rose'), guide('<p>A part-to-whole split with up to six slices, where one or two slices dominate.</p>', '<p>Comparing close values, more than six slices or change over time — use a bar or line chart instead.</p>'),
        used(('Executive', 'dashboards/executive.html'), ('Inventory', 'dashboards/inventory.html'), ('Sales', 'dashboards/sales.html'), ('Finance', 'dashboards/finance.html')))

# ================================================================== Bar (all orientations)
def bar():
    reg = {'categories': REGIONS, 'unit': INR, 'series': [S('Revenue', REGION_REV)]}
    q = ['Q1', 'Q2', 'Q3', 'Q4']
    gallery('bar', 'Bar Charts', 'Compare magnitudes across categories — vertical and horizontal, grouped, stacked, ranked and against targets. <b>Sample data.</b>', [
        ('Orientation and arrangement', '', [
            V('Vertical bar', 'Sales by region', {'type': 'column', **reg, 'labels': True}),
            V('Horizontal bar', 'Top products — long labels read better horizontally', {'type': 'bar', 'categories': PRODUCTS[:6], 'unit': INR, 'series': [S('Revenue', PROD_REV[:6])], 'labels': True}),
            V('Grouped bar', 'Warehouse performance: inbound vs outbound', {'type': 'column', 'categories': WHS, 'series': [S('Inbound', [9200, 7800, 6900, 4800, 4200]), S('Outbound', [8800, 7600, 7100, 4500, 3900])]}),
            V('Stacked bar', 'Supplier spend by quarter', {'type': 'bar', 'categories': SUPPLIERS[:5], 'unit': INR, 'stack': 'normal', 'labels': True, 'series': [S(x, [round(v * f) for v in [2.1e6, 1.0e6, 1.4e6, .55e6, .48e6]]) for x, f in zip(q, [.9, 1.0, 1.1, 1.2])]}),
            V('100% stacked bar', 'Department expenses by type', {'type': 'bar', 'categories': DEPTS, 'stack': 'percent', 'series': [S('Payroll', [52, 61, 70, 34, 78, 48]), S('Travel', [18, 6, 5, 12, 4, 6]), S('Software', [10, 8, 15, 6, 8, 34]), S('Other', [20, 25, 10, 48, 10, 12])]}),
            V('Floating bar', 'Delivery window by supplier (earliest–latest day)', {'type': 'bar', 'categories': SUPPLIERS, 'unit': {'suf': ' d'}, 'series': [S('Delivery window', [[6, 18], [5, 14], [7, 21], [4, 11], [8, 24], [6, 16]])]}),
        ]),
        ('Signed values', 'Positive/negative and diverging bars use the blue ↔ red diverging pair.', [
            V('Positive / negative', 'Monthly variance to budget, ₹', {'type': 'column', 'categories': M12, 'unit': INR, 'diverge': True, 'series': [S('Variance', [1.2e6, -.4e6, 2.1e6, -1.6e6, -.8e6, .6e6, 1.4e6, .9e6, -.3e6, 1.1e6, 1.8e6, 2.4e6])]}),
            V('Diverging bar', 'Supplier survey: “Payments are on time”', {'type': 'bar', 'categories': ['Steel', 'Electrical', 'Packaging', 'Logistics', 'Services'], 'stack': 'normal', 'unit': PCT0,
              'series': [S('Strongly disagree', [-8, -4, -12, -15, -6], tone='neg'), S('Disagree', [-14, -9, -18, -20, -10], tone='neg-l'), S('Agree', [48, 52, 44, 41, 50], tone='pos-l'), S('Strongly agree', [30, 35, 26, 24, 34], tone='pos')]}, span='s-8'),
        ]),
        ('Ranking', 'Sorted, Top 5 and Top 10.', [
            V('Ranked bar', 'Salespeople by revenue, sorted', {'type': 'bar', 'categories': ['Meera', 'Sneha', 'Kabir', 'Rohit', 'Vikram', 'Arjun'], 'unit': INR, 'sort': 'desc', 'labels': True, 'series': [S('Booked', [.86e7, 1.42e7, .74e7, 1.21e7, .91e7, 1.18e7])]}),
            V('Top 5', 'Products by revenue', {'type': 'bar', 'categories': PRODUCTS, 'unit': INR, 'top': 5, 'sort': 'desc', 'labels': True, 'series': [S('Revenue', PROD_REV)]}),
            V('Top 10', 'Products by revenue', {'type': 'bar', 'categories': PRODUCTS, 'unit': INR, 'sort': 'desc', 'series': [S('Revenue', PROD_REV)]}, h=320),
        ]),
        ('Comparison', 'Against a target or the previous period.', [
            V('Comparison bar', 'This year vs last year by region', {'type': 'column', 'categories': REGIONS, 'unit': INR, 'series': [S('Last year', [round(v * .85) for v in REGION_REV], gray=True), S('This year', REGION_REV)]}),
            V('Target vs actual', 'Warehouse throughput against the 8,000-unit target', {'type': 'column', 'categories': WHS, 'labels': True, 'target': {'value': 8000, 'label': 'Target'}, 'series': [S('Units', [9200, 7800, 8600, 4800, 4200], pst=[None, 'warn', None, 'crit', 'crit'])]}),
            V('Previous period', 'Department expenses, ghosted previous quarter', {'type': 'bar', 'categories': DEPTS, 'unit': INR, 'series': [S('Previous quarter', [3.1e7, 4.4e7, 1.0e7, 2.4e7, .8e7, 1.5e7], ghost=True, c=1), S('This quarter', [3.4e7, 4.1e7, .9e7, 2.6e7, .7e7, 1.7e7], c=1)]}),
        ]),
        ('Labels, legend, theme and size', 'The same chart permuted.', [
            V('With labels', 'Selective value labels', {'type': 'column', **reg, 'labels': True}, span='s-3', h=220),
            V('Without labels', 'Axis and tooltip carry values', {'type': 'column', **reg}, span='s-3', h=220),
            V('With legend', 'Two series', {'type': 'column', 'categories': REGIONS, 'unit': INR, 'series': [S('Last year', [round(v * .85) for v in REGION_REV], gray=True), S('This year', REGION_REV)]}, span='s-3', h=220),
            V('Without legend', 'Title names the single series', {'type': 'column', **reg, 'legend': False}, span='s-3', h=220),
            V('Light', 'Card-level light theme', {'type': 'column', **reg}, span='s-3', h=200, theme='light'),
            V('Dark', 'Card-level dark theme', {'type': 'column', **reg}, span='s-3', h=200, theme='dark'),
            V('Compact', 'Small card, dense data', {'type': 'column', 'categories': M12, 'unit': INR, 'series': [S('Revenue', REV)], 'legend': False}, span='s-3', h=160),
            V('Large', 'Hero size', {'type': 'column', 'categories': M12, 'unit': INR, 'series': [S('Revenue', REV)], 'labels': True}, span='s-3', h=200),
        ]),
    ], xp({'type': 'column', 'categories': M12, 'unit': INR, 'series': [S('Distributors', [round(v * .42) for v in REV]), S('Direct B2B', [round(v * .28) for v in REV]), S('E-commerce', [round(v * .17) for v in REV]), S('Modern trade', [round(v * .13) for v in REV])]},
              ['orient', 'mode', 'palette', 'density', 'labels', 'legend', 'tooltip', 'size', 'theme', 'engine'], {'density': 'm'}, 'Revenue by channel', 'Explorer — bar variants'),
        std_matrix(), guide('<p>Comparing values across categories, ranking, and part-to-whole across several groups (stacked).</p>', '<p>Truncated value axes, more than eight series, or a single bar (use a KPI card).</p>'),
        used(('Executive', 'dashboards/executive.html'), ('Inventory', 'dashboards/inventory.html'), ('Management', 'dashboards/management.html')))

# ================================================================== Column
def column():
    gallery('column', 'Column Charts', 'Vertical bars for categories with a natural order — months, age bands, stages. <b>Sample data.</b>', [
        ('Column variants', '', [
            V('Basic column', 'Revenue by month', {'type': 'column', 'categories': M12, 'unit': INR, 'series': [S('Revenue', REV)]}),
            V('Grouped column', 'Revenue vs expense', {'type': 'column', 'categories': M12[-6:], 'unit': INR, 'series': [S('Revenue', REV[-6:]), S('Expense', [round(v * .78) for v in REV[-6:]], c=2)]}),
            V('Stacked column', 'Orders by channel', {'type': 'column', 'categories': M12[-6:], 'stack': 'normal', 'labels': True, 'series': [S('Distributors', [1820, 1910, 1880, 1990, 2040, 2120]), S('Direct', [1210, 1260, 1240, 1300, 1330, 1390]), S('E-commerce', [610, 680, 720, 780, 820, 880])]}),
            V('100% stacked column', 'Share of orders by channel', {'type': 'column', 'categories': M12[-6:], 'stack': 'percent', 'series': [S('Distributors', [1820, 1910, 1880, 1990, 2040, 2120]), S('Direct', [1210, 1260, 1240, 1300, 1330, 1390]), S('E-commerce', [610, 680, 720, 780, 820, 880])]}),
            V('With labels', 'Inventory aging', {'type': 'column', 'categories': ['0–30', '31–60', '61–90', '91–180', '180+'], 'unit': INR, 'labels': True, 'series': [S('Stock value', [3.62e7, 2.31e7, 1.28e7, .94e7, .45e7])]}),
            V('With target', 'Output by line vs plan', {'type': 'column', 'categories': ['L1', 'L2', 'L3', 'L4', 'L5'], 'target': {'value': 30000, 'label': 'Plan'}, 'labels': True, 'series': [S('Output', [33400, 29100, 31800, 24600, 23100])]}),
            V('Negative values', 'Net cash movement by month', {'type': 'column', 'categories': M12, 'unit': INR, 'diverge': True, 'series': [S('Net cash', [.9e6, -.3e6, 1.8e6, -1.1e6, .4e6, .7e6, -.6e6, 1.2e6, .8e6, -.2e6, 1.5e6, 2.1e6])]}),
            V('Highlighted column', 'Festive-season peak called out', {'type': 'column', 'categories': M12, 'unit': INR, 'highlight': 2, 'series': [S('Revenue', REV)]}),
            V('Status columns', 'Receivables aging with status color', {'type': 'column', 'categories': ['Current', '1–30', '31–60', '61–90', '90+'], 'unit': INR, 'labels': True, 'series': [S('Receivables', [2.1e7, 1.02e7, .54e7, .31e7, .23e7], pst=[None, None, 'warn', 'serious', 'crit'])]}),
        ]),
    ], xp({'type': 'column', 'categories': M12, 'unit': INR, 'series': [S('North', [round(v * .28) for v in REV]), S('South', [round(v * .24) for v in REV]), S('West', [round(v * .22) for v in REV])]},
              ['mode', 'palette', 'density', 'labels', 'legend', 'target', 'size', 'theme', 'engine'], {'density': 'l'}, 'Revenue by region', 'Explorer — column variants'),
        std_matrix('Vertical (horizontal lives on Bar charts)'), guide('<p>Ordered categories — months, aging buckets, stages — and side-by-side comparisons.</p>', '<p>Long category labels (rotate to horizontal bars) or a value axis that doesn’t start at zero.</p>'),
        used(('Finance', 'dashboards/finance.html'), ('Procurement', 'dashboards/procurement.html'), ('Operations', 'dashboards/operations.html')))

# ================================================================== Line
def line():
    fc = REV[:9] + [None, None, None]
    fut = [None] * 8 + [REV[8], 1.19e7, 1.25e7, 1.31e7]
    gallery('line', 'Line Charts', 'Change over time — trends, comparisons against last period, targets, thresholds and forecasts. <b>Sample data.</b>', [
        ('Line forms', '', [
            V('Basic line', 'Revenue trend', {'type': 'line', 'categories': M12, 'unit': INR, 'series': [S('Revenue', REV)]}),
            V('Multi-line', 'Revenue by region', {'type': 'line', 'categories': M12, 'unit': INR, 'labels': 'end', 'series': [S(r, [round(v * f) for v in REV]) for r, f in zip(REGIONS[:4], [.28, .24, .22, .15])]}),
            V('Smooth line', 'Orders trend', {'type': 'line', 'categories': M12, 'smooth': True, 'series': [S('Orders', ORDERS)]}),
            V('Dashed line', 'Last year shown dashed', {'type': 'line', 'categories': M12, 'unit': INR, 'series': [S('This year', REV), S('Last year', REV_LY, dashed=True, gray=True)]}),
            V('Area line', 'Customer growth', {'type': 'area', 'categories': M12, 'series': [S('Active customers', trend(16100, 18420, seed=4))], 'zero': False}),
            V('Multi-area', 'Inventory movement, overlapping', {'type': 'area', 'categories': M12, 'smooth': True, 'series': [S('Inbound', trend(41000, 52000, seed=43)), S('Outbound', trend(39500, 50600, seed=44), c=2)]}),
            V('Stacked area', 'Expense trend by type', {'type': 'area', 'categories': M12, 'unit': INR, 'stack': 'normal', 'series': [S('Materials', trend(3.4e6, 4.6e6, seed=7)), S('Payroll', trend(1.7e6, 1.9e6, seed=8)), S('Logistics', trend(.8e6, 1.0e6, seed=9))]}),
            V('Step line', 'Price list changes', {'type': 'line', 'categories': M12, 'unit': {'pre': '₹'}, 'series': [S('MCB 32A list price', [412, 412, 412, 436, 436, 436, 436, 452, 452, 452, 470, 470], step=True)]}),
        ]),
        ('Reference lines', 'Targets, thresholds and comparison periods.', [
            V('Target line', 'Revenue vs ₹1.1 Cr plan', {'type': 'line', 'categories': M12, 'unit': INR, 'target': {'value': 1.1e7, 'label': 'Plan'}, 'series': [S('Revenue', REV)]}),
            V('Threshold line', 'Churn with 3% alert', {'type': 'line', 'categories': M12, 'unit': PCT, 'threshold': {'value': 3, 'label': 'Alert'}, 'symbols': True, 'series': [S('Churn', trend(2.9, 2.4, seed=87, dp=1))]}),
            V('Comparison period', 'This quarter vs same quarter last year, by week', {'type': 'line', 'categories': [f'W{i}' for i in range(1, 14)], 'series': [S('This year', trend(340, 420, n=13, seed=5)), S('Last year', trend(300, 360, n=13, seed=6), dashed=True, gray=True)]}),
        ]),
        ('Forecasts', 'Shaded forecast region, dashed continuation and a confidence band.', [
            V('Forecast line', 'Shaded forecast months', {'type': 'line', 'categories': M12, 'unit': INR, 'forecastFrom': 9, 'series': [S('Revenue', REV)]}),
            V('Actual vs forecast', 'Actual to June, forecast with an 80% band', {'type': 'line', 'categories': M12, 'unit': INR, 'forecastFrom': 9,
              'series': [S('80% interval', [None] * 8 + [[REV[8], REV[8]], [1.12e7, 1.26e7], [1.15e7, 1.35e7], [1.18e7, 1.44e7]], type='range', c=1), S('Actual', fc), S('Forecast', fut, dashed=True)]}, span='s-8'),
        ]),
    ], xp({'type': 'line', 'categories': M12, 'unit': INR, 'series': [S('This year', REV), S('Last year', REV_LY, gray=True)]}, ['linekind', 'palette', 'density', 'labels', 'legend', 'target', 'tooltip', 'size', 'theme', 'engine'], {'density': 'l'}, 'Revenue trend', 'Explorer — line variants'),
        std_matrix('Line · Smooth · Area · Step'), guide('<p>Continuous change over time; up to four series directly labelled at the line ends.</p>', '<p>Unordered categories, more than four crossing lines, or two y-axes on one plot.</p>'),
        used(('Executive', 'dashboards/executive.html'), ('Sales', 'dashboards/sales.html'), ('Customers', 'dashboards/customers.html')))

# ================================================================== Area
def area():
    ch = [S(n, [round(v * f) for v in REV]) for n, f in [('Distributors', .42), ('Direct B2B', .28), ('E-commerce', .17), ('Modern trade', .13)]]
    gallery('area', 'Area Charts', 'Volume over time — totals, composition and uncertainty. <b>Sample data.</b>', [
        ('Area variants', '', [
            V('Basic area', 'Stock value', {'type': 'area', 'categories': M12, 'unit': INR, 'series': [S('Stock value', trend(7.4e7, 8.7e7, seed=42))], 'zero': False}),
            V('Stacked area', 'Revenue by channel', {'type': 'area', 'categories': M12, 'unit': INR, 'stack': 'normal', 'series': ch}),
            V('100% stacked area', 'Channel share of revenue', {'type': 'area', 'categories': M12, 'stack': 'percent', 'series': ch}),
            V('Gradient area', 'Website sessions', {'type': 'area', 'categories': M12, 'gradient': True, 'smooth': True, 'series': [S('Sessions', trend(82000, 126000, seed=21, season=SEASON))]}),
            V('Multi-series area', 'Inbound vs outbound units', {'type': 'area', 'categories': M12, 'series': [S('Inbound', trend(41000, 52000, seed=43)), S('Outbound', trend(39500, 50600, seed=44), c=2)]}),
            V('Forecast area', 'Demand with forecast months shaded', {'type': 'area', 'categories': M12, 'forecastFrom': 9, 'gradient': True, 'series': [S('Units demanded', trend(38000, 52000, seed=45))]}),
            V('Range area', 'Daily temperature in Chennai WH-2 (min–max) with average', {'type': 'line', 'categories': M12, 'unit': {'suf': '°C'}, 'zero': False,
              'series': [S('Min–max', [[t - 4, t + 5] for t in [27, 25, 24, 25, 27, 30, 33, 34, 32, 31, 30, 29]], type='range'), S('Average', [27, 25, 24, 25, 27, 30, 33, 34, 32, 31, 30, 29])]}, span='s-8'),
        ]),
    ], xp({'type': 'area', 'categories': M12, 'unit': INR, 'series': ch[:3]}, ['areamode', 'palette', 'density', 'legend', 'tooltip', 'size', 'theme', 'engine'], {'density': 'l'}, 'Revenue by channel', 'Explorer — area variants'),
        std_matrix('Overlap · Stacked · 100% stacked'), guide('<p>Totals and composition over time; ranges and forecast uncertainty.</p>', '<p>Overlapping more than three translucent areas — switch to lines or stack them.</p>'))

# ================================================================== Combo
def combo():
    exp = [round(v * .78) for v in REV]
    margin = [round((a - b) / a * 100, 1) for a, b in zip(REV, exp)]
    growth = [round((a / b - 1) * 100, 1) for a, b in zip(REV, REV_LY)]
    idx = lambda a: [round(x / a[0] * 100, 1) for x in a]
    gallery('combo', 'Combo Charts', 'Two marks on one time axis. Same unit → one scale. Different units → <b>stacked panels</b> that share the x-axis, never two y-axes on one plot. <b>Sample data.</b>', [
        ('Same scale', 'Both measures share one unit, so one axis is honest.', [
            V('Bar + Line', 'Revenue bars with plan line', {'type': 'combo', 'categories': M12, 'unit': INR, 'series': [S('Revenue', REV), S('Plan', trend(9.0e6, 11.6e6, seed=51, noise=0), type='line', gray=True, dashed=True)]}),
            V('Bar + Area', 'Monthly orders with 3-month average', {'type': 'combo', 'categories': M12, 'series': [S('3-month average', [round(sum(ORDERS[max(0, i - 2):i + 1]) / len(ORDERS[max(0, i - 2):i + 1])) for i in range(12)], type='area', c=2), S('Orders', ORDERS)]}),
            V('Line + Area', 'Revenue this year over last year’s area', {'type': 'combo', 'categories': M12, 'unit': INR, 'series': [S('Last year', REV_LY, type='area', gray=True), S('This year', REV, type='line')]}),
            V('Actual + Target', 'Output by line, target as a line', {'type': 'combo', 'categories': ['Line 1', 'Line 2', 'Line 3', 'Line 4', 'Line 5'], 'series': [S('Actual', [33400, 29100, 31800, 24600, 23100]), S('Target', [30000, 30000, 32000, 28000, 26000], type='line', c=2, symbols=True)]}),
        ]),
        ('Different scales — stacked panels', 'Rupees on top, percent or count below. Each panel has its own axis; the months line up.', [
            V('Revenue + Margin', 'Revenue (₹) and gross margin (%)', {'type': 'combo', 'categories': M12, 'unit': INR, 'unit2': PCT, 'panelNames': ['Revenue', 'Margin'], 'series': [S('Revenue', REV), S('Margin', margin, type='line', panel=1, c=7)]}, h=320, span='s-6'),
            V('Sales + Orders', 'Revenue (₹) and order count', {'type': 'combo', 'categories': M12, 'unit': INR, 'unit2': CNT, 'panelNames': ['Revenue', 'Orders'], 'series': [S('Revenue', REV), S('Orders', ORDERS, type='line', panel=1, c=2)]}, h=320, span='s-6'),
            V('Revenue + Growth %', 'Revenue (₹) and year-on-year growth (%)', {'type': 'combo', 'categories': M12, 'unit': INR, 'unit2': PCT, 'panelNames': ['Revenue', 'YoY growth'], 'series': [S('Revenue', REV), S('YoY growth', growth, type='line', panel=1, c=3, symbols=True)]}, h=320, span='s-6'),
            V('Indexed alternative', 'Both measures indexed to Oct = 100 on one honest axis', {'type': 'line', 'categories': M12, 'zero': False, 'labels': 'end', 'series': [S('Revenue', idx(REV)), S('Orders', idx(ORDERS), c=2)]}, h=320, span='s-6'),
        ]),
    ], None, matrix([('Same unit', 'Bar + Line · Bar + Area · Line + Area · Actual + Target', 'Same-scale cards'), ('Different units', 'Stacked panels with a shared x-axis', 'Revenue + Margin · Sales + Orders · Revenue + Growth %'),
                     ('Alternative', 'Index both to a common base (=100)', 'Indexed alternative'), ('Engines', 'ECharts grids · Highcharts y-axis panes · Chart.js stacked scales', 'Switch engine in the header'), ('Theme', 'Light · Dark · HC', 'Header theme menu')]),
        guide('<p>A measure and its benchmark on the same unit, or two related measures on aligned panels.</p>', '<p>Dual y-axes on one plot: the alignment of two scales is arbitrary and invents correlations.</p>'),
        used(('Sales', 'dashboards/sales.html'), ('Procurement', 'dashboards/procurement.html'), ('Finance', 'dashboards/finance.html'), ('Plant operations', 'dashboards/plant-operations.html')))

# ================================================================== Scatter / bubble
def scatter():
    r = rnd(131)
    pts = lambda n, ax, bx, ay, by, k: [[round(r.uniform(ax, bx), 1), round(ay + (r.uniform(ax, bx)) * k + r.uniform(-by, by), 1)] for _ in range(n)]
    gallery('scatter', 'Scatter Charts', 'Relationships between two measures — correlation, clusters and outliers. Limit to three series. <b>Sample data.</b>', [
        ('Scatter variants', '', [
            V('Basic scatter', 'Discount % vs order size (₹ K)', {'type': 'scatter', 'xName': 'Discount %', 'yName': 'Order size (₹ K)', 'xUnit': PCT0, 'yUnit': {'pre': '₹', 'suf': 'K'}, 'series': [S('Orders', pts(60, 0, 18, 40, 30, 6))]}),
            V('Multi-series', 'Delivery days vs distance by mode', {'type': 'scatter', 'xName': 'Distance (km)', 'yName': 'Days', 'series': [S('Road', pts(30, 100, 1800, 1, 1.2, .003)), S('Rail', pts(25, 400, 2200, 2, 1.0, .002)), S('Air', pts(15, 500, 2400, .5, .4, .0004))]}),
            V('With trend line', 'Ad spend vs leads, least-squares fit', {'type': 'scatter', 'xName': 'Spend (₹ K)', 'yName': 'Leads', 'trend': True, 'series': [S('Campaigns', pts(40, 20, 400, 10, 25, .55))]}),
            V('Quadrant', 'Margin vs growth by product, averages split the plane', {'type': 'scatter', 'xName': 'Growth %', 'yName': 'Margin %', 'xUnit': PCT0, 'yUnit': PCT0, 'quadrant': True, 'labels': True,
              'series': [S('Products', [{'name': n, 'value': [g, m]} for n, g, m in [('Copper wire', 22, 18), ('MCB', 9, 34), ('Brackets', -4, 28), ('Boxes', 14, 12), ('Bearings', 6, 31), ('LED panels', 31, 26), ('Cable ties', -8, 22), ('Conduit', 3, 15)]])]}),
            V('Large dataset + zoom', '600 invoices: amount vs days to pay · drag or Ctrl+wheel to zoom', {'type': 'scatter', 'big': True, 'zoom': True, 'xName': 'Invoice (₹ K)', 'yName': 'Days to pay', 'series': [S('Invoices', pts(600, 5, 900, 20, 25, .04))]}, span='s-8', h=300),
        ]),
    ], xp({'type': 'scatter', 'xName': 'Distance (km)', 'yName': 'Days', 'series': [S('Road', pts(30, 100, 1800, 1, 1.2, .003)), S('Rail', pts(25, 400, 2200, 2, 1.0, .002)), S('Air', pts(15, 500, 2400, .5, .4, .0004))]},
              ['palette', 'density', 'legend', 'tooltip', 'size', 'theme', 'engine'], {'density': 'l'}, 'Delivery days vs distance', 'Explorer — scatter variants'),
        std_matrix('X/Y (no orientation)', 'Fluent categorical (max 3 series) · Monochrome · Highlight'), guide('<p>Correlation, clusters and outliers between two continuous measures.</p>', '<p>More than three colored series — the palette only stays distinguishable for three in every pair.</p>'))

def bubble():
    gallery('bubble', 'Bubble Charts', 'Scatter plus a third measure as area. Use for portfolio views: performance × quality × spend. <b>Sample data.</b>', [
        ('Bubble variants', '', [
            V('Basic bubble', 'Suppliers: on-time × quality, size = spend', {'type': 'bubble', 'xName': 'On-time %', 'yName': 'Quality score', 'zName': 'Spend', 'zUnit': INR, 'series': [S('Suppliers', [[96, 92, 8.4e7], [93, 95, 4.1e7], [88, 90, 5.6e7], [97, 97, 2.2e7], [84, 86, 1.9e7], [91, 88, 3.1e7], [79, 83, 4.6e7]])]}),
            V('Multi-series', 'Markets by category: growth × margin, size = revenue', {'type': 'bubble', 'xName': 'Growth %', 'yName': 'Margin %', 'zName': 'Revenue', 'zUnit': INR,
              'series': [S('Electrical', [[22, 18, 3.1e7], [14, 24, 1.2e7]]), S('Hardware', [[6, 31, 2.5e7], [-4, 28, .9e7]]), S('Packaging', [[14, 12, 1.9e7], [9, 15, .7e7]])]}),
            V('Labelled bubbles', 'Regions: orders × AOV, size = customers', {'type': 'bubble', 'labels': True, 'xName': 'Orders', 'yName': 'Avg order (₹ K)', 'zName': 'Customers',
              'series': [S('Regions', [{'name': n, 'value': v} for n, v in [('North', [1410, 24.2, 5200]), ('South', [1220, 24.3, 4600]), ('West', [1060, 25.6, 4100]), ('East', [680, 27.1, 2700]), ('Central', [450, 32.7, 1800])]])]}),
            V('Project portfolio', 'Risk × value, size = budget', {'type': 'bubble', 'labels': True, 'xName': 'Risk score', 'yName': 'Value score', 'zName': 'Budget', 'zUnit': INR, 'quadrant': True,
              'series': [S('Projects', [{'name': n, 'value': v} for n, v in [('WMS', [72, 81, 4.2e7]), ('Line 3', [45, 92, 9.6e7]), ('CRM', [80, 64, 3.6e7]), ('Portal', [30, 58, 2.4e7]), ('Solar', [22, 70, 2.8e7]), ('Data', [51, 77, 3.1e7])]])]}),
        ]),
    ], None, std_matrix('X/Y (no orientation)', 'Fluent categorical (max 3 series)'), guide('<p>Three measures per item where one of them is a size, such as spend or budget.</p>', '<p>Precise comparison of the size measure — areas are hard to compare; put it in the tooltip or a table.</p>'),
        used(('Procurement', 'dashboards/procurement.html')))

# ================================================================== Radar
def radar():
    ind = [{'name': n, 'max': 100} for n in ['Price', 'Quality', 'Delivery', 'Service', 'Flexibility', 'Sustainability']]
    gallery('radar', 'Radar Charts', 'Profiles across five to eight measures on the same scale. Up to three series. <b>Sample data.</b>', [
        ('Radar variants', '', [
            V('Single', 'Supplier scorecard: Tata Steel', {'type': 'radar', 'indicators': ind, 'series': [S('Tata Steel', [72, 92, 96, 81, 68, 74])], 'legend': False}),
            V('Multi-series', 'Three suppliers compared', {'type': 'radar', 'indicators': ind, 'series': [S('Tata Steel', [72, 92, 96, 81, 68, 74]), S('Jindal', [84, 83, 79, 70, 76, 62]), S('Hindalco', [78, 91, 90, 85, 72, 81])]}),
            V('Filled', 'Department scorecards', {'type': 'radar', 'filled': True, 'indicators': [{'name': n, 'max': 100} for n in ['Budget', 'Delivery', 'Quality', 'People', 'Customer']], 'series': [S('Sales', [78, 84, 72, 68, 88]), S('Operations', [70, 76, 90, 74, 72])]}),
            V('Circular grid', 'Same data, circular rings', {'type': 'radar', 'circle': True, 'indicators': ind, 'series': [S('Havells', [80, 95, 93, 88, 70, 79]), S('Polycab', [86, 90, 88, 76, 74, 71])]}),
            V('Benchmark', 'Actual vs target profile', {'type': 'radar', 'indicators': ind, 'series': [S('Target', [80, 90, 95, 85, 75, 80], dashed=True, gray=True), S('Uflex', [76, 86, 84, 79, 81, 66])]}),
        ]),
    ], xp({'type': 'radar', 'indicators': ind, 'series': [S('Tata Steel', [72, 92, 96, 81, 68, 74]), S('Jindal', [84, 83, 79, 70, 76, 62]), S('Hindalco', [78, 91, 90, 85, 72, 81])]}, ['palette', 'legend', 'tooltip', 'size', 'theme', 'engine'], {}, 'Supplier profiles', 'Explorer — radar variants'),
        std_matrix('Polygon · Circle'), guide('<p>Comparing a few entities on several measures that share a 0–100 scale.</p>', '<p>Measures on different scales, or more than three overlapping shapes.</p>'))

# ================================================================== Funnel
def funnel():
    sf = [{'name': n, 'value': v} for n, v in [('Leads', 2960), ('Qualified', 1420), ('Quoted', 820), ('Negotiation', 610), ('Won', 486)]]
    gallery('funnel', 'Funnel Charts', 'Stage-by-stage drop-off in a process. Stages are ordered, so they use the ordinal blue ramp. <b>Sample data.</b>', [
        ('Funnel variants', '', [
            V('Sales funnel', 'Opportunities this quarter', {'type': 'funnel', 'palette': 'ordinal', 'data': sf}),
            V('With conversion', 'Step conversion % on each label', {'type': 'funnel', 'palette': 'ordinal', 'conv': True, 'data': sf}),
            V('Labels inside', 'Compact cards', {'type': 'funnel', 'palette': 'ordinal', 'labelsInside': True, 'data': [{'name': n, 'value': v} for n, v in [('Requisitions', 1640), ('RFQs', 1210), ('Quotes', 980), ('POs', 912), ('Received', 861)]]}),
            V('Pyramid', 'Customer tiers — narrow top', {'type': 'funnel', 'pyramid': True, 'palette': 'ordinal', 'sort': 'ascending', 'data': [{'name': n, 'value': v} for n, v in [('Platinum', 120), ('Gold', 640), ('Silver', 2100), ('Bronze', 5400)]]}),
            V('Funnel as bars', 'Same stages as a ranked bar chart — easiest to read precisely', {'type': 'bar', 'categories': [d['name'] for d in sf], 'labels': True, 'series': [S('Opportunities', [d['value'] for d in sf])]}),
            V('Hiring funnel', 'Applications to joiners', {'type': 'funnel', 'palette': 'ordinal', 'conv': True, 'data': [{'name': n, 'value': v} for n, v in [('Applications', 4820), ('Screened', 1240), ('Interviewed', 410), ('Offers', 96), ('Joined', 78)]]}),
        ]),
        ('Comparison', 'Two periods side by side.', [
            V('This quarter', 'Q2 FY27', {'type': 'funnel', 'palette': 'ordinal', 'conv': True, 'data': sf}, span='s-6'),
            V('Last quarter', 'Q1 FY27', {'type': 'funnel', 'palette': 'ordinal', 'conv': True, 'data': [{'name': n, 'value': v} for n, v in [('Leads', 2610), ('Qualified', 1190), ('Quoted', 700), ('Negotiation', 498), ('Won', 391)]]}, span='s-6'),
        ]),
    ], None, std_matrix('Funnel · Pyramid · Bars', 'Ordinal blue ramp · Monochrome'), guide('<p>An ordered process where each stage is a subset of the previous one.</p>', '<p>Unordered categories or stages that are not subsets — use a bar chart.</p>'),
        used(('Sales', 'dashboards/sales.html'), ('Customers', 'dashboards/customers.html'), ('Procurement', 'dashboards/procurement.html'), ('HR', 'dashboards/hr.html')))

# ================================================================== Gauge, progress, bullet
def gauge():
    meters = ''.join(f'<div class="bars"><div><span>{n}</span><span class="meter meter--{k}" role="meter" aria-valuenow="{v}" aria-valuemin="0" aria-valuemax="100" aria-label="{n}"><i style="width:{v}%"></i></span><b>{v}%</b></div></div>' for n, v, k in [('Pune WH-1', 82, 'ok'), ('Chennai WH-2', 91, 'warn'), ('Gurugram WH-3', 74, 'ok'), ('Kolkata WH-4', 97, 'crit'), ('Ahmedabad WH-5', 63, 'ok')])
    gallery('gauge', 'Gauge Charts', 'A single value against its range or target — gauges, rings, radial bars, bullet charts and progress. <b>Sample data.</b>', [
        ('Gauges', '', [
            V('Semi gauge', 'Warehouse utilisation', {'type': 'gauge', 'value': 78, 'unit': PCT0, 'label': 'utilised'}),
            V('Gauge with bands', 'SLA compliance against status bands', {'type': 'gauge', 'value': 94.2, 'unit': PCT, 'label': 'within SLA', 'bands': [[80, 'crit'], [92, 'warn'], [100, 'good']], 'ticks': True}),
            V('Ring progress', 'Budget used', {'type': 'gauge', 'value': 72.4, 'unit': PCT, 'label': 'of budget', 'ring': True, 'color': 1}),
            V('Thin ring', 'Forecast accuracy', {'type': 'gauge', 'value': 84.5, 'unit': PCT, 'label': 'accuracy', 'ring': True, 'thin': True, 'color': 7}),
            V('Flat gauge', 'OEE, square ends', {'type': 'gauge', 'value': 78.4, 'unit': PCT, 'label': 'OEE', 'flat': True, 'color': 3}),
            V('Gauge with ticks', 'Machine load', {'type': 'gauge', 'value': 64, 'unit': PCT0, 'label': 'load', 'ticks': True}),
        ]),
        ('Radial, bullet and progress', '', [
            V('Radial bars', 'OEE components', {'type': 'radial', 'unit': PCT0, 'items': [{'name': 'Availability', 'value': 88}, {'name': 'Performance', 'value': 91}, {'name': 'Quality', 'value': 98}, {'name': 'OEE', 'value': 78}]}, h=280),
            V('Bullet chart', 'KPIs as % of target', {'type': 'bullet', 'unit': PCT0, 'ranges': [80, 95, 120], 'items': [{'name': 'Revenue', 'value': 103, 'target': 100}, {'name': 'Margin', 'value': 93, 'target': 100}, {'name': 'OTIF', 'value': 97, 'target': 100}, {'name': 'DSO', 'value': 78, 'target': 100}]}, h=280, span='s-8'),
            card('Linear progress', meters + note('Fill carries status: blue normal, amber over 90%, red over 95%.'), sub='Warehouse capacity used (HTML meters)', span='s-6'),
            card('KPI visualization', kpis(kpi('OTIF', 92.6, PCT, '0.9 pts', sub='target 95%', target=(97, '97% of target', 'warn'), spark=trend(89.2, 92.6, seed=112, dp=1)), kpi('Utilisation', 78, PCT0, '3 pts', good=False, sub='pallets', target=(78, '78% of capacity', 'ok')), n=3).replace('kpis kpis--3', 'kpis kpis--3" style="grid-template-columns:1fr 1fr'), sub='Number, delta, target meter and sparkline together', span='s-6'),
        ]),
    ], None, std_matrix('Semi · Ring · Radial · Bullet · Linear', 'Single series color · Status bands'), guide('<p>One headline value with a meaningful maximum or target.</p>', '<p>Rows of gauges for comparison — a bullet chart or bar is far denser.</p>'),
        used(('KPI', 'dashboards/kpi.html'), ('Operations', 'dashboards/operations.html'), ('Plant operations', 'dashboards/plant-operations.html')))

# ================================================================== Heatmap
def heatmap():
    r = rnd(141)
    hrs = [f'{h:02d}' for h in range(8, 21)]
    wk = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    corr = ['Price', 'Discount', 'Lead time', 'Order size', 'Margin']
    cm = [[1, -.62, .18, -.35, .71], [-.62, 1, -.08, .54, -.66], [.18, -.08, 1, .12, .05], [-.35, .54, .12, 1, -.28], [.71, -.66, .05, -.28, 1]]
    gallery('heatmap', 'Heatmaps', 'Magnitude across two categorical dimensions. One-hue sequential ramp; diverging blue↔red only when the sign matters. <b>Sample data.</b>', [
        ('Heatmap variants', '', [
            V('Orders by weekday and hour', 'Sequential ramp, values in cells', {'type': 'heatmap', 'x': hrs, 'y': wk, 'name': 'Orders', 'labels': False,
              'data': [[x, y, int(10 + 60 * math.exp(-((x - 4) ** 2) / 8) * (1 if y < 5 else .45) + r.randint(0, 8))] for y in range(7) for x in range(13)]}, span='s-8', h=300),
            V('Warehouse utilisation', 'Warehouse × month, %', {'type': 'heatmap', 'x': M12[-6:], 'y': WHS, 'unit': PCT0, 'name': 'Utilisation', 'data': [[x, y, r.randint(58, 98)] for y in range(5) for x in range(6)]}, h=300),
            V('Correlation matrix', 'Diverging: −1 red, 0 neutral, +1 blue', {'type': 'heatmap', 'x': corr, 'y': corr, 'diverging': True, 'min': -1, 'max': 1, 'unit': {'dp': 2}, 'name': 'Correlation', 'data': [[x, y, cm[y][x]] for y in range(5) for x in range(5)]}, h=300, span='s-6'),
            V('Growth by region and category', 'Diverging around 0% growth', {'type': 'heatmap', 'x': CATS, 'y': REGIONS, 'diverging': True, 'unit': PCT0, 'name': 'Growth', 'min': -20, 'max': 20, 'data': [[x, y, r.randint(-18, 20)] for y in range(5) for x in range(6)]}, h=300, span='s-6'),
            V('Map-style tile map', 'Revenue by state — the sales dashboard “map”', tilemap_spec('Revenue by state'), h=340, span='s-6'),
            V('Calendar view', 'Daily dispatches, last 8 weeks', {'type': 'heatmap', 'x': [f'W{w}' for w in range(32, 40)], 'y': wk, 'name': 'Dispatches', 'labels': False, 'data': [[x, y, r.randint(80, 420) if y < 6 else r.randint(0, 60)] for y in range(7) for x in range(8)]}, h=340, span='s-6'),
        ]),
    ], None, std_matrix('Grid · Tile map · Calendar', 'Sequential blue · Diverging blue ↔ red'), guide('<p>Patterns across two dimensions: time of day, warehouse × month, correlation.</p>', '<p>Rainbow scales, or reading exact values — keep labels or the table view available.</p>'),
        used(('Operations', 'dashboards/operations.html'), ('HR', 'dashboards/hr.html'), ('Projects', 'dashboards/projects.html'), ('Sales', 'dashboards/sales.html')))

# ================================================================== Treemap
def treemap():
    nested = [{'name': 'Electrical', 'children': [{'name': 'Cables', 'value': 1.02e7}, {'name': 'Switchgear', 'value': .74e7}, {'name': 'Lighting', 'value': .55e7}]},
              {'name': 'Hardware', 'children': [{'name': 'Fasteners', 'value': .71e7}, {'name': 'Brackets', 'value': .58e7}, {'name': 'Tools', 'value': .45e7}]},
              {'name': 'Packaging', 'children': [{'name': 'Corrugated', 'value': .78e7}, {'name': 'Film', 'value': .54e7}]},
              {'name': 'Raw material', 'children': [{'name': 'Copper rod', 'value': .81e7}, {'name': 'Steel coil', 'value': .40e7}]},
              {'name': 'Spares', 'children': [{'name': 'Bearings', 'value': .56e7}, {'name': 'Belts', 'value': .40e7}]}]
    gallery('treemap', 'Treemaps', 'Hierarchical part-to-whole by area. Good for many items; the top level carries color. <b>Sample data.</b>', [
        ('Treemap variants', '', [
            V('Flat treemap', 'Inventory by category', {'type': 'treemap', 'unit': INR, 'data': INV6}, h=300, span='s-6'),
            V('Nested treemap', 'Category › sub-category', {'type': 'treemap', 'unit': INR, 'data': nested}, h=300, span='s-6'),
            V('Drill-down treemap', 'Click a category to zoom in (ECharts / Highcharts)', {'type': 'treemap', 'unit': INR, 'drill': True, 'data': nested}, h=320, span='s-6'),
            V('Monochrome', 'Spend by supplier', {'type': 'treemap', 'unit': INR, 'palette': 'mono', 'data': [{'name': n, 'value': v} for n, v in [('Tata Steel', 8.4e6), ('Polycab', 5.6e6), ('Jindal', 4.6e6), ('Havells', 4.1e6), ('Hindalco', 3.8e6), ('Finolex', 3.1e6)]]}, h=320, span='s-6'),
        ]),
    ], None, std_matrix('Squarified', 'Fluent categorical by parent · Monochrome'), guide('<p>Many items in a two-level hierarchy where the big ones matter most.</p>', '<p>Precise comparison of similar values or deeper than two levels.</p>'),
        used(('Inventory', 'dashboards/inventory.html'), ('Procurement', 'dashboards/procurement.html')))

# ================================================================== Waterfall
def waterfall():
    gallery('waterfall', 'Waterfall Charts', 'How a starting value becomes an ending value — increases blue, decreases red, totals grey. <b>Sample data.</b>', [
        ('Waterfall variants', '', [
            V('P&L bridge', 'Revenue to net profit, ₹', {'type': 'waterfall', 'unit': INR, 'categories': ['Revenue', 'COGS', 'Gross profit', 'Opex', 'Depreciation', 'Interest', 'Tax', 'Net profit'],
              'data': [12.4e7, -8.36e7, {'total': True}, -1.24e7, -.32e7, -.18e7, -.42e7, {'total': True}]}, h=320, span='s-8'),
            V('Cash flow bridge', 'Opening to closing cash', {'type': 'waterfall', 'unit': INR, 'labels': False, 'categories': ['Opening', 'Collections', 'Payments', 'Payroll', 'Taxes', 'Capex', 'Closing'], 'data': [3.2e7, 9.8e7, -6.4e7, -1.6e7, -.7e7, -.9e7, {'total': True}]}, h=320),
            V('Budget variance', 'Approved budget to forecast — horizontal', {'type': 'waterfall', 'horizontal': True, 'unit': INR, 'categories': ['Approved budget', 'Price inflation', 'New hires', 'Project savings', 'Deferred capex', 'Forecast outturn'], 'data': [64e7, 3.1e7, 1.8e7, -2.6e7, -4.2e7, {'total': True}]}, h=320, span='s-6'),
            V('Inventory movement', 'Units: opening + receipts − issues − write-offs', {'type': 'waterfall', 'unit': {'indian': True}, 'categories': ['Opening', 'Receipts', 'Returns in', 'Issues', 'Write-offs', 'Closing'], 'data': [262000, 141000, 6200, -118400, -6800, {'total': True}]}, h=320, span='s-6'),
        ]),
    ], None, std_matrix('Vertical · Horizontal', 'Diverging blue ↔ red with neutral totals'), guide('<p>Explaining a change between two totals as a sequence of contributions.</p>', '<p>Many tiny steps — group them into “Other”.</p>'),
        used(('Finance', 'dashboards/finance.html'), ('Management', 'dashboards/management.html')))

# ================================================================== Sankey
def sankey():
    gallery('sankey', 'Sankey Charts', 'Flow between stages; link width is volume. <b>Sample data.</b>', [
        ('Sankey variants', '', [
            V('Order fulfilment flow', 'Orders → warehouse → outcome', {'type': 'sankey', 'links': [{'source': a, 'target': b, 'value': v} for a, b, v in [
                ('Online orders', 'Pune WH-1', 620), ('Online orders', 'Gurugram WH-3', 410), ('Distributor orders', 'Pune WH-1', 980), ('Distributor orders', 'Chennai WH-2', 840), ('Direct orders', 'Chennai WH-2', 520), ('Direct orders', 'Kolkata WH-4', 310),
                ('Pune WH-1', 'Delivered on time', 1450), ('Pune WH-1', 'Delivered late', 150), ('Gurugram WH-3', 'Delivered on time', 370), ('Gurugram WH-3', 'Delivered late', 40), ('Chennai WH-2', 'Delivered on time', 1180), ('Chennai WH-2', 'Delivered late', 140), ('Chennai WH-2', 'Returned', 40), ('Kolkata WH-4', 'Delivered on time', 250), ('Kolkata WH-4', 'Delivered late', 60)]]}, h=380, span='s-12'),
            V('Procurement spend', 'Category → supplier tier → payment terms, ₹ Cr', {'type': 'sankey', 'unit': {'pre': '₹', 'suf': ' Cr'}, 'links': [{'source': a, 'target': b, 'value': v} for a, b, v in [
                ('Electrical', 'Strategic', 1.2), ('Electrical', 'Preferred', .66), ('Raw material', 'Strategic', 1.3), ('Raw material', 'Approved', .12), ('Packaging', 'Preferred', .5), ('Packaging', 'Approved', .31), ('Spares', 'Approved', .61),
                ('Strategic', '60 days', 1.8), ('Strategic', '45 days', .7), ('Preferred', '45 days', .86), ('Preferred', '30 days', .3), ('Approved', '30 days', .74), ('Approved', 'Advance', .3)]]}, h=340, span='s-6'),
            V('Budget allocation', 'Annual budget → department → spend type, ₹ Cr', {'type': 'sankey', 'unit': {'pre': '₹', 'suf': ' Cr'}, 'links': [{'source': a, 'target': b, 'value': v} for a, b, v in [
                ('FY27 budget', 'Operations', 18.6), ('FY27 budget', 'Sales', 14.2), ('FY27 budget', 'Procurement', 9.8), ('FY27 budget', 'IT', 6.4), ('FY27 budget', 'Finance & HR', 7.3),
                ('Operations', 'Payroll', 7.1), ('Operations', 'Facilities', 6.3), ('Operations', 'Capex', 5.2), ('Sales', 'Payroll', 8.4), ('Sales', 'Marketing', 5.8), ('Procurement', 'Payroll', 3.1), ('Procurement', 'Systems', 6.7), ('IT', 'Systems', 4.1), ('IT', 'Payroll', 2.3), ('Finance & HR', 'Payroll', 5.6), ('Finance & HR', 'Systems', 1.7)]]}, h=340, span='s-6'),
        ]),
    ], None, std_matrix('Left → right', 'Fluent categorical by node'), guide('<p>Showing where volume goes between two to four stages.</p>', '<p>Cyclic flows or more than ~20 nodes — use a table or matrix.</p>'),
        used(('Supply chain', 'dashboards/supply-chain.html')))

# ================================================================== Box / histogram / candlestick
def boxplot():
    gallery('boxplot', 'Box Plots', 'Distributions compared across groups: median, middle 50% and range, plus outliers. <b>Sample data.</b>', [
        ('Box plot variants', 'Chart.js has no native box plot; those cards fall back to ECharts and say so.', [
            V('Lead time by supplier', 'Days from PO to receipt', {'type': 'boxplot', 'categories': SUPPLIERS, 'unit': {'suf': ' d'}, 'valueName': 'Days', 'data': [[6, 9, 11, 13, 18], [5, 7, 8, 10, 14], [7, 10, 12, 15, 21], [4, 6, 7, 8, 11], [8, 11, 14, 17, 24], [6, 8, 10, 12, 16]]}, h=300, span='s-6'),
            V('With outliers', 'Order cycle time by plant', {'type': 'boxplot', 'categories': ['Pune', 'Chennai', 'Gurugram'], 'unit': {'suf': ' h'}, 'data': [[12, 18, 22, 27, 36], [14, 20, 25, 31, 42], [10, 15, 19, 24, 31]], 'outliers': [[0, 48], [1, 56], [1, 61], [2, 40]]}, h=300, span='s-6'),
            V('Horizontal', 'Order value by region, ₹ K', {'type': 'boxplot', 'horizontal': True, 'categories': REGIONS, 'unit': {'pre': '₹', 'suf': 'K'}, 'data': [[4, 12, 21, 34, 62], [3, 11, 19, 31, 58], [5, 13, 23, 37, 70], [2, 9, 16, 27, 49], [3, 10, 17, 29, 52]]}, h=300, span='s-12'),
        ]),
    ], None, std_matrix('Vertical · Horizontal', 'Single hue with translucent box'), guide('<p>Comparing spread and skew across groups.</p>', '<p>Audiences unfamiliar with quartiles — add a one-line legend or use a histogram.</p>'),
        used(('Supply chain', 'dashboards/supply-chain.html')))

def histogram():
    bins = ['0–10K', '10–20K', '20–30K', '30–40K', '40–50K', '50–60K', '60–70K', '70–80K', '80K+']
    cnt = [380, 920, 1340, 1120, 640, 290, 120, 60, 40]
    norm = [round(1340 * math.exp(-((i - 2.6) ** 2) / 3.2)) for i in range(9)]
    gallery('histogram', 'Histograms', 'The shape of one measure: how many items fall in each value band. Bars touch because bands are continuous. <b>Sample data.</b>', [
        ('Histogram variants', '', [
            V('Order value distribution', 'Orders by value band', {'type': 'histogram', 'categories': bins, 'xName': 'Order value (₹)', 'series': [S('Orders', cnt)]}, h=280, span='s-6'),
            V('With fitted curve', 'Normal fit as a line', {'type': 'histogram', 'categories': bins, 'xName': 'Order value (₹)', 'series': [S('Orders', cnt), S('Normal fit', norm, type='line', c=2, smooth=True)]}, h=280, span='s-6'),
            V('Payment days', 'Invoices by days to pay, 45-day terms', {'type': 'histogram', 'categories': ['0–15', '16–30', '31–45', '46–60', '61–75', '76–90', '90+'], 'xName': 'Days', 'threshold': {'value': 1500, 'label': 'Review volume'}, 'series': [S('Invoices', [420, 1180, 1640, 980, 520, 210, 140], pst=[None, None, None, 'warn', 'serious', 'crit', 'crit'])]}, h=280, span='s-6'),
            V('Ticket resolution', 'Hours to resolve, last 90 days', {'type': 'histogram', 'categories': ['<2', '2–4', '4–8', '8–16', '16–24', '24–48', '48+'], 'xName': 'Hours', 'labels': True, 'series': [S('Tickets', [210, 380, 520, 410, 190, 110, 40])]}, h=280, span='s-6'),
        ]),
    ], None, std_matrix('Vertical bands', 'Single hue · status for out-of-policy bands'), guide('<p>Showing distribution shape, skew and outliers of one measure.</p>', '<p>Unequal band widths without saying so.</p>'),
        used(('Customers', 'dashboards/customers.html'), ('HR', 'dashboards/hr.html')))

def candlestick():
    r = rnd(151)
    def ohlc(n, start, vol):
        out, p = [], start
        for _ in range(n):
            o = p; c = round(o + r.uniform(-vol, vol * 1.05), 1); h = round(max(o, c) + r.uniform(0, vol * .6), 1); l = round(min(o, c) - r.uniform(0, vol * .6), 1)
            out.append([round(o, 1), c, l, h]); p = c
        return out
    days = [f'{d} {m}' for m, n in [('Jul', 31), ('Aug', 31), ('Sep', 30)] for d in range(1, n + 1) if (d % 7) not in (0, 6)][:60]
    gallery('candlestick', 'Candlestick Charts', 'Open, high, low and close per period — used here for commodity prices that drive purchase cost. <b>Sample data.</b>', [
        ('Candlestick variants', 'Highcharts core and Chart.js have no native candlestick here; those engines fall back to ECharts.', [
            V('Copper, ₹/kg', 'Daily OHLC with a 5-day average · zoom with the slider', {'type': 'candlestick', 'categories': days, 'unit': {'pre': '₹'}, 'name': 'Copper', 'data': ohlc(60, 812, 9)}, h=360, span='s-12'),
            V('Steel HRC, ₹/t', 'Daily OHLC', {'type': 'candlestick', 'categories': days, 'unit': {'pre': '₹'}, 'name': 'Steel HRC', 'data': ohlc(60, 52400, 600)}, h=320, span='s-6'),
            V('Aluminium, ₹/kg', 'Daily OHLC', {'type': 'candlestick', 'categories': days, 'unit': {'pre': '₹'}, 'name': 'Aluminium', 'data': ohlc(60, 236, 3)}, h=320, span='s-6'),
        ]),
    ], None, std_matrix('Time on x', 'Diverging blue (up) ↔ red (down)'), guide('<p>Price behaviour within each period for traded inputs.</p>', '<p>Non-price data; most business measures are better as a line.</p>'),
        used(('Procurement', 'dashboards/procurement.html')))

# ================================================================== Mixed
def mixed():
    reg_multiples = ''.join(V(n, 'Revenue, 12 months', {'type': 'spark', 'categories': M12, 'unit': INR, 'series': [S(n, [round(v * f) for v in REV])]}, h=80, span='s-2') for n, f in zip(REGIONS + ['All'], [.28, .24, .22, .15, .11, 1]))
    gallery('mixed', 'Mixed Charts', 'Polar, radial, bullet, sparklines, small multiples and KPI visuals — and how they combine with the core types. <b>Sample data.</b>', [
        ('Polar and radial', '', [
            V('Polar area (rose)', 'Orders by weekday', {'type': 'polar', 'data': [{'name': d, 'value': v} for d, v in zip(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], [920, 1040, 980, 1110, 1260, 610])]}, h=300),
            V('Rose pie', 'Expense mix as a rose (ECharts only)', {'type': 'pie', 'rose': True, 'unit': INR, 'data': EXP5, 'labels': False}, h=300),
            V('Radial bars', 'Project completion', {'type': 'radial', 'unit': PCT0, 'items': [{'name': 'WMS', 'value': 62}, {'name': 'Line 3', 'value': 71}, {'name': 'E-invoice', 'value': 88}, {'name': 'Portal', 'value': 49}, {'name': 'Solar', 'value': 54}]}, h=300),
        ]),
        ('Small multiples and sparklines', 'One small chart per region on a shared design.', [reg_multiples.replace('chart--h80', 'chart--h80') if False else reg_multiples]),
        ('Bullet and KPI', '', [
            V('Bullet chart', 'Regional sales vs quota (% of quota)', {'type': 'bullet', 'unit': PCT0, 'ranges': [70, 90, 120], 'items': [{'name': r_, 'value': v, 'target': 100} for r_, v in zip(REGIONS, [112, 96, 104, 81, 74])]}, h=280, span='s-8'),
            card('KPI with mini chart', kpi('Revenue', 12.4e7, INR, '18.4%', sub='vs last year', spark=[round(v / 1e6, 1) for v in REV], spark_kind='area').replace('class="card kpi', 'class="kpi'), sub='Sparkline is decorative; the number carries the message', span='s-4'),
        ]),
        ('Combination', 'Different types on one time axis, in two panels.', [
            V('Column + line panels', 'Units (top) and fill rate % (bottom)', {'type': 'combo', 'categories': M12, 'unit': {'indian': True}, 'unit2': PCT, 'panelNames': ['Units shipped', 'Fill rate'], 'series': [S('Units shipped', trend(39500, 50600, seed=44)), S('Fill rate', trend(94.1, 96.8, seed=46, dp=1), type='line', panel=1, c=3)]}, h=320, span='s-6'),
            V('Area + line', 'Stock value area with reorder floor and target', {'type': 'combo', 'categories': M12, 'unit': INR, 'threshold': {'value': 7e7, 'label': 'Floor'}, 'series': [S('Stock value', trend(7.4e7, 8.7e7, seed=42), type='area'), S('Target', [8e7] * 12, type='line', dashed=True, gray=True)]}, h=320, span='s-6'),
        ]),
    ], None, std_matrix('Polar · Radial · Small multiples', 'Fluent categorical · single hue'), guide('<p>Compact summaries and side-by-side comparisons of many similar series.</p>', '<p>Mixing chart types for decoration — each type must answer a different question.</p>'))

def build():
    pie(); bar(); column(); line(); area(); combo(); scatter(); bubble(); radar(); funnel(); gauge(); heatmap(); treemap(); waterfall(); sankey(); boxplot(); histogram(); candlestick(); mixed()
