/* =========================================================================
   HTML IMPORT · PAGE
   #/import: choose or drop an HTML file (or try the sample), set the
   conversion options, read what was mapped and removed, then preview it
   in the side panel and download it. Replaces the loading route that
   manifest.js registered.

   Provides: HI_MAX_BYTES, hiConvert, hiReadFile, hiLoad, hiResultHTML,
   hiStyleguideHTML, #/import
   ========================================================================= */
'use strict';

/** Largest file accepted. */
const HI_MAX_BYTES = 5 * 1024 * 1024;

/** Converts HI.source with the current options. */
function hiConvert() {
  HI.result = HI.source ? convertHtml(HI.source, HI.options) : null;
}

/** Reads a File, checks it, converts it and redraws. */
function hiReadFile(file) {
  if (!file) return;
  if (file.size > HI_MAX_BYTES) {
    toast('error', 'File too large', file.name + ' is ' + (file.size / 1048576).toFixed(1) + ' MB. The limit is 5 MB.');
    return;
  }
  if (!/\.(html?|xhtml)$/i.test(file.name) && !/html/.test(file.type)) {
    toast('error', 'Not an HTML file', 'Choose a .html or .htm file.');
    return;
  }
  file.text().then(
    text => {
      if (!/<[a-z!]/i.test(text)) {
        toast('error', 'No HTML found', file.name + ' does not contain any HTML markup.');
        return;
      }
      hiLoad(file.name, text, file.size);
    },
    () => toast('error', 'Could not read the file', 'Try choosing it again.')
  );
}

/** Takes a page into the module, converts it and opens the preview. */
function hiLoad(name, text, size) {
  Object.assign(HI, { fileName: name, source: text, fileSize: size || new Blob([text]).size, view: 'converted' });
  hiConvert();
  renderRoute();
  openImportPanel();
  toast('success', 'Converted', name + ' now uses your ' + dnName() + ' styleguide.');
}

/** The result card: file, counts, cleanup and warnings. */
function hiResultHTML() {
  const r = HI.result.report;
  const stat = (label, n) => '<div><small>' + label + '</small><b>' + fmtN(n) + '</b></div>';
  const clean = [
    ['scripts', 'script'], ['stylesheets', 'stylesheet'], ['inlineStyles', 'inline style'], ['handlers', 'event handler'],
    ['embeds', 'embedded frame'], ['unsafeUrls', 'unsafe link'], ['legacy', 'legacy markup item']
  ].filter(([k]) => r[k]);
  return (
    '<div class="hi-file"><span class="doc-ico">' + icon('file', 18) + '</span><div style="flex:1;min-width:0"><b>' + esc(HI.fileName) +
    '</b><small>' + (HI.fileSize / 1024).toFixed(1) + ' KB' + (HI.result.title ? ' · ' + esc(HI.result.title) : '') +
    '</small></div>' + btn('Remove', 'x', 'ghost sm', 'type="button" data-hi-clear') + '</div>' +
    '<p class="hi-h">Mapped to the design system</p><div class="hi-stats">' +
    stat('Buttons', r.buttons) + stat('Form fields', r.fields) + stat('Checkboxes and radios', r.choices) + stat('Tables', r.tables) +
    stat('Cards', r.cards) + stat('Badges', r.badges) + stat('Alerts', r.alerts) + stat('Links', r.links) + '</div>' +
    '<p class="hi-h">Cleaned up</p><div class="hi-clean">' +
    (clean.length
      ? clean.map(([k, word]) => badge(pl(r[k], word) + ' removed', k === 'scripts' || k === 'handlers' || k === 'unsafeUrls' ? 'danger' : 'neutral')).join('')
      : '<span class="muted">Nothing needed removing.</span>') +
    '</div>' +
    (HI.result.warnings.length
      ? '<div class="alert alert-warning mt-16">' + icon('alert', 16) + '<span>' + HI.result.warnings.map(esc).join('<br>') + '</span></div>'
      : '')
  );
}

/** The styleguide the page is converted to. */
function hiStyleguideHTML() {
  const tok = dnThemeTokens();
  const lang = LABX.LANGS.find(l => l[0] === LABX.state.lang);
  const sw = ['--primary', '--surface', '--text', '--success', '--danger'].filter(k => tok[k]);
  return (
    '<div class="hi-sg"><div class="hi-sw">' + sw.map(k => '<i title="' + k + '" style="background:' + esc(tok[k]) + '"></i>').join('') +
    '</div><b>' + esc(dnName()) + '</b><span class="badge">v' + esc(dnMeta.version || '1.0.0') + '</span></div>' +
    '<dl class="hi-dl"><dt>Design language</dt><dd>' + esc(lang ? lang[1] : LABX.state.lang) + '</dd>' +
    '<dt>App theme</dt><dd>' + esc((HI_THEMES.find(t => t[0] === themeKeyOfApp()) || [])[1] || '') + '</dd>' +
    '<dt>Font</dt><dd>' + esc((tok['--font'] || '').split(',')[0].replace(/["']/g, '')) + '</dd>' +
    '<dt>Corner radius</dt><dd>' + esc(tok['--r-md'] || '') + '</dd></dl>' +
    '<p class="muted mt-8" style="font-size:12.5px">Change the theme, brand or design lab and the preview follows. ' +
    '<a class="link" href="#/design/styleguide">Open styleguide</a></p>'
  );
}

ROUTES.import = () => ({
  title: 'Import HTML',
  nav: 'import',
  crumbs: [['Design', 'design'], ['Import HTML']],
  sub:
    'Convert an HTML page to your design system, preview it in the side panel and download it. ' +
    'Scripts and the page’s own styles are removed; buttons, fields, tables, cards, badges and alerts take your styleguide.',
  actions: HI.result
    ? btn('Preview', 'eye', '', 'type="button" data-hi-preview') + btn('Download', 'save', 'primary', 'type="button" data-hi-save')
    : '',
  body:
    '<div class="hi-layout"><div class="stack">' +
    card(
      HI.result ? 'Converted page' : 'Choose an HTML file',
      HI.result
        ? hiResultHTML()
        : '<label class="hi-drop" data-hi-drop><input type="file" accept=".html,.htm,.xhtml,text/html" data-hi-input hidden>' +
            '<span class="hi-drop-ico">' + icon('inbox', 24) + '</span><b>Drop an HTML file here, or click to choose</b>' +
            '<small>.html or .htm, up to 5 MB. Scripts never run: they are removed, and the preview is sandboxed.</small></label>' +
            '<div class="row mt-16" style="gap:8px">' + btn('Try a sample page', 'file', '', 'type="button" data-hi-sample') + '</div>',
      {
        id: 'hiResult',
        sub: HI.result ? 'Open the preview to compare it with the original' : 'The page is converted in your browser; nothing is uploaded'
      }
    ) +
    '</div><div class="stack">' +
    card(
      'Options',
      '<div class="hi-opts">' +
        F({ name: 'keepInlineStyles', label: 'Keep inline styles', type: 'toggle', span: 12, value: HI.options.keepInlineStyles,
            hint: 'For layout the design system does not cover. Inline colors and fonts then override the styleguide.' }) +
        F({ name: 'keepClasses', label: 'Keep original class names', type: 'toggle', span: 12, value: HI.options.keepClasses,
            hint: 'Useful if you will add the page’s own CSS back later.' }) +
        '</div>'
    ) +
    card('Styleguide', hiStyleguideHTML(), { sub: 'The page is converted to' }) +
    '</div></div>',
  mount(page) {
    const input = $('[data-hi-input]', page);
    if (input) input.addEventListener('change', () => hiReadFile(input.files[0]));
    const drop = $('[data-hi-drop]', page);
    if (drop) {
      drop.addEventListener('dragover', e => {
        e.preventDefault();
        drop.classList.add('over');
      });
      drop.addEventListener('dragleave', () => drop.classList.remove('over'));
      drop.addEventListener('drop', e => {
        e.preventDefault();
        drop.classList.remove('over');
        hiReadFile(e.dataTransfer.files[0]);
      });
    }
    page.addEventListener('click', e => {
      if (e.target.closest('[data-hi-sample]')) hiLoad(HI_SAMPLE_NAME, HI_SAMPLE);
      else if (e.target.closest('[data-hi-preview]')) openImportPanel();
      else if (e.target.closest('[data-hi-save]')) hiDownload();
      else if (e.target.closest('[data-hi-clear]')) {
        Object.assign(HI, { fileName: '', fileSize: 0, source: '', result: null });
        closeImportPanel();
        renderRoute();
      }
    });
    // Options re-convert at once and refresh an open preview.
    page.addEventListener('change', e => {
      const t = e.target.closest('[name="keepInlineStyles"],[name="keepClasses"]');
      if (!t) return;
      HI.options[t.name] = t.checked;
      if (!HI.source) return;
      hiConvert();
      $('#hiResult .card-body', page).innerHTML = hiResultHTML();
      refreshImportPanel();
    });
  }
});
