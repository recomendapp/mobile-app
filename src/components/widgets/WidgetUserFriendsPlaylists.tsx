import { useAuth } from "@/providers/AuthProvider";
import { useUserPlaylistsFriendsInfinite } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { StyleProp, TextStyle, View, ViewStyle } from "react-native";
import { CardPlaylist } from "../cards/CardPlaylist";
import { LegendList } from "@legendapp/list";
import { useTranslations } from "use-intl";
import { upperFirst } from "lodash";
import { Text } from "../ui/text";
import { GAP } from "@/theme/globals";

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
  const { session } = useAuth();
  const { data: playlists } = useUserPlaylistsFriendsInfinite({
    userId: session?.user.id,
    filters: {
      resultsPerPage: 20,
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
