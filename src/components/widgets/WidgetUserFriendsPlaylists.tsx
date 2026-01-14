import tw from "@/lib/tw";
import { StyleProp, TextStyle, View, ViewStyle } from "react-native";
import { CardPlaylist } from "../cards/CardPlaylist";
import { LegendList } from "@legendapp/list";
import { useTranslations } from "use-intl";
import { upperFirst } from "lodash";
import { Text } from "../ui/text";
import { GAP } from "@/theme/globals";
import { useUserPlaylistsFriendQuery } from "@/api/users/userQueries";

interface WidgetUserFriendsPlaylistsProps extends React.ComponentPropsWithoutRef<typeof View> {
  labelStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

export const WidgetUserFriendsPlaylists = ({
  style,
  labelStyle,
  containerStyle,
}: WidgetUserFriendsPlaylistsProps) => {
  const t = useTranslations();
  const { data: playlists, hasNextPage, fetchNextPage } = useUserPlaylistsFriendQuery({
    filters: {
      sortBy: 'updated_at',
      sortOrder: 'desc',
    },
  });

  const playlistData = playlists?.pages.flat() || [];

  if (!playlistData.length) {
    return null;
  }

  return (
    <View style={[tw`flex-1 gap-2`, style]}>
      <Text style={[tw`font-semibold text-xl`, labelStyle]}>
        {upperFirst(t('common.messages.friends_playlists'))}
      </Text>
      <LegendList
        data={playlistData}
        renderItem={({ item }) => (
          <CardPlaylist playlist={item} style={tw`w-36`} />
        )}
        snapToInterval={152}
        decelerationRate="fast"
        keyExtractor={(item) => item.id.toString()}
        onEndReached={() => hasNextPage && fetchNextPage()}
        horizontal
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
        contentContainerStyle={containerStyle}
        nestedScrollEnabled
      />
    </View>
  );
};
WidgetUserFriendsPlaylists.displayName = 'WidgetUserFriendsPlaylists';
