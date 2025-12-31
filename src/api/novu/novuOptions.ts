import { queryOptions } from "@tanstack/react-query";
import { novuKeys } from "./novuKeys";
import { SupabaseClient } from "@/lib/supabase/client";

export const novuSubscriberHashOptions = ({
	supabase,
	subscriberId,
}: {
	supabase: SupabaseClient;
	subscriberId?: string;
}) => {
	return queryOptions({
		queryKey: novuKeys.novuSubscriberHash(subscriberId!),
		queryFn: async () => {
			if (!subscriberId) throw new Error('No subscriberId provided');
			const { data, error } = await supabase
				.functions.invoke('novu/subscriber/hash', {
					body: {
						subscriberId: subscriberId,
					}
				});
			if (error) throw error;
			return data?.hash as string;
		},
		enabled: !!subscriberId,
		staleTime: Infinity,
		gcTime: Infinity,
		retry: 3,
		retryOnMount: true,
	});
};