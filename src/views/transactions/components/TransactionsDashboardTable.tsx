'use client';

import React from 'react';

import {FlexxTable} from '@components/FlexxTable/FlexxTable';
import useFetchTransactions from '@/hooks/useFetchTransactions';
import useTransactionsDashboardTable from '@views/transactions/hooks/useTransactionsDashboardTable';
import {useGlobalSearch} from '@core/hooks/useGlobalSearch';

const TransactionsDashboardTable: React.FC = () => {
  const {searchQuery} = useGlobalSearch();
  const {data, isLoading, isError} = useFetchTransactions({searchQuery});
  const {columns, rows} = useTransactionsDashboardTable(data);

  return (
    <FlexxTable
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      isError={isError}
      emptyState='No transactions found'
    />
  );
};

export default TransactionsDashboardTable;
