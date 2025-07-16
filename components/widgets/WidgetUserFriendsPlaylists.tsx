import { useAuth } from "@/providers/AuthProvider";
import { useUserPlaylistsFriendsInfinite } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { useTranslation } from "react-i18next";
import { StyleProp, TextStyle, View, ViewStyle } from "react-native";
import { ThemedText } from "@/components/ui/ThemedText";
import { CardPlaylist } from "../cards/CardPlaylist";
import { LegendList } from "@legendapp/list";

interface WidgetUserFriendsPlaylistsProps extends React.ComponentPropsWithoutRef<typeof View> {
  labelStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

export const WidgetUserFriendsPlaylists = ({
  style,
  labelStyle,
  containerStyle,
} : WidgetUserFriendsPlaylistsProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const { data: playlists } = useUserPlaylistsFriendsInfinite({
    userId: user?.id,
		filters: {
			resultsPerPage: 20,
		},
  })

  if (!user || !playlists || !playlists.pages[0].length) return null;

  return (
  <View style={[tw`flex-1 gap-2`, style]}>
    <ThemedText style={[tw`font-semibold text-xl`, labelStyle]}>{t('widgets.user_friends_playlists.label')}</ThemedText>
    <LegendList
    data={playlists.pages.flat()}
    renderItem={({ item }) => (
      <CardPlaylist key={item.id} playlist={item} style={tw`w-36`} />
    )}
    snapToInterval={148}
    decelerationRate="fast"
    keyExtractor={(item) => item.id.toString()}
    horizontal
    showsHorizontalScrollIndicator={false}
    ItemSeparatorComponent={() => <View style={tw`w-1`} />}
    contentContainerStyle={containerStyle}
    nestedScrollEnabled
    />
  </View>
  )
};
