# Feature Research

**Domain:** Single-admin product catalog admin panel (Supabase-backed), no payments, no multi-tenant
**Researched:** 2026-08-29
**Confidence:** MEDIUM (Supabase-specific claims cross-checked against official docs; general admin-panel UX patterns are LOW-confidence community consensus, but low-risk/well-established)

## Feature Landscape

### Table Stakes (Users Expect These)

Features the Lírio needs on day one, or the panel fails its one job: letting him run the catalog without a dev.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Single-admin login (Supabase Auth, email/password) | No panel is usable without a locked door — everything else sits behind it | LOW | One seeded user, no signup flow, no password-reset UI needed initially (Lírio can reset via Supabase dashboard if locked out) |
| Route guard on all `/admin` pages | Prevents an unauthenticated visitor from ever seeing admin UI, even briefly | LOW | Nuxt middleware checking Supabase session; redirect to login on miss |
| Product list view with search + category filter | At the target scale (~500 products), scrolling to find one item is unusable | MEDIUM | Search is already proven in the public catalog (`useCatalog.js`) — same normalize/fuzzy pattern can be reused server- or client-side |
| Pagination (or virtualized list) on product list | Loading 500 rows at once is slow and makes the list feel broken | MEDIUM | Supabase `.range()` for offset pagination is enough; no need for cursor pagination at this scale |
| Product create/edit form | The actual job: name, category, description, availability, `isNew` flag, image, internal price | MEDIUM | Price field exists in the form/DB but is never sent to the public read — enforce this at the query/select level, not just in the UI |
| Category select constrained to existing categories | A product must belong to a category that exists; free text breaks the public catalog's category filter | LOW | Simple `<select>` populated from the categories table |
| Icon picker constrained to the existing icon set | Categories use `icon: 'gift'` keys resolved by `<AppIcon>`, not arbitrary SVGs or emoji (see CLAUDE.md) | MEDIUM | Build a fixed list/dropdown of the known icon keys already shipped as `Icon*.vue` components — do not add an icon-library dependency or free-text icon input |
| Image upload with client-side compression | Images come straight from Lírio's phone; uncompressed originals must never reach Storage (explicit business rule) | MEDIUM | `browser-image-compression` (npm) is the standard, battle-tested choice — canvas-based, resizes + compresses, optional web-worker mode so the UI doesn't freeze on a big phone photo |
| Archive / unarchive toggle (not delete) | Business rule: unavailable products disappear from the public catalog but stay in the database | LOW | Boolean `is_archived` column; public queries add `WHERE is_archived = false`; admin list needs a way to view/filter archived items too, or they become invisible to Lírio as well |
| Category CRUD: create, edit, remove | Explicit Active requirement — Lírio manages categories without a dev | MEDIUM | "Remove" needs a decision for categories that still have products attached (see Feature Dependencies) |
| Category reorder (drag-and-drop or up/down) | Explicit Active requirement — category order matters for the public catalog's category bar | MEDIUM | A simple `sort_order` integer column + drag-reorder UI (or simpler up/down arrow buttons, which is lower complexity and just as usable for ~10 categories) |
| Row Level Security on product/category tables | Without RLS, anyone with the anon key can write to the catalog | MEDIUM | Enable RLS, deny-all by default; explicit INSERT/UPDATE/DELETE policies gated on `auth.uid()` matching the single known admin; public SELECT stays open (filtered to non-archived) |
| Save/error feedback (toast or inline message) | Silent failures on a form that writes real data erode trust fast | LOW | Project already has a `toast` Pinia store from Phase A — reuse it |
| Public catalog reads from Supabase | Explicit Active requirement — replaces `app/data/products.js` / `categories.js` as source of truth | MEDIUM-HIGH | Must respect the SSR/hydration trap already documented in the codebase (`app:suspense:resolve`) — Supabase fetch on first load needs the same care as the existing localStorage hydration |
| Empty states for zero products / zero categories | The database starts intentionally empty (Key Decision in PROJECT.md) | LOW | Both the admin panel and the public catalog need a sane "nothing here yet" state, not a blank crash |

### Differentiators (Competitive Advantage — Nice to Have, Not Required for This Phase)

None of these are required by the Active requirements in PROJECT.md. They would make the panel more pleasant to use as the catalog grows toward ~500 items, but adding them now risks scope creep into what's explicitly deferred to later phases.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Duplicate/clone product | Loja de variedades likely has many near-identical items (same product, different color/size); cloning speeds data entry a lot more than a blank form each time | LOW | Copy all fields except id/image, let Lírio tweak and re-upload image |
| Bulk actions (archive many at once, bulk category reassign) | Useful once the catalog nears 500 items and a supplier line gets discontinued at once | MEDIUM | Only worth it once real data volume justifies it — defer until Fase C load-in is done and pain is felt |
| Multi-image gallery per product | Current data model only has one `img` per product; a gallery is a real UX upgrade for showing an item from multiple angles | MEDIUM-HIGH | Would require a schema change (`product_images` join table) — bigger than this phase's stated scope |
| Auto-compute `isNew` from `created_at` instead of a manual toggle | Removes a manual step Lírio will forget to turn off, keeping "novidades" accurate | LOW | E.g. `isNew = created_at > now() - interval '30 days'` computed at query time; cheap win, but not requested, flag it as a suggestion rather than build it silently |
| Public-catalog preview while editing | Reduces guesswork about how a product card/description will actually look before saving | MEDIUM | Nice trust-builder for a non-technical single admin, but adds UI surface for a "phase 1 of a backend" milestone |
| Autosave draft on the product form | Protects against losing a half-filled form (phone photo upload can be slow) | MEDIUM | Only worth it if in-field usage reveals lost-work complaints — premature otherwise |

### Anti-Features (Commonly Seen in Admin Panels, Wrong for This Project)

| Feature | Why Requested (in general) | Why Problematic Here | Alternative |
|---------|---------------------------|----------------------|-------------|
| Multi-user roles / permissions | "Standard" admin panels assume a team | PROJECT.md explicitly scopes this to a single admin; RLS policies, UI, and auth flows built for roles are pure overhead with zero present value | Hardcode the single known admin's `auth.uid()` in RLS policies; revisit only if a second staff account is ever requested |
| Inventory / stock count | Feels like a natural companion to "product management" | Explicitly out of scope — business model has no stock tracking, only available/archived | Keep the binary availability flag; do not add a quantity field "just in case" |
| Checkout, order list, or payment status inside the admin panel | E-commerce admin templates bundle this by default | Not an e-commerce site; every order is a WhatsApp conversation the site never sees again | Nothing to build — this is a hard boundary, not a deferred feature |
| Hard delete of products/categories | Seems simpler than "archive" | Violates the explicit business rule (products are archived, never deleted) and destroys data Lírio might want back | Archive/unarchive via `is_archived`; reserve hard delete (if ever) for a manual DB operation, not a UI button |
| Rich text editor for product description | Looks more "professional" | Adds a dependency, a sanitization/XSS surface, and complexity for what's a one-paragraph description field in the existing data model (`desc: string`) | Plain `<textarea>`, same as the Phase A data model already assumes |
| CSV/spreadsheet import in this phase | Feels efficient given ~500 products are coming | Explicitly deferred to Fase C in PROJECT.md; building it now duplicates the "how do I get real supplier data in" problem before it's been scoped | Manual entry via the product form for this phase; import tooling is a separate, later phase |
| Analytics / reporting dashboard (views, best-sellers, etc.) | "Every admin panel has a dashboard" | No event tracking exists in this project by design (site is `noindex`, no analytics), and it's not in Core Value | Skip entirely; if ever wanted, it depends on analytics infrastructure that doesn't exist |
| Real-time/collaborative editing (live sync between two open admin tabs) | Supabase makes realtime subscriptions easy, tempting to "just use it" | Single admin, single session in practice — realtime sync solves a problem that doesn't exist here and adds a moving part | Plain fetch/refetch on save; no Supabase Realtime subscription needed |
| Free-form icon upload for categories | Feels more flexible than a fixed picker | Breaks the project's deliberate "icon is a component, not a library" convention (CLAUDE.md) — arbitrary SVGs bypass the curated Lucide set and the `<AppIcon>` resolution pattern | Icon picker restricted to the existing `Icon*.vue` key set |
| Admin management UI for banners/services (relógio, canecas, canetas) | Feels inconsistent to manage products via UI but banners via code | Not in the Active requirements for this phase — only product and category CRUD are in scope | Leave banners/services as static data for now; revisit only if a future phase asks for it |

## Feature Dependencies

```
Auth (Supabase, single admin)
    └──requires──> nothing (first gate)

Route guard on /admin
    └──requires──> Auth

Category CRUD (create/edit/reorder/remove)
    └──requires──> Auth
    └──requires──> RLS policies (write gated to admin)

Product CRUD (create/edit/archive)
    └──requires──> Auth
    └──requires──> Category CRUD (a category must exist before a product can be assigned one)
    └──requires──> RLS policies (write gated to admin)

Image upload (client-side compression -> Storage)
    └──enhances──> Product CRUD (embedded in the product form)
    └──requires──> browser-image-compression (or equivalent) integrated client-side

Archive/unarchive
    └──requires──> Product CRUD (is_archived column on products table)

Public catalog migration to Supabase
    └──requires──> Product CRUD (schema finalized)
    └──requires──> Category CRUD (schema finalized)
    └──requires──> RLS policies (public SELECT allowed, filtered to non-archived)
    └──requires──> SSR-safe fetch pattern (same care as existing localStorage hydration trap)

Category deletion ──conflicts──> Products still referencing that category
```

### Dependency Notes

- **Product CRUD requires Category CRUD:** every product needs a valid category value for the public catalog's category filter to keep working. Category management must exist and have at least a default category before product creation is meaningful — this makes Category CRUD the natural first slice of this phase, not an afterthought bolted on after products.
- **Category deletion conflicts with existing products:** this is the one real design decision this research surfaces that PROJECT.md doesn't yet resolve. Three options, roughly in order of recommendation:
  1. **Block deletion** if any non-archived product references the category (simplest, safest, matches "don't lose data" spirit of the whole archive-not-delete philosophy).
  2. **Reassign to a fallback "Sem categoria" category** on delete (more work, avoids ever blocking Lírio, but creates an implicit category he didn't choose to make).
  3. **Cascade-archive** every product in that category (dangerous — silently archives products, easy to regret).
  Recommend (1): surface a clear message ("Esta categoria tem N produtos — mova-os antes de remover") rather than doing anything implicit. This should be raised explicitly during requirements/planning, not decided silently in implementation.
- **Image upload enhances, doesn't block, Product CRUD:** a product can plausibly be saved without an image (placeholder shown in the UI) and have the image added in a second pass — this avoids forcing a slow phone-photo upload to gate the very first save of a new product record.
- **Public catalog migration requires the SSR-safe fetch pattern:** the project has already been bitten twice by reading async data before hydration completes (documented in CLAUDE.md and ARCHITECTURE.md for `localStorage`). The Supabase fetch for the public catalog is the same class of hazard and deserves the same discipline — flag this phase for deeper research/planning attention rather than assuming a plain `onMounted` fetch is safe.

## MVP Definition

### Launch With (v1 — this phase, matches PROJECT.md Active requirements exactly)

- [ ] Supabase Auth login, single hardcoded admin, route-guarded `/admin` — no panel access is possible without it
- [ ] Category CRUD: create, edit, reorder, remove (with a resolved decision on delete-with-products conflict)
- [ ] Product CRUD: create, edit, list with search + category filter + pagination
- [ ] Client-side image compression (`browser-image-compression` or equivalent) before any Storage upload
- [ ] Archive/unarchive via `is_archived`, never a hard delete, from the product list
- [ ] RLS policies: public read (non-archived only), admin-only write, on both `products` and `categories`
- [ ] Public catalog (`app/data/products.js`/`categories.js` consumers) migrated to read from Supabase

### Add After Validation (v1.x)

- [ ] Duplicate/clone product — once Lírio is actually entering dozens of similar items and feels the repetition pain
- [ ] Auto-compute `isNew` from `created_at` — small quality-of-life fix once real usage shows he forgets to toggle it off
- [ ] Bulk archive / bulk category reassign — once catalog volume from Fase C makes one-at-a-time editing genuinely slow

### Future Consideration (v2+)

- [ ] Multi-image gallery per product — needs a schema change, defer until single-image is proven insufficient
- [ ] CSV/spreadsheet import — explicitly Fase C, not this milestone
- [ ] Analytics/reporting — no infrastructure exists for it and it's not part of Core Value
- [ ] Multi-user roles — only if the business ever adds staff who need panel access

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Single-admin auth + route guard | HIGH | LOW | P1 |
| Category CRUD (incl. reorder) | HIGH | MEDIUM | P1 |
| Product CRUD (incl. search/filter/pagination) | HIGH | MEDIUM | P1 |
| Client-side image compression + upload | HIGH | MEDIUM | P1 |
| Archive/unarchive | HIGH | LOW | P1 |
| RLS policies (public read / admin write) | HIGH | MEDIUM | P1 |
| Public catalog reading from Supabase | HIGH | MEDIUM-HIGH | P1 |
| Duplicate/clone product | MEDIUM | LOW | P2 |
| Auto-compute `isNew` | LOW | LOW | P2 |
| Bulk actions | MEDIUM | MEDIUM | P3 |
| Multi-image gallery | MEDIUM | HIGH | P3 |
| CSV import | HIGH (later) | HIGH | P3 (Fase C) |

**Priority key:**
- P1: Must have for this phase (matches Active requirements in PROJECT.md)
- P2: Should have, add once real usage justifies it
- P3: Nice to have, explicitly deferred (later phase or v2+)

## Competitor / Reference Pattern Analysis

There's no direct "competitor" here (this is an internal tool, not a market product), so this compares against common admin-panel/CRUD conventions instead of named competitors.

| Feature | Typical SaaS admin panel | Typical e-commerce admin template | Our Approach |
|---------|--------------------------|-----------------------------------|--------------|
| Delete pattern | Often hard delete with a confirm dialog | Usually soft delete + a "trash" view | Archive-only (`is_archived`), no trash/restore-from-trash UI needed — archived items just reappear in an "archived" filter of the same list |
| Roles/permissions | Assumed from day one | Assumed from day one (owner/staff/etc.) | None — single hardcoded admin via RLS, explicitly out of scope |
| Stock/inventory field | Standard | Standard | Explicitly excluded — availability is binary (archived or not) |
| Image handling | Often server-side resize (Sharp, imgproxy, a CDN transform) | Same | Client-side compression only (`browser-image-compression`) — no server, this stays a static/Cloudflare Pages + Supabase-client-only architecture |
| Category management | Usually flat list, sometimes nested/tree | Usually flat or 2-level tree | Flat list with manual `sort_order`, matches existing ~10-category scale — no tree/nesting needed |

## Sources

- [Client-side image compression with Supabase Storage — mikeesto.com](https://mikeesto.com/posts/supabaseimagecompression/) (MEDIUM confidence)
- [Supabase Storage docs](https://supabase.com/docs/guides/storage) (MEDIUM confidence, official docs surfaced directly in search)
- [browser-image-compression — npm](https://www.npmjs.com/package/browser-image-compression) (MEDIUM confidence, ~1.28M weekly downloads)
- [Row Level Security — Supabase Docs](https://supabase.com/docs/guides/database/postgres/row-level-security) (MEDIUM confidence, official docs)
- [Supabase RLS Guide 2026 — designrevision.com](https://designrevision.com/blog/supabase-row-level-security) (LOW confidence, community, corroborated by official docs above)
- [Soft-Delete Pattern In Postgres — rockwood.me](http://rockwood.me/2018/soft-delete-pattern-in-postgres/) (LOW confidence, general pattern discussion)
- [Creating a soft-delete archive table with PostgreSQL — Medium/DEV](https://dev.to/anaptfox/creating-a-soft-delete-archive-table-with-postgresql-38pi) (LOW confidence)
- General admin-panel/CRUD UX pattern search (list/filter/pagination/safe-delete conventions) (LOW confidence, generic community consensus, low-risk)
- `.planning/PROJECT.md` and `.planning/codebase/ARCHITECTURE.md` (project-internal, HIGH confidence — source of truth for Active requirements and existing conventions)

---
*Feature research for: Supabase-backed admin panel + product catalog (Fase B, Lírio Pimenta)*
*Researched: 2026-08-29*
