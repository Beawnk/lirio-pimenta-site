# Codebase Structure

**Analysis Date:** 2026-08-29

## Directory Layout

```
site/
├── app/                           # Nuxt app root
│   ├── pages/
│   │   └── index.vue              # Main page (single entry point)
│   ├── layouts/
│   │   └── default.vue            # Root layout with header/footer/modals
│   ├── components/                # PascalCase Vue files (~80)
│   │   ├── AppHeader.vue          # Navigation, cart button, search toggle
│   │   ├── AppFooter.vue          # Footer with contact, social, legal
│   │   ├── CatalogSection.vue     # Main catalog with filters/grid
│   │   ├── ProductCard.vue        # Individual product in grid
│   │   ├── ProductModal.vue       # Full product details modal
│   │   ├── CartDrawer.vue         # Slide-out cart sidebar
│   │   ├── CheckoutModal.vue      # Customer info form + send to WA
│   │   ├── Icon*.vue              # 60+ SVG icon components
│   │   ├── AppIcon.vue            # Icon name resolver
│   │   ├── ProductImage.vue       # Image key resolver
│   │   └── [other sections/components]
│   ├── stores/                    # Pinia state
│   │   ├── ui.js                  # UI state (openPanel)
│   │   ├── catalog.js             # Catalog filters & results
│   │   ├── cart.js                # Cart items & operations
│   │   ├── favorites.js           # Favorited product IDs
│   │   └── toast.js               # Toast notifications
│   ├── composables/               # Pure business logic functions
│   │   ├── useCart.js             # Cart rules (add, remove, qty, message)
│   │   ├── useCatalog.js          # Filter & search logic
│   │   ├── useWhatsApp.js         # WhatsApp link builder
│   │   ├── useStoreHours.js       # Open/close status
│   │   └── useLocalBusiness.js    # JSON-LD schema builder
│   ├── data/                      # Static data (no API)
│   │   ├── products.js            # 18 example products
│   │   ├── categories.js          # 8 categories + gift chips
│   │   ├── banners.js             # Hero carousel images
│   │   └── store-info.js          # WhatsApp, phone, address, hours
│   ├── plugins/                   # Nuxt plugins
│   │   ├── cart.client.js         # Hydrate cart from localStorage
│   │   ├── favorites.client.js    # Hydrate favorites from localStorage
│   │   └── reveal.js              # Scroll reveal animation
│   ├── assets/
│   │   └── scss/
│   │       ├── main.scss          # Entry point (imports all)
│   │       ├── _tokens.scss       # CSS variables (colors, spacing, etc.)
│   │       ├── _reset.scss        # Normalize
│   │       ├── _buttons.scss      # Reusable button classes
│   │       ├── _layout.scss       # Container, grid, flex
│   │       ├── _badges.scss       # Badge components
│   │       └── _animations.scss   # Keyframes
│   └── app.vue                    # App root (NuxtLayout + NuxtPage)
├── tests/                         # Vitest tests
│   ├── cart.test.js               # useCart pure function tests
│   └── catalog.test.js            # useCatalog filter tests
├── public/                        # Static assets
│   ├── img/                       # Product images, logo, icons (webp)
│   ├── favicon.svg                # Vector favicon
│   ├── favicon-32.png             # Raster favicon
│   └── robots.txt                 # SEO (Disallow: /)
├── demo/                          # Original HTML prototype (reference only, not edited)
│   └── demo-portatil/
│       └── index.html             # ~1700 line single-file spec
├── .planning/
│   └── codebase/                  # Codebase maps
│       ├── ARCHITECTURE.md        # This document
│       └── STRUCTURE.md           # Directory layout & conventions
├── .nuxt/                         # Nuxt build output (generated)
├── .output/                       # Production build (generated)
├── dist                           # Symlink to .output/public
├── node_modules/                  # Dependencies
├── nuxt.config.ts                 # Nuxt configuration
├── package.json                   # Dependencies & scripts
├── vitest.config.js               # Test configuration
├── eslint.config.mjs              # Linting rules
├── tsconfig.json                  # TypeScript config
├── CLAUDE.md                      # Project instructions (checked into git)
└── README.md                      # Quickstart
```

## Directory Purposes

**app/pages/**
- Purpose: Nuxt file-based routing — one .vue file = one route
- Contains: `index.vue` (main page) only
- Key files: `app/pages/index.vue` (entry point, composes all sections)

**app/layouts/**
- Purpose: Reusable page wrapper — navigation, structure, event handling
- Contains: `default.vue` (auto-applied to all pages)
- Renders: Header, main slot, footer, modals/drawers portal, keyboard listener

**app/components/**
- Purpose: Reusable UI building blocks
- Contains: Sections, cards, modals, drawers, primitives, icons
- Key structure:
  - **Sections**: HeroCarousel, CatalogSection, GiftsSection, HistorySection, StoreSection, etc.
  - **Modals/Drawers**: ProductModal, CheckoutModal, CartDrawer, FiltersDrawer, MobileMenu
  - **Cards**: ProductCard, CategoryCard, CartItem
  - **Icons**: Icon*.vue (60+ files) — each is an SVG
  - **Utilities**: AppIcon (resolver), ProductImage (resolver), AppOverlay, EmptyState

**app/stores/**
- Purpose: Pinia state management — centralized reactive state + persistence
- Contains: 5 stores
  - `ui.js`: Which drawer/modal is open (single openPanel ref)
  - `catalog.js`: Filter state, filtered results, selected product, methods to select/filter
  - `cart.js`: Cart items, computed lines (items + product data), persist/hydrate
  - `favorites.js`: Favorited product IDs, persist/hydrate
  - `toast.js`: Toast notifications (simple ref + methods)
- Pattern: Each store is a function using Pinia's `defineStore('name', () => { ... })` syntax

**app/composables/**
- Purpose: Pure business logic functions — testable without Vue
- Contains: 5 composables
  - `useCart.js`: addItem, removeItem, setQuantity, countItems, sanitize, withProducts, buildOrderMsg
  - `useCatalog.js`: normalize, editDistance, matchesQuery, filterProducts, SORT_OPTIONS
  - `useWhatsApp.js`: waLink, greetingLink, consultLink
  - `useStoreHours.js`: renderHours (open/close status)
  - `useLocalBusiness.js`: buildLocalBusinessSchema (JSON-LD)
- Pattern: Exported functions, no Vue imports, pure data transformations

**app/data/**
- Purpose: Static data — no API calls in Phase A
- Contains:
  - `products.js`: 18 example products, `findProduct(id)` helper
  - `categories.js`: 8 categories, 7 gift chips, `findCategory(name)` helper
  - `banners.js`: Hero carousel images
  - `store-info.js`: Constants — WhatsApp, phone, address, hours, maps link, site URL
- Pattern: Exported objects/arrays, updated manually in Phase A, replaced by Supabase in Phase B

**app/plugins/**
- Purpose: Nuxt initialization hooks
- Contains:
  - `cart.client.js`: Hydrate cart from localStorage on `app:suspense:resolve` hook
  - `favorites.client.js`: Hydrate favorites from localStorage on same hook
  - `reveal.js`: Intersection Observer for scroll-reveal animations
- Pattern: Functions exported as default, registered in nuxt.config

**app/assets/scss/**
- Purpose: Global styling + design tokens
- Files:
  - `main.scss`: Entry point, imports all partials + injects Nuxt CSS
  - `_tokens.scss`: CSS custom properties (--blue-700, --gold-500, --sp-1..9, etc.)
  - `_reset.scss`: Normalize defaults
  - `_buttons.scss`: .btn, .btn-primary, .btn-ghost, etc.
  - `_badges.scss`: .badge, .badge-new, etc.
  - `_layout.scss`: .container, grid utilities, section header styles
  - `_animations.scss`: Keyframes (@keyframes fadeIn, slide, etc.)
- Pattern: Shared styles globally imported; component-specific styles in `<style scoped>` of .vue files

## Key File Locations

**Entry Points:**
- `app/pages/index.vue` — Main page, renders sections
- `app/layouts/default.vue` — Root layout, renders header/footer/modals
- `app/app.vue` — App bootstrap (Nuxt internals)

**Configuration:**
- `nuxt.config.ts` — Nuxt config (CSS import, modules, meta, robots noindex)
- `vitest.config.js` — Test runner config (happy-dom environment, include pattern)
- `eslint.config.mjs` — Linting rules
- `tsconfig.json` — TypeScript config (from scaffold, not changed)
- `package.json` — Dependencies and npm scripts

**Core Logic:**
- `app/composables/useCart.js` — Cart operations
- `app/composables/useCatalog.js` — Filter and search
- `app/stores/catalog.js` — Catalog state
- `app/stores/cart.js` — Cart state

**Testing:**
- `tests/cart.test.js` — useCart tests
- `tests/catalog.test.js` — useCatalog tests

**Static Content:**
- `app/data/store-info.js` — Business constants
- `public/robots.txt` — SEO (Disallow: /, noindex)
- `public/img/` — Product images, logo
- `CLAUDE.md` — Project rules (checked into git)

## Naming Conventions

**Files:**
- **Components**: PascalCase (AppHeader.vue, ProductCard.vue, IconGift.vue)
- **Pages**: kebab-case (index.vue — Nuxt convention, only one page here)
- **Stores**: camelCase (cart.js, catalog.js)
- **Composables**: camelCase with `use` prefix (useCart.js, useCatalog.js)
- **Data modules**: camelCase (products.js, store-info.js)
- **Style partials**: kebab-case with underscore prefix (_tokens.scss, _reset.scss)

**Functions/Variables:**
- **Composables**: camelCase exports (addItem, filterProducts, buildOrderMsg)
- **Store methods**: camelCase (add, setQty, remove, hydrate, toggle)
- **Component methods**: camelCase (toggleFavorite, selectCategory)
- **Constants**: UPPER_SNAKE_CASE (MAX_QTY, STORAGE_KEY, PRODUCTS, CATEGORIES)

**Types/Interfaces:**
- No TypeScript in `app/**` (JavaScript-only) except config files
- Implicit typing via JSDoc comments where needed

**Directories:**
- Single word or kebab-case (components, composables, stores, pages, layouts, data, plugins, assets)

## Where to Add New Code

**New Feature (e.g., Product Reviews):**
- **Business logic**: `app/composables/useReviews.js` — functions to add, filter, sort reviews
- **State**: `app/stores/reviews.js` — Pinia store wrapping composable + persistence
- **Components**: `app/components/ReviewList.vue`, `app/components/ReviewForm.vue`
- **Tests**: `tests/reviews.test.js` — test composable functions

**New Section (e.g., Blog):**
- **Data**: `app/data/posts.js` — blog post array
- **Component**: `app/components/BlogSection.vue`
- **Add to page**: Import and render in `app/pages/index.vue`
- **Styling**: Scoped `<style>` in BlogSection.vue, shared styles in `app/assets/scss/`

**New Icon:**
- **Icon component**: `app/components/IconYourName.vue` (PascalCase, SVG inside)
- **Pattern**: `viewBox="0 0 24 24"`, `stroke="currentColor"`, `stroke-width="2"`, no width/height
- **Usage**: Direct `<IconYourName />` or data-driven via `<AppIcon name="yourName" />`
- **Register in AppIcon**: Update switch statement if data-driven

**Utility Function (non-business):**
- **Shared helpers**: `app/composables/useHelper.js` if needs reactive state, else plain `app/utils/helper.js` (new directory)
- **Pattern**: Pure function or composable, no Vue dependencies

**New Page (Phase B onwards):**
- **File**: `app/pages/your-page.vue`
- **Auto-registered by Nuxt file routing**
- **Layout**: Uses `default.vue` layout unless you create a new one

**Stylesheet Token (color, spacing):**
- **Update**: `app/assets/scss/_tokens.scss` — add CSS custom property
- **Use everywhere**: `color: var(--your-token)` in any component

## Special Directories

**node_modules/**
- Purpose: npm dependencies
- Generated: Yes (npm install)
- Committed: No (.gitignore)

**.nuxt/**
- Purpose: Nuxt build cache
- Generated: Yes (nuxt dev)
- Committed: No (.gitignore)

**.output/**
- Purpose: Production build output (Cloudflare Pages deployment)
- Generated: Yes (npm run build or npm run generate)
- Committed: No (.gitignore)

**dist/**
- Purpose: Symlink to .output/public (convenience for static file serving)
- Generated: Yes (created by build script)
- Committed: No (symlink)

**.planning/codebase/**
- Purpose: Codebase maps (this document, ARCHITECTURE.md)
- Generated: No (written by hand or gsd-map-codebase)
- Committed: Yes — documents for future claude instances

**demo/demo-portatil/**
- Purpose: Original HTML specification — reference only
- Generated: No (manual design)
- Committed: Yes — DO NOT EDIT — it's the spec

**public/**
- Purpose: Static assets served as-is
- Generated: No (manually placed)
- Committed: Yes
- Includes: images, favicon, robots.txt

---

*Structure analysis: 2026-08-29*
