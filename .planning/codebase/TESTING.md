# Testing Patterns

**Analysis Date:** 2026-08-29

## Test Framework

**Runner:**
- Vitest 4.1.11 (`npm run test`)
- Config: `vitest.config.js`
- Environment: `happy-dom` (lightweight DOM implementation, suitable for unit tests)

**Assertion Library:**
- Vitest built-in `expect()` API (from Vitest)

**Run Commands:**
```bash
npm run test              # Run all tests once, pass with no tests
npm run test:watch       # Vitest in watch mode
npx vitest run tests/cart.test.js        # Single file
npx vitest run tests/cart.test.js -t "remove item"   # Single test case
```

## Test File Organization

**Location:**
- Co-located in `tests/` directory at project root (not alongside source files)
- Tests are independent of the Nuxt app structure

**Naming:**
- Pattern: `{module}.test.js` — e.g., `cart.test.js`, `catalog.test.js`
- File extension: `.test.js` (not `.spec.js`)

**Structure:**
```
tests/
├── cart.test.js       # useCart.js pure functions
└── catalog.test.js    # useCatalog.js pure functions
```

## Test Structure

**Suite Organization:**
```javascript
import { describe, expect, it } from 'vitest'
import { addItem, removeItem } from '../app/composables/useCart'

describe('adicionar', () => {
  it('adiciona item novo', () => {
    expect(addItem([], 1)).toEqual([{ id: 1, qty: 1 }])
  })

  it('soma na linha que já existe', () => {
    const carrinho = addItem(addItem([], 1), 1, 2)
    expect(carrinho).toEqual([{ id: 1, qty: 3 }])
  })
})
```

**Patterns:**
- `describe()` blocks group related tests by feature (e.g., "adicionar", "quantidade", "remover e contar")
- Descriptive titles in Portuguese (user-facing feature names) for readability
- Each `it()` test one scenario with a single assertion or tightly related assertions
- Test data defined as constants at module top — e.g., `CATALOGO` array in `tests/cart.test.js`
- No setup/teardown hooks (`beforeEach`, `afterEach`) currently used — tests are stateless

**Assertion Style:**
- Use `expect()` with chained matchers
- `.toEqual()` for object/array equality (deep comparison)
- `.toBe()` for primitive equality and identity checks
- `.toContain()` for string/array presence checks
- `.toMatch()` for regex matching

## Mocking

**Framework:** None explicitly used

**Patterns:**
- Pure functions tested directly without mocking (preferred approach)
- Test fixtures provide mock data directly — e.g., `CATALOGO` mock array in `tests/cart.test.js`
- Pass mock functions as arguments — e.g., `withProducts([...], acha)` where `acha = (id) => CATALOGO.find(p => p.id === id)`
- No Pinia stores mocked in unit tests — stores are tested via their pure function dependencies

**What to Mock:**
- None currently — all tested code is pure
- If integration required, pass mock functions as callback arguments

**What NOT to Mock:**
- Pure functions from composables — test them directly
- localStorage (handled in store layer, not tested in unit tests currently)

## Fixtures and Factories

**Test Data:**
```javascript
// From tests/cart.test.js
const CATALOGO = [
  { id: 1, name: 'Pilha Recarregável AA', available: true },
  { id: 2, name: 'Bola de Futebol', available: true },
  { id: 3, name: 'Carimbo Personalizado', available: false },
]

const acha = (id) => CATALOGO.find((p) => p.id === id)

// From tests/catalog.test.js
const produtos = [
  { id: 1, name: 'Pilha Recarregável AA', category: 'Utilidades', desc: 'Para controle e brinquedo', available: true, isNew: true, price: null },
  { id: 5, name: 'Cola Branca Escolar', category: 'Livraria', desc: 'Papelaria', available: true, isNew: false, price: null },
  // ...
]

const filtros = (extra = {}) => ({ ...createFilters(), ...extra })
```

**Location:**
- Defined at the top of each test file
- Minimal — only the fields needed for that test suite
- Factories as helper functions — e.g., `filtros()` returns default filters merged with overrides

## Coverage

**Requirements:** Not enforced (no coverage threshold in config)

**View Coverage:**
```bash
npx vitest run --coverage
```

**Current State:**
- Tests cover business logic that matters: cart operations, filtering, search, order message generation
- No component tests (Vue presentation components not tested)
- No integration tests with Pinia stores

## Test Types

**Unit Tests:**
- Scope: Pure functions in composables (`app/composables/useCart.js`, `app/composables/useCatalog.js`)
- Approach: Direct function calls with mock data fixtures
- Coverage: Cart logic (add, remove, quantity), search/filter logic, message generation
- Example: `tests/cart.test.js` — 19 test cases covering `addItem()`, `setQuantity()`, `removeItem()`, `buildOrderMsg()`, `sanitize()`

**Integration Tests:**
- Not present — Pinia stores are tested implicitly via their pure function dependencies
- Could be added in future for `hydrate()`/`persist()` to localStorage

**E2E Tests:**
- Not implemented — not in scope for Phase A

## Common Patterns

**Async Testing:**
Currently not used — no async operations in tested functions.

If needed (future):
```javascript
it('loads data', async () => {
  const result = await fetchData()
  expect(result).toBeDefined()
})
```

**Error Testing:**
```javascript
// From tests/cart.test.js — validateInput via sanitize()
it('descarta o que não é lista', () => {
  expect(sanitize('lixo')).toEqual([])
  expect(sanitize(null)).toEqual([])
})

it('descarta linha sem id ou com quantidade inválida', () => {
  const sujo = [{ id: 1, qty: 2 }, { id: 'x', qty: 1 }, { id: 2 }, { id: 3, qty: 0 }, null]
  expect(sanitize(sujo)).toEqual([{ id: 1, qty: 2 }])
})
```

**Data Mutation Testing:**
```javascript
it('não altera a lista original', () => {
  const original = [{ id: 1, qty: 1 }]
  addItem(original, 1)
  expect(original).toEqual([{ id: 1, qty: 1 }])  // unchanged
})
```

**Boundary Testing:**
```javascript
it('respeita o teto de quantidade', () => {
  expect(addItem([], 1, 500)).toEqual([{ id: 1, qty: MAX_QTY }])
})
```

## Test Coverage Breakdown

**What IS tested:**
- `app/composables/useCart.js` — all functions (19 test cases)
  - Adding items (new, existing, quantity clamping)
  - Quantity updates (zero removes, negatives remove)
  - Removal and counting
  - Data sanitization from localStorage
  - Order message generation (with client data, availability markers, no prices)

- `app/composables/useCatalog.js` — filtering, search, normalization (20+ test cases)
  - Fuzzy search with typo tolerance
  - Filtering by category, availability, new status, favorites
  - Sorting by relevance, newness, alphabetical
  - Combined filters

**What is NOT tested:**
- Vue components (presentation logic)
- Pinia stores (integration with localStorage)
- HTTP requests or API calls (none in Phase A)
- Browser APIs (localStorage, IntersectionObserver) — tested at component level manually

## Maintenance

**Adding Tests:**
1. Create test file in `tests/` directory
2. Import functions directly from `~/app/composables/` path (relative path works: `../app/composables/useXxx`)
3. Define test data as constants at top
4. Use `describe()` for feature groups, `it()` for individual scenarios
5. Run `npm run test:watch` during development
6. Run `npm run test` before committing

**Key Principle:**
Test behavior, not implementation. If the function produces the correct output for given input, the test passes — how it got there doesn't matter.

---

*Testing analysis: 2026-08-29*
