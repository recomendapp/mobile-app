import { CardPlaylist } from "@/components/cards/CardPlaylist";
import { useBottomTabOverflow } from "@/components/TabBar/TabBarBackground";
import { useAuth } from "@/providers/AuthProvider";
import { useUserPlaylistsSavedInfiniteQuery } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { Text, View } from "react-native";
import { LegendList } from "@legendapp/list";
import { Icons } from "@/constants/Icons";
import { upperFirst } from "lodash";
import { useTheme } from "@/providers/ThemeProvider";
import { useTranslations } from "use-intl";

const CollectionSavedScreen = () => {
	const { user } = useAuth();
	const t = useTranslations();
	const { colors } = useTheme();
	const tabBarHeight = useBottomTabOverflow();
	const {
		data: playlists,
		isLoading,
		isFetching,
		isRefetching,
		fetchNextPage,
		refetch,
		hasNextPage,
	} = useUserPlaylistsSavedInfiniteQuery({
		userId: user?.id,
	});
	const loading = isLoading || playlists === undefined;

	return (
		<LegendList
		data={playlists?.pages.flatMap((page) => page) ?? []}
		renderItem={({ item, index }) => (
			<View key={index} style={tw`p-1`}>
				<CardPlaylist playlist={item.playlist} style={tw`w-full`} />
			</View>
		)}
		ListEmptyComponent={
			loading ? <Icons.Loader />
			: (
				<View style={tw`flex-1 items-center justify-center p-4`}>
					<Text style={[tw`text-center`, { color: colors.mutedForeground }]}>
						{upperFirst(t('common.messages.no_playlists_saved'))}
					</Text>
				</View>
			)
		}
		refreshing={isRefetching}
		onRefresh={refetch}
		numColumns={3}
		contentContainerStyle={{
			paddingBottom: tabBarHeight,
		}}
		keyExtractor={(_, index) => index.toString()}
		showsVerticalScrollIndicator={false}
		onEndReached={() => hasNextPage && fetchNextPage()}
		onEndReachedThreshold={0.3}
		nestedScrollEnabled
		/>
	)
};

export default CollectionSavedScreen;