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
import { MediaMovie, MediaTvSeries, UserWatchlist } from "@recomendapp/types";
import { CardTvSeries } from "../cards/CardTvSeries";
import { useCallback } from "react";

interface WidgetUserWatchlistProps extends React.ComponentPropsWithoutRef<typeof View> {
  labelStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

const WatchlistItem = ({ item }: { item: UserWatchlist }) => {
  if (item.type === 'movie') {
    return <CardMovie movie={item.media as MediaMovie} />;
  }
  
  if (item.type === 'tv_series') {
    return <CardTvSeries tvSeries={item.media as MediaTvSeries} />;
  }
  
  return null;
};
WatchlistItem.displayName = 'WatchlistItem';

const WidgetHeader = ({ 
  labelStyle 
}: { 
  labelStyle?: StyleProp<TextStyle>; 
}) => {
  const { colors } = useTheme();
  const t = useTranslations();

  return (
    <Link href="/collection/watchlist" style={labelStyle}>
      <View style={tw`flex-row items-center`}>
        <ThemedText style={tw`font-semibold text-xl`} numberOfLines={1}>
          {upperFirst(t('common.messages.to_watch'))}
        </ThemedText>
        <Icons.ChevronRight color={colors.mutedForeground} />
      </View>
    </Link>
  );
};

export const WidgetUserWatchlist = ({
  style,
  labelStyle,
  containerStyle,
}: WidgetUserWatchlistProps) => {
  const { session } = useAuth();
  const { data: watchlist } = useUserWatchlistQuery({
    userId: session?.user.id,
    filters: {
      sortBy: 'random',
      limit: 6,
    }
  });

  const renderItem = useCallback(({ item }: { item: UserWatchlist }) => (
    <WatchlistItem item={item} />
  ), []);

  const keyExtractor = useCallback((item: UserWatchlist) => 
    item.media_id?.toString() || '', 
    []
  );

  const ItemSeparatorComponent = useCallback(() => 
    <View style={tw`h-1`} />, 
    []
  );

  if (!watchlist?.length) {
    return null;
  }

  return (
    <View style={[tw`gap-2`, style]}>
      <WidgetHeader labelStyle={labelStyle} />
      <LegendList
        data={watchlist}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={2}
        columnWrapperStyle={tw`gap-1`}
        contentContainerStyle={containerStyle}
        ItemSeparatorComponent={ItemSeparatorComponent}
        nestedScrollEnabled
      />
    </View>
  );
};
WidgetUserWatchlist.displayName = 'WidgetUserWatchlist';
