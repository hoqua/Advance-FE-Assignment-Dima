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
