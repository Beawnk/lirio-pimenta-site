<!-- refreshed: 2026-08-29 -->
# Architecture

**Analysis Date:** 2026-08-29

## System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│           Vue 3 Components (app/components/)                 │
│  Sections: Hero, Categories, Catalog, Gifts, History, etc.  │
│  UI: Header, Footer, Cart Drawer, Modals, Icons             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              State Management Layer (Pinia)                  │
│  app/stores/: ui, catalog, favorites, cart                  │
│  Thin wrappers: state refs, computed, persistence logic     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│            Business Logic Layer (Composables)                │
│       Pure functions - no Vue, testable in isolation        │
│  useCart, useCatalog, useWhatsApp, useStoreHours,          │
│  useLocalBusiness (app/composables/)                        │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│           Data Layer (Static & localStorage)                 │
│  app/data/: products, categories, banners, store-info       │
│  app/plugins/: hydration (cart.client.js, favorites.client) │
└─────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Page Entry | Render sections, inject JSON-LD SEO | `app/pages/index.vue` |
| Layout | Root structure, event listeners, modal portal | `app/layouts/default.vue` |
| Header | Navigation, cart button, search toggle | `app/components/AppHeader.vue` |
| Footer | Legal, contact, social links | `app/components/AppFooter.vue` |
| CatalogSection | Grid, filters, favorites toggle | `app/components/CatalogSection.vue` |
| CartDrawer | Item list, quantity controls, checkout CTA | `app/components/CartDrawer.vue` |
| ProductModal | Full product details, add to cart | `app/components/ProductModal.vue` |
| CheckoutModal | Name/phone/delivery method form, send to WA | `app/components/CheckoutModal.vue` |
| AppIcon | Icon resolver (data key → SVG component) | `app/components/AppIcon.vue` |
| ProductImage | Image key resolver (data key → file path) | `app/components/ProductImage.vue` |
| Icon*.vue | SVG glyph (60+ icons, PascalCase) | `app/components/Icon*.vue` |

## Pattern Overview

**Overall:** Separation of concerns: Pure business logic in composables → Thin Pinia state wrappers → Vue presentation components.

**Key Characteristics:**
- Business logic (filter, cart rules, message building) is pure functions with no Vue dependencies — testable without mounting components
- Pinia stores delegate rule enforcement to composables, own only state reactivity and localStorage persistence
- Components read from stores and composables, call store methods on user interaction
- Data layer is static imports (no API yet — Supabase comes in Phase B)
- No prices displayed in public UI (Supabase and admin panel come later)
- No login/auth in Phase A — favorites and cart stored in `localStorage`

## Layers

**Presentation:**
- Purpose: Render UI, handle user interaction
- Location: `app/components/`, `app/pages/`, `app/layouts/`
- Contains: Vue 3 Composition API components with `<script setup>`, scoped SCSS
- Depends on: Pinia stores, composables, data modules
- Used by: Nuxt routing and layout system

**State Management:**
- Purpose: Reactive state, computed properties, persistence hooks
- Location: `app/stores/` (defineStore with Pinia)
- Contains: `ui.js`, `catalog.js`, `favorites.js`, `cart.js`, `toast.js`
- Depends on: Composables for business logic, data modules for product lookups
- Used by: Components via `useStore()`, plugins for hydration

**Business Logic:**
- Purpose: Pure functions — rules that don't change, testable in isolation
- Location: `app/composables/`
- Contains: `useCart.js`, `useCatalog.js`, `useWhatsApp.js`, `useStoreHours.js`, `useLocalBusiness.js`
- Depends on: Data modules, standard JavaScript
- Used by: Stores, components (for WhatsApp link generation)

**Data:**
- Purpose: Static product catalog, categories, store contact info
- Location: `app/data/` (exported JS/TS objects)
- Contains: `products.js`, `categories.js`, `banners.js`, `store-info.js`
- Depends on: Nothing (pure data)
- Used by: Stores, composables

**Styling:**
- Purpose: Design system tokens, reusable classes, component scoping
- Location: `app/assets/scss/`
- Contains: `_tokens.scss` (CSS variables), `_reset.scss`, `_buttons.scss`, `_layout.scss`, `_animations.scss`, `main.scss` (imports)
- Depends on: Nothing
- Used by: All components via `<style lang="scss" scoped>`

## Data Flow

### Primary Request Path: Browse & Add to Cart

1. **User lands on page** (`app/pages/index.vue:1-40`)
   - Page mounts, no server state — presentation only

2. **Hydration happens** (plugin `app/plugins/cart.client.js:15-18` and `app/plugins/favorites.client.js`)
   - Hook: `app:suspense:resolve` fires after Suspense resolves
   - `useCartStore().hydrate()` reads `localStorage['lp_cart']`
   - `useFavoritesStore().hydrate()` reads `localStorage['lp_favs']`
   - Must happen after hydration or Vue sees server/client mismatch (class names stick wrong)

3. **Catalog loads** (CatalogSection via `app/components/CatalogSection.vue:1-5`)
   - Store accesses `app/data/products.js` directly (static)
   - `useCatalogStore()` initializes `filters` with defaults from `createFilters()` (`app/composables/useCatalog.js:17-24`)

4. **User filters/searches** (CatalogToolbar + CatalogFilters)
   - Updates `catalog.filters` (object in store)
   - Computed `catalog.results` re-runs `filterProducts(PRODUCTS, filters, favorites.ids)` (`app/composables/useCatalog.js:120-146`)
   - `filterProducts()` handles: query normalization, fuzzy typo matching (edit distance), category, availability, favorites, sort
   - ProductGrid re-renders with new `catalog.results`

5. **User opens product** (ProductCard click → `catalog.openProduct(id)`)
   - Sets `catalog.selectedId` in store
   - `ui.open('product')` opens the modal
   - ProductModal renders `catalog.selectedProduct` (`computed` that looks up by id)

6. **User adds to cart** (ProductModal add button → `cart.add(productId, qty)`)
   - `cart.add()` calls `addItem(items, id, qty)` from `app/composables/useCart.js:17-23`
   - `addItem()` returns a NEW array (immutable), never mutates original
   - Store assigns new array to `items.value`
   - `cart.persist()` saves to `localStorage['lp_cart']`
   - `cart.count` (computed) recalculates and UI re-renders

7. **User views cart** (BottomNav cart button → `ui.open('cart')`)
   - CartDrawer shows `cart.lines` (`computed` from `cart.items` joined with product data)
   - For each line: `withProducts()` looks up product by id, adds name/image/availability
   - Product no longer in catalog? Line is filtered out silently

8. **User checks out** (CartDrawer "Enviar..." button → `ui.open('checkout')`)
   - CheckoutModal collects name, phone, delivery method, notes
   - User submits
   - `cart.orderMessage(customer)` builds Markdown message via `buildOrderMsg()` (`app/composables/useCart.js:62-82`)
   - Message lists items, quantities, customer info, NO prices, NO total
   - User is linked to WhatsApp with message pre-filled: `useWhatsApp().waLink(message)` (`app/composables/useWhatsApp.js:6-7`)

### State Management Lifecycle

**On first load (server):**
- Pinia stores initialize with empty/default values
- Server renders HTML with empty cart count, empty favorites
- No localStorage on server

**On browser mount:**
- Hydration phase finishes
- Plugin hooks fire: `app:suspense:resolve`
- Stores hydrate from localStorage
- Vue sees new state, updates DOM if different from server HTML

**On user action (e.g., add to cart):**
1. Component calls store method: `cart.add(productId, qty)`
2. Store method calls pure composable: `items.value = addItem(items.value, id, qty)`
3. Assignment triggers Vue reactivity
4. `persist()` writes to localStorage
5. Computed properties recalculate, components re-render

## Key Abstractions

**Filter State:**
- Purpose: Hold what the user chose to see (query, category, availability, etc.)
- Example: `app/stores/catalog.js:11`
- Pattern: Reactive object, methods to modify (selectCategory, clearFilters)

**Product Line (Cart Item):**
- Purpose: Minimal cart record — only id and quantity
- Structure: `{ id: number, qty: number }`
- Pattern: Pure functions transform this into display data by joining with products via `withProducts()`

**Order Message:**
- Purpose: The payoff — formatted Markdown for WhatsApp
- Built by: `buildOrderMsg(lines, customer)` — pure function
- Pattern: Takes cart lines + customer info, returns string, no side effects

**Icon Resolution:**
- Purpose: Decouple data (category.icon = 'gift') from component rendering
- Pattern: `app/components/AppIcon.vue` resolves icon name string to component dynamically
- Alternative: Direct use in template (`<IconGift />`) when icon is static

**Image Resolution:**
- Purpose: Decouple logical key (image: 'pilhas') from file path
- Pattern: `app/components/ProductImage.vue` maps key to file path
- Benefit: If image moves or format changes, only ProductImage updates

## Entry Points

**Main Page:**
- Location: `app/pages/index.vue`
- Triggers: Nuxt routing (/ path)
- Responsibilities: Compose all sections, inject JSON-LD schema for SEO

**Application Root:**
- Location: `app/app.vue`
- Triggers: Nuxt bootstrap
- Responsibilities: Render layout, render page slot

**Layout (Root Structure):**
- Location: `app/layouts/default.vue`
- Triggers: Automatically applied to all pages
- Responsibilities: Render header/footer/main, manage keyboard Esc listener, render modals/drawers portal

**Hydration Plugins:**
- Location: `app/plugins/cart.client.js`, `app/plugins/favorites.client.js`
- Trigger: `app:suspense:resolve` hook (after all Suspense components resolve)
- Responsibilities: Load cart and favorites from localStorage into Pinia

## Architectural Constraints

- **Threading:** Single-threaded JavaScript event loop (no workers)
- **Global state:** 
  - `app/stores/ui.js:8` — single `openPanel` ref (only one drawer/modal open at a time)
  - `app/stores/catalog.js:12` — `selectedId` ref (one product modal open)
  - Pinia stores are singletons per app instance
- **Circular imports:** None detected; stores import composables, composables don't import stores
- **SSR + Hydration:** Critical timing issue: localStorage data must NOT be read until after `app:suspense:resolve`, or Vue sees server/client HTML mismatch on `class` attributes (never corrected by Vue)
- **Static Data:** All product/category data imported from `app/data/` — no runtime fetching in Phase A
- **No Prices in UI:** Business rule enforced by not sending product.price to components
- **No Auth:** Phase A has no login; cart and favorites live in localStorage under keys `lp_cart` and `lp_favs`

## Anti-Patterns

### Storing Data in Component State Instead of Composables

**What happens:** Component-level state for business logic (e.g., cart items as `const items = ref([])`), untestable without mounting.

**Why it's wrong:** Cart logic is critical (money-related); bugs in cart can't be caught by unit tests. The component's complexity balloons, and reusing logic elsewhere requires duplicating code.

**Do this instead:** Pure composable (`app/composables/useCart.js`) with business logic → Pinia store wraps and persists → Components call store methods.

### Reading localStorage Directly in Setup

**What happens:** `localStorage.getItem('key')` in component `setup()` or store initialization (not hydrate).

**Why it's wrong:** Breaks SSR — server doesn't have localStorage, causing mismatch. Vue doesn't reconcile `class` mismatches, leaving UI in wrong state.

**Do this instead:** Initialize empty in setup, hydrate via plugin hook `app:suspense:resolve` (see `app/plugins/cart.client.js`).

### Importing Components Inside Business Logic

**What happens:** Composable imports `Icon.vue` or calls `navigateTo()`.

**Why it's wrong:** Composable becomes untestable outside Vue context; can't reuse in Node scripts or other frameworks.

**Do this instead:** Keep composables pure — data and rules only. Components consume and render.

### Mutating State Arrays/Objects

**What happens:** `cart.items.push({ id, qty })` instead of `cart.items = [...cart.items, { id, qty }]`.

**Why it's wrong:** Vue's reactivity may miss the change (depends on property interception); in tests, immutability is easier to verify.

**Do this instead:** All transformations in composables return new arrays (see `addItem`, `removeItem`, `setQuantity` in `app/composables/useCart.js`).

### Price Display or Calculation

**What happens:** Adding `product.price` to templates or order messages.

**Why it's wrong:** Violates core business rule: "No price shown in public UI. Preço se negocia no WhatsApp."

**Do this instead:** Never reference `product.price` in templates. Store has it for admin panel (Phase B), but components don't.

## Error Handling

**Strategy:** Graceful fallback with minimal user disruption.

**Patterns:**
- `localStorage` read failures: Try/catch, return empty array (favorites.js:17-22, cart.js:28-31)
- Missing products: Filter out silently (withProducts filters out nulls; selectedProduct returns null if not found)
- Malformed data: `sanitize()` validates cart items before use (`useCart.js:42-48`)
- Network failures: Not applicable in Phase A (static data only)

## Cross-Cutting Concerns

**Logging:** Not implemented in Phase A. Console errors for development only.

**Validation:** Data validation in composables:
- Cart sanitization: `useCart.sanitize()`
- Query normalization: `useCatalog.normalize()` (accent removal, lowercase)
- Clamp quantity: `useCart.clamp()` (1 to MAX_QTY)

**Authentication:** Not implemented in Phase A. Phase B will have Supabase Auth for admin panel.

**Persistence:** localStorage strategy:
- Cart: `localStorage['lp_cart']` JSON string (persists after every add/remove/setQty)
- Favorites: `localStorage['lp_favs']` JSON array
- Hydrated after page loads via plugin hooks

---

*Architecture analysis: 2026-08-29*
