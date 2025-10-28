import { CardUser } from "@/components/cards/CardUser";
import { useUserFolloweesInfiniteQuery, useUserProfileQuery } from "@/features/user/userQueries";
import { useTheme } from "@/providers/ThemeProvider";
import { PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { LegendList } from "@legendapp/list";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ProfileFolloweesScreen = () => {
	const { username } = useLocalSearchParams<{ username: string }>();
	const { data: profile } = useUserProfileQuery({ username: username });
	const insets = useSafeAreaInsets();
	const { tabBarHeight, bottomOffset } = useTheme();
	const {
		data,
		isLoading,
		hasNextPage,
		fetchNextPage,
		refetch,
	} = useUserFolloweesInfiniteQuery({
		userId: profile?.id || undefined,
	});
	const followees = useMemo(() => data?.pages.flat() || [], [data]);
	const keyExtractor = useCallback((item: typeof followees[number]) => item.followee.id!.toString(), []);
	const onEndReached = useCallback(() => {
		if (hasNextPage) {
			fetchNextPage();
		}
	}, [hasNextPage, fetchNextPage]);
	const renderItem = useCallback(({ item }: { item: typeof followees[number], index: number }) => (
		<CardUser variant="list" user={item.followee} />
	), []);
	return (
		<LegendList
		data={followees}
		renderItem={renderItem}
		contentContainerStyle={{
			paddingLeft: insets.left + PADDING_HORIZONTAL,
			paddingRight: insets.right + PADDING_HORIZONTAL,
			paddingBottom: bottomOffset + PADDING_VERTICAL,
		}}
		scrollIndicatorInsets={{
			bottom: tabBarHeight,
		}}
		keyExtractor={keyExtractor}
		onEndReached={onEndReached}
		onRefresh={refetch}
		/>
	);
};

export default ProfileFolloweesScreen;