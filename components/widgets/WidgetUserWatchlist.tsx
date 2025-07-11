import { useAuth } from "@/providers/AuthProvider";
import { useUserWatchlistQuery } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
import { CardMedia } from "@/components/cards/CardMedia";
import { ThemedText } from "@/components/ui/ThemedText";

export const WidgetUserWatchlist = ({
  style,
} : React.ComponentPropsWithoutRef<typeof View>) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const { data: watchlist } = useUserWatchlistQuery({
    userId: user?.id,
    filters: {
      order: 'random',
      limit: 6,
    }
  })

  if (!user) return null;

  if (!watchlist || !watchlist.length) return null;

  return (
  <View style={[tw`gap-2`, style]}>
    <Link href={'/collection/watchlist'} asChild>
      <ThemedText style={tw`p-0 font-semibold text-xl`}>{t('widgets.user_watchlist.label')}</ThemedText>
    </Link>
    <FlatList
    data={watchlist}
    renderItem={({ item }) => (
      <View key={item.media_id} style={tw`flex-0.5`}>
        <CardMedia media={item.media!} />
      </View>
    )}
    numColumns={2}
    columnWrapperStyle={tw`gap-1`}
    ItemSeparatorComponent={() => <View style={tw`h-1`} />}
    nestedScrollEnabled
    />
  </View>
  )
};
