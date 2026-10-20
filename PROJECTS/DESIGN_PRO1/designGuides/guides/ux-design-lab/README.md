# Enterprise UX Component Lab

Open `index.html` in a browser. Every page is a standalone HTML file that loads the shared assets in `assets/`.

## Structure
- `index.html`, `foundations.html`, `design-languages.html`, `responsive.html`, `content-guidelines.html`, `comparison.html`
- `foundations/` colors, typography, spacing, grid, elevation, icons, motion, accessibility
- `design-languages/` atlassian, fluent, apple, enterprise, material
- `components/` 37 components, each with the same 21 sections
- `patterns/` 10 patterns · `enterprise/` 7 use cases

## Shared assets
- `assets/tokens.css`: five design languages × light / dark / high contrast
- `assets/components.css`: components (read semantic tokens only) + size, density and colour wrappers
- `assets/lab.css`: the lab's own chrome
- `assets/core.js`, `legacy.js`: component behaviour and builders
- `assets/engine.js`: navigation, search, favorites, Architect view, explorer, 21-section generator
- `assets/specs1-3.js`: component variation specs · `pages.js`: other pages and navigation

Favorites and preferences are stored in this browser's localStorage only.
