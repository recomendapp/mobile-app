import { PER_PAGE } from "@/app/(tabs)/(home,search,collection,feed)/user/[username]/collection";
import { CardMedia } from "@/components/cards/CardMedia";
import { Skeleton } from "@/components/ui/Skeleton";
import { useUserActivitiesInfiniteQuery } from "@/features/user/userQueries"
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import { Profile } from "@/types/type.db";
import { LegendList } from "@legendapp/list";
import { Link } from "expo-router";
import { upperFirst } from "lodash";
import { useTranslation } from "react-i18next";
import { StyleProp, TextStyle, View, ViewStyle } from "react-native";

interface ProfileLastActivitiesProps extends React.ComponentPropsWithoutRef<typeof View> {
	profile: Profile;
	labelStyle?: StyleProp<TextStyle>;
	containerStyle?: StyleProp<ViewStyle>;
}

const ProfileLastActivities = ({
	profile,
	style,
	labelStyle,
	containerStyle
} : ProfileLastActivitiesProps) => {
	const { t } = useTranslation();
	const { colors } = useTheme();
	const {
	  data: activities,
	  isLoading,
	  fetchNextPage,
	  isFetching,
	  hasNextPage,
	  refetch,
	} = useUserActivitiesInfiniteQuery({
	  userId: profile?.id ?? undefined,
	  filters: {
		perPage: PER_PAGE,
	  }
	});

	const loading = isLoading || activities === undefined;

	if (!loading && !activities?.pages[0].length) return null;
  
	return (
	  <View style={[tw`gap-1`, style]}>
		{!loading ? <Link href={`/user/${profile.username}/collection`} style={[tw`font-semibold text-xl`, { color: colors.foreground }, labelStyle]}>
			{upperFirst(t('common.messages.last_activities'))}
		</Link> : <Skeleton style={tw.style('h-8 w-32 rounded-full')} />}
		{!loading ? <LegendList
		data={activities.pages.flat()}
		renderItem={({ item, index }) => (
			<CardMedia
			key={item.id}
			variant='poster'
			media={item.media!}
			index={index}
			profileActivity={item}
			style={tw`w-32`}
			/>
		)}
		snapToInterval={136}
		decelerationRate="fast"
		keyExtractor={(_, index) => index.toString()}
		refreshing={isFetching}
		onEndReached={() => hasNextPage && fetchNextPage()}
		onEndReachedThreshold={0.25}
		horizontal
		showsHorizontalScrollIndicator={false}
		ItemSeparatorComponent={() => <View style={tw.style('w-2')} />}
		contentContainerStyle={containerStyle}
		/> : <Skeleton style={tw.style('h-48 w-full')} />}
	  </View>
	);
};

export default ProfileLastActivities;