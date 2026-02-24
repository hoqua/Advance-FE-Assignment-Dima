# Account Drawer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** When clicking an account row in the Accounts dashboard, open a drawer showing account details header and a transactions table.

**Architecture:** Use existing `AccountsDashboardContext` (`selectedAccountId` synced to URL) to control drawer visibility. Account data is looked up from the already-fetched accounts list. Transactions are fetched via a new API route proxying `GET /account/{accountId}/transactions`.

**Tech Stack:** Next.js App Router, React 19, MUI v5, React Query v3, TypeScript

---

### Task 1: Add ACCOUNT_TRANSACTIONS query key

**Files:**
- Modify: `src/QueryClient/queryClient.ids.ts`

**Step 1: Add the new query key**

```typescript
enum QueryClientIds {
  ACCOUNTS = 'fetch_accounts',
  TRANSACTIONS = 'fetch_transactions',
  ACCOUNT_TRANSACTIONS = 'fetch_account_transactions',
}
```

**Step 2: Commit**

```bash
git add src/QueryClient/queryClient.ids.ts
git commit -m "feat: add ACCOUNT_TRANSACTIONS query key"
```

---

### Task 2: Add API route for account transactions

**Files:**
- Create: `src/app/api/pages/accounts/[accountId]/transactions/route.ts`

**Step 1: Create the API route**

Follow the exact pattern from `src/app/api/pages/transaction/route.ts`:

```typescript
import flexxNextApiService from '@/app/api/FlexxNextApiService/FlexxNextApiService';
import {NextRequest} from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  {params}: {params: Promise<{accountId: string}>},
) {
  const {accountId} = await params;
  const queryParams = req.nextUrl.searchParams.toString();
  const url = queryParams
    ? `account/${accountId}/transactions?${queryParams}`
    : `account/${accountId}/transactions`;
  return flexxNextApiService().get({url, req});
}
```

Note: Next.js 16 uses `params: Promise<{accountId: string}>` — must await it.

**Step 2: Commit**

```bash
git add src/app/api/pages/accounts/\[accountId\]/transactions/route.ts
git commit -m "feat: add API route for account transactions"
```

---

### Task 3: Add fetchAccountTransactions to API service and create React Query hook

**Files:**
- Modify: `src/flexxApi/flexxApiService.ts`
- Create: `src/hooks/useFetchAccountTransactions.tsx`

**Step 1: Add method to FlexxApiService**

In `src/flexxApi/flexxApiService.ts`, add after the `fetchTransactions` method (line 38):

```typescript
async fetchAccountTransactions(
  accountId: string,
  params?: {search_term?: string},
): Promise<Transaction[]> {
  const queryParams = this.formatQueryParams(params);
  return get<Transaction[]>({
    endpoint: `pages/accounts/${accountId}/transactions?${queryParams}`,
  });
}
```

**Step 2: Create the React Query hook**

Create `src/hooks/useFetchAccountTransactions.tsx` following the pattern from `src/hooks/useFetchTransactions.tsx`:

```typescript
import {useQuery} from '@tanstack/react-query';

import {Transaction} from '@/domain/Transaction';
import {QueryClientIds} from '@/QueryClient/queryClient.ids';
import flexxApiService from '@/flexxApi/flexxApiService';

const useFetchAccountTransactions = (accountId: string | null) => {
  return useQuery<Transaction[]>({
    queryKey: [QueryClientIds.ACCOUNT_TRANSACTIONS, accountId],
    queryFn: () => flexxApiService().fetchAccountTransactions(accountId!),
    enabled: !!accountId,
  });
};

export default useFetchAccountTransactions;
```

**Step 3: Commit**

```bash
git add src/flexxApi/flexxApiService.ts src/hooks/useFetchAccountTransactions.tsx
git commit -m "feat: add fetchAccountTransactions API method and React Query hook"
```

---

### Task 4: Create useAccountTransactionsTable hook

**Files:**
- Create: `src/views/accounts/hooks/useAccountTransactionsTable.tsx`

**Step 1: Create the hook**

Follow the pattern from `src/views/transactions/hooks/useTransactionsDashboardTable.tsx` but without the `account` column (since we're already in the context of a specific account):

```typescript
import {useMemo} from 'react';

import {Transaction} from '@/domain/Transaction';
import {
  FlexxColumn,
  FlexxTableRow,
} from '@components/FlexxTable/domain/FlexxTable';

const columns: FlexxColumn[] = [
  {field: 'date', headerName: 'Date', dateFormat: 'md'},
  {field: 'merchant', headerName: 'Merchant'},
  {field: 'amount', headerName: 'Amount', currency: true, align: 'right'},
  {field: 'direction', headerName: 'Direction'},
  {field: 'status', headerName: 'Status'},
];

const useAccountTransactionsTable = (
  transactions: Transaction[] | undefined,
) => {
  const rows: FlexxTableRow[] = useMemo(() => {
    if (!transactions) return [];

    return transactions.map(transaction => ({
      data: {
        date: transaction.created_at,
        merchant: transaction.merchant,
        amount: transaction.amount,
        direction: transaction.direction,
        status: transaction.status,
      },
    }));
  }, [transactions]);

  return {columns, rows};
};

export default useAccountTransactionsTable;
```

**Step 2: Commit**

```bash
git add src/views/accounts/hooks/useAccountTransactionsTable.tsx
git commit -m "feat: add useAccountTransactionsTable hook"
```

---

### Task 5: Create AccountDrawerHeader component

**Files:**
- Create: `src/views/accounts/components/AccountDrawer/AccountDrawerHeader.tsx`

**Step 1: Create the header component**

This renders the account details exactly matching the screenshot:
- Row 1: Account name (h4 bold) + status chip (green outlined)
- Row 2: Bank name (body2 gray)
- Row 3: Account number (masked, AdvanceAccountNumberDisplay) + Routing number + "Move Money" button (right-aligned)
- Row 4: Balance (AdvanceCurrencyText) with "Balance" label

```typescript
import React from 'react';

import {Button, Chip, Stack, Typography} from '@mui/material';
import {Account, AccountStatus} from '@/domain/Account';
import AdvanceAccountNumberDisplay from '@components/AdvanceAccountNumberDisplay/AdvanceAccountNumberDisplay';
import AdvanceCurrencyText from '@components/AdvanceCurrencyText/AdvanceCurrencyText';
import FlexxIcon from '@components/FlexxIcon/FlexxIcon';

const statusColorMap: Record<AccountStatus, 'success' | 'error' | 'default'> = {
  [AccountStatus.OPEN]: 'success',
  [AccountStatus.CLOSED]: 'error',
  [AccountStatus.INVALID]: 'default',
};

interface AccountDrawerHeaderProps {
  account: Account;
}

const AccountDrawerHeader: React.FC<AccountDrawerHeaderProps> = ({account}) => {
  return (
    <Stack gap={1}>
      {/* Row 1: Name + Status */}
      <Stack direction='row' alignItems='center' gap={1.5}>
        <Typography variant='h4' fontWeight={600}>
          {account.name}
        </Typography>
        <Chip
          label={account.status}
          color={statusColorMap[account.status]}
          variant='outlined'
          size='small'
        />
      </Stack>

      {/* Row 2: Bank name */}
      <Typography variant='body2' color='text.secondary'>
        {account.bank_name}
      </Typography>

      {/* Row 3: Account number + Routing number + Move Money button */}
      <Stack direction='row' alignItems='flex-start' justifyContent='space-between'>
        <Stack direction='row' gap={4}>
          <Stack>
            <AdvanceAccountNumberDisplay
              accountNumber={account.account_number}
              variant='body1'
            />
            <Typography variant='caption' color='text.secondary'>
              Account Number
            </Typography>
          </Stack>
          <Stack>
            <Typography variant='body1' color='secondary.main'>
              {account.routing_number}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Routing Number
            </Typography>
          </Stack>
        </Stack>
        <Button
          variant='outlined'
          startIcon={<FlexxIcon icon='fluent--arrow-swap-20-regular' />}
        >
          Move Money
        </Button>
      </Stack>

      {/* Row 4: Balance */}
      <Stack>
        <AdvanceCurrencyText amount={account.balance} variant='h4' fontWeight={600} />
        <Typography variant='caption' color='text.secondary'>
          Balance
        </Typography>
      </Stack>
    </Stack>
  );
};

export default AccountDrawerHeader;
```

**Step 2: Commit**

```bash
git add src/views/accounts/components/AccountDrawer/AccountDrawerHeader.tsx
git commit -m "feat: add AccountDrawerHeader component"
```

---

### Task 6: Create AccountTransactionsTable component

**Files:**
- Create: `src/views/accounts/components/AccountDrawer/AccountTransactionsTable.tsx`

**Step 1: Create the transactions table**

```typescript
import React from 'react';

import {Typography} from '@mui/material';
import {FlexxTable} from '@components/FlexxTable/FlexxTable';
import useFetchAccountTransactions from '@/hooks/useFetchAccountTransactions';
import useAccountTransactionsTable from '@views/accounts/hooks/useAccountTransactionsTable';

interface AccountTransactionsTableProps {
  accountId: string;
}

const AccountTransactionsTable: React.FC<AccountTransactionsTableProps> = ({
  accountId,
}) => {
  const {data, isLoading, isError} = useFetchAccountTransactions(accountId);
  const {columns, rows} = useAccountTransactionsTable(data);

  return (
    <>
      <Typography variant='h6' fontWeight={600}>
        Transactions
      </Typography>
      <FlexxTable
        columns={columns}
        rows={rows}
        isLoading={isLoading}
        isError={isError}
        emptyState='No transactions found'
      />
    </>
  );
};

export default AccountTransactionsTable;
```

**Step 2: Commit**

```bash
git add src/views/accounts/components/AccountDrawer/AccountTransactionsTable.tsx
git commit -m "feat: add AccountTransactionsTable component"
```

---

### Task 7: Create AccountDrawer component

**Files:**
- Create: `src/views/accounts/components/AccountDrawer/AccountDrawer.tsx`

**Step 1: Create the main drawer component**

Uses `DrawerWrapper` with the close action, renders header + transactions table. Looks up account data from the accounts list.

```typescript
'use client';

import React from 'react';

import DrawerWrapper from '@components/DrawerWrapper/DrawerWrapper';
import {Account} from '@/domain/Account';
import AccountDrawerHeader from './AccountDrawerHeader';
import AccountTransactionsTable from './AccountTransactionsTable';

interface AccountDrawerProps {
  account: Account | undefined;
  open: boolean;
  onClose: () => void;
}

const AccountDrawer: React.FC<AccountDrawerProps> = ({
  account,
  open,
  onClose,
}) => {
  if (!account) return null;

  return (
    <DrawerWrapper
      open={open}
      onClose={onClose}
      drawerWidth='half'
      actions={[{onClick: onClose, icon: 'fluent--dismiss-24-regular'}]}
    >
      <AccountDrawerHeader account={account} />
      <AccountTransactionsTable accountId={account.account_id} />
    </DrawerWrapper>
  );
};

export default AccountDrawer;
```

**Step 2: Commit**

```bash
git add src/views/accounts/components/AccountDrawer/AccountDrawer.tsx
git commit -m "feat: add AccountDrawer component"
```

---

### Task 8: Wire up row click and render drawer in accounts page

**Files:**
- Modify: `src/views/accounts/hooks/useAccountsDashboardTable.tsx`
- Modify: `src/views/accounts/components/AccountsDashboardTable.tsx`
- Modify: `src/app/(client)/(dashboard)/accounts/page.tsx`

**Step 1: Add onClick to table rows**

In `src/views/accounts/hooks/useAccountsDashboardTable.tsx`, the hook needs to accept an `onAccountClick` callback and add `onClick` to each row:

```typescript
import React, {useMemo} from 'react';

import {Account} from '@/domain/Account';
import {
  FlexxColumn,
  FlexxTableRow,
} from '@components/FlexxTable/domain/FlexxTable';
import AdvanceAccountNumberDisplay from '@components/AdvanceAccountNumberDisplay/AdvanceAccountNumberDisplay';

const columns: FlexxColumn[] = [
  {field: 'name', headerName: 'Name'},
  {field: 'bank', headerName: 'Bank'},
  {field: 'accountNumber', headerName: 'Account Number'},
  {field: 'status', headerName: 'Status'},
  {field: 'balance', headerName: 'Balance', currency: true, align: 'right'},
];

const useAccountsDashboardTable = (
  accounts: Account[] | undefined,
  onAccountClick?: (accountId: string) => void,
) => {
  const rows: FlexxTableRow[] = useMemo(() => {
    if (!accounts) return [];

    return accounts.map(account => ({
      data: {
        name: account.name,
        bank: account.bank_name,
        accountNumber: account.account_number ? (
          <AdvanceAccountNumberDisplay
            accountNumber={account.account_number}
            variant='body2'
          />
        ) : (
          'N/A'
        ),
        status: account.status,
        balance: account.balance,
      },
      onClick: onAccountClick
        ? () => onAccountClick(account.account_id)
        : undefined,
    }));
  }, [accounts, onAccountClick]);

  return {columns, rows};
};

export default useAccountsDashboardTable;
```

**Step 2: Update AccountsDashboardTable to pass onAccountClick and render AccountDrawer**

Replace `src/views/accounts/components/AccountsDashboardTable.tsx`:

```typescript
'use client';

import React from 'react';

import {FlexxTable} from '@components/FlexxTable/FlexxTable';
import useFetchAccounts from '@/hooks/useFetchAccounts';
import useAccountsDashboardTable from '@views/accounts/hooks/useAccountsDashboardTable';
import {useGlobalSearch} from '@core/hooks/useGlobalSearch';
import {useAccountsDashboard} from '@core/hooks/useAccountsDashboard';
import AccountDrawer from '@views/accounts/components/AccountDrawer/AccountDrawer';

const AccountsDashboardTable: React.FC = () => {
  const {searchQuery} = useGlobalSearch();
  const {data, isLoading, isError} = useFetchAccounts({searchQuery});
  const {selectedAccountId, setSelectedAccountId} = useAccountsDashboard();

  const selectedAccount = data?.find(
    account => account.account_id === selectedAccountId,
  );

  const {columns, rows} = useAccountsDashboardTable(data, setSelectedAccountId);

  return (
    <>
      <FlexxTable
        columns={columns}
        rows={rows}
        isLoading={isLoading}
        isError={isError}
        emptyState='No accounts found'
      />
      <AccountDrawer
        account={selectedAccount}
        open={!!selectedAccountId}
        onClose={() => setSelectedAccountId(null)}
      />
    </>
  );
};

export default AccountsDashboardTable;
```

The accounts page (`src/app/(client)/(dashboard)/accounts/page.tsx`) does NOT need changes — the drawer is rendered inside `AccountsDashboardTable`.

**Step 3: Verify it builds**

Run: `yarn ts`
Expected: No type errors

**Step 4: Commit**

```bash
git add src/views/accounts/hooks/useAccountsDashboardTable.tsx src/views/accounts/components/AccountsDashboardTable.tsx
git commit -m "feat: wire up account row click to open AccountDrawer"
```

---

### Task 9: Manual verification and polish

**Step 1: Run the dev server**

Run: `yarn dev`

**Step 2: Verify**

1. Navigate to http://localhost:3000/accounts
2. Click on an account row → drawer should open from the right
3. Verify header shows: account name, status badge, bank name, masked account number, routing number, balance, Move Money button
4. Verify transactions table loads with columns: Date, Merchant, Amount, Direction, Status
5. Verify date grouping works (repeated dates hidden)
6. Verify pagination works
7. Verify close button (X) closes the drawer
8. Verify URL contains `?account_id=...` when drawer is open

**Step 3: Fix any visual issues found during verification**

Compare pixel-by-pixel with the screenshot. Common things to check:
- Spacing/gaps between elements
- Font sizes and weights
- Color of status badge
- Alignment of Move Money button

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete account drawer with details and transactions table"
```
