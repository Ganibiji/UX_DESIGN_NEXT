/* =========================================================================
   HTML IMPORT · DOCUMENT
   Builds the page that is previewed and downloaded, with the styleguide's
   tokens for every theme, the design-system styles and the same web fonts
   as the app.

   Original mode: your file's text with the styleguide inserted just
   before </head>, where its stylesheets were (original-file.js removed
   them). Nothing else in the text changes, and the preview shows exactly
   this file.
   Clean mode: a new page around the converted content, with no scripts.

   Provides: hiFontsLink, hiStyleBlock, hiStripScripts, hiBuildDocument,
   hiFileName
   ========================================================================= */
'use strict';

/** The app's Google Fonts stylesheet link, so the page loads the styleguide's fonts. */
function hiFontsLink() {
  const link = document.querySelector('link[href*="fonts.googleapis.com/css"]');
  return link ? '<link rel="stylesheet" href="' + esc(link.getAttribute('href')) + '">' : '';
}

/**
 * The styleguide as one block: fonts link + <style id="kg-styleguide">.
 * @param {string} css            hiDocCss() (clean) or hiFileCss() (original)
 * @param {string} [defaultTheme] original mode: tokens of this theme on plain :root
 */
function hiStyleBlock(css, defaultTheme) {
  const name = dnName().replace(/\*\//g, ''), version = dnMeta.version || '1.0.0';
  return (
    hiFontsLink() +
    '\n<style id="kg-styleguide">\n' +
    '/* Styleguide: ' + name + ' v' + version + ' (Kagami design system). Set data-theme="light", "dark" or "hc" on <html> to switch theme. */\n' +
    hiTokenCss(defaultTheme) + '\n' + css +
    '</style>\n'
  );
}

/** A copy of a page without scripts or event handlers: for "Open in new tab", which shares this app's origin. */
function hiStripScripts(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script,noscript').forEach(n => n.remove());
  doc.querySelectorAll('*').forEach(n => {
    for (const a of Array.from(n.attributes)) if (/^on/i.test(a.name)) n.removeAttribute(a.name);
  });
  return '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
}

/**
 * Builds the page.
 * @param {object} result                 from convertHtml
 * @param {'light'|'dark'|'hc'} theme     theme the page opens in (all three are included)
 * @returns {string} a complete HTML document
 */
function hiBuildDocument(result, theme) {
  if (result.mode === 'original') {
    // The file's own text; only the styleguide is added, where its stylesheets were.
    return result.full.slice(0, result.insertAt) + hiStyleBlock(hiFileCss(), theme) + result.full.slice(result.insertAt);
  }
  const name = dnName(), version = dnMeta.version || '1.0.0';
  return [
    '<!DOCTYPE html>',
    '<html lang="en" data-theme="' + esc(theme) + '">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<meta name="generator" content="' + esc(name + ' v' + version) + ' styleguide · Kagami design system">',
    '<title>' + esc(result.title || 'Imported page') + '</title>',
    hiStyleBlock(hiDocCss()),
    '</head>',
    '<body class="kg-doc">',
    '<div class="kg-page">',
    result.html,
    '</div>',
    '</body>',
    '</html>',
    ''
  ].join('\n');
}

/** Download name: <original name>[-clean]-<styleguide name>-<theme>.html */
function hiFileName(fileName, theme, mode) {
  const slug = s => String(s).toLowerCase().replace(/\.[a-z0-9]+$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return (slug(fileName) || 'imported-page') + (mode === 'clean' ? '-clean' : '') + '-' + (slug(dnName()) || 'design-system') + '-' + theme + '.html';
}
