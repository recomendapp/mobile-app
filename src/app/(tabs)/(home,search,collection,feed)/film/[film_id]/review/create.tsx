import ReviewForm from "@/components/screens/review/ReviewForm";
import { Icons } from "@/constants/Icons";
import { useAuth } from "@/providers/AuthProvider";
import { getIdFromSlug } from "@/utils/getIdFromSlug";
import tw from "@/lib/tw";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native"
import { useUserReviewMovieUpsertMutation } from "@/api/users/userMutations";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import { useToast } from "@/components/Toast";
import { useCallback } from "react";
import { useMediaMovieDetailsQuery } from "@/api/medias/mediaQueries";
import { useUserActivityMovieQuery } from "@/api/users/userQueries";

const ReviewMovieCreateScreen = () => {
	const { user } = useAuth();
	const router = useRouter();
	const t = useTranslations();
	const toast = useToast();
	const { film_id } = useLocalSearchParams();
	const { id: filmId} = getIdFromSlug(film_id as string);
	// Requetes
	const {
		data: movie,
		isLoading: movieLoading,
	} = useMediaMovieDetailsQuery({
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
	const { mutateAsync: insertReview } = useUserReviewMovieUpsertMutation({
		movieId: movie?.id,
	});

	// Handlers
	const handleSave = useCallback(async (data: { title: string; body: string }) => {
		await insertReview({
			title: data.title || null,
			body: data.body,
		}, {
			onSuccess: (review) => {
				router.replace(`/film/${movie?.slug || movie?.id}/review/${review.id}`);
			},
			onError: (error) => {
				toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
			}
		});
	}, [insertReview, router, movie?.slug, movie?.id, toast, t]);

	if (movie === null) {
		return (
			<Redirect href={'..'} />
		)
	}
	if (activity?.review) {
		return (
			<Redirect href={{ pathname: '/film/[film_id]/review/[review_id]', params: { film_id: movie?.slug || movie?.id!, review_id: activity?.review?.id }}} />
		)
	}
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