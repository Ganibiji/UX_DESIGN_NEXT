# Getting the comparison into Figma

These files were generated from `../../index.html`, so they match the portal exactly.

## 1. Tokens → Figma variables

| File | Use with |
|---|---|
| `tokens-studio.json` | **Tokens Studio for Figma** plugin. One set per language and mode: `atlassian/light`, `atlassian/dark`, `fluent/light`, `fluent/dark`, `apple/light`, `apple/dark`. Load it, then use "Create variables" to turn the sets into Figma variable collections. |
| `tokens.dtcg.json` | Any importer that reads the W3C Design Tokens format. Colour tokens carry their light and dark values in `$extensions.mode`. |

Token names keep the portal's prefixes stripped: `--a-color-primary` becomes `color-primary` in the `atlassian` set.
Shadows are stored as CSS strings; recreate them as Figma effect styles if your importer doesn't convert them.

## 2. Components → editable Figma layers

Figma can't open HTML on its own. To get editable frames:

1. Install the **html.to.design** plugin in Figma.
2. Import `index.html` (the published artifact URL works too, once it is shared publicly or you upload the file).
3. Use the hash to pick a page, e.g. `index.html#button`, `#tabs`, `#pattern-crud`. Choose the style in the top bar first if you want only one language.

The imported layers are frames and text, not Figma components with variants. Bind them to the variables from step 1 to build a real library.

## 3. Reference

`../Design-System-Comparison.pdf` has every page (A3 landscape, light theme) for review sessions.
