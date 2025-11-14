import ReviewForm from "@/components/screens/review/ReviewForm";
import { Icons } from "@/constants/Icons";
import { useAuth } from "@/providers/AuthProvider";
import { useUserReviewMovieQuery } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native"
import { useUserReviewMovieUpsertMutation } from "@/features/user/userMutations";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import { useToast } from "@/components/Toast";

const ReviewMovieEditScreen = () => {
	const { session }	= useAuth();
	const router = useRouter();
	const t = useTranslations();
	const toast = useToast();
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
	const { mutateAsync: updateReview} = useUserReviewMovieUpsertMutation({
		userId: session?.user.id,
		movieId: review?.activity?.movie_id,
	})
	// Handlers
	const handleSave = async (data: { title: string; body: object }) => {
		if (!review) return;
		await updateReview({
			activityId: review?.id,
			title: data.title || null,
			body: data.body,
		}, {
			onSuccess: () => {
				router.back();
			},
			onError: (error) => {
				toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
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
	if (!review) {
		return (
			<Redirect href={{ pathname: '/+not-found', params: { }}} />
		)
	}
	if (review?.activity?.user_id !== session?.user.id) {
		return (
			<Redirect href={{ pathname: '/film/[film_id]/review/[review_id]', params: { film_id: review.activity?.movie?.slug || review.activity?.movie?.id!, review_id: review.id }}} />
		)
	};
	return (
	<ReviewForm
	type='movie'
	activity={review?.activity}
	movie={review?.activity?.movie!}
	review={review}
	onSave={handleSave}
	/>
	)
};

export default ReviewMovieEditScreen;