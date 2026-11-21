// This config bundles the app for Vercel.
// @lovable.dev/vite-tanstack-config already wires up: TanStack devtools (dev only),
// tanstackStart, viteReact, tailwindcss, tsConfigPaths, VITE_* env injection, the "@"
// path alias, React/TanStack dedupe, error logger plugins, and nitro (build only).
// Do not add those plugins again, and never set ssr.external / resolve.external.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    server: { entry: "server" },
  },
  // Hard-pin the deploy target so `vite build` always emits Vercel's build output
  // (.vercel/output) instead of relying on auto-detection.
  nitro: { preset: "vercel" },
});
