/* =========================================================================
   HTML IMPORT · CONVERTER
   Two output modes (HI_MODES):

   original  Your file, character for character, with only its stylesheets
             swapped for the styleguide. See original-file.js.
   clean     A new page with the content only. This file:
             1. Cleans it: scripts, stylesheets, embedded frames, event
                handlers and javascript: links are removed, so nothing from
                the file can run.
             2. Strips its own look: inline styles, class names and legacy
                presentational tags and attributes (optional, see the
                options).
             3. Maps what is left to design-system classes (kg-*): buttons,
                fields, choices, tables, cards, badges, alerts, header,
                navigation, footer and simple rows / columns, read from
                tags, roles and the old class names (Bootstrap-style names
                are recognised).
             stylesheet.js and document.js turn the result into a page in
             the current styleguide.

   Pure functions, no DOM side effects.

   Provides: HI_DEFAULT_OPTIONS, HI_MODES, hiTone, convertHtml
   ========================================================================= */
'use strict';

/** Options shown on the Import page. */
const HI_DEFAULT_OPTIONS = {
  mode: 'original', // 'original' keeps your file as it is; 'clean' keeps the content only
  keepInlineStyles: false, // clean mode: keep style="" attributes (layout the design system does not cover)
  keepClasses: false // clean mode: keep the original class names next to the design-system ones
};

/** Output modes, for the options UI: [value, label, explanation]. */
const HI_MODES = [
  ['original', 'Original file, restyled', 'Your file exactly as it is: same content, structure and scripts. Only its stylesheets are replaced by your styleguide.'],
  ['clean', 'Clean page', 'Content only, in a new page: scripts, the file’s own classes and embedded frames are removed.']
];

/** Removed with their content: they could run code, load other content or restyle the page. */
const HI_DROP = 'script,noscript,style,link,meta,base,iframe,frame,frameset,object,embed,applet,template,portal';
/** Legacy presentational tags: replaced by their content. */
const HI_UNWRAP = 'font,center,big,blink,marquee';
/** Legacy presentational attributes. */
const HI_LEGACY_ATTRS = ['bgcolor', 'color', 'face', 'align', 'valign', 'border', 'cellpadding', 'cellspacing', 'background', 'hspace', 'vspace'];
/** Attributes that hold a URL and could hide a script. */
const HI_URL_ATTRS = ['href', 'src', 'action', 'formaction', 'xlink:href', 'poster', 'data', 'srcset'];

/**
 * Reads a status tone from old class names and the visible text.
 * @returns {'danger'|'warning'|'success'|'info'|''}
 */
function hiTone(className, text) {
  const s = className + ' ' + String(text || '').toLowerCase();
  if (/danger|error|fail|overdue|reject|out of stock|critical|cancel|\bred\b/.test(s)) return 'danger';
  if (/warn|pending|\bdue\b|\blow\b|hold|review|\byellow\b|\borange\b/.test(s)) return 'warning';
  if (/success|\bok\b|done|active|paid|complete|approved|in stock|healthy|\bgreen\b/.test(s)) return 'success';
  if (/info|\bnew\b|note|primary|draft|\bblue\b/.test(s)) return 'info';
  return '';
}

/**
 * Converts an HTML page.
 * @param {string} source  the file's HTML
 * @param {object} [options] see HI_DEFAULT_OPTIONS
 * @returns {{mode:string, title:string, html:string, report:object, warnings:string[], options:object}}
 *          clean: html is the converted <body> content; report counts what was mapped and removed.
 *          original: see hiConvertOriginal (original-file.js).
 */
function convertHtml(source, options) {
  const opt = Object.assign({}, HI_DEFAULT_OPTIONS, options);
  if (opt.mode === 'original') return hiConvertOriginal(String(source || ''), opt);
  const doc = new DOMParser().parseFromString(String(source || ''), 'text/html');
  const report = {
    // mapped to the design system
    buttons: 0, fields: 0, choices: 0, forms: 0, tables: 0, cards: 0, badges: 0, alerts: 0, links: 0, images: 0, headings: 0,
    // removed or neutralised
    scripts: 0, stylesheets: 0, embeds: 0, handlers: 0, unsafeUrls: 0, inlineStyles: 0, legacy: 0
  };
  const warnings = [];
  const title = (doc.title || '').trim();

  // 1. Remove what must never run, and the file's own stylesheets.
  doc.querySelectorAll(HI_DROP).forEach(node => {
    const tag = node.localName;
    if (tag === 'script' || tag === 'noscript') report.scripts++;
    else if (tag === 'style' || (tag === 'link' && /stylesheet/i.test(node.getAttribute('rel') || ''))) report.stylesheets++;
    else if (/^(iframe|frame|frameset|object|embed|applet|portal)$/.test(tag)) report.embeds++;
    node.remove();
  });

  // 2. Legacy tags such as <font> and <center> give way to their content.
  doc.querySelectorAll(HI_UNWRAP).forEach(node => {
    node.replaceWith(...node.childNodes);
    report.legacy++;
  });

  // 3. Clean attributes. Old class names are remembered first: the mapping below reads them.
  const oldClass = new Map();
  [doc.body, ...doc.body.querySelectorAll('*')].forEach(node => {
    oldClass.set(node, (node.getAttribute('class') || '').toLowerCase());
    for (const attr of Array.from(node.attributes)) {
      const name = attr.name.toLowerCase();
      if (name.startsWith('on')) {
        node.removeAttribute(attr.name);
        report.handlers++;
      } else if (HI_URL_ATTRS.includes(name) && /^\s*(javascript|vbscript|data:text\/html)/i.test(attr.value)) {
        if (name === 'href') node.setAttribute('href', '#');
        else node.removeAttribute(attr.name);
        report.unsafeUrls++;
      } else if (name === 'style' && !opt.keepInlineStyles) {
        node.removeAttribute('style');
        report.inlineStyles++;
      } else if (name === 'class' && !opt.keepClasses) {
        node.removeAttribute('class');
      } else if (HI_LEGACY_ATTRS.includes(name) && node.localName !== 'img') {
        node.removeAttribute(attr.name);
        report.legacy++;
      }
    }
  });

  // 4. Map to design-system classes.
  const all = selector => Array.from(doc.body.querySelectorAll(selector));
  const cls = node => oldClass.get(node) || '';
  const text = node => (node.textContent || '').trim();
  const add = (node, ...names) => node.classList.add(...names);
  const has = (node, name) => node.classList.contains(name);

  // Page structure
  all('header').forEach(n => add(n, 'kg-header'));
  all('nav').forEach(n => add(n, 'kg-nav'));
  all('footer').forEach(n => add(n, 'kg-footer'));
  all('main').forEach(n => add(n, 'kg-main'));
  all('div,section').forEach(n => {
    const c = cls(n);
    if (/\b(container|container-fluid|wrapper|wrap)\b/.test(c)) add(n, 'kg-container');
    else if (/\b(row|d-flex|flex|grid|columns|cols|hstack)\b/.test(c)) add(n, 'kg-row');
    else if (/\bcol(-[\w-]+)?\b|\bcolumn\b|\bcell\b/.test(c)) add(n, 'kg-col');
  });

  // Alerts first: an alert styled as a box should not become a card.
  all('div,p,section,aside').forEach(n => {
    const c = cls(n), role = n.getAttribute('role');
    if (/\b(alert|notice|notification|message|callout|banner|flash|toast)\b/.test(c) || role === 'alert' || role === 'status') {
      const tone = hiTone(c, text(n)) || 'info';
      add(n, 'kg-alert', 'kg-alert--' + tone);
      report.alerts++;
    }
  });

  // Cards: <article>, <aside>, <fieldset> and boxes named card / panel / box / tile / widget / well.
  all('article,aside,fieldset,div,section').forEach(n => {
    if (has(n, 'kg-alert') || has(n, 'kg-row') || has(n, 'kg-container')) return;
    const c = cls(n), tag = n.localName;
    const isCard = tag === 'article' || tag === 'aside' || tag === 'fieldset' || /\b(card|panel|box|tile|widget|well|paper)\b/.test(c);
    if (isCard) {
      add(n, 'kg-card');
      if (n.parentElement && n.parentElement.closest('.kg-card')) add(n, 'kg-card--nested');
      report.cards++;
    } else if (tag === 'section') add(n, 'kg-section');
  });

  // Badges: short labels named badge / tag / chip / pill / label / status.
  all('span,small,em,strong,b,mark,a').forEach(n => {
    if (!/\b(badge|tag|chip|pill|label|status|lozenge)\b/.test(cls(n))) return;
    const tone = hiTone(cls(n), text(n));
    add(n, 'kg-badge');
    if (tone) add(n, 'kg-badge--' + tone);
    report.badges++;
  });

  // Buttons: <button>, button-type inputs, and links styled or marked as buttons.
  const firstInForm = new Set();
  all('button,input[type=submit],input[type=button],input[type=reset],a').forEach(n => {
    const c = cls(n), tag = n.localName;
    if (tag === 'a' && !/\b(btn|button)\b/.test(c) && n.getAttribute('role') !== 'button') return;
    const type = (n.getAttribute('type') || '').toLowerCase();
    const label = (n.value || text(n)).toLowerCase();
    const form = n.closest('form');
    // A <button> without a type submits its form: the first such button counts as the main action.
    const implicitSubmit = tag === 'button' && !type && form && !firstInForm.has(form);
    if (implicitSubmit) firstInForm.add(form);
    let variant = '';
    if (/danger|delete|destroy|remove|error/.test(c) || /^(delete|remove)\b/.test(label)) variant = 'danger';
    else if (/primary|cta|\bmain\b|submit/.test(c) || type === 'submit' || implicitSubmit) variant = 'primary';
    else if (/\b(btn-link|link|ghost|text|plain)\b/.test(c)) variant = 'ghost';
    add(n, 'kg-btn');
    if (variant) add(n, 'kg-btn--' + variant);
    n.classList.remove('kg-badge', 'kg-badge--success', 'kg-badge--warning', 'kg-badge--danger', 'kg-badge--info');
    report.buttons++;
  });

  // Fields and choices, with the wrapper that holds a control and its label.
  all('input,select,textarea').forEach(n => {
    const tag = n.localName, type = (n.getAttribute('type') || 'text').toLowerCase();
    if (tag === 'input' && /^(submit|button|reset|hidden|image)$/.test(type)) return;
    const parent = n.parentElement;
    if (tag === 'input' && /^(checkbox|radio)$/.test(type)) {
      add(n, 'kg-check');
      if (parent && parent.localName === 'label') add(parent, 'kg-choice');
      report.choices++;
      return;
    }
    add(n, tag === 'select' ? 'kg-select' : tag === 'textarea' ? 'kg-textarea' : type === 'range' ? 'kg-range' : 'kg-input');
    report.fields++;
    if (parent && !/^(form|label|body)$/.test(parent.localName) && parent.querySelector('label') &&
        parent.querySelectorAll('input,select,textarea').length <= 2) add(parent, 'kg-field');
  });
  all('label').forEach(n => {
    if (!has(n, 'kg-choice')) add(n, 'kg-label');
  });
  all('form').forEach(n => {
    add(n, 'kg-form');
    report.forms++;
  });

  // Tables, in a scroll wrapper.
  all('table').forEach(n => {
    add(n, 'kg-table');
    const wrap = doc.createElement('div');
    wrap.className = 'kg-table-wrap';
    n.replaceWith(wrap);
    wrap.append(n);
    report.tables++;
  });

  // Links, images and headings.
  all('a').forEach(n => {
    if (has(n, 'kg-btn') || has(n, 'kg-badge')) return;
    add(n, 'kg-link');
    report.links++;
  });
  let relativeImages = 0;
  all('img').forEach(n => {
    report.images++;
    const src = n.getAttribute('src') || '';
    if (src && !/^(https?:|data:|blob:)/i.test(src)) relativeImages++;
  });
  report.headings = all('h1,h2,h3,h4,h5,h6').length;

  // 5. Things the user should know.
  if (!text(doc.body) && !report.images) warnings.push('The file has no visible content.');
  if (relativeImages)
    warnings.push(pl(relativeImages, 'image') + ' use a path relative to the original file and will not show. Use full web addresses or embed them.');
  if (opt.keepInlineStyles && report.inlineStyles === 0 && /style=/i.test(source))
    warnings.push('Inline styles are kept: colors and fonts set inline do not follow the styleguide.');

  report.mode = 'clean';
  return { mode: 'clean', title, html: doc.body.innerHTML.trim(), report, warnings, options: opt };
}
