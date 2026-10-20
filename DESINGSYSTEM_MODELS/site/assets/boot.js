/* Runs in <head> before first paint: applies remembered display preferences
   so there is no light-to-dark flash. Storage can be unavailable (private
   mode, blocked site data) — the page must render correctly without it.
   ?theme=dark|light and ?density=compact|comfortable|spacious override the
   stored preference (useful for review links and screenshots). */
(function () {
  var root = document.documentElement;
  var prefs = {};
  try { prefs = JSON.parse(localStorage.getItem("kestrel.prefs") || "{}"); } catch (e) { /* ignore */ }
  var q = new URLSearchParams(location.search);
  var theme = q.get("theme") || prefs.theme;
  var density = q.get("density") || prefs.density || "comfortable";
  if (theme === "light" || theme === "dark") root.setAttribute("data-theme", theme);
  root.setAttribute("data-density", density);
})();
