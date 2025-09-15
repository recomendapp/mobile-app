import ReviewForm from "@/components/screens/review/ReviewForm";
import { Icons } from "@/constants/Icons";
import { useAuth } from "@/providers/AuthProvider";
import { useMediaMovieQuery } from "@/features/media/mediaQueries";
import { useUserActivityMovieQuery } from "@/features/user/userQueries";
import { getIdFromSlug } from "@/utils/getIdFromSlug";
import tw from "@/lib/tw";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native"
import { useUserReviewMovieUpsertMutation } from "@/features/user/userMutations";
import * as Burnt from "burnt";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";

const ReviewMovieCreateScreen = () => {
	const { user } = useAuth();
	const router = useRouter();
	const t = useTranslations();
	const { film_id } = useLocalSearchParams();
	const { id: filmId} = getIdFromSlug(film_id as string);
	// Requetes
	const {
		data: movie,
		isLoading: movieLoading,
	} = useMediaMovieQuery({
		movieId: filmId,
	});
	const {
		data: activity,
		isLoading: activityLoading,
	} = useUserActivityMovieQuery({
		userId: user?.id,
		movieId: movie?.id,
	});
	const loading = movieLoading || movie === undefined || activityLoading || activity === undefined;
	// Mutations
	const insertReview = useUserReviewMovieUpsertMutation({
		userId: user?.id,
		movieId: movie?.id,
	});

	// Handlers
	const handleSave = async (data: { title: string; body: object }) => {
		await insertReview.mutateAsync({
			activityId: activity?.id,
			title: data.title || null,
			body: data.body,
		}, {
			onSuccess: (review) => {
				router.replace(`/film/${movie?.slug || movie?.id}/review/${review.id}`);
			},
			onError: (error) => {
				console.error(error);
				Burnt.toast({
					title: upperFirst(t('common.messages.error')),
					preset: 'error',
					haptic: 'error',
				})
			}
		});
	};

	if (movie === null) return router.back();
	if (activity?.review) return router.replace(`/film/${movie?.slug || movie?.id}/review/${activity?.review?.id}`);
	if (loading) {
		return (
			<View style={tw`flex-1 items-center justify-center`}>
				<Icons.Loader />
			</View>
		);
	};
	return (
	<ReviewForm
	type="movie"
	activity={activity}
	movie={movie}
	onSave={handleSave}
	/>
	)
};

export default ReviewMovieCreateScreen;