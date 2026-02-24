'use client';

import React from 'react';

import {Account} from '@/domain/Account';
import AccountDrawerHeader from './AccountDrawerHeader';
import AccountTransactionsTable from './AccountTransactionsTable';
import DrawerWrapper from '@components/DrawerWrapper/DrawerWrapper';

interface AccountDrawerProps {
  account: Account | undefined;
  open: boolean;
  onClose: () => void;
  extraComponent?: React.ReactNode;
  onExtraClose?: () => void;
  onMoveMoneyClick?: () => void;
}

const AccountDrawer: React.FC<AccountDrawerProps> = ({
  account,
  open,
  onClose,
  extraComponent,
  onExtraClose,
  onMoveMoneyClick,
}) => {
  return (
    <DrawerWrapper
      open={open}
      onClose={onClose}
      drawerWidth='half'
      actions={[{onClick: onClose, icon: 'fluent--dismiss-24-regular'}]}
      extraComponent={extraComponent}
      extraComponentWidth='35vw'
      onExtraClose={onExtraClose}
    >
      {account && (
        <>
          <AccountDrawerHeader
            account={account}
            onMoveMoneyClick={onMoveMoneyClick}
          />
          <AccountTransactionsTable accountId={account.account_id} />
        </>
      )}
    </DrawerWrapper>
  );
};

export default AccountDrawer;
