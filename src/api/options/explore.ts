import { useSupabaseClient } from '@/providers/SupabaseProvider';
import { queryOptions } from '@tanstack/react-query'
import { Keys } from '../keys';
import { useLocale } from 'use-intl';
import { ExploreTile } from '@recomendapp/types';

export const ExploreTileMetaOptions = ({
	exploreId,
} : {
	exploreId: number;
}) => {
	const supabase = useSupabaseClient();
	const locale = useLocale();
	return queryOptions({
		queryKey: Keys.explore.tileMeta({
			exploreId: exploreId,
			locale: locale,
		}),
		queryFn: async () => {
			const { data, error } = await supabase
				.from('explore')
				.select('*')
				.eq('id', exploreId)
				.single();
			if (error) throw error;
			return data;
		},
	})
};

export const ExploreTileOptions = ({
	exploreId,
} : {
	exploreId: number;
}) => {
	const supabase = useSupabaseClient();
	const locale = useLocale();
	return queryOptions({
		queryKey: Keys.explore.tile({
			exploreId: exploreId,
			locale: locale,
		}),
		queryFn: async () => {
			const params = new URLSearchParams({ exploreId: exploreId.toString(), lang: locale });
			const { data, error } = await supabase.functions.invoke(`explore/tile?${params.toString()}`, {
				method: 'GET',
			});
			if (error) throw error;
			return data as ExploreTile;
		},
		staleTime: Infinity,
		gcTime: Infinity,
		refetchOnMount: false,
		refetchOnReconnect: false,
		refetchOnWindowFocus: false,
	});
};