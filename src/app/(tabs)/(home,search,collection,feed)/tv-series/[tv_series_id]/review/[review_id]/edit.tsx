import ReviewForm from "@/components/screens/review/ReviewForm";
import { Icons } from "@/constants/Icons";
import { useAuth } from "@/providers/AuthProvider";
import { useUserReviewTvSeriesQuery } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native"
import { useUserReviewTvSeriesUpsertMutation } from "@/features/user/userMutations";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import { useToast } from "@/components/Toast";

const ReviewTvSeriesEditScreen = () => {
	const { session }	= useAuth();
	const router = useRouter();
	const toast = useToast();
	const t = useTranslations();
	const { review_id } = useLocalSearchParams();
	// Requetes
	const {
		data: review,
		isLoading: reviewLoading,
	} = useUserReviewTvSeriesQuery({
		reviewId: Number(review_id),
	});
	const loading = reviewLoading || review === undefined;
	// Mutations
	const updateReview = useUserReviewTvSeriesUpsertMutation({
		userId: session?.user.id,
		tvSeriesId: review?.activity?.tv_series_id,
	})
	// Handlers
	const handleSave = async (data: { title: string; body: object }) => {
		if (!review) return;
		await updateReview.mutateAsync({
			activityId: review?.id,
			title: data.title || null,
			body: data.body,
		}, {
			onSuccess: () => {
				router.back();
				// router.replace(`/tv-series/${review.activity?.tv_series?.slug || review.activity?.tv_series?.id}/review/${review.id}`);
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
	if (!review) return router.replace('/+not-found');
	if (review?.activity?.user_id !== session?.user.id) return router.replace(`/review/${review?.id}`);
	return (
	<ReviewForm
	type='tv_series'
	activity={review?.activity}
	tvSeries={review?.activity?.tv_series!}
	review={review}
	onSave={handleSave}
	/>
	)
};

export default ReviewTvSeriesEditScreen;