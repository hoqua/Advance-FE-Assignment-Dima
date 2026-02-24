import {QueryClient, QueryCache, MutationCache} from '@tanstack/react-query';

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: error => {
      console.error(
        '[QueryClient] Query error:',
        error instanceof Error ? error.message : error,
      );
    },
  }),
  mutationCache: new MutationCache({
    onError: error => {
      console.error(
        '[QueryClient] Mutation error:',
        error instanceof Error ? error.message : error,
      );
    },
  }),
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 3,
    },
  },
});

export default queryClient;
