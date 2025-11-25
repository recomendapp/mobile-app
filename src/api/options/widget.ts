import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { Keys } from "../keys";

export const useWidgetMostRecommendedOptions = ({
	filters,
} : {
	filters?: {
		limit?: number,
	}
} = {}) => {
	const supabase = useSupabaseClient();
	return queryOptions({
		queryKey: Keys.widget.mostRecommended({ filters: filters }),
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
	})
};

export const useWidgetMostPopularOptions = ({
	filters,
} : {
	filters?: {
		perPage?: number,
	}
} = {}) => {
	const supabase = useSupabaseClient();
	const mergedFilters = {
		perPage: 10,
		...filters
	}
	return infiniteQueryOptions({
		queryKey: Keys.widget.mostPopular({ filters: filters }),
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
			return lastPage?.length === mergedFilters.perPage ? pages.length + 1 : undefined;
		},
	})
};