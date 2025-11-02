import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { queryOptions } from "@tanstack/react-query";
import { MediaMovie } from "@recomendapp/types";
import { Keys } from "../keys";

export const MediaMovieDetailsOptions = ({
	mediaId,
} : {
	mediaId?: number;
}) => {
	const supabase = useSupabaseClient();
	return queryOptions({
		queryKey: Keys.medias.details({ mediaId: mediaId!, mediaType: 'movie' }),
		queryFn: async () => {
			if (!mediaId) throw new Error('mediaId is required');
			// fake delay to simulate loading
			await new Promise((resolve) => setTimeout(resolve, 1000));
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

export const MediaGenresOptions = () => {
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