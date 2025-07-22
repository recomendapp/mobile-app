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
		<View style={tw`flex-row items-center justify-between gap-2`}>
			<Link href={urlReviews} style={[tw`font-medium text-lg`, { color: colors.foreground }, labelStyle]}>
			{upperFirst(t('common.messages.review', { count: reviews.pages.flat().length }))}
			</Link>
			<Link href={urlReviews} style={[{ color: colors.mutedForeground }, tw`text-sm`]}>
				{upperFirst(t('common.messages.show_all'))}
			</Link>
		</View>
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
