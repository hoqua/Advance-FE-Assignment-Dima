# React & Next.js Best Practices — Implemented Changes

**Project:** Advance Frontend Interview Assignment
**Date:** 2026-02-24
**Reference:** [Full Audit Report](./react-best-practices-audit.md)

---

## Summary

Implemented the highest-impact, lowest-risk improvements from the audit. The remaining audit points are valid and worth pursuing but require more time and careful testing to implement properly.

---

## What Was Implemented

### 1. React Query v3 to v5 Migration

**Package:** `react-query@3.39.3` -> `@tanstack/react-query@5.90.21`

| File | Change |
|------|--------|
| `src/QueryClient/queryClient.tsx` | Import updated. `onError` callbacks moved from `defaultOptions` to `QueryCache`/`MutationCache` (v5 removed per-default `onError`). |
| `src/components/ReactQueryProvider/ReactQueryProvider.tsx` | Import path updated to `@tanstack/react-query`. |
| `src/hooks/useFetchAccounts.tsx` | Import updated. `useQuery(key, fn)` migrated to `useQuery({ queryKey, queryFn })` object API. |

### 2. Audit Item 1.1 — Suspense Boundaries (Skipped Intentionally)

After deep analysis, adding Suspense boundaries provides **no UX improvement** for this codebase:

- All pages are client components (`'use client'`). The shell renders instantly; only data is async.
- React Query already handles loading states with co-located skeleton components (`FlexxTableSkeletonBody`).
- Suspense would be a lateral move — different mechanism, same UX, added complexity.
- There's only one data source per page, so no progressive streaming benefit.

Suspense would become valuable if the architecture moved to server components with `useSuspenseQuery`, but that's a larger refactor beyond current scope.

### 3. Audit Item 1.2 — Promise.all() (False Positive)

The audit flagged `FlexxNextApiService.ts` lines 55/78 as sequential awaits that could be parallelized. On review, the token fetch (line 55) produces the `Authorization` header required by the API fetch (line 78). **These are inherently sequential** — no fix needed.

### 4. Audit Item 1.3 — Mixed async/await with .then()

**File:** `src/flexxApi/flexx.api.ts`

```typescript
// Before
const tenant = await fetch(url).then(res => res.json());

// After
const response = await fetch(url);
return response.json();
```

Consistent async/await pattern for readability and debuggability.

### 5. Audit Item 2.1 — Lodash Full Imports (~70KB Savings)

**Debounce imports** — switched from full lodash to path imports:

| File | Before | After |
|------|--------|-------|
| `src/utils/formatter.utils.ts` | `import {debounce} from 'lodash'` | `import debounce from 'lodash/debounce'` |
| `src/components/FlexxTable/hooks/useWindowResize.tsx` | `import {debounce} from 'lodash'` | `import debounce from 'lodash/debounce'` |

**Type-only imports** — 4 files changed to `import type` so the lodash runtime bundle is never included:

| File | Before | After |
|------|--------|-------|
| `src/components/FlexxTable/FlexxTable.tsx` | `import {Comparator} from 'lodash'` | `import type {Comparator} from 'lodash'` |
| `src/components/FlexxTable/domain/FlexxTable.ts` | `import {Comparator} from 'lodash'` | `import type {Comparator} from 'lodash'` |
| `src/components/FlexxTable/utils/sorter.utils.ts` | `import {Comparator} from 'lodash'` | `import type {Comparator} from 'lodash'` |
| `src/components/FlexxTable/components/FlexxTableHeader.tsx` | `import {Comparator} from 'lodash'` | `import type {Comparator} from 'lodash'` |

### 6. Audit Item 2.2 — Dynamic Imports for Layout Variants

**File:** `src/app/(client)/(dashboard)/layout.jsx`

The horizontal layout components (`HorizontalLayout`, `Header`, `HorizontalFooter`) are now lazy-loaded via `next/dynamic`. Since the app defaults to vertical layout, the horizontal layout JS is only fetched when actually needed.

```jsx
// Before — both layouts always in the bundle
import VerticalLayout from '@layouts/VerticalLayout';
import HorizontalLayout from '@layouts/HorizontalLayout';

// After — horizontal layout lazy-loaded
import VerticalLayout from '@layouts/VerticalLayout';
const HorizontalLayout = dynamic(() => import('@layouts/HorizontalLayout'));
```

---

## What Was NOT Implemented (Yet)

The remaining audit items are valid improvements but require more time to implement safely. They are documented in the [full audit report](./react-best-practices-audit.md) for future reference.

### Higher effort items worth pursuing:

| Audit Item | Why Deferred |
|------------|-------------|
| **2.2** Dynamic imports for drawers, KBar, react-colorful, react-datepicker, react-dropzone | Each needs testing to ensure SSR compatibility and loading states don't regress UX |
| **2.3** Barrel file refactoring | Touches 11 barrel files and all their consumers; high risk of breaking imports |
| **3.1** React.cache() for server-side deduplication | Requires moving data fetching to server components first |
| **3.2** Next.js after() API | Needs audit of which operations are safe to defer |
| **3.3** Auth middleware on API routes | Architectural decision on middleware vs per-route validation |
| **3.4** Re-enable React Strict Mode | May surface latent bugs that need fixing first |
| **4.2** Passive event listeners | Low risk but needs testing across 3 files |
| **4.3** useMediaQuery infinite loop fix | Requires rewriting the hook to use `matchMedia` API |
| **5.1** Memoize context provider values | 12+ context providers to audit and wrap with `useMemo` |
| **5.2** Fix missing useEffect dependencies | 3 files with stale closures; each fix needs behavioral verification |
| **5.3** Fix stale useMemo in FlexxFilterButtonContainer | Needs testing to confirm fix doesn't cause re-render cascade |
| **5.4** Wrap inline functions with useCallback | Multiple files; only worth doing where profiling shows re-render cost |
| **5.5** Hoist inline sx objects | Cosmetic performance; low priority |
| **6.1** Fix loose equality in FlexxTabs | Trivial but low impact |
| **7.1** Consolidate date libraries (date-fns vs dayjs) | Needs audit of all date usage across the codebase |
