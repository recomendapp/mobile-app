import ReviewForm from "@/components/screens/review/ReviewForm";
import { Icons } from "@/constants/Icons";
import { useAuth } from "@/providers/AuthProvider";
import { useUserReviewMovieQuery } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native"
import { useUserReviewMovieUpsertMutation } from "@/features/user/userMutations";
import * as Burnt from "burnt";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";

const ReviewMovieEditScreen = () => {
	const { session }	= useAuth();
	const router = useRouter();
	const t = useTranslations();
	const { review_id } = useLocalSearchParams();
	// Requetes
	const {
		data: review,
		isLoading: reviewLoading,
	} = useUserReviewMovieQuery({
		reviewId: Number(review_id),
	});
	const loading = reviewLoading || review === undefined;
	// Mutations
	const updateReview = useUserReviewMovieUpsertMutation({
		userId: session?.user.id,
		movieId: review?.activity?.movie_id,
	})
	// Handlers
	const handleSave = async (data: { title: string; body: object }) => {
		if (!review) return;
		await updateReview.mutateAsync({
			activityId: review?.id,
			title: data.title,
			body: data.body,
		}, {
			onSuccess: () => {
				router.replace(`/film/${review.activity?.movie?.slug || review.activity?.movie?.id}/review/${review.id}`);
			},
			onError: (error) => {
				Burnt.toast({
					title: upperFirst(t('common.messages.error')),
					message: upperFirst(t('common.messages.an_error_occurred')),
					preset: 'error',
					haptic: 'error',
				});
			}
		})
	};

	if (loading) {
		return (
			<View style={tw`flex-1 items-center justify-center`}>
				<Icons.Loader />
			</View>
		);
	};
	if (!review) return router.replace('/+not-found');
	if (review?.activity?.user_id !== session?.user.id) return router.replace(`/review/${review?.id}`);
	return (
	<ReviewForm
	type='movie'
	movie={review?.activity?.movie!}
	review={review}
	onSave={handleSave}
	/>
	)
};

export default ReviewMovieEditScreen;