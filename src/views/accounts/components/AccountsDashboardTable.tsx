'use client';

import {useQueryState} from 'nuqs';
import React, {useCallback, useEffect, useRef} from 'react';

import {Account} from '@/domain/Account';
import useFetchAccounts from '@/hooks/useFetchAccounts';
import {useGlobalSearch} from '@core/hooks/useGlobalSearch';
import {FlexxTable} from '@components/FlexxTable/FlexxTable';
import AccountDrawer from '@views/accounts/components/AccountDrawer/AccountDrawer';
import useAccountsDashboardTable from '@views/accounts/hooks/useAccountsDashboardTable';

const AccountsDashboardTable: React.FC = () => {
  const {searchQuery} = useGlobalSearch();
  const {data, isLoading, isError} = useFetchAccounts({searchQuery});
  const [selectedAccountId, setSelectedAccountId] = useQueryState('account_id');

  const selectedAccount = data?.find(
    account => account.account_id === selectedAccountId,
  );

  // Keep a ref to the last selected account so the drawer content
  // stays visible during the MUI Drawer close animation.
  const lastAccountRef = useRef<Account | undefined>(undefined);
  useEffect(() => {
    if (selectedAccount) {
      lastAccountRef.current = selectedAccount;
    }
  }, [selectedAccount]);

  const drawerAccount = selectedAccount ?? lastAccountRef.current;

  const handleClose = useCallback(() => {
    setSelectedAccountId(null);
  }, [setSelectedAccountId]);

  const handleAccountClick = useCallback(
    (accountId: string) => {
      setSelectedAccountId(accountId);
    },
    [setSelectedAccountId],
  );

  const {columns, rows} = useAccountsDashboardTable(data, handleAccountClick);

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
        account={drawerAccount}
        open={!!selectedAccountId}
        onClose={handleClose}
      />
    </>
  );
};

export default AccountsDashboardTable;
