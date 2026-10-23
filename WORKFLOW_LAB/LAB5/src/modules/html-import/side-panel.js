/* =========================================================================
   HTML IMPORT · PREVIEW SIDE PANEL
   A docked, resizable panel on the right that shows the converted page
   (or the original) in a sandboxed frame. Toolbar: converted / original,
   light / dark / high contrast, desktop / tablet / mobile width.
   Footer: open in a new tab, download. Esc or the close button hides it.

   The frame has an empty sandbox: nothing in the page can run, submit
   forms or open windows, even in the original view.

   Provides: HI, HI_PANEL_KEY, HI_WIDTHS, HI_THEMES, hiTheme,
   themeKeyOfApp, hiCurrentDocument, hiOriginalDocument, segment, hiPanel,
   hiDrawnKey, hiStyleKey, setPanelWidth, openImportPanel,
   closeImportPanel, refreshImportPanel, hiDownload, hiOpenInTab
   ========================================================================= */
'use strict';

/** Module state, shared with page.js. Kept in memory: an import lasts for the session. */
const HI = {
  fileName: '', // name of the imported file
  fileSize: 0,
  source: '', // original HTML
  options: Object.assign({}, HI_DEFAULT_OPTIONS),
  result: null, // convertHtml() output
  view: 'converted', // 'converted' | 'original'
  theme: null, // 'light' | 'dark' | 'hc'; null follows the app theme
  width: 'desktop'
};

/** Saved panel width (px). */
const HI_PANEL_KEY = 'kagami-import-panel';
const HI_WIDTHS = [['desktop', 'Desktop', null], ['tablet', 'Tablet', 768], ['mobile', 'Mobile', 390]];
const HI_THEMES = [['light', 'Light'], ['dark', 'Dark'], ['hc', 'High contrast']];

/** Theme the converted page is shown and downloaded in. */
const hiTheme = () => HI.theme || themeKeyOfApp();
function themeKeyOfApp() {
  const t = document.documentElement.getAttribute('data-theme');
  return t === 'dark' || t === 'hc' ? t : 'light';
}

/** The converted page as a full document. */
const hiCurrentDocument = () => hiBuildDocument(HI.result, hiTheme());

/** The file for the Original view: its own styles kept; scripts, frames and inline handlers removed (they could not run in the sandbox anyway). */
function hiOriginalDocument() {
  const doc = new DOMParser().parseFromString(HI.source, 'text/html');
  doc.querySelectorAll('script,noscript,iframe,frame,object,embed').forEach(n => n.remove());
  doc.querySelectorAll('*').forEach(n => {
    for (const a of Array.from(n.attributes)) if (/^on/i.test(a.name)) n.removeAttribute(a.name);
  });
  return '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
}

const segment = (key, list, current) =>
  '<div class="hi-seg" role="group">' +
  list.map(([v, label]) => '<button type="button" data-hi-' + key + '="' + v + '" aria-pressed="' + (v === current) + '">' + esc(label) + '</button>').join('') +
  '</div>';

/** Creates the panel once and wires its controls. */
function hiPanel() {
  let panel = $('#hiPanel');
  if (panel) return panel;
  panel = el(
    '<aside class="hi-panel" id="hiPanel" aria-label="Import preview" hidden>' +
      '<div class="hi-resize" title="Drag to resize" aria-hidden="true"></div>' +
      '<div class="hi-head"><span class="doc-ico">' + icon('eye', 18) + '</span>' +
      '<div style="flex:1;min-width:0"><h3>Preview</h3><small data-hi-name></small></div>' +
      '<button class="btn btn-ghost btn-sm btn-icon" type="button" data-hi-close aria-label="Close preview">' + icon('x', 16) + '</button></div>' +
      '<div class="hi-bar" data-hi-bar></div>' +
      '<div class="hi-stage"><iframe class="hi-frame" sandbox="" title="Imported page preview"></iframe></div>' +
      '<div class="hi-foot"><small data-hi-note></small><span class="spacer"></span>' +
      btn('Open in new tab', 'export', 'sm', 'type="button" data-hi-tab') +
      btn('Download', 'save', 'primary sm', 'type="button" data-hi-download') +
      '</div></aside>'
  );
  document.body.append(panel);

  panel.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.hiClose !== undefined) return closeImportPanel();
    if (b.dataset.hiTab !== undefined) return hiOpenInTab();
    if (b.dataset.hiDownload !== undefined) return hiDownload();
    if (b.dataset.hiView) HI.view = b.dataset.hiView;
    else if (b.dataset.hiTheme) HI.theme = b.dataset.hiTheme;
    else if (b.dataset.hiWidth) HI.width = b.dataset.hiWidth;
    else return;
    refreshImportPanel();
  });

  // Drag the left edge to resize; the width is remembered.
  const handle = $('.hi-resize', panel);
  handle.addEventListener('pointerdown', e => {
    e.preventDefault();
    handle.classList.add('on');
    handle.setPointerCapture(e.pointerId);
    const frame = $('.hi-frame', panel);
    frame.style.pointerEvents = 'none'; // keep receiving moves over the frame
    const move = ev => setPanelWidth(innerWidth - ev.clientX);
    const up = () => {
      handle.classList.remove('on');
      frame.style.pointerEvents = '';
      handle.removeEventListener('pointermove', move);
      store(HI_PANEL_KEY, String(parseInt(getComputedStyle(document.documentElement).getPropertyValue('--hi-w'), 10) || 620));
    };
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', up, { once: true });
  });
  setPanelWidth(parseInt(store(HI_PANEL_KEY), 10) || Math.round(innerWidth * 0.48));

  // Esc closes the panel unless a dialog or menu is open.
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !panel.hidden && !modalStack.length && !menuEl) closeImportPanel();
  });
  // The panel belongs to the Import page.
  window.addEventListener('hashchange', () => {
    if (!panel.hidden && (!currentRoute || currentRoute.name !== 'import')) closeImportPanel();
  });
  // Follow theme, brand and design lab changes. Building the page switches data-theme briefly
  // (dnThemeTokens), so redraw only when the resolved styleguide really changed.
  let timer = 0;
  const watch = new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (!panel.hidden && hiStyleKey() !== hiDrawnKey) refreshImportPanel();
    }, 120);
  });
  watch.observe(document.documentElement, { attributes: true });
  watch.observe(document.head, { childList: true, subtree: true, characterData: true });
  return panel;
}

/** What the converted page depends on: the active theme and its resolved tokens. */
let hiDrawnKey = '';
const hiStyleKey = () => hiTheme() + JSON.stringify(dnThemeTokens());

function setPanelWidth(px) {
  const w = clamp(Math.round(px), 380, Math.max(380, innerWidth - 320));
  document.documentElement.style.setProperty('--hi-w', w + 'px');
}

/** Shows the panel with the current import. */
function openImportPanel() {
  if (!HI.result) return;
  const panel = hiPanel();
  if (typeof setLabDock === 'function' && !$('#labDock').hidden) setLabDock(false); // one docked panel at a time
  panel.hidden = false;
  document.documentElement.setAttribute('data-hipanel', 'open');
  refreshImportPanel();
  $('[data-hi-close]', panel).focus();
}

function closeImportPanel() {
  const panel = $('#hiPanel');
  if (!panel || panel.hidden) return;
  panel.hidden = true;
  document.documentElement.removeAttribute('data-hipanel');
  const opener = $('[data-hi-preview]');
  if (opener) opener.focus();
}

/** Redraws the toolbar and the frame from HI. */
function refreshImportPanel() {
  const panel = $('#hiPanel');
  if (!panel || !HI.result) return;
  const converted = HI.view === 'converted';
  $('[data-hi-name]', panel).textContent = HI.fileName + (HI.result.title ? ' · ' + HI.result.title : '');
  $('[data-hi-bar]', panel).innerHTML =
    segment('view', [['converted', 'Converted'], ['original', 'Original']], HI.view) +
    (converted ? segment('theme', HI_THEMES, hiTheme()) : '') +
    segment('width', HI_WIDTHS, HI.width);
  $('[data-hi-note]', panel).textContent = converted
    ? dnName() + ' v' + (dnMeta.version || '1.0.0') + ' styleguide'
    : 'Original file, scripts blocked';
  const frame = $('.hi-frame', panel);
  const w = HI_WIDTHS.find(x => x[0] === HI.width)[2];
  frame.style.width = w ? w + 'px' : '100%';
  frame.srcdoc = converted ? hiCurrentDocument() : hiOriginalDocument();
  hiDrawnKey = hiStyleKey();
  $('[data-hi-tab]', panel).disabled = !converted;
  $('[data-hi-download]', panel).disabled = !converted;
}

/** Saves the converted page in the theme shown. */
function hiDownload() {
  if (!HI.result) return;
  const name = hiFileName(HI.fileName, hiTheme());
  dnDownload(name, 'text/html', hiCurrentDocument());
  toast('success', 'Download ready', 'Saved ' + name + ' in your ' + dnName() + ' styleguide.');
}

/** Opens the converted page in a new tab (it has no scripts). */
function hiOpenInTab() {
  if (!HI.result) return;
  const url = URL.createObjectURL(new Blob([hiCurrentDocument()], { type: 'text/html' }));
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
