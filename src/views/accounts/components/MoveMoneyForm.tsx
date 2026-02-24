import React, {useEffect, useMemo} from 'react';
import {Controller, UseFormReturn, useWatch} from 'react-hook-form';

import {LoadingButton} from '@mui/lab';
import {Checkbox, FormControlLabel, Stack, Typography} from '@mui/material';
import FlexxTextField from '@components/FlexxCustomTextInputs/FlexxTextField';
import {SelectOption} from '@components/FlexxCustomTextInputs/domain/FlexxTextFields.type';
import {Account} from '@/domain/Account';
import {MoveMoneyFormValues} from '@views/accounts/hooks/useMoveMoneyDrawer';

interface MoveMoneyFormProps {
  form: UseFormReturn<MoveMoneyFormValues>;
  onSubmit: (data: MoveMoneyFormValues) => void;
  isLoading: boolean;
  accounts: Account[];
}

const MoveMoneyForm: React.FC<MoveMoneyFormProps> = ({
  form,
  onSubmit,
  isLoading,
  accounts,
}) => {
  const {control, handleSubmit, watch, setValue, getValues} = form;
  const sourceAccountId = watch('source_account_id');
  const confirmed = useWatch({control, name: 'confirmed'});

  useEffect(() => {
    if (sourceAccountId && getValues('destination_account_id') === sourceAccountId) {
      setValue('destination_account_id', '');
    }
  }, [sourceAccountId, getValues, setValue]);

  const accountOptions: SelectOption[] = useMemo(
    () =>
      accounts.map(account => ({
        id: account.account_id,
        value: account.account_id,
        label: account.name,
      })),
    [accounts],
  );

  const destinationOptions: SelectOption[] = useMemo(
    () => accountOptions.filter(option => option.value !== sourceAccountId),
    [accountOptions, sourceAccountId],
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack gap='0.5rem'>
        <Typography variant='h4' fontWeight={600}>
          Move Money
        </Typography>

        <Controller
          name='source_account_id'
          control={control}
          render={({field, fieldState}) => (
            <FlexxTextField
              {...field}
              label='Source Account'
              placeholder='Select source account'
              required
              fullWidth
              select
              options={accountOptions}
              onOptionChange={(_event, option) => {
                field.onChange(option?.value ?? '');
              }}
              externalError={!!fieldState.error}
              externalHelperText={fieldState.error?.message}
            />
          )}
        />

        <Controller
          name='destination_account_id'
          control={control}
          render={({field, fieldState}) => (
            <FlexxTextField
              {...field}
              label='Destination Account'
              placeholder='Select destination account'
              required
              fullWidth
              select
              options={destinationOptions}
              onOptionChange={(_event, option) => {
                field.onChange(option?.value ?? '');
              }}
              externalError={!!fieldState.error}
              externalHelperText={fieldState.error?.message}
            />
          )}
        />

        <Controller
          name='amount'
          control={control}
          render={({field, fieldState}) => (
            <FlexxTextField
              {...field}
              value={field.value || ''}
              onChange={e => {
                const raw = e.target.value.replace(/,/g, '');
                const num = parseFloat(raw);
                field.onChange(isNaN(num) ? 0 : num);
              }}
              label='Amount'
              placeholder='Enter amount'
              required
              fullWidth
              currency
              externalError={!!fieldState.error}
              externalHelperText={fieldState.error?.message}
            />
          )}
        />

        <Controller
          name='confirmed'
          control={control}
          render={({field}) => (
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!field.value}
                  onChange={e => field.onChange(e.target.checked)}
                />
              }
              label='I confirm this transfer'
            />
          )}
        />

        <LoadingButton
          type='submit'
          variant='contained'
          fullWidth
          loading={isLoading}
          disabled={!confirmed}
          sx={{mt: 1}}
        >
          Move Money
        </LoadingButton>
      </Stack>
    </form>
  );
};

export default MoveMoneyForm;
