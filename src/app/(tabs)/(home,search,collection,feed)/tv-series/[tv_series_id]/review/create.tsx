import ReviewForm from "@/components/screens/review/ReviewForm";
import { Icons } from "@/constants/Icons";
import { useAuth } from "@/providers/AuthProvider";
import { getIdFromSlug } from "@/utils/getIdFromSlug";
import tw from "@/lib/tw";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native"
import { useUserReviewTvSeriesUpsertMutation } from "@/api/users/userMutations";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import { useToast } from "@/components/Toast";
import { useCallback } from "react";
import { useMediaTvSeriesDetailsQuery } from "@/api/medias/mediaQueries";
import { useUserActivityTvSeriesQuery } from "@/api/users/userQueries";

const ReviewTvSeriesCreateScreen = () => {
	const { user } = useAuth();
	const router = useRouter();
	const toast = useToast();
	const t = useTranslations();
	const { tv_series_id } = useLocalSearchParams();
	const { id: tvSeriesId } = getIdFromSlug(tv_series_id as string);
	// Requetes
	const {
		data: tvSeries,
		isLoading: tvSeriesLoading,
	} = useMediaTvSeriesDetailsQuery({
		tvSeriesId: tvSeriesId
	});

	const {
		data: activity,
		isLoading: activityLoading,
	} = useUserActivityTvSeriesQuery({
		userId: user?.id,
		tvSeriesId: tvSeries?.id,
	});
	const loading = tvSeriesLoading || tvSeries === undefined || activityLoading || activity === undefined;
	// Mutations
	const { mutateAsync: insertReview } = useUserReviewTvSeriesUpsertMutation({
		tvSeriesId: tvSeries?.id,
	});

	// Handlers
	const handleSave = useCallback(async (data: { title: string; body: string }) => {
		await insertReview({
			title: data.title || null,
			body: data.body,
		}, {
			onSuccess: (review) => {
				router.replace(`/tv-series/${tvSeries?.slug || tvSeries?.id}/review/${review.id}`);
			},
			onError: (error) => {
				toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
			}
		});
	}, [insertReview, router, tvSeries?.slug, tvSeries?.id, toast, t]);

	if (tvSeries === null) {
		return (
			<Redirect href={'..'} />
		)
	}
	if (activity?.review) {
		return (
			<Redirect href={{ pathname: '/tv-series/[tv_series_id]/review/[review_id]', params: { tv_series_id: tvSeries?.slug || tvSeries?.id!, review_id: activity.review.id }}} />
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
	type="tv_series"
	activity={activity}
	tvSeries={tvSeries}
	onSave={handleSave}
	/>
	)
};

export default ReviewTvSeriesCreateScreen;