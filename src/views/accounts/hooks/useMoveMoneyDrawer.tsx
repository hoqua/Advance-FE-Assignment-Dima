import {z} from 'zod';
import ReactDOM from 'react-dom';
import {useForm} from 'react-hook-form';
import React, {useCallback, useMemo} from 'react';

import {useBoolean} from '@/hooks/useBoolean';
import {zodResolver} from '@hookform/resolvers/zod';
import useFetchAccounts from '@/hooks/useFetchAccounts';
import useMoveMoneyMutation from '@/hooks/useMoveMoneyMutation';
import DrawerWrapper from '@components/DrawerWrapper/DrawerWrapper';
import MoveMoneyForm from '@views/accounts/components/MoveMoneyForm';

const moveMoneySchema = z.object({
  source_account_id: z.string().min(1, 'Source account is required'),
  destination_account_id: z.string().min(1, 'Destination account is required'),
  amount: z.number().positive('Amount must be greater than 0'),
  confirmed: z.boolean().refine(val => val === true, {
    message: 'You must confirm the transfer',
  }),
});

export type MoveMoneyFormValues = z.infer<typeof moveMoneySchema>;

export const useMoveMoneyDrawer = () => {
  const {
    value: isOpen,
    onTrue: openDrawer,
    onFalse: closeDrawer,
  } = useBoolean();

  const {data: accounts = []} = useFetchAccounts();

  const form = useForm<MoveMoneyFormValues>({
    resolver: zodResolver(moveMoneySchema),
    defaultValues: {
      source_account_id: '',
      destination_account_id: '',
      amount: 0,
      confirmed: false,
    },
  });

  const {mutate, isPending} = useMoveMoneyMutation({
    onSuccess: () => {
      closeDrawer();
      form.reset();
    },
  });

  const handleSubmit = useCallback(
    (data: MoveMoneyFormValues) => {
      mutate({
        source_account_id: data.source_account_id,
        destination_account_id: data.destination_account_id,
        amount: data.amount,
        merchant: 'Move Money',
      });
    },
    [mutate],
  );

  const handleClose = useCallback(() => {
    closeDrawer();
    form.reset();
  }, [closeDrawer, form]);

  const formElement = useMemo(
    () => (
      <MoveMoneyForm
        form={form}
        onSubmit={handleSubmit}
        isLoading={isPending}
        accounts={accounts}
      />
    ),
    [form, handleSubmit, isPending, accounts],
  );

  // Panel for embedding as extraComponent inside another drawer
  const MoveMoneyPanel = isOpen ? formElement : undefined;

  // Standalone drawer for when no account drawer is open
  const MoveMoneyDrawer = useMemo(() => {
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
        {formElement}
      </DrawerWrapper>,
      document.body,
    );
  }, [isOpen, handleClose, formElement]);

  return {
    isOpen,
    openDrawer,
    closeDrawer: handleClose,
    MoveMoneyPanel,
    MoveMoneyDrawer,
  };
};
