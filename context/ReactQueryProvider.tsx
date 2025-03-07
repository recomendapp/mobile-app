import { getType } from "@/lib/react-query/getType";
import { useReactQueryDevTools } from "@dev-plugins/react-query";
import { QueryNormalizerProvider } from "@normy/react-query";
import { matchQuery, MutationCache, QueryClient, QueryClientProvider, QueryKey } from "@tanstack/react-query";

type ReactQueryProviderProps = {
	children: React.ReactNode;
};

const ReactQueryProvider = ({ children } : ReactQueryProviderProps) => {
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
	useReactQueryDevTools(queryClient);

	return (
		<QueryNormalizerProvider
		queryClient={queryClient}
		normalizerConfig={{
			getNormalizationObjectKey: obj => {
			if (obj.id && getType(obj)) {
				return `${getType(obj)}:${obj.id}`
			} else if (obj.id) {
				return `${obj.id}`
			}
			},
			// devLogging: true,
		}}
		>
			<QueryClientProvider client={queryClient}>
				{children}
			</QueryClientProvider>
		</QueryNormalizerProvider>
	)
};

export { ReactQueryProvider };