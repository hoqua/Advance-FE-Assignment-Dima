# Account Drawer Design

## Overview

When clicking an account row in the Accounts dashboard, open a side drawer showing account details and its transactions.

## Approach

Use the existing `AccountsDashboardContext` (which tracks `selectedAccountId` and syncs to URL query params). When `selectedAccountId` is set, render an `AccountDrawer` component using the `DrawerWrapper`.

Account data is looked up from the already-fetched accounts array — no extra API call. Transactions are fetched server-side via a new API route proxying `GET /account/{accountId}/transactions`.

## Drawer Layout

```
┌───────────────────────────────────────────────────────── X ─┐
│ Main Operating Account   [open]                             │
│ Citibank                                                    │
│                                                             │
│ **3863 👁    713445068                  [ ⇄ Move Money ]    │
│ Account Number  Routing Number                              │
│                                                             │
│ $48,000.15                                                  │
│ Balance                                                     │
│                                                             │
│ Transactions                                                │
│ ┌───────┬───────────┬──────────┬───────────┬────────┐      │
│ │ Date  │ Merchant  │ Amount   │ Direction │ Status │      │
│ ├───────┼───────────┼──────────┼───────────┼────────┤      │
│ │ Jan 27│ WeWork    │ $4,647   │ debit     │approved│      │
│ │ Jan 28│ WeWork    │ $1,845   │ debit     │pending │      │
│ │ Jan 22│ Gusto     │ $1,599   │ credit    │pending │      │
│ │ Feb 14│ Internal  │ $350     │ debit     │approved│      │
│ │       │ Internal  │ $261     │ debit     │approved│      │
│ └───────┴───────────┴──────────┴───────────┴────────┘      │
│                         Rows per page: 10  ◄ 1/1 ►         │
└─────────────────────────────────────────────────────────────┘
```

## Header Details

- **Account Name** (h4/large bold) + **Status Badge** (green outlined chip) — same line
- **Bank Name** (gray body2 text) — below name
- **Account Number** (masked `**XXXX` with eye icon via `AdvanceAccountNumberDisplay`) + **Routing Number** (plain text) — side by side with labels underneath
- **"Move Money" button** (outlined, with swap icon) — right-aligned on the account/routing number row
- **Balance** (`AdvanceCurrencyText`) with "Balance" label below

## Transactions Table

- Columns: Date, Merchant, Amount (currency), Direction, Status
- Date grouping: repeated dates on consecutive rows are hidden
- Pagination: "Rows per page" dropdown + page navigation

## New Files

1. `src/app/api/pages/accounts/[accountId]/transactions/route.ts` — API route proxying to `GET /account/{accountId}/transactions`
2. `src/hooks/useFetchAccountTransactions.tsx` — React Query hook
3. `src/views/accounts/components/AccountDrawer/AccountDrawer.tsx` — main drawer component
4. `src/views/accounts/components/AccountDrawer/AccountDrawerHeader.tsx` — header section
5. `src/views/accounts/components/AccountDrawer/AccountTransactionsTable.tsx` — transactions table
6. `src/views/accounts/hooks/useAccountTransactionsTable.tsx` — maps Transaction[] to FlexxTableRow[]

## Modified Files

1. `src/views/accounts/components/AccountsDashboardTable.tsx` — add row onClick to set selectedAccountId
2. `src/views/accounts/hooks/useAccountsDashboardTable.tsx` — add onClick handler to each row
3. `src/app/(client)/(dashboard)/accounts/page.tsx` — render AccountDrawer when selectedAccountId is set
4. `src/flexxApi/flexxApiService.ts` — add `fetchAccountTransactions(accountId, params)` method
5. `src/QueryClient/invalidators.ts` — add `ACCOUNT_TRANSACTIONS` query key

## Data Flow

1. User clicks account row → `setSelectedAccountId(id)` (context + URL param)
2. `AccountDrawer` renders when `selectedAccountId` is truthy
3. Account data found from already-fetched accounts list by ID
4. `useFetchAccountTransactions(accountId)` fetches transactions
5. Close button → `setSelectedAccountId(null)` clears selection and URL param
