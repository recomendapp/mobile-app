import { CardUser } from "@/components/cards/CardUser";
import { useBottomTabOverflow } from "@/components/TabBar/TabBarBackground";
import { useTheme } from "@/providers/ThemeProvider";
import { useSearchUsersInfiniteQuery } from "@/features/search/searchQueries";
import tw from "@/lib/tw";
import { FlashList } from "@shopify/flash-list";
import { upperFirst } from "lodash";
import { ActivityIndicator, Text, View } from "react-native";
import { useTranslations } from "use-intl";

interface ResultUsersProps {
	search: string;
}

const ResultUsers = ({
	search,
} : ResultUsersProps) => {
	const t = useTranslations();
	const { inset, colors } = useTheme();
	const tabBarHeight = useBottomTabOverflow();
	const {
		data: results,
		isLoading,
		hasNextPage,
		fetchNextPage,
		isRefetching,
		refetch,
	} = useSearchUsersInfiniteQuery({
		query: search,
	});
	const loading = isLoading || results === undefined

	return (
		<FlashList
		data={results?.pages.flat()}
		renderItem={({ item }) => (
			<View key={item.id} style={tw`p-1`}>
				<CardUser user={item} />
			</View>
		)}
		ListEmptyComponent={() => (
			loading ? (
				<ActivityIndicator />
			) : (
				<View style={tw`p-2 items-center justify-center`}>
					<Text style={{ color: colors.mutedForeground }}>{upperFirst(t('common.messages.no_results'))}</Text>
				</View>
			)
		)}
		keyExtractor={(item) => String(item.id)}
		showsVerticalScrollIndicator={false}
		contentContainerStyle={{
			paddingLeft: 4,
			paddingRight: 4,
			paddingBottom: tabBarHeight + inset.bottom + 8,
		}}
		onEndReached={() => hasNextPage && fetchNextPage()}
		onEndReachedThreshold={0.3}
		refreshing={isRefetching}
		onRefresh={refetch}
		estimatedItemSize={100}
		/>
	)
};

export default ResultUsers;