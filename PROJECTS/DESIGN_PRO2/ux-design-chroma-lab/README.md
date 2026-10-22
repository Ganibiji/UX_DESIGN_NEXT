# Chroma UX Component Lab

A standalone lab in the Chroma colour-block language, a redesign of ux-design-fluent-lab. Open index.html; every page is a standalone HTML file that loads assets/.

Chroma rules:
- Neutrals have a violet tint. There are no greys and no white-on-grey boxes. The accent colours are violet, coral, teal, amber and pink.
- Surfaces are flat. There are no grey shadows. Only layers that float (menus, dialogs, toasts) get a soft violet glow.
- There are no boxed card grids. Sections are colour bands, variations are listed as specimen rows, link lists are open rows with an arrow, and cards, KPIs and kanban lanes are marked with a colour rail.
- Controls are pills: tinted secondary buttons and a gradient primary. Fields are tinted, with a violet border and glow on focus.
- Type: Plus Jakarta Sans for text, Space Grotesk for display, JetBrains Mono for code.

Files:
- assets/tokens.css: Chroma tokens (--ch-*) and semantic aliases, light / dark / high contrast
- assets/components.css: component rules, ending with the Chroma layer (colour rails, hue rotation)
- assets/lab.css: lab chrome (violet index rail, gradient page banner, colour-banded sections)
- assets/css-source.js: a copy of tokens.css and components.css for the Code sections. Regenerate it after editing either file.
- foundations/, design-languages/chroma.html, components/ (37), patterns/ (10), enterprise/ (7), responsive.html, content-guidelines.html

The engine still uses the class name `.sys-f` internally as its key for the single language.

Favourites and preferences are stored in this browser only, under their own keys, so they don't mix with the Fluent lab.
