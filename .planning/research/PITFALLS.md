# Pitfalls Research

**Domain:** Adding Supabase (Postgres + Auth + Storage) and a single-admin panel to an existing static Nuxt 4 catalog site on Cloudflare Pages
**Researched:** 2026-08-29
**Confidence:** MEDIUM (cross-checked across official Supabase docs + multiple independent write-ups; no project-specific precedent exists yet since this is the project's first backend)

## Critical Pitfalls

### Pitfall 1: RLS never enabled, or enabled with a policy too broad to matter

**What goes wrong:**
A table gets created in Postgres, the admin panel reads/writes it fine in dev, and RLS is either never turned on (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY` never run) or turned on with a leftover "authenticated can do anything" policy from testing. The public catalog page — which talks to Supabase with the anon key, client-side, with no server in between — can then read *and write* the products/categories table directly via PostgREST, bypassing every UI restriction.

**Why it happens:**
Supabase's anon key is meant to be public (it ships in the JS bundle by design) and the whole security model shifts from "hide the key" to "restrict what the key's role can do." Teams coming from a stack where the backend gatekeeps access don't intuitively reach for RLS-per-table as the *only* gate. It's also easy to enable RLS on some tables and forget a newly-added one (e.g., a `categories` table added after `products` already had policies).

**How to avoid:**
- Every new table gets RLS enabled in the *same migration* that creates it — never as a follow-up step.
- Four separate policies per table, not `FOR ALL`: `SELECT` open to everyone (`using (true)`, but only for non-archived rows — see Pitfall 3), `INSERT`/`UPDATE`/`DELETE` restricted to `authenticated` and, since this is single-admin, ideally scoped to the one known admin `auth.uid()` rather than "any authenticated user" (in case Supabase Auth is ever used for something else later).
- Since there's only one admin, hardcode the check as `auth.uid() = '<lirio-user-uuid>'` or check against a tiny `admins` table — do NOT just check `role = 'authenticated'`, because that phrase means "logged in with any account," not "is Lírio."
- Before shipping, run a raw `curl` against the Supabase REST endpoint using only the anon key (no admin session) and confirm writes are rejected and only non-archived products come back.

**Warning signs:**
- Supabase dashboard shows a "RLS disabled" warning badge on any table — treat as a hard blocker, not a nice-to-have.
- A policy exists but references `TO authenticated` without also checking a specific user ID — that's "any logged-in user," fine for multi-user apps, wrong for single-admin.
- Admin panel CRUD "just works" the first time it's implemented, before any policy was written — that's the tell that RLS is still permissive-by-default (Supabase tables are RLS-off by default, so unrestricted reads/writes work until you lock it down).

**Phase to address:**
The phase that introduces the Supabase schema (products/categories tables) — RLS policies must ship in the same phase as the table, not deferred to a "security hardening" phase later.

---

### Pitfall 2: Product write access checked in the Vue admin UI instead of in RLS

**What goes wrong:**
The admin panel hides the "add/edit/archive" buttons unless a user is logged in, and the team treats that as the security boundary. Since Supabase is consumed directly from the browser (no server route in between, per this project's static/client-side architecture), anyone can open devtools, grab the Supabase client already in memory, and call `.from('products').insert(...)` directly — client-side auth-gating a button is a UX nicety, not a security control.

**Why it happens:**
This is the single most common mistake when moving from "our own backend validates everything" to "Supabase is the backend, called straight from the client." The mental model of "component doesn't render the button, so the action can't happen" doesn't hold when there's no server enforcing it — RLS is the only enforcement layer.

**How to avoid:**
- Treat every RLS policy as the actual security boundary; treat every UI-level `v-if="isAdmin"` as convenience only.
- Use `supabase.auth.getUser()` (which round-trips to the Auth server to revalidate the JWT) rather than `getSession()` (which just reads local storage) at the one moment it matters — right before showing the admin panel shell — but do not use either as a substitute for RLS on the data calls themselves.
- Write at least one test/manual check per mutating table: attempt the mutation as an anonymous (logged-out) Supabase client and assert it's rejected by Postgres, not just hidden by Vue.

**Warning signs:**
- No RLS policy references `auth.uid()` or a specific admin check for INSERT/UPDATE/DELETE — only the frontend route/component decides who sees the form.
- Tests exist for the composable logic (per project convention) but nothing exercises "can an unauthenticated request mutate this table."

**Phase to address:**
Same phase as the admin panel auth (Supabase Auth phase) — pair every "hide this from the UI" decision with a matching RLS check written and manually verified.

---

### Pitfall 3: "Archived" product still leaks through the public catalog because RLS/select filters and app-level filters disagree

**What goes wrong:**
The business rule is "unavailable product is archived, not deleted, and disappears from the public catalog." If the public `SELECT` RLS policy is `using (true)` (open to everyone, all rows) and the "hide archived" logic lives only in the Vue filter (`useCatalog.js`), then the archived product's full row — including whatever admin-only fields exist — is still fetched to every visitor's browser and only hidden by CSS/JS filtering. Anyone can see archived products (and any field on them) via devtools network tab or a direct API call.

**Why it happens:**
This is a direct carry-over of the project's very own Fase A pattern: filtering (search, category, availability) happens client-side over an in-memory array that already contains everything. That pattern is fine when the "everything" is static JSON checked into the repo — it stops being fine once "everything" includes rows the business rule says shouldn't be public.

**How to avoid:**
- The public `SELECT` RLS policy for `products` must itself exclude archived rows: `using (is_archived = false)` (or `status = 'active'`), not `using (true)`. The admin, authenticated as the single admin, gets a second policy that also allows selecting archived rows (`using (auth.uid() = admin_id)` or similar) so the panel can un-archive things.
- Client-side filters (search/category/favorites) stay exactly as they are today — those are UX conveniences on top of an already-safe row set, not a security boundary.

**Warning signs:**
- Only one `SELECT` policy exists per table and it doesn't reference an availability/archived column.
- The admin panel's "show archived products" view works by fetching the *same* query the public catalog uses and filtering client-side — if that's true, the public catalog is also fetching archived rows.

**Phase to address:**
Same phase as the Supabase schema/RLS phase — the archived-row exclusion is a `SELECT` policy detail, not a separate feature.

---

### Pitfall 4: SSR/hydration race condition recurs with the Supabase catalog fetch, same class of bug that already bit the project twice with localStorage

**What goes wrong:**
The project's own `ARCHITECTURE.md` documents that reading `localStorage` before the `app:suspense:resolve` hook causes a server/client `class` mismatch that Vue never self-corrects, "bitten twice." The exact same failure mode applies to any async Supabase fetch that isn't handled the SSR-safe way: since the site is statically generated (Nitro `static` preset, no server per request), a naive `onMounted(() => supabase.from('products').select())` will render an empty/loading state in the pre-rendered HTML and then swap in real content on the client — any `class` bound to "has products" / "is loading" will mismatch exactly like the cart/favorites bug did.

**Why it happens:**
`onMounted` never runs during static generation, so the generated HTML always reflects the empty/loading state; the real content only appears after the client JS runs. If any element's class, `v-if` branch, or conditional rendering depends on "products loaded," the generated markup and the post-hydration markup diverge — the same mechanism as the localStorage bug, just a different data source.

**How to avoid:**
- For content that must be pre-rendered at build/generate time (SEO-relevant catalog listing), use `useAsyncData`/`useFetch` wrapping the Supabase call so it resolves during `nuxt generate` and gets serialized into the static payload, the same way the project already treats data as "known at build time" today via `app/data/`.
- For content that is inherently client-only or must always be fresh per visit (admin panel, cart/favorites joins against live product data), follow the exact pattern already established for localStorage: initialize state empty, fetch/hydrate only after `app:suspense:resolve` (or an equivalent client-only guard), and make sure no `class`/`v-if` in the pre-rendered shell depends on that not-yet-fetched data.
- Never mix the two: don't let a component's root element's class depend on "products array is non-empty" if products are fetched client-only after generation.

**Warning signs:**
- A Supabase `.select()` call sits directly inside `onMounted()` or a plain `ref` + immediately-invoked async function in `<script setup>`, with no `useAsyncData`/`useFetch` wrapper and no suspense-hook gating.
- Any element's `:class` or `v-if` toggles based on a Supabase-sourced value that hasn't gone through one of the two patterns above.
- Console warnings about hydration mismatch appear in dev, or (worse) don't appear but users report "flash of empty catalog" or elements looking subtly wrong on first paint — the same silent failure mode noted in `CONCERNS.md`.

**Phase to address:**
The phase that migrates the public catalog from `app/data/` to Supabase — this is the highest-risk phase for recurrence of the project's known SSR trap, and should explicitly re-verify the `app:suspense:resolve` pattern against the new async source before merging.

---

### Pitfall 5: Client-side image compression skips EXIF orientation correction, so phone photos upload sideways

**What goes wrong:**
The project's rule is "every image is compressed and resized in the browser before upload; never send the original to Storage." Photos taken on Lírio's phone often carry EXIF orientation metadata (the sensor records landscape, the phone rotates it for display via a flag). If the compression code draws the image straight onto a `<canvas>` without reading and applying that EXIF orientation flag first, the exported (re-encoded) image loses the rotation instruction — because Canvas re-export strips all EXIF metadata — and the photo displays sideways or upside-down everywhere it's used afterward, with no metadata left to fix it after the fact.

**Why it happens:**
The orientation flag lives in EXIF metadata, not in pixel data; a naive `canvas.drawImage(img, 0, 0)` copies pixels as decoded by the browser (which usually *does* respect EXIF for on-screen `<img>` display) but the moment you draw into a canvas at a specific width/height and export via `toBlob`/`toDataURL`, that correction has to be reapplied manually — it isn't automatic in every browser/library combination, and once exported the original EXIF is gone.

**How to avoid:**
- Read the EXIF orientation tag before drawing to canvas, and rotate/flip the canvas context accordingly (swap width/height for the 90°/270° cases) — do this even when using a compression library, and verify the library handles it (not all do by default).
- Resize dimensions first, then adjust JPEG/WebP quality — resizing a 12MP phone photo down to realistic product-image dimensions (e.g., 1200px longest edge) before tweaking quality gives far better size/quality tradeoffs than keeping full resolution and just lowering quality.
- Test with at least one photo taken directly in portrait orientation on the actual phone used for the catalog — orientation bugs don't show up with desktop-webcam or pre-rotated test images.

**Warning signs:**
- Compression code calls `canvas.drawImage()` with no prior read of `image.exifdata` / no orientation-correction step.
- Test images used during development are already correctly oriented (e.g., screenshots, downloaded stock photos) rather than raw phone camera captures.

**Phase to address:**
The phase that implements image upload/compression for the admin panel — verify with a real phone-camera photo before considering the feature done.

---

### Pitfall 6: Supabase Storage bucket set to "public" is assumed to mean "no RLS needed," breaking uploads

**What goes wrong:**
"Public bucket" in Supabase Storage only means reads don't require a signed URL — it does *not* mean uploads, updates, or deletes skip RLS. A team sets the product-images bucket to public (reasonable, since catalog images should load without auth) and then is confused when the admin panel's upload fails, because `storage.objects` still needs an `INSERT` policy explicitly granting the admin (not `anon`) permission to write into that bucket.

**Why it happens:**
"Public" and "no access control" sound like the same thing, but Supabase splits bucket-level settings (what the bucket *accepts*: public/private, mime types, size limits) from RLS policies on `storage.objects` (who may read/write specific files) — these are two independent layers, and it's easy to configure one and assume it covers the other.

**How to avoid:**
- Set the product-images bucket to public (so `<img>` tags load without signed URLs, matching how the site already serves static images from `public/img/`).
- Separately write RLS policies on `storage.objects` scoped to that bucket: `SELECT` open to everyone (already implied by "public" for reads, but still worth an explicit policy for clarity), `INSERT`/`UPDATE`/`DELETE` restricted to the authenticated admin only — never to `anon`.
- If uploads fail with a permission-looking error, check RLS on `storage.objects` before assuming it's a bucket mime-type/size-limit problem (the two failure modes look similar from the client but are configured in different places).

**Warning signs:**
- Bucket is public but no policy exists on `storage.objects` for that bucket's `INSERT`/`DELETE`.
- Upload errors are vague (permission denied) and get debugged by changing bucket size/mime settings instead of checking storage RLS policies.

**Phase to address:**
The image upload/Storage integration phase, alongside the product-table RLS work — do both in the same pass since the failure mode and fix are structurally identical.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|-----------------|------------------|
| One "authenticated can do anything" RLS policy instead of per-admin, per-operation policies | Faster to ship the panel | If Supabase Auth is ever used for anything beyond the single admin (e.g., a second staff account later), every table silently opens up to that new account with no review | Never for this project's stated single-admin model — write the narrow policy from day one, it costs the same effort |
| Public `SELECT` policy with `using (true)` on the full products table, filtering archived rows only in Vue | Simpler policy to write initially | Archived product data (and any admin-only fields added later, e.g. cost price) is fetched to every visitor's browser | Never — the archived-row filter belongs in the policy, not the UI |
| Skipping EXIF-orientation handling in v1 of the compression code because desktop test photos look fine | Faster to ship the upload feature | First real product photo taken by Lírio on his phone uploads sideways, silently, with no way to detect it without opening the file | Never — orientation bugs are invisible until a real phone photo is used; test with one before calling it done |
| Fetching the full catalog client-side after mount instead of via `useAsyncData` at generate time | Faster to wire up initially, feels like "just like the Supabase quickstart" | Reintroduces the exact SSR/hydration class-mismatch bug already documented twice in this project's `ARCHITECTURE.md` | Acceptable only for genuinely client-only surfaces (the admin panel itself, which isn't SEO-relevant and isn't pre-rendered) — never for the public catalog listing |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|-----------------|-------------------|
| Supabase RLS | Checking `TO authenticated` without also checking *which* authenticated user | For single-admin: check `auth.uid() = '<admin-uuid>'` or join against a one-row `admins` table |
| Supabase Storage | Assuming "public bucket" means uploads don't need RLS | Write explicit `INSERT`/`UPDATE`/`DELETE` policies on `storage.objects` scoped to the admin, independent of the bucket's public read setting |
| Supabase Auth on a static/client-only Nuxt app | Trusting `getSession()` (reads local storage, no server round-trip) as proof of a valid admin session for anything sensitive | Use `getUser()` (revalidates against the Auth server) at the point of gating the admin UI shell; still enforce everything through RLS regardless |
| Nuxt static generation + Supabase fetch | Fetching catalog data in `onMounted()` and expecting SEO/pre-rendered content to include it | Use `useAsyncData`/`useFetch` so the fetch resolves during `nuxt generate` and is baked into the static payload |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|-----------------|
| RLS policy calls `auth.uid()` directly instead of `(select auth.uid())` | Queries against the products/categories tables get slower as row count grows, even though data volume (~500 products) is modest | Always wrap `auth.uid()`/`auth.role()`/`auth.jwt()` in a `select` subquery inside policies so Postgres evaluates it once per query (an "init plan") instead of once per row | Noticeable once a table has more than a few hundred rows — arrives right around this project's expected ~500-product scale, so worth doing correctly from the first policy written, not retrofitted later |
| Client-side full-catalog fetch with no pagination once Supabase replaces `app/data/` | Public catalog page fetches all ~500 rows on load; this was already flagged in the project's own `CONCERNS.md` as a scaling limit even for the static-data version | Keep the same in-memory filter/search UX, but fetch is now a single bounded Supabase query rather than a bundled JS file — still fine at ~500 rows; add `select` column narrowing (skip admin-only columns for the public query) rather than full-table `select(*)` | Not a Phase B problem at ~500 products; becomes one only if the catalog grows an order of magnitude beyond current scale (Fase C territory) |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Assuming the anon key being public in the JS bundle is itself a vulnerability, and trying to "hide" it | False sense of security if RLS is skipped because "the key is safe" — the key is *always* public by design, safety comes only from RLS | Treat the anon key as public infrastructure (like a URL), and put 100% of the security review effort into the RLS policies instead |
| `service_role` key ever reaching client-side code (e.g., pasted into a `.env` that gets bundled, or used "temporarily" in a Nuxt plugin for convenience) | Full RLS bypass — complete read/write access to every table for anyone who extracts the key from the bundle | `service_role` key must never leave a trusted server context; since this project has no server-side Node runtime in production, there is no legitimate place for `service_role` to be used at all — if a use case seems to need it, that's a sign the design is wrong, not that the key should be added client-side |
| No RLS policy limiting `SELECT` on `products`/`categories` to non-archived rows, relying on the admin panel/public catalog UI split to "naturally" separate them | Archived products (and any future admin-only fields) are fetched to every anonymous visitor | Write the archived-row exclusion directly into the public `SELECT` policy, as covered in Pitfall 3 |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-------------------|
| Admin panel route protection implemented purely as a Vue route guard with no immediate redirect | Lírio briefly sees a flash of the admin form shell before being redirected to login on a refreshed/direct-loaded admin URL, since Nuxt route middleware on a static/SPA-fallback site runs client-side after the JS loads | Show the admin panel behind a `ClientOnly`-guarded loading state that resolves to either the panel or a login redirect before rendering any admin UI, avoiding the flash — this is a UX nicety layered on top of the RLS security boundary, not a substitute for it |
| Silent failure when a mutation is rejected by RLS (e.g., a bug leaves a policy too strict and the admin can't save a product) | Looks like "the button doesn't work," with no error surfaced, since Postgres/RLS rejections come back as generic permission errors from the Supabase client | Surface Supabase error responses in the admin UI (toast/error message) rather than swallowing them — RLS bugs during development need to be loud, not silent |

## "Looks Done But Isn't" Checklist

- [ ] **RLS on products/categories tables:** Often "done" means CRUD works from the logged-in admin session — verify it's actually done by testing the same operations with the anon key / logged-out session and confirming rejection.
- [ ] **Archived product hiding:** Often implemented as a client-side filter only — verify the exclusion lives in the `SELECT` RLS policy itself, not just in `useCatalog.js`.
- [ ] **Image compression:** Often tested only with desktop/pre-rotated images — verify with a real photo taken directly on the phone that will actually be used, in portrait orientation.
- [ ] **Storage bucket access:** Often "public bucket" is treated as sufficient — verify `storage.objects` has explicit INSERT/UPDATE/DELETE policies restricted to the admin.
- [ ] **Catalog SSR/hydration:** Often "it renders" is treated as done — verify no console hydration warnings appear on a hard refresh, and that no element's class/v-if depends on a client-only-fetched value inside the pre-rendered shell.
- [ ] **Admin session validation:** Often `getSession()` alone gates the admin UI — verify `getUser()` (or equivalent server round-trip) is used at least once per admin session, and that RLS — not the UI check — is what actually stops unauthorized writes.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|-----------------|------------------|
| RLS left disabled or too broad after launch | MEDIUM | Enable/tighten RLS immediately (no schema change needed, policies are additive/editable); audit Supabase logs for any anon-key writes during the exposure window; rotate no keys are needed since anon key exposure is expected, only rotate `service_role` if it was ever exposed |
| Archived products were publicly readable via API for a period | LOW | Tighten the `SELECT` policy to exclude archived rows; no data was corrupted, only over-exposed — no recovery beyond the policy fix and confirming no sensitive fields (if any are added later) were in the exposed rows |
| A batch of product photos uploaded sideways due to missed EXIF handling | MEDIUM | Fix the compression code, then Lírio re-uploads the affected photos through the corrected panel — since Storage originals are already the compressed/resized versions (not the raw phone photo), there's no way to "re-derive" correct orientation from what's already in Storage, so re-uploading from the phone is the only path |
| SSR/hydration class mismatch recurs with a Supabase-fetched value | LOW | Same fix pattern already proven twice in this project: move the fetch behind the `app:suspense:resolve` (or `useAsyncData`) pattern; no data loss, just a rendering bug |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|-------------------|----------------|
| RLS disabled or too broad (Pitfall 1) | Schema/RLS-setup phase (same phase the `products`/`categories` tables are created) | Anonymous `curl`/client test against the REST API confirms reads limited to non-archived rows and writes rejected without an admin session |
| UI-only admin gating (Pitfall 2) | Supabase Auth / admin panel phase | Manual test: attempt a mutation via a logged-out Supabase client and confirm rejection at the database level, independent of what the UI shows |
| Archived rows leaking via open `SELECT` (Pitfall 3) | Schema/RLS-setup phase | Fetch products as an anonymous client and confirm archived items are absent from the result set |
| SSR/hydration race with Supabase catalog fetch (Pitfall 4) | Catalog-migration-to-Supabase phase | Hard refresh with browser console open on the public catalog page: zero hydration-mismatch warnings; visually confirm no flash/incorrect class on first paint |
| EXIF orientation lost in compression (Pitfall 5) | Image upload/compression phase | Upload a real portrait-orientation phone photo through the admin panel and confirm it displays correctly in the public catalog afterward |
| Storage bucket public/RLS confusion (Pitfall 6) | Image upload/Storage phase | Confirm upload works only when authenticated as admin, and confirm a logged-out client cannot write to the bucket even though reads work |

## Sources

- [How Missing Row Level Security in Supabase Can Expose User Data (Medium)](https://medium.com/@Gakusen/how-missing-row-level-security-in-supabase-can-expose-user-data-599dcab749f3)
- [Supabase RLS: Common Misconfigurations & Risks (Securify)](https://securifyai.co/blog/supabase-row-level-security-rls-common-misconfigurations-and-security-risks/)
- [Is Supabase Safe? RLS, anon vs service_role & CVE-2025-48757 (VibeAppScanner)](https://vibeappscanner.com/is-supabase-safe)
- [Supabase RLS: Common Mistakes, the (select auth.uid()) Trap & CVE-2025-48757 Breakdown (VibeAppScanner)](https://vibeappscanner.com/supabase-row-level-security)
- [Securing your API — official Supabase docs](https://supabase.com/docs/guides/api/securing-your-api)
- [Row Level Security — official Supabase docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [RLS Performance and Best Practices — official Supabase troubleshooting docs](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv)
- [76 RLS policies rewritten in one migration: the auth.uid() init-plan trap (DEV Community)](https://dev.to/arvavit/76-rls-policies-rewritten-in-one-migration-the-authuid-init-plan-trap-in-supabase-4hg)
- [Storage Access Control — official Supabase docs](https://supabase.com/docs/guides/storage/security/access-control)
- [Storage Buckets fundamentals — official Supabase docs](https://supabase.com/docs/guides/storage/buckets/fundamentals)
- [Supabase Storage Deep Dive — Bucket Design, Signed URLs, Image Transforms, and RLS (DEV Community)](https://dev.to/kanta13jp1/supabase-storage-deep-dive-bucket-design-signed-urls-image-transforms-and-rls-3b9k)
- [User sessions — official Supabase docs](https://supabase.com/docs/guides/auth/sessions)
- [6 Common Supabase Auth Mistakes (and Fixes) (Startupik)](https://startupik.com/6-common-supabase-auth-mistakes-and-fixes/)
- [Nuxt and Hydration — official Nuxt 4.x docs](https://nuxt.com/docs/4.x/guide/best-practices/hydration)
- [useAsyncData — official Nuxt 4.x composables docs](https://nuxt.com/docs/4.x/api/composables/use-async-data)
- [How to Fix 'SSR Hydration' Mismatch in Nuxt](https://oneuptime.com/blog/post/2026-01-24-fix-ssr-hydration-mismatch-nuxt/view)
- [Your Supabase Anon Key Is Public. Here's What That Does and Doesn't Mean](https://uxcontinuum.com/blog/app-security/anon-key-exposed)
- [Is it safe to expose the Supabase anon key? (GuardLayer)](https://www.guardlayer.io/blog/is-supabase-anon-key-safe)
- [Client-Side Image Compression with JavaScript (MiniPx)](https://minipx.com/blog/client-side-image-compression-javascript/)
- [How Browsers Compress Images (Canvas API Explained) (MiniPx)](https://minipx.com/blog/image-compression-api-canvas/)
- [SPA fallback for static sites (DEV Community)](https://dev.to/debs_obrien/spa-fallback-for-static-sites-58fo)
- Project-internal: `.planning/codebase/ARCHITECTURE.md` (documented SSR/hydration trap, already recurring), `.planning/codebase/CONCERNS.md` (image compression not yet implemented, no product pagination, category string-matching fragility)

---
*Pitfalls research for: Supabase + admin panel integration on a static Nuxt catalog site*
*Researched: 2026-08-29*
