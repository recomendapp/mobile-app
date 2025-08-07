import tw from "@/lib/tw";
import { StyleProp, TextStyle, View, ViewStyle } from "react-native";
import { ThemedText } from "@/components/ui/ThemedText";
import { LegendList } from "@legendapp/list";
import { upperFirst } from "lodash";
import { Href, Link } from "expo-router";
import { useTheme } from "@/providers/ThemeProvider";
import { useMediaReviewsInfiniteQuery } from "@/features/media/mediaQueries";
import { CardReview } from "@/components/cards/CardReview";
import { Icons } from "@/constants/Icons";
import { useTranslations } from "use-intl";
import { Text } from "@/components/ui/text";
import { UserReview } from "@/types/type.db";

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
	const t = useTranslations();
	const urlReviews = `${url}/reviews` as Href;
	const {
		data: reviews,
		isLoading,
		fetchNextPage,
		hasNextPage,
	} = useMediaReviewsInfiniteQuery({
		id: mediaId,
	});
	const loading = reviews === undefined || isLoading;

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
		<LegendList<UserReview>
		key={loading ? 'loading' : 'reviews'}
		data={loading ? new Array(3).fill(null) : reviews?.pages.flat()}
		renderItem={({ item }) => (
			!loading ? (
				<CardReview key={item.id} review={item} activity={item.activity!} author={item.activity?.user!} style={tw`w-86`} />
			) : (
				<CardReview skeleton style={tw`w-86`} />
			)
		)}
		ListEmptyComponent={
			<Text style={[tw``, { color: colors.mutedForeground }]}>
				{upperFirst(t('common.messages.no_reviews'))}
			</Text>
		}
		snapToInterval={352}
		decelerationRate="fast"
		keyExtractor={(item, index) => loading ? index.toString() : item.id.toString()}
		horizontal
		showsHorizontalScrollIndicator={false}
		ItemSeparatorComponent={() => <View style={tw`w-2`} />}
		contentContainerStyle={containerStyle}
		nestedScrollEnabled
		onEndReached={() => hasNextPage && fetchNextPage()}
		onEndReachedThreshold={0.5}
		/>
	</View>
	);
};

export default MediaWidgetReviews;
