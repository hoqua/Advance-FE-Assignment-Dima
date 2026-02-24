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
