import {z} from 'zod';
import ReactDOM from 'react-dom';
import {useQueryState} from 'nuqs';
import {useForm} from 'react-hook-form';
import React, {useCallback, useMemo} from 'react';

import {useBoolean} from '@/hooks/useBoolean';
import {AccountStatus} from '@/domain/Account';
import {zodResolver} from '@hookform/resolvers/zod';
import DrawerWrapper from '@components/DrawerWrapper/DrawerWrapper';
import useCreateAccountMutation from '@/hooks/useCreateAccountMutation';
import CreateAccountForm from '@views/accounts/components/CreateAccountForm';

const createAccountSchema = z.object({
  name: z.string().min(1, 'Account name is required'),
  bank_name: z.string().min(1, 'Bank name is required'),
  routing_number: z
    .string()
    .min(1, 'Routing number is required')
    .max(9, 'Routing number must be at most 9 characters'),
  account_number: z
    .string()
    .min(1, 'Account number is required')
    .max(17, 'Account number must be at most 17 characters'),
});

export type CreateAccountFormValues = z.infer<typeof createAccountSchema>;

export const useCreateAccount = () => {
  const {
    value: isOpen,
    onTrue: openDrawer,
    onFalse: closeDrawer,
  } = useBoolean();

  const [, setSelectedAccountId] = useQueryState('account_id');

  const form = useForm<CreateAccountFormValues>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      name: '',
      bank_name: '',
      routing_number: '',
      account_number: '',
    },
  });

  const {mutate, isPending} = useCreateAccountMutation({
    onSuccess: newAccount => {
      closeDrawer();
      form.reset();
      setSelectedAccountId(newAccount.account_id);
    },
  });

  const handleSubmit = useCallback(
    (data: CreateAccountFormValues) => {
      mutate({
        ...data,
        bank_icon: '',
        status: AccountStatus.OPEN,
        balance: 0,
      });
    },
    [mutate],
  );

  const handleClose = useCallback(() => {
    closeDrawer();
    form.reset();
  }, [closeDrawer, form]);

  const CreateAccountDrawer = useMemo(() => {
    if (typeof window === 'undefined') return null;

    return ReactDOM.createPortal(
      <DrawerWrapper
        open={isOpen}
        onClose={handleClose}
        actions={[
          {
            icon: 'fluent--dismiss-24-regular',
            onClick: handleClose,
          },
        ]}
        drawerWidth='md'
      >
        <CreateAccountForm
          form={form}
          onSubmit={handleSubmit}
          isLoading={isPending}
        />
      </DrawerWrapper>,
      document.body,
    );
  }, [isOpen, handleClose, form, handleSubmit, isPending]);

  return {
    isOpen,
    openDrawer,
    closeDrawer,
    CreateAccountDrawer,
  };
};
