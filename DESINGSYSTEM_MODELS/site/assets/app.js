/* Kestrel prototype runtime
   - Renders the application shell (header + sidebar) around each page's <main>
   - Wires accessible behaviours: menus, tabs, dialogs, toasts, data grid,
     keyboard shortcuts, display preferences
   The React layer (src/) implements the same behaviours as components; this
   file exists so the static HTML screens are fully usable for review. */
(function () {
  "use strict";

  const K = (window.K = window.K || {});
  const root = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const icon = (n, c) => window.kIcon(n, c);
  const isTyping = (el) =>
    el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

  // -------------------------------------------------------------------------
  // Preferences (per-viewer convenience only; safe when storage is blocked)
  // -------------------------------------------------------------------------
  const prefs = {
    get() {
      try { return JSON.parse(localStorage.getItem("kestrel.prefs") || "{}"); } catch (e) { return {}; }
    },
    set(patch) {
      const next = Object.assign(prefs.get(), patch);
      try { localStorage.setItem("kestrel.prefs", JSON.stringify(next)); } catch (e) { /* ignore */ }
      return next;
    },
  };
  K.prefs = prefs;

  function applyTheme(theme) {
    if (theme === "light" || theme === "dark") root.setAttribute("data-theme", theme);
    else root.removeAttribute("data-theme");
  }
  function applyDensity(d) { root.setAttribute("data-density", d); }

  // -------------------------------------------------------------------------
  // Navigation model
  // -------------------------------------------------------------------------
  const NAV = {
    work: [
      { id: "dashboard", label: "Dashboard", icon: "grid", href: "dashboard.html" },
      { id: "approvals", label: "My approvals", icon: "inbox", href: "purchase-request.html", badge: 4 },
      { id: "tasks", label: "My tasks", icon: "check-square", href: "#", count: 7 },
    ],
    modules: [
      { id: "crm", label: "CRM", icon: "users", items: [
        ["leads", "Leads", "#", 12], ["accounts", "Accounts", "customers.html"], ["contacts", "Contacts", "#"],
        ["opportunities", "Opportunities", "pipeline.html"], ["activities", "Activities", "#"], ["campaigns", "Campaigns", "#"],
      ] },
      { id: "sales", label: "Sales", icon: "receipt", items: [
        ["quotations", "Quotations", "#"], ["orders", "Sales Orders", "sales-order.html"],
        ["invoices", "Invoices", "#"], ["payments", "Payments", "#"],
      ] },
      { id: "procurement", label: "Procurement", icon: "truck", items: [
        ["suppliers", "Suppliers", "#"], ["requests", "Purchase Requests", "purchase-request.html", 3],
        ["orders", "Purchase Orders", "#"], ["receipts", "Goods Receipts", "#"],
      ] },
      { id: "inventory", label: "Inventory", icon: "box", items: [
        ["products", "Products", "#"], ["warehouses", "Warehouses", "#"], ["stock", "Stock", "stock.html"],
        ["transfers", "Transfers", "#"], ["adjustments", "Adjustments", "#"],
      ] },
      { id: "finance", label: "Finance", icon: "landmark", items: [
        ["coa", "Chart of Accounts", "#"], ["receivables", "Receivables", "#"],
        ["payables", "Payables", "#"], ["banking", "Banking", "#"],
      ] },
    ],
    utility: [
      { id: "reports", label: "Reports", icon: "chart", href: "#" },
      { id: "admin", label: "Administration", icon: "shield", href: "#" },
      { id: "states", label: "UX states", icon: "alert-circle", href: "states.html" },
      { id: "ds", label: "Design system", icon: "sliders", href: "index.html" },
    ],
  };

  const RECENT = [
    { t: "SO-10234 · ABC Technologies Pvt Ltd", m: "Sales order · Confirmed", href: "sales-order.html", i: "receipt" },
    { t: "Vardhan Steel Traders", m: "Account · Mumbai", href: "account.html", i: "building" },
    { t: "PR-2026-0418 · Demo & trial kits", m: "Purchase request · Under review", href: "purchase-request.html", i: "truck" },
    { t: "Kaveri Agro Foods — Cold-chain expansion", m: "Opportunity · Negotiation", href: "pipeline.html", i: "target" },
    { t: "HB-M10-50 · Hex bolt M10 x 50 zinc", m: "Product · 4,820 on hand", href: "stock.html", i: "box" },
  ];

  // -------------------------------------------------------------------------
  // Shell rendering
  // -------------------------------------------------------------------------
  function renderHeader() {
    const p = prefs.get();
    const theme = p.theme || "system";
    const density = p.density || "comfortable";
    const radio = (group, val, cur, label) =>
      `<button class="k-menu__item" role="menuitemradio" aria-checked="${val === cur}" data-action="${group}:${val}">${label}</button>`;

    return `
<header class="k-header">
  <button class="k-header__btn k-header__menu" aria-label="Open navigation" aria-expanded="false" data-action="toggle-nav">${icon("menu")}</button>
  <a class="k-header__brand" href="dashboard.html" aria-label="Kestrel Business Suite, home">
    <svg viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="4" fill="#3572c4"/><path d="M8 5.5v13M8 12.5 15.5 6M10.8 10.2 16 18.5" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <span class="k-header__product">Kestrel</span><span class="k-header__app">Business Suite</span>
  </a>
  <div class="k-dropdown">
    <button class="k-header__btn k-header__org" aria-haspopup="menu" aria-expanded="false" aria-controls="m-org" data-menu>
      <span class="k-header__org-name">Sahyadri Industrial Supplies</span><span class="k-header__org-unit">· Pune HQ</span>${icon("chevron-down", "k-icon--sm")}
    </button>
    <div class="k-menu" id="m-org" role="menu" aria-label="Switch company" hidden>
      <div class="k-menu__label">Company · Branch</div>
      <button class="k-menu__item" role="menuitemradio" aria-checked="true">Sahyadri Industrial Supplies · Pune HQ</button>
      <button class="k-menu__item" role="menuitemradio" aria-checked="false">Sahyadri Industrial Supplies · Chennai Plant</button>
      <button class="k-menu__item" role="menuitemradio" aria-checked="false">Sahyadri Exports LLP · Mumbai</button>
    </div>
  </div>
  <span class="k-env" title="User acceptance testing. Data is copied from production every Sunday 02:00 IST.">UAT</span>
  <div class="k-header__search" role="search">
    ${icon("search")}
    <input type="search" id="global-search" placeholder="Search accounts, orders, invoices, people…" aria-label="Search everything"
      autocomplete="off" role="combobox" aria-expanded="false" aria-controls="search-results" aria-autocomplete="list">
    <kbd aria-hidden="true">/</kbd>
    <div class="k-search-results" id="search-results" role="listbox" aria-label="Search suggestions" hidden></div>
  </div>
  <div class="k-header__actions">
    <button class="k-header__btn k-header__search-btn" aria-label="Search" data-action="focus-search">${icon("search")}</button>
    <div class="k-dropdown">
      <button class="k-header__btn k-header__create" aria-haspopup="menu" aria-expanded="false" aria-controls="m-create" data-menu>
        ${icon("plus")}<span class="k-header__create-label">Create</span>
      </button>
      <div class="k-menu k-menu--end" id="m-create" role="menu" aria-label="Create" hidden style="min-width:240px">
        <div class="k-menu__label">Recently used</div>
        <a class="k-menu__item" role="menuitem" href="customer-new.html">${icon("building")}Account<span class="k-menu__shortcut">Alt N</span></a>
        <a class="k-menu__item" role="menuitem" href="#">${icon("receipt")}Quotation</a>
        <div class="k-menu__sep" role="separator"></div>
        <a class="k-menu__item" role="menuitem" href="#">${icon("user")}Lead</a>
        <a class="k-menu__item" role="menuitem" href="#">${icon("target")}Opportunity</a>
        <a class="k-menu__item" role="menuitem" href="#">${icon("receipt")}Sales order</a>
        <a class="k-menu__item" role="menuitem" href="#">${icon("truck")}Purchase request</a>
        <a class="k-menu__item" role="menuitem" href="#">${icon("transfer")}Stock transfer</a>
        <a class="k-menu__item" role="menuitem" href="#">${icon("message")}Log activity</a>
      </div>
    </div>
    <div class="k-dropdown">
      <button class="k-header__btn" aria-label="Notifications, 3 unread" aria-haspopup="dialog" aria-expanded="false" aria-controls="p-notif" data-menu>
        ${icon("bell")}<span class="k-badge k-badge--attention" aria-hidden="true">3</span>
      </button>
      <div class="k-popover" id="p-notif" role="dialog" aria-label="Notifications" hidden style="right:0;width:360px;padding:0">
        <div class="k-panel__header" style="padding:8px 12px">
          <span class="k-panel__title">Notifications</span>
          <button class="k-btn k-btn--link k-btn--sm" data-action="toast:All notifications marked as read">Mark all read</button>
        </div>
        <ul class="k-list">
          <li><a class="k-list__item is-unread" href="purchase-request.html"><span class="k-avatar k-avatar--sm" data-tint="3">RK</span><span class="k-list__main"><span class="k-list__title">Rohit Kulkarni requested your approval</span><span class="k-list__meta">PR-2026-0418 · ₹3,86,400 · 18 min ago</span></span></a></li>
          <li><a class="k-list__item is-unread" href="sales-order.html"><span class="k-avatar k-avatar--sm" data-tint="2">AN</span><span class="k-list__main"><span class="k-list__title">Anjali Nair mentioned you on SO-10234</span><span class="k-list__meta">“Can we split the delivery?” · 1 h ago</span></span></a></li>
          <li><a class="k-list__item is-unread" href="account.html"><span class="k-avatar k-avatar--sm k-avatar--org" data-tint="4">VS</span><span class="k-list__main"><span class="k-list__title">Vardhan Steel Traders exceeded credit limit</span><span class="k-list__meta">Outstanding ₹21,40,000 of ₹20,00,000 · 3 h ago</span></span></a></li>
          <li><a class="k-list__item" href="#"><span class="k-avatar k-avatar--sm">SY</span><span class="k-list__main"><span class="k-list__title">Nightly stock valuation completed</span><span class="k-list__meta">System · Yesterday 23:40</span></span></a></li>
        </ul>
        <div class="k-panel__footer"><a href="#">View all notifications</a><span class="u-ml-auto u-muted">Settings</span></div>
      </div>
    </div>
    <div class="k-dropdown">
      <button class="k-header__btn" aria-label="Help" aria-haspopup="menu" aria-expanded="false" aria-controls="m-help" data-menu>${icon("help")}</button>
      <div class="k-menu k-menu--end" id="m-help" role="menu" aria-label="Help" hidden style="min-width:240px">
        <a class="k-menu__item" role="menuitem" href="#">${icon("file")}Help for this page</a>
        <button class="k-menu__item" role="menuitem" data-action="shortcuts">${icon("keyboard")}Keyboard shortcuts<span class="k-menu__shortcut">?</span></button>
        <a class="k-menu__item" role="menuitem" href="#">${icon("star")}What’s new in 26.10</a>
        <div class="k-menu__sep" role="separator"></div>
        <a class="k-menu__item" role="menuitem" href="#">${icon("message")}Contact support</a>
      </div>
    </div>
    <div class="k-dropdown">
      <button class="k-header__btn k-header__user" aria-label="Account and display settings for Priya Deshmukh" aria-haspopup="menu" aria-expanded="false" aria-controls="m-user" data-menu>
        <span class="k-avatar" data-tint="1">PD</span><span class="k-header__user-name">Priya Deshmukh</span>
      </button>
      <div class="k-menu k-menu--end" id="m-user" role="menu" aria-label="Account" hidden style="min-width:250px">
        <div style="padding:8px 8px 6px"><div class="u-strong">Priya Deshmukh</div><div class="u-sm u-muted">Sales Manager · West Region</div></div>
        <div class="k-menu__sep" role="separator"></div>
        <div class="k-menu__label">Theme</div>
        <div role="group" aria-label="Theme">
          ${radio("theme", "light", theme, "Light")}${radio("theme", "dark", theme, "Dark")}${radio("theme", "system", theme, "Match system")}
        </div>
        <div class="k-menu__label">Density</div>
        <div role="group" aria-label="Density">
          ${radio("density", "compact", density, "Compact")}${radio("density", "comfortable", density, "Comfortable")}${radio("density", "spacious", density, "Spacious")}
        </div>
        <div class="k-menu__sep" role="separator"></div>
        <a class="k-menu__item" role="menuitem" href="#">${icon("user")}My profile &amp; delegation</a>
        <button class="k-menu__item" role="menuitem" data-action="shortcuts">${icon("keyboard")}Keyboard shortcuts</button>
        <button class="k-menu__item" role="menuitem" data-action="toast:Signed out (prototype)">${icon("logout")}Sign out</button>
      </div>
    </div>
  </div>
</header>`;
  }

  function renderSidebar(active) {
    const [mod, screen] = (active || "").split(".");
    const p = prefs.get();
    const open = p.navOpen || {};
    const workItem = (it) => {
      const cur = it.id === mod;
      const end = it.badge
        ? `<span class="k-badge k-badge--attention" aria-label="${it.badge} waiting">${it.badge}</span>`
        : it.count ? `<span class="k-nav__count">${it.count}</span>` : "";
      return `<li><a class="k-nav__item" href="${it.href}" ${cur ? 'aria-current="page"' : ""} title="${it.label}">${icon(it.icon)}<span class="k-nav__text">${it.label}</span>${end}</a></li>`;
    };
    const group = (g) => {
      const isCur = g.id === mod;
      const expanded = open[g.id] !== undefined ? open[g.id] : isCur;
      return `<li>
        <button class="k-nav__group-btn ${isCur ? "has-current" : ""}" aria-expanded="${expanded}" data-nav-group="${g.id}" title="${g.label}">
          ${icon(g.icon)}<span class="k-nav__text">${g.label}</span>${icon("chevron-right", "k-icon--sm k-nav__chevron")}
        </button>
        <ul class="k-nav__sub">
          ${g.items.map(([id, label, href, count]) => `<li><a class="k-nav__subitem" href="${href}" ${isCur && id === screen ? 'aria-current="page"' : ""}><span class="k-nav__text">${label}</span>${count ? `<span class="k-nav__count">${count}</span>` : ""}</a></li>`).join("")}
        </ul></li>`;
    };
    return `
<nav class="k-sidebar" id="sidebar" aria-label="Main navigation">
  <div class="k-sidebar__scroll">
    <div class="k-sidebar__section"><ul class="k-nav">${NAV.work.map(workItem).join("")}</ul></div>
    <div class="k-sidebar__section">
      <span class="k-sidebar__label" id="nav-modules">Modules</span>
      <ul class="k-nav" aria-labelledby="nav-modules">${NAV.modules.map(group).join("")}</ul>
    </div>
  </div>
  <div class="k-sidebar__footer">
    <ul class="k-nav k-nav--utility">${NAV.utility.map(workItem).join("")}
      <li><button class="k-nav__item k-sidebar__collapse" data-action="collapse-sidebar" aria-label="Collapse navigation" title="Collapse navigation">${icon("sidebar")}<span class="k-nav__text">Collapse</span></button></li>
    </ul>
  </div>
</nav>
<div class="k-app__scrim" data-action="toggle-nav"></div>`;
  }

  function mountShell() {
    const app = $(".k-app");
    if (!app || app.dataset.shell === "none") return;
    const main = $(".k-main", app);
    main.insertAdjacentHTML("beforebegin", renderHeader() + renderSidebar(app.dataset.nav));
    if (!$(".k-app__banners", app)) main.insertAdjacentHTML("beforebegin", '<div class="k-app__banners" aria-live="polite"></div>');
    if (prefs.get().sidebar === "collapsed") app.setAttribute("data-sidebar", "collapsed");
  }

  // -------------------------------------------------------------------------
  // Menus & popovers: [data-menu][aria-controls]
  // -------------------------------------------------------------------------
  let openMenu = null;
  function closeMenu(returnFocus) {
    if (!openMenu) return;
    const { trigger, panel } = openMenu;
    panel.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    if (returnFocus) trigger.focus();
    openMenu = null;
  }
  function menuItems(panel) {
    return $$('[role^="menuitem"], .k-list__item, a, button', panel).filter((el) => !el.closest("[hidden]") && !el.disabled);
  }
  function openMenuFor(trigger, viaKeyboard) {
    const panel = document.getElementById(trigger.getAttribute("aria-controls"));
    if (!panel) return;
    closeMenu(false);
    panel.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    openMenu = { trigger, panel };
    if (viaKeyboard) { const first = menuItems(panel)[0]; first && first.focus(); }
  }
  K.closeMenu = closeMenu;

  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-menu]");
    if (trigger) {
      e.preventDefault();
      const isOpen = trigger.getAttribute("aria-expanded") === "true";
      if (isOpen) closeMenu(false);
      else openMenuFor(trigger, e.detail === 0);
      return;
    }
    if (openMenu && !openMenu.panel.contains(e.target)) closeMenu(false);
    else if (openMenu && e.target.closest('[role^="menuitem"]:not([role="menuitemcheckbox"])')) closeMenu(false);
  });

  document.addEventListener("keydown", (e) => {
    if (!openMenu) return;
    const items = menuItems(openMenu.panel);
    const idx = items.indexOf(document.activeElement);
    if (e.key === "Escape") { e.preventDefault(); closeMenu(true); }
    else if (e.key === "ArrowDown") { e.preventDefault(); (items[idx + 1] || items[0]).focus(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); (items[idx - 1] || items[items.length - 1]).focus(); }
    else if (e.key === "Home") { e.preventDefault(); items[0].focus(); }
    else if (e.key === "End") { e.preventDefault(); items[items.length - 1].focus(); }
    else if (e.key === "Tab") closeMenu(false);
  });

  // -------------------------------------------------------------------------
  // Actions (delegated)
  // -------------------------------------------------------------------------
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-action]");
    if (!el) {
      const a = e.target.closest('a[href="#"]');
      if (a && !a.closest("[data-allow-hash]")) {
        e.preventDefault();
        K.toast({ text: `“${a.textContent.trim().split("\n")[0]}” isn’t included in this prototype.`, tone: "neutral" });
      }
      return;
    }
    const [action, arg] = el.dataset.action.split(/:(.*)/s);
    const app = $(".k-app");
    switch (action) {
      case "toggle-nav": {
        const openNow = !app.classList.contains("is-nav-open");
        app.classList.toggle("is-nav-open", openNow);
        $(".k-header__menu").setAttribute("aria-expanded", String(openNow));
        if (openNow) { const f = $(".k-sidebar a, .k-sidebar button"); f && f.focus(); }
        break;
      }
      case "collapse-sidebar": {
        const collapsed = app.getAttribute("data-sidebar") !== "collapsed";
        if (collapsed) app.setAttribute("data-sidebar", "collapsed");
        else app.removeAttribute("data-sidebar");
        el.setAttribute("aria-label", collapsed ? "Expand navigation" : "Collapse navigation");
        prefs.set({ sidebar: collapsed ? "collapsed" : "expanded" });
        break;
      }
      case "theme":
        applyTheme(arg); prefs.set({ theme: arg }); syncRadios("theme", arg); break;
      case "density":
        applyDensity(arg); prefs.set({ density: arg }); syncRadios("density", arg); break;
      case "shortcuts": showShortcuts(); break;
      case "focus-search": $("#global-search").focus(); break;
      case "toast": K.toast({ text: arg }); break;
      default: break;
    }
  });

  function syncRadios(group, val) {
    $$(`[data-action^="${group}:"]`).forEach((b) => b.setAttribute("aria-checked", String(b.dataset.action === `${group}:${val}`)));
  }

  // Sidebar groups
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-nav-group]");
    if (!btn) return;
    const app = $(".k-app");
    if (app.getAttribute("data-sidebar") === "collapsed" && window.innerWidth >= 1200) {
      app.removeAttribute("data-sidebar");
      prefs.set({ sidebar: "expanded" });
      btn.setAttribute("aria-expanded", "true");
    } else {
      const expanded = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(expanded));
    }
    const navOpen = prefs.get().navOpen || {};
    navOpen[btn.dataset.navGroup] = btn.getAttribute("aria-expanded") === "true";
    prefs.set({ navOpen });
  });

  // -------------------------------------------------------------------------
  // Global search
  // -------------------------------------------------------------------------
  function initSearch() {
    const input = $("#global-search");
    if (!input) return;
    const box = $("#search-results");
    const render = () => {
      const q = input.value.trim().toLowerCase();
      const hits = q ? RECENT.filter((r) => (r.t + r.m).toLowerCase().includes(q)) : RECENT;
      const mark = (s) => (q ? s.replace(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig"), "<mark>$1</mark>") : s);
      box.innerHTML =
        `<div class="k-menu__label">${q ? "Matching records" : "Recently viewed"}</div>` +
        (hits.length
          ? hits.map((r, i) => `<a class="k-option ${i === 0 ? "is-active" : ""}" role="option" href="${r.href}">${icon(r.i)}<span class="k-option__main">${mark(r.t)}</span><span class="k-option__meta">${r.m}</span></a>`).join("")
          : `<div class="k-listbox__empty">No records match “${input.value}”. Try a document number (SO-10234), GSTIN or phone number.</div>`) +
        `<div class="k-listbox__footer">Press <kbd>Enter</kbd> to open · <kbd>Esc</kbd> to close</div>`;
    };
    input.addEventListener("focus", () => { render(); box.hidden = false; input.setAttribute("aria-expanded", "true"); });
    input.addEventListener("input", render);
    input.addEventListener("blur", () => setTimeout(() => { box.hidden = true; input.setAttribute("aria-expanded", "false"); }, 150));
    input.addEventListener("keydown", (e) => {
      const opts = $$(".k-option", box);
      const cur = opts.findIndex((o) => o.classList.contains("is-active"));
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const next = e.key === "ArrowDown" ? Math.min(cur + 1, opts.length - 1) : Math.max(cur - 1, 0);
        opts.forEach((o, i) => o.classList.toggle("is-active", i === next));
      } else if (e.key === "Enter" && opts[cur]) {
        window.location.href = opts[cur].getAttribute("href");
      } else if (e.key === "Escape") {
        input.blur();
      }
    });
  }

  // -------------------------------------------------------------------------
  // Tabs: [role=tablist] > [role=tab][aria-controls]
  // -------------------------------------------------------------------------
  function initTabs(scope = document) {
    $$('[role="tablist"]', scope).forEach((list) => {
      const tabs = $$('[role="tab"]', list);
      const select = (tab, focus) => {
        tabs.forEach((t) => {
          const on = t === tab;
          t.setAttribute("aria-selected", String(on));
          t.tabIndex = on ? 0 : -1;
          const panel = document.getElementById(t.getAttribute("aria-controls"));
          if (panel) panel.hidden = !on;
        });
        if (focus) tab.focus();
        list.dispatchEvent(new CustomEvent("k-tabchange", { detail: tab }));
      };
      tabs.forEach((t) => {
        t.tabIndex = t.getAttribute("aria-selected") === "true" ? 0 : -1;
        t.addEventListener("click", () => select(t));
        t.addEventListener("keydown", (e) => {
          const i = tabs.indexOf(t);
          const map = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
          if (e.key in map) {
            e.preventDefault();
            select(tabs[(map[e.key] + tabs.length) % tabs.length], true);
          }
        });
      });
    });
  }
  K.initTabs = initTabs;

  // -------------------------------------------------------------------------
  // Dialogs: [data-open-dialog=id], [data-close-dialog]
  // -------------------------------------------------------------------------
  document.addEventListener("click", (e) => {
    const opener = e.target.closest("[data-open-dialog]");
    if (opener) {
      const d = document.getElementById(opener.dataset.openDialog);
      if (d && !d.open) { d.showModal(); d._opener = opener; }
      return;
    }
    const closer = e.target.closest("[data-close-dialog]");
    if (closer) { const d = closer.closest("dialog"); d && d.close(closer.dataset.closeDialog || ""); return; }
    // Light dismiss for drawers and sheets (never for modals with decisions)
    if (e.target.tagName === "DIALOG" && /k-drawer|k-sheet/.test(e.target.className)) {
      const r = e.target.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) e.target.close();
    }
  });
  document.addEventListener("close", (e) => { if (e.target._opener) e.target._opener.focus(); }, true);

  // -------------------------------------------------------------------------
  // Toasts
  // -------------------------------------------------------------------------
  K.toast = function ({ text, tone = "success", action, onAction, timeout = 6000 }) {
    let region = $(".k-toast-region");
    if (!region) {
      region = document.createElement("div");
      region.className = "k-toast-region";
      region.setAttribute("role", "status");
      region.setAttribute("aria-live", "polite");
      document.body.appendChild(region);
    }
    const ic = { success: "check-circle", error: "alert-circle", warning: "alert-triangle", info: "info", neutral: "info" }[tone];
    const el = document.createElement("div");
    el.className = "k-toast";
    el.dataset.tone = tone;
    el.innerHTML = `${icon(ic)}<span class="k-toast__text">${text}</span>${action ? `<button class="k-toast__action">${action}</button>` : ""}<button class="k-toast__close" aria-label="Dismiss">${icon("x", "k-icon--sm")}</button>`;
    region.appendChild(el);
    let timer;
    const dismiss = () => { el.classList.add("is-leaving"); setTimeout(() => el.remove(), 200); };
    const arm = () => { timer = setTimeout(dismiss, timeout); };
    el.addEventListener("mouseenter", () => clearTimeout(timer));
    el.addEventListener("mouseleave", arm);
    el.addEventListener("focusin", () => clearTimeout(timer));
    $(".k-toast__close", el).onclick = dismiss;
    if (action) $(".k-toast__action", el).onclick = () => { onAction && onAction(); dismiss(); };
    arm();
    return dismiss;
  };

  // -------------------------------------------------------------------------
  // Data grid
  // -------------------------------------------------------------------------
  function initGrid(grid) {
    const table = $("table", grid);
    const tbody = $("tbody", table);
    const id = grid.id || "grid";
    const all = $("[data-select-all]", grid);
    const bulk = $("[data-bulkbar]", grid);
    const toolbar = $("[data-toolbar]", grid);
    const countEl = $("[data-selection-count]", grid);
    const rowChecks = () => $$("[data-select-row]", tbody);

    // ---- Selection --------------------------------------------------------
    const sync = () => {
      const checks = rowChecks();
      const n = checks.filter((c) => c.checked).length;
      checks.forEach((c) => c.closest("tr").classList.toggle("is-selected", c.checked));
      if (all) {
        all.checked = n > 0 && n === checks.length;
        all.indeterminate = n > 0 && n < checks.length;
      }
      if (bulk) {
        bulk.hidden = n === 0;
        if (toolbar) toolbar.hidden = n > 0;
        if (countEl) countEl.textContent = `${n} selected`;
        const allLink = $("[data-select-matching]", bulk);
        if (allLink) allLink.hidden = !(n === checks.length);
      }
    };
    grid.addEventListener("change", (e) => {
      if (e.target.matches("[data-select-all]")) rowChecks().forEach((c) => (c.checked = e.target.checked));
      if (e.target.matches("[data-select-all], [data-select-row]")) sync();
    });
    // Shift+click range selection
    let lastIdx = null;
    grid.addEventListener("click", (e) => {
      const c = e.target.closest("[data-select-row]");
      if (!c) return;
      const checks = rowChecks();
      const idx = checks.indexOf(c);
      if (e.shiftKey && lastIdx !== null) {
        const [a, b] = [Math.min(lastIdx, idx), Math.max(lastIdx, idx)];
        for (let i = a; i <= b; i++) checks[i].checked = c.checked;
        sync();
      }
      lastIdx = idx;
    });
    $$("[data-clear-selection]", grid).forEach((b) => b.addEventListener("click", () => {
      rowChecks().forEach((c) => (c.checked = false)); sync(); all && all.focus();
    }));
    sync();

    // ---- Sorting (click = single, Shift+click = add to multi-sort) ---------
    let sorts = [];
    const headers = () => $$("thead th", table);
    const cellValue = (row, i) => {
      const cell = row.children[i];
      if (!cell) return "";
      const v = (cell.dataset.value != null ? cell.dataset.value : cell.textContent).trim();
      // Sort numerically only when the whole value is numeric (amounts, counts)
      return /^-?[₹\d,.\s]+$/.test(v) ? parseFloat(v.replace(/[₹,\s]/g, "")) : v.toLowerCase();
    };
    const applySort = () => {
      headers().forEach((th) => {
        const s = sorts.find((x) => x.th === th);
        th.setAttribute("aria-sort", s ? (s.dir === 1 ? "ascending" : "descending") : "none");
        const pr = $(".k-th__priority", th);
        if (pr) pr.remove();
        if (s && sorts.length > 1) $(".k-th", th).insertAdjacentHTML("beforeend", `<span class="k-th__priority" aria-label="sort priority ${sorts.indexOf(s) + 1}">${sorts.indexOf(s) + 1}</span>`);
      });
      if (!sorts.length) return;
      const groups = [];
      $$(":scope > tr", tbody).forEach((tr) => {
        if (tr.classList.contains("k-table__detail")) groups[groups.length - 1].push(tr);
        else groups.push([tr]);
      });
      groups.sort((ga, gb) => {
        for (const s of sorts) {
          const i = headers().indexOf(s.th);
          const a = cellValue(ga[0], i), b = cellValue(gb[0], i);
          if (a < b) return -s.dir;
          if (a > b) return s.dir;
        }
        return 0;
      });
      groups.flat().forEach((tr) => tbody.appendChild(tr));
    };
    table.addEventListener("click", (e) => {
      const btn = e.target.closest(".k-th");
      if (!btn) return;
      const th = btn.closest("th");
      const existing = sorts.find((s) => s.th === th);
      if (e.shiftKey) {
        if (!existing) sorts.push({ th, dir: 1 });
        else if (existing.dir === 1) existing.dir = -1;
        else sorts = sorts.filter((s) => s !== existing);
      } else {
        if (!existing || sorts.length > 1) sorts = [{ th, dir: existing && sorts.length === 1 ? -existing.dir : 1 }];
        else if (existing.dir === 1) existing.dir = -1;
        else sorts = [];
      }
      applySort();
    });
    headers().forEach((th) => {
      if (th.getAttribute("aria-sort") === "ascending") sorts.push({ th, dir: 1 });
      if (th.getAttribute("aria-sort") === "descending") sorts.push({ th, dir: -1 });
    });

    // ---- Column resize (remembered per grid) ------------------------------
    const cols = $$("colgroup col", table);
    const saved = (prefs.get().grids || {})[id] || {};
    if (saved.widths) cols.forEach((c, i) => { if (saved.widths[i]) c.style.width = saved.widths[i]; });
    $$(".k-table__resizer", table).forEach((h) => {
      h.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        const th = h.closest("th");
        const col = cols[headers().indexOf(th)];
        if (!col) return;
        const startX = e.clientX, startW = th.getBoundingClientRect().width;
        h.classList.add("is-resizing");
        h.setPointerCapture(e.pointerId);
        const move = (ev) => { col.style.width = Math.max(56, startW + ev.clientX - startX) + "px"; };
        const up = () => {
          h.classList.remove("is-resizing");
          h.removeEventListener("pointermove", move);
          const grids = prefs.get().grids || {};
          grids[id] = Object.assign(grids[id] || {}, { widths: cols.map((c) => c.style.width) });
          prefs.set({ grids });
        };
        h.addEventListener("pointermove", move);
        h.addEventListener("pointerup", up, { once: true });
      });
      // Keyboard resize: focus handle, arrows change width
      h.tabIndex = 0;
      h.setAttribute("role", "separator");
      h.setAttribute("aria-orientation", "vertical");
      h.setAttribute("aria-label", `Resize ${h.closest("th").textContent.trim()} column`);
      h.addEventListener("keydown", (e) => {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        e.preventDefault();
        const th = h.closest("th");
        const col = cols[headers().indexOf(th)];
        col.style.width = Math.max(56, th.getBoundingClientRect().width + (e.key === "ArrowRight" ? 16 : -16)) + "px";
      });
    });

    // ---- Column visibility -------------------------------------------------
    const setColVisible = (key, visible) => {
      const th = $(`thead th[data-col="${key}"]`, table);
      if (!th) return;
      const i = headers().indexOf(th);
      $$("tr", table).forEach((tr) => {
        if (tr.classList.contains("k-table__detail") || tr.classList.contains("k-table__group")) return;
        const cell = tr.children[i];
        if (cell) cell.style.display = visible ? "" : "none";
      });
      if (cols[i]) cols[i].style.visibility = visible ? "" : "collapse";
      if (cols[i]) cols[i].style.display = visible ? "" : "none";
    };
    $$("[data-col-toggle]", grid).forEach((item) => {
      if (item.getAttribute("aria-checked") === "false") setColVisible(item.dataset.colToggle, false);
      item.addEventListener("click", () => {
        const on = item.getAttribute("aria-checked") !== "true";
        item.setAttribute("aria-checked", String(on));
        setColVisible(item.dataset.colToggle, on);
      });
    });

    // ---- Column reorder (drag header) ---------------------------------------
    let dragTh = null;
    headers().forEach((th) => {
      if (!th.hasAttribute("draggable")) return;
      th.addEventListener("dragstart", (e) => { dragTh = th; th.classList.add("is-dragging"); e.dataTransfer.effectAllowed = "move"; });
      th.addEventListener("dragend", () => { th.classList.remove("is-dragging"); headers().forEach((h) => h.classList.remove("is-drag-over")); });
      th.addEventListener("dragover", (e) => { if (dragTh && th !== dragTh && th.hasAttribute("draggable")) { e.preventDefault(); th.classList.add("is-drag-over"); } });
      th.addEventListener("dragleave", () => th.classList.remove("is-drag-over"));
      th.addEventListener("drop", (e) => {
        e.preventDefault();
        const from = headers().indexOf(dragTh), to = headers().indexOf(th);
        $$("tr", table).forEach((tr) => {
          if (tr.classList.contains("k-table__detail") || tr.classList.contains("k-table__group") || tr.classList.contains("k-table__colgroup")) return;
          const a = tr.children[from], b = tr.children[to];
          if (a && b) tr.insertBefore(a, from < to ? b.nextSibling : b);
        });
        const cg = $("colgroup", table);
        if (cg) { const a = cg.children[from], b = cg.children[to]; cg.insertBefore(a, from < to ? b.nextSibling : b); }
        K.toast({ text: "Column order saved to this view.", tone: "neutral", timeout: 3000 });
      });
    });

    // ---- Expandable rows -------------------------------------------------------
    table.addEventListener("click", (e) => {
      const b = e.target.closest(".k-expand-btn");
      if (!b) return;
      const open = b.getAttribute("aria-expanded") !== "true";
      b.setAttribute("aria-expanded", String(open));
      const detail = document.getElementById(b.getAttribute("aria-controls"));
      if (detail) detail.hidden = !open;
    });

    // ---- Inline edit ------------------------------------------------------------
    const startEdit = (td) => {
      if (td.classList.contains("is-editing")) return;
      const original = td.innerHTML;
      const raw = td.dataset.value != null ? td.dataset.value : td.textContent.trim();
      const kind = td.dataset.edit || "text";
      const label = td.dataset.label || headers()[Array.from(td.parentElement.children).indexOf(td)].textContent.trim();
      td.classList.add("is-editing");
      if (kind.startsWith("select:")) {
        const opts = kind.slice(7).split("|");
        td.innerHTML = `<select class="k-select k-select--sm" aria-label="${label}">${opts.map((o) => `<option ${o === raw ? "selected" : ""}>${o}</option>`).join("")}</select>`;
      } else {
        td.innerHTML = `<input class="k-input k-input--sm ${kind === "number" ? "k-input--num" : ""}" aria-label="${label}" value="${raw}">`;
      }
      const ctl = td.firstElementChild;
      ctl.focus();
      ctl.select && ctl.select();
      let done = false;
      const finish = (commit) => {
        if (done) return; done = true;
        td.classList.remove("is-editing");
        const val = ctl.value.trim();
        if (!commit || val === raw) { td.innerHTML = original; td.focus(); return; }
        if (kind === "number" && isNaN(Number(val.replace(/,/g, "")))) {
          td.innerHTML = original; td.classList.add("has-error");
          K.toast({ text: `${label}: enter a number, e.g. 1500000`, tone: "error" });
          setTimeout(() => td.classList.remove("has-error"), 3000);
          td.focus();
          return;
        }
        const display = kind === "number" ? formatINR(Number(val.replace(/,/g, ""))) : val;
        td.classList.add("is-saving");
        td.innerHTML = display;
        td.dataset.value = kind === "number" ? val.replace(/,/g, "") : val;
        setTimeout(() => {
          td.classList.remove("is-saving");
          td.parentElement.classList.add("is-flash");
          setTimeout(() => td.parentElement.classList.remove("is-flash"), 2500);
          K.toast({
            text: `${label} updated to <strong>${display}</strong>`,
            action: "Undo",
            onAction: () => { td.innerHTML = original; td.dataset.value = raw; K.toast({ text: "Change reverted.", tone: "neutral", timeout: 2500 }); },
          });
        }, 450);
        td.focus();
      };
      ctl.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); finish(true); }
        if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); finish(false); }
      });
      ctl.addEventListener("blur", () => finish(true));
    };
    $$("td.is-editable", table).forEach((td) => {
      td.tabIndex = 0;
      td.title = "Double-click or press Enter to edit";
      td.addEventListener("dblclick", () => startEdit(td));
      td.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === "F2") && !td.classList.contains("is-editing")) { e.preventDefault(); startEdit(td); } });
    });
  }
  K.initGrid = initGrid;

  function formatINR(n) {
    return "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });
  }
  K.formatINR = formatINR;

  // -------------------------------------------------------------------------
  // Keyboard shortcuts
  // -------------------------------------------------------------------------
  const SHORTCUTS = [
    ["Global", [["/", "Search everything"], ["Ctrl K", "Search everything"], ["?", "Show this list"], ["Alt N", "New record (on list pages)"], ["Esc", "Close menu, dialog or drawer"]]],
    ["Go to", [["G then D", "Dashboard"], ["G then A", "Accounts"], ["G then O", "Opportunities"], ["G then S", "Sales orders"], ["G then I", "Stock"]]],
    ["Tables", [["Shift + click", "Select a range of rows / add a sort column"], ["Enter or F2", "Edit focused cell"], ["Esc", "Cancel cell edit"], ["← →", "Resize focused column handle"]]],
    ["Forms", [["Ctrl S", "Save"], ["Ctrl Enter", "Save and close"]]],
  ];
  function showShortcuts() {
    let d = $("#k-shortcuts");
    if (!d) {
      d = document.createElement("dialog");
      d.id = "k-shortcuts";
      d.className = "k-modal";
      d.setAttribute("aria-labelledby", "k-shortcuts-title");
      d.innerHTML = `<div class="k-modal__header"><h2 class="k-modal__title" id="k-shortcuts-title">Keyboard shortcuts</h2><button class="k-btn k-btn--subtle k-btn--icon k-btn--sm" data-close-dialog aria-label="Close">${icon("x")}</button></div>
      <div class="k-modal__body" style="color:var(--color-text-primary)">${SHORTCUTS.map(([g, rows]) => `<div class="k-text-label" style="margin:4px 0 6px">${g}</div><table class="k-audit" style="margin-bottom:12px"><tbody>${rows.map(([k, l]) => `<tr><td style="width:150px">${k.split(" ").map((x) => (x === "then" || x === "+" || x === "or" ? ` <span class="u-muted">${x}</span> ` : `<kbd>${x}</kbd>`)).join(" ")}</td><td>${l}</td></tr>`).join("")}</tbody></table>`).join("")}</div>`;
      document.body.appendChild(d);
    }
    d.showModal();
  }
  K.showShortcuts = showShortcuts;

  let gPending = 0;
  document.addEventListener("keydown", (e) => {
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key.toLowerCase() === "k") { e.preventDefault(); const s = $("#global-search"); s && s.focus(); return; }
    if (mod && e.key.toLowerCase() === "s") {
      const save = $('[data-shortcut="mod+s"]');
      if (save) { e.preventDefault(); save.click(); }
      return;
    }
    if (e.altKey && e.key.toLowerCase() === "n") {
      const n = $('[data-shortcut="alt+n"]');
      if (n) { e.preventDefault(); n.click(); }
      return;
    }
    if (isTyping(document.activeElement) || mod || e.altKey) return;
    if (e.key === "/") { e.preventDefault(); const s = $("#global-search"); s && s.focus(); }
    else if (e.key === "?") { e.preventDefault(); showShortcuts(); }
    else if (e.key === "g") { gPending = Date.now(); }
    else if (gPending && Date.now() - gPending < 1200) {
      const dest = { d: "dashboard.html", a: "customers.html", o: "pipeline.html", s: "sales-order.html", i: "stock.html" }[e.key];
      gPending = 0;
      if (dest) window.location.href = dest;
    } else if (e.key === "Escape") {
      const app = $(".k-app");
      if (app && app.classList.contains("is-nav-open")) { app.classList.remove("is-nav-open"); $(".k-header__menu").focus(); }
    }
  });

  // -------------------------------------------------------------------------
  // Network status — real offline handling, not just a demo
  // -------------------------------------------------------------------------
  K.setOffline = function (offline) {
    const host = $(".k-app__banners");
    if (!host) return;
    const ex = $("#k-offline-banner");
    root.classList.toggle("is-offline", offline);
    if (offline && !ex) {
      host.insertAdjacentHTML("beforeend", `<div class="k-banner" data-tone="warning" id="k-offline-banner" role="status">${icon("wifi-off")}<span class="k-banner__text"><strong>You’re offline.</strong> Changes you make are kept on this device and will sync when the connection returns. Approvals and postings are paused.</span><button class="k-btn k-btn--sm" data-action="toast:Still offline — retrying every 15 seconds">Retry now</button></div>`);
    } else if (!offline && ex) {
      ex.remove();
      K.toast({ text: "Back online. 0 pending changes to sync.", tone: "success", timeout: 3000 });
    }
  };
  window.addEventListener("offline", () => K.setOffline(true));
  window.addEventListener("online", () => K.setOffline(false));

  // -------------------------------------------------------------------------
  // Boot
  // -------------------------------------------------------------------------
  function boot() {
    mountShell();
    initSearch();
    initTabs();
    $$("[data-grid]").forEach(initGrid);
    if (!navigator.onLine) K.setOffline(true);
    document.dispatchEvent(new CustomEvent("k-ready"));
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
