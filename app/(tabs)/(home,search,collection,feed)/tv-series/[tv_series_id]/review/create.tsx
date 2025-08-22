import ReviewForm from "@/components/screens/review/ReviewForm";
import { Icons } from "@/constants/Icons";
import { useAuth } from "@/providers/AuthProvider";
import { useMediaTvSeriesQuery } from "@/features/media/mediaQueries";
import { useUserActivityTvSeriesQuery } from "@/features/user/userQueries";
import { getIdFromSlug } from "@/utils/getIdFromSlug";
import tw from "@/lib/tw";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native"
import { useUserReviewTvSeriesUpsertMutation } from "@/features/user/userMutations";
import * as Burnt from "burnt";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";

const ReviewTvSeriesCreateScreen = () => {
	const { user } = useAuth();
	const router = useRouter();
	const t = useTranslations();
	const { tv_series_id } = useLocalSearchParams();
	const { id: tvSeriesId } = getIdFromSlug(tv_series_id as string);
	// Requetes
	const {
		data: tvSeries,
		isLoading: tvSeriesLoading,
	} = useMediaTvSeriesQuery({
		tvSeriesId: tvSeriesId,
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
	const insertReview = useUserReviewTvSeriesUpsertMutation({
		userId: user?.id,
		tvSeriesId: tvSeries?.id,
	});

	// Handlers
	const handleSave = async (data: { title: string; body: object }) => {
		await insertReview.mutateAsync({
			title: data.title,
			body: data.body,
		}, {
			onSuccess: (review) => {
				router.replace(`/tv-series/${tvSeries?.slug || tvSeries?.id}/review/${review.id}`);
			},
			onError: (error) => {
				Burnt.toast({
					title: upperFirst(t('common.messages.error')),
					preset: 'error',
					haptic: 'error',
				})
			}
		});
	};

	if (tvSeries === null) return router.back();
	if (activity?.review) return router.replace(`/tv-series/${tvSeries?.slug || tvSeries?.id}/review/${activity?.review?.id}`);
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