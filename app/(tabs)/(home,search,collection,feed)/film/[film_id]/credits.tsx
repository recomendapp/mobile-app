import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { useMediaMovieDetailsQuery } from "@/features/media/mediaQueries";
import { getIdFromSlug } from "@/utils/getIdFromSlug";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useLocale } from "use-intl";

const FilmCreditsScreen = () => {
	const { film_id } = useLocalSearchParams<{ film_id: string }>();
	const { id: movieId } = getIdFromSlug(film_id);
	const locale = useLocale();
	const router = useRouter();
	const {
		data: movie,
		isLoading,
		isRefetching,
		refetch,
	} = useMediaMovieDetailsQuery({
		id: movieId,
		locale: locale,
	});
	const loading = movie === undefined || isLoading;

	return (
	<>
		<View>
			<Text>Film Credits</Text>
		</View>
	</>
	)
};

export default FilmCreditsScreen;