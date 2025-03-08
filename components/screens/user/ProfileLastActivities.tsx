import { CardMedia } from "@/components/cards/CardMedia";
import { ThemedText } from "@/components/ui/ThemedText";
import { useUserActivitiesInfiniteQuery } from "@/features/user/userQueries"
import { Profile } from "@/types/type.db";
import { FlashList } from "@shopify/flash-list";
import { Link } from "expo-router";
import { upperFirst } from "lodash";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

const ProfileLastActivities = ({ profile }: { profile: Profile }) => {
	const { t } = useTranslation();
	const {
	  data: activities,
	  isLoading,
	  fetchNextPage,
	  isFetching,
	  isFetchingNextPage,
	  hasNextPage,
	  refetch,
	} = useUserActivitiesInfiniteQuery({
	  userId: profile?.id ?? undefined,
	})

	const loadMoreActivities = () => hasNextPage && fetchNextPage();

	if (!activities?.pages[0].length) return null;
  
	return (
	  <View className="flex flex-col gap-1">
		<Link href={`/user/${profile.username}/collection`} asChild>
			<ThemedText className="font-semibold text-xl">
			{upperFirst(t('common.messages.last_activities'))}
			</ThemedText>
		</Link>
		<FlashList
		data={activities.pages.flat()}
		renderItem={({ item, index }) => (
			<CardMedia
			key={item.id}
			variant='poster'
			media={item.media!}
			index={index}
			/>
		)}
		keyExtractor={(_, index) => index.toString()}
		estimatedItemSize={190 * 15}
		refreshing={isFetching}
		// onRefresh={refetch}
		onEndReached={loadMoreActivities}
		onEndReachedThreshold={0.25}
		horizontal
		showsHorizontalScrollIndicator={false}
		ItemSeparatorComponent={() => <View className="w-2" />}
		/>
	  </View>
	);
};

export default ProfileLastActivities;