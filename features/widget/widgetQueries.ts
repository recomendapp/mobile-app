import { useQuery } from "@tanstack/react-query";
import { widgetKeys } from "./widgetKeys";
import { useSupabaseClient } from "@/context/SupabaseProvider";

export const useWidgetMostRecommended = ({
	filters,
} : {
	filters?: {
		order?: 'recommendation_count-desc' | 'recommendation_count-asc',
		limit?: number,
	}
} = {}) => {
	const mergedFilters = {
		order: 'created_at-asc',
		limit: 10,
		...filters
	} as typeof filters;
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: widgetKeys.widget({
			name: 'most-recommended',
			filters,
		}),
		queryFn: async () => {
			let request = supabase
				.from('widget_most_recommended')
				.select(`
					*,
					media(*)
				`)
				.limit(10);
			
			if (mergedFilters) {
				if (mergedFilters.order) {
					switch (mergedFilters.order) {
						case 'recommendation_count-desc':
							request = request.order('recommendation_count', { ascending: false });
							break;
						case 'recommendation_count-asc':
							request = request.order('recommendation_count', { ascending: true });
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