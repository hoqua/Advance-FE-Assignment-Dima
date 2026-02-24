# Transactions Dashboard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a transactions dashboard page with a searchable table showing date, account, merchant, amount, direction, and status columns.

**Architecture:** Follows the existing accounts page pattern — domain type, API service method, React Query hook, table hook, view component, page. Search uses FlexxTable's built-in searchBar prop with server-side filtering via the `search_term` API parameter.

**Tech Stack:** Next.js 16, React 19, TypeScript, TanStack React Query, MUI, FlexxTable

---

### Task 1: Domain Type

**Files:**
- Create: `src/domain/Transaction.ts`

**Step 1: Create the Transaction domain type**

```typescript
enum TransactionDirection {
  CREDIT = 'credit',
}

enum TransactionStatus {
  PENDING = 'pending',
}

interface Transaction {
  transaction_id: string;
  merchant: string;
  amount: number;
  direction: TransactionDirection | string;
  created_at: string;
  account_id: string;
  status: TransactionStatus | string;
  extra_data: Record<string, unknown>;
  user_created: boolean;
  account_name: string;
}

export {TransactionDirection, TransactionStatus};
export type {Transaction};
```

**Step 2: Commit**

```bash
git add src/domain/Transaction.ts
git commit -m "feat(transactions): add Transaction domain type"
```

---

### Task 2: API Layer — Query ID + Service Method

**Files:**
- Modify: `src/QueryClient/queryClient.ids.ts`
- Modify: `src/flexxApi/flexxApiService.ts`

**Step 1: Add TRANSACTIONS to QueryClientIds**

In `src/QueryClient/queryClient.ids.ts`, add `TRANSACTIONS = 'fetch_transactions'` to the enum:

```typescript
enum QueryClientIds {
  ACCOUNTS = 'fetch_accounts',
  TRANSACTIONS = 'fetch_transactions',
}

export {QueryClientIds};
```

**Step 2: Add fetchTransactions to FlexxApiService**

In `src/flexxApi/flexxApiService.ts`, add the import and method:

Add import at top:
```typescript
import {Transaction} from '@/domain/Transaction';
```

Add method to the class (after `fetchAccounts`):
```typescript
async fetchTransactions(params?: {
  account_id?: string;
  search_term?: string;
}): Promise<Transaction[]> {
  const queryParams = this.formatQueryParams(params);
  return get<Transaction[]>({endpoint: `transaction?${queryParams}`});
}
```

**Step 3: Commit**

```bash
git add src/QueryClient/queryClient.ids.ts src/flexxApi/flexxApiService.ts
git commit -m "feat(transactions): add query ID and API service method"
```

---

### Task 3: React Query Hook

**Files:**
- Create: `src/hooks/useFetchTransactions.tsx`

**Step 1: Create the hook**

```typescript
import {useQuery} from '@tanstack/react-query';

import {Transaction} from '@/domain/Transaction';
import {QueryClientIds} from '@/QueryClient/queryClient.ids';
import flexxApiService from '@/flexxApi/flexxApiService';

interface UseFetchTransactionsArgs {
  searchQuery?: string;
}

const useFetchTransactions = (args?: UseFetchTransactionsArgs) => {
  return useQuery<Transaction[]>({
    queryKey: [QueryClientIds.TRANSACTIONS, args?.searchQuery],
    queryFn: () =>
      flexxApiService().fetchTransactions({search_term: args?.searchQuery}),
  });
};

export default useFetchTransactions;
```

> **Note:** Unlike the accounts hook, we include `args?.searchQuery` in the `queryKey` so React Query refetches when the search term changes.

**Step 2: Commit**

```bash
git add src/hooks/useFetchTransactions.tsx
git commit -m "feat(transactions): add useFetchTransactions React Query hook"
```

---

### Task 4: Table Hook — Columns and Row Mapping

**Files:**
- Create: `src/views/transactions/hooks/useTransactionsDashboardTable.tsx`

**Step 1: Create the table hook**

```typescript
import {useMemo} from 'react';

import {Transaction} from '@/domain/Transaction';
import {
  FlexxColumn,
  FlexxTableRow,
} from '@components/FlexxTable/domain/FlexxTable';

const columns: FlexxColumn[] = [
  {field: 'date', headerName: 'Date', dateFormat: 'md'},
  {field: 'account', headerName: 'Account'},
  {field: 'merchant', headerName: 'Merchant'},
  {field: 'amount', headerName: 'Amount', currency: true, align: 'right'},
  {field: 'direction', headerName: 'Direction'},
  {field: 'status', headerName: 'Status'},
];

const useTransactionsDashboardTable = (
  transactions: Transaction[] | undefined,
) => {
  const rows: FlexxTableRow[] = useMemo(() => {
    if (!transactions) return [];

    return transactions.map(transaction => ({
      data: {
        date: transaction.created_at,
        account: transaction.account_name || 'N/A',
        merchant: transaction.merchant,
        amount: transaction.amount,
        direction: transaction.direction,
        status: transaction.status,
      },
    }));
  }, [transactions]);

  return {columns, rows};
};

export default useTransactionsDashboardTable;
```

**Step 2: Commit**

```bash
git add src/views/transactions/hooks/useTransactionsDashboardTable.tsx
git commit -m "feat(transactions): add table columns and row mapping hook"
```

---

### Task 5: View Component — Table with Search

**Files:**
- Create: `src/views/transactions/components/TransactionsDashboardTable.tsx`

**Step 1: Create the view component**

```typescript
'use client';

import React, {useState} from 'react';

import {FlexxTable} from '@components/FlexxTable/FlexxTable';
import useFetchTransactions from '@/hooks/useFetchTransactions';
import useTransactionsDashboardTable from '@views/transactions/hooks/useTransactionsDashboardTable';

const TransactionsDashboardTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const {data, isLoading, isError} = useFetchTransactions({
    searchQuery: searchTerm,
  });
  const {columns, rows} = useTransactionsDashboardTable(data);

  return (
    <FlexxTable
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      isError={isError}
      emptyState='No transactions found'
      searchBar={{
        searchTerm,
        onChangeSearchTerm: setSearchTerm,
        placeHolder: 'Search transactions',
      }}
    />
  );
};

export default TransactionsDashboardTable;
```

> **Note:** This uses local `searchTerm` state + FlexxTable's built-in `searchBar` prop instead of `useGlobalSearch`, so the search is scoped to this table and debounced by FlexxTableSearchBar internally.

**Step 2: Commit**

```bash
git add src/views/transactions/components/TransactionsDashboardTable.tsx
git commit -m "feat(transactions): add dashboard table view with search"
```

---

### Task 6: Page + Navigation Menu Item

**Files:**
- Create: `src/app/(client)/(dashboard)/transactions/page.tsx`
- Modify: `src/components/FlexxLayout/FlexxVerticalLayout/FlexxSideBarMenu/flexx-sidebar-menu.domain.ts`
- Modify: `src/components/FlexxLayout/FlexxVerticalLayout/FlexxSideBarMenu/flexxMenuItems.ts`

**Step 1: Create the page**

```typescript
'use client';

import React from 'react';

import {Typography} from '@mui/material';
import FlexxDashboardWrapper from '@/components/FlexxDashboardWrapper';
import TransactionsDashboardTable from '@views/transactions/components/TransactionsDashboardTable';

const TransactionsPage = () => {
  return (
    <FlexxDashboardWrapper>
      <Typography variant='h4' sx={{fontWeight: 600}}>
        Transactions
      </Typography>
      <TransactionsDashboardTable />
    </FlexxDashboardWrapper>
  );
};

export default TransactionsPage;
```

**Step 2: Add TRANSACTIONS to menu item IDs**

In `src/components/FlexxLayout/FlexxVerticalLayout/FlexxSideBarMenu/flexx-sidebar-menu.domain.ts`, add to the enum:

```typescript
enum FLEXX_MENU_ITEM_IDS {
  HOME = 'home',
  ACCOUNTS = 'accounts',
  TRANSACTIONS = 'transactions',
}
```

**Step 3: Add Transactions menu item**

In `src/components/FlexxLayout/FlexxVerticalLayout/FlexxSideBarMenu/flexxMenuItems.ts`, add the menu item and include it in TopGroup:

```typescript
const TransactionsMenuItem: FlexxMenuItem = {
  id: FLEXX_MENU_ITEM_IDS.TRANSACTIONS,
  icon: 'fluent--arrow-swap-20-regular',
  title: 'Transactions',
  href: '/transactions',
};

const TopGroup: FlexxMenuItemsGroup = {
  id: 'top-group',
  items: [HomeMenuItem, AccountsMenuItem, TransactionsMenuItem],
};
```

**Step 4: Verify the app builds**

Run: `yarn build`
Expected: Build succeeds with no errors.

**Step 5: Commit**

```bash
git add src/app/\(client\)/\(dashboard\)/transactions/page.tsx \
  src/components/FlexxLayout/FlexxVerticalLayout/FlexxSideBarMenu/flexx-sidebar-menu.domain.ts \
  src/components/FlexxLayout/FlexxVerticalLayout/FlexxSideBarMenu/flexxMenuItems.ts
git commit -m "feat(transactions): add page and navigation menu item"
```

---

### Task 7: Manual Smoke Test

**Step 1: Start dev server**

Run: `yarn dev`

**Step 2: Verify**

- [ ] Transactions menu item appears in sidebar with swap arrow icon
- [ ] Clicking it navigates to `/transactions`
- [ ] Page shows "Transactions" heading
- [ ] Table renders with columns: Date, Account, Merchant, Amount, Direction, Status
- [ ] Search bar appears above the table
- [ ] Typing in search filters results (calls API with `search_term`)
- [ ] Loading state shows skeleton rows
- [ ] Empty state shows "No transactions found"
