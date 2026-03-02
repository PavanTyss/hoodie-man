# Plan Verification: Table, Filter, Sort, and Search

Verification against **Section 1b (Final implementation plan)** and **Sections 6–8** of the plan.  
*Generated from codebase inspection.*

---

## Phase 1 – Database ✅

| Requirement | Status | Location |
|-------------|--------|----------|
| Order: `userId`, `status`, `createdAt`, `deliveryAgentId` | ✅ | `prisma/schema.prisma` @@index on Order |
| Product: `category`, `storeId`, `name`, `@@index([storeId, category])` | ✅ | Product model |
| User: `email`, `role`, `createdAt` | ✅ | User model |
| Store: `createdById`, `name`, `slug` | ✅ | Store model |
| AuditLog: `createdAt`, `action`, `entityType`, `actorId` | ✅ | AuditLog model (existing) |
| DeliveryAddress: `userId`, `isDefault`, `createdAt` | ✅ | DeliveryAddress model |

---

## Phase 2 – API (list + CRUD consistency) ✅

### Admin list APIs – Zod + `{ items, pagination }`

| API | Params | Response | Zod | File |
|-----|--------|----------|-----|------|
| GET /api/admin/orders | page, limit (max 50), status, sortBy, sortOrder, q | items, pagination | ✅ | `src/app/api/admin/orders/route.ts` |
| GET /api/admin/products | page, limit, storeId, lowStock, sortBy, sortOrder, q | items, pagination | ✅ | `src/app/api/admin/products/route.ts` |
| GET /api/admin/super/users | page, limit, role, sortBy, sortOrder, q | items, pagination | ✅ | `src/app/api/admin/super/users/route.ts` |
| GET /api/admin/stores | page, limit, sortBy, sortOrder, q | items, pagination | ✅ | `src/app/api/admin/stores/route.ts` |
| GET /api/admin/super/audit-logs | page, limit, action, entityType, from, to, actorId, sortBy, sortOrder, q | items, pagination | ✅ | `src/app/api/admin/super/audit-logs/route.ts` |

### Public and customer list APIs

| API | Params | Rate limit / Auth | File |
|-----|--------|--------------------|------|
| GET /api/products | category, q, sortBy, sortOrder, page, limit (default 24, max 48) | ✅ publicReadRateLimiter (120/min) | `src/app/api/products/route.ts` |
| GET /api/orders (customer) | page, limit, status, sortBy, sortOrder, q | Auth | `src/app/api/orders/route.ts` |
| GET /api/addresses | sortBy, sortOrder, q | Auth | `src/app/api/addresses/route.ts` |

### CRUD consistency fix ✅

| Item | Status | File |
|------|--------|------|
| GET /api/admin/orders/[id]: admin role → `canAccessStore(actorId, storeId, role)` | ✅ | `src/app/api/admin/orders/[id]/route.ts` |

---

## Phase 3 – UI primitives ✅

| Component | Plan requirement | Implementation |
|-----------|------------------|----------------|
| **DataTable** | columns, data, loading (skeleton), empty state, sortable headers, aria-sort, semantic table | ✅ `src/components/ui/DataTable.tsx` – 8 skeleton rows, `<table>`, `aria-sort`, sort buttons |
| **SortDropdown** | sortBy/sortOrder, aria-label, keyboard | ✅ `src/components/ui/SortDropdown.tsx` – label, two selects, aria-label |
| **SearchInput** | debounced (300–400 ms), onSearch(q), label/aria-label | ✅ `src/components/ui/SearchInput.tsx` – debounceMs=350, onSearch, label |
| **FilterBar** | composable filters, labels/aria-label | ✅ `src/components/ui/FilterBar.tsx` – role="group", aria-label="Filters" |

---

## Phase 4 – Admin pages ✅

| Page | URL params | FilterBar | SearchInput | SortDropdown | Pagination |
|------|------------|-----------|-------------|--------------|------------|
| admin/orders | page, limit, status, sortBy, sortOrder, q | ✅ status | ✅ | ✅ | ✅ Prev/Next |
| admin/products | page, limit, storeId, lowStock, sortBy, sortOrder, q | ✅ store, lowStock | ✅ | ✅ | ✅ |
| admin/users | page, role, sortBy, sortOrder, q | ✅ role | ✅ | ✅ | ✅ |
| admin/stores | page, sortBy, sortOrder, q | — | ✅ | ✅ | ✅ |
| admin/audit-logs | page, limit, action, entityType, from, to, sortBy, sortOrder, q | ✅ existing filters | ✅ | ✅ | ✅ |

All use `router.replace` + `useSearchParams` for URL-driven state and consume API `items` / `pagination`.

---

## Phase 5 – Storefront ✅

| Page / Area | Requirement | Implementation |
|-------------|-------------|----------------|
| **Search** | GET /api/products with q, sortBy, sortOrder, page, limit; URL state; SortDropdown; pagination | ✅ `src/app/search/page.tsx` – searchParams, setParams, fetch with params, SortDropdown, Prev/Next |
| **Category (hoodies, t-shirts, apparel)** | GET /api/products?category=...&sortBy=&page=&limit=; sort and pagination | ✅ `CategoryProducts.tsx` – category, page, sortBy, sortOrder from URL; fetch with params; SortDropdown; pagination |

---

## Phase 6 – Customer dashboard ✅

| Page | Requirement | Implementation |
|------|-------------|----------------|
| **Dashboard orders** | status filter, sort, search (q), pagination via GET /api/orders; UI controls | ✅ `src/app/dashboard/page.tsx` – FilterBar (status), SearchInput, SortDropdown, loadOrders with page/status/sortOrder/q, pagination |
| **Addresses** | GET /api/addresses?sortBy=&sortOrder=; sort dropdown | ✅ `src/app/dashboard/addresses/page.tsx` – sortBy, sortOrder state; fetch with params; SortDropdown (Date added / Label) |

---

## Optional (Phases 7–9) – Not required for “complete”

| Item | Plan | In code |
|------|------|--------|
| **Store detail products** (admin/stores/[id]) | Optional: sort, search, pagination when list long | ❌ Not implemented – still single fetch `?storeId=id`, no sort/q/page (optional) |
| **User scopes stores** (admin/users/[id]/scopes) | Optional: sort/search when many stores | ❌ Not implemented (optional) |
| **Export CSV** | Optional phase | ❌ Not implemented |
| **DELETE user** (super_admin) | Optional CRUD gap | ❌ Not implemented |
| **GET single user** | Optional | ❌ Not implemented |
| **Reviews PATCH/DELETE** | Optional | ❌ Not implemented |

---

## Callers updated for new API shapes ✅

| Caller | API | Change |
|--------|-----|--------|
| admin/orders, products, users, stores, audit-logs pages | respective list APIs | Use `data.items`, `data.pagination` |
| admin/stores/[id] | GET /api/admin/products?storeId= | `p?.items ?? []` |
| admin/products/new | GET /api/admin/stores | `data?.items ?? []` |
| admin/users/[id]/scopes | GET /api/admin/stores | `storeList?.items ?? []` |
| search page | GET /api/products | Uses `data.items`, `data.pagination` |
| CategoryProducts | GET /api/products | Uses `data.items`, `data.pagination` |
| products/[id] (related) | GET /api/products | `allProductsResp?.items ?? []` |
| dashboard | GET /api/orders | `data?.items ?? []`, orderPagination |

---

## Summary

- **Phases 1–6 (core plan):** Implemented as specified: DB indexes, list APIs with Zod and `{ items, pagination }`, CRUD fix for admin order detail, UI primitives, admin/storefront/dashboard pages with URL state (admin) or local state (dashboard), filters, sort, search, and pagination where required.
- **Optional Phases 7–9:** Store detail products sort/search/pagination, user scopes stores sort/search, CSV export, DELETE/GET user, Reviews PATCH/DELETE are **not** implemented; the plan marks these as optional.

No edits were made to the plan file; this verification is against the current codebase.
