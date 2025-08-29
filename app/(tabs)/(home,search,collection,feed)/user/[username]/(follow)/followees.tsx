import { CardUser } from "@/components/cards/CardUser";
import { useUserFolloweesInfiniteQuery, useUserProfileQuery } from "@/features/user/userQueries";
import { useTheme } from "@/providers/ThemeProvider";
import { PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { LegendList } from "@legendapp/list";
import { useLocalSearchParams } from "expo-router";

const ProfileFolloweesScreen = () => {
	const { username } = useLocalSearchParams<{ username: string }>();
	const { data } = useUserProfileQuery({ username: username });
	const { bottomTabHeight, inset } = useTheme();
	const {
		data: followees,
		isLoading,
		hasNextPage,
		fetchNextPage,
		refetch,
	} = useUserFolloweesInfiniteQuery({
		userId: data?.id || undefined,
	});
	return (
		<LegendList
		data={followees?.pages.flat() || []}
		renderItem={({ item }) => (
			<CardUser variant="list" user={item.followee} />
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

export default ProfileFolloweesScreen;