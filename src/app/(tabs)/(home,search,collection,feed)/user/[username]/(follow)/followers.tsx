import { useUserFollowersQuery, useUserProfileQuery } from "@/api/users/userQueries";
import { CardUser } from "@/components/cards/CardUser";
import { useTheme } from "@/providers/ThemeProvider";
import { PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { LegendList } from "@legendapp/list";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ProfileFollowersScreen = () => {
	const { username } = useLocalSearchParams<{ username: string }>();
	const { data: profile } = useUserProfileQuery({ username: username });
	const insets = useSafeAreaInsets();
	const { bottomOffset, tabBarHeight } = useTheme();
	const {
		data,
		hasNextPage,
		fetchNextPage,
		refetch,
	} = useUserFollowersQuery({
		userId: profile?.id || undefined,
	});
	const followers = useMemo(() => data?.pages.flat() || [], [data]);
	// useCallback
	const keyExtractor = useCallback((item: typeof followers[number]) => item.follower.id!.toString(), []);
	const onEndReached = useCallback(() => {
		if (hasNextPage) {
			fetchNextPage();
		}
	}, [hasNextPage, fetchNextPage]);
	const renderItem = useCallback(({ item }: { item: typeof followers[number], index: number }) => (
		<CardUser variant="list" user={item.follower} />
	), []);
	return (
		<LegendList
		data={followers}
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

export default ProfileFollowersScreen;