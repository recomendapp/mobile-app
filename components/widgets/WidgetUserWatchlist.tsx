import { useAuth } from "@/providers/AuthProvider";
import { useUserWatchlistQuery } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleProp, TextStyle, View, ViewStyle } from "react-native";
import { CardMedia } from "@/components/cards/CardMedia";
import { useTheme } from "@/providers/ThemeProvider";
import { LegendList } from "@legendapp/list";

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
    <Link href={'/collection/watchlist'} style={[tw`font-semibold text-xl`, { color: colors.foreground }, labelStyle]}>
      {t('widgets.user_watchlist.label')}
    </Link>
    <LegendList
    data={watchlist}
    renderItem={({ item }) => (
      <View key={item.media_id} style={tw`flex-0.5`}>
        <CardMedia media={item.media!} />
      </View>
    )}
    numColumns={2}
    columnWrapperStyle={tw`gap-1`}
    contentContainerStyle={containerStyle}
    ItemSeparatorComponent={() => <View style={tw`h-1`} />}
    nestedScrollEnabled
    />
  </View>
  )
};
