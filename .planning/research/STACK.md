# Stack Research

**Domain:** Adding a Supabase backend (Postgres + Auth + Storage) and an authenticated single-user admin CRUD panel to an existing static Nuxt 4 catalog site deployed on Cloudflare Pages
**Researched:** 2026-08-29
**Confidence:** MEDIUM

Context for this research: the app stays on Nuxt's `static` Nitro preset (no server-side code, no Cloudflare Pages Functions). Everything Supabase-related must run entirely in the browser. Context7 and Brave MCP were not available in this environment; findings come from direct npm registry/unpkg lookups (version numbers) and web search (patterns), cross-checked against official Supabase and Nuxt docs pages returned by search. No provider here reaches HIGH by this project's confidence classifier — treat MEDIUM items as solid but worth a final skim of the linked official doc before locking the phase plan, and treat the two npm-registry version numbers as accurate (verified against two independent official endpoints) even though the generic `webfetch` provider is classified LOW by the tooling.

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `@supabase/supabase-js` | 2.112.4 | Postgres client, Auth client, Storage client — one SDK for all three services | Official SDK, works unmodified in a browser bundle (ships ESM + CJS), no Node-only APIs used at runtime. It's the only piece actually required to talk to Supabase from a static site — everything else is optional sugar. |
| Hand-rolled plugin + composable (no `@nuxtjs/supabase` module) | — | Creates and exposes the Supabase client to the app | The Nuxt module's entire reason to exist — SSR cookie sync, server middleware route guards — needs a Nuxt **server**, which this project doesn't have on the `static` preset. Using it here means carrying a dependency whose main feature is permanently switched off. A `app/plugins/supabase.client.js` that calls `createClient()` and a `useSupabase()` composable that returns it is ~10 lines, matches the project's existing "thin plugin + pure composable" convention (see `ARCHITECTURE.md`), and has one less thing that can silently misbehave in static-only mode (see "What NOT to Use"). |
| `browser-image-compression` | 2.0.2 | Resize + compress a product photo client-side before it reaches Supabase Storage | Handles resize (`maxWidthOrHeight`) and file-size targeting (`maxSizeMB`, auto-retries at lower quality) in the *same* call — this project needs both, since phone photos arrive at unpredictable size and resolution. `useWebWorker: true` moves the work off the main thread so the admin UI doesn't freeze while a photo is processed. |

### Supporting Libraries

None needed beyond the two packages above. Supabase Auth (`supabase.auth.*`) and Supabase Storage (`supabase.storage.*`) are both included in `@supabase/supabase-js` — there's no separate `@supabase/auth-js` or `@supabase/storage-js` install; the SDK re-exports them.

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@supabase/supabase-js` (`supabase.auth`) | bundled | Sign in/out the single admin account, hold session | Admin login form, route guard |
| `@supabase/supabase-js` (`supabase.storage`) | bundled | Upload the compressed image, get its public URL | Product image upload in the admin form |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Supabase CLI | Local Postgres + migrations, generates typed schema | Not strictly required for a single-admin, low-traffic catalog, but worth adopting for RLS policies and the products/categories schema as versioned SQL migrations instead of clicking through the dashboard — makes the schema reviewable and reproducible. Flag this as a decision for the roadmap phase, not assumed here. |
| Supabase Dashboard → Storage → bucket policies | Configure the image bucket | Set the bucket to public *read* (so `<img>` tags work with no auth) but keep write/delete gated by an RLS policy checked against the admin's `auth.uid()` (see Pitfall below). |

## Installation

```bash
# Core
npm install @supabase/supabase-js@^2.112.4
npm install browser-image-compression@^2.0.2

# No dev dependencies needed for this phase
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|--------------------------|
| Plain `@supabase/supabase-js` + hand-rolled plugin | `@nuxtjs/supabase` (v2.0.10) module | If the project ever adds SSR back (hybrid rendering) or needs server-verified sessions (e.g., an actual Nitro API route checking who's logged in). On a permanently-`static` site, the module's SSR-cookie path (`useSsrCookies`) doesn't apply, and disabling it just leaves you at the plain client anyway — same outcome, one more dependency. |
| `browser-image-compression` | `compressorjs` | If bundle size (12KB vs 19KB) matters more than built-in file-size targeting, or if the team prefers its callback-style API. It has no `maxSizeMB` equivalent — you'd hand-roll a retry-at-lower-quality loop yourself, which is exactly what `browser-image-compression` already does. Given photos come straight from Lírio's phone with no consistent resolution, the size-targeting feature is the deciding factor. |
| Supabase Auth (`signInWithPassword`) | Magic link / OTP email login | If Lírio doesn't want to remember a password. Adds a dependency on email deliverability for every login, which is more moving parts for a single daily user than it's worth right now — a password is simpler to operate and to explain. Worth revisiting only if password reset becomes a support burden. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|--------------|
| `@nuxtjs/supabase` module on this project as currently scoped | Its value (`useSsrCookies`, server-side `serverSupabaseUser()`, middleware-based route protection) requires a Nitro server; this project runs Nitro's `static` preset with zero server code, by explicit constraint. Installing it and immediately disabling its main feature (`useSsrCookies: false`) leaves you with the plain client it wraps, plus its own composable naming and config surface to learn for no benefit. | Plain `@supabase/supabase-js` behind a small plugin/composable (see Core Technologies) |
| Nuxt's default `nitro.prerender.crawlLinks` behavior applied blindly to an `/admin` section | Nitro's static preset crawls and prerenders every route it can reach at *build* time, when there is no logged-in user and no Supabase session — an admin page prerendered this way either bakes in an empty/broken state or (worse) needs to fetch admin-only data during the build, which will fail against RLS-protected tables. | Exclude `/admin/**` from prerendering (`nitro.prerender.ignore` or `routeRules: { '/admin/**': { ssr: false } }`) and gate it with a client-side auth check on mount. Cloudflare Pages needs a `_redirects` SPA fallback (`/admin/* /admin/index.html 200`) so refreshing a deep admin URL doesn't 404. |
| Uploading the original phone photo to Supabase Storage, even "just this once" | Directly violates the project's own constraint ("nunca envie o arquivo original para o Storage") and defeats the point of adding a compression library — phone photos can be several MB and wildly inconsistent in resolution, which balloons Storage cost and slows the public catalog's image loading at ~500 products. | Always run the file through `browser-image-compression` in the admin upload flow before calling `storage.upload()`; never wire the raw `<input type="file">` value straight to Storage. |
| Skipping RLS or leaving a table "temporarily open" during development | Supabase disables RLS by default per table (unless created via a template that enables it) and a table with RLS *enabled* but zero policies denies all access — the two failure modes are opposite but equally common: builders either forget to enable RLS at all (public tables writable by anyone with the anon key) or enable it, add only an admin write policy, and forget the public-read policy (the catalog goes blank for every visitor). | Write RLS policies for `products` and `categories` as part of the same migration that creates the table: a public/anon `SELECT` policy filtered to non-archived rows, plus an authenticated `INSERT/UPDATE/DELETE` policy checked against the single admin's `auth.uid()`. |

## Stack Patterns by Variant

**If Cloudflare Pages build starts failing after adding `@supabase/supabase-js`:**
- Check the build log for a Node engine mismatch. `@supabase/supabase-js@2.112.4`'s `package.json` declares `"engines": { "node": ">=22.0.0" }`, but Cloudflare Pages defaults its build image to **Node 18.17.1** unless told otherwise.
- Fix: set `NODE_VERSION=22` (or higher) as an environment variable in the Cloudflare Pages project settings — and set it in **both** the Production and Preview environment tabs; they're independent, and a preview deploy testing this phase will fail silently if only Production is updated.
- Because this project could hit this on the very first `npm install` after adding the dependency, flag it explicitly in the phase plan/checklist rather than discovering it mid-build.

**If the admin panel later needs more than one operator:**
- The single-`auth.uid()` RLS pattern recommended here stops scaling once there's more than one admin account, since the policy hardcodes one UUID. That's explicitly out of scope per `PROJECT.md` ("Múltiplas contas ou permissões no painel"), so don't build a roles table now — but note it as the natural extension point if that requirement ever returns, instead of over-engineering a `role` column today.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|------------------|-------|
| `@supabase/supabase-js@2.112.4` | Node.js >=22.0.0 (build-time only) | This is a build/dev-tooling requirement (declared in `engines`), not a browser runtime constraint — the shipped bundle runs in any modern browser. Still, Cloudflare Pages' build step runs `npm install` under its own Node version, so the build environment must satisfy it. See Cloudflare Pages pitfall above. |
| `browser-image-compression@2.0.2` | Any evergreen browser (Canvas + Blob + Promise support) | No dependency on `@supabase/supabase-js`; the two libraries only meet at the call site (`storage.upload(path, await imageCompression(file, options))`). |
| `@nuxtjs/supabase@2.0.10` (if reconsidered later) | `@supabase/supabase-js` ^2.112.2, `@supabase/ssr` ^0.12.4 | Recorded for completeness since it was evaluated and rejected above — useful if a future SSR-enabled phase revisits the decision. |

## Sources

- `registry.npmjs.org/@supabase/supabase-js/latest` and `unpkg.com/@supabase/supabase-js@2.112.4/package.json` — version 2.112.4, `engines.node >=22.0.0`, confirmed via two independent official npm-infrastructure endpoints (tool classifies generic `webfetch` fetches as LOW confidence, but the cross-check on two official sources makes the version number itself reliable).
- `registry.npmjs.org/browser-image-compression/latest` — version 2.0.2 (webfetch, LOW per tooling, single official source).
- `registry.npmjs.org/@nuxtjs/supabase/latest` — version 2.0.10, dependency on `@supabase/ssr ^0.12.4` and `@supabase/supabase-js ^2.112.2` (webfetch, LOW per tooling).
- Web search: Nuxt Supabase docs (`supabase.nuxtjs.org`), official Supabase docs (`supabase.com/docs/guides/storage`, `.../database/postgres/row-level-security`), Nuxt v4 prerendering docs (`nuxt.com/docs/4.x/getting-started/prerendering`) — MEDIUM confidence (verified web search).
- Web search: `npm-compare.com/browser-image-compression,compressorjs` and library READMEs — MEDIUM confidence, used only for the resize+compress feature comparison, not for version numbers.
- Web search: Cloudflare community threads and `developers.cloudflare.com/pages/configuration/build-image` — MEDIUM confidence, used for the Node-version build pitfall.

---
*Stack research for: Supabase backend + admin panel on a static Nuxt 4 / Cloudflare Pages site*
*Researched: 2026-08-29*
