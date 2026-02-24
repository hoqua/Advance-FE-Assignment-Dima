import {useQuery} from '@tanstack/react-query';

import {Account} from '@/domain/Account';
import {QueryClientIds} from '@/QueryClient/queryClient.ids';
import flexxApiService from '@/flexxApi/flexxApiService';

interface useFetchAccountsArgs {
  searchQuery?: string;
}

const useFetchAccounts = (args?: useFetchAccountsArgs) => {
  return useQuery<Account[]>({
    queryKey: [QueryClientIds.ACCOUNTS, args?.searchQuery],
    queryFn: () =>
      flexxApiService().fetchAccounts({search_term: args?.searchQuery}),
  });
};

export default useFetchAccounts;
