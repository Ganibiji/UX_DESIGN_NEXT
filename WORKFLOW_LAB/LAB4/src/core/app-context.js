/* =========================================================================
   APP CONTEXT
   Build mode flags shared by every file.

   Provides: KG_BUNDLED, KG_SRC, KG_EXPORT
   ========================================================================= */
'use strict';

/** True in the single-file build (dist/), where every script is inline. */
const KG_BUNDLED = !document.querySelector('script[src]');
/** The single-file page as authored, captured before anything renders: the workflow download copies it. Null in the multi-file build. */
const KG_SRC = KG_BUNDLED ? '<!DOCTYPE html>\n' + document.documentElement.outerHTML : null;
/** Set inside a downloaded workflow app (see design/export.js, dnBuildApp). */
const KG_EXPORT = window.KG_EXPORT || null;
