import { useSupabaseClient } from '@/providers/SupabaseProvider';
import { queryOptions } from '@tanstack/react-query'
import { Keys } from '../keys';
import { useLocale } from 'use-intl';
import { ExploreTile } from '@recomendapp/types';

export const exploreTileOptions = ({
	exploreId,
} : {
	exploreId: number;
}) => {
	const supabase = useSupabaseClient();
	const locale = useLocale();
	return queryOptions({
		queryKey: Keys.explore.tile({
			exploreId: exploreId.toString(),
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
	});
};