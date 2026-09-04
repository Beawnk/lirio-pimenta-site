<!-- GSD:project-start source:PROJECT.md -->

## Project

**Lírio Site — Fase B**

Site catálogo da loja de variedades Lírio Pimenta (Viamão/RS), hoje 100% estático (Fase A
portada). Esta rodada dá ao site seu primeiro backend real: Supabase (Postgres + Auth +
Storage) substitui `app/data/` como fonte de verdade, e um painel administrativo permite
que o Lírio cadastre, edite e arquive produtos e categorias sozinho — sem depender de um
dev para cada mudança no catálogo. O visitante continua só navegando o catálogo e fechando
o pedido pelo WhatsApp: sem preço, sem checkout, sem conta de cliente.

**Core Value:** O Lírio consegue manter o catálogo (produtos e categorias) sozinho pelo painel, sem
precisar de um dev a cada alteração.

### Constraints

- **Tech stack**: Supabase (Postgres + Auth + Storage) — já decidido no CLAUDE.md do projeto, sem outras opções em consideração
- **Deploy**: Continua no Cloudflare Pages; Supabase é client-side, não exige servidor Node próprio nem muda o preset `static`
- **Segurança**: Só o Lírio autentica no painel; regras de RLS do Supabase devem impedir escrita pública nas tabelas de produto/categoria
- **Convenção**: Toda lógica de negócio nova segue o padrão já em uso — composable puro testável → store Pinia fina

<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->

## Technology Stack

## Languages

- JavaScript - Application code in `app/**` and configuration files. No TypeScript in application code; config files (`nuxt.config.ts`, `tsconfig.json`) use TypeScript scaffold but remain unchanged from Nuxt init.
- HTML - Semantic markup in Vue components
- SCSS - `sass-embedded` v1.102.0 - all styling uses SCSS with CSS variables for theming. Shared styles in `app/assets/scss/main.scss` (tokens, reset, layout, buttons, badges, animations); component-scoped styles via `<style lang="scss" scoped>`.

## Runtime

- Node.js (no version pinning via `.nvmrc` or `.node-version`)
- npm (v10+ inferred from package-lock.json)
- npm
- Lockfile: `package-lock.json` present
- Installation: `npm install`

## Frameworks

- Nuxt 4.5.2 - Full-stack Vue framework with Composition API, SSR, and static generation. Configured for `cloudflare-pages` preset (Nitro v2.13.4) for static output. Auto-imports composables, components, stores.
- Vue 3.5.41 - UI framework. All code uses Composition API with `<script setup>` (no Options API).
- Vue Router 5.2.0 - File-based routing via `app/pages/` directory.
- Pinia 4.0.3 - Reactive state stores with composition functions. Four stores: `ui` (UI state), `catalog` (search/filters), `favorites` (bookmarks), `cart` (order building).
- localStorage persistence - Manual serialization/deserialization in store methods; cart hydrated via `app:suspense:resolve` hook to avoid SSR mismatch.
- SCSS with CSS Variables - Design tokens in `app/assets/scss/_tokens.scss`. No CSS-in-JS, no Tailwind, no utility frameworks.
- Google Fonts - Poppins (display) and Inter (text), loaded via CDN link in `nuxt.config.ts`.
- Vitest 4.1.11 - Unit test runner. Config in `vitest.config.js`. Environment: `happy-dom` (lightweight DOM simulation).
- @vue/test-utils 2.4.11 - Vue component testing utilities.
- @nuxt/test-utils 4.1.0 - Nuxt-specific testing helpers.
- Nitro 2.13.4 - Nuxt's server engine, configured as `static` preset for Cloudflare Pages (no server-side code).
- ESLint 10.8.1 - Linting via `@nuxt/eslint` v1.17.0 module. Config: `eslint.config.mjs` (reexports Nuxt's generated config).
- Nuxt DevTools - Integrated development tools (enabled in `nuxt.config.ts`).

## Key Dependencies

- `@pinia/nuxt` 1.0.2 - Bridges Pinia and Nuxt, enabling auto-import of stores.
- `vue-router` 5.2.0 - Required for file-based page routing in Nuxt.
- `sass-embedded` 1.102.0 - SCSS compiler. Embedded binary (faster than node-sass).
- `@nuxt/eslint` 1.17.0 - ESLint integration for Nuxt projects.
- `@nuxt/test-utils` 4.1.0 - Testing utilities specific to Nuxt.
- No Stripe, Mercado Pago, or payment gateway (no checkout).
- No database client (Phase A static data; Phase B will add Supabase).
- No auth library (Phase A no admin; Phase B will add auth).
- No API client (all external calls are hardcoded URLs or direct integrations).

## Configuration

- No required environment variables for Phase A (static site).
- `.env` file structure exists in `.gitignore` but `.env.example` is not present.
- No secrets, API keys, or credentials needed for current deployment.
- `nuxt.config.ts` - Nuxt configuration, including:
- `tsconfig.json` - References Nuxt-generated configs (`.nuxt/tsconfig.*.json`). Do not edit manually.
- `.nuxtrc` - Minimal config: `setups.@nuxt/test-utils="4.1.0"`.
- `vitest.config.js` - Test environment: `happy-dom`. Includes: `tests/**/*.{test,spec}.js`.
- `eslint.config.mjs` - Reexports Nuxt's auto-generated ESLint config. Do not edit.

## Platform Requirements

- Node.js (no specific version pinned)
- npm 10+
- SCSS support (via sass-embedded)
- Bash shell for npm scripts
- Cloudflare Pages - Static site host. Build command: `npm run build`. Output: `.output/public/`.
- HTTP server only (no server-side code in current Phase A).
- Nitro preset: `cloudflare-pages` (via `nuxt.config.ts` compatibility).
- Output format: Static HTML, CSS, JavaScript (pre-rendered at build time).
- Build artifact: `.output/public/` (published to Cloudflare Pages).

## Scripts

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

## Naming Patterns

- Components: `PascalCase.vue` — e.g., `AppHeader.vue`, `CartDrawer.vue`, `IconCart.vue`
- Pages: `kebab-case.vue` — e.g., `index.vue` (currently single page)
- Composables: `useXxx.js` (camelCase with `use` prefix) — e.g., `useCart.js`, `useCatalog.js`, `useWhatsApp.js`
- Stores: `lowercase.js` — e.g., `cart.js`, `catalog.js`, `favorites.js`, `ui.js`
- Icon components: `IconXxx.vue` — e.g., `IconCart.vue`, `IconSearch.vue`, `IconMenu.vue`
- Directories: `lowercase` — e.g., `components/`, `stores/`, `composables/`, `assets/scss/`
- camelCase for all functions — e.g., `addItem()`, `filterProducts()`, `buildOrderMsg()`
- Pure functions (no side effects) exported from composables for testability — e.g., all functions in `app/composables/useCart.js`
- Constants: `UPPER_SNAKE_CASE` — e.g., `MAX_QTY`, `STORAGE_KEY`, `SORT_OPTIONS`, `CATALOGO` (test data)
- Local variables and props: `camelCase` — e.g., `scrolled`, `isNew`, `onlyFavorites`
- Reactive refs: `camelCase` — e.g., `items`, `query`, `category`
- Computed properties: `camelCase` — e.g., `count`, `lines`, `isEmpty`
- Store properties: `camelCase` — e.g., `cart.count`, `catalog.focusSearch()`
- Objects with descriptive property names: e.g., `{ id, name, cat, img, price, avail, isNew, desc }`
- Filter objects: `{ query, category, onlyAvailable, onlyNew, onlyFavorites, sort }`
- Cart items: `{ id, qty }` (minimal, retrieves name/photo from catalog at render time)
- Customer data: `{ name, phone, method, notes }`

## Code Style

- ESLint configured via `@nuxt/eslint` (reexported in `eslint.config.mjs`)
- No Prettier config — ESLint provides linting only
- Indentation: 2 spaces (standard JavaScript)
- Line breaks: LF
- Tool: ESLint 10.8.1 with @nuxt/eslint 1.17.0
- Config: `eslint.config.mjs` (reexports `.nuxt/eslint.config.mjs` generated by Nuxt)
- Run: `npm run lint` (check), `npm run lint:fix` (auto-fix)
- No TypeScript in application code — only in config files (`nuxt.config.ts`, `tsconfig.json`) inherited from scaffold
- Script tag: `<script setup>` (Composition API) **always** — never Options API
- Imports grouped: Vue API first, then Pinia stores, then composables, then utility functions
- Template: semantic HTML, no inline styles
- Styles: `<style lang="scss" scoped>` — shared global styles in `assets/scss/`, component-specific in scoped blocks

## Import Organization

- `~` maps to `app/` root — always use `~/path` not relative imports
- Examples: `~/stores/cart`, `~/composables/useCart`, `~/data/products`, `~/assets/scss/main`

## Error Handling

- Try/catch wrapping `JSON.parse()` for localStorage — fallback to empty/default value
- Silent failures on validation (filter invalid cart items via `sanitize()`, ignore missing products via `withProducts()`)
- No error UI for localStorage operations — assumes corruption is rare; cart/favorites degrade gracefully to empty

## Logging

- Comments document *why* decisions were made, not *what* the code does
- Used sparingly for design decisions or algorithmic explanation (e.g., comments in `useCatalog.js` on fuzzy search rationale)
- No logging for debugging in production code — use browser DevTools
- Test files can log for debugging during development

## Comments

- Explain business logic constraints — e.g., "Produto não exibe preço" is mentioned in code comments (`useCart.js`)
- Document algorithmic complexity or non-obvious optimizations (e.g., Damerau-Levenshtein edit distance in `useCatalog.js`)
- Warn about performance implications (e.g., backdrop-filter comment in `AppHeader.vue`)
- Mark known limitations or workarounds (e.g., SSR hydration issue in `cart.client.js`)
- Obvious comments that restate the code
- Commented-out code (delete it)
- Not used — code is simple enough that signatures are self-explanatory
- Composable functions are pure and have no side effects, making behavior predictable

## Function Design

- Aim for small, focused functions (most composable exports are 1–20 lines)
- Complex algorithms (like `editDistance`) are self-contained and documented
- Pass data explicitly, not via global state — enables testability
- Use destructuring for objects with many properties (e.g., `const { name = '', phone = '' } = customer`)
- Default parameters for optional values — e.g., `qty = 1`, `customer = {}`
- Pure functions always return new objects/arrays (no mutations) — e.g., `addItem()` returns new array
- Computed properties delegate to functions and cache result — e.g., `cart.lines` calls `withProducts()` once per dependency change
- Validation functions return sanitized data (not errors) — e.g., `sanitize()` filters invalid entries silently

## Module Design

- Composables export pure functions directly (not wrapped in objects) for easier testing — e.g., `export function addItem() { ... }`
- Stores export a single Pinia store via `defineStore()` with methods and computed properties
- Data files export constants — e.g., `app/data/products.js`, `app/data/store-info.js`
- Not used — imports are direct to the file (no index.js re-exports)
- Keeps import paths explicit and navigable

## Style (SCSS)

- Global tokens in `app/assets/scss/_tokens.scss` — CSS custom properties (`:root` variables), not SCSS variables
- Shared classes in `app/assets/scss/` (`.btn`, `.icon-btn`, `.close-x`, `.badge`, `.container`, `.section`)
- Component-specific styles in `<style lang="scss" scoped>` block
- Use `:deep()` pseudo-selector when a parent must style inside a scoped child component
- Organized by category: colors (`--blue-*`, `--gold-*`, `--ink-*`, `--line`), typography (`--font-*`), spacing (`--sp-1` through `--sp-9`), sizing (`--container`), shadows (`--sh-*`)
- Read at runtime and change in media queries (e.g., `--header-h` differs on mobile)
- Use `var()` everywhere, never hardcode hex colors or pixel values in component styles
- Descriptive, semantic names — e.g., `.brand`, `.header-inner`, `.cart-count`
- State modifiers: `.scrolled`, `.show`, `.today`, `.has-logo`
- Utility patterns: `.container` (max-width wrapper), `.icon-btn` (square icon button)
- All styling via classes or scoped `<style>` blocks
- Inline `style=` attribute forbidden — CSS is easier to debug and reuse

<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

## System Overview

```text

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

- Business logic (filter, cart rules, message building) is pure functions with no Vue dependencies — testable without mounting components
- Pinia stores delegate rule enforcement to composables, own only state reactivity and localStorage persistence
- Components read from stores and composables, call store methods on user interaction
- Data layer is static imports (no API yet — Supabase comes in Phase B)
- No prices displayed in public UI (Supabase and admin panel come later)
- No login/auth in Phase A — favorites and cart stored in `localStorage`

## Layers

- Purpose: Render UI, handle user interaction
- Location: `app/components/`, `app/pages/`, `app/layouts/`
- Contains: Vue 3 Composition API components with `<script setup>`, scoped SCSS
- Depends on: Pinia stores, composables, data modules
- Used by: Nuxt routing and layout system
- Purpose: Reactive state, computed properties, persistence hooks
- Location: `app/stores/` (defineStore with Pinia)
- Contains: `ui.js`, `catalog.js`, `favorites.js`, `cart.js`, `toast.js`
- Depends on: Composables for business logic, data modules for product lookups
- Used by: Components via `useStore()`, plugins for hydration
- Purpose: Pure functions — rules that don't change, testable in isolation
- Location: `app/composables/`
- Contains: `useCart.js`, `useCatalog.js`, `useWhatsApp.js`, `useStoreHours.js`, `useLocalBusiness.js`
- Depends on: Data modules, standard JavaScript
- Used by: Stores, components (for WhatsApp link generation)
- Purpose: Static product catalog, categories, store contact info
- Location: `app/data/` (exported JS/TS objects)
- Contains: `products.js`, `categories.js`, `banners.js`, `store-info.js`
- Depends on: Nothing (pure data)
- Used by: Stores, composables
- Purpose: Design system tokens, reusable classes, component scoping
- Location: `app/assets/scss/`
- Contains: `_tokens.scss` (CSS variables), `_reset.scss`, `_buttons.scss`, `_layout.scss`, `_animations.scss`, `main.scss` (imports)
- Depends on: Nothing
- Used by: All components via `<style lang="scss" scoped>`

## Data Flow

### Primary Request Path: Browse & Add to Cart

### State Management Lifecycle

- Pinia stores initialize with empty/default values
- Server renders HTML with empty cart count, empty favorites
- No localStorage on server
- Hydration phase finishes
- Plugin hooks fire: `app:suspense:resolve`
- Stores hydrate from localStorage
- Vue sees new state, updates DOM if different from server HTML

## Key Abstractions

- Purpose: Hold what the user chose to see (query, category, availability, etc.)
- Example: `app/stores/catalog.js:11`
- Pattern: Reactive object, methods to modify (selectCategory, clearFilters)
- Purpose: Minimal cart record — only id and quantity
- Structure: `{ id: number, qty: number }`
- Pattern: Pure functions transform this into display data by joining with products via `withProducts()`
- Purpose: The payoff — formatted Markdown for WhatsApp
- Built by: `buildOrderMsg(lines, customer)` — pure function
- Pattern: Takes cart lines + customer info, returns string, no side effects
- Purpose: Decouple data (category.icon = 'gift') from component rendering
- Pattern: `app/components/AppIcon.vue` resolves icon name string to component dynamically
- Alternative: Direct use in template (`<IconGift />`) when icon is static
- Purpose: Decouple logical key (image: 'pilhas') from file path
- Pattern: `app/components/ProductImage.vue` maps key to file path
- Benefit: If image moves or format changes, only ProductImage updates

## Entry Points

- Location: `app/pages/index.vue`
- Triggers: Nuxt routing (/ path)
- Responsibilities: Compose all sections, inject JSON-LD schema for SEO
- Location: `app/app.vue`
- Triggers: Nuxt bootstrap
- Responsibilities: Render layout, render page slot
- Location: `app/layouts/default.vue`
- Triggers: Automatically applied to all pages
- Responsibilities: Render header/footer/main, manage keyboard Esc listener, render modals/drawers portal
- Location: `app/plugins/cart.client.js`, `app/plugins/favorites.client.js`
- Trigger: `app:suspense:resolve` hook (after all Suspense components resolve)
- Responsibilities: Load cart and favorites from localStorage into Pinia

## Architectural Constraints

- **Threading:** Single-threaded JavaScript event loop (no workers)
- **Global state:** 
- **Circular imports:** None detected; stores import composables, composables don't import stores
- **SSR + Hydration:** Critical timing issue: localStorage data must NOT be read until after `app:suspense:resolve`, or Vue sees server/client HTML mismatch on `class` attributes (never corrected by Vue)
- **Static Data:** All product/category data imported from `app/data/` — no runtime fetching in Phase A
- **No Prices in UI:** Business rule enforced by not sending product.price to components
- **No Auth:** Phase A has no login; cart and favorites live in localStorage under keys `lp_cart` and `lp_favs`

## Anti-Patterns

### Storing Data in Component State Instead of Composables

### Reading localStorage Directly in Setup

### Importing Components Inside Business Logic

### Mutating State Arrays/Objects

### Price Display or Calculation

## Error Handling

- `localStorage` read failures: Try/catch, return empty array (favorites.js:17-22, cart.js:28-31)
- Missing products: Filter out silently (withProducts filters out nulls; selectedProduct returns null if not found)
- Malformed data: `sanitize()` validates cart items before use (`useCart.js:42-48`)
- Network failures: Not applicable in Phase A (static data only)

## Cross-Cutting Concerns

- Cart sanitization: `useCart.sanitize()`
- Query normalization: `useCatalog.normalize()` (accent removal, lowercase)
- Clamp quantity: `useCart.clamp()` (1 to MAX_QTY)
- Cart: `localStorage['lp_cart']` JSON string (persists after every add/remove/setQty)
- Favorites: `localStorage['lp_favs']` JSON array
- Hydrated after page loads via plugin hooks

<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

| Skill | Description | Path |
|-------|-------------|------|
| commit-and-push | > Fluxo de git deste repositório (site da Lírio Pimenta): revisa o que mudou, monta um commit seguindo o estilo curto já usado no histórico do projeto, faz stage só dos arquivos relevantes, e só dá push depois de confirmação explícita mostrando branch e remoto. Use sempre que o usuário pedir para "commitar", "fazer um commit", "subir as mudanças", "dar push", "mandar pro remoto", "mandar pro GitHub", "salvar isso no git", ou variações — mesmo sem usar a palavra "commit" literalmente (ex: "pode registrar essas mudanças", "isso já pode ir pro repositório", "põe no histórico"). Invocar esta skill já vale como o pedido explícito de commit exigido pelo CLAUDE.md do projeto; push continua exigindo confirmação separada a cada vez. NÃO use para resolver conflito de merge, criar/trocar branch, rebase ou cherry-pick — sinalize isso ao usuário em vez de tentar. | `.claude/skills/commit-and-push/SKILL.md` |
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
