import { CardUserActivity } from "@/components/cards/CardUserActivity";
import { useAuth } from "@/providers/AuthProvider";
import { useUserFeedInfiniteQuery } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { upperFirst } from "lodash";
import { LegendList } from "@legendapp/list";
import { View } from "@/components/ui/view";
import { Text } from "@/components/ui/text";
import { useTranslations } from "use-intl";
import { useTheme } from "@/providers/ThemeProvider";
import { CardFeedItem } from "@/components/cards/CardFeedItem";
import { CardReview } from "@/components/cards/CardReview";
import { Href, useRouter } from "expo-router";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import BottomSheetMedia from "@/components/bottom-sheets/sheets/BottomSheetMedia";
import UserAvatar from "@/components/user/UserAvatar";
import FeedUserActivity from "@/components/screens/feed/FeedUserActivity";
import { PADDING_VERTICAL } from "@/theme/globals";
import { Pressable } from "react-native-gesture-handler";
import { CardFeedMovie } from "@/components/cards/feed/CardFeedMovie";
import { MediaMovie, MediaTvSeries, UserActivity, UserActivityMovie, UserActivityTvSeries } from "@/types/type.db";
import { CardFeedTvSeries } from "@/components/cards/feed/CardFeedTvSeries";

const FeedScreen = () => {
	const { user } = useAuth();
	const router = useRouter();
	const t = useTranslations();
	const openSheet = useBottomSheetStore((state) => state.openSheet);
	const { bottomTabHeight, colors } = useTheme();
	const {
		data: feed,
		isLoading,
		isFetching,
		fetchNextPage,
		hasNextPage,
		refetch,
	} = useUserFeedInfiniteQuery({
		userId: user?.id,
	});
	const loading = isLoading || feed === undefined;

	// Render 
	const renderItem = ({ item, index } : { item: UserActivity, index: number }) => {
		const { media, media_id, ...activity } = item;
		switch (item.type) {
			case 'movie':
				return <CardFeedMovie activity={{ movie_id: media_id!, ...activity } as UserActivityMovie} movie={item.media as MediaMovie} />
			case 'tv_series':
				return <CardFeedTvSeries activity={{ tv_series_id: media_id!, ...activity } as UserActivityTvSeries} tvSeries={item.media as MediaTvSeries} />
			default:
				return null;
		}
	};

	return (
		<LegendList
		data={feed?.pages.flat() || []}
		renderItem={renderItem}
		ListEmptyComponent={() => !loading ? (
			<View style={tw`flex-1 items-center justify-center`}>
				<Text textColor='muted'>{upperFirst(t('common.messages.no_results'))}</Text>
			</View>
		) : null}
		contentContainerStyle={[
			tw`px-4 gap-1`,
			{
				paddingBottom: bottomTabHeight + PADDING_VERTICAL
			}
		]}
		keyExtractor={(_, index) => index.toString()}
		estimatedItemSize={feed?.pages.flatMap((page) => page).length}
		showsVerticalScrollIndicator={false}
		refreshing={isFetching}
		onEndReached={() => hasNextPage && fetchNextPage()}
		onEndReachedThreshold={0.3}
		nestedScrollEnabled
		onRefresh={refetch}
		/>
	);
};

export default FeedScreen;