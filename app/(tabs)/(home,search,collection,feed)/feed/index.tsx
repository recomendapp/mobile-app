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
	return (
		<LegendList
		data={feed?.pages.flat() || []}
		renderItem={({ item, index }) => (
			<CardFeedItem
			title={item.media?.title ?? ''}
			posterUrl={item.media?.avatar_url ?? ''}
			posterType={item.media?.media_type}
			onPosterPress={() => router.push(item.media?.url as Href)}
			description={item.media?.extra_data.overview ?? ''}
			content={
				<Pressable
				onPress={() => router.push(`/user/${item.user?.username}`)}
				style={tw`flex-row items-center gap-1`}
				>
					<UserAvatar avatar_url={item.user?.avatar_url} full_name={item.user?.full_name!} style={tw`w-6 h-6`} />
					<FeedUserActivity activity={item} style={[{ color: colors.mutedForeground }, tw`text-sm`]} />
				</Pressable>
			}
			footer={item.review ? (
				<CardReview activity={item} review={item?.review} author={item?.user!} style={{ backgroundColor: colors.background }} />
			) : undefined}
			onPress={() => router.push(`/user/${item.user?.username}`)}
			onLongPress={() => openSheet(BottomSheetMedia, {
				media: item.media,
				activity: item,
			})}
			/>
		)}
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