import MediaReviews from "@/components/screens/media/MediaReviews";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/constants/Icons";
import { useMediaMovieDetailsQuery } from "@/features/media/mediaQueries";
import { useUserActivityQuery } from "@/features/user/userQueries";
import { getIdFromSlug } from "@/hooks/getIdFromSlug";
import { useAuth } from "@/providers/AuthProvider";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import { upperFirst } from "lodash";
import { useLocale, useTranslations } from "use-intl";
import { HeaderTitle } from "@react-navigation/elements";

const FilmReviews = () => {
	const locale = useLocale();
	const t = useTranslations();
	const { user } = useAuth();
	const { film_id } = useLocalSearchParams<{ film_id: string }>();
	const { id: movieId } = getIdFromSlug(film_id);
	const { data: movie } = useMediaMovieDetailsQuery({ id: movieId, locale: locale });

	const {
		data: activity,
		isLoading,  
	} = useUserActivityQuery({
		userId: user?.id,
		mediaId: movie?.media_id,
	});
	const loadingActivity = activity === undefined || isLoading;
	
	return (
	<>
		<Stack.Screen
		options={{
			title: movie?.title || '',
			headerTitle: (props) => <HeaderTitle {...props}>{upperFirst(t('common.messages.review', { count: 2 }))}</HeaderTitle>,
			headerRight: !loadingActivity ? () => (
				<Link href={activity?.review ? `/review/${activity?.review?.id}` : `/review/create/${movie?.media_id}`} asChild>
					<Button
					variant="ghost"
					icon={activity?.review ? Icons.Eye : Icons.Edit}
					size="icon"
					/>
				</Link>
			) : undefined,
		}}
		/>
		<MediaReviews mediaId={movie?.media_id} />
	</>
	);
};

export default FilmReviews;