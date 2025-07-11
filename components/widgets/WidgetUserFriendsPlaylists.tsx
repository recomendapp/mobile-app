import { useAuth } from "@/providers/AuthProvider";
import { useUserPlaylistsFriendsInfinite, useUserRecosQuery } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";
import { FlatList, Text, View } from "react-native";
import { CardMedia } from "@/components/cards/CardMedia";
import UserAvatar from "@/components/user/UserAvatar";
import { useTheme } from "@/providers/ThemeProvider";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { CardPlaylist } from "../cards/CardPlaylist";

export const WidgetUserFriendsPlaylists = ({
  style,
} : React.ComponentPropsWithoutRef<typeof View>) => {
  const { colors } = useTheme();
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
    <ThemedText style={tw`p-0 font-semibold text-xl`}>{t('widgets.user_friends_playlists.label')}</ThemedText>
    <FlatList
    data={playlists.pages.flat()}
    renderItem={({ item }) => (
      <View key={item.id} style={tw`w-36`}>
        <CardPlaylist playlist={item} />
      </View>
    )}
    horizontal
    showsHorizontalScrollIndicator={false}
    ItemSeparatorComponent={() => <View style={tw`w-1`} />}
    nestedScrollEnabled
    />
  </View>
  )
};
