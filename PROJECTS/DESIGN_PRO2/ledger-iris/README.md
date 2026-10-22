# Ledger Iris

The iris edition of Ledger: the same components and pages with an indigo, lavender and apricot palette. Only `assets/tokens.css` and the colour copy differ from the green edition.

A design system for back-office software: finance, operations and people. It uses plain HTML and CSS, with no framework and no build step.

Open `index.html` in a browser.

## What's in it

```
index.html              Overview, principles, catalogue
writing.html            Voice, labels, error messages, word list
foundations/            colour, type, space, depth-motion, icons, accessibility
components/             actions, text-inputs, selection, pickers, navigation,
                        overlays, feedback, data-display, tables, charts, editors
patterns/               forms (wizard + long form), list-detail, approvals, sign-in
apps/                   finance, crm, inventory, people — full interactive screens
assets/
  tokens.css            Every colour, size, radius, shadow and duration. Light + dark.
  ledger.css            The component library. This is the file you ship.
  site.css              The documentation site's frame. Not part of the library.
  icons.js              93 icons drawn on a 24px grid, injected as an SVG sprite
  site.js               Behaviour: menus, tabs, dialogs, toasts, tables, calendar, …
  charts.js             Bar, line, 100% stacked and waterfall charts in SVG
```

## Using it in a product

```html
<link rel="stylesheet" href="assets/tokens.css">
<link rel="stylesheet" href="assets/ledger.css">

<button class="btn btn--primary">Post journal</button>
```

Components get their look from classes and their state from ARIA attributes (`aria-pressed`, `aria-selected`, `aria-invalid`, `aria-current`). The markup you need for accessibility is the same markup that styles the component.

## Design decisions

- **One indigo for action and state.** The primary button is solid indigo, the secondary choice is an indigo outline, and indigo marks selection, focus and the current page.
- **White, lavender and apricot.** Lists and forms sit on white, the record you're reading on apricot cream, and navigation on a lavender rail. Every page title sits on a lilac-to-apricot band. Dark mode is a deep ink-violet with its own value for every token.
- **Pastel categories.** Six tint and text pairs (blue, plum, green, rose, peach, teal) for tags and avatars, each passing 4.5:1.
- **Newsreader + Inter + IBM Plex Mono.** The serif is for headings and large figures, the sans for the interface, and the mono for codes people copy.
- **Numbers first.** Tabular figures, right-aligned columns, real minus signs.
- **Chart palette checked by script.** The six series colours keep neighbouring colours distinct for red-green colour-blind readers in both themes.
- **Contrast checked.** The lightest text tone (`--ink-3`) passes 4.5:1 on white, cream and lavender, and input borders pass 3:1.

Theme and checklist progress are saved in `localStorage` in your browser only.
