import { useCallback, useEffect, useState } from "react";

/** Joins class names, skipping falsy values. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

let idCounter = 0;
/** Stable id for label/aria wiring (React 18 useId is used where available). */
export function nextId(prefix = "k"): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

/** ₹8,45,000 — Indian digit grouping, no decimals unless asked. */
export function formatINR(value: number, fractionDigits = 0): string {
  return "₹" + value.toLocaleString("en-IN", { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits });
}

/** ₹96.4 L / ₹4.50 Cr — compact form for dashboards. */
export function formatINRCompact(value: number): string {
  if (Math.abs(value) >= 1e7) return `₹${(value / 1e7).toFixed(2)} Cr`;
  if (Math.abs(value) >= 1e5) return `₹${(value / 1e5).toFixed(1)} L`;
  return formatINR(value);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** One date format everywhere: 12 Oct 2026. */
export function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return `${String(date.getDate()).padStart(2, "0")} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

// ---------------------------------------------------------------------------
// Display preferences — per-viewer convenience; storage may be unavailable.
// ---------------------------------------------------------------------------
export type Theme = "light" | "dark" | "system";
export type Density = "compact" | "comfortable" | "spacious";

interface Prefs {
  theme?: Theme;
  density?: Density;
  sidebar?: "collapsed" | "expanded";
  navOpen?: Record<string, boolean>;
  grids?: Record<string, { widths?: Record<string, number>; hidden?: string[] }>;
}

const KEY = "kestrel.prefs";

export function readPrefs(): Prefs {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") as Prefs;
  } catch {
    return {};
  }
}

export function writePrefs(patch: Partial<Prefs>): Prefs {
  const next = { ...readPrefs(), ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage blocked: preference lasts for this session only */
  }
  return next;
}

/** Applies theme + density to <html> and remembers them. */
export function useDisplayPrefs() {
  const [theme, setThemeState] = useState<Theme>(() => readPrefs().theme ?? "system");
  const [density, setDensityState] = useState<Density>(() => readPrefs().density ?? "comfortable");

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute("data-density", density);
  }, [density]);

  const setTheme = useCallback((t: Theme) => { setThemeState(t); writePrefs({ theme: t }); }, []);
  const setDensity = useCallback((d: Density) => { setDensityState(d); writePrefs({ density: d }); }, []);

  return { theme, setTheme, density, setDensity };
}
