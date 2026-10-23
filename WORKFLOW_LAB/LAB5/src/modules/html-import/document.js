/* =========================================================================
   HTML IMPORT · DOCUMENT
   Wraps converted markup in a complete, self-contained page: the
   styleguide's tokens for every theme, the design-system styles and the
   same web fonts as the app. Used for the preview and the download.
   The page has no scripts.

   Provides: hiFontsLink, hiBuildDocument, hiFileName
   ========================================================================= */
'use strict';

/** The app's Google Fonts stylesheet link, so the page loads the styleguide's fonts. */
function hiFontsLink() {
  const link = document.querySelector('link[href*="fonts.googleapis.com/css"]');
  return link ? '<link rel="stylesheet" href="' + esc(link.getAttribute('href')) + '">' : '';
}

/**
 * Builds the converted page.
 * @param {{title:string, html:string}} result  from convertHtml
 * @param {'light'|'dark'|'hc'} theme           theme the page opens in (all three are included)
 * @returns {string} a complete HTML document
 */
function hiBuildDocument(result, theme) {
  const name = dnName(), version = dnMeta.version || '1.0.0';
  return [
    '<!DOCTYPE html>',
    '<html lang="en" data-theme="' + esc(theme) + '">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<meta name="generator" content="' + esc(name + ' v' + version) + ' styleguide · Kagami design system">',
    '<title>' + esc(result.title || 'Imported page') + '</title>',
    hiFontsLink(),
    '<style>',
    '/* Styleguide tokens: ' + name.replace(/\*\//g, '') + ' v' + version + '. Change data-theme on <html> to light, dark or hc. */',
    hiTokenCss(),
    hiDocCss(),
    '</style>',
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

/** Download name: <original name>-<styleguide name>-<theme>.html */
function hiFileName(fileName, theme) {
  const slug = s => String(s).toLowerCase().replace(/\.[a-z0-9]+$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return (slug(fileName) || 'imported-page') + '-' + (slug(dnName()) || 'design-system') + '-' + theme + '.html';
}
