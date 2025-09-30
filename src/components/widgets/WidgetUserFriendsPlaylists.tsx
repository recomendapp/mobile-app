import { useAuth } from "@/providers/AuthProvider";
import { useUserPlaylistsFriendsInfinite } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { StyleProp, TextStyle, View, ViewStyle } from "react-native";
import { ThemedText } from "@/components/ui/ThemedText";
import { CardPlaylist } from "../cards/CardPlaylist";
import { LegendList } from "@legendapp/list";
import { useTranslations } from "use-intl";
import { upperFirst } from "lodash";
import { useCallback, useMemo } from "react";
import { Playlist } from "@recomendapp/types";

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

  const playlistData = useMemo(() => playlists?.pages.flat() || [], [playlists]);

  const renderItem = useCallback(({ item }: { item: Playlist }) => (
    <CardPlaylist playlist={item} style={tw`w-36`} />
  ), []);

  const keyExtractor = useCallback((item: Playlist) => 
    item.id.toString(), 
    []
  );

  const ItemSeparatorComponent = useCallback(() => 
    <View style={tw`w-2`} />, 
    []
  );

  if (!playlistData.length) {
    return null;
  }

  return (
    <View style={[tw`flex-1 gap-2`, style]}>
      <ThemedText style={[tw`font-semibold text-xl`, labelStyle]}>
        {upperFirst(t('common.messages.friends_playlists'))}
      </ThemedText>
      <LegendList
        data={playlistData}
        renderItem={renderItem}
        snapToInterval={152}
        decelerationRate="fast"
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={ItemSeparatorComponent}
        contentContainerStyle={containerStyle}
        nestedScrollEnabled
      />
    </View>
  );
};
WidgetUserFriendsPlaylists.displayName = 'WidgetUserFriendsPlaylists';
