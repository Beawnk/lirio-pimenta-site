# Technology Stack

**Analysis Date:** 2026-08-29

## Languages

**Primary:**
- JavaScript - Application code in `app/**` and configuration files. No TypeScript in application code; config files (`nuxt.config.ts`, `tsconfig.json`) use TypeScript scaffold but remain unchanged from Nuxt init.

**Markup & Styling:**
- HTML - Semantic markup in Vue components
- SCSS - `sass-embedded` v1.102.0 - all styling uses SCSS with CSS variables for theming. Shared styles in `app/assets/scss/main.scss` (tokens, reset, layout, buttons, badges, animations); component-scoped styles via `<style lang="scss" scoped>`.

## Runtime

**Environment:**
- Node.js (no version pinning via `.nvmrc` or `.node-version`)
- npm (v10+ inferred from package-lock.json)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present
- Installation: `npm install`

## Frameworks

**Core:**
- Nuxt 4.5.2 - Full-stack Vue framework with Composition API, SSR, and static generation. Configured for `cloudflare-pages` preset (Nitro v2.13.4) for static output. Auto-imports composables, components, stores.
- Vue 3.5.41 - UI framework. All code uses Composition API with `<script setup>` (no Options API).
- Vue Router 5.2.0 - File-based routing via `app/pages/` directory.

**State Management:**
- Pinia 4.0.3 - Reactive state stores with composition functions. Four stores: `ui` (UI state), `catalog` (search/filters), `favorites` (bookmarks), `cart` (order building).
- localStorage persistence - Manual serialization/deserialization in store methods; cart hydrated via `app:suspense:resolve` hook to avoid SSR mismatch.

**Styling:**
- SCSS with CSS Variables - Design tokens in `app/assets/scss/_tokens.scss`. No CSS-in-JS, no Tailwind, no utility frameworks.
- Google Fonts - Poppins (display) and Inter (text), loaded via CDN link in `nuxt.config.ts`.

**Testing:**
- Vitest 4.1.11 - Unit test runner. Config in `vitest.config.js`. Environment: `happy-dom` (lightweight DOM simulation).
- @vue/test-utils 2.4.11 - Vue component testing utilities.
- @nuxt/test-utils 4.1.0 - Nuxt-specific testing helpers.

**Build & Development:**
- Nitro 2.13.4 - Nuxt's server engine, configured as `static` preset for Cloudflare Pages (no server-side code).
- ESLint 10.8.1 - Linting via `@nuxt/eslint` v1.17.0 module. Config: `eslint.config.mjs` (reexports Nuxt's generated config).
- Nuxt DevTools - Integrated development tools (enabled in `nuxt.config.ts`).

## Key Dependencies

**Critical:**
- `@pinia/nuxt` 1.0.2 - Bridges Pinia and Nuxt, enabling auto-import of stores.
- `vue-router` 5.2.0 - Required for file-based page routing in Nuxt.

**Infrastructure/Build:**
- `sass-embedded` 1.102.0 - SCSS compiler. Embedded binary (faster than node-sass).
- `@nuxt/eslint` 1.17.0 - ESLint integration for Nuxt projects.
- `@nuxt/test-utils` 4.1.0 - Testing utilities specific to Nuxt.

**No external SDK/service dependencies:**
- No Stripe, Mercado Pago, or payment gateway (no checkout).
- No database client (Phase A static data; Phase B will add Supabase).
- No auth library (Phase A no admin; Phase B will add auth).
- No API client (all external calls are hardcoded URLs or direct integrations).

## Configuration

**Environment:**
- No required environment variables for Phase A (static site).
- `.env` file structure exists in `.gitignore` but `.env.example` is not present.
- No secrets, API keys, or credentials needed for current deployment.

**Build Configuration:**
- `nuxt.config.ts` - Nuxt configuration, including:
  - Meta tags (title, description, OG tags, business contact data).
  - CSS import path: `~/assets/scss/main.scss` (shared styles).
  - Modules: `@pinia/nuxt`, `@nuxt/eslint`, `@nuxt/test-utils/module`.
  - Compatibility date: 2025-07-15.
  - DevTools enabled.
  - `robots` meta tag: `noindex, nofollow` (temporary domain, will be removed on production domain).

- `tsconfig.json` - References Nuxt-generated configs (`.nuxt/tsconfig.*.json`). Do not edit manually.

- `.nuxtrc` - Minimal config: `setups.@nuxt/test-utils="4.1.0"`.

- `vitest.config.js` - Test environment: `happy-dom`. Includes: `tests/**/*.{test,spec}.js`.

- `eslint.config.mjs` - Reexports Nuxt's auto-generated ESLint config. Do not edit.

## Platform Requirements

**Development:**
- Node.js (no specific version pinned)
- npm 10+
- SCSS support (via sass-embedded)
- Bash shell for npm scripts

**Production:**
- Cloudflare Pages - Static site host. Build command: `npm run build`. Output: `.output/public/`.
- HTTP server only (no server-side code in current Phase A).

**Deployment Preset:**
- Nitro preset: `cloudflare-pages` (via `nuxt.config.ts` compatibility).
- Output format: Static HTML, CSS, JavaScript (pre-rendered at build time).
- Build artifact: `.output/public/` (published to Cloudflare Pages).

## Scripts

```bash
npm run dev        # Start Nuxt dev server (http://localhost:3000)
npm run build      # Build for production (outputs to .output/public/)
npm run generate   # Generate static site (alias for build in Phase A)
npm run preview    # Preview production build locally
npm run lint       # Run ESLint
npm run lint:fix   # Run ESLint with --fix
npm run test       # Run Vitest once
npm run test:watch # Run Vitest in watch mode
npm run postinstall # Nuxt prepare (run automatically after npm install)
```

---

*Stack analysis: 2026-08-29*
