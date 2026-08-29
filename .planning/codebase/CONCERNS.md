<!-- refreshed: 2026-08-29 -->
# Codebase Concerns

**Analysis Date:** 2026-08-29

## Tech Debt

**Image Format Inconsistency:**
- Issue: Public images use mixed formats (.jfif, .webp, .jpg, .png) with no consistent optimization strategy
- Files: `public/img/`, `app/components/ProductImage.vue` (IMAGES map)
- Impact: Larger page weight, slower load times especially on mobile. fachada.jfif is 460KB, several times larger than necessary
- Fix approach: Convert all to webp at production size, add responsive srcset, implement lazy loading with intersection observer for below-fold images

**Select Arrow Color Hardcoded:**
- Issue: CatalogToolbar.vue hardcodes the select arrow color as hex `%23566470` in a data URI, instead of using CSS variables
- Files: `app/components/CatalogToolbar.vue` (line 108, background-image url)
- Impact: If `--ink-500` changes in `_tokens.scss`, the arrow color won't update automatically. Currently creates a silent maintenance burden where design changes may not apply everywhere
- Fix approach: Move arrow SVG to a component or use CSS mask with currentColor, or document the hardcoding as a CSS limitation of `<select>` elements

**Incomplete Domain Setup:**
- Issue: SITE_URL is empty string, domain is temporary Cloudflare Pages URL (workers.dev) with noindex in robots.txt
- Files: `nuxt.config.ts` (line 20), `app/data/store-info.js` (line 20), `public/robots.txt`
- Impact: Multiple updates needed when real domain launches: remove noindex, update robots.txt, fill SITE_URL, JSON-LD schema won't include canonical/url. Risk of forgetting a step
- Fix approach: Create a CHECKLIST in CLAUDE.md or TASKS.md for "Domain Virada" that lists all four places to update, then execute in one PR

**Facebook URL Placeholder:**
- Issue: FACEBOOK_URL is empty string in store-info.js, so the button in footer is likely disabled but not obvious
- Files: `app/data/store-info.js` (line 13)
- Impact: Dead social link when page goes live; forgot value = broken feature
- Fix approach: Make this required in an admin panel (Fase B), or validate in build step that non-empty FACEBOOK_URL exists

---

## Known Bugs

**SSR Hydration Mismatch (Documented but Fragile):**
- Symptoms: If cart is loaded before `app:suspense:resolve` hook, Vue detects class mismatch (server had 0 items, client has N) but doesn't correct `class` attributes, leaving elements invisibly scaled
- Files: `app/plugins/cart.client.js`, `app/stores/cart.js` (hydrate function)
- Trigger: Any change to the plugin timing or addition of new localStorage-backed state without using the same hook
- Workaround: All stores use the app:suspense:resolve hook; follow this pattern for any new localStorage state

**Search Focus Mechanism Timing:**
- Symptoms: On mobile, menu closes but search field may not be focused if the DOM transition hasn't completed
- Files: `app/stores/catalog.js` (focusSearch function, line 44)
- Trigger: Rapidly opening menu and clicking "Search" before close animation finishes
- Workaround: Focus happens with `preventScroll: true`, but timing is browser-dependent

---

## Test Coverage Gaps

**Untested Composables:**
- What's not tested: `useStoreHours` (critical for "open now" status), `useLocalBusiness` (JSON-LD schema), `useWhatsApp` (core flow to convert cart to WhatsApp link)
- Files: `app/composables/useStoreHours.js`, `app/composables/useLocalBusiness.js`, `app/composables/useWhatsApp.js`
- Risk: If hours calculation breaks or WhatsApp URL encoding fails, user won't be able to send orders. JSON-LD errors won't be caught
- Priority: High — these are critical paths. Write tests before Fase B

**No Component Tests:**
- What's not tested: Vue components themselves (CheckoutModal, CartDrawer, ProductModal, CatalogFilters, etc.) — only pure composables and functions
- Files: `app/components/` (except for logic in composables)
- Risk: UI bugs (broken form submission, incorrect styling, accessibility issues) go unnoticed. Changes to layout or state binding in templates break silently
- Priority: Medium — integration tests would help, but component tests would catch regressions

**Search Debounce Timing Not Validated:**
- What's not tested: The 220ms debounce in CatalogToolbar is hard-coded; no tests verify performance at scale (demo has 18 products, production will have ~500)
- Files: `app/components/CatalogToolbar.vue` (line 17-20)
- Risk: Delay could feel sluggish with large catalog, or not provide enough debounce if editDistance calculation grows slow
- Priority: Low today, revisit after launch with real product count

---

## Input Validation Gaps

**Checkout Form — No Validation:**
- Issue: CheckoutModal accepts name and phone with no format checking, allows empty strings or whitespace-only input
- Files: `app/components/CheckoutModal.vue` (lines 70, 74)
- Impact: Invalid WhatsApp messages sent (blank names, malformed phone numbers). No real-time user feedback
- Fix approach: Add validators: name >= 2 chars, phone matches pattern like `(\d{2}) \d{4,5}-?\d{4}`, disable send button if invalid

**localStorage Sanitization — No Depth Checking:**
- Issue: `useCart.sanitize()` filters invalid items but doesn't check max cart size or item quantity sums
- Files: `app/composables/useCart.js` (sanitize function, lines 42-48)
- Impact: localStorage corruption or deliberate manipulation could load impossibly large carts (MAX_QTY × 1000 items). No integrity checks
- Fix approach: Add max cart line count and total item count validation in sanitize

---

## Fragile Areas

**Category String Matching:**
- Files: `app/data/products.js` (category field as string name), `app/stores/catalog.js` (line 129), `app/composables/useCatalog.js` (line 129)
- Why fragile: Category filtering uses direct string comparison on product.category. If a category name is changed in data.products.js, all products in that category disappear from that filter. No ID-based linking
- Safe modification: Before Fase B, add category ID system (e.g., `category: 'utilitites'` not `'Utilidades'`), update all product data, update filter logic
- Test coverage: catalog.test.js covers filter logic, but not the case where category names diverge

**Image Key Mapping:**
- Files: `app/components/ProductImage.vue` (IMAGES map, lines 10-21)
- Why fragile: Hardcoded map of image keys to paths. If image key is typo'd in product data or missing from map, silent fallback to placeholder. No error indication
- Safe modification: Consider moving IMAGES to a data file and validating on product insert (Fase B); for now, document valid keys in comments
- Test coverage: No tests for image fallback behavior

**Favorites and Cart Persistence:**
- Files: `app/stores/favorites.js`, `app/stores/cart.js` (persist functions), `app/plugins/favorites.client.js`, `app/plugins/cart.client.js`
- Why fragile: Two separate stores using localStorage, each with their own STORAGE_KEY. Changes to key name or format require migrations. No versioning
- Safe modification: Any change to data structure (e.g., adding a field to cart items) requires manual migration code or will silently corrupt user data
- Test coverage: Tests for sanitize/validation exist, but not for persist/hydrate round-trips

---

## Performance Bottlenecks

**Image Loading Performance:**
- Problem: Large image files (460KB fachada.jfif) served to all users, no responsive images or WebP serving
- Files: `public/img/`, `app/components/ProductImage.vue`
- Cause: Static images from Lírio's phone photos not optimized; `loading="lazy"` is applied but no other optimization
- Improvement path: (1) Convert all to WebP, (2) create multiple sizes for responsive images, (3) lazy-load below-fold images, (4) consider blur-up placeholder before image loads

**Search Calculation at Scale:**
- Problem: `editDistance()` runs O(n²) algorithm for each search term on every keystroke (after debounce)
- Files: `app/composables/useCatalog.js` (editDistance function, lines 67-93), CatalogToolbar.vue (debounce 220ms)
- Cause: Damerau-Levenshtein distance matrix recalculated for every word in every product description
- Improvement path: (1) Cache normalized product text at load time, (2) if scale grows, consider Trie or inverted index, (3) profile with 500 products before launch

**Interval Timer in useStoreHours:**
- Problem: A 60-second timer runs on every page that displays hours (hero section, store info), potentially multiple timers
- Files: `app/composables/useStoreHours.js` (setInterval line 21)
- Cause: Each component instance gets its own timer; no shared singleton or server-side calculation
- Improvement path: Low priority for now (~18 products demo), but consider a global timer or server-rendered status after launch

---

## Scaling Limits

**No Product Pagination:**
- Current capacity: Demo shows 18 products; production will have ~500. All filter/sort operations run in-memory on client
- Limit: Beyond ~1000 products, full catalog JSON and search filtering will become slow. editDistance calculation becomes bottleneck
- Scaling path: Fase B will move to Supabase; pagination/server-side filtering will be needed. Consider full-text search database support

**localStorage Size Limits:**
- Current capacity: Favorites and cart grow with product count. localStorage typically ~5-10MB per origin
- Limit: With ~500 products and max cart size, should never hit limit, but large favorite lists could consume significant space
- Scaling path: No action needed for Fase A; revisit after Fase B if customers regularly add 100+ favorites

---

## Security Considerations

**localStorage Manipulation:**
- Risk: Cart and favorites stored in localStorage; user can manually edit or delete via browser DevTools. No integrity checking
- Files: `app/composables/useCart.js` (sanitize), `app/stores/favorites.js`
- Current mitigation: `sanitize()` function validates item structure; corrupted entries are dropped. Still, user can clear cart intentionally
- Recommendations: (1) This is acceptable for Fase A (local-only state), (2) Fase B: move to Supabase; (3) Consider localStorage versioning/hash if local state grows sensitive data

**No Input Sanitization in Checkout:**
- Risk: Name and phone fields passed directly to buildOrderMsg without escaping; markdown special chars could break message formatting
- Files: `app/components/CheckoutModal.vue`, `app/composables/useCart.js` (buildOrderMsg)
- Current mitigation: WhatsApp API URL-encodes the message; markdown in WhatsApp doesn't execute code
- Recommendations: (1) Add input validation to reject special markdown chars in name/phone fields, or (2) properly escape them in buildOrderMsg

**API Key Exposure (WhatsApp Number):**
- Risk: WhatsApp number is hardcoded in public JavaScript and HTML; not a secret, but could enable spam attacks if hosted elsewhere
- Files: `app/data/store-info.js` (WHATSAPP constant)
- Current mitigation: Number is publicly listed in contact info anyway; not a vulnerability unique to code
- Recommendations: None — business requirement is that the number is public

**JSON-LD Schema Incomplete:**
- Risk: JSON-LD schema includes valid address but no `geo` coordinates; not a security issue but limits Google Business integration
- Files: `app/composables/useLocalBusiness.js` (comment on line 38-41 explains intentional omission)
- Current mitigation: Intentional; schema.org doesn't require geo; coordinates will come from Google Business separately
- Recommendations: None — this is a known deferral, not a bug

---

## Accessibility & UX Gaps

**Mobile Search Discovery Issue:**
- Problem: Search icon removed from mobile header to avoid crowding (intentional design decision)
- Files: `app/components/AppHeader.vue`, `app/components/CatalogToolbar.vue`
- Why it matters: Users on mobile must go through hamburger menu → "Buscar no catálogo" to search. Less discoverable than icon
- Workaround: Works, but not ideal. Consider alternative layouts (e.g., search in first menu item, or two-tier header)

**"Verificando…" Status on First Load:**
- Problem: useStoreHours returns null until component mounts (SSR issue), so "open now" status shows "Verificando…" briefly
- Files: `app/composables/useStoreHours.js` (line 16, now starts null)
- Why it matters: Minor UX flicker on page load; expected behavior but could be smoother
- Workaround: Server could pre-calculate if open; low priority

**No Keyboard Navigation for Filters:**
- Problem: Filter checkboxes and radio buttons in CatalogFilters/FiltersDrawer not testable for keyboard access
- Files: `app/components/CatalogFilters.vue`, `app/components/FiltersDrawer.vue`
- Why it matters: Screen reader users and keyboard-only users may struggle
- Workaround: Likely works (native inputs), but no automated test coverage

---

## Missing Critical Features (Deferred to Fase B)

**No Image Compression on Upload:**
- Problem: CLAUDE.md says "toda imagem é comprimida e redimensionada no navegador antes do upload" but this is not yet implemented
- Blocks: Fase B image upload feature
- Recommendation: Implement in Fase B before admin starts uploading; use Canvas API or sharp-wasm

**No Admin Panel:**
- Blocks: Updating products, categories, prices, hours, contact info (all hardcoded in code)
- Recommendation: Core of Fase B; required before launch with real data

**No Analytics:**
- Blocks: No way to know what customers search for, which products are viewed/added, conversion funnel
- Recommendation: Fase C or later; could use Supabase logs + simple dashboard

**No Product Variants:**
- Blocks: Can't handle "same product, different color" — each variant is separate product
- Recommendation: Design required (Fase B); would impact cart logic and data structure

---

## Maintenance Blind Spots

**Hardcoded Constants Scattered:**
- Issue: Product data, store info, categories, WhatsApp flows all in separate data files with no single source of truth
- Files: `app/data/products.js`, `app/data/store-info.js`, `app/data/categories.js` (implicit in CATEGORIES of products)
- Impact: Updates require changes to multiple files; easy to miss one
- Recommendation: Fase B: move to Supabase; Fase A: add build-time validation that all categories in products exist in CATEGORIES list

**Deploy Checklist Missing:**
- Issue: Domain virada requires updates in 4+ places (nuxt.config, robots.txt, store-info.js, CLAUDE.md notes)
- Impact: Risk of incomplete launch; temporary domain accidentally stays indexed
- Recommendation: Add .planning/DEPLOY_CHECKLIST.md before public launch with step-by-step verification

---

*Concerns audit: 2026-08-29*
