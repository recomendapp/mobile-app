import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { queryOptions } from "@tanstack/react-query";
import { mediaKeys } from "../keys/medias";
import { MediaMovie } from "@recomendapp/types";

export const mediaMovieDetailsOptions = ({
	mediaId,
} : {
	mediaId?: number;
}) => {
	const supabase = useSupabaseClient();
	return queryOptions({
		queryKey: mediaKeys.details({ mediaId: mediaId!, mediaType: 'movie' }),
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

export const mediaGenresOptions = () => {
	const supabase = useSupabaseClient();
	return queryOptions({
		queryKey: mediaKeys.genres(),
		queryFn: async () => {
			const { data, error } = await supabase
				.from('media_genre')
				.select('*');
			if (error) throw error;
			return data;
		}
	});
};