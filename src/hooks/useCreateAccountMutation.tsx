import {Account} from '@/domain/Account';
import {QueryClientIds} from '@/QueryClient/queryClient.ids';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import flexxApiService, {
  CreateAccountPayload,
} from '@/flexxApi/flexxApiService';

interface UseCreateAccountMutationArgs {
  onSuccess?: (account: Account) => void;
}

const useCreateAccountMutation = (args?: UseCreateAccountMutationArgs) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAccountPayload) =>
      flexxApiService().createAccount(payload),
    onSuccess: async (newAccount: Account) => {
      queryClient.invalidateQueries({
        queryKey: [QueryClientIds.ACCOUNTS],
      });
      args?.onSuccess?.(newAccount);
    },
  });
};

export default useCreateAccountMutation;
