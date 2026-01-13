import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { widgetKeys } from "./widgetKeys";
import { SupabaseClient } from "@/lib/supabase/client";

export const widgetMostRecommendedOptions = ({
	supabase,
	filters,
} : {
	supabase: SupabaseClient;
	filters?: {
		limit?: number,
	}
}) => {
	return queryOptions({
		queryKey: widgetKeys.mostRecommended({ filters: filters }),
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

export const widgetMostPopularOptions = ({
	supabase,
	filters,
} : {
	supabase: SupabaseClient;
	filters?: {
		perPage?: number,
	}
}) => {
	const mergedFilters = {
		perPage: 10,
		...filters
	}
	return infiniteQueryOptions({
		queryKey: widgetKeys.mostPopular({ filters: filters }),
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

export const widgetUsersOptions = ({
	supabase,
	filters,
} : {
	supabase: SupabaseClient;
	filters: {
		sortBy: 'created_at' | 'followers_count',
		sortOrder: 'asc' | 'desc',
	}
}) => {
	const PER_PAGE = 20;
	return infiniteQueryOptions({
		queryKey: widgetKeys.users({ filters: filters }),
		queryFn: async ({ pageParam = 1 }) => {
			const from = (pageParam - 1) * PER_PAGE;
			const to = from - 1 + PER_PAGE;
			let request = supabase
				.from('profile')
				.select('*')
				.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' })
				.range(from, to);

			const { data, error } = await request;
			if (error) throw error;
			return data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages) => {
			return lastPage?.length === PER_PAGE ? pages.length + 1 : undefined;
		},
	})
};