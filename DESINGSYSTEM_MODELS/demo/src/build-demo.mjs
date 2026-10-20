// Builds demo/index.html: one self-contained file with the compiled Kestrel CSS
// and the icon sprite inlined. Run `npm run build:demo` after changing styles/.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");

const template = readFileSync(resolve(here, "demo.template.html"), "utf8");
// Compressed Sass output starts with a BOM (instead of @charset). Inline, the BOM
// sticks to the first selector and silently drops the first rule — strip it.
const css = readFileSync(resolve(root, "dist/kestrel.min.css"), "utf8").replace(/^﻿/, "");
const icons = readFileSync(resolve(root, "site/assets/icons.js"), "utf8");

const out = template
  .replace("/*__KESTREL_CSS__*/", () => css)
  .replace("/*__ICONS_JS__*/", () => icons);

writeFileSync(resolve(root, "demo/index.html"), out);
console.log(`demo/index.html written (${(out.length / 1024).toFixed(0)} KB)`);
