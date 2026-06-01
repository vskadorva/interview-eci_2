# E2E Test Plan — Phase 1 (Critical Regression Suite)

This document maps the **original critical/high bugs** we fixed to automated tests in `apps/e2e`. Phase 1 focuses on failures that broke core user journeys: auth, browse, cart, checkout, favorites, and security.

---

## Scope

| In scope (Phase 1) | Out of scope (later phases) |
|--------------------|-----------------------------|
| Auth middleware & session | StarRating gradient IDs |
| CORS DELETE | Validation error message formatting |
| Pricing display | Unique username enforcement (API-only edge) |
| Browse filters & React Query cache | Price filter UI edge cases (`minPrice=0`) |
| Login username in navbar | bcrypt / JWT secret hardening |
| Cart, checkout, favorites flows | Duplicate username registration |
| Cart IDOR | Silent mutation errors on detail page |
| Logout clears persisted token | Full sort-order matrix |

---

## Bugs → Tests Matrix

### Critical

| ID | Bug | Root cause | Test file | Test name |
|----|-----|------------|-----------|-----------|
| C-01 | Protected routes returned **500** (auth middleware skipped JWT) | `ENFORCE_AUTH` bypass; `request.user` unset | `security.api.spec.ts` | `GET /cart without token returns 401` |
| C-01 | (same) | (same) | `security.api.spec.ts` | `GET /cart with valid token returns 200` |
| C-01 | (same) | (same) | `auth.spec.ts` | `register restores session on page reload via /auth/me` |
| C-02 | Auth middleware did not halt after 401 | Missing `return` after `reply.send` | `security.api.spec.ts` | Covered implicitly by 401 response body (no double handler crash) |
| C-03 | **PersonaCard price ×100** ($4999 vs $49.99) | `persona.price * 100` in `PersonaCard.tsx` | `browse.spec.ts` | `browse cards show correct monthly price` |
| C-03 | (same) | (same) | `browse.spec.ts` | `persona detail price matches browse card price` |

### High — Auth & Security

| ID | Bug | Root cause | Test file | Test name |
|----|-----|------------|-----------|-----------|
| H-04 | **Login response omitted `username`** | API login returned `{ id, email }` only | `auth.spec.ts` | `login displays username in navbar` |
| H-08 | **CORS omitted DELETE** | `methods` array missing `DELETE` | `security.api.spec.ts` | `CORS preflight allows DELETE from web origin` |
| H-08 | (same) | (same) | `favorites.spec.ts` | `can add and remove favorite from persona detail` |
| H-07 | **Cart DELETE IDOR** | No `userId` ownership check on DELETE | `security.api.spec.ts` | `user cannot delete another users cart item` |
| H-11 | **Logout did not clear localStorage** | `logout()` skipped `localStorage.removeItem` | `auth.spec.ts` | `logout clears persisted session on reload` |

### High — Data & Commerce

| ID | Bug | Root cause | Test file | Test name |
|----|-----|------------|-----------|-----------|
| H-05 | **`minPrice` filter inverted** | `price <= minPrice` in `db.ts` | `security.api.spec.ts` | `minPrice filter returns personas at or above threshold` |
| H-06 | **Checkout did not clear cart** | `clearForUser` never called | `cart-checkout.spec.ts` | `checkout empties cart and shows confirmation` |
| H-09 | **Browse React Query cache ignored filters** | Static `queryKey: ["personas"]` | `browse.spec.ts` | `specialty filter updates results without stale cache` |
| H-10 | **Favorite toggle inverted** | DELETE/POST logic reversed on detail page | `favorites.spec.ts` | `favorite heart toggles add and remove correctly` |

---

## Test Architecture (Phase 1)

```
apps/e2e/
├── playwright.config.ts      # Projects, webServer, reporters
├── src/
│   ├── constants.ts          # URLs, auth storage key
│   ├── fixtures/test.ts      # Extended test + authenticated fixture
│   ├── helpers/
│   │   ├── api-client.ts     # API setup/teardown (register, cart, CORS probe)
│   │   └── test-data.ts      # Unique user factory
│   └── pages/                # Page objects (Browse, Auth, Cart, Checkout, Persona)
├── tests/
│   ├── setup/auth.setup.ts   # Session reuse → .auth/user.json
│   └── phase-1/*.spec.ts     # Critical regression specs
└── .auth/                    # Gitignored storageState (generated)
```

### Best practices applied

| Practice | Implementation |
|----------|----------------|
| **Session reuse** | `auth.setup.ts` registers via API, seeds `localStorage`, saves `storageState`; authenticated specs run in `phase-1-authenticated` project |
| **Fixtures** | Custom `test` export merges `apiClient` fixture for API helpers; page objects injected per spec |
| **Teardown** | `afterEach` clears cart for authenticated user via API; `afterAll` in setup removes transient state |
| **Isolation** | Unique email/username per run (`test-data.ts`); no shared mutable DB assumptions across workers |
| **Layer split** | UI specs in browser; security/data invariants in `security.api.spec.ts` (fast, deterministic) |

---

## Run commands

```bash
# Start app (or let Playwright reuse existing servers)
pnpm dev

# Install browsers (first time only)
pnpm --filter @acme/e2e exec playwright install chromium

# Run Phase 1 suite
pnpm test:e2e:phase1

# Run with UI / debug
pnpm --filter @acme/e2e test:ui
pnpm --filter @acme/e2e test:debug
```

---

## Success criteria (Phase 1)

- All Phase 1 specs pass against a running dev stack (`:5173` + `:3001`)
- Failures map 1:1 to regressions listed above
- Auth setup runs once per test run; authenticated specs do not re-register unless setup fails
- API security specs pass without browser (fast CI feedback)

---

## Phase 2 backlog (not implemented yet)

- Sort order verification (price asc/desc, rating, name)
- Cart badge sync (`cart-count` vs `cart` query key — already fixed, test pending)
- Register validation error readability (`[object Object]`)
- Price range UI inputs (min/max fields)
- Register duplicate username / email conflict messages
- Full logout → login → checkout journey with separate users
