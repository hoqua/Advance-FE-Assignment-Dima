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
