# Enterprise UX Architecture Lab (v3): Figma hand-off

Generated from `../../../index-v3.html`.

## What's here

| Path | What it is | How to use in Figma |
|---|---|---|
| `frames/` | 98 PNG frames, one per page, 1440px wide, full length, light theme. Numbered in demo order (overview → foundations → components → patterns → guidelines → architecture). | Select all files and drag them onto a Figma page. Each becomes an image frame named after the page. Good for review boards, comments and presentations. |
| `tokens-studio.json` | All design tokens, one set per language and mode (`atlassian/light`, `atlassian/dark`, `fluent/…`, `apple/…`). | Tokens Studio for Figma plugin → load file → "Create variables". |
| `tokens.dtcg.json` | Same tokens in W3C Design Tokens format; colours carry light and dark values. | Any DTCG-compatible variables importer. |
| `../Enterprise-UX-Architecture-Lab.pdf` | 316-page A3 landscape document of every page. | For review and sign-off; share outside Figma. |

## Editable layers

The PNG frames are pictures, not editable layers. To get editable frames and text:

1. Install the **html.to.design** plugin.
2. Import `index-v3.html` (or the published page once it's shared).
3. Add the page id to the address to import one page, e.g. `index-v3.html#button`, `#pattern-workflow`, `#decision`. Pick a language in the top bar first to import only that language.

Then bind the imported layers to the variables from the token files to turn them into a real component library.
