# Workflow Lab 4

Kagami ERP design system with an on-demand **inventory workflow module**, split into small,
documented source files. Same features as Lab 3; the code is reorganised for readability and reuse.

## Open it

| File | Use it for |
|---|---|
| `dist/lab4.html` | **The app.** One self-contained file: double-click to open. The *Download workflow* option works here. |
| `index.html` | Development. Loads every file from `src/` separately, so changes show on reload without a build. |

After changing anything in `src/`, run `node build.js` to refresh `dist/lab4.html`.

## Folder map

```
index.html                  page shell: markup, stylesheets and scripts in load order
build.js                    bundles index.html + src/ into dist/lab4.html (no dependencies)
dist/lab4.html              built single-file app
tools/smoke-test.js         headless Chrome check of both builds (npm test)

src/
  boot/                     runs in <head> before first paint
    embed-mode.js           device-preview frame flags
    theme-engine.js         brand color / gradient -> light and dark tokens (window.KagamiTheme)
    design-lab-engine.js    design languages, size, density, motion, navbar (window.KagamiLab)
  styles/                   one stylesheet per concern (tokens, reset, shell, components, ...)
  core/                     no UI: app-context, icons, utils, session
  ui/                       reusable components: badge, toast, modal, drawer, menu, form,
                            data-table, charts, stepper
  shell/                    the application frame: navigation, module-loader, appearance,
                            header, router, init (always last)
  design/                   design system features: settings panel, form layouts, device
                            preview, lab dock, components, builder, export, styleguide,
                            formats, routes; data/ holds generated catalogues
    component-lab.html      the UX Design Lab page that renders every component variant
  modules/inventory/        the inventory workflow, loaded only when its toggle is on
    manifest.js             file load order
    index.js -> register.js data/, lib/, menu.js, pages/
```

## How it fits together

- **Classic scripts, shared scope.** Files are plain `<script>`s (not ES modules), so the app also runs
  from `file://`. Each file's top-level `const` / `function` names are visible to the files after it,
  which is why the **load order in `index.html` matters**: a file may use anything defined above it.
  Every file starts with a header listing what it **provides**.
- **Shell and modules.** The shell never imports inventory code. The module calls
  `registerInventory({ nav, pages, routes, notifications, quickCreate, search, sidebarFoot, logAudit })`
  from `modules/inventory/register.js`, and `shell/module-loader.js` merges that into the menu,
  search, notifications and router while the toggle is on.
- **Routes.** `ROUTES['name'] = (param, query) => ({ title, crumbs, sub, actions, body, mount(page) })`.
  `#/products` calls `ROUTES.products()`. `body` is HTML; `mount` wires events after it is inserted.
- **Reusable UI.** Build pages from `card()`, `btn()`, `badge()`, `F()` (form fields), `mountTable()` /
  `DataTable()`, `openModal()`, `openDrawer()`, `openMenu()`, `toast()` and the chart helpers.
- **Single-file build.** `build.js` inlines styles and boot scripts, stores the component lab page and
  the inventory module as inert data blocks, and joins the app into one script. That lets the page
  copy itself (`core/app-context.js`, `KG_SRC`), which is what *Download workflow* packages.

## Common tasks

**Add an inventory page**
1. Create `src/modules/inventory/pages/my-page.js` with a header comment and `ROUTES['my-page'] = ...`.
2. Add it to `src/modules/inventory/manifest.js` before `register.js`.
3. Add a menu entry in `src/modules/inventory/menu.js` (`INV_NAV`) and, if it should be searchable,
   in `INV_PAGES`.
4. `node build.js`.

**Add a shared UI helper** — put it in the matching `src/ui/` file (or a new file listed in
`index.html` before `src/shell/`), document it with a one-line comment, rebuild.

**Change colors, spacing or type** — edit `src/styles/tokens.css`; design-language palettes live in
`src/boot/design-lab-engine.js`.

## Test

```
npm install        # once: puppeteer-core
npm test           # builds, then runs tools/smoke-test.js against index.html and dist/lab4.html
```

The test needs Chrome or Edge; set `CHROME_PATH` if it is installed somewhere unusual.

## Notes

- `src/design/data/*.js` and `src/design/component-lab.html` are generated catalogues; they are kept
  unformatted on purpose.
- *Download workflow* needs the single-file build. In `index.html` it explains that and stops.
- Data is sample data held in memory; it resets on reload.
