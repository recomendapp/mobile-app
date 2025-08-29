import { CardUser } from "@/components/cards/CardUser";
import { useUserFollowersInfiniteQuery, useUserProfileQuery } from "@/features/user/userQueries";
import { useTheme } from "@/providers/ThemeProvider";
import { PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { LegendList } from "@legendapp/list";
import { useLocalSearchParams } from "expo-router";

const ProfileFollowersScreen = () => {
	const { username } = useLocalSearchParams<{ username: string }>();
	const { data } = useUserProfileQuery({ username: username });
	const { bottomTabHeight, inset } = useTheme();
	const {
		data: followers,
		isLoading,
		hasNextPage,
		fetchNextPage,
		refetch,
	} = useUserFollowersInfiniteQuery({
		userId: data?.id || undefined,
	});
	return (
		<LegendList
		data={followers?.pages.flat() || []}
		renderItem={({ item }) => (
			<CardUser variant="list" user={item.follower} />
		)}
		contentContainerStyle={{
			paddingLeft: inset.left + PADDING_HORIZONTAL,
			paddingRight: inset.right + PADDING_HORIZONTAL,
			paddingBottom: bottomTabHeight + PADDING_VERTICAL,
		}}
		keyExtractor={(item) => item.id.toString()}
		onEndReached={() => hasNextPage && fetchNextPage()}
		onRefresh={refetch}
		/>
	);
};

export default ProfileFollowersScreen;