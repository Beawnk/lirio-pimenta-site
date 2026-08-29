# Architecture Research

**Domain:** Supabase-backed admin panel + public catalog on a purely static Nuxt/Cloudflare Pages site
**Researched:** 2026-08-29
**Confidence:** MEDIUM (cross-checked across official Nuxt/Supabase docs, module source, and community reports; no single primary source for the exact combination of `static` Nitro preset + Supabase, so validate the route-rules approach with a spike early in Phase B)

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│  PUBLIC SITE (prerendered, routeRules default — static)              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐      │
│  │ index.vue  │  │ Catalog    │  │ Cart/Fav   │  │ Components │      │
│  │ (shell)    │  │ Section    │  │ (unchanged)│  │            │      │
│  └─────┬──────┘  └─────┬──────┘  └────────────┘  └────────────┘      │
│        │ mounted only  │ mounted only                                 │
├────────┴────────────────┴─────────────────────────────────────────────┤
│  CLIENT-ONLY FETCH BOUNDARY (plugin, after app:suspense:resolve)      │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │  app/plugins/catalog.client.js → catalogStore.fetchAll()      │    │
│  └───────────────────────────┬──────────────────────────────────┘    │
├──────────────────────────────┴─────────────────────────────────────────┤
│  STATE (Pinia — thin, unchanged responsibility)                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐  │
│  │ catalog  │ │ cart     │ │ favorites│ │ ui       │ │ auth (new)  │  │
│  └────┬─────┘ └──────────┘ └──────────┘ └──────────┘ └──────┬──────┘  │
├───────┴──────────────────────────────────────────────────────┴────────┤
│  BUSINESS LOGIC — pure composables (unchanged role)                   │
│  useCatalog (filter/sort), useCart, useWhatsApp, useProductForm (new) │
├─────────────────────────────────────────────────────────────────────┤
│  DATA ACCESS — new impure layer, isolates Supabase from everything   │
│  app/services/: productsApi.js, categoriesApi.js, storageApi.js,     │
│                  authApi.js                                          │
├─────────────────────────────────────────────────────────────────────┤
│  app/plugins/supabase.client.js → createClient() singleton           │
└──────────────────────────────┬────────────────────────────────────────┘
                                │ HTTPS (anon key, RLS-scoped)
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│  SUPABASE (Postgres + Auth + Storage) — RLS boundary                 │
│  public role  → SELECT only, non-archived rows                       │
│  authenticated role (= Lírio, the only user that can ever exist)     │
│                 → SELECT all + INSERT/UPDATE/DELETE                  │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  ADMIN SITE (routeRules: { '/admin/**': { ssr:false, prerender:false }})│
│  Served as an empty SPA shell — no HTML/data baked at build time.    │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                     │
│  │ /admin      │  │ auth guard │  │ CRUD forms │                     │
│  │ layout      │→ │ middleware │→ │ + upload   │                     │
│  └────────────┘  └────────────┘  └────────────┘                     │
│  Checks auth on every load (never a prerendered/cached HTML page)    │
└──────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|-------------------------|
| `app/plugins/supabase.client.js` | Create one Supabase client instance for the whole app | `createClient(url, anonKey)` from plain `@supabase/supabase-js`, provided via Nuxt plugin, `.client.js` suffix so it never runs on the server |
| `app/services/productsApi.js`, `categoriesApi.js`, `storageApi.js` | Own every Supabase call (query, insert, update, upload) — the only files that import the Supabase client | Thin async functions: `list()`, `create(payload)`, `archive(id)`, `upload(file, path)`. Impure by nature (network I/O), so they live outside the pure-composable layer |
| `app/composables/useCatalog.js` (existing) | Filter/sort/search over an in-memory product array | **Unchanged.** It never needs to know whether the array came from `app/data/products.js` or Supabase — same shape in, same shape out |
| `app/composables/useProductForm.js` (new) | Validate/shape a product form before it goes to `productsApi.create()` | Pure function: takes raw form fields, returns `{ valid, errors, payload }`. No Supabase import |
| `app/composables/useImageCompression.js` (new) | Resize/compress an image `File` in the browser before upload | Wraps Canvas/`createImageBitmap` browser APIs. Not unit-testable in the existing Vitest/happy-dom setup (no real Canvas) — verify manually or with a browser-based test runner if this needs automated coverage later |
| `app/stores/catalog.js` (extended) | Hold fetched products/categories, `loading`/`error` state, delegate transformation to `useCatalog` | Adds an async `fetchAll()` action that calls `productsApi.list()` — this is the one new impurity Pinia stores take on; everything else about "thin store" stays true (no business rules inside) |
| `app/stores/auth.js` (new) | Hold `session`/`user` refs, `signIn`/`signOut` actions | Wraps `supabase.auth.signInWithPassword`, subscribes to `supabase.auth.onAuthStateChange` |
| `app/middleware/admin.js` (new) | Redirect to `/admin/login` if no session | Nuxt route middleware, `defineNuxtRouteMiddleware`, reads `authStore.user` |
| `app/pages/admin/*.vue` (new) | Admin UI — product list/form, category list/form, login | Regular Nuxt pages, but the whole `/admin/**` tree is opted out of prerendering via `routeRules` |

## Recommended Project Structure

```
app/
├── plugins/
│   ├── supabase.client.js      # new — Supabase client singleton
│   ├── catalog.client.js       # new — triggers catalog.fetchAll() after suspense resolve
│   ├── cart.client.js          # existing, unchanged
│   └── favorites.client.js     # existing, unchanged
├── services/                   # new layer — the ONLY place that imports supabase client
│   ├── productsApi.js          # list, create, update, archive
│   ├── categoriesApi.js        # list, create, update, reorder, remove
│   ├── storageApi.js           # upload (expects an already-compressed Blob)
│   └── authApi.js              # signIn, signOut, getSession
├── composables/
│   ├── useCatalog.js           # existing, unchanged — still pure array transforms
│   ├── useCart.js              # existing, unchanged
│   ├── useProductForm.js       # new — pure validation/shaping, testable in Vitest
│   ├── useImageCompression.js  # new — browser Canvas resize, hard to unit test
│   └── ...
├── stores/
│   ├── catalog.js              # extended — fetchAll(), loading/error, still delegates filtering to useCatalog
│   ├── auth.js                 # new — session/user state, thin wrapper over services/authApi
│   └── ...                     # cart, favorites, ui, toast unchanged
├── middleware/
│   └── admin.js                 # new — auth guard for /admin/**
├── pages/
│   ├── index.vue                # existing, unchanged
│   └── admin/
│       ├── login.vue
│       ├── index.vue             # dashboard / product list
│       ├── products/[id].vue     # product edit form
│       └── categories.vue
└── data/                        # kept only for banners/store-info (never had a Supabase table); products.js/categories.js retired
```

### Structure Rationale

- **`app/services/` is new and deliberate.** It is the seam between "pure composable" and "Supabase." Without it, Supabase calls would either leak into composables (breaking "no Vue, no I/O, no side effects, testable in isolation") or scatter `createClient()` calls across components and stores. Every Supabase-specific concept (table names, column names, `.select()` chains, storage bucket paths) lives in exactly one place per resource.
- **Composables keep their existing job.** `useCatalog.filterProducts()` does not change at all — it already treats the product array as a plain value. This is the payoff of Phase A's pure-function discipline: swapping the data source doesn't touch the tested logic.
- **Stores gain one new capability (async fetch), not new responsibilities.** They still don't contain business rules; they now also hold `loading`/`error` alongside the existing reactive state, and call a service instead of reading a static import.
- **`app/middleware/` is a new top-level folder** because Nuxt's admin-route auth guard is routing concern, not a store or composable — it belongs with the framework's own middleware convention.

## Architectural Patterns

### Pattern 1: Client-only Supabase client (no SSR cookie handling)

**What:** Use plain `@supabase/supabase-js` `createClient()` in a `.client.js` plugin, not the `@nuxtjs/supabase` module's SSR-cookie mode.
**When to use:** Any Nuxt app on the `static` Nitro preset with no Node server to read/write auth cookies.
**Trade-offs:** You lose the module's `useSupabaseUser()`/redirect conveniences, but you avoid a documented race condition in the module's SPA/`ssr:false` auth flow and avoid depending on a cookie mechanism that assumes a server exists. Session persists in `localStorage` automatically (Supabase SDK default), which fits a project that already treats `localStorage` as the client-state boundary (cart, favorites).

**Example:**
```js
// app/plugins/supabase.client.js
import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const supabase = createClient(config.public.supabaseUrl, config.public.supabaseAnonKey)
  return { provide: { supabase } }
})
```

### Pattern 2: Admin section as a route-rule SPA island

**What:** `routeRules: { '/admin/**': { ssr: false, prerender: false } }` in `nuxt.config.ts`. This is Nuxt's own documented pattern for "static content site + dynamic admin section."
**When to use:** Any time an otherwise-static site needs an auth-gated, always-fresh section. This is not optional here — it is the fix for a real bug class, not a style preference.
**Trade-offs:** The admin bundle ships as a client-rendered shell (slightly slower first paint, irrelevant for an internal single-user tool), but this is what makes the auth guard actually run on every load.

**Why this matters (the pitfall it avoids):** In a fully prerendered route, Nuxt's page middleware conceptually "already ran" when the static HTML was generated at build time. On a hard reload/direct navigation to a prerendered admin page, the auth-check middleware does not re-execute the way it does during SPA client-side navigation — so a build-time-rendered admin page could flash or serve stale gated content before hydration corrects it. Excluding `/admin/**` from prerendering removes the static HTML entirely: there is nothing to serve except an empty shell that mounts, runs middleware, and checks the Supabase session client-side, every single time.

### Pattern 3: Client-only fetch for live catalog data (the network-fetch extension of the existing localStorage rule)

**What:** Do **not** fetch the product/category list with `useAsyncData`/`useFetch` on a prerendered route. Fetch it in a client plugin or `onMounted`, the same way `cart.client.js`/`favorites.client.js` hydrate from `localStorage` today.
**When to use:** Any data that must reflect edits made after the last deploy, on a site using the `static` Nitro preset.
**Trade-offs:** You give up Nuxt's automatic build-time payload caching (meaning: no instant paint of catalog content on first load — there will be a brief loading state), but you gain correctness: the alternative silently serves build-time-frozen data until the next `nuxt generate` + deploy.

**Why this matters:** `nuxt generate` executes `useAsyncData`/`useFetch` calls at build time and bakes the result into a static `_payload.json` next to the HTML. The client hydrates from that frozen payload instead of re-fetching. Since this project's whole point is "Lírio edits the catalog without a dev," a catalog fetched via `useAsyncData` would only ever show what existed at the last deploy — defeating the feature. This is the same class of bug the project already survived once with `localStorage` (documented in the existing `ARCHITECTURE.md`): async/external data must cross into Vue state only after the client has taken over, never assumed identical between server and client.

```js
// app/plugins/catalog.client.js
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:suspense:resolve', () => {
    useCatalogStore().fetchAll() // hits Supabase from the browser, not at build time
  })
})
```

### Pattern 4: Single-admin RLS — role check, not row ownership

**What:** Because there is exactly one admin account and public signup is disabled, RLS policies key off `auth.role() = 'authenticated'` rather than `user_id = auth.uid()` row ownership (the pattern most Supabase RLS tutorials show, aimed at multi-tenant apps).
**When to use:** Single-operator admin panels where "logged in" and "is the admin" are the same fact — no need to also prove which row a user owns.
**Trade-offs:** Simpler policies, fewer columns (no `owner_id` needed on `products`/`categories`), but this only holds as long as public signup stays disabled. If the project ever needs a second admin, revisit before that policy design is load-bearing for more than convenience.

```sql
-- products table
alter table products enable row level security;

create policy "public can read available products"
  on products for select
  to anon, authenticated
  using (archived = false);

create policy "authenticated can read all products"
  on products for select
  to authenticated
  using (true);

create policy "authenticated can write products"
  on products for insert with check (auth.role() = 'authenticated')
  ;
create policy "authenticated can update products"
  on products for update
  using (auth.role() = 'authenticated');
```

## Data Flow

### Request Flow — Public Catalog Read (post-migration)

```
Browser mounts (SSR-hydrated, static HTML already painted with empty/loading state)
    ↓
app:suspense:resolve fires
    ↓
app/plugins/catalog.client.js → catalogStore.fetchAll()
    ↓
app/services/productsApi.list() → supabase.from('products').select().eq('archived', false)
    ↓  (network round-trip, RLS applies anon-role SELECT policy)
catalogStore.products = result   (loading = false)
    ↓
useCatalog.filterProducts(products, filters, favorites.ids)   ← UNCHANGED pure logic
    ↓
CatalogSection re-renders with catalog.results
```

### Request Flow — Admin Creates a Product

```
Lírio navigates to /admin/products/new
    ↓ (route excluded from prerender — ssr:false, empty shell mounts)
app/middleware/admin.js checks authStore.session → redirects to /admin/login if absent
    ↓
Form component collects fields + an image File
    ↓
useImageCompression.compress(file) → resized Blob (in-browser, before any network call)
    ↓
useProductForm.validate(fields) → { valid, payload }   ← pure, testable
    ↓ (if valid)
services/storageApi.upload(blob, path) → Supabase Storage (RLS: authenticated-only INSERT)
    ↓ returns public URL / path
services/productsApi.create({ ...payload, image: path }) → Postgres insert (RLS: authenticated-only INSERT)
    ↓
catalogStore.fetchAll() (or optimistic push) refreshes admin's own product list
```

### State Management

```
Supabase (source of truth)
    ↓ (client-only fetch, never build-time)
services/*Api.js (impure I/O boundary)
    ↓
Pinia store (catalog.js: products, loading, error / auth.js: session, user)
    ↓ (computed / reactive read)
composables (pure transforms: filter, sort, validate — same as Phase A)
    ↓
Components (render, dispatch store actions on user interaction)
```

### Key Data Flows

1. **Public catalog read:** Supabase → `productsApi` → `catalogStore.products` (client-only, post-hydration) → `useCatalog` filtering (unchanged) → UI. No prices ever added to this path — the public `SELECT` policy can even omit the `price` column entirely by querying an explicit column list instead of `select('*')`, which is a stronger guarantee than "component ignores price."
2. **Admin write:** Form → pure validation composable → service (Supabase insert/update, RLS-gated to `authenticated`) → store refresh. Business rule "archive, never delete" is enforced by `productsApi.archive(id)` doing an `UPDATE archived = true`, never a `DELETE` — the service layer is where this rule is now encoded (previously N/A in Phase A).
3. **Auth state:** Supabase session (persisted in `localStorage` by the SDK) → `authStore` (subscribes to `onAuthStateChange`) → `admin.js` middleware gate. This is a second, independent instance of the "async/external source → Vue state" boundary, but because `/admin/**` is `ssr:false`, it never has to coordinate with server-rendered HTML the way cart/favorites do — it only has to be resolved before the guarded page renders, which `defineNuxtRouteMiddleware` running on every client navigation already guarantees.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|---------------------------|
| ~500 products / 1 admin (this project's actual target) | Architecture above is sufficient as-is. A single `fetchAll()` on page load is fine at this size — no pagination needed for the public catalog. |
| Admin panel with many concurrent edits (not this project) | N/A — single-admin by explicit decision (Key Decisions in PROJECT.md). Do not build for this. |
| Catalog grows past a few thousand items (Fase C territory, not now) | Would need server-side filtering (Postgres `WHERE`/`ILIKE` via RPC or `.filter()`) instead of client-side `filterProducts()` over the full array, plus pagination. Out of scope for Phase B — flag as a Phase C concern if the ~500-product target is exceeded. |

### Scaling Priorities

1. **First real constraint:** none at ~500 products — a full-table client-side fetch + in-memory filter (today's `useCatalog` pattern) comfortably handles this size. Don't add pagination/server-side search preemptively.
2. **Second, only if catalog size grows well past Phase C's ~500 target:** move filtering into Postgres queries; `useCatalog`'s pure functions would then operate on an already-narrowed page of results instead of the whole table.

## Anti-Patterns

### Anti-Pattern 1: Fetching the catalog with `useAsyncData`/`useFetch` on a prerendered route

**What people do:** Reach for Nuxt's "recommended" data-fetching composables out of habit, because that's the SSR/SSG best practice for content that doesn't change after deploy.
**Why it's wrong:** On the `static` preset, this bakes the query result into the build-time payload. Lírio's admin edits would never appear on the live public site until the next manual `nuxt generate` + Cloudflare Pages deploy — silently defeating the entire point of Phase B.
**Do this instead:** Fetch client-side only, after `app:suspense:resolve` (Pattern 3 above), same rule as the existing `localStorage` hydration plugins.

### Anti-Pattern 2: Importing the Supabase client directly in components or composables

**What people do:** `import { useSupabaseClient } from '#imports'` (or a raw `createClient()` call) directly inside a `.vue` component or inside `useCatalog.js`.
**Why it's wrong:** Reintroduces exactly the coupling Phase A avoided — business/transform logic becomes untestable outside a live network/Vue context, and table/column names leak across the codebase instead of living in one place.
**Do this instead:** Only `app/services/*.js` files import the Supabase client. Stores call services; composables never see Supabase at all.

### Anti-Pattern 3: Row-ownership RLS policies for a single-admin app

**What people do:** Copy a `user_id = auth.uid()` ownership policy from a multi-tenant SaaS tutorial (the most common example in Supabase docs/blogs).
**Why it's wrong:** Adds an unnecessary `owner_id` column and join logic for a business that will only ever have one admin account (a "Múltiplas contas ou permissões" is explicitly Out of Scope in PROJECT.md).
**Do this instead:** Use a role check (`auth.role() = 'authenticated'`) — see Pattern 4. Revisit only if multi-admin ever becomes a real requirement.

### Anti-Pattern 4: Relying on the service_role key anywhere in client code

**What people do:** Use `supabase.auth.admin.inviteUserByEmail()` or other service-role-gated calls from the browser to bootstrap the admin account, because Supabase's docs show this pattern for invite-only auth.
**Why it's wrong:** `service_role` bypasses RLS entirely; if it ever ships in a client bundle (even by accident, e.g. via an env var prefixed for client exposure), the whole database is unprotected. This project also has no server/Edge Function to hold that key safely.
**Do this instead:** Create the single admin account once, manually, via the Supabase Dashboard (Authentication → Users → Add user), then disable public signup (Authentication → Providers → Email → toggle off). No invite flow, no service-role key, ever, in this codebase.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|----------------------|-------|
| Supabase Postgres | `@supabase/supabase-js` client, RLS-gated `select`/`insert`/`update` via `app/services/*Api.js` | No `DELETE` policy needed on `products`/`categories` at all — archiving is an `UPDATE`, and "delete" is simply never exposed, which is a stronger enforcement of the business rule than a UI convention |
| Supabase Storage | `storageApi.upload(blob, path)` after client-side compression | Bucket can be public (simpler `getPublicUrl()` for the catalog's `<img>` tags) as long as an explicit `authenticated`-only INSERT policy exists on `storage.objects` — public bucket ≠ no RLS |
| Supabase Auth | `supabase.auth.signInWithPassword`, `onAuthStateChange`, session in `localStorage` | Public signup disabled at the project level (Dashboard toggle), so "authenticated" and "is Lírio" are equivalent facts — no custom role/claim needed |
| Cloudflare Pages | Static asset host only, unchanged from Phase A | Confirms constraint from PROJECT.md: Supabase integration requires zero server-side code, so the `cloudflare-pages` Nitro preset and `static` mode don't need to change |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|----------------|-------|
| `app/services/` ↔ `app/stores/` | Direct async function calls, store awaits and assigns to state | Services throw on error; stores catch and set an `error` ref — components read `store.error` for user-facing messages |
| `app/stores/` ↔ `app/composables/` | Store passes plain data into pure functions, assigns the return value back | Identical to the existing Phase A pattern — no change in this boundary's shape, only in where the input array originates |
| Public routes ↔ Admin routes | No shared runtime state beyond the Supabase client instance and, indirectly, the same Postgres tables | `authStore` only matters inside `/admin/**`; public pages never check auth state |
| `useImageCompression` ↔ `storageApi` | Compression always happens first, synchronously in the browser, before any network call | Enforces the CLAUDE.md rule "toda imagem é comprimida... antes do upload" at the architecture level — `storageApi.upload()` should accept only an already-processed `Blob`/`File`, never a raw camera photo, making it structurally hard to skip this step |

## Suggested Build Order (for roadmap sequencing)

1. **Schema + RLS first, UI last.** Define `products`/`categories` tables and their RLS policies (Pattern 4) before writing any admin form. Getting a write to fail silently against an untested policy after a UI is built is a much slower feedback loop than testing policies directly against the client SDK first.
2. **`app/services/` layer before stores are touched.** Write and manually verify `productsApi`/`categoriesApi`/`storageApi` against the real Supabase project (a small script or Vitest integration test hitting a dev project) before wiring them into Pinia — isolates "is my RLS/query wrong" from "is my Vue reactivity wrong."
3. **Auth (Pattern 1 + single-admin bootstrap) before any admin route exists.** The `/admin/**` route-rule change and `admin.js` middleware are meaningless without a real session to check — stand up login first, confirm session persists across reloads, then build guarded pages behind it.
4. **Route-rules SPA-island change (Pattern 2) alongside the first admin page**, not after several admin pages already exist — retrofitting `ssr:false` onto an admin tree that assumed prerendering could resurface the same hard-reload/auth-flash bug this pattern exists to prevent.
5. **Public catalog migration to Supabase (Pattern 3) can happen in parallel with admin CRUD, but do it after Step 1–2**, since it depends on the same `products`/`categories` schema and the same `productsApi.list()` the admin list view will also use.
6. **Image compression composable last among the new pieces** — it's the most self-contained (pure browser API work, no Supabase dependency) and the hardest to unit-test, so it benefits from being built against a real upload flow that already works end-to-end with a placeholder (uncompressed) file first.

## Sources

- [Nuxt Prerendering docs (v4)](https://nuxt.com/docs/4.x/getting-started/prerendering) — MEDIUM confidence, official docs; confirms `useAsyncData`/`useFetch` results are baked into build-time `_payload.json` for prerendered routes
- [Nuxt Rendering Modes concepts](https://nuxt.com/docs/guide/concepts/rendering) — MEDIUM confidence, official docs; documents the "static content site + admin section" hybrid rendering use case via `routeRules: { ssr: false, prerender: false }`
- [Nuxt Supabase module introduction](https://supabase.nuxtjs.org/getting-started/introduction) — MEDIUM confidence, official module docs; confirms `useSsrCookies: false` / plain-client fallback for static/SSG sites
- [nuxt-modules/supabase Issue #496 — race condition in SPA auth flow](https://github.com/nuxt-modules/supabase/issues/496) — MEDIUM confidence, maintained-repo issue tracker
- [Nuxt/nuxt Discussion #8688 — middleware & Supabase auth](https://github.com/nuxt/nuxt/discussions/8688) — MEDIUM confidence, official repo discussion
- [Supabase Storage Access Control docs](https://supabase.com/docs/guides/storage/security/access-control) — MEDIUM confidence, official docs; public bucket vs RLS distinction
- [Supabase RLS troubleshooting/performance docs](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv) — MEDIUM confidence, official docs
- [Supabase Auth — invite-only / disable signup discussion](https://github.com/orgs/supabase/discussions/4296) — MEDIUM confidence, official org discussion; basis for the "manual dashboard bootstrap, no service-role key in client" recommendation
- Cross-referenced community write-ups (makerkit.dev, dev.to, Alexander Lichter's `nuxt3-dynamic-ssr-spa`) used only to corroborate the above official sources, not as standalone authority

---
*Architecture research for: Supabase integration on a static Nuxt/Cloudflare Pages catalog site (Lírio Site, Phase B)*
*Researched: 2026-08-29*
