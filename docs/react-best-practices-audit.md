# React & Next.js Best Practices Audit Report

**Project:** Advance Frontend Interview Assignment
**Date:** 2026-02-24
**Framework:** Next.js 16 + React 19 + MUI 5 + Tailwind CSS 3 + React Query 3
**Files Analyzed:** ~367 source files

---

## Executive Summary

| Category | Priority | Score | Issues Found |
|----------|----------|-------|-------------|
| Eliminating Waterfalls | CRITICAL | 4/10 | No Suspense, no Promise.all, sequential awaits |
| Bundle Size Optimization | CRITICAL | 3/10 | Full lodash imports, no dynamic imports, barrel files |
| Server-Side Performance | HIGH | 5/10 | No React.cache(), no after(), missing auth on API routes |
| Client-Side Data Fetching | MEDIUM-HIGH | 7/10 | React Query well-configured, missing passive listeners |
| Re-render Optimization | MEDIUM | 4/10 | Unmemoized context values, missing deps, inline functions |
| Rendering Performance | MEDIUM | 6/10 | Good component structure, some inline style objects |
| JavaScript Performance | LOW-MEDIUM | 7/10 | Generally clean, lodash usage could be optimized |
| Advanced Patterns | LOW | 6/10 | N/A for current codebase size |

**Overall Score: 5.3/10** — Several critical and high-priority improvements available.

---

## 1. Eliminating Waterfalls (CRITICAL)

### 1.1 No Suspense Boundaries

**Status:** Not implemented
**Impact:** High — pages load as a single blocking unit instead of streaming progressively.
**Blocker:** Project uses `react-query` v3 which does not support Suspense-compatible data fetching. Standard `useQuery` returns `{ isLoading, data }` synchronously — it does not throw promises, so `<Suspense>` boundaries around these components are no-ops.

No `<Suspense>` boundaries found anywhere in the codebase. All data loading relies on React Query's `isLoading` flags with manual skeleton/loading states.

**Recommendation:** Requires upgrading to `@tanstack/react-query` v5 and switching from `useQuery` to `useSuspenseQuery`. This is a larger migration:
 <-
```tsx
// Step 1: Upgrade to @tanstack/react-query v5
// Step 2: Switch hooks to useSuspenseQuery
const { data } = useSuspenseQuery({ queryKey: ['accounts'], queryFn: fetchAccounts });

// Step 3: Then Suspense boundaries become meaningful
<Suspense fallback={<Skeleton />}>
  <AccountsTable />
</Suspense>
```

### 1.2 No Promise.all() Usage

**Status:** Not implemented
**Impact:** Medium — independent async operations run sequentially.

No `Promise.all()` found anywhere in the codebase. When multiple independent fetches are needed, they would waterfall.

**Files affected:**
- `src/app/api/FlexxNextApiService/FlexxNextApiService.ts` — sequential token fetch then API call (lines 55, 78)

### 1.3 Mixed async/await with .then()

**File:** `src/flexxApi/flexx.api.ts:3-6`
```typescript
// Current - mixed patterns
const tenant = await fetch(url).then(res => res.json());

// Recommended - consistent async/await
const response = await fetch(url);
return response.json();
```

---

## 2. Bundle Size Optimization (CRITICAL)

### 2.1 Lodash Full Imports — ~70KB Potential Savings

**Status:** Full lodash imported via named imports instead of path imports.

| File | Import | Fix |
|------|--------|-----|
| `src/utils/formatter.utils.ts:1` | `import {debounce} from 'lodash'` | Use `lodash/debounce` or `use-debounce` (already in deps) |
| `src/components/FlexxTable/hooks/useWindowResize.tsx:1` | `import {debounce} from 'lodash'` | Use `lodash/debounce` or `use-debounce` |
| `src/components/FlexxTable/FlexxTable.tsx:2` | `import {Comparator} from 'lodash'` | Use `import type {Comparator} from 'lodash'` |
| `src/components/FlexxTable/domain/FlexxTable.ts:3` | `import {Comparator} from 'lodash'` | Use `import type` |
| `src/components/FlexxTable/utils/sorter.utils.ts:2` | `import {Comparator} from 'lodash'` | Use `import type` |
| `src/components/FlexxTable/components/FlexxTableHeader.tsx:1` | `import {Comparator} from 'lodash'` | Use `import type` |

**Quick win:** The 4 `Comparator` type imports should use `import type` to prevent any runtime lodash bundling. The `use-debounce` package is already in `package.json` — use it instead of lodash's debounce.

### 2.2 No Dynamic Imports / Code Splitting

**Status:** Not implemented
**Impact:** High — all components are statically imported. No `next/dynamic` or `React.lazy()` usage found.

**Top candidates for dynamic import:**
- **Layout variants** — `src/app/(client)/(dashboard)/layout.jsx` loads both vertical and horizontal layouts; only one is ever visible
- **Drawer components** — modals/drawers are off-screen by default
- **KBar command palette** — only used when triggered
- **react-colorful** — only used in specific forms
- **react-datepicker** — only used in date filter components
- **react-dropzone** — only used in image upload

```tsx
// Before
import Customizer from '@core/components/customizer';

// After
import dynamic from 'next/dynamic';
const Customizer = dynamic(() => import('@core/components/customizer'), {
  ssr: false,
});
```

### 2.3 Barrel File Anti-Pattern

11 barrel files found. Key concern:

- `src/@core/theme/overrides/index.js` — imports and bundles 40+ MUI component override files as a monolithic unit
- `src/components/FlexxTable/hooks/index.ts` — inconsistent: some consumers use barrel, some import directly

**Recommendation:** Import directly from module files instead of barrel index files when possible.

---

## 3. Server-Side Performance (HIGH)

### 3.1 No React.cache() Usage

**Status:** Not implemented
**Impact:** Medium — no per-request deduplication for server component data fetching.

React 19 provides `React.cache()` for request-scoped memoization. Not used anywhere.

### 3.2 No after() API Usage

**Status:** Not implemented
**Impact:** Low-Medium — analytics, logging, and non-critical operations block response.

Next.js `after()` API allows deferring non-blocking work. Not used.

### 3.3 API Routes Missing Authentication Middleware

**File:** `src/app/api/pages/accounts/route.ts`

```typescript
export async function GET(req: NextRequest) {
  const queryParams = req.nextUrl.searchParams.toString();
  return flexxNextApiService().get({url: `account?${queryParams}`, req});
}
```

No explicit authentication check before processing. Token is extracted downstream in `FlexxNextApiService` but there's no middleware-level guard.

**Recommendation:** Add auth validation at the route handler level.

### 3.4 React Strict Mode Disabled

**File:** `next.config.js:11` — `reactStrictMode: false`

Disabling strict mode hides double-render issues in development. Consider re-enabling.

---

## 4. Client-Side Data Fetching (MEDIUM-HIGH)

### 4.1 React Query Configuration — Good

**File:** `src/QueryClient/queryClient.tsx`
- 3-minute `staleTime` — prevents excessive refetches
- `retry: 2` — reasonable retry strategy
- Centralized query keys via `QueryClientIds` enum
- Proper cache invalidation on logout

### 4.2 Missing Passive Event Listeners

**Files affected:**
- `src/components/FlexxTable/hooks/useWindowResize.tsx` — `window.addEventListener('resize', handler)` without `{passive: true}`
- `src/@menu/hooks/useMediaQuery.jsx` — resize listener without passive option
- `src/components/DrawerWrapper/DrawerWrapper.tsx` — resize listener without passive option

**Fix:** Add `{passive: true}` to all scroll/resize listeners:
```typescript
window.addEventListener('resize', handleResize, { passive: true });
```

### 4.3 useMediaQuery Bug — Infinite Loop Risk

**File:** `src/@menu/hooks/useMediaQuery.jsx`

The `matches` state is included in the useEffect dependency array, which can cause infinite re-renders. Should use `matchMedia.addEventListener('change', listener)` instead of window resize.

### 4.4 No localStorage Schema Versioning

**File:** `src/utils/api/apiUtils.js:56`
```javascript
window.localStorage.setItem('logout', Date.now());
```

No versioning, validation, or migration strategy for localStorage data.

---

## 5. Re-render Optimization (MEDIUM)

### 5.1 Unmemoized Context Provider Values — High Impact

Multiple context providers pass inline objects, causing all consumers to re-render on every provider render.

| File | Lines | Fix |
|------|-------|-----|
| `src/components/UserSessionProvider/UserSessionProvider.tsx` | 119-135 | Wrap value in `useMemo` |
| `src/@core/contexts/PoliciesTableContext.tsx` | 18-21 | Wrap value in `useMemo` |
| Other dashboard contexts (12+) | Various | Audit and memoize all |

**Exception:** `GlobalSearchContext.tsx` correctly uses `useMemo` — use this as the reference pattern.

### 5.2 Missing useEffect Dependencies — Stale Closures

| File | Lines | Missing Dependencies |
|------|-------|---------------------|
| `src/components/FlexxFilterChipsList/components/BaseFilters/FlexxDateFilter.tsx` | 33-49 | `onUpdateFilter`, `filter.id` |
| `src/components/FlexxFilterChipsList/components/BaseFilters/FlexxRangeFilter.tsx` | 30-43 | `onUpdateFilter`, `filter.id` |
| `src/components/FlexxTable/components/FlexxTableSearchBar.tsx` | 29-31 | `onChangeSearchTerm` |

### 5.3 Stale Closure in useMemo

**File:** `src/components/FlexxFilterChipsList/components/BaseFilters/FlexxFilterButtonContainer.tsx:33-44`

```typescript
const endIcon = useMemo(() => {
  return (
    <div onClick={() => onClickDismissFilter(filterId)}>
      <CloseIcon fontSize={'small'} />
    </div>
  );
}, []); // Missing: filterId, onClickDismissFilter
```

The empty dependency array means `filterId` and `onClickDismissFilter` will be stale.

### 5.4 Inline Functions Without useCallback

| File | Lines | Description |
|------|-------|-------------|
| `src/components/FlexxTable/components/FlexxTablePagination.tsx` | 80-85 | `ActionsComponent` inline render prop |
| `src/components/FlexxTable/components/FlexxTableHeader.tsx` | 50-54 | `createSortHandler` not wrapped in useCallback |
| `src/components/FlexxFilterChipsList/components/BaseFilters/FlexxListFilters.tsx` | 61, 68 | Inline `onClick` handlers in list items |
| `src/components/FlexxFilterChipsList/components/BaseFilters/FlexxDateFilter.tsx` | 89, 95 | Inline `onChange` handlers |

### 5.5 Inline Style Objects

**File:** `src/components/FlexxTable/FlexxTable.tsx:230-239`

Large inline `sx` prop object recreated every render. Hoist to a constant or wrap in `useMemo`.

---

## 6. Rendering Performance (MEDIUM)

### 6.1 Conditional Rendering Pattern

**File:** `src/components/FlexxTabs/index.tsx:11`
```typescript
if (tabs.length == 1 && !renderIfSingleTab) { ... }
```
Uses loose equality (`==`) — should use strict equality (`===`).

### 6.2 Both Layouts Always Loaded

**File:** `src/app/(client)/(dashboard)/layout.jsx:36-58`

Both vertical and horizontal layout components are imported and rendered, even though only one is visible at a time. Should use dynamic imports with the active layout mode.

---

## 7. JavaScript Performance (LOW-MEDIUM)

### 7.1 Duplicate Date Libraries

Both `date-fns` (3.2.0) and `dayjs` (1.11.13) are in dependencies. Consider standardizing on one to reduce bundle size.

### 7.2 `use-debounce` Package Already Available

The `use-debounce` package is already a dependency but lodash's `debounce` is used in 2 files. Consolidate to `use-debounce`.

---

## Priority Action Plan

### Immediate (High ROI, Low Effort)

1. **Fix lodash imports** — Change 4 `import {Comparator}` to `import type {Comparator}` and 2 `debounce` imports to use `use-debounce`
2. **Memoize context provider values** — Add `useMemo` to `UserSessionProvider` and all dashboard context providers
3. **Fix missing useEffect dependencies** — 3 files with stale closure bugs
4. **Fix FlexxFilterButtonContainer stale useMemo** — Add missing deps

### Short-term (High ROI, Medium Effort)

5. **Add dynamic imports** — Use `next/dynamic` for layout variants, drawers, KBar, color picker, date picker, dropzone
6. **Add passive event listeners** — 3 files need `{passive: true}`
7. **Fix useMediaQuery infinite loop** — Use `matchMedia.addEventListener('change')` instead of resize
8. **Add Suspense boundaries** — Wrap data-fetching sections for streaming

### Medium-term (Medium ROI, Higher Effort)

9. **Remove duplicate date library** — Standardize on either date-fns or dayjs
10. **Add auth middleware** — Validate tokens at API route level
11. **Implement React.cache()** — For server component request deduplication
12. **Re-enable React Strict Mode** — Catch double-render issues in development
13. **Refactor barrel files** — Especially `@core/theme/overrides/index.js`

---

## Appendix: Files Referenced

| File | Issues |
|------|--------|
| `src/app/api/FlexxNextApiService/FlexxNextApiService.ts` | Sequential awaits |
| `src/app/api/pages/accounts/route.ts` | No auth middleware |
| `src/app/(client)/(dashboard)/layout.jsx` | Both layouts always loaded |
| `src/flexxApi/flexx.api.ts` | Mixed async/await + .then() |
| `src/flexxApi/FlexxApiClientService.ts` | No Promise.all |
| `src/utils/formatter.utils.ts` | Full lodash import |
| `src/utils/api/apiUtils.js` | No localStorage schema |
| `src/components/FlexxTable/hooks/useWindowResize.tsx` | Full lodash import, no passive listener |
| `src/components/FlexxTable/FlexxTable.tsx` | Lodash type import, inline sx |
| `src/components/FlexxTable/domain/FlexxTable.ts` | Lodash type import |
| `src/components/FlexxTable/utils/sorter.utils.ts` | Lodash type import |
| `src/components/FlexxTable/components/FlexxTableHeader.tsx` | Lodash type import, missing useCallback |
| `src/components/FlexxTable/components/FlexxTablePagination.tsx` | Inline render prop |
| `src/components/FlexxTable/components/FlexxTableSearchBar.tsx` | Missing useEffect dep |
| `src/components/FlexxFilterChipsList/components/BaseFilters/FlexxDateFilter.tsx` | Missing useEffect deps |
| `src/components/FlexxFilterChipsList/components/BaseFilters/FlexxRangeFilter.tsx` | Missing useEffect deps |
| `src/components/FlexxFilterChipsList/components/BaseFilters/FlexxFilterButtonContainer.tsx` | Stale useMemo |
| `src/components/FlexxFilterChipsList/components/BaseFilters/FlexxListFilters.tsx` | Inline handlers |
| `src/components/UserSessionProvider/UserSessionProvider.tsx` | Unmemoized context value |
| `src/components/DrawerWrapper/DrawerWrapper.tsx` | No passive listener |
| `src/components/FlexxTabs/index.tsx` | Loose equality |
| `src/@core/contexts/PoliciesTableContext.tsx` | Unmemoized context value |
| `src/@core/contexts/GlobalSearchContext.tsx` | Correctly memoized (reference) |
| `src/@core/contexts/AccountsDashboardContext.tsx` | Cascading update chain |
| `src/@core/theme/overrides/index.js` | Monolithic barrel (40+ imports) |
| `src/@menu/hooks/useMediaQuery.jsx` | Infinite loop risk |
| `src/QueryClient/queryClient.tsx` | Well configured |
| `src/QueryClient/invalidators.ts` | Aggressive localStorage.clear() |
| `next.config.js` | Strict mode disabled |
