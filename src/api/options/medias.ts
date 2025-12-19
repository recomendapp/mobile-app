import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { queryOptions } from "@tanstack/react-query";
import { MediaMovie } from "@recomendapp/types";
import { Keys } from "../keys";

export const useMediaMovieDetailsOptions = ({
	mediaId,
} : {
	mediaId?: number;
}) => {
	const supabase = useSupabaseClient();
	return queryOptions({
		queryKey: Keys.medias.details({ mediaId: mediaId!, mediaType: 'movie' }),
		queryFn: async () => {
			if (!mediaId) throw new Error('mediaId is required');
			const { data, error } = await supabase
				.from('media_movie')
				.select('*')
				.eq('id', mediaId)
				.single()
				.overrideTypes<MediaMovie>();
			if (error) throw error;
			return data;
		},
		enabled: !!mediaId,
	});
};

export const useMediaGenresOptions = () => {
	const supabase = useSupabaseClient();
	return queryOptions({
		queryKey: Keys.medias.genres(),
		queryFn: async () => {
			const { data, error } = await supabase
				.from('media_genre')
				.select('*');
			if (error) throw error;
			return data;
		}
	});
};