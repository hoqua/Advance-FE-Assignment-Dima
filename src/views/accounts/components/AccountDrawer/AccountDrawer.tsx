'use client';

import React from 'react';

import {Account} from '@/domain/Account';
import DrawerWrapper from '@components/DrawerWrapper/DrawerWrapper';

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
  return (
    <DrawerWrapper
      open={open}
      onClose={onClose}
      drawerWidth='half'
      actions={[{onClick: onClose, icon: 'fluent--dismiss-24-regular'}]}
    >
      {account && (
        <>
          <AccountDrawerHeader account={account} />
          <AccountTransactionsTable accountId={account.account_id} />
        </>
      )}
    </DrawerWrapper>
  );
};

export default AccountDrawer;
