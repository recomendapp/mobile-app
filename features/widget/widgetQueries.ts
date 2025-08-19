import { useQuery } from "@tanstack/react-query";
import { widgetKeys } from "./widgetKeys";
import { useSupabaseClient } from "@/providers/SupabaseProvider";

export const useWidgetMostRecommended = ({
	filters,
} : {
	filters?: {
		sortBy?: 'recommendation_count',
		sortOrder?: 'asc' | 'desc',
		limit?: number,
	}
} = {}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: widgetKeys.widget({
			name: 'most-recommended',
			filters,
		}),
		queryFn: async () => {
			let request = supabase
				.from('widget_most_recommended')
				.select('*')
				.limit(10);

			const mergedFilters = {
				sortBy: 'recommendation_count',
				sortOrder: 'desc',
				limit: 10,
				...filters
			};
			if (mergedFilters) {
				if (mergedFilters.sortBy) {
					switch (mergedFilters.sortBy) {
						case 'recommendation_count':
							request = request.order('recommendation_count', { ascending: mergedFilters.sortOrder === 'asc' });
							break;
						default:
							break;
					}
				}
				if (mergedFilters.limit) {
					request = request.limit(mergedFilters.limit);
				}
			}
			const { data, error } = await request;
			if (error) throw error;
			return data;
		},
	});
}