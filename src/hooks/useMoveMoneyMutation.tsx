import {Transaction, MoveMoneyPayload} from '@/domain/Transaction';
import {QueryClientIds} from '@/QueryClient/queryClient.ids';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import flexxApiService from '@/flexxApi/flexxApiService';

interface UseMoveMoneyMutationArgs {
  onSuccess?: (transactions: Transaction[]) => void;
}

const useMoveMoneyMutation = (args?: UseMoveMoneyMutationArgs) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: MoveMoneyPayload) =>
      flexxApiService().moveMoney(payload),
    onSuccess: async (transactions: Transaction[]) => {
      queryClient.invalidateQueries({
        queryKey: [QueryClientIds.ACCOUNTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QueryClientIds.TRANSACTIONS],
      });
      queryClient.invalidateQueries({
        queryKey: [QueryClientIds.ACCOUNT_TRANSACTIONS],
      });
      args?.onSuccess?.(transactions);
    },
  });
};

export default useMoveMoneyMutation;
