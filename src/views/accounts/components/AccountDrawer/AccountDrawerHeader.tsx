import React from 'react';

import {Account, AccountStatus} from '@/domain/Account';
import AdvanceAccountNumberDisplay from '@components/AdvanceAccountNumberDisplay/AdvanceAccountNumberDisplay';
import AdvanceCurrencyText from '@components/AdvanceCurrencyText/AdvanceCurrencyText';
import CopyIconButton from '@components/CopyIconButton/CopyIconButton';
import FlexxIcon from '@components/FlexxIcon/FlexxIcon';
import {Button, Chip, Stack, Typography} from '@mui/material';

const statusColorMap: Record<AccountStatus, 'success' | 'error' | 'default'> = {
  [AccountStatus.OPEN]: 'success',
  [AccountStatus.CLOSED]: 'error',
  [AccountStatus.INVALID]: 'default',
};

interface AccountDrawerHeaderProps {
  account: Account;
}

const AccountDrawerHeader: React.FC<AccountDrawerHeaderProps> = ({account}) => {
  return (
    <Stack gap={2.5}>
      {/* Row 1: Name + Status + Bank */}
      <Stack gap={1}>
        <Stack direction='row' alignItems='center' gap={2.5}>
          <Typography variant='h4' fontWeight={600}>
            {account.name}
          </Typography>
          <Chip
            label={account.status}
            color={statusColorMap[account.status]}
            variant='outlined'
            size='small'
          />
        </Stack>
        <Typography variant='h6' color='text.secondary'>
          {account.bank_name}
        </Typography>
      </Stack>

      {/* Row 2: Account number + Routing number + Move Money button */}
      <Stack
        direction='row'
        alignItems='flex-start'
        justifyContent='space-between'
      >
        <Stack direction='row' gap={4}>
          <Stack gap={0.5}>
            <AdvanceAccountNumberDisplay
              accountNumber={account.account_number}
              variant='body1'
            />
            <Typography variant='caption' color='text.secondary'>
              Account Number
            </Typography>
          </Stack>
          <Stack gap={0.5}>
            <Stack direction='row' alignItems='center' gap={1.5}>
              <Typography variant='body1' color='secondary.main'>
                {account.routing_number}
              </Typography>
              <CopyIconButton
                valueToCopy={account.routing_number}
                iconHeight={20}
                iconWidth={20}
                noHoverIconButton
                size='small'
              />
            </Stack>
            <Typography variant='caption' color='text.secondary'>
              Routing Number
            </Typography>
          </Stack>
        </Stack>
        <Button
          variant='outlined'
          startIcon={<FlexxIcon icon='fluent--arrow-swap-20-regular' />}
        >
          Move Money
        </Button>
      </Stack>

      {/* Row 3: Balance */}
      <Stack>
        <AdvanceCurrencyText
          amount={account.balance}
          variant='h4'
          fontWeight={600}
        />
        <Typography variant='caption' color='text.secondary'>
          Balance
        </Typography>
      </Stack>
    </Stack>
  );
};

export default AccountDrawerHeader;
