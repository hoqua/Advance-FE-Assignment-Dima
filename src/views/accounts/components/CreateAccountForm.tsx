import React from 'react';
import {Controller, UseFormReturn} from 'react-hook-form';

import {LoadingButton} from '@mui/lab';
import {Stack, Typography} from '@mui/material';
import FlexxTextField from '@components/FlexxCustomTextInputs/FlexxTextField';
import {CreateAccountFormValues} from '@views/accounts/hooks/useCreateAccount';

interface CreateAccountFormProps {
  form: UseFormReturn<CreateAccountFormValues>;
  onSubmit: (data: CreateAccountFormValues) => void;
  isLoading: boolean;
}

const CreateAccountForm: React.FC<CreateAccountFormProps> = ({
  form,
  onSubmit,
  isLoading,
}) => {
  const {control, handleSubmit} = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack gap='0.5rem'>
        <Typography variant='h4' fontWeight={600}>
          Create Account
        </Typography>

        <Controller
          name='name'
          control={control}
          render={({field, fieldState}) => (
            <FlexxTextField
              {...field}
              label='Account Name'
              placeholder='Enter account name'
              required
              fullWidth
              externalError={!!fieldState.error}
              externalHelperText={fieldState.error?.message}
            />
          )}
        />

        <Controller
          name='bank_name'
          control={control}
          render={({field, fieldState}) => (
            <FlexxTextField
              {...field}
              label='Bank Name'
              placeholder='Enter bank name'
              required
              fullWidth
              externalError={!!fieldState.error}
              externalHelperText={fieldState.error?.message}
            />
          )}
        />

        <Controller
          name='routing_number'
          control={control}
          render={({field, fieldState}) => (
            <FlexxTextField
              {...field}
              label='Routing Number'
              placeholder='Enter routing number'
              required
              fullWidth
              maxLength={9}
              externalError={!!fieldState.error}
              externalHelperText={fieldState.error?.message}
            />
          )}
        />

        <Controller
          name='account_number'
          control={control}
          render={({field, fieldState}) => (
            <FlexxTextField
              {...field}
              label='Account Number'
              placeholder='Enter account number'
              required
              fullWidth
              maxLength={17}
              externalError={!!fieldState.error}
              externalHelperText={fieldState.error?.message}
            />
          )}
        />

        <LoadingButton
          type='submit'
          variant='contained'
          fullWidth
          loading={isLoading}
          sx={{mt: 1}}
        >
          Add Account
        </LoadingButton>
      </Stack>
    </form>
  );
};

export default CreateAccountForm;
