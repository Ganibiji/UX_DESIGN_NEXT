"""Dashboards: executive, operations, management, KPI, custom and nine business dashboards."""
from lib import *

DASH = ('Dashboards', 'dashboards/executive.html')
BIZ = ('Business dashboards', 'dashboards/inventory.html')

def S(name, data, **kw):
    d = {'name': name, 'data': data}
    d.update(kw)
    return d

# ------------------------------------------------------------------ shared sample series
REV = trend(8.6e6, 12.4e6, seed=11, season=SEASON)              # monthly revenue ₹
REV_LY = [round(v * r) for v, r in zip(REV, trend(.86, .82, seed=12, noise=.02, dp=3))]
ORDERS = trend(3620, 4820, seed=13, season=SEASON)
REGION_REV = [3.42e7, 2.96e7, 2.71e7, 1.84e7, 1.47e7]
REGION_DRILL = {
    'North': {'categories': ['Delhi NCR', 'Punjab', 'Uttar Pradesh', 'Haryana', 'Rajasthan'], 'series': [S('Revenue', [1.12e7, .58e7, .72e7, .54e7, .46e7])]},
    'South': {'categories': ['Karnataka', 'Tamil Nadu', 'Telangana', 'Kerala', 'Andhra Pradesh'], 'series': [S('Revenue', [.94e7, .82e7, .56e7, .34e7, .30e7])]},
    'West': {'categories': ['Maharashtra', 'Gujarat', 'Goa', 'Madhya Pradesh'], 'series': [S('Revenue', [1.31e7, .88e7, .12e7, .40e7])]},
    'East': {'categories': ['West Bengal', 'Odisha', 'Bihar', 'Jharkhand', 'Assam'], 'series': [S('Revenue', [.71e7, .38e7, .29e7, .26e7, .20e7])]},
    'Central': {'categories': ['Madhya Pradesh', 'Chhattisgarh'], 'series': [S('Revenue', [.92e7, .55e7])]},
}
CAT_SALES = [3.12e7, 2.48e7, 1.86e7, 1.54e7, 1.21e7, .89e7]
CAT_DRILL = {
    'Electrical': {'data': [{'name': 'Cables & wires', 'value': 1.32e7}, {'name': 'Switchgear', 'value': .94e7}, {'name': 'Lighting', 'value': .52e7}, {'name': 'Motors', 'value': .34e7}]},
    'Hardware': {'data': [{'name': 'Fasteners', 'value': .88e7}, {'name': 'Brackets', 'value': .71e7}, {'name': 'Hand tools', 'value': .54e7}, {'name': 'Locks', 'value': .35e7}]},
    'Packaging': {'data': [{'name': 'Corrugated', 'value': .92e7}, {'name': 'Stretch film', 'value': .51e7}, {'name': 'Tapes', 'value': .43e7}]},
}
PRODUCTS = ['Copper wire 2.5mm', 'MCB 32A', 'Steel bracket L', 'Corrugated box L', 'Bearing 6204', 'LED panel 18W', 'Cable tie 300mm', 'PVC conduit 25mm', 'Hex bolt M12', 'Stretch film 23µ']
PROD_REV = [1.86e7, 1.42e7, 1.18e7, .97e7, .91e7, .84e7, .62e7, .55e7, .47e7, .39e7]

def unit_rows(seed=3):
    r = rnd(seed)
    rows = []
    stat = ['Healthy', 'Healthy', 'Healthy', 'Low stock', 'Healthy', 'Overstock', 'Healthy', 'Out of stock']
    for i in range(48):
        cat = CATS[i % 6]
        p = f'{["Copper wire", "MCB", "Steel bracket", "Corrugated box", "Bearing", "LED panel", "Cable tie", "PVC conduit", "Hex bolt", "Stretch film", "Fuse", "Gasket"][i % 12]} {["2.5mm", "32A", "L", "M", "6204", "18W", "300mm", "25mm", "M12", "23µ", "16A", "DN50"][i % 12]}'
        q = r.randint(120, 9400)
        v = q * r.randint(180, 2400)
        rows.append({'sku': f'SKU-{10420 + i * 7}', 'product': p, 'category': cat, 'warehouse': WHS[i % 5], 'qty': q, 'value': v,
                     'days': r.randint(8, 190), 'growth': round(r.uniform(-18, 32), 1), 'status': stat[r.randint(0, 7)]})
    return rows

INV_STATUS = {'Healthy': 'good', 'Low stock': 'warn', 'Overstock': 'serious', 'Out of stock': 'crit'}

def dash(path, title, desc, body, crumbs=DASH):
    page(path, title, desc, body, crumbs=[crumbs])

# ================================================================== Executive
def executive():
    body = fbar(('region', 'category')) + kpis(
        kpi('Revenue', 12.4e7, INR, '18.4%', sub='vs last year', icon='money', spark=[round(v / 1e6, 1) for v in REV]),
        kpi('Orders', 4820, CNT, '12.2%', sub='vs last year', icon='cart', spark=ORDERS),
        kpi('Customers', 18420, CNT, '6.3%', sub='active, 12 months', icon='people', spark=trend(16100, 18420, seed=4)),
        kpi('Profit', 2.8e7, INR, '4.1%', good=False, up=False, sub='margin pressure from copper', icon='arrow_trending_lines', spark=trend(3.1, 2.8, seed=5, dp=2)),
        kpi('Growth (YoY)', 18.4, PCT, '3.4 pts', sub='target 15.0%', icon='data_trending', target=(100, 'Ahead of 15% target', 'ok')), n=5)
    body += grid(
        cc('Revenue trend', 'Monthly revenue vs last year and plan · drag or Ctrl+wheel to zoom',
           {'type': 'line', 'categories': M12, 'labelsFull': ML12, 'unit': INR, 'zoom': True, 'smooth': True, 'symbols': False,
            'target': {'value': 1.1e7, 'label': 'Plan'}, 'source': 'Sales orders (posted invoices)', 'metric': 'Net revenue', 'dimName': 'Month',
            'series': [S('This year', REV, type='area'), S('Last year', REV_LY, dashed=True, c=8)]}, h=320, span='s-8'),
        cc('Sales distribution', 'Revenue share by channel', {'type': 'pie', 'donut': True, 'unit': INR, 'centerLabel': 'Revenue',
            'data': [{'name': 'Distributors', 'value': 5.21e7}, {'name': 'Direct B2B', 'value': 3.47e7}, {'name': 'E-commerce', 'value': 2.11e7}, {'name': 'Modern trade', 'value': 1.61e7}], 'labels': False, 'dimName': 'Channel'}, h=320, span='s-4'),
        cc('Regional performance', 'Revenue by region · click a region to cross-filter, use ⋮ › Drill down for states',
           {'type': 'column', 'categories': REGIONS, 'unit': INR, 'labels': True, 'dim': 'region', 'dimName': 'Region', 'drill': REGION_DRILL, 'series': [S('Revenue', REGION_REV)]}, h=280, span='s-4'),
        cc('Product performance', 'Top 8 products by revenue', {'type': 'bar', 'categories': PRODUCTS[:8], 'unit': INR, 'labels': True, 'series': [S('Revenue', PROD_REV[:8])], 'dimName': 'Product'}, h=280, span='s-4'),
        cc('Customer distribution', 'Active customers by segment', {'type': 'pie', 'donut': True, 'centerLabel': 'Customers', 'labels': False, 'legendRight': True,
            'data': [{'name': 'SMB', 'value': 11240}, {'name': 'Mid-market', 'value': 4680}, {'name': 'Enterprise', 'value': 1820}, {'name': 'Government', 'value': 680}], 'dimName': 'Segment'}, h=280, span='s-4'),
        card('Top customers', lst([
            ('Bharat Infra Projects', 'Enterprise · West', '₹1.42 Cr', '↑ 21%', ('BI', 2)), ('Apex Retail Pvt Ltd', 'Mid-market · North', '₹1.18 Cr', '↑ 9%', ('AR', 1)),
            ('Deccan Motors', 'Enterprise · South', '₹96.4 L', '↓ 3%', ('DM', 3)), ('Everest Pharma', 'Enterprise · West', '₹88.1 L', '↑ 14%', ('EP', 4)),
            ('Coastal Traders', 'SMB · South', '₹61.7 L', '↑ 32%', ('CT', 5))]), sub='By revenue, last 12 months', span='s-4',
            actions=f'<a class="btn btn--s btn--subtle" href="customers.html">View all</a>'),
        card('Top products', lst([(p, c, fmt(v, INR), f'{q} units') for p, c, v, q in zip(PRODUCTS[:5], ['Electrical', 'Electrical', 'Hardware', 'Packaging', 'Spares'], PROD_REV, ['48,210', '12,940', '31,860', '1,18,400', '22,150'])]),
             sub='By revenue, last 12 months', span='s-4', actions='<a class="btn btn--s btn--subtle" href="sales.html">Sales</a>'),
        card('Recent activity', activity([
            ('cart', 'Order SO-24817 · ₹18.6 L', 'Bharat Infra · 42 lines · dispatched from Pune WH-1', '12 min'),
            ('money', 'Payment received ₹42.3 L', 'Apex Retail · invoice INV-9921', '48 min'),
            ('warning', '14 SKUs below reorder point', 'Inventory · Chennai WH-2 most affected', '1 h'),
            ('clipboard_task', 'PO-7731 approved', 'Polycab · ₹12.8 L copper cable', '2 h'),
            ('people', 'New enterprise customer', 'Nimbus Data Centres · Mumbai', '3 h')]), sub='Across sales, finance and operations', span='s-4'),
    )
    dash('dashboards/executive.html', 'Executive Dashboard', 'Company performance for leadership: revenue, orders, customers and profit, with regional and product drivers. <b>Sample data.</b>', body)

# ================================================================== Operations
def operations():
    days = [f'{d} Sep' for d in range(17, 31)]
    r = rnd(21)
    body = fbar(('warehouse', 'status')) + kpis(
        kpi('Orders in progress', 1284, CNT, '6.0%', good=False, sub='vs last week', icon='cart', spark=trend(1100, 1284, n=14, seed=2), spark_kind='bars'),
        kpi('On-time dispatch', 94.2, PCT, '1.1 pts', sub='target 95%', icon='vehicle_truck', target=(94, '0.8 pts below target', 'warn')),
        kpi('Avg fulfilment time', 26.4, {'suf': ' h', 'dp': 1}, '2.3 h', up=False, sub='faster than last week', icon='clock'),
        kpi('Backlog', 312, CNT, '18', good=False, sub='orders older than 48 h', icon='warning', status='warn'),
        kpi('Returns rate', 2.1, PCT, '0.3 pts', up=False, sub='vs last month', icon='arrow_swap'), n=5)
    body += grid(
        cc('Orders by status', 'Daily order flow, last 14 days', {'type': 'column', 'categories': days, 'stack': 'normal', 'xName': 'Day',
            'series': [S('Delivered', trend(260, 330, n=14, seed=1)), S('Dispatched', trend(60, 82, n=14, seed=2)), S('Picking', trend(30, 41, n=14, seed=3)), S('On hold', trend(8, 14, n=14, seed=4), c=4)]}, h=300, span='s-8'),
        cc('Fulfilment SLA', 'Orders dispatched within 24 h', {'type': 'gauge', 'value': 94.2, 'max': 100, 'unit': PCT, 'label': 'within SLA', 'bands': [[80, 'crit'], [92, 'warn'], [100, 'good']], 'ticks': True}, h=300, span='s-4'),
        cc('Fulfilment time trend', 'Hours from order to dispatch, 30-hour service limit', {'type': 'line', 'categories': days, 'unit': {'suf': ' h', 'dp': 1}, 'threshold': {'value': 30, 'label': 'SLA'},
            'series': [S('Average', trend(29.1, 26.4, n=14, seed=7, dp=1)), S('95th percentile', trend(38.2, 33.6, n=14, seed=8, dp=1), dashed=True)]}, h=280, span='s-6'),
        cc('SLA by warehouse', 'On-time dispatch %, status coloured against the 95% target', {'type': 'bar', 'categories': WHS, 'unit': PCT, 'labels': True, 'dim': 'warehouse', 'max': 100,
            'target': {'value': 95, 'label': 'Target'}, 'series': [S('On-time', [97.1, 92.4, 95.8, 88.6, 96.3], pst=['good', 'warn', 'good', 'crit', 'good'])]}, h=280, span='s-6'),
        cc('Dispatch load by hour', 'Orders dispatched, weekday × hour', {'type': 'heatmap', 'x': [f'{h:02d}:00' for h in range(6, 22, 2)], 'y': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            'data': [[x, y, int(18 + 40 * math.exp(-((x - 3.2) ** 2) / 5) * (1.15 if y < 5 else .6) + r.randint(0, 9))] for y in range(6) for x in range(8)], 'name': 'Orders'}, h=280, span='s-6'),
        card('Exceptions', lst([
            ('SO-24790 stuck in picking', 'Chennai WH-2 · 52 h · bin mismatch', f'<span class="st st--crit">{ic("error_circle")}Critical</span>', ''),
            ('Carrier pickup missed', 'Kolkata WH-4 · 18 orders · BlueDart', f'<span class="st st--warn">{ic("warning")}Delayed</span>', ''),
            ('Short pick: MCB 32A', 'Gurugram WH-3 · 240 units', f'<span class="st st--warn">{ic("warning")}Review</span>', ''),
            ('Label printer offline', 'Pune WH-1 · dock 3', f'<span class="st st--info">{ic("info")}Logged</span>', '')]), sub='Needs attention today', span='s-6'),
        dtable({'caption': 'Open orders', 'noun': 'orders', 'pageSize': 8, 'statusMap': {'Picking': 'info', 'Packed': 'good', 'On hold': 'warn', 'Delayed': 'crit'},
                'columns': [{'key': 'id', 'label': 'Order', 'w': 120}, {'key': 'cust', 'label': 'Customer'}, {'key': 'wh', 'label': 'Warehouse', 'group': True}, {'key': 'lines', 'label': 'Lines', 'type': 'num', 'agg': 'sum'},
                            {'key': 'value', 'label': 'Value', 'type': 'inr', 'agg': 'sum'}, {'key': 'age', 'label': 'Age (h)', 'type': 'num', 'agg': 'avg'}, {'key': 'status', 'label': 'Status', 'type': 'status', 'group': True}],
                'rows': [{'id': f'SO-{24760 + i}', 'cust': DIMS['customer'][i % 5], 'wh': WHS[i % 5], 'lines': 4 + i * 3 % 37, 'value': 180000 + (i * 73211) % 2400000, 'age': 4 + (i * 7) % 60, 'status': ['Picking', 'Packed', 'On hold', 'Picking', 'Delayed', 'Packed'][i % 6]} for i in range(26)]},
               title='Open orders', sub='Grouping, totals, column chooser and export in the toolbar'),
    )
    dash('dashboards/operations.html', 'Operations Dashboard', 'Day-to-day order fulfilment: flow, service levels, warehouse performance and exceptions. <b>Sample data.</b>', body)

# ================================================================== Management
def management():
    body = fbar(('department', 'region')) + kpis(
        kpi('Budget utilised', 72.4, PCT, '4.0 pts', good=False, sub='vs plan for September', icon='money', target=(72, '₹46.3 Cr of ₹64.0 Cr', 'warn')),
        kpi('Headcount', 1248, CNT, '36', sub='net adds this quarter', icon='people_team'),
        kpi('Projects on track', 18, {'suf': ' of 24'}, '2', sub='vs last month', icon='briefcase', status='good'),
        kpi('Attrition (annualised)', 9.8, PCT, '0.7 pts', up=False, sub='vs Q1', icon='person'), n=4)
    body += grid(
        cc('Budget vs actual by department', 'Year to date, ₹ — actual bars against the budget line', {'type': 'column', 'categories': DEPTS, 'unit': INR, 'dim': 'department',
            'series': [S('Budget', [14.2e7, 18.6e7, 4.1e7, 9.8e7, 3.2e7, 6.4e7], ghost=True, c=1), S('Actual', [10.9e7, 14.1e7, 2.8e7, 7.6e7, 2.1e7, 5.6e7], c=1)]}, h=300, span='s-8'),
        cc('Department scorecard', 'Index 0–100 on five measures', {'type': 'radar', 'filled': True, 'indicators': [{'name': n, 'max': 100} for n in ['Budget', 'Delivery', 'Quality', 'People', 'Customer']],
            'series': [S('Sales', [78, 84, 72, 68, 88]), S('Operations', [70, 76, 90, 74, 72]), S('Finance', [92, 81, 86, 79, 64])]}, h=300, span='s-4'),
        cc('Budget bridge', 'Approved budget to forecast outturn, ₹', {'type': 'waterfall', 'unit': INR, 'categories': ['Approved budget', 'Price inflation', 'New hires', 'Project savings', 'Deferred capex', 'Forecast outturn'],
            'data': [64e7, 3.1e7, 1.8e7, -2.6e7, -4.2e7, {'total': True}]}, h=280, span='s-6'),
        cc('Headcount by department', 'By grade, current month', {'type': 'bar', 'categories': DEPTS, 'stack': 'normal', 'labels': True, 'dim': 'department',
            'series': [S('Staff', [212, 386, 64, 82, 28, 74]), S('Managers', [48, 62, 18, 21, 9, 22]), S('Leadership', [8, 7, 5, 4, 3, 6])]}, h=280, span='s-6'),
        cc('Project portfolio', 'Status of 24 active projects', {'type': 'pie', 'donut': True, 'centerLabel': 'Projects', 'legendRight': True,
            'data': [{'name': 'On track', 'value': 18, 'st': 'good'}, {'name': 'At risk', 'value': 4, 'st': 'warn'}, {'name': 'Off track', 'value': 2, 'st': 'crit'}]}, h=260, span='s-4'),
        dtable({'caption': 'Management risks', 'noun': 'risks', 'pageSize': 6, 'actions': True, 'statusMap': {'Mitigating': 'warn', 'Open': 'crit', 'Monitoring': 'info', 'Closed': 'good'},
                'columns': [{'key': 'risk', 'label': 'Risk', 'w': 260}, {'key': 'dept', 'label': 'Department', 'group': True}, {'key': 'owner', 'label': 'Owner'}, {'key': 'impact', 'label': 'Impact', 'type': 'inr', 'agg': 'sum'}, {'key': 'status', 'label': 'Status', 'type': 'status', 'group': True}],
                'rows': [{'risk': r_, 'dept': d, 'owner': o, 'impact': im, 'status': s} for r_, d, o, im, s in [
                    ('Copper price above budget assumption', 'Procurement', 'R. Iyer', 4.2e7, 'Mitigating'), ('Key account renewal (Bharat Infra)', 'Sales', 'S. Kapoor', 1.4e8, 'Open'),
                    ('WMS upgrade slips past Diwali', 'IT', 'A. Khan', 1.8e7, 'Monitoring'), ('Attrition in Chennai warehouse', 'Operations', 'M. Das', 6.5e6, 'Mitigating'),
                    ('GST e-invoicing change', 'Finance', 'P. Nair', 2.1e6, 'Closed'), ('Supplier concentration: cable', 'Procurement', 'R. Iyer', 3.3e7, 'Open'),
                    ('Payroll audit findings', 'HR', 'L. Menon', 9.0e5, 'Monitoring')]]}, span='s-8', title='Risk register', sub='Top risks across departments'),
    )
    dash('dashboards/management.html', 'Management Dashboard', 'Department-level view for the management team: budgets, scorecards, headcount, portfolio and risks. <b>Sample data.</b>', body)

# ================================================================== KPI
def kpi_dash():
    def mk(l, v, u, d, good, up, tgt, st, icon, sp):
        return kpi(l, v, u, d, good, up, sub=None, icon=icon, target=tgt, spark=sp, status=st)
    body = fbar(('region', 'department')) + kpis(
        mk('Revenue', 12.4e7, INR, '18.4%', True, True, (103, 'Plan ₹12.0 Cr · 103%', 'ok'), 'good', 'money', [round(v / 1e6, 1) for v in REV]),
        mk('Gross margin', 32.6, PCT, '1.2 pts', False, False, (93, 'Target 35.0% · 93%', 'warn'), 'warn', 'arrow_trending_lines', trend(34.1, 32.6, seed=3, dp=1)),
        mk('OTIF delivery', 92.6, PCT, '0.9 pts', True, True, (97, 'Target 95% · 97%', 'ok'), 'good', 'vehicle_truck', trend(90.1, 92.6, seed=4, dp=1)),
        mk('DSO', 58, {'suf': ' days'}, '6 days', False, True, (78, 'Target 45 days', 'crit'), 'crit', 'clock', trend(49, 58, seed=5)), n=4)
    body += kpis(
        mk('Inventory turns', 6.2, {'suf': '×', 'dp': 1}, '0.4', True, True, (89, 'Target 7.0×', 'ok'), 'good', 'box', trend(5.6, 6.2, seed=6, dp=1)),
        mk('NPS', 46, CNT, '5', True, True, (92, 'Target 50', 'ok'), 'good', 'people', trend(38, 46, seed=7)),
        mk('Employee engagement', 78, PCT0, '2 pts', True, True, (98, 'Target 80%', 'ok'), 'good', 'people_team', trend(74, 78, seed=8)),
        mk('Cost per order', 412, {'pre': '₹'}, '₹18', True, False, (96, 'Target ₹400', 'warn'), 'warn', 'calculator', trend(441, 412, seed=9)), n=4)
    body += grid(
        cc('KPIs against target', 'Actual as % of target; bands show poor / satisfactory / good', {'type': 'bullet', 'unit': PCT0, 'ranges': [80, 95, 120],
            'items': [{'name': 'Revenue', 'value': 103, 'target': 100}, {'name': 'Gross margin', 'value': 93, 'target': 100}, {'name': 'OTIF', 'value': 97, 'target': 100}, {'name': 'DSO', 'value': 78, 'target': 100}, {'name': 'Inventory turns', 'value': 89, 'target': 100}, {'name': 'NPS', 'value': 92, 'target': 100}]}, h=300, span='s-7'),
        cc('Scorecard health', 'KPIs by status this month', {'type': 'pie', 'donut': True, 'centerLabel': 'KPIs', 'legendRight': True, 'data': [{'name': 'On track', 'value': 9, 'st': 'good'}, {'name': 'At risk', 'value': 4, 'st': 'warn'}, {'name': 'Off track', 'value': 2, 'st': 'crit'}]}, h=300, span='s-5'),
        cc('Order accuracy', 'Lines picked correctly', {'type': 'gauge', 'value': 99.2, 'max': 100, 'unit': PCT, 'label': 'accuracy', 'ring': True, 'color': 3}, h=220, span='s-3'),
        cc('Warehouse utilisation', 'Pallet positions in use', {'type': 'gauge', 'value': 78, 'max': 100, 'unit': PCT0, 'label': 'utilised', 'color': 1}, h=220, span='s-3'),
        cc('Forecast accuracy', '1 – MAPE, last 3 months', {'type': 'gauge', 'value': 84.5, 'max': 100, 'unit': PCT, 'label': 'accuracy', 'ring': True, 'color': 7}, h=220, span='s-3'),
        cc('Supplier on-time', 'POs received on promised date', {'type': 'gauge', 'value': 91.4, 'max': 100, 'unit': PCT, 'label': 'on time', 'color': 1}, h=220, span='s-3'),
        dtable({'caption': 'KPI scorecard', 'noun': 'KPIs', 'pageSize': 15, 'statusMap': {'On track': 'good', 'At risk': 'warn', 'Off track': 'crit'},
                'columns': [{'key': 'k', 'label': 'KPI', 'w': 200}, {'key': 'own', 'label': 'Owner', 'group': True}, {'key': 'a', 'label': 'Actual'}, {'key': 't', 'label': 'Target'}, {'key': 'pct', 'label': '% of target', 'type': 'bar'}, {'key': 'g', 'label': 'Trend', 'type': 'growth'}, {'key': 's', 'label': 'Status', 'type': 'status', 'group': True}],
                'rows': [{'k': k, 'own': o, 'a': a, 't': t, 'pct': p, 'g': g, 's': s} for k, o, a, t, p, g, s in [
                    ('Revenue', 'Sales', '₹12.4 Cr', '₹12.0 Cr', 100, 18.4, 'On track'), ('Gross margin', 'Finance', '32.6%', '35.0%', 93, -1.2, 'At risk'), ('OTIF delivery', 'Operations', '92.6%', '95.0%', 97, .9, 'On track'),
                    ('Days sales outstanding', 'Finance', '58 days', '45 days', 78, -6, 'Off track'), ('Inventory turns', 'Operations', '6.2×', '7.0×', 89, 7.1, 'On track'), ('Net promoter score', 'Customers', '46', '50', 92, 12.2, 'On track'),
                    ('Engagement', 'HR', '78%', '80%', 98, 2.6, 'On track'), ('Cost per order', 'Operations', '₹412', '₹400', 97, -4.2, 'At risk'), ('Purchase savings', 'Procurement', '₹38.4 L', '₹40 L', 96, 11.0, 'At risk'),
                    ('Forecast accuracy', 'Planning', '84.5%', '85%', 99, 1.8, 'On track'), ('Time to hire', 'HR', '32 days', '30 days', 94, -3.0, 'At risk'), ('Supplier on-time', 'Procurement', '91.4%', '92%', 99, 2.1, 'On track'),
                    ('Scrap rate', 'Operations', '1.8%', '1.5%', 83, -0.4, 'Off track'), ('Cash conversion', 'Finance', '64 days', '60 days', 94, 2.0, 'On track'), ('Order accuracy', 'Operations', '99.2%', '99.5%', 100, .3, 'On track')]]},
               title='KPI scorecard', sub='15 KPIs · group by owner or status from the toolbar'),
    )
    dash('dashboards/kpi.html', 'KPI Dashboard', 'Scorecard of company KPIs with targets, trends and status — the view a monthly business review starts from. <b>Sample data.</b>', body)

# ================================================================== Custom
CUSTOM_WIDGETS = [
    ('rev', 's-8', lambda: cc('Revenue trend', 'Monthly revenue vs last year', {'type': 'line', 'categories': M12, 'unit': INR, 'smooth': True, 'series': [S('This year', REV, type='area'), S('Last year', REV_LY, dashed=True, c=8)]}, h=280, span='s-8', hid='w-rev')),
    ('mix', 's-4', lambda: cc('Category mix', 'Revenue share', {'type': 'pie', 'donut': True, 'unit': INR, 'labels': False, 'data': [{'name': c, 'value': v} for c, v in zip(CATS, CAT_SALES)][:5]}, h=280, span='s-4', hid='w-mix')),
    ('reg', 's-6', lambda: cc('Revenue by region', 'Click a region to cross-filter', {'type': 'column', 'categories': REGIONS, 'unit': INR, 'labels': True, 'dim': 'region', 'series': [S('Revenue', REGION_REV)]}, h=260, span='s-6', hid='w-reg')),
    ('stk', 's-6', lambda: cc('Stock by warehouse', 'Inventory value', {'type': 'bar', 'categories': WHS, 'unit': INR, 'labels': True, 'series': [S('Stock value', [2.41e7, 1.96e7, 1.72e7, 1.12e7, .99e7])]}, h=260, span='s-6', hid='w-stk')),
    ('fun', 's-4', lambda: cc('Sales funnel', 'This quarter', {'type': 'funnel', 'palette': 'ordinal', 'conv': True, 'data': [{'name': n, 'value': v} for n, v in [('Leads', 2960), ('Qualified', 1420), ('Proposal', 640), ('Won', 486)]]}, h=260, span='s-4', hid='w-fun')),
    ('otf', 's-4', lambda: cc('OTIF', 'On time, in full', {'type': 'gauge', 'value': 92.6, 'unit': PCT, 'label': 'OTIF', 'ring': True}, h=260, span='s-4', hid='w-otf')),
    ('cash', 's-4', lambda: cc('Cash flow bridge', 'This quarter', {'type': 'waterfall', 'unit': INR, 'labels': False, 'categories': ['Opening', 'Collections', 'Payments', 'Payroll', 'Capex', 'Closing'], 'data': [3.2e7, 9.8e7, -7.1e7, -1.6e7, -.9e7, {'total': True}]}, h=260, span='s-4', hid='w-cash')),
    ('heat', 's-6', lambda: cc('Orders by weekday and hour', 'Dispatch load', {'type': 'heatmap', 'x': [f'{h}:00' for h in range(8, 20, 2)], 'y': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], 'data': [[x, y, 20 + (x * 7 + y * 11) % 38] for y in range(5) for x in range(6)]}, h=240, span='s-6', hid='w-heat')),
    ('chn', 's-6', lambda: cc('Churn trend', 'Monthly churn with 3% threshold', {'type': 'line', 'categories': M12, 'unit': PCT, 'threshold': {'value': 3, 'label': 'Alert'}, 'series': [S('Churn', trend(2.9, 2.4, seed=31, dp=1))]}, h=240, span='s-6', hid='w-chn')),
]

def custom():
    toolbar = (f'<div class="fbar" role="toolbar" aria-label="Customize dashboard"><span class="fbar__l">{ic("layout_cell_four", "ic--s")}Layout</span>'
               f'<button type="button" class="btn btn--s btn--primary" data-cust-edit aria-pressed="false">{ic("edit")}Customize</button>'
               f'<button type="button" class="btn btn--s" data-cust-add>{ic("add")}Add widget</button><button type="button" class="btn btn--s btn--subtle" data-cust-reset>{ic("arrow_reset")}Reset layout</button>'
               f'<span class="muted" style="font:var(--t-cap)" data-cust-msg>Your layout is saved in this browser.</span></div>')
    widgets = ''.join(f.__call__().replace('<article class="card cc', f'<article data-wid="{k}" class="card cc', 1).replace('<div class="card__a">', f'<div class="card__a"><span class="cust-tools row" style="gap:2px"><button type="button" class="ibtn ibtn--s" data-cust-size aria-label="Change width">{ic("arrow_maximize")}</button><button type="button" class="ibtn ibtn--s" data-cust-rm aria-label="Remove widget">{ic("dismiss")}</button></span>', 1) for k, _, f in CUSTOM_WIDGETS)
    body = toolbar + note('Turn on <b>Customize</b> to drag widgets into a new order, change their width or remove them. <b>Add widget</b> brings removed widgets back from the catalog.') + f'<div class="g cust" data-cust>{widgets}</div>'
    page('dashboards/custom.html', 'Custom Dashboard', 'A personal dashboard assembled from a widget catalog — reorder, resize, remove and add widgets; the layout persists per browser. <b>Sample data.</b>', body, crumbs=[DASH], scripts=('charts', 'table', 'custom'))

# ================================================================== Inventory
def inventory():
    rows = unit_rows()
    body = fbar(('warehouse', 'category')) + flow('KPI cards', 'Stock trend', 'Category distribution', 'Warehouse comparison', 'Slow-moving products', 'Inventory table') + kpis(
        kpi('Total inventory value', 8.7e7, INR, '4.6%', good=False, sub='vs last month · working capital up', icon='box', spark=trend(7.9, 8.7, seed=41, dp=2)),
        kpi('Available stock', 284000, {'indian': True}, '2.1%', sub='units across 5 warehouses', icon='box_multiple'),
        kpi('Low stock', 14, {'suf': ' SKUs'}, '5', good=False, sub='below reorder point', icon='warning', status='warn'),
        kpi('Out of stock', 3, {'suf': ' SKUs'}, '1', good=False, sub='₹6.4 L sales at risk', icon='error_circle', status='crit'),
        kpi('Stock turnover', 6.2, {'suf': '×', 'dp': 1}, '0.4', sub='annualised', icon='arrow_sync'),
        kpi('Warehouse utilisation', 78, PCT0, '3 pts', good=False, sub='pallet positions', icon='building_retail'), n=6)
    body += grid(
        cc('Stock level', 'Inventory value with the reorder floor', {'type': 'area', 'categories': M12, 'unit': INR, 'gradient': True, 'smooth': True, 'threshold': {'value': 7.0e7, 'label': 'Floor'}, 'zoom': True,
            'series': [S('Stock value', trend(7.4e7, 8.7e7, seed=42, season=[.0, .04, .08, -.03, -.05, 0, .02, .01, -.02, .0, .03, .05]))]}, h=300, span='s-8'),
        cc('Warehouse utilisation', 'All warehouses, pallet positions', {'type': 'gauge', 'value': 78, 'max': 100, 'unit': PCT0, 'label': 'utilised', 'bands': [[70, 'good'], [85, 'warn'], [100, 'crit']], 'ticks': True}, h=300, span='s-4'),
        cc('Stock movement', 'Units received vs issued per month', {'type': 'line', 'categories': M12, 'smooth': True, 'unit': {'indian': True},
            'series': [S('Inbound', trend(41000, 52000, seed=43, season=SEASON)), S('Outbound', trend(39500, 50600, seed=44, season=SEASON), c=2)]}, h=280, span='s-6'),
        cc('Inventory by category', 'Stock value · click a slice to drill into sub-categories', {'type': 'pie', 'donut': True, 'unit': INR, 'centerLabel': 'Stock value', 'legendRight': True, 'labels': False, 'drill': CAT_DRILL, 'dimName': 'Category',
            'data': [{'name': c, 'value': v} for c, v in zip(CATS, [2.31e7, 1.74e7, 1.32e7, 1.21e7, .96e7, 1.16e7])]}, h=280, span='s-6'),
        cc('Warehouse stock', 'Stock value by warehouse · click to cross-filter', {'type': 'column', 'categories': WHS, 'unit': INR, 'labels': True, 'dim': 'warehouse', 'series': [S('Stock value', [2.41e7, 1.96e7, 1.72e7, 1.12e7, .99e7])]}, h=280, span='s-6'),
        cc('Inventory aging', 'Stock value by days since receipt', {'type': 'column', 'categories': ['0–30 d', '31–60 d', '61–90 d', '91–180 d', '180+ d'], 'unit': INR, 'labels': True, 'xName': 'Age band',
            'series': [S('Stock value', [3.62e7, 2.31e7, 1.28e7, .94e7, .45e7], pst=[None, None, None, 'serious', 'crit'])]}, h=280, span='s-6'),
        cc('Product movement', 'Top moving products, units issued this month', {'type': 'bar', 'categories': PRODUCTS[:8], 'labels': True, 'sort': 'desc', 'unit': {'indian': True}, 'series': [S('Units issued', [18400, 6200, 9100, 11800, 5400, 4300, 22600, 7400])]}, h=300, span='s-6'),
        cc('Slow-moving products', 'Days of cover — over 120 days is flagged', {'type': 'bar', 'categories': ['Gasket DN50', 'Fuse 16A', 'Motor 2HP', 'Hand drill 13mm', 'Busbar 200A', 'Valve 1in', 'Relay 24V'], 'unit': {'suf': ' d'}, 'labels': True, 'sort': 'desc',
            'threshold': {'value': 120, 'label': 'Review'}, 'series': [S('Days of cover', [212, 188, 164, 141, 128, 112, 96], pst=['crit', 'crit', 'serious', 'serious', 'serious', None, None])]}, h=300, span='s-6'),
        cc('Category contribution', 'Stock value by category and sub-category', {'type': 'treemap', 'unit': INR, 'data': [
            {'name': 'Electrical', 'children': [{'name': 'Cables', 'value': 1.02e7}, {'name': 'Switchgear', 'value': .74e7}, {'name': 'Lighting', 'value': .55e7}]},
            {'name': 'Hardware', 'children': [{'name': 'Fasteners', 'value': .71e7}, {'name': 'Brackets', 'value': .58e7}, {'name': 'Tools', 'value': .45e7}]},
            {'name': 'Packaging', 'children': [{'name': 'Corrugated', 'value': .78e7}, {'name': 'Film', 'value': .54e7}]},
            {'name': 'Raw material', 'children': [{'name': 'Copper rod', 'value': .81e7}, {'name': 'Steel coil', 'value': .40e7}]},
            {'name': 'Spares', 'children': [{'name': 'Bearings', 'value': .56e7}, {'name': 'Belts', 'value': .40e7}]}]}, h=320, span='s-6'),
        cc('Warehouse comparison', 'Stock value vs capacity value, ₹', {'type': 'column', 'categories': WHS, 'unit': INR, 'dim': 'warehouse',
            'series': [S('Capacity', [3.0e7, 2.6e7, 2.4e7, 1.6e7, 1.5e7], ghost=True, c=1), S('Stock value', [2.41e7, 1.96e7, 1.72e7, 1.12e7, .99e7], c=1)]}, h=320, span='s-6'),
        dtable({'caption': 'Inventory by SKU', 'noun': 'SKUs', 'pageSize': 10, 'select': True, 'statusMap': INV_STATUS, 'sort': {'key': 'value', 'dir': 'desc'},
                'columns': [{'key': 'sku', 'label': 'SKU', 'w': 120, 'sticky': True}, {'key': 'product', 'label': 'Product', 'type': 'prod', 'w': 220}, {'key': 'category', 'label': 'Category', 'group': True},
                            {'key': 'warehouse', 'label': 'Warehouse', 'group': True}, {'key': 'qty', 'label': 'On hand', 'type': 'num', 'agg': 'sum'}, {'key': 'value', 'label': 'Value', 'type': 'inr', 'agg': 'sum', 'w': 150},
                            {'key': 'days', 'label': 'Days of cover', 'type': 'num', 'agg': 'avg'}, {'key': 'growth', 'label': 'Movement', 'type': 'growth'}, {'key': 'status', 'label': 'Status', 'type': 'status', 'group': True}],
                'rows': rows}, title='Inventory table', sub='48 SKUs · select rows to export them, group by category or warehouse'),
    )
    dash('dashboards/inventory.html', 'Inventory Dashboard', 'Stock value, availability, movement and aging across five warehouses — read top to bottom from headline to SKU detail. <b>Sample data.</b>', body, crumbs=BIZ)

# ================================================================== Sales
TILE_CODES = [
    [None, None, None, 'JK', None, None, None],
    [None, None, 'PB', 'HP', 'UK', None, None],
    [None, 'RJ', 'HR', 'DL', 'UP', 'BR', 'AS'],
    ['GJ', 'MP', 'CG', 'JH', 'WB', None, None],
    [None, 'MH', 'TS', 'OD', None, None, None],
    [None, 'GA', 'KA', 'AP', None, None, None],
    [None, None, 'KL', 'TN', None, None, None]]
TILE_NAMES = {'JK': 'Jammu & Kashmir', 'PB': 'Punjab', 'HP': 'Himachal Pradesh', 'UK': 'Uttarakhand', 'RJ': 'Rajasthan', 'HR': 'Haryana', 'DL': 'Delhi NCR', 'UP': 'Uttar Pradesh', 'BR': 'Bihar', 'AS': 'Assam',
              'GJ': 'Gujarat', 'MP': 'Madhya Pradesh', 'CG': 'Chhattisgarh', 'JH': 'Jharkhand', 'WB': 'West Bengal', 'MH': 'Maharashtra', 'TS': 'Telangana', 'OD': 'Odisha', 'GA': 'Goa', 'KA': 'Karnataka', 'AP': 'Andhra Pradesh', 'KL': 'Kerala', 'TN': 'Tamil Nadu'}
TILE_V = {'JK': .21, 'PB': .58, 'HP': .19, 'UK': .27, 'RJ': .46, 'HR': .54, 'DL': 1.12, 'UP': .72, 'BR': .29, 'AS': .2, 'GJ': .88, 'MP': .92, 'CG': .55, 'JH': .26, 'WB': .71, 'MH': 1.31, 'TS': .56, 'OD': .38, 'GA': .12, 'KA': .94, 'AP': .3, 'KL': .34, 'TN': .82}

def tilemap_spec(title='Sales by state'):
    data, codes, names = [], [], []
    for y, row in enumerate(TILE_CODES):
        codes.append([c or '' for c in row]); names.append([TILE_NAMES.get(c, '') if c else '' for c in row])
        for x, c in enumerate(row):
            if c:
                data.append([x, y, round(TILE_V[c] * 1e7)])
    return {'type': 'tilemap', 'x': [str(i) for i in range(7)], 'y': [str(i) for i in range(7)], 'data': data, 'codes': codes, 'names': names, 'unit': INR, 'name': 'Revenue', 'title': title}

def sales():
    body = fbar(('region', 'category', 'customer')) + flow('Revenue KPI', 'Revenue trend', 'Sales by region', 'Top products', 'Sales funnel', 'Customer segments') + kpis(
        kpi('Total sales', 12.4e7, INR, '18.4%', sub='vs last year', icon='money', spark=[round(v / 1e6, 1) for v in REV]),
        kpi('Orders', 4820, CNT, '12.2%', sub='vs last year', icon='cart', spark=ORDERS, spark_kind='bars'),
        kpi('Average order value', 25726, {'pre': '₹'}, '5.5%', sub='vs last year', icon='payment'),
        kpi('Conversion rate', 3.8, PCT, '0.4 pts', sub='quote to order', icon='arrow_trending_lines'),
        kpi('Gross margin', 32.6, PCT, '1.2 pts', good=False, up=False, sub='copper cost pass-through lag', icon='calculator'),
        kpi('Sales growth', 18.4, PCT, '3.4 pts', sub='ahead of 15% plan', icon='data_trending'), n=6)
    body += grid(
        cc('Monthly sales', 'Revenue this year vs last year · zoom with drag', {'type': 'line', 'categories': M12, 'labelsFull': ML12, 'unit': INR, 'zoom': True, 'smooth': True, 'labels': 'end',
            'series': [S('This year', REV), S('Last year', REV_LY, dashed=True, c=8)]}, h=320, span='s-8'),
        cc('Revenue vs target', 'Monthly revenue against plan — one shared scale', {'type': 'combo', 'categories': M12, 'unit': INR,
            'series': [S('Revenue', REV), S('Plan', trend(9.0e6, 11.6e6, seed=51, noise=.0), type='line', c=8, dashed=True)]}, h=320, span='s-4'),
        cc('Sales by region', 'Map-style tile view of states · darker is higher revenue', tilemap_spec(), h=360, span='s-6'),
        cc('Salesperson ranking', 'Revenue booked this quarter', {'type': 'bar', 'categories': ['Sneha Kapoor', 'Rohit Iyer', 'Arjun Mehta', 'Priya Nair', 'Vikram Rao', 'Meera Das', 'Kabir Shah', 'Neha Gupta'], 'unit': INR, 'labels': True, 'sort': 'desc',
            'target': {'value': 1.0e7, 'label': 'Quota'}, 'series': [S('Booked', [1.42e7, 1.21e7, 1.18e7, .97e7, .91e7, .86e7, .74e7, .62e7])]}, h=360, span='s-6'),
        cc('Product performance', 'Revenue and units for the top 6 products', {'type': 'column', 'categories': PRODUCTS[:6], 'unit': INR, 'series': [S('Revenue', PROD_REV[:6])], 'labels': True}, h=280, span='s-6'),
        cc('Sales by category', 'Click Electrical, Hardware or Packaging to drill down', {'type': 'pie', 'unit': INR, 'drill': CAT_DRILL, 'labels': True, 'legend': False, 'dim': 'category', 'dimName': 'Category',
            'data': [{'name': c, 'value': v} for c, v in zip(CATS, CAT_SALES)]}, h=280, span='s-6'),
        cc('Conversion trend', 'Quote-to-order conversion by channel', {'type': 'line', 'categories': M12, 'unit': PCT, 'zero': False, 'symbols': True,
            'series': [S('Direct B2B', trend(3.1, 4.2, seed=52, dp=1)), S('Distributors', trend(2.9, 3.5, seed=53, dp=1), c=2)]}, h=260, span='s-4'),
        cc('Customer segment', 'Revenue share by segment', {'type': 'pie', 'donut': True, 'unit': INR, 'centerLabel': 'Revenue', 'labels': False,
            'data': [{'name': 'Enterprise', 'value': 4.9e7}, {'name': 'Mid-market', 'value': 3.6e7}, {'name': 'SMB', 'value': 2.8e7}, {'name': 'Government', 'value': 1.1e7}]}, h=260, span='s-4'),
        cc('Sales funnel', 'Opportunities this quarter', {'type': 'funnel', 'palette': 'ordinal', 'conv': True, 'data': [{'name': n, 'value': v} for n, v in [('Leads', 2960), ('Qualified', 1420), ('Quoted', 820), ('Negotiation', 610), ('Won', 486)]]}, h=260, span='s-4'),
        dtable({'caption': 'Top products', 'noun': 'products', 'pageSize': 10, 'sort': {'key': 'sales', 'dir': 'desc'}, 'statusMap': {'Growing': 'good', 'Stable': 'info', 'Declining': 'warn', 'Discontinued': 'crit'},
                'columns': [{'key': 'product', 'label': 'Product', 'type': 'prod', 'w': 230}, {'key': 'category', 'label': 'Category', 'group': True}, {'key': 'sales', 'label': 'Sales', 'type': 'inr', 'agg': 'sum', 'w': 150},
                            {'key': 'qty', 'label': 'Qty', 'type': 'num', 'agg': 'sum'}, {'key': 'growth', 'label': 'Growth', 'type': 'growth'}, {'key': 'status', 'label': 'Status', 'type': 'status', 'group': True}],
                'rows': [{'product': r_['product'], 'category': r_['category'], 'sales': r_['value'] * 3, 'qty': r_['qty'] * 4, 'growth': r_['growth'], 'status': 'Growing' if r_['growth'] > 8 else 'Declining' if r_['growth'] < -6 else 'Stable'} for r_ in unit_rows(9)[:30]]},
               title='Top products', sub='Product | Category | Sales | Qty | Growth | Status'),
    )
    dash('dashboards/sales.html', 'Sales Dashboard', 'Revenue, orders and conversion — from the headline number down to products, regions and the funnel. <b>Sample data.</b>', body, crumbs=BIZ)

# ================================================================== Procurement
def procurement():
    r = rnd(61)
    sup = [('Tata Steel', 96, 92, 8.4e7), ('Havells', 93, 95, 4.1e7), ('Polycab', 88, 90, 5.6e7), ('SKF India', 97, 97, 2.2e7), ('Uflex', 84, 86, 1.9e7), ('Finolex', 91, 88, 3.1e7), ('Jindal', 79, 83, 4.6e7), ('Hindalco', 90, 91, 3.8e7), ('Supreme', 86, 94, 1.4e7)]
    body = fbar(('supplier', 'category', 'status')) + kpis(
        kpi('Purchase orders', 1284, CNT, '7.5%', sub='vs last year', icon='clipboard_task', spark=trend(96, 118, seed=62), spark_kind='bars'),
        kpi('Purchase value', 6.2e7, INR, '9.8%', good=False, sub='vs last year', icon='money'),
        kpi('Pending approvals', 46, CNT, '6', good=False, sub='6 waiting for you', icon='clock', status='warn', action=f'<a class="btn btn--s btn--subtle" href="#po-table" style="margin-left:auto">Review</a>'),
        kpi('Active suppliers', 426, CNT, '12', sub='31 strategic', icon='building_factory'),
        kpi('Procurement cycle', 11.6, DAYS, '1.4 d', up=False, sub='requisition to PO', icon='timeline'),
        kpi('On-time delivery', 91.4, PCT, '2.1 pts', sub='target 92%', icon='vehicle_truck', target=(99, '0.6 pts below target', 'warn')), n=6)
    body += kpis(kpi('Purchase savings', 3.84e6, INR, '11.0%', sub='negotiated vs last price paid, YTD', icon='payment', target=(96, '₹38.4 L of ₹40 L goal', 'ok')),
                 kpi('Spend under contract', 82.4, PCT, '4.1 pts', sub='policy minimum 80%', icon='shield_task'), kpi('Avg PO value', 4.83e5, INR, '2.2%', sub='vs last year', icon='calculator'), n=3)
    body += grid(
        cc('Monthly procurement', 'PO value and PO count — two panels, two scales, one time axis', {'type': 'combo', 'categories': M12, 'unit': INR, 'unit2': CNT, 'panelNames': ['PO value', 'PO count'],
            'series': [S('PO value', trend(4.4e6, 6.1e6, seed=63, season=SEASON)), S('PO count', trend(92, 118, seed=64, season=SEASON), type='line', panel=1, c=2)]}, h=340, span='s-8'),
        cc('Purchase by category', 'Spend share, last 12 months', {'type': 'pie', 'donut': True, 'unit': INR, 'centerLabel': 'Spend', 'labels': False, 'dim': 'category',
            'data': [{'name': c, 'value': v} for c, v in zip(CATS, [1.86e7, .94e7, .81e7, 1.42e7, .61e7, .56e7])]}, h=340, span='s-4'),
        cc('Supplier performance', 'On-time % vs quality score · bubble size is spend', {'type': 'bubble', 'xName': 'On-time delivery', 'yName': 'Quality score', 'zName': 'Spend', 'xUnit': PCT0, 'yUnit': PCT0, 'zUnit': INR, 'labels': True, 'quadrant': True,
            'series': [S('Suppliers', [{'name': n, 'value': [a, b, c]} for n, a, b, c in sup])]}, h=320, span='s-6'),
        cc('Supplier distribution', 'Spend by supplier tier and supplier', {'type': 'treemap', 'unit': INR, 'data': [
            {'name': 'Strategic', 'children': [{'name': 'Tata Steel', 'value': 8.4e6}, {'name': 'Polycab', 'value': 5.6e6}, {'name': 'Jindal', 'value': 4.6e6}]},
            {'name': 'Preferred', 'children': [{'name': 'Havells', 'value': 4.1e6}, {'name': 'Hindalco', 'value': 3.8e6}, {'name': 'Finolex', 'value': 3.1e6}]},
            {'name': 'Approved', 'children': [{'name': 'SKF India', 'value': 2.2e6}, {'name': 'Uflex', 'value': 1.9e6}, {'name': 'Supreme', 'value': 1.4e6}]}]}, h=320, span='s-6'),
        cc('PO status', 'Purchase orders by status per month', {'type': 'column', 'categories': M12[-6:], 'stack': 'normal',
            'series': [S('Received', [62, 70, 66, 74, 79, 81]), S('Approved', [18, 21, 19, 24, 22, 26]), S('Pending', [9, 11, 8, 12, 10, 14], c=4), S('Cancelled', [3, 2, 4, 2, 3, 2], c=8)]}, h=280, span='s-4'),
        cc('Procurement funnel', 'Requisition to receipt, this quarter', {'type': 'funnel', 'palette': 'ordinal', 'conv': True, 'data': [{'name': n, 'value': v} for n, v in [('Requisitions', 1640), ('RFQs sent', 1210), ('Quotes received', 980), ('POs issued', 912), ('Goods received', 861)]]}, h=280, span='s-4'),
        cc('Delivery performance', 'Share of POs on time by supplier', {'type': 'bar', 'categories': [s[0] for s in sup[:6]], 'stack': 'percent', 'series': [S('On time', [s[1] for s in sup[:6]], tone='pos'), S('Late', [100 - s[1] for s in sup[:6]], tone='neg')]}, h=280, span='s-4'),
        cc('Cost trend', 'Commodity price index (Oct 2025 = 100)', {'type': 'line', 'categories': M12, 'zero': False, 'labels': 'end', 'xName': 'Month',
            'series': [S('Copper', trend(100, 118, seed=65, dp=1)), S('Steel HRC', trend(100, 104, seed=66, dp=1)), S('Kraft paper', trend(100, 93, seed=67, dp=1)), S('Polymer', trend(100, 109, seed=68, dp=1))]}, h=300, span='s-12'),
        f'<div class="s-12" id="po-table">' + dtable({'caption': 'Purchase orders', 'noun': 'POs', 'pageSize': 10, 'select': True, 'statusMap': {'Received': 'good', 'Approved': 'info', 'Pending approval': 'warn', 'Overdue': 'crit', 'Cancelled': 'crit'},
            'columns': [{'key': 'po', 'label': 'PO', 'w': 110}, {'key': 'sup', 'label': 'Supplier', 'group': True, 'w': 160}, {'key': 'cat', 'label': 'Category', 'group': True}, {'key': 'val', 'label': 'Value', 'type': 'inr', 'agg': 'sum', 'w': 150},
                        {'key': 'lead', 'label': 'Lead time (d)', 'type': 'num', 'agg': 'avg'}, {'key': 'due', 'label': 'Due'}, {'key': 'st', 'label': 'Status', 'type': 'status', 'group': True}],
            'rows': [{'po': f'PO-{7700 + i * 3}', 'sup': sup[i % 9][0], 'cat': CATS[i % 6], 'val': r.randint(80, 2600) * 1000, 'lead': r.randint(5, 26), 'due': f'{r.randint(1, 30)} Oct', 'st': ['Received', 'Approved', 'Pending approval', 'Overdue', 'Received', 'Cancelled', 'Approved'][i % 7]} for i in range(34)]},
            title='Purchase orders', sub='Approve, review or export POs') + '</div>',
    )
    dash('dashboards/procurement.html', 'Procurement Dashboard', 'Spend, purchase orders, supplier performance and commodity costs. <b>Sample data.</b>', body, crumbs=BIZ)

# ================================================================== Finance
def finance():
    exp = [round(v * f) for v, f in zip(REV, trend(.79, .77, seed=71, noise=.02, dp=3))]
    body = fbar(('department', 'region')) + kpis(
        kpi('Revenue', 12.4e7, INR, '18.4%', sub='year to date', icon='money'), kpi('Expenses', 9.6e7, INR, '14.9%', good=False, sub='year to date', icon='payment'),
        kpi('Profit', 2.8e7, INR, '4.1%', good=False, up=False, sub='EBITDA', icon='arrow_trending_lines'), kpi('Cash flow', 1.1e7, INR, '₹0.3 Cr', sub='operating, this quarter', icon='wallet'), n=4)
    body += kpis(kpi('Receivables', 4.2e7, INR, '9.0%', good=False, sub='DSO 58 days', icon='document_bullet_list', status='warn'), kpi('Payables', 3.1e7, INR, '3.0%', sub='DPO 47 days', icon='receipt'),
                 kpi('Budget utilisation', 72.4, PCT, '4.0 pts', good=False, sub='₹46.3 Cr of ₹64.0 Cr', icon='calculator', target=(72, '9 of 12 months elapsed (75%)', 'ok')), n=3)
    body += grid(
        cc('Revenue vs expense', 'Monthly, ₹', {'type': 'column', 'categories': M12, 'unit': INR, 'series': [S('Revenue', REV), S('Expenses', exp, c=2)]}, h=300, span='s-8'),
        cc('Expense category', 'Share of operating expenses', {'type': 'pie', 'donut': True, 'unit': INR, 'centerLabel': 'Opex', 'labels': False,
            'data': [{'name': n, 'value': v} for n, v in [('Materials', 4.9e7), ('Payroll', 2.2e7), ('Logistics', 1.1e7), ('Facilities', .7e7), ('Other', .7e7)]]}, h=300, span='s-4'),
        cc('Profit trend', 'EBITDA (₹) and EBITDA margin (%) — panels share the month axis', {'type': 'combo', 'categories': M12, 'unit': INR, 'unit2': PCT, 'panelNames': ['EBITDA', 'Margin'],
            'series': [S('EBITDA', [a - b for a, b in zip(REV, exp)]), S('Margin', [round((a - b) / a * 100, 1) for a, b in zip(REV, exp)], type='line', panel=1, c=7)]}, h=320, span='s-6'),
        cc('Cash flow', 'Opening to closing cash, this quarter', {'type': 'waterfall', 'unit': INR, 'categories': ['Opening cash', 'Collections', 'Supplier payments', 'Payroll', 'Taxes', 'Capex', 'Closing cash'],
            'data': [3.2e7, 9.8e7, -6.4e7, -1.6e7, -.7e7, -.9e7, {'total': True}]}, h=320, span='s-6'),
        cc('Budget vs actual', 'By department, year to date', {'type': 'bar', 'categories': DEPTS, 'unit': INR, 'dim': 'department',
            'series': [S('Budget', [14.2e7, 18.6e7, 4.1e7, 9.8e7, 3.2e7, 6.4e7], ghost=True, c=1), S('Actual', [10.9e7, 14.1e7, 2.8e7, 7.6e7, 2.1e7, 5.6e7], c=1)]}, h=300, span='s-4'),
        cc('Receivables aging', 'Outstanding invoices by days overdue', {'type': 'column', 'categories': ['Current', '1–30', '31–60', '61–90', '90+'], 'unit': INR, 'labels': True, 'xName': 'Days overdue',
            'series': [S('Receivables', [2.1e7, 1.02e7, .54e7, .31e7, .23e7], pst=[None, None, 'warn', 'serious', 'crit'])]}, h=300, span='s-4'),
        cc('Payables aging', 'Supplier invoices by days to due date', {'type': 'column', 'categories': ['Overdue', '0–15', '16–30', '31–45', '45+'], 'unit': INR, 'labels': True, 'xName': 'Days to due',
            'series': [S('Payables', [.21e7, .86e7, .94e7, .62e7, .47e7], pst=['crit', None, None, None, None])]}, h=300, span='s-4'),
        dtable({'caption': 'Monthly financial performance', 'noun': 'months', 'pageSize': 12, 'actions': False, 'sticky': True,
                'columns': [{'key': 'm', 'label': 'Month', 'w': 110, 'sort': False}, {'key': 'q', 'label': 'Quarter', 'group': True}, {'key': 'rev', 'label': 'Revenue', 'type': 'inr', 'agg': 'sum'}, {'key': 'exp', 'label': 'Expenses', 'type': 'inr', 'agg': 'sum'},
                            {'key': 'pr', 'label': 'Profit', 'type': 'inr', 'agg': 'sum'}, {'key': 'mg', 'label': 'Margin', 'type': 'pct', 'agg': 'avg'}, {'key': 'g', 'label': 'Growth (YoY)', 'type': 'growth'}],
                'rows': [{'m': ML12[i], 'q': ['Q3 FY26', 'Q3 FY26', 'Q3 FY26', 'Q4 FY26', 'Q4 FY26', 'Q4 FY26', 'Q1 FY27', 'Q1 FY27', 'Q1 FY27', 'Q2 FY27', 'Q2 FY27', 'Q2 FY27'][i], 'rev': REV[i], 'exp': exp[i], 'pr': REV[i] - exp[i], 'mg': round((REV[i] - exp[i]) / REV[i] * 100, 1), 'g': round((REV[i] / REV_LY[i] - 1) * 100, 1)} for i in range(12)]},
               title='Monthly financial performance', sub='Group by quarter to see subtotals'),
    )
    dash('dashboards/finance.html', 'Finance Dashboard', 'Revenue, expenses, profit, cash and working capital with budget tracking. <b>Sample data.</b>', body, crumbs=BIZ)

# ================================================================== Customers
def customers():
    r = rnd(81)
    body = fbar(('region', 'customer')) + kpis(
        kpi('Total customers', 18420, CNT, '6.3%', sub='vs last year', icon='people'), kpi('New customers', 642, CNT, '11.0%', sub='this month', icon='person', spark=trend(510, 642, seed=82), spark_kind='bars'),
        kpi('Active customers', 12860, CNT, '4.8%', sub='ordered in 90 days', icon='pulse'), kpi('Churn', 2.4, PCT, '0.5 pts', up=False, sub='monthly, below 3% alert', icon='arrow_trending_lines'), n=4)
    body += kpis(kpi('Customer lifetime value', 3.8e5, INR, '7.2%', sub='average, 3-year horizon', icon='money'), kpi('Leads', 2960, CNT, '14.0%', sub='this quarter', icon='people_community'),
                 kpi('Opportunities', 486, CNT, '9.0%', sub='₹18.6 Cr pipeline', icon='target'), kpi('Conversion', 16.4, PCT, '1.8 pts', sub='lead to opportunity', icon='data_funnel'), n=4)
    body += grid(
        cc('Customer acquisition', 'New customers by channel per month', {'type': 'column', 'categories': M12, 'stack': 'normal', 'labels': True,
            'series': [S('Field sales', trend(180, 230, seed=83)), S('Distributors', trend(160, 210, seed=84)), S('Website', trend(90, 150, seed=85)), S('Referral', trend(40, 52, seed=86))]}, h=300, span='s-8'),
        cc('Customer segments', 'Active customers', {'type': 'pie', 'donut': True, 'centerLabel': 'Customers', 'labels': False, 'data': [{'name': 'SMB', 'value': 7840}, {'name': 'Mid-market', 'value': 3260}, {'name': 'Enterprise', 'value': 1280}, {'name': 'Government', 'value': 480}]}, h=300, span='s-4'),
        cc('Lead funnel', 'Lead to customer, this quarter', {'type': 'funnel', 'palette': 'ordinal', 'conv': True, 'data': [{'name': n, 'value': v} for n, v in [('Leads', 2960), ('Contacted', 2210), ('Qualified', 1420), ('Opportunity', 486), ('Customer', 212)]]}, h=300, span='s-4'),
        cc('Opportunity pipeline', 'Open value by stage and owner', {'type': 'bar', 'categories': ['Discovery', 'Proposal', 'Negotiation', 'Commit'], 'stack': 'normal', 'unit': INR, 'labels': True,
            'series': [S('Sneha', [1.8e7, 1.4e7, .9e7, .6e7]), S('Rohit', [1.5e7, 1.1e7, .8e7, .5e7]), S('Arjun', [1.2e7, .9e7, .7e7, .4e7])]}, h=300, span='s-4'),
        cc('Churn trend', 'Monthly churn, 3% alert threshold', {'type': 'line', 'categories': M12, 'unit': PCT, 'threshold': {'value': 3, 'label': 'Alert'}, 'symbols': True, 'series': [S('Churn', trend(2.9, 2.4, seed=87, dp=1)), S('Industry benchmark', [2.8] * 12, dashed=True, c=8)]}, h=300, span='s-4'),
        cc('Customer value distribution', 'Customers by lifetime value band', {'type': 'histogram', 'categories': ['<50K', '50K–1L', '1–2L', '2–5L', '5–10L', '10–25L', '25L+'], 'xName': 'Lifetime value (₹)', 'labels': True, 'series': [S('Customers', [4210, 5120, 3940, 2860, 1320, 680, 290])]}, h=280, span='s-6'),
        cc('Sales conversion', 'Lead to opportunity, by source', {'type': 'line', 'categories': M12, 'unit': PCT, 'zero': False, 'smooth': True, 'labels': 'end',
            'series': [S('Referral', trend(24, 29, seed=88, dp=1)), S('Field', trend(17, 19, seed=89, dp=1)), S('Website', trend(9, 12, seed=90, dp=1))]}, h=280, span='s-6'),
        dtable({'caption': 'Key accounts', 'noun': 'accounts', 'pageSize': 8, 'statusMap': {'Healthy': 'good', 'At risk': 'warn', 'Churn risk': 'crit', 'New': 'info'},
                'columns': [{'key': 'a', 'label': 'Account', 'type': 'prod', 'w': 220}, {'key': 'seg', 'label': 'Segment', 'group': True}, {'key': 'reg', 'label': 'Region', 'group': True}, {'key': 'rev', 'label': 'Revenue (12 m)', 'type': 'inr', 'agg': 'sum', 'w': 160},
                            {'key': 'g', 'label': 'Growth', 'type': 'growth'}, {'key': 'nps', 'label': 'NPS', 'type': 'num', 'agg': 'avg'}, {'key': 's', 'label': 'Health', 'type': 'status', 'group': True}],
                'rows': [{'a': n, 'seg': ['Enterprise', 'Mid-market', 'SMB', 'Government'][i % 4], 'reg': REGIONS[i % 5], 'rev': r.randint(12, 160) * 1e5, 'g': round(r.uniform(-15, 35), 1), 'nps': r.randint(10, 70), 's': ['Healthy', 'Healthy', 'At risk', 'New', 'Healthy', 'Churn risk'][i % 6]}
                         for i, n in enumerate(['Bharat Infra', 'Apex Retail', 'Deccan Motors', 'Everest Pharma', 'Coastal Traders', 'Nimbus Data', 'Kaveri Foods', 'Sahyadri Agro', 'Indus Towers', 'Ganga Textiles', 'Orion Hospitals', 'Vindhya Cement', 'Lotus Builders', 'Malabar Exports', 'Zenith Auto', 'Pioneer Pumps'])]},
               title='Key accounts', sub='Health, growth and NPS'),
    )
    dash('dashboards/customers.html', 'Customer / CRM Dashboard', 'Customer base, acquisition, churn, lifetime value and the lead-to-customer pipeline. <b>Sample data.</b>', body, crumbs=BIZ)

# ================================================================== HR
def hr():
    r = rnd(91)
    body = fbar(('department', 'region')) + kpis(
        kpi('Headcount', 1248, CNT, '36', sub='this quarter', icon='people_team', spark=trend(1180, 1248, seed=92)), kpi('Attrition', 9.8, PCT, '0.7 pts', up=False, sub='annualised', icon='person'),
        kpi('Open positions', 64, CNT, '9', good=False, sub='21 critical', icon='briefcase'), kpi('Time to hire', 32, {'suf': ' days'}, '3 days', good=False, sub='target 30', icon='clock', status='warn'),
        kpi('Engagement', 78, PCT0, '2 pts', sub='pulse survey', icon='people'), kpi('Training', 14.2, {'suf': ' h', 'dp': 1}, '1.6 h', sub='per employee, YTD', icon='lightbulb'), n=6)
    body += grid(
        cc('Headcount trend', 'Employees by department', {'type': 'area', 'categories': M12, 'stack': 'normal', 'series': [S(d, trend(a, b, seed=93 + i)) for i, (d, a, b) in enumerate([('Operations', 488, 532), ('Sales', 254, 268), ('Procurement', 98, 107), ('Finance', 82, 87), ('IT', 96, 102), ('HR', 38, 40)])][:6]}, h=300, span='s-8'),
        cc('Hiring funnel', 'This quarter', {'type': 'funnel', 'palette': 'ordinal', 'conv': True, 'data': [{'name': n, 'value': v} for n, v in [('Applications', 4820), ('Screened', 1240), ('Interviewed', 410), ('Offers', 96), ('Joined', 78)]]}, h=300, span='s-4'),
        cc('Attrition by department', 'Annualised voluntary attrition', {'type': 'bar', 'categories': DEPTS, 'unit': PCT, 'labels': True, 'sort': 'desc', 'dim': 'department', 'threshold': {'value': 12, 'label': 'Alert'}, 'series': [S('Attrition', [13.8, 12.4, 6.1, 8.9, 5.2, 9.7])]}, h=280, span='s-4'),
        cc('Tenure distribution', 'Employees by years of service', {'type': 'histogram', 'categories': ['<1', '1–2', '2–3', '3–5', '5–8', '8–12', '12+'], 'xName': 'Years', 'labels': True, 'series': [S('Employees', [212, 248, 196, 254, 172, 104, 62])]}, h=280, span='s-4'),
        cc('Engagement by driver', 'Survey index, three largest departments', {'type': 'radar', 'indicators': [{'name': n, 'max': 100} for n in ['Manager', 'Growth', 'Pay', 'Workload', 'Recognition', 'Purpose']],
            'series': [S('Operations', [74, 62, 66, 58, 70, 78]), S('Sales', [80, 72, 71, 64, 76, 74]), S('IT', [82, 77, 69, 70, 73, 81])]}, h=280, span='s-4'),
        cc('Leave taken', 'Days of leave by department and month', {'type': 'heatmap', 'x': M12, 'y': DEPTS, 'name': 'Leave days', 'data': [[x, y, int((40 + y * 9) * (1.6 if x in (2, 6, 7) else 1) + r.randint(0, 18))] for y in range(6) for x in range(12)]}, h=280, span='s-12'),
        dtable({'caption': 'Open positions', 'noun': 'positions', 'pageSize': 8, 'statusMap': {'Interviewing': 'info', 'Offer made': 'good', 'Sourcing': 'warn', 'On hold': 'crit'},
                'columns': [{'key': 'r', 'label': 'Role', 'w': 220}, {'key': 'd', 'label': 'Department', 'group': True}, {'key': 'l', 'label': 'Location', 'group': True}, {'key': 'age', 'label': 'Days open', 'type': 'num', 'agg': 'avg'}, {'key': 'c', 'label': 'Candidates', 'type': 'num', 'agg': 'sum'}, {'key': 's', 'label': 'Stage', 'type': 'status', 'group': True}],
                'rows': [{'r': rl, 'd': d, 'l': l, 'age': r.randint(6, 70), 'c': r.randint(2, 28), 's': ['Interviewing', 'Offer made', 'Sourcing', 'Interviewing', 'On hold'][i % 5]} for i, (rl, d, l) in enumerate([
                    ('Warehouse supervisor', 'Operations', 'Chennai'), ('Key account manager', 'Sales', 'Mumbai'), ('Category buyer — electrical', 'Procurement', 'Pune'), ('Financial analyst', 'Finance', 'Gurugram'),
                    ('SAP MM consultant', 'IT', 'Pune'), ('Inventory controller', 'Operations', 'Kolkata'), ('Regional sales head', 'Sales', 'Bengaluru'), ('HR business partner', 'HR', 'Gurugram'),
                    ('Forklift operator (x6)', 'Operations', 'Ahmedabad'), ('Data engineer', 'IT', 'Hyderabad'), ('Accounts payable lead', 'Finance', 'Pune'), ('Field sales executive (x4)', 'Sales', 'Lucknow')])]},
               title='Open positions', sub='Hiring pipeline by role'),
    )
    dash('dashboards/hr.html', 'HR Dashboard', 'Workforce size, hiring, attrition, tenure, engagement and leave. <b>Sample data.</b>', body, crumbs=BIZ)

# ================================================================== Projects
def projects():
    r = rnd(101)
    proj = [('WMS upgrade', 'IT', 4.2e7, 3.1e7, 'At risk'), ('Pune plant line 3', 'Operations', 9.6e7, 6.8e7, 'On track'), ('E-invoicing rollout', 'Finance', 1.1e7, .9e7, 'On track'), ('Supplier portal', 'Procurement', 2.4e7, 1.2e7, 'On track'),
            ('CRM migration', 'Sales', 3.6e7, 3.3e7, 'Off track'), ('Solar rooftop Chennai', 'Operations', 2.8e7, 1.4e7, 'On track'), ('HRMS replacement', 'HR', 1.6e7, .7e7, 'At risk'), ('Data platform', 'IT', 3.1e7, 1.9e7, 'On track')]
    body = fbar(('department', 'status')) + kpis(
        kpi('Active projects', 24, CNT, '3', sub='this quarter', icon='briefcase'), kpi('On track', 18, {'suf': ' of 24'}, '2', sub='vs last month', icon='checkmark_circle', status='good'),
        kpi('Budget burn', 64, PCT0, '4 pts', good=False, sub='vs 60% plan', icon='money', target=(64, '₹18.6 Cr of ₹29.1 Cr', 'warn')), kpi('Overdue tasks', 37, CNT, '8', good=False, sub='across 6 projects', icon='warning', status='warn'),
        kpi('Resource utilisation', 82, PCT0, '3 pts', sub='billable / available hours', icon='people_team'), n=5)
    body += grid(
        cc('Budget vs spend by project', '₹, approved budget vs spend to date', {'type': 'bar', 'categories': [p[0] for p in proj], 'unit': INR,
            'series': [S('Budget', [p[2] for p in proj], ghost=True, c=1), S('Spent', [p[3] for p in proj], c=1)]}, h=340, span='s-8'),
        cc('Portfolio status', '24 active projects', {'type': 'pie', 'donut': True, 'centerLabel': 'Projects', 'legendRight': True, 'data': [{'name': 'On track', 'value': 18, 'st': 'good'}, {'name': 'At risk', 'value': 4, 'st': 'warn'}, {'name': 'Off track', 'value': 2, 'st': 'crit'}]}, h=340, span='s-4'),
        cc('Burn-down: WMS upgrade', 'Remaining story points vs ideal', {'type': 'line', 'categories': [f'S{i}' for i in range(1, 13)], 'series': [S('Remaining', [420, 398, 371, 352, 330, 318, 290, 262, 244, 230, 205, 188], symbols=True), S('Ideal', [420 - i * 35 for i in range(12)], dashed=True, c=8)], 'forecastFrom': 9, 'xName': 'Sprint'}, h=280, span='s-6'),
        cc('Effort by phase', 'Logged hours per month', {'type': 'column', 'categories': M12[-6:], 'stack': 'normal', 'series': [S('Design', [820, 760, 640, 520, 480, 410]), S('Build', [1240, 1420, 1610, 1720, 1680, 1590]), S('Test', [310, 380, 460, 590, 720, 810]), S('Deploy', [80, 90, 120, 140, 210, 260])]}, h=280, span='s-6'),
        cc('Risk matrix', 'Probability vs impact, open risks', {'type': 'scatter', 'xName': 'Probability (%)', 'yName': 'Impact (₹ L)', 'xUnit': PCT0, 'yUnit': {'pre': '₹', 'suf': ' L'}, 'labels': True, 'quadrant': True,
            'series': [S('Risks', [{'name': n, 'value': [a, b]} for n, a, b in [('Vendor delay', 70, 42), ('Data migration', 55, 88), ('Scope creep', 62, 30), ('Key person', 35, 64), ('Budget cut', 20, 120), ('Integration', 48, 52), ('Change mgmt', 40, 24)]])]}, h=300, span='s-6'),
        cc('Team utilisation', 'Billable hours / available, by team and week', {'type': 'heatmap', 'x': [f'W{w}' for w in range(31, 40)], 'y': ['Platform', 'ERP', 'Analytics', 'Plant eng.', 'PMO'], 'unit': PCT0, 'name': 'Utilisation',
            'data': [[x, y, r.randint(58, 104)] for y in range(5) for x in range(9)]}, h=300, span='s-6'),
        dtable({'caption': 'Projects', 'noun': 'projects', 'pageSize': 8, 'statusMap': {'On track': 'good', 'At risk': 'warn', 'Off track': 'crit'},
                'columns': [{'key': 'n', 'label': 'Project', 'w': 200}, {'key': 'd', 'label': 'Department', 'group': True}, {'key': 'b', 'label': 'Budget', 'type': 'inr', 'agg': 'sum'}, {'key': 'sp', 'label': 'Spent', 'type': 'inr', 'agg': 'sum'},
                            {'key': 'pc', 'label': 'Complete', 'type': 'bar'}, {'key': 's', 'label': 'Status', 'type': 'status', 'group': True}],
                'rows': [{'n': n, 'd': d, 'b': b, 'sp': sp, 'pc': min(100, round(sp / b * 100 + r.randint(-12, 8))), 's': s} for n, d, b, sp, s in proj]}, title='Project list', sub='Budget, progress and status'),
    )
    dash('dashboards/projects.html', 'Projects Dashboard', 'Portfolio health, budget burn, delivery progress, effort, risks and team capacity. <b>Sample data.</b>', body, crumbs=BIZ)

# ================================================================== Supply chain
def supply_chain():
    r = rnd(111)
    body = fbar(('warehouse', 'supplier')) + kpis(
        kpi('OTIF', 92.6, PCT, '0.9 pts', sub='target 95%', icon='vehicle_truck', target=(97, 'On time, in full', 'warn')), kpi('Supplier lead time', 11.2, DAYS, '0.8 d', up=False, sub='median', icon='timeline'),
        kpi('Inventory days', 46, {'suf': ' days'}, '3', up=False, sub='days of supply', icon='box'), kpi('Freight cost / unit', 38.4, {'pre': '₹', 'dp': 1}, '₹2.1', good=False, sub='diesel surcharge', icon='vehicle_ship'),
        kpi('Perfect order rate', 88.1, PCT, '1.4 pts', sub='no damage, no errors', icon='checkmark_circle'), n=5)
    links = [('Tata Steel', 'Pune plant', 42), ('Polycab', 'Pune plant', 28), ('Havells', 'Chennai plant', 24), ('Uflex', 'Chennai plant', 14), ('SKF India', 'Pune plant', 9),
             ('Pune plant', 'Pune WH-1', 38), ('Pune plant', 'Gurugram WH-3', 26), ('Pune plant', 'Ahmedabad WH-5', 15), ('Chennai plant', 'Chennai WH-2', 26), ('Chennai plant', 'Kolkata WH-4', 12),
             ('Pune WH-1', 'Distributors', 20), ('Pune WH-1', 'Direct B2B', 18), ('Gurugram WH-3', 'Distributors', 14), ('Gurugram WH-3', 'E-commerce', 12), ('Ahmedabad WH-5', 'Direct B2B', 15),
             ('Chennai WH-2', 'Distributors', 14), ('Chennai WH-2', 'Modern trade', 12), ('Kolkata WH-4', 'Distributors', 12)]
    body += grid(
        cc('Material flow', 'Suppliers → plants → warehouses → channels, ₹ Cr this quarter', {'type': 'sankey', 'unit': {'pre': '₹', 'suf': ' Cr'}, 'links': [{'source': a, 'target': b, 'value': v / 10} for a, b, v in links]}, h=380, span='s-12'),
        cc('OTIF trend', 'On time in full, % of orders', {'type': 'line', 'categories': M12, 'unit': PCT, 'zero': False, 'target': {'value': 95, 'label': 'Target'}, 'symbols': True, 'series': [S('OTIF', trend(89.2, 92.6, seed=112, dp=1))]}, h=280, span='s-6'),
        cc('Lead time by supplier', 'Days from PO to receipt — box shows middle 50%', {'type': 'boxplot', 'categories': SUPPLIERS, 'unit': {'suf': ' d'}, 'valueName': 'Days',
            'data': [[6, 9, 11, 13, 18], [5, 7, 8, 10, 14], [7, 10, 12, 15, 21], [4, 6, 7, 8, 11], [8, 11, 14, 17, 24], [6, 8, 10, 12, 16]], 'outliers': [[0, 26], [2, 29], [4, 31]]}, h=280, span='s-6'),
        cc('Freight cost by mode', '₹ per month', {'type': 'column', 'categories': M12[-6:], 'stack': 'normal', 'unit': INR, 'series': [S('Road', [41e5, 43e5, 44e5, 46e5, 47e5, 49e5]), S('Rail', [9e5, 9.4e5, 9.8e5, 10e5, 10.6e5, 11e5]), S('Sea', [6e5, 5.2e5, 5.8e5, 6.4e5, 6.1e5, 6.6e5]), S('Air', [1.8e5, 2.4e5, 1.6e5, 2.1e5, 1.9e5, 2.6e5])]}, h=280, span='s-6'),
        cc('Lane transit time', 'Average days, origin × destination', {'type': 'heatmap', 'x': ['Delhi', 'Mumbai', 'Bengaluru', 'Kolkata', 'Hyderabad'], 'y': ['Pune', 'Chennai', 'Gurugram', 'Kolkata', 'Ahmedabad'], 'unit': {'suf': ' d', 'dp': 1}, 'name': 'Transit',
            'data': [[x, y, round(1.2 + abs(x - y) * .9 + r.uniform(0, 1.2), 1)] for y in range(5) for x in range(5)]}, h=280, span='s-6'),
        dtable({'caption': 'Shipments in transit', 'noun': 'shipments', 'pageSize': 8, 'statusMap': {'In transit': 'info', 'Delivered': 'good', 'Delayed': 'warn', 'Exception': 'crit'},
                'columns': [{'key': 'id', 'label': 'Shipment', 'w': 120}, {'key': 'o', 'label': 'Origin', 'group': True}, {'key': 'd', 'label': 'Destination'}, {'key': 'm', 'label': 'Mode', 'group': True}, {'key': 'v', 'label': 'Value', 'type': 'inr', 'agg': 'sum'}, {'key': 'eta', 'label': 'ETA'}, {'key': 's', 'label': 'Status', 'type': 'status', 'group': True}],
                'rows': [{'id': f'SH-{5100 + i * 11}', 'o': WHS[i % 5], 'd': ['Delhi', 'Mumbai', 'Bengaluru', 'Kolkata', 'Hyderabad', 'Lucknow'][i % 6], 'm': ['Road', 'Road', 'Rail', 'Road', 'Air'][i % 5], 'v': r.randint(2, 48) * 1e5, 'eta': f'{r.randint(21, 30)} Oct', 's': ['In transit', 'Delivered', 'Delayed', 'In transit', 'Exception', 'Delivered'][i % 6]} for i in range(24)]},
               title='Shipments', sub='In transit and recently delivered'),
    )
    dash('dashboards/supply-chain.html', 'Supply Chain Dashboard', 'End-to-end flow from suppliers to channels, service levels, lead times and freight. <b>Sample data.</b>', body, crumbs=BIZ)

# ================================================================== Plant operations
def plant():
    r = rnd(121)
    body = fbar(('department', 'status')) + kpis(
        kpi('OEE', 78.4, PCT, '2.2 pts', sub='world class 85%', icon='gauge', target=(92, 'Availability × Performance × Quality', 'ok')), kpi('Output', 142000, {'indian': True}, '6.1%', sub='units this month', icon='building_factory'),
        kpi('Downtime', 46, {'suf': ' h'}, '9 h', up=False, sub='unplanned, this month', icon='clock'), kpi('Scrap rate', 1.8, PCT, '0.2 pts', good=False, sub='target 1.5%', icon='delete', status='warn'),
        kpi('Energy per unit', 2.4, {'suf': ' kWh', 'dp': 1}, '0.1', up=False, sub='vs last month', icon='lightbulb'), n=5)
    body += grid(
        cc('OEE components', 'Pune plant, this month', {'type': 'radial', 'unit': PCT0, 'max': 100, 'items': [{'name': 'Availability', 'value': 88}, {'name': 'Performance', 'value': 91}, {'name': 'Quality', 'value': 98}, {'name': 'OEE', 'value': 78}]}, h=300, span='s-4'),
        cc('Output by line', 'Units produced vs plan, this month', {'type': 'column', 'categories': ['Line 1', 'Line 2', 'Line 3', 'Line 4', 'Line 5'], 'labels': True, 'unit': {'indian': True}, 'target': {'value': 30000, 'label': 'Plan'}, 'series': [S('Output', [33400, 29100, 31800, 24600, 23100], pst=[None, None, None, 'warn', 'warn'])]}, h=300, span='s-8'),
        cc('Downtime Pareto', 'Hours lost by cause (top) and cumulative share (bottom)', {'type': 'combo', 'categories': ['Changeover', 'Breakdown', 'Material wait', 'Quality hold', 'Power', 'Other'], 'unit': {'suf': ' h'}, 'unit2': PCT0, 'panelNames': ['Hours', 'Cumulative %'],
            'series': [S('Hours lost', [16, 12, 8, 5, 3, 2]), S('Cumulative', [35, 61, 78, 89, 96, 100], type='line', panel=1, c=2, symbols=True)]}, h=320, span='s-6'),
        cc('Shift performance', 'OEE % by line and shift', {'type': 'heatmap', 'x': ['Shift A', 'Shift B', 'Shift C'], 'y': ['Line 1', 'Line 2', 'Line 3', 'Line 4', 'Line 5'], 'unit': PCT0, 'name': 'OEE', 'data': [[x, y, r.randint(64, 88) - (6 if x == 2 else 0)] for y in range(5) for x in range(3)]}, h=320, span='s-6'),
        cc('Scrap trend', 'Scrap % of output, 1.5% target', {'type': 'line', 'categories': M12, 'unit': PCT, 'threshold': {'value': 2.0, 'label': 'Limit'}, 'target': {'value': 1.5, 'label': 'Target'}, 'symbols': True, 'series': [S('Scrap', trend(2.3, 1.8, seed=122, dp=1))]}, h=260, span='s-12'),
        dtable({'caption': 'Work orders', 'noun': 'work orders', 'pageSize': 8, 'statusMap': {'Running': 'info', 'Completed': 'good', 'Delayed': 'warn', 'Blocked': 'crit'},
                'columns': [{'key': 'w', 'label': 'Work order', 'w': 120}, {'key': 'p', 'label': 'Product', 'type': 'prod', 'w': 200}, {'key': 'l', 'label': 'Line', 'group': True}, {'key': 'q', 'label': 'Qty', 'type': 'num', 'agg': 'sum'}, {'key': 'd', 'label': 'Done', 'type': 'bar'}, {'key': 's', 'label': 'Status', 'type': 'status', 'group': True}],
                'rows': [{'w': f'WO-{3300 + i * 5}', 'p': PRODUCTS[i % 10], 'l': f'Line {i % 5 + 1}', 'q': r.randint(5, 60) * 100, 'd': r.randint(10, 100), 's': ['Running', 'Completed', 'Delayed', 'Running', 'Blocked'][i % 5]} for i in range(20)]}, title='Work orders', sub='Shop-floor progress'),
    )
    dash('dashboards/plant-operations.html', 'Plant Operations Dashboard', 'Manufacturing performance: OEE, output against plan, downtime causes, shift performance and scrap. <b>Sample data.</b>', body, crumbs=BIZ)

def build():
    executive(); operations(); management(); kpi_dash(); custom()
    inventory(); sales(); procurement(); finance(); customers(); hr(); projects(); supply_chain(); plant()
