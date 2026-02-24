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
