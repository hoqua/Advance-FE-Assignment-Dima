# Transactions Dashboard Design

## Overview
Add a transactions dashboard page that displays all transactions in a searchable table, following the existing accounts page pattern.

## API
- **Endpoint**: `GET /transaction`
- **Query params**: `account_id` (optional), `search_term` (optional)
- **Response**: Array of Transaction objects

## Domain Type — `/src/domain/Transaction.ts`
```typescript
enum TransactionDirection { CREDIT = 'credit' }
enum TransactionStatus { PENDING = 'pending' }

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
```

## Files to Create/Modify

### New Files
1. `/src/domain/Transaction.ts` — Domain type + enums
2. `/src/hooks/useFetchTransactions.tsx` — React Query hook
3. `/src/views/transactions/hooks/useTransactionsDashboardTable.tsx` — Table columns & row mapping
4. `/src/views/transactions/components/TransactionsDashboardTable.tsx` — View component with search + table
5. `/src/app/(client)/(dashboard)/transactions/page.tsx` — Page component

### Modified Files
6. `/src/QueryClient/queryClient.ids.ts` — Add `TRANSACTIONS` enum value
7. `/src/flexxApi/flexxApiService.ts` — Add `fetchTransactions()` method
8. `/src/components/FlexxLayout/FlexxVerticalLayout/FlexxSideBarMenu/flexxMenuItems.ts` — Add Transactions menu item
9. `/src/components/FlexxLayout/FlexxVerticalLayout/FlexxSideBarMenu/flexx-sidebar-menu.domain.ts` — Add TRANSACTIONS to menu item IDs

## Table Columns
| Column     | Field          | Notes                          |
|-----------|----------------|--------------------------------|
| Date      | created_at     | dateFormat applied             |
| Account   | account_name   | Plain text                     |
| Merchant  | merchant       | Plain text                     |
| Amount    | amount         | currency: true                 |
| Direction | direction      | Plain text (credit/debit)      |
| Status    | status         | Plain text (pending/etc)       |

## Search
Uses `FlexxTable`'s built-in `searchBar` prop. Local state manages the search term, debounced, then passed to the API via `search_term` query param. React Query refetches on search term change.

## Menu Item
- Title: "Transactions"
- Icon: `fluent--arrow-swap-20-regular` (swap arrows: right on top, left on bottom)
- Href: `/transactions`
- Added to TopGroup in flexxMenuItems.ts

## Pattern Reference
Follows the same architecture as the Accounts page:
`Domain Type → API Service → React Query Hook → Table Hook → View Component → Page`
