import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { widgetMostPopularOptions, widgetMostRecommendedOptions, widgetUsersOptions } from "./widgetOptions";

export const useWidgetMostRecommendedQuery = ({
	filters,
} : {
	filters?: {
		limit?: number,
	}
} = {}) => {
	const supabase = useSupabaseClient();
	return useQuery(widgetMostRecommendedOptions({
		supabase,
		filters,
	}))
};

export const useWidgetMostPopularQuery = ({
	filters,
} : {
	filters?: {
		perPage?: number,
	}
} = {}) => {
	const supabase = useSupabaseClient();
	return useInfiniteQuery(widgetMostPopularOptions({
		supabase,
		filters,
	}));
};

export const useWidgetUsersQuery = ({
	filters,
} : {
	filters: {
		sortBy: 'created_at' | 'followers_count',
		sortOrder: 'asc' | 'desc',
	}
}) => {
	const supabase = useSupabaseClient();
	return useInfiniteQuery(widgetUsersOptions({
		supabase,
		filters,
	}));
};