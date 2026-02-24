import {useQuery} from '@tanstack/react-query';

import {Transaction} from '@/domain/Transaction';
import {QueryClientIds} from '@/QueryClient/queryClient.ids';
import flexxApiService from '@/flexxApi/flexxApiService';

const useFetchAccountTransactions = (accountId: string | null) => {
  return useQuery<Transaction[]>({
    queryKey: [QueryClientIds.ACCOUNT_TRANSACTIONS, accountId],
    queryFn: () => flexxApiService().fetchAccountTransactions(accountId!),
    enabled: !!accountId,
  });
};

export default useFetchAccountTransactions;
