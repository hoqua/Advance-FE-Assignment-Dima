import {useQuery} from '@tanstack/react-query';

import {Transaction} from '@/domain/Transaction';
import {QueryClientIds} from '@/QueryClient/queryClient.ids';
import flexxApiService from '@/flexxApi/flexxApiService';

interface UseFetchTransactionsArgs {
  searchQuery?: string;
}

const useFetchTransactions = (args?: UseFetchTransactionsArgs) => {
  return useQuery<Transaction[]>({
    queryKey: [QueryClientIds.TRANSACTIONS, args?.searchQuery],
    queryFn: () =>
      flexxApiService().fetchTransactions({search_term: args?.searchQuery}),
  });
};

export default useFetchTransactions;
