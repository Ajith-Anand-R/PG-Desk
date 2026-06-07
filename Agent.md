# Agent Guide — PG Desk

Purpose
-------
This document orients an AI agent or new contributor to the repository so they can begin productive work without reading every file.

Snapshot
--------
- Project: PG Desk — accommodation / PG / hostel management PWA + dashboard
- Frameworks: Next.js (App Router), React 19, TypeScript (strict)
- Styling: Tailwind CSS via PostCSS plugin
- 3D/Canvas: three, @react-three/fiber, @react-three/drei
- Animations: framer-motion (gsap present in deps)
- Data: currently client-side, in-memory React state (no backend in this repo)

How to run
----------
1. Install dependencies: `npm install`
2. Run dev server: `npm run dev` (script uses `next dev --webpack`)
3. Build: `npm run build`
4. Start production server: `npm run start`

Top-level files to inspect first
-------------------------------
- [package.json](package.json) — scripts & dependencies
- [next.config.ts](next.config.ts) — Next config (turbopack root set)
- [tsconfig.json](tsconfig.json) — TypeScript settings & path alias `@/*` → `src/*`
- [public/manifest.json](public/manifest.json) and [public/sw.js](public/sw.js) — PWA manifest & service worker
- [src/app/layout.tsx](src/app/layout.tsx) — root layout, fonts, SW registration
- [src/app/page.tsx](src/app/page.tsx) — landing / marketing page (3D hero)
- [src/app/app/page.tsx](src/app/app/page.tsx) — in-app dashboard shell and central client state
- [src/lib/types.ts](src/lib/types.ts) and [src/lib/utils.ts](src/lib/utils.ts)

Project structure & responsibilities
-----------------------------------
- `src/app/` — Next App Router pages and layout
  - `/` → `src/app/page.tsx` (landing)
  - `/app` → `src/app/app/page.tsx` (PWA app shell; contains central state and view-switch logic)
- `src/components/` — UI screens and reusable components
  - Screens follow `*-view.tsx` convention (e.g., `dashboard-view.tsx`, `rooms-view.tsx`, `login-view.tsx`)
  - `ui/` contains small primitives: buttons, bottom-sheet, mobile-frame, stat-card, bed-icon
  - `3d/ThreeDScene.tsx` — the three.js scene used on the landing page
- `src/lib/` — global types and utility helpers

Important implementation notes
-----------------------------
- Centralized client state: `src/app/app/page.tsx` holds arrays for `properties`, `rooms`, `tenants`, plus handlers like `handleAddTenantSubmit`, `handleToggleBed`. This is the first place to change if you need to persist or modify domain data.
- 3D scene: dynamic-imported with SSR disabled; keep the heavy rendering client-only. `ThreeDScene` accepts a `scrollProgress` or slide index to interpolate camera keyframes.
- Service worker: registered in `layout.tsx`. `public/sw.js` employs a network-first strategy for navigation and caches static assets; it bypasses caching on `localhost` to avoid dev issues.
- Path alias: `@/` → `src/` via `tsconfig.json`.
- TypeScript: strict. Update `src/lib/types.ts` when changing domain shapes.

When you need to extend functionality
------------------------------------
- Add a new view (example):
  1. Create `src/components/<feature>-view.tsx` (follow existing `*-view.tsx` files for props pattern).
  2. Import the new view into `src/app/app/page.tsx` and add it to the in-app view switcher.
  3. If data needs to be persisted, add API endpoints (e.g., create `src/app/api/*` route handlers or integrate external APIs) and replace in-memory updates with fetch/POST calls.
- Persist state: move data from `src/app/app/page.tsx` to a server-backed API or create a client store + API adapter.
- Add auth: integrate NextAuth or custom auth and protect `/app` routes.

PWA & offline considerations
---------------------------
- SW registration occurs in runtime script inside `layout.tsx` (reloads on controller change).
- `public/sw.js` caches shell assets and implements fallback to cached shell when offline. Be mindful: updating cached assets requires bumping `CACHE_NAME`.

Conventions & style
-------------------
- UI files with `-view` suffix are screens; `ui/` holds composable primitives.
- Use `cn` from `src/lib/utils.ts` to merge class names and `cva` for variants on shared components.
- Prefer dynamic import for heavy or browser-only packages: `dynamic(() => import('...'), { ssr: false })`.

Known gaps & recommended roadmap
--------------------------------
1. Persistence layer (API + DB) — highest priority if real data is required.
2. Authentication & authorization.
3. Unit & E2E tests (none currently in repo).
4. Add README section for contribution guidelines and view registration steps.

Quick contact points for common tasks
-------------------------------------
- Edit landing hero / 3D: [src/app/page.tsx](src/app/page.tsx) and [src/components/3d/ThreeDScene.tsx](src/components/3d/ThreeDScene.tsx)
- Edit central app data/flows: [src/app/app/page.tsx](src/app/app/page.tsx)
- Edit layout / service worker behavior: [src/app/layout.tsx](src/app/layout.tsx) and [public/sw.js](public/sw.js)
- Update types: [src/lib/types.ts](src/lib/types.ts)

If you'd like, I can now:
- add a short README section with exact dev commands and common troubleshooting steps, or
- open and summarize any single file in detail, or
- implement one of the recommended roadmap items (pick which one).

— End of Agent Guide
