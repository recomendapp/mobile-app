import { Button } from "@/components/ui/Button";
import { Icons } from "@/constants/Icons";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { useUserReviewTvSeriesQuery } from "@/features/user/userQueries";
import Viewer from "@/lib/10tap/viewer";
import tw from "@/lib/tw";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { upperFirst } from "lodash";
import { View } from "react-native"
import { useTranslations } from "use-intl";
import { ScrollView } from "react-native-gesture-handler";
import { Text } from "@/components/ui/text";
import { CardUser } from "@/components/cards/CardUser";
import { CardTvSeries } from "@/components/cards/CardTvSeries";
import ButtonUserReviewTvSeriesLike from "@/components/buttons/ButtonUserReviewTvSeriesLike";

const ReviewTvSeriesScreen = () => {
	const { session, user } = useAuth();
	const { bottomTabHeight, inset, colors } = useTheme();
	const t = useTranslations();
	const router = useRouter();
	const { review_id } = useLocalSearchParams();
	const {
		data: review,
		isLoading: reviewLoading,
	} = useUserReviewTvSeriesQuery({
		reviewId: Number(review_id),
	});
	const loading = reviewLoading || review === undefined;

	if (loading) {
		return (
			<View style={tw`flex-1 items-center justify-center`}>
				<Icons.Loader />
			</View>
		);
	};
	if (!review) return router.replace('/+not-found');
	return (
	<>
		<Stack.Screen
		options={{
			headerRight: session ? () => (
			<View style={tw`flex-row items-center gap-2`}>
				<ButtonUserReviewTvSeriesLike reviewId={review?.id} />
				{review.activity?.user_id === user?.id &&<Button
				variant="ghost"
				size="fit"
				onPress={() => router.push(`/tv-series/${review.activity?.tv_series}/review/${review.id}/edit`)}
				textStyle={{ color: colors.accentYellow }}
				>
					{upperFirst(t('common.messages.edit'))}
				</Button>}
			</View>
			) : undefined,
		}}
		/>
		<ScrollView
		contentContainerStyle={[
			{ paddingBottom: bottomTabHeight + 8 },
			tw`gap-2 px-4`
		]}
		>
			<View style={tw`justify-center items-center`}>
				<Text variant="heading" style={[{ color: colors.accentYellow }, tw`text-center my-2`]}>
					{review.title || upperFirst(t('common.messages.review_by', { name: review.activity?.user?.username! })) }
				</Text>
				<CardUser variant="inline" user={review.activity?.user!} />
			</View>
			<CardTvSeries
			tvSeries={review.activity?.tv_series!}
			activity={review.activity!}
			showRating
			/>
			<Viewer
			content={review.body}
			/>
		</ScrollView>
	</>
	)
};

export default ReviewTvSeriesScreen;