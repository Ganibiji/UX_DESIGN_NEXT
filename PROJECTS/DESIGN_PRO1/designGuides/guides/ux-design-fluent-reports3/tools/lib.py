"""Shared generator pieces: icon sprite, navigation, page shell and components.

Pages are plain static HTML. Charts are emitted as <div class="chart"> blocks
holding a neutral JSON spec; assets/js/charts.js draws them with the engine the
viewer picks in the header.
"""
import html, json, os, re, random, math

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
esc = lambda s: html.escape(str(s), quote=True)

# ------------------------------------------------------------------ icons
def _sprite():
    d = os.path.join(ROOT, 'assets', 'icons', 'fluent')
    out = []
    for f in sorted(os.listdir(d)):
        if not f.endswith('.svg'):
            continue
        svg = open(os.path.join(d, f), encoding='utf-8').read()
        inner = re.sub(r'^<svg[^>]*>|</svg>\s*$', '', svg.strip())
        out.append(f'<symbol id="i-{f[:-4]}" viewBox="0 0 20 20">{inner}</symbol>')
    return '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>' + ''.join(out) + '</defs></svg>'
SPRITE = _sprite()
ICONS = set(re.findall(r'id="i-([\w]+)"', SPRITE))
USED = set()

def ic(n, cls=''):
    USED.add(n)
    return f'<svg class="ic {cls}" aria-hidden="true"><use href="#i-{n}"/></svg>'

def J(o):
    return json.dumps(o, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')

# ------------------------------------------------------------------ numbers (mirrors RA.fmt for first paint)
def _trim(x, dp):
    s = f'{x:,.{dp}f}'
    if '.' in s:
        s = s.rstrip('0').rstrip('.')
    return s

def indian(n):
    s = str(int(round(abs(n))))
    if len(s) <= 3:
        return s
    head, tail = s[:-3], s[-3:]
    parts = []
    while len(head) > 2:
        parts.insert(0, head[-2:]); head = head[:-2]
    if head:
        parts.insert(0, head)
    return ','.join(parts) + ',' + tail

def fmt(v, u=None):
    u = u or {}
    if v is None:
        return '—'
    neg = '−' if v < 0 else ''
    a = abs(v)
    if u.get('cur') == 'inr':
        if a >= 1e7: return f"{neg}₹{_trim(a/1e7, u.get('dp', 2))} Cr"
        if a >= 1e5: return f"{neg}₹{_trim(a/1e5, u.get('dp', 1))} L"
        if a >= 1e3: return f"{neg}₹{_trim(a/1e3, 1)}K"
        return f'{neg}₹{_trim(a, 0)}'
    dp = u.get('dp', 1 if (a < 10 and a % 1) else 0)
    if u.get('indian') and a >= 1e7: s = _trim(a/1e7, 1) + ' Cr'
    elif u.get('indian') and a >= 1e5: s = _trim(a/1e5, 1) + ' L'
    elif not u.get('raw') and a >= 1e6: s = _trim(a/1e6, 1) + 'M'
    elif not u.get('raw') and a >= 1e4: s = _trim(a/1e3, 1) + 'K'
    else: s = indian(a) if a >= 1000 and dp == 0 else _trim(a, dp)
    return f"{neg}{u.get('pre','')}{s}{u.get('suf','')}"

INR = {'cur': 'inr'}
PCT = {'suf': '%', 'dp': 1}
PCT0 = {'suf': '%', 'dp': 0}
CNT = {}
DAYS = {'suf': ' d', 'dp': 1}

# ------------------------------------------------------------------ sample data helpers
M12 = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
ML12 = [f'{m} {2025 if i < 3 else 2026}' for i, m in enumerate(M12)]
REGIONS = ['North', 'South', 'West', 'East', 'Central']
CATS = ['Electrical', 'Hardware', 'Packaging', 'Raw material', 'Spares', 'Consumables']
WHS = ['Pune WH-1', 'Chennai WH-2', 'Gurugram WH-3', 'Kolkata WH-4', 'Ahmedabad WH-5']
SUPPLIERS = ['Tata Steel', 'Havells', 'Polycab', 'SKF India', 'Uflex', 'Finolex']
DEPTS = ['Sales', 'Operations', 'Finance', 'Procurement', 'HR', 'IT']
DIMS = {
    'region': REGIONS, 'department': DEPTS, 'warehouse': WHS, 'category': CATS,
    'product': ['Copper wire 2.5mm', 'MCB 32A', 'Steel bracket', 'Corrugated box L', 'Bearing 6204', 'Cable tie 300mm'],
    'customer': ['Apex Retail', 'Bharat Infra', 'Coastal Traders', 'Deccan Motors', 'Everest Pharma'],
    'supplier': SUPPLIERS[:5], 'status': ['Open', 'In progress', 'On hold', 'Completed', 'Cancelled'],
}

def rnd(seed):
    return random.Random(seed)

def trend(start, end, n=12, noise=.04, seed=1, season=None, dp=0):
    r = rnd(seed)
    out = []
    for i in range(n):
        b = start + (end - start) * i / max(1, n - 1)
        if season:
            b *= 1 + season[i % len(season)]
        b *= 1 + r.uniform(-noise, noise)
        out.append(round(b, dp) if dp else int(round(b)))
    return out

SEASON = [.02, .05, .09, -.06, -.04, .03, 0, -.02, -.03, .01, .03, .06]  # Oct → Sep (festive Q3)

# ------------------------------------------------------------------ navigation
P = lambda path, label, icon, badge=None: {'href': path, 'label': label, 'icon': icon, 'badge': badge}
NAV = [
    ('Dashboard', 'board', 'dash', None, [
        P('dashboards/executive.html', 'Executive Dashboard', 'data_trending'),
        P('dashboards/operations.html', 'Operations Dashboard', 'pulse'),
        P('dashboards/management.html', 'Management Dashboard', 'people_team'),
        P('dashboards/kpi.html', 'KPI Dashboard', 'target'),
        P('dashboards/custom.html', 'Custom Dashboard', 'layout_cell_four'),
    ]),
    ('Business Dashboards', 'apps', 'biz', None, [
        P('dashboards/inventory.html', 'Inventory', 'box', ('14', 'warn')),
        P('dashboards/sales.html', 'Sales', 'cart'),
        P('dashboards/procurement.html', 'Procurement', 'clipboard_task', ('6', 'brand')),
        P('dashboards/finance.html', 'Finance', 'money'),
        P('dashboards/customers.html', 'Customers', 'people'),
        P('dashboards/hr.html', 'HR', 'people_community'),
        P('dashboards/projects.html', 'Projects', 'briefcase'),
        P('dashboards/supply-chain.html', 'Supply Chain', 'vehicle_truck'),
        P('dashboards/plant-operations.html', 'Operations', 'building_factory'),
    ]),
    ('Reports', 'data_pie', 'rep', ('19', 'subtle'), [
        P('reports/pie.html', 'Pie Charts', 'data_pie'), P('reports/bar.html', 'Bar Charts', 'data_bar_horizontal'),
        P('reports/line.html', 'Line Charts', 'data_line'), P('reports/area.html', 'Area Charts', 'data_area'),
        P('reports/column.html', 'Column Charts', 'data_bar_vertical'), P('reports/combo.html', 'Combo Charts', 'chart_multiple'),
        P('reports/scatter.html', 'Scatter Charts', 'data_scatter'), P('reports/bubble.html', 'Bubble Charts', 'data_scatter'),
        P('reports/radar.html', 'Radar Charts', 'target'), P('reports/funnel.html', 'Funnel Charts', 'data_funnel'),
        P('reports/gauge.html', 'Gauge Charts', 'gauge'), P('reports/heatmap.html', 'Heatmaps', 'grid'),
        P('reports/treemap.html', 'Treemaps', 'data_treemap'), P('reports/waterfall.html', 'Waterfall Charts', 'data_waterfall'),
        P('reports/sankey.html', 'Sankey Charts', 'flowchart'), P('reports/boxplot.html', 'Box Plots', 'data_whisker'),
        P('reports/histogram.html', 'Histograms', 'data_histogram'), P('reports/candlestick.html', 'Candlestick Charts', 'data_trending'),
        P('reports/mixed.html', 'Mixed Charts', 'data_sunburst'),
    ]),
    ('Report Layouts', 'layout_column_two', 'lay', None, [
        P('layouts/single.html', 'Single Chart', 'rectangle_landscape'), P('layouts/two-column.html', 'Two Column', 'layout_column_two'),
        P('layouts/three-column.html', 'Three Column', 'layout_column_three'), P('layouts/grid.html', 'Grid', 'layout_cell_four'),
        P('layouts/kpi-chart.html', 'KPI + Chart', 'data_trending'), P('layouts/chart-table.html', 'Chart + Table', 'document_table'),
        P('layouts/dashboard-grid.html', 'Dashboard Grid', 'board'), P('layouts/executive-summary.html', 'Executive Summary', 'text_bullet_list_square'),
        P('layouts/index.html', 'All 15 combinations', 'apps'),
    ]),
    ('Report Builder', 'design_ideas', 'rb', ('New', 'brand'), [
        P('report-builder/index.html#create', 'Create Report', 'document_add'), P('report-builder/index.html#edit', 'Edit Report', 'edit'),
        P('report-builder/index.html#filters', 'Filters', 'filter'), P('report-builder/index.html#data-source', 'Data Source', 'database'),
        P('report-builder/index.html#visualization', 'Visualization', 'data_pie'), P('report-builder/index.html#grouping', 'Grouping', 'group'),
        P('report-builder/index.html#sorting', 'Sorting', 'arrow_sort'), P('report-builder/index.html#calculations', 'Calculations', 'calculator'),
        P('report-builder/index.html#export', 'Export', 'arrow_download'),
    ]),
    ('Chart Library', 'chart_multiple', 'lib', None, [
        P('libraries/index.html', 'Compare libraries', 'arrow_swap'), P('libraries/echarts.html', 'ECharts', 'data_usage'),
        P('libraries/highcharts.html', 'Highcharts', 'data_usage'), P('libraries/chartjs.html', 'Chart.js', 'data_usage'),
    ]),
    ('Design System', 'color', 'ds', None, [
        P('design-system/index.html#colors', 'Colors', 'color'), P('design-system/index.html#typography', 'Typography', 'text_font'),
        {'label': 'Components', 'icon': 'apps', 'key': 'dsc', 'children': [
            P('design-system/index.html#buttons', 'Buttons', 'rectangle_landscape'), P('design-system/index.html#inputs', 'Inputs', 'text_t'),
            P('design-system/index.html#dropdowns', 'Dropdowns', 'chevron_down'), P('design-system/index.html#tabs', 'Tabs', 'layout_row_two'),
            P('design-system/index.html#breadcrumbs', 'Breadcrumbs', 'chevron_right'), P('design-system/index.html#badges', 'Badges', 'star'),
            P('design-system/index.html#modals', 'Modals', 'open'), P('design-system/index.html#drawers', 'Drawers', 'panel_right'),
        ]},
        P('design-system/cards.html', 'Cards', 'rectangle_landscape'), P('design-system/kpi-cards.html', 'KPI Cards', 'data_trending'),
        P('design-system/filters.html', 'Filters', 'filter'), P('design-system/tables.html', 'Tables', 'table'),
        P('design-system/legends.html#legends', 'Legends', 'text_bullet_list'), P('design-system/legends.html#tooltips', 'Tooltips', 'tooltip_quote'),
        P('design-system/states.html', 'Empty States', 'square_hint' if 'square_hint' in ICONS else 'info'),
    ]),
]

def _badge(b):
    if not b:
        return ''
    t, k = b
    cls = {'warn': 'badge badge--warn', 'brand': 'badge', 'subtle': 'badge badge--subtle'}[k]
    return f'<span class="{cls}" aria-label="{esc(t)} {"new" if t == "New" else "items"}">{esc(t)}</span>'

def nav_html(rp):
    def item(p):
        return f'<li><a class="sb-i" href="{rp}{p["href"]}" title="{esc(p["label"])}">{ic(p["icon"])}<span>{esc(p["label"])}</span>{_badge(p.get("badge"))}</a></li>'
    def group(label, icon, key, badge, kids):
        inner = ''.join(group(k['label'], k['icon'], k['key'], None, k['children']) if 'children' in k else item(k) for k in kids)
        return (f'<li><button type="button" class="sb-i" data-sb-group="{key}" aria-expanded="true" title="{esc(label)}">{ic(icon)}<span>{esc(label)}</span>{_badge(badge)}'
                f'<svg class="sb-i__chev" aria-hidden="true"><use href="#i-chevron_down"/></svg></button><ul>{inner}</ul></li>')
    USED.add('chevron_down')
    body = ''.join(group(*g) for g in NAV)
    return (f'<nav class="sb" id="sb" aria-label="Reports and analytics">'
            f'<div class="sb__search"><label class="input">{ic("search")}<input type="search" placeholder="Filter navigation" aria-label="Filter navigation"></label></div>'
            f'<div class="sb__scroll"><div class="sb__h">REPORTS &amp; ANALYTICS</div><ul><li><a class="sb-i" href="{rp}index.html" title="Overview">{ic("home")}<span>Overview</span></a></li>{body}</ul>'
            f'<p class="sb__empty" hidden>No matching pages.</p></div>'
            f'<div class="sb__foot">{ic("info", "ic--s")}<span>Sample data · Oct 2025 – Sep 2026</span></div></nav><div class="scrim"></div>')

def header_html(rp):
    eng = ''.join(f'<button type="button" data-engine-set="{k}" aria-pressed="false">{n}</button>' for k, n in [('echarts', 'ECharts'), ('highcharts', 'Highcharts'), ('chartjs', 'Chart.js')])
    return f'''<header class="hd">
<button type="button" class="ibtn" data-sb-toggle aria-controls="sb" aria-expanded="true" aria-label="Collapse navigation" data-tip="Navigation  [">{ic("navigation")}</button>
<a class="hd__brand" href="{rp}index.html"><span class="hd__mark">{ic("data_pie")}</span>Reports &amp; Analytics<small>Fluent</small></a>
<div class="hd-search" role="search"><label class="input">{ic("search")}<input type="search" placeholder="Search dashboards, reports and charts" aria-label="Search dashboards, reports and charts" data-hd-search><kbd>/</kbd></label></div>
<div class="hd__end">
<button type="button" class="btn btn--subtle hd-range" data-range-menu aria-haspopup="true" aria-expanded="false" aria-label="Date range">{ic("calendar_ltr")}<span data-range-label>Last 30 days</span>{ic("chevron_down", "ic--s")}</button>
<span class="hd__sep hd-opt" aria-hidden="true"></span>
<div class="seg seg--engine" role="group" aria-label="Chart engine" title="Chart engine — every chart re-renders">{eng}</div>
<label class="engine-sel"><span class="sr">Chart engine</span><select class="select select--s"><option value="echarts">ECharts</option><option value="highcharts">Highcharts</option><option value="chartjs">Chart.js</option></select></label>
<span class="hd__sep hd-opt" aria-hidden="true"></span>
<button type="button" class="ibtn" data-refresh aria-label="Refresh data" data-tip="Refresh">{ic("arrow_clockwise")}</button>
<button type="button" class="ibtn hd-opt" data-notif aria-label="Notifications, 4 new" aria-haspopup="true" aria-expanded="false" data-tip="Notifications">{ic("alert")}<span class="dot-badge" aria-hidden="true">4</span></button>
<button type="button" class="ibtn hd-opt" data-help aria-label="Help" aria-haspopup="true" aria-expanded="false" data-tip="Help">{ic("question_circle")}</button>
<button type="button" class="ibtn" data-theme-menu aria-label="Theme" aria-haspopup="true" aria-expanded="false" data-tip="Theme" data-tip-pos="left">{ic("dark_theme")}</button>
<button type="button" class="ibtn" data-user aria-label="Account: Ananya Mehta" aria-haspopup="true" aria-expanded="false"><span class="avatar" aria-hidden="true">AM</span></button>
</div></header>'''

THEME_BOOT = "<script>try{var t=new URLSearchParams(location.search).get('theme')||localStorage.getItem('ra:theme')||'light';if(t==='system')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t)}catch(e){}</script>"

PAGES = []

def page(path, title, desc, body, crumbs=None, actions=None, scripts=('charts', 'table'), wide=False, raw=False, head_extra=''):
    depth = path.count('/')
    rp = '../' * depth
    crumbs = crumbs or []
    bc = ''
    if crumbs is not None and path != 'index.html':
        items = [f'<li><a href="{rp}index.html">Home</a></li>'] + [f'<li>{ic("chevron_right")}<a href="{rp}{h}">{esc(t)}</a></li>' for t, h in crumbs] + [f'<li>{ic("chevron_right")}<span aria-current="page">{esc(title)}</span></li>']
        bc = f'<nav aria-label="Breadcrumb"><ol class="bc">{"".join(items)}</ol></nav>'
    acts = actions if actions is not None else (
        f'<button type="button" class="btn" data-open-filters>{ic("filter")}Filters</button>'
        f'<button type="button" class="btn" data-toast="Link copied — viewers see your current filters">{ic("share")}Share</button>'
        f'<button type="button" class="btn btn--primary" data-toast="Export started — PDF will download when ready">{ic("arrow_download")}Export</button>')
    ph = '' if raw else f'<header class="ph"><div class="ph__t">{bc}<h1>{esc(title)}</h1><p>{desc}</p></div><div class="ph__a">{acts}</div></header>'
    js = ['core'] + list(scripts)
    tags = ''.join(f'<script src="{rp}assets/js/{s}.js"></script>' for s in js)
    main = body if raw else f'<div class="page">{ph}{body}</div>'
    doc = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{esc(title)} · Reports &amp; Analytics</title>
<meta name="description" content="{esc(re.sub('<[^>]+>', '', desc))}">
{THEME_BOOT}
<link rel="stylesheet" href="{rp}assets/css/tokens.css">
<link rel="stylesheet" href="{rp}assets/css/app.css">{head_extra}
</head>
<body data-root="{rp}">
<script>try{{if(localStorage.getItem('ra:rail')==='1'&&innerWidth>1023)document.body.classList.add('sb-rail')}}catch(e){{}}</script>
{SPRITE}
<a class="skip" href="#main">Skip to content</a>
<div class="app">
{header_html(rp)}
{nav_html(rp)}
<main class="main" id="main" tabindex="-1">{main}</main>
</div>
{tags}
</body>
</html>
'''
    PAGES.append((path, doc))

# ------------------------------------------------------------------ components
_cid = [0]
def cid(p='c'):
    _cid[0] += 1
    return f'{p}{_cid[0]}'

def cc(title, sub, spec, h=280, span='s-6', engine=None, cls='', foot=None, hid=None, theme=None):
    """Chart card: title (opens details), engine badge, full screen, ⋮ menu."""
    spec = dict(spec)
    spec.setdefault('title', title)
    i = hid or cid()
    eng = f' data-engine="{engine}"' if engine else ''
    th = f' data-theme="{theme}"' if theme else ''
    f = f'<footer class="card__f">{foot}</footer>' if foot else ''
    return (f'<article class="card cc {span} {cls}" id="{i}"{th}><span class="bar-load" aria-hidden="true"></span>'
            f'<header class="card__h"><div class="card__t"><h3><button type="button" data-cc-details title="Chart details">{esc(title)}</button></h3><p>{sub}</p></div>'
            f'<div class="card__a"><span class="eng" aria-label="Rendering engine"><i></i>…</span>'
            f'<button type="button" class="ibtn ibtn--s" data-cc-full aria-label="Full screen" data-tip="Full screen">{ic("full_screen_maximize")}</button>'
            f'<button type="button" class="ibtn ibtn--s" data-cc-more aria-label="More actions: {esc(title)}" aria-haspopup="true" aria-expanded="false" data-tip="More" data-tip-pos="left">{ic("more_vertical")}</button></div></header>'
            f'<div class="card__b"><div class="chart" style="height:{h}px"{eng}><script type="application/json">{J(spec)}</script></div><p class="cc__sel" aria-live="polite"></p></div>{f}</article>')

def card(title, body, sub='', span='s-6', actions='', cls='', flush=False, foot=None):
    s = f'<p>{sub}</p>' if sub else ''
    f = f'<footer class="card__f">{foot}</footer>' if foot else ''
    return (f'<section class="card {span} {cls}"><header class="card__h"><div class="card__t"><h3>{esc(title)}</h3>{s}</div><div class="card__a">{actions}</div></header>'
            f'<div class="card__b{" card__b--flush" if flush else ""}">{body}</div>{f}</section>')

def grid(*items, cls=''):
    return f'<div class="g {cls}">' + ''.join(items) + '</div>'

def sec(title, desc='', body='', badge=None, sid=None):
    b = f'<span class="badge badge--tint">{esc(badge)}</span>' if badge else ''
    i = f' id="{sid}"' if sid else ''
    d = f'<p>{desc}</p>' if desc else ''
    return f'<section class="sec"{i}><div class="sec__h"><h2>{esc(title)}</h2>{b}{d}</div>{body}</section>'

def delta(txt, good=True, up=True):
    return f'<span class="dl {"dl--up" if good else "dl--down"}">{ic("arrow_up" if up else "arrow_down")}{esc(txt)}</span>'

def kv(v, u):
    return f'<span data-kpi="{v}" data-u=\'{J(u)}\'>{esc(fmt(v, u))}</span>'

def kpi(label, v, u, d=None, good=True, up=True, sub='vs last month', icon=None, spark=None, spark_kind=None, target=None, status=None, action=None, cmp=None, extra='', cls=''):
    """One KPI card; optional icon, delta, sparkline, target meter, comparison, status, action."""
    if not u:
        u = {'raw': True}  # plain counts show in full (18,420), never abbreviated
    head = f'<div class="kpi__l">{ic(icon) if icon and not cls.count("kpi--ico") else ""}<span>{esc(label)}</span>{action or ""}</div>'
    meta = (delta(d, good, up) if d else '') + (f'<span>{esc(sub)}</span>' if sub else '')
    sp = f'<div class="spark" data-v="{",".join(str(x) for x in spark)}"{" data-kind=\"bars\"" if spark_kind == "bars" else ""}{" data-area=\"1\"" if spark_kind == "area" else ""} aria-hidden="true"></div>' if spark else ''
    tg = ''
    if target:
        pct, tlabel, kind = target
        tg = f'<div class="meter meter--{kind}" role="meter" aria-valuenow="{pct}" aria-valuemin="0" aria-valuemax="100" aria-label="{esc(label)} vs target"><i style="width:{min(100, pct)}%"></i></div><div class="kpi__m"><span>{esc(tlabel)}</span></div>'
    cm = ''
    if cmp:
        cm = '<div class="kpi__cmp">' + ''.join(f'<div><span>{esc(a)}</span><b>{esc(b)}</b></div>' for a, b in cmp) + '</div>'
    st_cls = f' kpi--status is-{status}' if status else ''
    stl = ''
    if status:
        stl = {'good': f'<span class="st st--good">{ic("checkmark_circle")}On track</span>', 'warn': f'<span class="st st--warn">{ic("warning")}At risk</span>', 'crit': f'<span class="st st--crit">{ic("error_circle")}Off track</span>'}[status]
    if 'kpi--ico' in cls:
        return (f'<section class="card kpi kpi--ico {cls}{st_cls}"><span class="kpi__ico">{ic(icon)}</span><div>{head}<div class="kpi__v">{kv(v, u)}</div>'
                f'<div class="kpi__m">{meta}</div>{tg}{sp}{cm}{extra}</div></section>')
    return (f'<section class="card kpi {cls}{st_cls}">{head}<div class="kpi__v">{kv(v, u)}</div>'
            f'<div class="kpi__m">{meta}{stl}</div>{tg}{sp}{cm}{extra}</section>')

def kpis(*cards, n=4):
    c = {3: ' kpis--3', 5: ' kpis--5', 6: ' kpis--6'}.get(n, '')
    return f'<div class="kpis{c}">' + ''.join(cards) + '</div>'

def fbar(dims=('region', 'category'), label='Filters'):
    sel = ''.join(f'<label><span class="sr">{d.title()}</span><select class="select" data-filter="{d}" aria-label="{d.title()}"><option value="All">All {d}s</option>{"".join(f"<option>{esc(v)}</option>" for v in DIMS[d])}</select></label>' for d in dims)
    sel = sel.replace('All categorys', 'All categories').replace('All statuss', 'All statuses')
    return (f'<div class="fbar" role="region" aria-label="Report filters"><span class="fbar__l">{ic("filter", "ic--s")}{label}</span>'
            f'<button type="button" class="btn btn--s" data-range-menu aria-haspopup="true" aria-expanded="false">{ic("calendar_ltr")}<span data-range-label>Last 30 days</span>{ic("chevron_down")}</button>{sel}'
            f'<div class="fbar__chips" data-chips></div><div class="fbar__end"><button type="button" class="btn btn--s btn--subtle" data-open-filters>{ic("filter")}More filters</button><button type="button" class="btn btn--s btn--subtle" data-chip-clear>{ic("arrow_reset")}Reset</button></div></div>')

def flow(*steps):
    arrow = ic('chevron_right')
    return f'<div class="flow" aria-label="How this dashboard reads">{ic("info")}<span>Reading order:</span>' + arrow.join(f'<b>{esc(s)}</b>' for s in steps) + '</div>'

def note(html_):
    return f'<div class="note">{ic("info")}<span>{html_}</span></div>'

def dtable(cfg, span='s-12', title=None, sub='', h=None):
    st = f' style="--dt-h:{h}px"' if h else ''
    t = f'<div class="dt" data-dt{st}><script type="application/json">{J(cfg)}</script></div>'
    if title is None:
        return t
    return f'<section class="card {span}"><header class="card__h"><div class="card__t"><h3>{esc(title)}</h3><p>{sub}</p></div></header><div class="card__b card__b--flush">{t}</div></section>'

def lst(rows):
    """rows: (title, sub, value, small, avatar?)"""
    out = []
    for r in rows:
        t, s, v, sm = r[:4]
        av = f'<span class="avatar" data-c="{r[4][1]}" aria-hidden="true">{esc(r[4][0])}</span>' if len(r) > 4 and r[4] else ''
        out.append(f'<li>{av}<div class="lst__m"><b>{esc(t)}</b><span>{esc(s)}</span></div><div class="lst__v">{v}<small>{sm}</small></div></li>')
    return '<ul class="lst">' + ''.join(out) + '</ul>'

def activity(rows):
    return '<ul class="act">' + ''.join(f'<li><span class="ico">{ic(i)}</span><div><b>{esc(t)}</b><p>{esc(s)}</p></div><time>{esc(w)}</time></li>' for i, t, s, w in rows) + '</ul>'

def wf(cells, cls=''):
    """Layout wireframe: cells = [(kind, w, h)], kind in k c t f x"""
    return f'<div class="wf {cls}" aria-hidden="true">' + ''.join(f'<i class="{k}" style="--w:{w};--h:{h}"></i>' for k, w, h in cells) + '</div>'

def write_all():
    for path, doc in PAGES:
        full = os.path.join(ROOT, path)
        os.makedirs(os.path.dirname(full), exist_ok=True)
        with open(full, 'w', encoding='utf-8', newline='\n') as f:
            f.write(doc)
    missing = sorted(USED - ICONS)
    return len(PAGES), missing
