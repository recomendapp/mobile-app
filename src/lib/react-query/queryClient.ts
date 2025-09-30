import { matchQuery, MutationCache, QueryClient, QueryKey } from "@tanstack/react-query";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			staleTime: 60_000,
		}
	},
	mutationCache: new MutationCache({
		onSuccess: (_data, _variables, _context, mutation) => {
		  queryClient.invalidateQueries({
			predicate: (query) =>
			  Array.isArray(mutation.options.meta?.invalidates) &&
			  (mutation.options.meta?.invalidates as QueryKey[]).some((queryKey) =>
				matchQuery({ queryKey }, query),
			  ),
		  })
		}
	})
});

export default queryClient;