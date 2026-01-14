import ReviewForm from "@/components/screens/review/ReviewForm";
import { Icons } from "@/constants/Icons";
import { useAuth } from "@/providers/AuthProvider";
import tw from "@/lib/tw";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native"
import { useUserReviewTvSeriesUpsertMutation } from "@/api/users/userMutations";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import { useToast } from "@/components/Toast";
import { useCallback } from "react";
import { useUserReviewTvSeriesQuery } from "@/api/users/userQueries";

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
	const { mutateAsync: updateReview } = useUserReviewTvSeriesUpsertMutation({
		tvSeriesId: review?.activity?.tv_series_id,
	})
	// Handlers
	const handleSave = useCallback(async (data: { title: string; body: string }) => {
		await updateReview({
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
	}, [updateReview, router, toast, t]);

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
			<Redirect href={{ pathname: '/tv-series/[tv_series_id]/review/[review_id]', params: { tv_series_id: review.activity?.tv_series?.slug || review.activity?.tv_series?.id!, review_id: review.id }}} />
		)
	}
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