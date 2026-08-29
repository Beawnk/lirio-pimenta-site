# Project Research Summary

**Project:** Lirio Site - Fase B (Supabase backend + admin panel)
**Domain:** Single-admin product-catalog admin panel, backed by Supabase, on top of an existing static Nuxt 4 / Cloudflare Pages public site
**Researched:** 2026-08-29
**Confidence:** MEDIUM

## Executive Summary

This phase adds a Supabase backend (Postgres + Auth + Storage) and a single-admin CRUD panel to a site that must remain fully static - no Nitro server, no Cloudflare Pages Functions. That constraint shapes every recommendation: use plain `@supabase/supabase-js` from the browser instead of the `@nuxtjs/supabase` module (whose main value, SSR cookie handling, needs a server this project doesn't have), isolate every Supabase call in a new `app/services/` layer so the existing pure-composable/thin-store architecture from Fase A stays intact, and treat Row Level Security - not the Vue UI - as the only real security boundary, since there is no backend standing between the browser and Postgres.

The recommended approach is: build schema + RLS policies first, then a thin `services/` API layer verified directly against Supabase, then auth and the `/admin/**` route-rule SPA island, then admin CRUD, and only then migrate the public catalog's read path to Supabase - in that order, because each later piece depends on the previous one's schema or auth being real and tested. The single biggest risk this research surfaces is not stack choice but security modeling: because Supabase is called straight from the browser with no server gatekeeper, every hide-the-button-unless-logged-in instinct has to be paired with an actual RLS policy, and it is very easy to ship a UI that looks done while the anon key can still read archived rows or even write to tables. The second biggest risk is a repeat of a bug this project has already hit twice - SSR/hydration mismatches from reading async data before `app:suspense:resolve` - which will recur with the Supabase catalog fetch unless the exact same discipline already used for `localStorage` (cart/favorites) is applied to it.

Confidence is MEDIUM across the board: no primary source documents this project's exact combination (static Nitro preset + Supabase + single-admin RLS), so every pattern is cross-checked against multiple official docs and community write-ups but not verified against a working example of this specific stack shape. Treat this as solid guidance to build from, not gospel to skip a spike on - particularly the `routeRules: { ssr: false }` admin-island pattern and the RLS policy shapes, both of which should be smoke-tested early in the phase rather than assumed correct from research alone.

## Key Findings

### Recommended Stack

Two new dependencies cover everything this phase needs: `@supabase/supabase-js@^2.112.4` (Postgres/Auth/Storage client, all-in-one SDK, works unmodified in a browser bundle) and `browser-image-compression@^2.0.2` (resizes and compresses phone photos client-side, with built-in file-size targeting and an optional web-worker mode). No `@nuxtjs/supabase` module - its SSR-cookie machinery is dead weight on a permanently-static site. No separate Auth/Storage SDK - both ship inside `@supabase/supabase-js`. One build-time gotcha to flag early: `@supabase/supabase-js@2.112.4` declares `engines.node >=22.0.0`, but Cloudflare Pages defaults to Node 18 - `NODE_VERSION=22` must be set in both Production and Preview environment settings or the very first `npm install` after adding the dependency can fail.

**Core technologies:**
- `@supabase/supabase-js` - Postgres/Auth/Storage client - official SDK, no Node-only APIs, the only thing actually required to talk to Supabase from a static site
- Hand-rolled `app/plugins/supabase.client.js` + `useSupabase()` composable (no framework module) - matches the project's existing thin-plugin convention, avoids carrying a dependency whose main feature (SSR cookies) is permanently switched off
- `browser-image-compression` - resize + compress a phone photo before Storage upload - handles both resize and size-targeting in one call, `useWebWorker: true` keeps the admin UI from freezing on a big photo

### Expected Features

Full detail in FEATURES.md; this phase's scope maps almost exactly to PROJECT.md's Active requirements - no extra nice-to-have admin features should sneak in.

**Must have (table stakes, P1):**
- Single-admin Supabase Auth login + route guard on all `/admin/**`
- Category CRUD: create, edit, reorder, remove (with a resolved policy for delete-when-products-attached - recommend blocking deletion while non-archived products still reference the category, surfacing a clear message, rather than silent reassignment or cascade-archive)
- Product CRUD: create/edit form, list with search + category filter + pagination (price field exists in the schema/form but is never sent to the public read)
- Icon picker constrained to the existing `Icon*.vue` key set - no free-text icon input, no new icon library
- Client-side image compression before any Storage upload (never the raw phone photo)
- Archive/unarchive via `is_archived`, never a hard delete
- RLS on `products`/`categories`: public SELECT (non-archived only), admin-only write
- Public catalog migrated from `app/data/products.js`/`categories.js` to Supabase as source of truth
- Save/error feedback via the existing toast store; sane empty states (DB starts intentionally empty)

**Should have (P2, add after validation, not this phase):**
- Duplicate/clone product (once repetitive data entry is felt)
- Auto-compute `isNew` from `created_at` (small quality-of-life fix)

**Defer (P3 / v2+, explicitly out of scope):**
- Bulk actions, multi-image gallery, CSV import (Fase C), analytics dashboard, multi-user roles, hard delete, checkout/order UI in admin, rich-text description editor, real-time/collaborative editing, admin UI for banners/services

### Architecture Approach

The existing pure-composable/thin-Pinia-store discipline from Fase A is preserved by inserting one new layer, `app/services/` (`productsApi.js`, `categoriesApi.js`, `storageApi.js`, `authApi.js`), which is the only code allowed to import the Supabase client. Composables (`useCatalog.js`, new `useProductForm.js`) stay pure and untouched by network I/O; stores gain one new capability (async `fetchAll()` + `loading`/`error` state) but no new business-rule responsibility. The admin section (`/admin/**`) is excluded from prerendering via `routeRules: { ssr: false, prerender: false }` - this is not a style choice, it's the fix for a real bug class: a prerendered admin page's auth middleware doesn't meaningfully re-run on a hard reload, so it must ship as an always-fresh SPA shell instead. RLS policies key off `auth.role() = 'authenticated'` (or better, a specific `auth.uid()` check), not row-ownership - there is exactly one admin account by design, so ownership modeling is unneeded overhead.

**Major components:**
1. `app/plugins/supabase.client.js` - single Supabase client instance, `.client.js` so it never runs server-side
2. `app/services/*Api.js` - the only Supabase-aware code; owns every query/insert/upload; keeps table/column names in one place
3. `app/stores/catalog.js` (extended) + new `app/stores/auth.js` - hold fetched state and session, delegate all business logic to composables/services as before
4. `app/middleware/admin.js` + `routeRules` admin-island - auth guard paired with the SPA-exclusion pattern, addressing the hard-reload auth-flash bug directly
5. Public catalog fetch - client-only, triggered after `app:suspense:resolve`, exactly mirroring the project's existing `localStorage` hydration pattern for cart/favorites

Suggested internal build order (from ARCHITECTURE.md, informs but doesn't replace roadmap phase design): schema + RLS -> services layer (verified directly against Supabase) -> auth + admin route guard -> admin CRUD UI -> public catalog migration (can run in parallel with CRUD once schema is stable) -> image compression polish last.

### Critical Pitfalls

Full detail (6 pitfalls, with warning signs and recovery costs) in PITFALLS.md; the top ones that must shape phase design, not just implementation:

1. **RLS never enabled, or enabled too broadly** - every new table needs RLS turned on in the same migration that creates it, with narrow per-operation policies (not `FOR ALL`, not just any-authenticated-user - check the specific admin). Verify by hitting the REST API with only the anon key and confirming writes are rejected.
2. **UI-only admin gating** - hiding buttons in Vue is a UX nicety, not security, because there's no server between browser and Postgres. RLS is the only real boundary; test mutations from a logged-out client and confirm Postgres itself rejects them.
3. **Archived products leaking through an open public SELECT policy** - if `SELECT` is `using (true)` and hide-archived only happens in `useCatalog.js`, every visitor's browser still receives the full row (including any future admin-only fields). The exclusion must live in the RLS policy itself.
4. **SSR/hydration race recurring with the Supabase catalog fetch** - this project has already been bitten twice by reading async data before `app:suspense:resolve` (localStorage). The exact same discipline must apply to the new Supabase fetch, or the public catalog will show a hydration mismatch / stale build-time-frozen data.
5. **EXIF orientation lost during client-side image compression** - a naive `canvas.drawImage()` strips orientation metadata, so real phone photos (as opposed to desktop test images) can upload sideways. Must be verified with an actual phone-camera photo before calling the feature done.
6. **Public bucket mistaken for no-RLS-needed on Storage** - bucket-level public/private and `storage.objects` RLS policies are independent; uploads still need an explicit authenticated-only INSERT policy even on a public bucket.

## Implications for Roadmap

Based on combined research, the phase should be sequenced by dependency and blast radius of failure, not by user-facing feature grouping - schema/security mistakes made early are expensive to unwind once UI and real data sit on top of them.

### Phase 1: Schema, RLS, and Services Layer
**Rationale:** Every other piece (auth gating, admin CRUD, public catalog migration) depends on `products`/`categories` existing with correct RLS. Getting a write to fail silently against an untested policy after a UI is built is a much slower feedback loop than testing policies directly against the client SDK first.
**Delivers:** `products`/`categories` tables, RLS policies (public read non-archived / authenticated write, keyed to the specific admin not just any authenticated user), and `app/services/productsApi.js` / `categoriesApi.js` / `storageApi.js` manually verified against a real Supabase project (script or Vitest integration test) before any Pinia wiring.
**Addresses:** RLS/archive-hiding table-stakes features from FEATURES.md.
**Avoids:** Pitfalls 1, 2, 3, and the RLS performance trap (`(select auth.uid())` not bare `auth.uid()`).

### Phase 2: Auth + Admin Shell
**Rationale:** The `/admin/**` route-rule change and the admin auth middleware are meaningless without a real session to check against - auth must exist before any guarded page.
**Delivers:** Single admin account (created manually via Supabase Dashboard, no invite flow, no `service_role` key anywhere client-side), `authStore`, `admin.js` middleware, `routeRules: { '/admin/**': { ssr: false, prerender: false } }`, login page, session-persistence confirmed across reloads.
**Uses:** `@supabase/supabase-js` auth client (`signInWithPassword`, `onAuthStateChange`), `getUser()` at the point of gating the shell (not just `getSession()`).
**Implements:** Pattern 1 (client-only Supabase client) and Pattern 2 (admin as route-rule SPA island) from ARCHITECTURE.md.

### Phase 3: Admin CRUD (Categories, then Products, then Image Upload)
**Rationale:** Category CRUD must exist before product creation is meaningful (a product needs a valid category). Image upload enhances but doesn't block product save, so it can be the last piece within this phase rather than gating the first product record.
**Delivers:** Category list/create/edit/reorder/remove (with the delete-conflict decision resolved - recommend blocking deletion while products reference the category), product list (search + category filter + pagination) and create/edit form, archive/unarchive toggle, client-side image compression wired into the product form.
**Addresses:** All P1 features from FEATURES.md except the public catalog migration itself.
**Avoids:** Pitfall 5 (EXIF orientation - test with a real phone photo before sign-off), Pitfall 6 (Storage bucket RLS).

### Phase 4: Public Catalog Migration to Supabase
**Rationale:** Depends on the finalized schema from Phase 1 and reuses the same `productsApi.list()` the admin list already exercises - doing this last (or in parallel with Phase 3 once schema is stable) means the read path is tested against real data and real RLS rather than a moving target.
**Delivers:** `app/data/products.js`/`categories.js` retired as the public site's data source; public catalog reads from Supabase via a client-only fetch triggered after `app:suspense:resolve`, mirroring the existing `localStorage` hydration pattern; `useCatalog.js` unchanged.
**Implements:** Pattern 3 (client-only fetch, never `useAsyncData` for this specific data given the site's always-reflect-latest-edits requirement).
**Avoids:** Pitfall 4 - the highest-risk pitfall in this whole phase, since it's the exact bug class that has already recurred twice in this codebase. Explicitly re-verify against a hard refresh with dev console open (zero hydration warnings) before merging.

### Phase Ordering Rationale

- Schema/RLS must come before anything is built on top of it - security policy retrofits after a UI exists are the highest-cost mistake this research identifies (Pitfalls 1-3).
- Auth must exist before any admin route is meaningful - there's nothing to gate otherwise.
- Category CRUD is a hard dependency of Product CRUD (a product needs a category to belong to), so it must ship first within Phase 3, even though both were originally described as one admin-CRUD block in PROJECT.md.
- Public catalog migration is deliberately last because it's the highest-risk phase for the project's known recurring SSR/hydration bug, and benefits from a schema and services layer that are already proven correct by the admin panel's usage of them.

### Research Flags

Phases likely needing deeper research during planning (`--research-phase`):
- **Phase 1 (Schema/RLS):** RLS policy exact syntax for the single-admin `auth.uid()` check, and the `(select auth.uid())` performance-wrapping pattern, are easy to get subtly wrong; worth a focused spike/lookup against current Supabase docs at planning time.
- **Phase 4 (Public catalog migration):** No primary source verifies this project's exact combination (static Nitro preset + Supabase + the existing `app:suspense:resolve` hydration pattern) - treat the client-only-fetch approach as the strong default but re-verify against current Nuxt 4.x hydration docs before locking the plan.

Phases with standard, well-documented patterns (safe to skip deep research-phase):
- **Phase 2 (Auth/admin shell):** `routeRules: { ssr: false }` for an admin SPA island and Supabase password auth are both officially documented, common patterns.
- **Phase 3 (Admin CRUD):** Standard form/list/pagination/upload patterns; the only genuinely novel risk (EXIF orientation) is already well-scoped in PITFALLS.md with a concrete test procedure.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | Version numbers cross-checked against two independent official npm/unpkg endpoints; pattern guidance (module vs. plain SDK) from official docs + web search, no HIGH-rated source available in this environment (Context7/Brave MCP unavailable) |
| Features | MEDIUM | Supabase-specific claims (RLS, Storage) cross-checked against official docs; general admin-UX conventions are LOW-confidence community consensus but low-risk and uncontroversial |
| Architecture | MEDIUM | Cross-checked across official Nuxt/Supabase docs, module source, and maintained-repo issues; no single primary source documents this exact stack combination (static preset + Supabase), flagged for a spike |
| Pitfalls | MEDIUM | Cross-checked across official Supabase docs and multiple independent write-ups; no project-specific precedent exists yet since this is the project's first backend |

**Overall confidence:** MEDIUM

### Gaps to Address

- **Category deletion-with-products-attached policy** is not yet decided in PROJECT.md - FEATURES.md recommends blocking deletion with a clear message, but this should be confirmed explicitly during requirements/roadmap review, not assumed silently during implementation.
- **`routeRules: { ssr: false }` admin-island pattern on Cloudflare Pages** specifically (vs. generic Nuxt static hosting) has not been verified end-to-end in this research - worth a small spike early in Phase 2 to confirm the `_redirects` SPA-fallback rule and route-rule exclusion actually behave as expected on Cloudflare's static asset host before the rest of the admin panel is built on top of it.
- **Supabase CLI / migrations-as-code** was flagged in STACK.md as worth-adopting-but-not-assumed - decide during phase planning whether schema changes go through versioned SQL migrations or the Dashboard UI; this affects reviewability of the RLS policies specifically.
- **Whether `browser-image-compression` handles EXIF orientation correctly out of the box** was not conclusively verified - PITFALLS.md flags this as needing explicit testing with a real phone photo regardless of library choice; do not assume the library solves this silently.

## Sources

### Primary (HIGH confidence)
- `.planning/PROJECT.md` and `.planning/codebase/ARCHITECTURE.md` - project-internal source of truth for Active requirements, existing conventions, and the documented SSR/hydration trap

### Secondary (MEDIUM confidence)
- Official Supabase docs: Row Level Security, RLS performance/best-practices, Storage access control, Storage buckets fundamentals, Auth sessions, Securing your API
- Official Nuxt 4.x docs: Prerendering, Rendering Modes concepts, Hydration best practices, `useAsyncData`
- `@nuxtjs/supabase` module docs and `nuxt-modules/supabase` GitHub issue #496 (SPA auth race condition)
- `nuxt/nuxt` GitHub Discussion #8688 (middleware & Supabase auth)
- npm registry / unpkg for `@supabase/supabase-js@2.112.4` and `browser-image-compression@2.0.2` version and `engines` data

### Tertiary (LOW confidence, corroborated by the above)
- Community write-ups on RLS misconfiguration, the `auth.uid()` init-plan performance trap, client-side image compression and EXIF handling, and SPA fallback patterns for static sites - used only to corroborate official sources, not as standalone authority

---
*Research completed: 2026-08-29*
*Ready for roadmap: yes*
