import MediaReviews from "@/components/screens/media/MediaReviews";
import { useMediaMovieDetailsQuery } from "@/features/media/mediaQueries";
import { getIdFromSlug } from "@/utils/getIdFromSlug";
import { Stack, useLocalSearchParams } from "expo-router";
import { upperFirst } from "lodash";
import { useLocale, useTranslations } from "use-intl";
import { HeaderTitle } from "@react-navigation/elements";
import ButtonMyReview from "@/components/buttons/ButtonMyReview";

const FilmReviews = () => {
	const locale = useLocale();
	const t = useTranslations();
	const { film_id } = useLocalSearchParams<{ film_id: string }>();
	const { id: movieId } = getIdFromSlug(film_id);
	const { data: movie } = useMediaMovieDetailsQuery({ id: movieId, locale: locale });
	return (
	<>
		<Stack.Screen
		options={{
			title: movie?.title || '',
			headerTitle: (props) => <HeaderTitle {...props}>{upperFirst(t('common.messages.review', { count: 2 }))}</HeaderTitle>,
			headerRight: movie?.media_id ? () => (
				<>
					<ButtonMyReview mediaId={movie?.media_id!} size="icon" />
				</>
			) : undefined,
		}}
		/>
		<MediaReviews mediaId={movie?.media_id} />
	</>
	);
};

export default FilmReviews;