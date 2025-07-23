import { useAuth } from "@/providers/AuthProvider";
import { useUserPlaylistsFriendsInfinite } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { useTranslation } from "react-i18next";
import { StyleProp, Text, TextStyle, View, ViewStyle } from "react-native";
import { ThemedText } from "@/components/ui/ThemedText";
import { LegendList } from "@legendapp/list";
import { CardPlaylist } from "@/components/cards/CardPlaylist";
import { upperFirst } from "lodash";
import { Href, Link } from "expo-router";
import { useTheme } from "@/providers/ThemeProvider";
import { useMediaPlaylistsInfiniteQuery, useMediaReviewsInfiniteQuery } from "@/features/media/mediaQueries";
import { CardReview } from "@/components/cards/CardReview";
import { Icons } from "@/constants/Icons";

interface MediaWidgetReviewsProps extends React.ComponentPropsWithoutRef<typeof View> {
	mediaId: number;
	url: Href;
	labelStyle?: StyleProp<TextStyle>;
	containerStyle?: StyleProp<ViewStyle>;
}

const MediaWidgetReviews = ({
	mediaId,
	url,
	style,
	labelStyle,
	containerStyle,
} : MediaWidgetReviewsProps) => {
	const { colors } = useTheme();
	const { t } = useTranslation();
	const urlReviews = `${url}/reviews` as Href;
	const {
		data: reviews,
		isLoading,
	} = useMediaReviewsInfiniteQuery({
		id: mediaId,
	});
	const loading = reviews === undefined || isLoading;

	if (!reviews || !reviews.pages[0].length) return null;

	return (
	<View style={[tw`gap-1`, style]}>
		<Link href={urlReviews} style={labelStyle}>
			<View style={tw`flex-row items-center`}>
				<ThemedText style={tw`font-medium text-lg`} numberOfLines={1}>
					{upperFirst(t('common.messages.review', { count: 2 }))}
				</ThemedText>
				<Icons.ChevronRight color={colors.mutedForeground} />
			</View>
		</Link>
		<LegendList
		data={reviews.pages.flat()}
		renderItem={({ item }) => (
			<CardReview key={item.id} review={item} activity={item.activity} author={item.activity.user} style={tw`w-86`} />
		)}
		snapToInterval={352}
		decelerationRate="fast"
		keyExtractor={(item) => item.id.toString()}
		horizontal
		showsHorizontalScrollIndicator={false}
		ItemSeparatorComponent={() => <View style={tw`w-2`} />}
		contentContainerStyle={containerStyle}
		nestedScrollEnabled
		/>
	</View>
	);
};

export default MediaWidgetReviews;
