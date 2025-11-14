import { useSearchUsersOptions } from "@/api/options";
import { CardUser } from "@/components/cards/CardUser";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { Icons } from "@/constants/Icons";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import useSearchStore from "@/stores/useSearchStore";
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { LegendList, LegendListRef } from "@legendapp/list";
import { useScrollToTop } from "@react-navigation/native";
import { useInfiniteQuery } from "@tanstack/react-query";
import { upperFirst } from "lodash";
import { useRef } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslations } from "use-intl";

const SearchUsersScreen = () => {
	const insets = useSafeAreaInsets();
	const { tabBarHeight, bottomOffset } = useTheme();
	const t = useTranslations();
	const search = useSearchStore(state => state.search);
	
	// Queries
	const {
		data,
		isLoading,
		hasNextPage,
		fetchNextPage,
	} = useInfiniteQuery(useSearchUsersOptions({
		query: search,
	}));
	
	// REFs
	const scrollRef = useRef<LegendListRef>(null);

	useScrollToTop(scrollRef);

	return (
		<LegendList
			key={search}
			ref={scrollRef}
			data={data?.pages.flatMap(page => page.data) || []}
			renderItem={({ item }) => <CardUser variant="list" user={item} /> }
			contentContainerStyle={{
				paddingLeft: insets.left + PADDING_HORIZONTAL,
				paddingRight: insets.right + PADDING_HORIZONTAL,
				paddingBottom: bottomOffset + PADDING_VERTICAL,
				gap: GAP,
			}}
			scrollIndicatorInsets={{
				bottom: tabBarHeight,
			}}
			keyExtractor={(item) => item.id.toString()}
			ListEmptyComponent={
				isLoading ? <Icons.Loader />
				: search ? (
					<View style={tw`flex-1 items-center justify-center`}>
						<Text textColor='muted'>{upperFirst(t('common.messages.no_results'))}</Text>
					</View>
				) : null
			}
			onEndReached={() => hasNextPage && fetchNextPage()}
		/>
	);
};

export default SearchUsersScreen;