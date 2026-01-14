import { CardMovie } from "@/components/cards/CardMovie";
import { Text } from "@/components/ui/text";
import { Icons } from "@/constants/Icons";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import { Profile } from "@recomendapp/types";
import { LegendList } from "@legendapp/list";
import { Link } from "expo-router";
import { upperFirst } from "lodash";
import { StyleProp, TextStyle, View, ViewStyle } from "react-native";
import { useTranslations } from "use-intl";
import { useUserActivitiesMovieQuery } from "@/api/users/userQueries";

interface ProfileWidgetActivitiesMovieProps extends React.ComponentPropsWithoutRef<typeof View> {
	profile: Profile;
	labelStyle?: StyleProp<TextStyle>;
	containerStyle?: StyleProp<ViewStyle>;
}

const ProfileWidgetActivitiesMovie = ({
	profile,
	style,
	labelStyle,
	containerStyle
} : ProfileWidgetActivitiesMovieProps) => {
	const t = useTranslations();
	const { colors } = useTheme();
	const {
	  data: activities,
	  fetchNextPage,
	  isFetching,
	  hasNextPage,
	} = useUserActivitiesMovieQuery({
	  userId: profile?.id ?? undefined,
	  filters: {
		sortBy: 'watched_date',
		sortOrder: 'desc',
	  }
	});

	if (!activities?.pages.flat().length) return null;
  
	return (
	  <View style={[tw`gap-2`, style]}>
		<Link
		href={`/user/${profile.username!}/films`}
		style={labelStyle}
		>
			<View style={tw`flex-row items-center`}>
				<Text style={tw`font-semibold text-xl`} numberOfLines={1}>
				{upperFirst(t('common.messages.film', { count: 2 }))}
				</Text>
				<Icons.ChevronRight color={colors.mutedForeground} />
			</View>
		</Link>
		<LegendList
		data={activities?.pages.flat() || []}
		renderItem={({ item }) => (
			<CardMovie
			key={item.id}
			variant='poster'
			movie={item.movie!}
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
		/>
	  </View>
	);
};

export default ProfileWidgetActivitiesMovie;