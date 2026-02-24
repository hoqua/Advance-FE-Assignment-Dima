import React from 'react';

import {Stack} from '@mui/material';
import AdvanceActionButtons from '@components/AdvanceActionButtons/AdvanceActionButtons';
import {ActionButtonConfig} from '@components/AdvanceActionButtons/types';
import {useCreateAccount} from '@views/accounts/hooks/useCreateAccount';
import {useMoveMoneyDrawer} from '@views/accounts/hooks/useMoveMoneyDrawer';

const AccountsCtas: React.FC = () => {
  const {openDrawer, CreateAccountDrawer} = useCreateAccount();
  const {openDrawer: openMoveMoneyDrawer, MoveMoneyDrawer} =
    useMoveMoneyDrawer();

  const actions: ActionButtonConfig[] = [
    {
      name: 'Add Account',
      variant: 'outlined',
      onClick: openDrawer,
      startIcon: 'fluent--add-circle-20-regular',
    },
    {
      name: 'Move Money',
      variant: 'outlined',
      onClick: openMoveMoneyDrawer,
      startIcon: 'fluent--arrow-swap-20-regular',
    },
  ];

  return (
    <>
      <Stack direction='row' gap={'1rem'} alignItems={'center'}>
        <AdvanceActionButtons actions={actions} />
      </Stack>
      {CreateAccountDrawer}
      {MoveMoneyDrawer}
    </>
  );
};
export default AccountsCtas;
