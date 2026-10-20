import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  plugins: [react()],
  // dist/ holds the compiled design-system CSS used by site/; the app builds elsewhere.
  build: { outDir: "dist-app", emptyOutDir: true },
  css: { preprocessorOptions: { scss: { api: "modern-compiler" } } },
  resolve: {
    alias: {
      "@ui": r("./src/ui"),
      "@layouts": r("./src/layouts"),
      "@patterns": r("./src/patterns"),
      "@features": r("./src/features"),
    },
  },
});
