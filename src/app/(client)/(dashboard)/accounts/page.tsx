'use client';

import React from 'react';
import {useQueryState} from 'nuqs';

import {Typography} from '@mui/material';
import FlexxDashboardWrapper from '@/components/FlexxDashboardWrapper';
import AccountsDashboardTable from '@views/accounts/components/AccountsDashboardTable';
import AccountsCtas from '@views/accounts/components/AccountsCtas';
import {useMoveMoneyDrawer} from '@views/accounts/hooks/useMoveMoneyDrawer';

const AccountsPage = () => {
  const [selectedAccountId] = useQueryState('account_id');
  const {openDrawer, closeDrawer, MoveMoneyPanel, MoveMoneyDrawer} =
    useMoveMoneyDrawer();

  const hasAccountDrawerOpen = !!selectedAccountId;

  return (
    <FlexxDashboardWrapper>
      <Typography variant='h4' sx={{fontWeight: 600}}>
        Accounts
      </Typography>
      <AccountsCtas onMoveMoneyClick={openDrawer} />
      <AccountsDashboardTable
        extraComponent={hasAccountDrawerOpen ? MoveMoneyPanel : undefined}
        onExtraClose={closeDrawer}
        onMoveMoneyClick={openDrawer}
      />
      {!hasAccountDrawerOpen && MoveMoneyDrawer}
    </FlexxDashboardWrapper>
  );
};

export default AccountsPage;
