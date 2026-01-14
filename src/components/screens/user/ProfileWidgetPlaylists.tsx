import { CardPlaylist } from "@/components/cards/CardPlaylist";
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
import { useUserPlaylistsQuery } from "@/api/users/userQueries";

interface ProfileWidgetPlaylistsProps extends React.ComponentPropsWithoutRef<typeof View> {
	profile: Profile;
	labelStyle?: StyleProp<TextStyle>;
	containerStyle?: StyleProp<ViewStyle>;
}

const ProfileWidgetPlaylists = ({
	profile,
	style,
	labelStyle,
	containerStyle
} : ProfileWidgetPlaylistsProps) => {
	const t = useTranslations();
	const { colors } = useTheme();
	const {
	  data: playlists,
	  fetchNextPage,
	  isFetching,
	  hasNextPage,
	} = useUserPlaylistsQuery({
	  userId: profile?.id ?? undefined,
	  filters: {
		sortBy: 'updated_at',
		sortOrder: 'desc',
	  }
	});

	if (!playlists?.pages.flat().length) return null;
  
	return (
	  <View style={[tw`gap-2`, style]}>
		<Link href={`/user/${profile.username}/playlists`} style={labelStyle}>
			<View style={tw`flex-row items-center`}>
				<Text style={tw`font-semibold text-xl`} numberOfLines={1}>
				{upperFirst(t('common.messages.playlist', { count: 2 }))}
				</Text>
				<Icons.ChevronRight color={colors.mutedForeground} />
			</View>
		</Link>
		<LegendList
		data={playlists?.pages.flat() || []}
		renderItem={({ item, index }) => (
			<CardPlaylist
			key={item.id}
			playlist={item}
			style={tw`w-32`}
			showItemsCount
			showPlaylistAuthor={false}
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

export default ProfileWidgetPlaylists;