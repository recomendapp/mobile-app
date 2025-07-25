import { CardMedia } from "@/components/cards/CardMedia";
import ActionReviewLike from "@/components/reviews/actions/ActionReviewLike";
import { useBottomTabOverflow } from "@/components/TabBar/TabBarBackground";
import { Button } from "@/components/ui/button";
import { Icons } from "@/constants/Icons";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { useUserReviewQuery } from "@/features/user/userQueries";
import Viewer from "@/lib/10tap/viewer";
import tw from "@/lib/tw";
import { useLocalSearchParams, useRouter } from "expo-router";
import { upperFirst } from "lodash";
import { useTranslation } from "react-i18next";
import { Text } from "react-native";
import { View } from "react-native"

const ReviewScreen = () => {
	const { user } = useAuth();
	const { inset, colors } = useTheme();
	const { t } = useTranslation();
	const bottomTabBarHeight = useBottomTabOverflow();
	const router = useRouter();
	const { review_id } = useLocalSearchParams();
	const {
		data: review,
		isLoading: reviewLoading,
	} = useUserReviewQuery({
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
		<View
		style={[
			{
				paddingTop: inset.top,
				paddingBottom: bottomTabBarHeight + inset.bottom,
			},
			tw`flex-1 gap-2 px-2`
		]}
		>
			<Text style={[{ color: colors.accentYellow }, tw`text-2xl font-bold text-center`]}>
				{review.title ?? `Critique par @${review.activity?.user?.username}`}
			</Text>
			<CardMedia
			media={review.activity?.media!}
			activity={review.activity!}
			showRating
			/>
			<Viewer
			content={review.body}
			/>
			<View style={tw.style("flex-row items-center justify-end m-1")}>
				<ActionReviewLike reviewId={review?.id} reviewLikesCount={review.likes_count} />
			</View>

			{review.activity?.user_id === user?.id ? (
				<Button
				variant='accent-yellow'
				style={[
					tw`absolute bottom-0 left-1/2`,
					{
						transform: 'translate(-50%, -50%)',
					}
				]}
				// pressableStyle={tw`flex-0`}
				onPress={() => router.push(`/review/${review.id}/edit`)}
				>
				{upperFirst(t('common.messages.edit'))}
				</Button>
			) : null}
		</View>
	)
};

export default ReviewScreen;