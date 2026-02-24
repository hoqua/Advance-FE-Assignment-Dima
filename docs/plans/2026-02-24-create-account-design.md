# Create Account Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a "Create Account" form in a drawer that creates an account via API and opens its detail drawer on success.

**Architecture:** Reuse the existing `DrawerWrapper` + `useCreateAccount` hook scaffolding. Add `react-hook-form` + `zod` form inside `CreateAccountForm`. Mutation via `useMutation` with query invalidation. Post-create redirect via `nuqs` URL state.

**Tech Stack:** React 19, Next.js 16, MUI v5, react-hook-form, zod, @tanstack/react-query v5, nuqs

---

### Task 1: Install zod

**Files:**
- Modify: `package.json`

**Step 1: Install zod**

Run: `yarn add zod`

**Step 2: Commit**

```bash
git add package.json yarn.lock
git commit -m "chore: add zod dependency"
```

---

### Task 2: Add Next.js API proxy route for POST /account

The client API calls go through Next.js API routes that proxy to the backend. Currently only GET exists for accounts.

**Files:**
- Modify: `src/app/api/pages/accounts/route.ts`

**Step 1: Add POST handler to the existing route file**

Add to `src/app/api/pages/accounts/route.ts`:

```typescript
import flexxNextApiService from '@/app/api/FlexxNextApiService/FlexxNextApiService';
import {NextRequest} from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const queryParams = req.nextUrl.searchParams.toString();
  return flexxNextApiService().get({url: `account?${queryParams}`, req});
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  return flexxNextApiService().post({url: 'account', req, body});
}
```

**Step 2: Commit**

```bash
git add src/app/api/pages/accounts/route.ts
git commit -m "feat: add POST proxy route for account creation"
```

---

### Task 3: Add createAccount to API service

**Files:**
- Modify: `src/flexxApi/flexxApiService.ts`
- Reference: `src/domain/Account.ts` for the `Account` type

**Step 1: Add CreateAccountPayload type and createAccount method**

Add to `src/flexxApi/flexxApiService.ts`:

```typescript
// Add this interface above the class
interface CreateAccountPayload {
  name: string;
  routing_number: string;
  account_number: string;
  bank_name: string;
  bank_icon: string;
  status: string;
  balance: number;
}

// Add this method inside FlexxApiService class
async createAccount(payload: CreateAccountPayload): Promise<Account> {
  return post<Account>({endpoint: 'pages/accounts', body: payload});
}
```

Export the type: `export type {CreateAccountPayload};`

**Step 2: Commit**

```bash
git add src/flexxApi/flexxApiService.ts
git commit -m "feat: add createAccount API method"
```

---

### Task 4: Create useCreateAccountMutation hook

**Files:**
- Create: `src/hooks/useCreateAccountMutation.tsx`
- Reference: `src/hooks/useFetchAccounts.tsx` for pattern
- Reference: `src/QueryClient/queryClient.tsx` for queryClient import
- Reference: `src/QueryClient/queryClient.ids.ts` for QueryClientIds

**Step 1: Create the mutation hook**

Create `src/hooks/useCreateAccountMutation.tsx`:

```typescript
import {useMutation, useQueryClient} from '@tanstack/react-query';

import {Account} from '@/domain/Account';
import {QueryClientIds} from '@/QueryClient/queryClient.ids';
import flexxApiService, {CreateAccountPayload} from '@/flexxApi/flexxApiService';

interface UseCreateAccountMutationArgs {
  onSuccess?: (account: Account) => void;
}

const useCreateAccountMutation = (args?: UseCreateAccountMutationArgs) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAccountPayload) =>
      flexxApiService().createAccount(payload),
    onSuccess: (newAccount: Account) => {
      queryClient.invalidateQueries({queryKey: [QueryClientIds.ACCOUNTS]});
      args?.onSuccess?.(newAccount);
    },
  });
};

export default useCreateAccountMutation;
```

**Step 2: Commit**

```bash
git add src/hooks/useCreateAccountMutation.tsx
git commit -m "feat: add useCreateAccountMutation hook"
```

---

### Task 5: Implement CreateAccountForm

**Files:**
- Modify: `src/views/accounts/components/CreateAccountForm.tsx`
- Reference: `src/components/FlexxCustomTextInputs/FlexxTextField.tsx` for input props
- Reference: `src/components/FlexxCustomTextInputs/domain/FlexxTextFields.type.ts` for types

**Step 1: Implement the full form**

Replace `src/views/accounts/components/CreateAccountForm.tsx` with:

```typescript
import React from 'react';
import {Controller, UseFormReturn} from 'react-hook-form';
import {Stack, Typography} from '@mui/material';
import {LoadingButton} from '@mui/lab';

import FlexxTextField from '@components/FlexxCustomTextInputs/FlexxTextField';

interface CreateAccountFormValues {
  name: string;
  bank_name: string;
  routing_number: string;
  account_number: string;
}

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
      <Stack gap='0.5rem' padding='1rem'>
        <Typography variant='h4'>Create Account</Typography>

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
              routingNumber
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
export type {CreateAccountFormValues};
```

**Step 2: Commit**

```bash
git add src/views/accounts/components/CreateAccountForm.tsx
git commit -m "feat: implement CreateAccountForm with react-hook-form"
```

---

### Task 6: Wire up useCreateAccount hook with form, mutation, and post-create redirect

**Files:**
- Modify: `src/views/accounts/hooks/useCreateAccount.tsx`
- Reference: `src/hooks/useCreateAccountMutation.tsx`
- Reference: `src/views/accounts/components/CreateAccountForm.tsx`

**Step 1: Rewrite useCreateAccount hook**

Replace `src/views/accounts/hooks/useCreateAccount.tsx` with:

```typescript
import ReactDOM from 'react-dom';
import React, {useCallback, useMemo} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {useQueryState} from 'nuqs';

import {useBoolean} from '@/hooks/useBoolean';
import DrawerWrapper from '@components/DrawerWrapper/DrawerWrapper';
import CreateAccountForm, {
  CreateAccountFormValues,
} from '@views/accounts/components/CreateAccountForm';
import useCreateAccountMutation from '@/hooks/useCreateAccountMutation';

const createAccountSchema = z.object({
  name: z.string().min(1, 'Account name is required'),
  bank_name: z.string().min(1, 'Bank name is required'),
  routing_number: z.string().min(1, 'Routing number is required'),
  account_number: z.string().min(1, 'Account number is required'),
});

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
        status: 'open',
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
        removePaddingBottom
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
```

**Step 2: Commit**

```bash
git add src/views/accounts/hooks/useCreateAccount.tsx
git commit -m "feat: wire up create account form with mutation and post-create redirect"
```

---

### Task 7: Handle BE 422 validation errors

**Files:**
- Modify: `src/views/accounts/hooks/useCreateAccount.tsx`

**Step 1: Add error handling to the mutation**

Update the `useCreateAccountMutation` call in `useCreateAccount.tsx` to handle 422 errors. The BE returns:

```json
{"detail": [{"loc": ["string", 0], "msg": "string", "type": "string"}]}
```

However, since the `FlexxApiClientService` throws an `Error` on non-OK responses and shows a toast, the 422 errors are already handled by the API layer (toast notification). The form stays populated so the user can fix and retry.

If finer-grained field-level error mapping is needed, we'd need to modify the API client to pass through 422 responses. For now, the toast error from `FlexxApiClientService` line 114-118 handles this — it shows "There was an error processing your request."

**No code changes needed for this task** — the existing API error handling covers it.

**Step 2: Verify the error flow manually**

- Submit the form with invalid data
- Confirm the toast shows the error message
- Confirm the form stays open with data preserved

---

### Task 8: Manual verification

**Step 1: Start the dev server**

Run: `yarn dev`

**Step 2: Verify the full flow**

1. Go to `/accounts`
2. Click "Add Account" button
3. Verify the drawer opens with "Create Account" form
4. Verify form fields: Account Name, Bank Name, Routing Number, Account Number
5. Submit empty form — verify zod validation errors appear
6. Fill all fields and submit
7. Verify: drawer closes, accounts list refreshes, account detail drawer opens to the new account
8. Verify: submitting while loading shows loading state on button

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete create account feature"
```
