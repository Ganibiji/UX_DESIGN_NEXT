/* =========================================================================
   HTML IMPORT · ORIGINAL FILE
   "Original file, restyled": your file character for character, with
   only its styles changed.

   1. hiSwapStylesheets() works on the file's text, not a re-written copy:
      it removes <style> blocks and stylesheet <link>s (and, unless kept,
      style="" attributes) and leaves every other character as it was.
      Comments, scripts and other raw text are skipped. document.js then
      inserts the styleguide just before </head>.
   2. hiFileCss() styles the page through what is already in it: tags,
      ARIA roles and common class names (Bootstrap-style and similar). No
      class or attribute has to be added, and every value is a token from
      the styleguide.
   3. hiConvertOriginal() returns the text and counts what the styleguide
      styles and what stays as it was, for the report.

   Provides: HI_SEL, HI_BTN, HI_TONE_KEYS, hiToneRules, hiSwapStylesheets,
   hiFileCss, hiConvertOriginal
   ========================================================================= */
'use strict';

/** What the styleguide styles in an original file. Used both for the CSS and for counting. */
const HI_SEL = {
  buttons: 'button, input[type="submit" i], input[type="button" i], input[type="reset" i], a.btn, a.button, [role="button"]',
  fields:
    'input:not([type="checkbox" i]):not([type="radio" i]):not([type="submit" i]):not([type="button" i]):not([type="reset" i])' +
    ':not([type="hidden" i]):not([type="image" i]):not([type="range" i]):not([type="color" i]), select, textarea',
  choices: 'input[type="checkbox" i], input[type="radio" i]',
  forms: 'form',
  tables: 'table',
  cards: 'article, fieldset, .card, .panel, .box, .tile, .widget, .well',
  alerts: '[role="alert"], .alert, .notice, .callout, .notification, .flash',
  badges: ':is(span, small, strong, b, em, mark, a):is(.badge, .tag, .chip, .pill, .lozenge, .label)',
  links: 'a:not(.btn):not(.button):not([role="button"])',
  images: 'img',
  headings: 'h1, h2, h3, h4, h5, h6'
};

/** Button variants, by the class names most UI kits use. */
const HI_BTN = {
  primary: 'button[type="submit" i], input[type="submit" i], .btn-primary, .button-primary, .is-primary, .btn.primary, .cta',
  danger: '.btn-danger, .button-danger, .is-danger, .btn.danger, .btn-delete',
  ghost: '.btn-link, .btn-ghost, .is-text, .is-ghost'
};

/** Status tones read from class names: bg-success, alert-warning, badge-danger, is-info, … */
const HI_TONE_KEYS = {
  info: ['info', 'primary'],
  success: ['success'],
  warning: ['warn', 'pending'],
  danger: ['danger', 'error']
};

/** One rule per tone for `base` (later tones win, so danger beats warning beats success). */
function hiToneRules(base, soft) {
  return Object.keys(HI_TONE_KEYS).map(tone => {
    const keys = HI_TONE_KEYS[tone].map(k => '[class*="' + k + '"]').join(', ');
    const bg = tone === 'info' ? '--primary-soft' : '--' + tone + '-soft';
    const fg = tone === 'info' ? '--primary-text' : '--' + tone + '-text';
    return ':is(' + base + '):is(' + keys + ') { background: var(' + bg + '); color: var(' + fg + ');' + (soft ? ' border-color: transparent;' : '') + ' }';
  }).join('\n');
}

/* ---------- 1. the file's text, stylesheets swapped ---------- */

/** One pass over the source in document order: comments, raw-text elements, <style> blocks and start tags. */
const HI_SCAN =
  /<!--[\s\S]*?-->|<(script|textarea|title|xmp|noscript|template)\b[^>]*>[\s\S]*?<\/\1\s*>|<style\b[^>]*>[\s\S]*?<\/style\s*>|<[a-zA-Z][\w:-]*(?:\s+[^\s"'>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*\s*\/?>/g;
/** One attribute at the start of a string: leading space, name, optional value. */
const HI_ATTR = /^(\s+)([^\s"'>\/=]+)(\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?/;

/** Value of one attribute in a start tag, or ''. */
function hiAttr(tag, name) {
  let rest = tag.replace(/^<[a-zA-Z][\w:-]*/, ''), m;
  while ((m = rest.match(HI_ATTR))) {
    if (m[2].toLowerCase() === name) return (m[3] || '').replace(/^\s*=\s*/, '').replace(/^["']|["']$/g, '');
    rest = rest.slice(m[0].length);
  }
  return '';
}

/** A start tag without its style="" attribute; every other character stays. */
function hiDropStyleAttr(tag) {
  const name = tag.match(/^<[a-zA-Z][\w:-]*/)[0];
  let rest = tag.slice(name.length), out = name, removed = 0, m;
  while ((m = rest.match(HI_ATTR))) {
    if (m[2].toLowerCase() === 'style') removed++;
    else out += m[0];
    rest = rest.slice(m[0].length);
  }
  return { tag: out + rest, removed };
}

/**
 * Removes the file's stylesheets (and inline styles unless kept) from its text.
 * @returns {{text:string, insertAt:number, stylesheets:number, inlineStyles:number}}
 *          insertAt: where the styleguide goes (before </head>, else before <body>, else the start)
 */
function hiSwapStylesheets(source, keepInlineStyles) {
  let stylesheets = 0, inlineStyles = 0;
  const GONE = '\u0000'; // marks a removed tag, so a line it leaves empty goes too
  let text = source.replace(HI_SCAN, (match, rawTag) => {
    if (rawTag || match.startsWith('<!--')) return match;
    if (/^<style\b/i.test(match)) {
      stylesheets++;
      return GONE;
    }
    if (/^<link\b/i.test(match)) {
      const rel = hiAttr(match, 'rel');
      if (/(^|\s)stylesheet(\s|$)/i.test(rel) || (/(^|\s)preload(\s|$)/i.test(rel) && /^style$/i.test(hiAttr(match, 'as')))) {
        stylesheets++;
        return GONE;
      }
      return match;
    }
    if (keepInlineStyles || !/\sstyle\s*=/i.test(match)) return match;
    const r = hiDropStyleAttr(match);
    inlineStyles += r.removed;
    return r.tag;
  });
  text = text.replace(/^[ \t]*\u0000[ \t]*\r?\n/gm, '').replace(/\u0000/g, '');
  const head = text.search(/<\/head\s*>/i), body = text.search(/<body\b/i);
  return { text, insertAt: head >= 0 ? head : body >= 0 ? body : 0, stylesheets, inlineStyles };
}

/* ---------- 2. styles for the page as it is ---------- */

/** The styleguide applied to tags, roles and common class names. */
function hiFileCss() {
  const S = HI_SEL;
  const heading = name => SG_TYPE.find(t => t[0] === name) || ['', 14, 600];
  const headings = [['h1', 'Display'], ['h2', 'Title 1'], ['h3', 'Title 2'], ['h4', 'Title 3'], ['h5', 'Body large'], ['h6', 'Body']]
    .map(([tag, n]) => tag + ' { font-size: ' + heading(n)[1] + 'px; font-weight: ' + Math.max(heading(n)[2], 600) + '; }').join('\n');
  return `
*, *::before, *::after { box-sizing: border-box; }
html { background: var(--bg); color: var(--text); font-family: var(--font); font-size: var(--ui-fs, 14px); -webkit-font-smoothing: antialiased; }
body { margin: 0; padding: 24px; line-height: 1.55; background: var(--bg); color: var(--text); font-family: var(--font); }
font { color: inherit; font-family: inherit; font-size: inherit; }

/* text */
h1, h2, h3, h4, h5, h6 { margin: 0 0 12px; line-height: 1.25; color: var(--text); }
${headings}
p { margin: 0 0 12px; }
small { color: var(--text-muted); }
ul, ol { margin: 0 0 12px; padding-left: 22px; }
hr { border: 0; border-top: 1px solid var(--border); margin: 24px 0; }
blockquote { margin: 0 0 16px; padding: 8px 16px; border-left: 3px solid var(--primary); color: var(--text-muted); }
code, kbd, samp { font-family: var(--mono); font-size: .92em; background: var(--surface-secondary); padding: 1px 5px; border-radius: var(--r-sm); }
pre { font-family: var(--mono); background: var(--surface-secondary); padding: 12px 14px; border-radius: var(--r-md); overflow: auto; }
img { max-width: 100%; height: auto; }
${S.links} { color: var(--primary-text); text-underline-offset: 2px; }

/* page structure */
body > header, header.navbar, nav.navbar, .navbar { display: flex; align-items: center; justify-content: space-between; gap: 16px;
  flex-wrap: wrap; margin: 0 0 24px; padding: 12px 24px; background: var(--surface); border-bottom: 1px solid var(--border); color: var(--text); }
body > :is(header, .navbar):first-child { margin: -24px -24px 24px; }
nav ul { list-style: none; display: flex; flex-wrap: wrap; gap: 2px; margin: 0; padding: 0; }
nav a { display: block; padding: 6px 10px; border-radius: var(--r); color: var(--text); text-decoration: none; font-weight: 500; }
nav a:hover { background: var(--surface-hover); }
body > footer, footer.footer { margin: 32px -24px -24px; padding: 20px 24px; color: var(--text-muted); border-top: 1px solid var(--border); font-size: 13px; }
.container, .container-fluid, .wrapper { max-width: 1160px; margin-inline: auto; }
.row { display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-start; }
.row > [class*="col"] { flex: 1 1 280px; min-width: 0; }

/* cards */
${S.cards} { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); box-shadow: var(--shadow-sm);
  padding: 20px; margin: 0 0 16px; min-width: 0; }
:is(${S.cards}) :is(${S.cards}) { box-shadow: none; background: var(--surface-secondary); padding: 14px; }
fieldset legend { font-weight: 600; padding: 0 6px; }

/* buttons */
${S.buttons} { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: var(--ctl-h, 36px);
  padding: 0 var(--ctl-px, 14px); margin: 0 6px 6px 0; border: 1px solid var(--border-strong); border-radius: var(--r-md);
  background: var(--surface); color: var(--text); font: inherit; font-weight: 500; text-decoration: none; cursor: pointer;
  transition: background var(--lab-dur, .15s) var(--lab-ease, ease), border-color var(--lab-dur, .15s) var(--lab-ease, ease); }
:is(${S.buttons}):hover { background: var(--surface-hover); }
${HI_BTN.primary} { background: var(--primary); border-color: var(--primary); color: var(--on-primary); }
:is(${HI_BTN.primary}):hover { background: var(--primary-hover); border-color: var(--primary-hover); }
${HI_BTN.danger} { background: var(--danger-soft); border-color: transparent; color: var(--danger-text); }
${HI_BTN.ghost} { background: transparent; border-color: transparent; color: var(--primary-text); }
:is(${S.buttons}):focus-visible, :is(${S.fields}):focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-soft); }

/* forms */
form { margin: 0; }
form :is(div, p):has(> label):has(> :is(input, select, textarea)) { margin: 0 0 14px; }
label { display: block; margin: 0 0 6px; font-size: 13px; font-weight: 500; color: var(--text); }
label:has(> :is(${S.choices})) { display: inline-flex; align-items: center; gap: 8px; margin: 0 16px 12px 0; font-size: inherit; font-weight: 400; }
${S.fields} { display: block; width: 100%; height: var(--ctl-h, 36px); padding: 0 10px; border: 1px solid var(--border-strong);
  border-radius: var(--r); background: var(--surface); color: var(--text); font: inherit; }
textarea { height: auto; min-height: 88px; padding: 8px 10px; resize: vertical; }
::placeholder { color: var(--text-subtle); }
${S.choices}, input[type="range" i] { accent-color: var(--primary); }
${S.choices} { width: 16px; height: 16px; margin: 0; }

/* tables */
table { width: 100%; border-collapse: separate; border-spacing: 0; margin: 0 0 16px; font-size: 13.5px; background: var(--surface);
  border: 1px solid var(--border); border-radius: var(--r-md); overflow: hidden; }
th { text-align: left; font-size: 12px; font-weight: 600; color: var(--text-muted); background: var(--surface-secondary); white-space: nowrap; }
th, td { padding: 10px 12px; border: 0; border-bottom: 1px solid var(--border); vertical-align: middle; }
tr:last-child > td { border-bottom: 0; }
tbody tr:hover > td { background: var(--surface-hover); }

/* badges */
${S.badges} { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 999px; font-size: 12px; font-weight: 500;
  line-height: 1.5; background: var(--neutral-soft); color: var(--neutral-text); text-decoration: none; }
${hiToneRules(S.badges)}

/* alerts */
${S.alerts} { display: block; padding: 12px 14px; margin: 0 0 16px; border-radius: var(--r-md); border: 1px solid var(--border);
  background: var(--primary-soft); color: var(--primary-text); }
${hiToneRules(S.alerts, true)}

@media (max-width: 640px) {
  body { padding: 16px; }
  body > :is(header, .navbar):first-child { margin: -16px -16px 20px; padding: 12px 16px; }
  body > footer, footer.footer { margin: 24px -16px -16px; padding: 16px; }
}
`;
}

/* ---------- 3. convert ---------- */

/**
 * "Original file, restyled".
 * @returns {{mode:'original', title, full:string, insertAt:number, report, warnings, options}}
 *          full is the file's text without its stylesheets; document.js inserts the styleguide at insertAt.
 */
function hiConvertOriginal(source, opt) {
  const swap = hiSwapStylesheets(source, opt.keepInlineStyles);
  const doc = new DOMParser().parseFromString(swap.text, 'text/html');
  const count = sel => doc.querySelectorAll(sel).length;
  let handlers = 0, unsafeUrls = 0, relativeImages = 0;
  doc.querySelectorAll('*').forEach(n => {
    for (const a of Array.from(n.attributes)) {
      if (/^on/i.test(a.name)) handlers++;
      else if (/^(href|src|action|formaction)$/i.test(a.name) && /^\s*(javascript|vbscript):/i.test(a.value)) unsafeUrls++;
    }
  });
  doc.querySelectorAll('img[src]').forEach(n => {
    if (!/^(https?:|data:|blob:)/i.test(n.getAttribute('src'))) relativeImages++;
  });
  const report = {
    mode: 'original',
    // styled by the styleguide
    buttons: count(HI_SEL.buttons), fields: count(HI_SEL.fields), choices: count(HI_SEL.choices), forms: count(HI_SEL.forms),
    tables: count(HI_SEL.tables), cards: count(HI_SEL.cards), badges: count(HI_SEL.badges), alerts: count(HI_SEL.alerts),
    links: count(HI_SEL.links), images: count(HI_SEL.images), headings: count(HI_SEL.headings),
    // changed in the text
    stylesheets: swap.stylesheets, inlineStyles: swap.inlineStyles, legacy: 0,
    // left exactly as they were
    scripts: count('script'), handlers, embeds: count('iframe, frame, object, embed'), unsafeUrls,
    keptInlineStyles: opt.keepInlineStyles ? count('[style]') : 0
  };
  const warnings = [];
  if (!(doc.body.textContent || '').trim() && !report.images) warnings.push('The file has no visible content.');
  if (relativeImages)
    warnings.push(pl(relativeImages, 'image') + ' use a path relative to the original file: they show when the downloaded file sits in the original’s folder, not in the preview.');
  if (report.keptInlineStyles)
    warnings.push('Inline styles are kept: colors and fonts set inline do not follow the styleguide.');
  return { mode: 'original', title: (doc.title || '').trim(), full: swap.text, insertAt: swap.insertAt, report, warnings, options: opt };
}
