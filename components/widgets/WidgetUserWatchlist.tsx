import { useAuth } from "@/providers/AuthProvider";
import { useUserWatchlistQuery } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { Link } from "expo-router";
import { StyleProp, TextStyle, View, ViewStyle } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { LegendList } from "@legendapp/list";
import { ThemedText } from "../ui/ThemedText";
import { Icons } from "@/constants/Icons";
import { useTranslations } from "use-intl";
import { upperFirst } from "lodash";
import { CardMovie } from "../cards/CardMovie";
import { MediaMovie, MediaTvSeries } from "@/types/type.db";
import { CardTvSeries } from "../cards/CardTvSeries";

interface WidgetUserWatchlistProps extends React.ComponentPropsWithoutRef<typeof View> {
  labelStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

export const WidgetUserWatchlist = ({
  style,
  labelStyle,
  containerStyle,
} : WidgetUserWatchlistProps) => {
  const { colors } = useTheme();
  const t = useTranslations();
  const { user } = useAuth();
  const { data: watchlist } = useUserWatchlistQuery({
    userId: user?.id,
    filters: {
      sortBy: 'random',
      limit: 6,
    }
  })

  if (!user) return null;

  if (!watchlist || !watchlist.length) return null;

  return (
  <View style={[tw`gap-2`, style]}>
    <Link href={'/collection/watchlist'} style={labelStyle}>
      <View style={tw`flex-row items-center`}>
        <ThemedText style={tw`font-semibold text-xl`} numberOfLines={1}>
          {upperFirst(t('common.messages.to_watch'))}
        </ThemedText>
        <Icons.ChevronRight color={colors.mutedForeground} />
      </View>
    </Link>
    <LegendList
    data={watchlist}
    renderItem={({ item }) => (
      item.type === 'movie' ? (
        <CardMovie movie={item.media as MediaMovie} />
      ) : item.type === 'tv_series' && (
        <CardTvSeries tvSeries={item.media as MediaTvSeries} />
      )
    )}
    keyExtractor={(item) => item.media_id!.toString()}
    numColumns={2}
    columnWrapperStyle={tw`gap-1`}
    contentContainerStyle={containerStyle}
    ItemSeparatorComponent={() => <View style={tw`h-1`} />}
    nestedScrollEnabled
    />
  </View>
  )
};
