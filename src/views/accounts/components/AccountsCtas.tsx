import React from 'react';

import {Stack} from '@mui/material';
import AdvanceActionButtons from '@components/AdvanceActionButtons/AdvanceActionButtons';
import {ActionButtonConfig} from '@components/AdvanceActionButtons/types';
import {useCreateAccount} from '@views/accounts/hooks/useCreateAccount';

interface AccountsCtasProps {
  onMoveMoneyClick: () => void;
}

const AccountsCtas: React.FC<AccountsCtasProps> = ({onMoveMoneyClick}) => {
  const {openDrawer, CreateAccountDrawer} = useCreateAccount();

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
      onClick: onMoveMoneyClick,
      startIcon: 'fluent--arrow-swap-20-regular',
    },
  ];

  return (
    <>
      <Stack direction='row' gap={'1rem'} alignItems={'center'}>
        <AdvanceActionButtons actions={actions} />
      </Stack>
      {CreateAccountDrawer}
    </>
  );
};
export default AccountsCtas;
