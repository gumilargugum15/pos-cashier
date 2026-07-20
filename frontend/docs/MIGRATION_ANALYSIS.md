# Migration Analysis: TanStack Start + Nitro → Vite SPA

## 1. Purpose

Assess whether the Nova POS frontend can be safely migrated from **TanStack Start**
(a full-stack SSR framework built on **Nitro**/h3, previously wrapped by
`@lovable.dev/vite-tanstack-config`) to a **pure client-side Vite SPA**, while
keeping React 19, TypeScript, TanStack Router (SPA mode), TanStack Query, Axios,
Tailwind CSS v4, and Radix UI unchanged, and without altering any page, layout,
component, style, API integration, or business logic.

## 2. Pre-migration architecture

| Layer | Technology | Role |
| --- | --- | --- |
| Build/dev server | Vite 8, wrapped by `@lovable.dev/vite-tanstack-config` | Composed React, Tailwind, tsconfig-paths, TanStack Start, and Nitro plugins |
| SSR framework | `@tanstack/react-start` | File-based routing + server rendering pipeline |
| Server runtime | `nitro` (h3-based) | Bundled the SSR server entry (`src/server.ts`) for deployment |
| Router | `@tanstack/react-router` (via Start) | File-based routes under `src/routes/` |
| Data fetching | `@tanstack/react-query` + Axios | 100% client-side, hitting the Laravel API directly |
| Client entry | *(none explicit)* | Start's Vite plugin auto-wired hydration; no `index.html`/`main.tsx` existed |

## 3. Key finding: the app never used server rendering for anything but the document shell

A full grep across `src/` for `createServerFn`, `beforeLoad`, `loader:`, and
`server-only` returned **zero matches outside of the three Start-specific
infrastructure files** (`src/server.ts`, `src/start.ts`, and the generated
`src/routeTree.gen.ts`). Every route component fetches its data exclusively via
TanStack Query hooks (`useProducts`, `useSales`, `useSettings`, etc.) calling
Axios against `VITE_API_BASE_URL`. There are no server functions, no
loader-based data fetching, and no server-only modules anywhere in the route
tree.

This means TanStack Start was providing exactly one functional capability this
app actually depended on: rendering the initial HTML document
(`RootShell` → `<html><head><HeadContent/></head><body>{children}<Scripts/></body></html>`)
and bundling a deployable Nitro server to serve it. Everything else — routing,
data fetching, layouts, auth gating, the Bluetooth printer context, the command
palette — is plain React/Router/Query code with no SSR dependency.

**Conclusion: this is a low-risk, mechanical migration.** No route file,
component, hook, or API integration needs to change. The work is confined to:
swapping the build/bootstrap layer, and removing the now-unused SSR-only error
wrapper files.

## 4. Files identified as SSR/Nitro-only (safe to delete)

- `src/server.ts` — Nitro fetch handler wrapping `@tanstack/react-start/server-entry`, with h3-swallowed-error recovery logic.
- `src/start.ts` — `createStart()` instance with a server-side error middleware.
- `src/lib/error-capture.ts` — captured uncaught errors so `server.ts` could recover a stack trace from h3's generic 500 response. Only consumed by `server.ts`.
- `src/lib/error-page.ts` — static HTML string rendered by `server.ts`/`start.ts` for SSR 500 responses.
- `.tanstack/` — Start's local dev temp cache directory.

`src/lib/lovable-error-reporting.ts` was **kept** — it forwards client-side
React error-boundary errors to the Lovable editor's iframe host
(`window.__lovableEvents`), which is unrelated to SSR/Nitro and still works
identically in a pure SPA.

## 5. `@lovable.dev/vite-tanstack-config` — what it actually configured

Inspecting `node_modules/@lovable.dev/vite-tanstack-config/dist/index.js`
directly (no source repo available) showed it composed, per build:

- `@tailwindcss/vite`, `vite-tsconfig-paths`, `@vitejs/plugin-react` — kept, now wired directly in `vite.config.ts`.
- `@tanstack/react-start/plugin/vite`'s `tanstackStart()` — **removed**, replaced with `@tanstack/router-plugin/vite`'s `tanstackRouter()` for pure file-based route generation (already a project dependency, previously unused directly).
- `nitro/vite`'s `nitro()` (build-only, `cloudflare-module` preset by default) — **removed** entirely; a plain Vite SPA build has no server bundle to produce.
- Manual `import.meta.env.VITE_*` → `define` injection — **removed**; Vite exposes `VITE_`-prefixed env vars via `import.meta.env` natively, no manual wiring needed once Nitro/SSR's `process.env` boundary is gone.
- Lovable-sandbox-only concerns (asset proxy, HMR gate, dev-server bridge, port/host pinning for the Lovable preview iframe) — **removed**; irrelevant outside the Lovable editor sandbox and not needed for a self-hosted deployment.

## 6. Client bootstrap: what had to be added

Start auto-generates the HTML document server-side, so this project never had
an `index.html` or a `main.tsx`. Both were created:

- `index.html` — static shell with the same `<meta>`/`<title>`/favicon tags previously produced by `__root.tsx`'s `head()` config, plus `<div id="root">` and `<script type="module" src="/src/main.tsx">`.
- `src/main.tsx` — creates the router via the existing `getRouter()` (unchanged), mounts `<RouterProvider>` via `createRoot`, and registers the `Register` type augmentation TanStack Router expects for a non-Start app.

`__root.tsx` required three targeted edits, all removing SSR-only surface:

- Dropped `shellComponent: RootShell` and the `RootShell` function — there is no server-rendered `<html>` shell anymore; `index.html` is that shell now.
- Dropped `<Scripts />` — a Start-only hydration-script injector; Vite's build already injects the correct `<script type="module">`/`<link>` tags into `dist/index.html` directly.
- Moved `<HeadContent />` into `RootComponent` (previously only inside `RootShell`). `HeadContent`/`head()` are core `@tanstack/react-router` features that work purely client-side (portal-based DOM updates), independent of Start — this preserves per-route `<title>`/meta updates with zero route-file changes.
- Dropped the `../styles.css?url` import + manual stylesheet `<link>` — Start's pattern for getting CSS into a server-rendered `<head>`. `main.tsx` now does a plain `import "./styles.css"`, which Vite handles natively (dev: injected `<style>`/HMR; build: extracted `<link rel="stylesheet">` in `dist/index.html`).

## 7. Risk assessment

| Risk | Assessment |
| --- | --- |
| Hidden SSR-dependent logic in route files | **Ruled out** — grep-verified zero server function/loader usage outside Start's own infra files |
| Environment variable handling breaking | **Low** — `VITE_*` vars already flow through `import.meta.env`, which is native Vite behavior with or without the Lovable wrapper |
| Auth/session behavior changing | **None** — token storage is `localStorage`-based and the 401 redirect is a hard `window.location.href`, both already client-only, unaffected by SSR removal |
| Deep-link / hard-reload 404s in production | **Requires Nginx config** — a pure SPA needs `try_files $uri /index.html;` since there is no server to resolve `/settings` on a cold request; documented in `MIGRATION_REPORT.md` |
| Route-tree regeneration diverging | **Ruled out** — rebuilding regenerated `src/routeTree.gen.ts` with `@tanstack/router-plugin`, confirmed identical route surface, only the Start-specific `declare module '@tanstack/react-start' { Register }` block was dropped (as expected) |
| No git history to fall back on | **Mitigated** — a local git repository was initialized and a pre-migration checkpoint commit was created before any file was touched |

## 8. Decision log

- **Kept `vite-tsconfig-paths`** instead of switching to Vite 8's native `resolve.tsconfigPaths` option (which the build now suggests as available) — the plugin was already a working dependency and a single source of truth with `tsconfig.json`'s `paths` field; switching is a valid future simplification but out of scope for this migration.
- **Removed `bun.lock`/`bunfig.toml`** — this project's established package manager is npm (`package-lock.json` is the tracked lockfile); a stale bun lockfile from before this dependency overhaul would be actively misleading.
- **Renamed the `package.json` name** from `tanstack_start_ts` to `kagoem-pos-frontend` — cosmetic, but the old name is now factually wrong.
- **Did not touch** any file under `src/routes/`, `src/components/`, `src/hooks/`, `src/api/`, `src/contexts/`, `src/types/`, or `src/lib/` other than the SSR-only files listed in §4 — confirming zero business-logic/visual changes.
