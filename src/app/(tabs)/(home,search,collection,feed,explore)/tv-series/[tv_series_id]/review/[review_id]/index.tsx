import { Button } from "@/components/ui/Button";
import { Icons } from "@/constants/Icons";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { useUserReviewTvSeriesQuery } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { Redirect, Stack, useLocalSearchParams } from "expo-router";
import { upperFirst } from "lodash";
import { RefreshControl, ScrollView, View } from "react-native"
import { useTranslations } from "use-intl";
import { Text } from "@/components/ui/text";
import { CardUser } from "@/components/cards/CardUser";
import { CardTvSeries } from "@/components/cards/CardTvSeries";
import ButtonUserReviewTvSeriesLike from "@/components/buttons/ButtonUserReviewTvSeriesLike";
import { BottomSheetReviewTvSeries } from "@/components/bottom-sheets/sheets/BottomSheetReviewTvSeries";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { EnrichedTextInput } from "@/components/RichText/EnrichedTextInput";
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";

const ReviewTvSeriesScreen = () => {
	const { session } = useAuth();
	const { bottomOffset, tabBarHeight, colors } = useTheme();
	const openSheet = useBottomSheetStore((state) => state.openSheet);
	const t = useTranslations();
	const { review_id } = useLocalSearchParams();
	const {
		data: review,
		isLoading: reviewLoading,
		isRefetching,
		refetch
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
	}
	if (!review) {
		return (
			<Redirect href={{ pathname: '/+not-found', params: { }}} />
		)
	}
	return (
	<>
		<Stack.Screen
		options={{
			headerRight: () => (
			<>
				{session && <ButtonUserReviewTvSeriesLike reviewId={review?.id} />}
				<Button
				variant="ghost"
				size="icon"
				icon={Icons.EllipsisVertical}
				onPress={() => openSheet(BottomSheetReviewTvSeries, {
					review: review,
				})}
				/>
			</>
			),
		}}
		/>
		<ScrollView
		contentContainerStyle={{
			paddingBottom: bottomOffset + PADDING_VERTICAL,
			paddingHorizontal: PADDING_HORIZONTAL,
			gap: GAP,
		}}
		refreshControl={
			<RefreshControl
			refreshing={isRefetching}
			onRefresh={refetch}
			/>
		}
		scrollIndicatorInsets={{
			bottom: tabBarHeight,
		}}
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
			<EnrichedTextInput defaultValue={review.body} editable={false} style={tw`flex-1`} scrollEnabled={false} />
		</ScrollView>
	</>
	)
};

export default ReviewTvSeriesScreen;