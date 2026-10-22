/* Ledger — site behaviour
   One file, no dependencies. Every behaviour hangs off a data
   attribute or an ARIA role, so the HTML stays the source of truth.
   Sections:
     1. Site frame (masthead, index, toc, prev/next, theme)
     2. Specimens (show code, copy)
     3. Components (menus, tabs, dialogs, toasts, ...)
     4. Command palette */

(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var icon = function (n, c) { return '<svg class="ic' + (c ? ' ' + c : '') + '" aria-hidden="true"><use href="#i-' + n + '"/></svg>'; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var store = {
    get: function (k) { try { return localStorage.getItem('ledger:' + k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem('ledger:' + k, v); } catch (e) {} }
  };

  var ROOT = document.body.getAttribute('data-root') || '';
  var PAGE = document.body.getAttribute('data-page') || 'index';

  /* The table of contents for the whole site. Order here is reading order. */
  var NAV = [
    { title: 'Start', items: [
      ['index', 'Overview', 'What Ledger is for'],
      ['writing', 'Writing', 'Voice, labels, errors']
    ]},
    { title: 'Foundations', items: [
      ['foundations/colour', 'Colour', 'White, mint, one green'],
      ['foundations/type', 'Type', 'Newsreader + Inter'],
      ['foundations/space', 'Space & layout', '4px base, 12 columns'],
      ['foundations/depth-motion', 'Depth & motion', 'Two shadows, three speeds'],
      ['foundations/icons', 'Icons', '93 drawn on a 24 grid'],
      ['foundations/accessibility', 'Accessibility', 'What we check, every time']
    ]},
    { title: 'Components', items: [
      ['components/actions', 'Buttons & links', 'Primary, quiet, split'],
      ['components/text-inputs', 'Text inputs', 'Fields, search, validation'],
      ['components/selection', 'Selection', 'Checks, radios, switches, selects'],
      ['components/pickers', 'Pickers', 'Date, time, files, colour'],
      ['components/navigation', 'Navigation', 'Tabs, crumbs, steps, tree'],
      ['components/overlays', 'Menus & overlays', 'Menu, popover, dialog, drawer'],
      ['components/feedback', 'Feedback', 'Callouts, toasts, progress'],
      ['components/data-display', 'Data display', 'Badges, avatars, cards, lists'],
      ['components/tables', 'Tables', 'Sort, select, edit in place'],
      ['components/charts', 'Charts', 'Bars, lines, the honest kind'],
      ['components/editors', 'Editors', 'Rich text, code, markdown']
    ]},
    { title: 'Patterns', items: [
      ['patterns/forms', 'Long forms & wizards', 'Sections, steps, saving'],
      ['patterns/list-detail', 'List & detail', 'Browse, open, act'],
      ['patterns/approvals', 'Approvals', 'Review, decide, record'],
      ['patterns/sign-in', 'Sign-in', 'And what goes wrong']
    ]},
    { title: 'Example apps', items: [
      ['apps/finance', 'Finance', 'Month-end close'],
      ['apps/crm', 'Sales pipeline', 'Deals by stage'],
      ['apps/inventory', 'Inventory', 'Stock across sites'],
      ['apps/people', 'People', 'Directory & time off']
    ]}
  ];
  /* One icon per page, shown beside its name in the index */
  var NAV_ICON = {
    'index': 'home', 'writing': 'pencil',
    'foundations/colour': 'palette', 'foundations/type': 'type', 'foundations/space': 'ruler',
    'foundations/depth-motion': 'layers', 'foundations/icons': 'sparkle', 'foundations/accessibility': 'access',
    'components/actions': 'bolt', 'components/text-inputs': 'pencil', 'components/selection': 'check',
    'components/pickers': 'calendar', 'components/navigation': 'list', 'components/overlays': 'panel',
    'components/feedback': 'message', 'components/data-display': 'grid', 'components/tables': 'table',
    'components/charts': 'chart', 'components/editors': 'code',
    'patterns/forms': 'file', 'patterns/list-detail': 'columns', 'patterns/approvals': 'ok', 'patterns/sign-in': 'lock',
    'apps/finance': 'wallet', 'apps/crm': 'briefcase', 'apps/inventory': 'box', 'apps/people': 'users'
  };
  var FLAT = [];
  NAV.forEach(function (g) { g.items.forEach(function (it) { FLAT.push({ id: it[0], title: it[1], desc: it[2], group: g.title }); }); });
  var href = function (id) { return ROOT + id + '.html'; };

  /* ---------- 1. Frame ---------- */
  var site = $('.site');
  if (site) {
    var mast = document.createElement('header');
    mast.className = 'masthead';
    mast.innerHTML =
      '<button class="btn btn--quiet btn--icon masthead__menu" aria-label="Open index" aria-expanded="false" data-nav-toggle>' + icon('menu') + '</button>' +
      '<a class="wordmark" href="' + href('index') + '">' +
        '<svg class="wordmark__mark" viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="2.5" width="19" height="19" rx="3" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 7v10h8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M11.5 13.5h4.5" stroke="var(--accent)" stroke-width="1.6" stroke-linecap="round"/></svg>' +
        '<span class="wordmark__name">Ledger</span><span class="wordmark__ver">v1.0</span></a>' +
      '<span class="masthead__spacer"></span>' +
      '<button class="masthead__search" data-cmdk-open aria-label="Search the system">' + icon('search', 'ic--sm') + '<span>Search components…</span><span class="kbd">Ctrl K</span></button>' +
      '<div class="masthead__links">' +
        '<a class="btn btn--quiet btn--sm hide-sm" href="' + href('foundations/colour') + '">Foundations</a>' +
        '<a class="btn btn--quiet btn--sm hide-sm" href="' + href('components/actions') + '">Components</a>' +
        '<button class="btn btn--quiet btn--icon" data-theme-toggle aria-label="Theme"></button>' +
        '<span class="avatar masthead__me" data-c="1" title="Signed in as Maya Brooks">MB</span>' +
      '</div>';

    var nav = document.createElement('nav');
    nav.className = 'index';
    nav.setAttribute('aria-label', 'Site');
    nav.innerHTML = NAV.map(function (g) {
      return '<div class="index__group"><div class="index__title">' + g.title + '</div><ul>' +
        g.items.map(function (it) {
          var cur = it[0] === PAGE ? ' aria-current="page"' : '';
          return '<li><a href="' + href(it[0]) + '"' + cur + '>' + icon(NAV_ICON[it[0]] || 'circle') + '<span>' + it[1] + '</span></a></li>';
        }).join('') + '</ul></div>';
    }).join('');

    site.insertBefore(nav, site.firstChild);
    site.insertBefore(mast, site.firstChild);

    /* The page title sits in a full-width pastel band above the content and its contents list */
    var band = $('.page .doc-head'), pg = $('.page');
    if (band && pg) pg.insertBefore(band, pg.firstChild);

    $('[data-nav-toggle]').addEventListener('click', function () {
      var open = site.classList.toggle('is-nav-open');
      this.setAttribute('aria-expanded', open);
    });
    site.addEventListener('click', function (e) {
      if (site.classList.contains('is-nav-open') && !e.target.closest('.index') && !e.target.closest('[data-nav-toggle]')) {
        site.classList.remove('is-nav-open');
      }
    });
    var current = $('.index [aria-current]');
    /* Scroll only the index itself; scrollIntoView would also move the page */
    if (current) nav.scrollTop = current.offsetTop - nav.clientHeight / 2;
  }

  /* Theme: system → light → dark. Stored per browser. */
  var THEMES = ['system', 'light', 'dark'];
  function applyTheme(t) {
    if (t === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', t);
    $$('[data-theme-toggle]').forEach(function (b) {
      b.innerHTML = icon(t === 'dark' ? 'moon' : t === 'light' ? 'sun' : 'monitor');
      b.setAttribute('aria-label', 'Theme: ' + t + '. Change theme');
      b.title = 'Theme: ' + t;
    });
  }
  var theme = store.get('theme') || 'system';
  applyTheme(theme);
  document.addEventListener('click', function (e) {
    if (!e.target.closest('[data-theme-toggle]')) return;
    theme = THEMES[(THEMES.indexOf(theme) + 1) % 3];
    store.set('theme', theme);
    applyTheme(theme);
  });

  /* On-this-page list, built from numbered sections */
  var main = $('.page__main');
  var secs = $$('.sec[id]');
  if (main && secs.length > 2 && !$('.page--wide')) {
    var toc = document.createElement('aside');
    toc.className = 'toc';
    toc.innerHTML = '<div class="toc__title">On this page</div><ol>' + secs.map(function (s) {
      var t = $('.sec__title', s);
      return '<li><a href="#' + s.id + '">' + (t ? t.textContent : s.id) + '</a></li>';
    }).join('') + '</ol>';
    main.parentNode.appendChild(toc);
    if ('IntersectionObserver' in window) {
      var links = $$('a', toc);
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          links.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id); });
        });
      }, { rootMargin: '-15% 0px -70% 0px' });
      secs.forEach(function (s) { io.observe(s); });
    }
  }

  /* Number sections 01, 02… so authors don't have to */
  secs.forEach(function (s, i) {
    var n = $('.sec__n', s);
    if (n && !n.textContent.trim()) n.textContent = String(i + 1).padStart(2, '0');
  });

  /* Previous / next */
  if (main && !document.body.hasAttribute('data-no-pn')) {
    var idx = FLAT.findIndex(function (p) { return p.id === PAGE; });
    if (idx > -1) {
      var prev = FLAT[idx - 1], next = FLAT[idx + 1];
      var pn = document.createElement('nav');
      pn.className = 'pn';
      pn.setAttribute('aria-label', 'Previous and next');
      pn.innerHTML =
        (prev ? '<a href="' + href(prev.id) + '"><span>← Previous</span><b>' + prev.title + '</b></a>' : '') +
        (next ? '<a href="' + href(next.id) + '"><span>Next →</span><b>' + next.title + '</b></a>' : '');
      main.appendChild(pn);
    }
    var foot = document.createElement('footer');
    foot.className = 'site-foot';
    foot.innerHTML = '<span>Ledger design system · v1.0 · Hand-drawn, plain HTML and CSS</span><span>Last reviewed October 2026</span>';
    main.appendChild(foot);
  }

  /* ---------- 2. Specimens ---------- */
  function dedent(html) {
    var lines = html.replace(/^\n+|\s+$/g, '').split('\n');
    var min = Infinity;
    lines.forEach(function (l) { if (l.trim()) min = Math.min(min, l.match(/^ */)[0].length); });
    return lines.map(function (l) { return l.slice(min === Infinity ? 0 : min); }).join('\n');
  }
  function highlight(src) {
    return esc(src)
      .replace(/(&lt;\/?)([a-z0-9-]+)/g, '$1<span class="t">$2</span>')
      .replace(/([a-z-]+)=(&quot;.*?&quot;)/g, '<span class="k">$1</span>=<span class="s">$2</span>');
  }
  $$('.specimen').forEach(function (sp) {
    if (sp.hasAttribute('data-nocode')) return;
    var stage = $('.specimen__stage', sp);
    if (!stage) return;
    var src = dedent(stage.innerHTML.replace(/<svg class="ic([^"]*)" aria-hidden="true"><use href="#i-([a-z-]+)"><\/use><\/svg>/g, '<svg class="ic$1" aria-hidden="true"><use href="#i-$2"/></svg>'));
    var bar = document.createElement('div');
    bar.className = 'specimen__bar';
    bar.innerHTML = '<span>' + esc(sp.getAttribute('data-label') || '') + '</span><span class="spacer"></span>' +
      '<button class="btn btn--quiet btn--sm" aria-expanded="false">' + icon('code', 'ic--sm') + 'Code</button>';
    var codeBox = document.createElement('div');
    codeBox.className = 'specimen__code code-copy';
    codeBox.hidden = true;
    codeBox.innerHTML = '<div class="code"><pre>' + highlight(src) + '</pre></div><button class="btn btn--sm" data-copy>Copy</button>';
    sp.appendChild(bar);
    sp.appendChild(codeBox);
    $('button', bar).addEventListener('click', function () {
      codeBox.hidden = !codeBox.hidden;
      this.setAttribute('aria-expanded', !codeBox.hidden);
    });
    $('[data-copy]', codeBox).addEventListener('click', function () {
      var b = this;
      copy(src, function () { b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy'; }, 1400); });
    });
  });
  function copy(text, done) {
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done);
    else done();
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-copy-text]');
    if (!b) return;
    copy(b.getAttribute('data-copy-text'), function () { toast({ text: b.getAttribute('data-copy-label') || 'Copied to clipboard' }); });
  });

  /* ---------- 3. Components ---------- */

  /* Popups: any [data-pop] button toggles the element named in aria-controls */
  var openPop = null;
  function closePop(focusBack) {
    if (!openPop) return;
    openPop.pop.hidden = true;
    openPop.btn.setAttribute('aria-expanded', 'false');
    if (focusBack) openPop.btn.focus();
    openPop = null;
  }
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-pop]');
    if (btn) {
      var pop = document.getElementById(btn.getAttribute('aria-controls'));
      var wasOpen = openPop && openPop.pop === pop;
      closePop();
      if (!wasOpen && pop) {
        pop.hidden = false;
        btn.setAttribute('aria-expanded', 'true');
        openPop = { btn: btn, pop: pop };
        var first = $('[role="menuitem"], [role="menuitemcheckbox"], [role="option"], input, button:not([data-pop])', pop);
        if (first && btn.getAttribute('data-pop') !== 'nofocus') first.focus();
      }
      return;
    }
    /* A click that re-rendered its own target (the calendar) is still inside */
    if (openPop && document.contains(e.target) && !e.target.closest('.pop')) closePop();
    var item = e.target.closest('.pop [role="menuitem"]');
    if (item && openPop) {
      var label = item.getAttribute('data-say') || item.textContent.trim();
      closePop(true);
      if (!item.hasAttribute('data-open')) toast({ text: label });
    }
    var opt = e.target.closest('.pop [role="option"]');
    if (opt && openPop && openPop.btn.hasAttribute('data-select')) {
      $$('[role="option"]', opt.parentNode).forEach(function (o) { o.setAttribute('aria-selected', o === opt); });
      var lbl = $('[data-value]', openPop.btn);
      if (lbl) lbl.textContent = opt.getAttribute('data-label') || opt.textContent.trim();
      closePop(true);
    }
    var mc = e.target.closest('.pop [role="menuitemcheckbox"]');
    if (mc) mc.setAttribute('aria-checked', mc.getAttribute('aria-checked') !== 'true');
  });
  document.addEventListener('keydown', function (e) {
    if (!openPop) return;
    var items = $$('[role="menuitem"], [role="menuitemcheckbox"], [role="option"]', openPop.pop).filter(function (i) { return i.getAttribute('aria-disabled') !== 'true'; });
    var at = items.indexOf(document.activeElement);
    if (e.key === 'Escape') { e.preventDefault(); closePop(true); }
    else if (e.key === 'ArrowDown' && items.length) { e.preventDefault(); items[(at + 1) % items.length].focus(); }
    else if (e.key === 'ArrowUp' && items.length) { e.preventDefault(); items[(at - 1 + items.length) % items.length].focus(); }
    else if (e.key === 'Home' && items.length) { e.preventDefault(); items[0].focus(); }
    else if (e.key === 'End' && items.length) { e.preventDefault(); items[items.length - 1].focus(); }
    else if (e.key === 'Tab') closePop();
  });

  /* Context menu: right-click inside [data-context] opens its menu at the pointer */
  $$('[data-context]').forEach(function (area) {
    var pop = document.getElementById(area.getAttribute('data-context'));
    area.addEventListener('contextmenu', function (e) {
      e.preventDefault();
      closePop();
      var r = area.getBoundingClientRect();
      pop.style.left = (e.clientX - r.left) + 'px';
      pop.style.top = (e.clientY - r.top) + 'px';
      pop.hidden = false;
      openPop = { btn: area, pop: pop };
      var f = $('[role="menuitem"]', pop); if (f) f.focus();
    });
  });

  /* Tabs: arrow keys move, selection follows focus */
  $$('[role="tablist"]').forEach(function (list) {
    var tabs = $$('[role="tab"]', list);
    function select(t, focus) {
      tabs.forEach(function (x) {
        var on = x === t;
        x.setAttribute('aria-selected', on);
        x.tabIndex = on ? 0 : -1;
        var p = document.getElementById(x.getAttribute('aria-controls'));
        if (p) p.hidden = !on;
      });
      if (focus) t.focus();
    }
    tabs.forEach(function (t) {
      t.tabIndex = t.getAttribute('aria-selected') === 'true' ? 0 : -1;
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var i = tabs.indexOf(t), n = null;
        if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === 'Home') n = tabs[0];
        if (e.key === 'End') n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n, true); }
      });
    });
  });

  /* Pressed toggles: chips toggle alone; segmented groups pick one */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.chip[aria-pressed], [data-toggle] [aria-pressed], .seg [aria-pressed], .editor__bar [aria-pressed]');
    if (!b) return;
    var group = b.closest('.seg, [data-toggle="single"]');
    if (group) $$('[aria-pressed]', group).forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
    else b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true');
  });

  /* Dialogs */
  document.addEventListener('click', function (e) {
    var o = e.target.closest('[data-open]');
    if (o) {
      var d = document.getElementById(o.getAttribute('data-open'));
      if (d && d.showModal) { closePop(); d.showModal(); var f = $('[autofocus]', d); if (f) f.focus(); }
      return;
    }
    var c = e.target.closest('[data-close]');
    if (c) {
      var dlg = c.closest('dialog');
      if (dlg) dlg.close();
      var say = c.getAttribute('data-close');
      if (say) toast({ text: say, kind: 'pos' });
      return;
    }
    if (e.target.tagName === 'DIALOG' && e.target.open) {
      var r = e.target.getBoundingClientRect();
      var inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (!inside && !e.target.hasAttribute('data-modal-strict')) e.target.close();
    }
  });
  /* Confirm-by-typing: enable the destructive button once the name matches */
  $$('[data-confirm-input]').forEach(function (inp) {
    var btn = document.getElementById(inp.getAttribute('data-confirm-input'));
    var want = inp.getAttribute('data-confirm-value');
    inp.addEventListener('input', function () { btn.disabled = inp.value.trim() !== want; });
  });

  /* Toasts */
  function toast(o) {
    var host = $('.toasts');
    if (!host) { host = document.createElement('div'); host.className = 'toasts'; host.setAttribute('role', 'status'); host.setAttribute('aria-live', 'polite'); document.body.appendChild(host); }
    var t = document.createElement('div');
    t.className = 'toast' + (o.kind ? ' toast--' + o.kind : '');
    var ic = o.kind === 'neg' ? 'error' : o.kind === 'pos' ? 'ok' : 'info';
    t.innerHTML = icon(ic) + '<div class="toast__text">' + (o.title ? '<b>' + esc(o.title) + '</b>' : '') + esc(o.text) + '</div>' +
      (o.action ? '<button class="toast__action">' + esc(o.action) + '</button>' : '') +
      '<button class="toast__x" aria-label="Dismiss">' + icon('x', 'ic--sm') + '</button>';
    host.appendChild(t);
    var kill = function () { t.classList.add('is-leaving'); setTimeout(function () { t.remove(); }, 200); };
    $('.toast__x', t).addEventListener('click', kill);
    if (o.action) $('.toast__action', t).addEventListener('click', function () { kill(); if (o.onAction) o.onAction(); else toast({ text: 'Restored', kind: 'pos' }); });
    var timer = setTimeout(kill, o.action ? 7000 : 4000);
    t.addEventListener('mouseenter', function () { clearTimeout(timer); });
    t.addEventListener('mouseleave', function () { timer = setTimeout(kill, 2500); });
  }
  window.ledgerToast = toast;
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-toast]');
    if (!b) return;
    toast({ text: b.getAttribute('data-toast'), title: b.getAttribute('data-toast-title'), kind: b.getAttribute('data-toast-kind'), action: b.getAttribute('data-toast-action') });
  });

  /* Dismissable things */
  document.addEventListener('click', function (e) {
    var x = e.target.closest('[data-dismiss]');
    if (!x) return;
    var el = x.closest('.callout, .banner, .tag, .file');
    if (el) el.remove();
  });

  /* Loading buttons */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-loading]');
    if (!b || b.classList.contains('is-loading')) return;
    b.classList.add('is-loading');
    b.setAttribute('aria-busy', 'true');
    setTimeout(function () {
      b.classList.remove('is-loading');
      b.removeAttribute('aria-busy');
      toast({ text: b.getAttribute('data-loading') || 'Done', kind: 'pos' });
    }, 1400);
  });

  /* Range fill + live value */
  $$('.range').forEach(function (r) {
    var out = r.id ? $('output[for="' + r.id + '"]') : null;
    function upd() {
      var p = (r.value - r.min) / (r.max - r.min) * 100;
      r.style.setProperty('--p', p + '%');
      if (out) out.textContent = (r.getAttribute('data-prefix') || '') + Number(r.value).toLocaleString() + (r.getAttribute('data-suffix') || '');
    }
    r.addEventListener('input', upd); upd();
  });

  /* Character counters */
  $$('[data-max]').forEach(function (f) {
    var c = document.getElementById(f.getAttribute('aria-describedby').split(' ').filter(function (id) { return /count/.test(id); })[0]);
    var max = +f.getAttribute('data-max');
    function upd() {
      var left = max - f.value.length;
      c.textContent = left >= 0 ? left + ' characters left' : Math.abs(left) + ' over the limit';
      c.classList.toggle('is-over', left < 0);
    }
    f.addEventListener('input', upd); upd();
  });

  /* Clearable inputs */
  document.addEventListener('click', function (e) {
    var x = e.target.closest('.affix__clear');
    if (!x) return;
    var i = $('input', x.parentNode); i.value = ''; i.focus();
    i.dispatchEvent(new Event('input', { bubbles: true }));
  });

  /* Password reveal */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-reveal]');
    if (!b) return;
    var i = document.getElementById(b.getAttribute('data-reveal'));
    var show = i.type === 'password';
    i.type = show ? 'text' : 'password';
    b.setAttribute('aria-pressed', show);
    b.textContent = show ? 'Hide' : 'Show';
  });

  /* Live validation on blur, cleared on input (never nag while typing) */
  $$('[data-validate]').forEach(function (i) {
    var msg = document.getElementById(i.getAttribute('data-validate'));
    function check() {
      var ok = i.checkValidity() && i.value.trim() !== '';
      i.setAttribute('aria-invalid', !ok);
      msg.hidden = ok;
    }
    i.addEventListener('blur', check);
    i.addEventListener('input', function () { if (i.getAttribute('aria-invalid') === 'true') check(); });
  });

  /* Combobox: type to filter a listbox */
  $$('[data-combo]').forEach(function (wrap) {
    var input = $('input', wrap), list = $('[role="listbox"]', wrap), pop = list.closest('.pop');
    var opts = $$('[role="option"]', list), active = -1;
    function visible() { return opts.filter(function (o) { return !o.hidden; }); }
    function setActive(i) {
      var v = visible(); opts.forEach(function (o) { o.classList.remove('is-active'); });
      active = i; if (v[i]) { v[i].classList.add('is-active'); input.setAttribute('aria-activedescendant', v[i].id); v[i].scrollIntoView({ block: 'nearest' }); }
    }
    function filter() {
      var q = input.value.trim().toLowerCase(), n = 0;
      opts.forEach(function (o) { var m = o.textContent.toLowerCase().indexOf(q) > -1; o.hidden = !m; if (m) n++; });
      var empty = $('.combo-empty', list); if (empty) empty.hidden = n > 0;
      pop.hidden = false; input.setAttribute('aria-expanded', 'true'); setActive(n ? 0 : -1);
    }
    function pick(o) { input.value = o.getAttribute('data-label') || o.textContent.trim(); pop.hidden = true; input.setAttribute('aria-expanded', 'false'); }
    input.addEventListener('input', filter);
    input.addEventListener('focus', filter);
    input.addEventListener('keydown', function (e) {
      var v = visible();
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(Math.min(active + 1, v.length - 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(Math.max(active - 1, 0)); }
      else if (e.key === 'Enter' && v[active]) { e.preventDefault(); pick(v[active]); }
      else if (e.key === 'Escape') { pop.hidden = true; input.setAttribute('aria-expanded', 'false'); }
    });
    opts.forEach(function (o) { o.addEventListener('mousedown', function (e) { e.preventDefault(); pick(o); }); });
    input.addEventListener('blur', function () { setTimeout(function () { pop.hidden = true; input.setAttribute('aria-expanded', 'false'); }, 100); });
  });

  /* Multi-select with tags */
  $$('[data-multi]').forEach(function (wrap) {
    var tags = $('.multi__tags', wrap);
    wrap.addEventListener('click', function (e) {
      var o = e.target.closest('[role="option"]');
      if (!o) return;
      e.stopPropagation();
      var on = o.getAttribute('aria-selected') !== 'true';
      o.setAttribute('aria-selected', on);
      var v = o.getAttribute('data-label');
      var existing = $('[data-tag="' + v + '"]', tags);
      if (on && !existing) tags.insertAdjacentHTML('beforeend', '<span class="tag" data-tag="' + v + '">' + v + '<button class="tag__x" aria-label="Remove ' + v + '" data-untag>' + icon('x') + '</button></span>');
      if (!on && existing) existing.remove();
    });
    tags.addEventListener('click', function (e) {
      var x = e.target.closest('[data-untag]');
      if (!x) return;
      var t = x.closest('.tag'), v = t.getAttribute('data-tag');
      var o = $('[role="option"][data-label="' + v + '"]', wrap); if (o) o.setAttribute('aria-selected', 'false');
      t.remove();
    });
  });

  /* Sortable tables */
  $$('table[data-sortable]').forEach(function (table) {
    var body = table.tBodies[0];
    $$('th .sort', table).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var th = btn.closest('th'), col = Array.prototype.indexOf.call(th.parentNode.children, th);
        var dir = th.getAttribute('aria-sort') === 'ascending' ? 'descending' : 'ascending';
        $$('th', table).forEach(function (h) { h.removeAttribute('aria-sort'); });
        th.setAttribute('aria-sort', dir);
        var rows = $$('tr', body);
        var val = function (r) { var c = r.children[col]; var v = c.getAttribute('data-v') || c.textContent.trim(); var n = parseFloat(v.replace(/[^0-9.\-]/g, '')); return isNaN(n) || /[a-z]{2}/i.test(v) && !c.hasAttribute('data-v') ? v.toLowerCase() : n; };
        rows.sort(function (a, b) { var x = val(a), y = val(b); var r = x > y ? 1 : x < y ? -1 : 0; return dir === 'ascending' ? r : -r; });
        rows.forEach(function (r) { body.appendChild(r); });
      });
    });
  });

  /* Row selection with a contextual bar */
  $$('[data-select-all]').forEach(function (all) {
    var table = all.closest('table');
    var bar = document.getElementById(all.getAttribute('data-select-all'));
    var boxes = function () { return $$('tbody .check input', table); };
    function sync() {
      var b = boxes(), n = b.filter(function (x) { return x.checked; }).length;
      all.checked = n === b.length && n > 0; all.indeterminate = n > 0 && n < b.length;
      b.forEach(function (x) { x.closest('tr').setAttribute('aria-selected', x.checked); });
      if (bar) {
        bar.classList.toggle('is-selecting', n > 0);
        var c = $('[data-selected-count]', bar); if (c) c.textContent = n + ' selected';
        $$('[data-when="idle"]', bar).forEach(function (x) { x.hidden = n > 0; });
        $$('[data-when="selecting"]', bar).forEach(function (x) { x.hidden = n === 0; });
      }
    }
    all.addEventListener('change', function () { boxes().forEach(function (x) { x.checked = all.checked; }); sync(); });
    table.addEventListener('change', function (e) { if (e.target !== all && e.target.closest('tbody')) sync(); });
    sync();
  });

  /* Table filter by text */
  $$('[data-filter-table]').forEach(function (inp) {
    var table = document.getElementById(inp.getAttribute('data-filter-table'));
    var count = inp.getAttribute('data-count') ? document.getElementById(inp.getAttribute('data-count')) : null;
    inp.addEventListener('input', function () {
      var q = inp.value.trim().toLowerCase(), n = 0;
      $$('tbody tr', table).forEach(function (r) { var m = r.textContent.toLowerCase().indexOf(q) > -1; r.hidden = !m; if (m) n++; });
      if (count) count.textContent = n;
    });
  });

  /* Editable cells mark themselves dirty */
  document.addEventListener('change', function (e) {
    if (!e.target.classList || !e.target.classList.contains('cell-edit')) return;
    var td = e.target.closest('td');
    td.classList.toggle('cell-dirty', e.target.value !== e.target.defaultValue);
    var host = e.target.closest('[data-dirty-count]');
    if (host) { var n = $$('.cell-dirty', host).length; $(host.getAttribute('data-dirty-count')).textContent = n ? n + ' unsaved change' + (n > 1 ? 's' : '') : 'All changes saved'; }
  });

  /* Tree: click to select, arrows to move, right/left to open/close */
  $$('[role="tree"]').forEach(function (tree) {
    var items = function () { return $$('[role="treeitem"]', tree).filter(function (i) { return !i.closest('[aria-expanded="false"] > ul'); }); };
    function focus(i) { $$('[role="treeitem"]', tree).forEach(function (x) { x.tabIndex = -1; }); i.tabIndex = 0; i.focus(); }
    function select(i) { $$('[role="treeitem"]', tree).forEach(function (x) { x.setAttribute('aria-selected', x === i); }); }
    tree.addEventListener('click', function (e) {
      var row = e.target.closest('.tree__row'); if (!row) return;
      var it = row.parentNode;
      if (it.hasAttribute('aria-expanded') && (e.target.closest('.tree__tw') || it.getAttribute('aria-selected') === 'true')) it.setAttribute('aria-expanded', it.getAttribute('aria-expanded') !== 'true');
      select(it); focus(it);
    });
    tree.addEventListener('keydown', function (e) {
      var it = document.activeElement; if (!it || it.getAttribute('role') !== 'treeitem') return;
      var v = items(), i = v.indexOf(it);
      if (e.key === 'ArrowDown' && v[i + 1]) { e.preventDefault(); focus(v[i + 1]); }
      else if (e.key === 'ArrowUp' && v[i - 1]) { e.preventDefault(); focus(v[i - 1]); }
      else if (e.key === 'ArrowRight' && it.getAttribute('aria-expanded') === 'false') { e.preventDefault(); it.setAttribute('aria-expanded', 'true'); }
      else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (it.getAttribute('aria-expanded') === 'true') it.setAttribute('aria-expanded', 'false');
        else { var p = it.parentNode.closest('[role="treeitem"]'); if (p) focus(p); }
      }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(it); }
    });
    var first = $('[role="treeitem"][aria-selected="true"]', tree) || $('[role="treeitem"]', tree);
    $$('[role="treeitem"]', tree).forEach(function (x) { x.tabIndex = x === first ? 0 : -1; });
  });

  /* Calendar — renders a month into [data-cal]. data-range for two dates. */
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  $$('[data-cal]').forEach(function (host) {
    var today = new Date(2026, 9, 22);
    var view = new Date(today.getFullYear(), today.getMonth(), 1);
    var range = host.hasAttribute('data-range');
    var a = range ? new Date(2026, 9, 12) : new Date(2026, 9, 22), b = range ? new Date(2026, 9, 18) : null;
    var target = host.getAttribute('data-cal') ? document.getElementById(host.getAttribute('data-cal')) : null;
    var fmt = function (d) { return d.getDate() + ' ' + MONTHS[d.getMonth()].slice(0, 3) + ' ' + d.getFullYear(); };
    var same = function (x, y) { return x && y && x.toDateString() === y.toDateString(); };
    function render() {
      var start = new Date(view); start.setDate(1 - ((view.getDay() + 6) % 7));
      var h = '<div class="cal__head"><button class="btn btn--quiet btn--icon btn--sm" data-m="-1" aria-label="Previous month">' + icon('chev-l') + '</button>' +
        '<div class="cal__title" aria-live="polite">' + MONTHS[view.getMonth()] + ' ' + view.getFullYear() + '</div>' +
        '<button class="btn btn--quiet btn--icon btn--sm" data-m="1" aria-label="Next month">' + icon('chev-r') + '</button></div>' +
        '<div class="cal__grid" role="grid">' + ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(function (d) { return '<div class="cal__dow" aria-hidden="true">' + d + '</div>'; }).join('');
      for (var i = 0; i < 42; i++) {
        var d = new Date(start); d.setDate(start.getDate() + i);
        var cls = 'cal__day' + (d.getMonth() !== view.getMonth() ? ' is-out' : '') + (same(d, today) ? ' is-today' : '');
        var sel = same(d, a) || same(d, b);
        if (range && a && b && d > a && d < b) cls += ' in-range';
        var dis = host.hasAttribute('data-no-weekend') && (d.getDay() === 0 || d.getDay() === 6);
        h += '<button class="' + cls + '" data-d="' + d.toISOString() + '" aria-selected="' + sel + '" aria-label="' + fmt(d) + '"' + (dis ? ' disabled' : '') + '>' + d.getDate() + '</button>';
      }
      h += '</div><div class="cal__foot"><button class="btn btn--quiet btn--sm" data-today>Today</button><span class="small faint" style="align-self:center">' + (range ? (a ? fmt(a) : '–') + ' → ' + (b ? fmt(b) : '…') : fmt(a)) + '</span></div>';
      host.innerHTML = h;
    }
    host.addEventListener('click', function (e) {
      var m = e.target.closest('[data-m]');
      if (m) { view.setMonth(view.getMonth() + +m.getAttribute('data-m')); render(); return; }
      if (e.target.closest('[data-today]')) { view = new Date(today.getFullYear(), today.getMonth(), 1); a = today; b = null; render(); return; }
      var day = e.target.closest('[data-d]'); if (!day) return;
      var d = new Date(day.getAttribute('data-d'));
      if (range) { if (!a || b) { a = d; b = null; } else if (d < a) { b = a; a = d; } else b = d; }
      else a = d;
      render();
      if (target) {
        target.value = range ? fmt(a) + (b ? ' – ' + fmt(b) : '') : fmt(a);
        if (!range || b) { var pop = host.closest('.pop'); if (pop && openPop) closePop(true); }
      }
    });
    render();
  });

  /* Upload: drop or pick, show progress, allow removal */
  $$('.drop').forEach(function (zone) {
    var input = $('input[type="file"]', zone), list = document.getElementById(zone.getAttribute('data-list'));
    function add(files) {
      Array.prototype.forEach.call(files, function (f) {
        var ext = (f.name.split('.').pop() || 'file').slice(0, 4).toUpperCase();
        var big = f.size > 10 * 1024 * 1024;
        var li = document.createElement('li');
        li.className = 'file' + (big ? ' is-error' : '');
        li.innerHTML = '<span class="file__type">' + esc(ext) + '</span><span class="file__name">' + esc(f.name) + '</span>' +
          '<button class="btn btn--quiet btn--icon btn--sm" data-dismiss aria-label="Remove ' + esc(f.name) + '">' + icon('x') + '</button>' +
          '<span class="file__meta">' + (big ? icon('alert', 'ic--sm') + 'Over 10 MB. Compress it or split it.' : '<span class="progress progress--thin"><span style="--v:0%"></span></span><span class="num">0%</span>') + '</span>';
        list.appendChild(li);
        if (big) return;
        var p = 0, bar = $('.progress span', li), pct = $('.num', li);
        var t = setInterval(function () {
          p = Math.min(100, p + 8 + Math.random() * 18); bar.style.setProperty('--v', p + '%'); pct.textContent = Math.round(p) + '%';
          if (p >= 100) { clearInterval(t); $('.file__meta', li).innerHTML = (f.size / 1024).toFixed(0) + ' KB · Uploaded'; }
        }, 180);
      });
    }
    zone.addEventListener('click', function (e) { if (e.target !== input) input.click(); });
    zone.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });
    input.addEventListener('change', function () { add(input.files); input.value = ''; });
    ['dragenter', 'dragover'].forEach(function (ev) { zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.add('is-over'); }); });
    ['dragleave', 'drop'].forEach(function (ev) { zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.remove('is-over'); }); });
    zone.addEventListener('drop', function (e) { add(e.dataTransfer.files); });
  });

  /* Swatch picker */
  document.addEventListener('click', function (e) {
    var s = e.target.closest('.swatch');
    if (!s) return;
    $$('.swatch', s.parentNode).forEach(function (x) { x.setAttribute('aria-checked', x === s); });
    var out = s.parentNode.getAttribute('data-out');
    if (out) document.getElementById(out).textContent = s.getAttribute('aria-label');
  });

  /* Kanban drag and drop */
  var dragging = null;
  document.addEventListener('dragstart', function (e) {
    var t = e.target.closest && e.target.closest('.ticket'); if (!t) return;
    dragging = t; t.classList.add('is-dragging'); e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', ''); } catch (er) {}
  });
  document.addEventListener('dragend', function () {
    if (dragging) dragging.classList.remove('is-dragging'); dragging = null;
    $$('.lane.is-over').forEach(function (l) { l.classList.remove('is-over'); });
    $$('.lane').forEach(function (l) {
      var c = $('[data-lane-count]', l); if (c) c.textContent = $$('.ticket', l).length;
      var sum = $('.lane__sum', l);
      if (sum) sum.textContent = '£' + $$('.ticket .num', l).reduce(function (a, n) { return a + (parseFloat(n.textContent.replace(/[^0-9.]/g, '')) || 0); }, 0).toLocaleString('en-GB');
    });
  });
  document.addEventListener('dragover', function (e) {
    var lane = e.target.closest && e.target.closest('.lane'); if (!lane || !dragging) return;
    e.preventDefault();
    $$('.lane.is-over').forEach(function (l) { if (l !== lane) l.classList.remove('is-over'); });
    lane.classList.add('is-over');
    var after = $$('.ticket:not(.is-dragging)', lane).find(function (t) { var r = t.getBoundingClientRect(); return e.clientY < r.top + r.height / 2; });
    if (after) lane.insertBefore(dragging, after); else lane.appendChild(dragging);
  });
  document.addEventListener('drop', function (e) { if (dragging) e.preventDefault(); });

  /* Rich text: execCommand is old but still the simplest honest demo */
  $$('.editor').forEach(function (ed) {
    var area = $('[contenteditable]', ed), wc = $('[data-words]', ed);
    $$('[data-cmd]', ed).forEach(function (b) {
      b.addEventListener('mousedown', function (e) { e.preventDefault(); });
      b.addEventListener('click', function () {
        var c = b.getAttribute('data-cmd'), v = b.getAttribute('data-arg');
        document.execCommand(c, false, v);
        area.focus(); sync();
      });
    });
    function sync() {
      $$('[data-cmd][aria-pressed]', ed).forEach(function (b) { try { b.setAttribute('aria-pressed', document.queryCommandState(b.getAttribute('data-cmd'))); } catch (e) {} });
      if (wc && area) { var n = (area.innerText.trim().match(/\S+/g) || []).length; wc.textContent = n + ' words'; }
    }
    /* Alt+F10 jumps to the toolbar; arrows move along it */
    var bar = $('.editor__bar', ed), tools = $$('button', bar);
    if (area) area.addEventListener('keydown', function (e) { if (e.altKey && e.key === 'F10') { e.preventDefault(); tools[0].focus(); } });
    bar.addEventListener('keydown', function (e) {
      var i = tools.indexOf(document.activeElement);
      if (e.key === 'ArrowRight') { e.preventDefault(); tools[(i + 1) % tools.length].focus(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); tools[(i - 1 + tools.length) % tools.length].focus(); }
      if (e.key === 'Escape') { e.preventDefault(); area.focus(); }
    });
    if (area) { area.addEventListener('keyup', sync); area.addEventListener('mouseup', sync); area.addEventListener('input', sync); sync(); }
  });

  /* Markdown preview: deliberately tiny */
  $$('[data-md]').forEach(function (ta) {
    var out = document.getElementById(ta.getAttribute('data-md'));
    function md(s) {
      return esc(s)
        .replace(/^### (.*)$/gm, '<h4 class="h4">$1</h4>')
        .replace(/^## (.*)$/gm, '<h3 class="h3" style="font-family:var(--font-serif);font-weight:400">$1</h3>')
        .replace(/^&gt; (.*)$/gm, '<blockquote>$1</blockquote>')
        .replace(/^- (.*)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>\n?)+/g, function (m) { return '<ul>' + m + '</ul>'; })
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code class="inline-code">$1</code>')
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a class="link" href="$2">$1</a>')
        .replace(/^(?!<h|<ul|<li|<block|$)(.+)$/gm, '<p>$1</p>');
    }
    function upd() { out.innerHTML = md(ta.value); }
    ta.addEventListener('input', upd); upd();
  });

  /* Wizard: [data-wizard] with .wizard-step panes and a .steps list */
  $$('[data-wizard]').forEach(function (wz) {
    var panes = $$('.wizard-step', wz), steps = $$('.steps li', wz), at = 0;
    var back = $('[data-wz="back"]', wz), next = $('[data-wz="next"]', wz), pos = $('[data-wz-pos]', wz);
    function go(i) {
      at = i;
      panes.forEach(function (p, j) { p.hidden = j !== i; });
      steps.forEach(function (s, j) {
        s.removeAttribute('aria-current'); s.removeAttribute('data-state');
        if (j < i) s.setAttribute('data-state', 'done');
        if (j === i) s.setAttribute('aria-current', 'step');
      });
      $$('[data-echo]', wz).forEach(function (el) {
        var src = document.getElementById(el.getAttribute('data-echo'));
        el.textContent = src && src.value.trim() ? src.value.trim() : '—';
      });
      back.disabled = i === 0;
      next.textContent = i === panes.length - 1 ? 'Submit request' : 'Continue';
      if (pos) pos.textContent = 'Step ' + (i + 1) + ' of ' + panes.length;
      var h = $('h3, .h3', panes[i]); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); }
    }
    back.addEventListener('click', function () { if (at > 0) go(at - 1); });
    next.addEventListener('click', function () {
      var pane = panes[at], bad = $$('[required]', pane).filter(function (f) { return !f.value.trim(); });
      $$('[required]', pane).forEach(function (f) { f.setAttribute('aria-invalid', !f.value.trim()); });
      var summary = $('.wizard-errors', pane);
      if (bad.length) {
        if (summary) { summary.hidden = false; $('[data-n]', summary).textContent = bad.length === 1 ? '1 field needs' : bad.length + ' fields need'; }
        bad[0].focus(); return;
      }
      if (summary) summary.hidden = true;
      if (at < panes.length - 1) go(at + 1);
      else { toast({ title: 'Request submitted', text: 'Finance will review it within two working days.', kind: 'pos' }); go(0); }
    });
    go(0);
  });

  /* Master–detail: clicking a list row shows its record */
  $$('[data-master]').forEach(function (list) {
    var detail = document.getElementById(list.getAttribute('data-master'));
    list.addEventListener('click', function (e) {
      var li = e.target.closest('li[data-rec]'); if (!li) return;
      $$('li', list).forEach(function (x) { x.setAttribute('aria-selected', x === li); x.tabIndex = x === li ? 0 : -1; });
      var rec = JSON.parse(li.getAttribute('data-rec'));
      Object.keys(rec).forEach(function (k) {
        $$('[data-f="' + k + '"]', detail).forEach(function (el) { el.textContent = rec[k]; });
        /* data-tone="key" mirrors a value into data-s so CSS can colour it (e.g. a status pill) */
        $$('[data-tone="' + k + '"]', detail).forEach(function (el) { el.setAttribute('data-s', String(rec[k]).toLowerCase()); });
      });
      detail.classList.add('is-swapping'); setTimeout(function () { detail.classList.remove('is-swapping'); }, 160);
    });
    list.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      var items = $$('li[data-rec]', list), i = items.indexOf(document.activeElement);
      var n = items[e.key === 'ArrowDown' ? i + 1 : i - 1];
      if (n) { e.preventDefault(); n.focus(); n.click(); }
    });
  });

  /* Approval decisions update the record and the timeline */
  $$('[data-decide]').forEach(function (b) {
    b.addEventListener('click', function () {
      var host = b.closest('[data-approval]'), kind = b.getAttribute('data-decide');
      var note = $('textarea', host), st = $('[data-status]', host), tl = $('.timeline', host);
      if (kind === 'reject' && !note.value.trim()) {
        note.setAttribute('aria-invalid', 'true'); $('#reject-msg').hidden = false; note.focus(); return;
      }
      note.removeAttribute('aria-invalid'); $('#reject-msg').hidden = true;
      var map = { approve: ['Approved', 'badge--pos', 'pos', 'check'], reject: ['Returned', 'badge--neg', 'neg', 'x'], hold: ['On hold', 'badge--warn', '', 'clock'] }[kind];
      st.className = 'badge badge--dot ' + map[1]; st.textContent = map[0];
      tl.insertAdjacentHTML('afterbegin', '<li><span class="timeline__mark' + (map[2] ? ' timeline__mark--' + map[2] : '') + '">' + icon(map[3]) + '</span><div><div class="timeline__text"><b>You</b> marked this ' + map[0].toLowerCase() + '</div><div class="timeline__time">Just now</div>' + (note.value.trim() ? '<div class="timeline__quote">' + esc(note.value.trim()) + '</div>' : '') + '</div></li>');
      note.value = '';
      $$('[data-decide]', host).forEach(function (x) { x.disabled = true; });
      $('[data-undo]', host).hidden = false;
      toast({ text: 'Request ' + map[0].toLowerCase() + '. The requester has been notified.', kind: map[2] || null, action: 'Undo', onAction: function () { var u = $('[data-undo]', host); if (!u.hidden) u.click(); } });
    });
  });
  $$('[data-undo]').forEach(function (u) {
    u.addEventListener('click', function () {
      var host = u.closest('[data-approval]');
      $$('[data-decide]', host).forEach(function (x) { x.disabled = false; });
      var st = $('[data-status]', host); st.className = 'badge badge--dot badge--note'; st.textContent = 'Awaiting you';
      /* History is append-only: undo records itself rather than erasing */
      $('.timeline', host).insertAdjacentHTML('afterbegin', '<li><span class="timeline__mark">' + icon('history') + '</span><div><div class="timeline__text"><b>You</b> undid your decision</div><div class="timeline__time">Just now</div></div></li>');
      u.hidden = true;
    });
  });

  /* Sign-in demo states */
  $$('[data-signin]').forEach(function (form) {
    var tries = 0;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = $('#si-email', form), pw = $('#si-pw', form), err = $('#si-error', form), btn = $('[type="submit"]', form);
      var bad = !email.value.trim() || !/@/.test(email.value);
      email.setAttribute('aria-invalid', bad); $('#si-email-msg').hidden = !bad;
      if (bad) { email.focus(); return; }
      btn.classList.add('is-loading');
      setTimeout(function () {
        btn.classList.remove('is-loading');
        if (pw.value !== 'ledger') {
          tries++;
          err.hidden = false;
          $('[data-tries]', err).textContent = tries >= 3 ? 'For your security we’ve paused sign-in for 5 minutes. Reset your password to get in sooner.' : 'That email and password don’t match. Check for typos, or reset your password. (' + (3 - tries) + ' tries left before a short pause.)';
          pw.value = ''; pw.focus();
        } else {
          err.hidden = true;
          toast({ title: 'Signed in', text: 'Welcome back.', kind: 'pos' });
        }
      }, 900);
    });
  });

  /* ---------- 4. Command palette ---------- */
  var cmd = document.createElement('dialog');
  cmd.className = 'dialog cmdk';
  cmd.setAttribute('aria-label', 'Search');
  cmd.innerHTML = '<div class="cmdk__input">' + icon('search') + '<input type="text" placeholder="Search pages and components" aria-label="Search" aria-controls="cmdk-list" autocomplete="off" spellcheck="false"><span class="kbd">Esc</span></div>' +
    '<div class="cmdk__list menu" id="cmdk-list" role="listbox"></div>' +
    '<div class="cmdk__foot"><span><span class="kbd">↑</span><span class="kbd">↓</span> move</span><span><span class="kbd">↵</span> open</span><span><span class="kbd">Esc</span> close</span></div>';
  document.body.appendChild(cmd);
  var cIn = $('input', cmd), cList = $('.cmdk__list', cmd), cAt = 0, cRes = [];
  var EXTRA = [
    ['components/actions', 'Split button'], ['components/actions', 'Icon button'], ['components/actions', 'Button group'],
    ['components/text-inputs', 'Search field'], ['components/text-inputs', 'Text area'], ['components/text-inputs', 'Validation'],
    ['components/selection', 'Checkbox'], ['components/selection', 'Radio'], ['components/selection', 'Switch'], ['components/selection', 'Slider'], ['components/selection', 'Combobox'], ['components/selection', 'Multi-select'],
    ['components/pickers', 'Date picker'], ['components/pickers', 'Date range'], ['components/pickers', 'Time picker'], ['components/pickers', 'File upload'],
    ['components/navigation', 'Tabs'], ['components/navigation', 'Breadcrumbs'], ['components/navigation', 'Pagination'], ['components/navigation', 'Stepper'], ['components/navigation', 'Tree view'],
    ['components/overlays', 'Menu'], ['components/overlays', 'Context menu'], ['components/overlays', 'Popover'], ['components/overlays', 'Tooltip'], ['components/overlays', 'Dialog'], ['components/overlays', 'Drawer'], ['components/overlays', 'Command palette'],
    ['components/feedback', 'Callout'], ['components/feedback', 'Toast'], ['components/feedback', 'Banner'], ['components/feedback', 'Progress'], ['components/feedback', 'Skeleton'], ['components/feedback', 'Empty state'],
    ['components/data-display', 'Badge'], ['components/data-display', 'Tag'], ['components/data-display', 'Avatar'], ['components/data-display', 'Card'], ['components/data-display', 'Timeline'], ['components/data-display', 'Accordion'], ['components/data-display', 'Statistic'],
    ['components/tables', 'Data grid'], ['components/editors', 'Rich text'], ['components/editors', 'Code block'], ['components/editors', 'Markdown'],
    ['patterns/list-detail', 'Kanban board']
  ];
  var INDEX = FLAT.map(function (p) { return { id: p.id, title: p.title, sub: p.group + ' · ' + p.desc }; })
    .concat(EXTRA.map(function (x) { var p = FLAT.find(function (f) { return f.id === x[0]; }); return { id: x[0], title: x[1], sub: 'in ' + p.title }; }));
  function cRender() {
    var q = cIn.value.trim().toLowerCase();
    cRes = INDEX.filter(function (r) { return !q || (r.title + ' ' + r.sub).toLowerCase().indexOf(q) > -1; }).slice(0, 12);
    cAt = Math.min(cAt, Math.max(cRes.length - 1, 0));
    cList.innerHTML = cRes.length ? cRes.map(function (r, i) {
      return '<a role="option" id="cr' + i + '" href="' + href(r.id) + '" class="' + (i === cAt ? 'is-active' : '') + '" style="height:auto;padding:8px 10px;text-decoration:none"><span style="display:grid;gap:1px"><span style="font-weight:500">' + esc(r.title) + '</span><span class="small faint">' + esc(r.sub) + '</span></span>' + icon('arrow-r', 'menu__tick') + '</a>';
    }).join('') : '<div class="cmdk__empty">Nothing called “' + esc(cIn.value) + '”. Try a component name, like “table”.</div>';
    if (cRes.length) cIn.setAttribute('aria-activedescendant', 'cr' + cAt);
  }
  function cOpen() { if (cmd.open) return; cIn.value = ''; cAt = 0; cRender(); cmd.showModal(); cIn.focus(); }
  cIn.addEventListener('input', function () { cAt = 0; cRender(); });
  cIn.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); cAt = Math.min(cAt + 1, cRes.length - 1); cRender(); $('.is-active', cList) && $('.is-active', cList).scrollIntoView({ block: 'nearest' }); }
    if (e.key === 'ArrowUp') { e.preventDefault(); cAt = Math.max(cAt - 1, 0); cRender(); $('.is-active', cList) && $('.is-active', cList).scrollIntoView({ block: 'nearest' }); }
    if (e.key === 'Enter' && cRes[cAt]) { location.href = href(cRes[cAt].id); }
  });
  cmd.addEventListener('click', function (e) { if (e.target === cmd) cmd.close(); });
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); cOpen(); }
    if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) && !document.activeElement.isContentEditable) { e.preventDefault(); cOpen(); }
  });
  document.addEventListener('click', function (e) { if (e.target.closest('[data-cmdk-open]')) cOpen(); });
})();
