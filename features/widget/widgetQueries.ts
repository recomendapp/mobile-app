import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { widgetKeys } from "./widgetKeys";
import { useSupabaseClient } from "@/providers/SupabaseProvider";

export const useWidgetMostRecommended = ({
	filters,
} : {
	filters?: {
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
				.rpc('get_widget_most_recommended')
				.select('*');
			const mergedFilters = {
				limit: 10,
				...filters
			};
			if (mergedFilters) {
				if (mergedFilters.limit) {
					request = request.limit(mergedFilters.limit);
				}
			}
			const { data, error } = await request;
			if (error) throw error;
			return data;
		},
	});
};

export const useWidgetMostPopular = ({
	filters,
} : {
	filters?: {
		perPage?: number,
	}
} = {}) => {
	const mergedFilters = {
		perPage: 10,
		...filters
	};
	const supabase = useSupabaseClient();
	return useInfiniteQuery({
		queryKey: widgetKeys.widget({
			name: 'most-popular',
			filters,
		}),
		queryFn: async ({ pageParam = 1 }) => {
			const from = (pageParam - 1) * mergedFilters.perPage;
			const to = from - 1 + mergedFilters.perPage;
			let request = supabase
				.rpc('get_widget_most_popular')
				.select('*')
				.range(from, to);

			const { data, error } = await request;
			if (error) throw error;
			return data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages) => {
			return lastPage?.length == mergedFilters.perPage ? pages.length + 1 : undefined;
		},
	});
};