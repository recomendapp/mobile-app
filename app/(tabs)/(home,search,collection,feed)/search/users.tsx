import { CardUser } from "@/components/cards/CardUser";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { Icons } from "@/constants/Icons";
import { useSearchUsersInfiniteQuery } from "@/features/search/searchQueries";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import useSearchStore from "@/stores/useSearchStore";
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { LegendList } from "@legendapp/list";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";

const SearchUsersScreen = () => {
	const { inset, tabBarHeight } = useTheme();
	const t = useTranslations();
	const debouncedSearch = useSearchStore(state => state.debouncedSearch);
	// Queries
	const {
		data,
		isLoading,
		hasNextPage,
		fetchNextPage,
	} = useSearchUsersInfiniteQuery({
		query: debouncedSearch,
	});

	return (
	<>
		<LegendList
		data={data?.pages.flatMap(page => page.data) || []}
		renderItem={({ item }) => (
			<CardUser variant="list" user={item} />
		)}
		contentContainerStyle={{
			paddingLeft: inset.left + PADDING_HORIZONTAL,
			paddingRight: inset.right + PADDING_HORIZONTAL,
			paddingBottom: tabBarHeight + inset.bottom + PADDING_VERTICAL,
			gap: GAP,
		}}
		keyExtractor={(item) => item.id.toString()}
		ListEmptyComponent={
			isLoading ? <Icons.Loader /> : debouncedSearch ? (
				<View style={tw`flex-1 items-center justify-center`}>
					<Text textColor='muted'>{upperFirst(t('common.messages.no_results'))}</Text>
				</View>
			) : null
		}
		onEndReached={() => hasNextPage && fetchNextPage()}
		/>
	</>
	)
};

export default SearchUsersScreen;