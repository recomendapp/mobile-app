import { Button } from "@/components/ui/Button";
import { Icons } from "@/constants/Icons";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { useUserReviewMovieQuery } from "@/features/user/userQueries";
import Viewer from "@/lib/10tap/viewer";
import tw from "@/lib/tw";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { upperFirst } from "lodash";
import { RefreshControl, ScrollView, View } from "react-native"
import { useTranslations } from "use-intl";
import { Text } from "@/components/ui/text";
import { CardUser } from "@/components/cards/CardUser";
import ButtonUserReviewMovieLike from "@/components/buttons/ButtonUserReviewMovieLike";
import { CardMovie } from "@/components/cards/CardMovie";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { BottomSheetReviewMovie } from "@/components/bottom-sheets/sheets/BottomSheetReviewMovie";

const ReviewMovieScreen = () => {
	const { session } = useAuth();
	const { bottomOffset, colors } = useTheme();
	const openSheet = useBottomSheetStore((state) => state.openSheet);
	const t = useTranslations();
	const router = useRouter();
	const { review_id } = useLocalSearchParams();
	const {
		data: review,
		isLoading: reviewLoading,
		isRefetching,
		refetch
	} = useUserReviewMovieQuery({
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
			headerRight: () => (
			<>
				{session && <ButtonUserReviewMovieLike reviewId={review?.id} />}
				<Button
				variant="ghost"
				size="icon"
				icon={Icons.EllipsisVertical}
				onPress={() => openSheet(BottomSheetReviewMovie, {
					review: review,
				})}
				/>
			</>
			),
		}}
		/>
		<ScrollView
		contentContainerStyle={[
			{ paddingBottom: bottomOffset + 8 },
			tw`gap-2 px-4`
		]}
		refreshControl={
			<RefreshControl
			refreshing={isRefetching}
			onRefresh={refetch}
			/>
		}
		>
			<View style={tw`justify-center items-center`}>
				<Text variant="heading" style={[{ color: colors.accentYellow }, tw`text-center my-2`]}>
					{review.title || upperFirst(t('common.messages.review_by', { name: review.activity?.user?.username! })) }
				</Text>
				<CardUser variant="inline" user={review.activity?.user!} />
			</View>
			<CardMovie
			movie={review.activity?.movie!}
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

export default ReviewMovieScreen;