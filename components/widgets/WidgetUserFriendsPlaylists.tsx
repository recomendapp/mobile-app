import { useAuth } from "@/providers/AuthProvider";
import { useUserPlaylistsFriendsInfinite } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { StyleProp, TextStyle, View, ViewStyle } from "react-native";
import { ThemedText } from "@/components/ui/ThemedText";
import { CardPlaylist } from "../cards/CardPlaylist";
import { LegendList } from "@legendapp/list";
import { useTranslations } from "use-intl";
import { upperFirst } from "lodash";

interface WidgetUserFriendsPlaylistsProps extends React.ComponentPropsWithoutRef<typeof View> {
  labelStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

export const WidgetUserFriendsPlaylists = ({
  style,
  labelStyle,
  containerStyle,
} : WidgetUserFriendsPlaylistsProps) => {
  const t = useTranslations();
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
    <ThemedText style={[tw`font-semibold text-xl`, labelStyle]}>{upperFirst(t('common.messages.friends_playlists'))}</ThemedText>
    <LegendList
    data={playlists.pages.flat()}
    renderItem={({ item }) => (
      <CardPlaylist key={item.id} playlist={item} style={tw`w-36`} />
    )}
    snapToInterval={152}
    decelerationRate="fast"
    keyExtractor={(item) => item.id.toString()}
    horizontal
    showsHorizontalScrollIndicator={false}
    ItemSeparatorComponent={() => <View style={tw`w-2`} />}
    contentContainerStyle={containerStyle}
    nestedScrollEnabled
    />
  </View>
  )
};
