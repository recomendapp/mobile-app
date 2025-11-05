import tw from "@/lib/tw";
import { StyleProp, TextStyle, View, ViewStyle } from "react-native";
import { LegendList } from "@legendapp/list";
import { useTranslations } from "use-intl";
import { upperFirst } from "lodash";
import { useCallback, useMemo } from "react";
import { Database } from "@recomendapp/types";
import { useWidgetMostPopular } from "@/features/widget/widgetQueries";
import { CardMovie } from "../cards/CardMovie";
import { CardTvSeries } from "../cards/CardTvSeries";
import { GAP, WIDTH_CARD_XS } from "@/theme/globals";
import { Text } from "../ui/text";

interface WidgetMostPopularProps extends React.ComponentPropsWithoutRef<typeof View> {
  labelStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

export const WidgetMostPopular = ({
  style,
  labelStyle,
  containerStyle,
}: WidgetMostPopularProps) => {
  const t = useTranslations();
  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
   } = useWidgetMostPopular();
  const medias = useMemo(() => data?.pages.flat() || [], [data]);

  const renderItem = useCallback(({ item }: { item: Database['public']['Functions']['get_widget_most_popular']['Returns'][number] }) => {
    switch (item.type) {
      case 'movie':
        return <CardMovie variant="poster" movie={item.media} style={{ width: WIDTH_CARD_XS }} />;
      case 'tv_series':
        return <CardTvSeries variant="poster" tvSeries={item.media} style={{ width: WIDTH_CARD_XS }} />;
      default:
        return null;
    }
  }, []);

  const keyExtractor = useCallback((item: Database['public']['Functions']['get_widget_most_popular']['Returns'][number]) => 
    `${item.type}-${item.media_id}`, 
    []
  );
  const onEndReached = useCallback(() => {
    if (hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage]);

  const ItemSeparatorComponent = useCallback(() => 
    <View style={{ width: GAP }} />, 
    []
  );

  if (!medias.length) {
    return null;
  }

  return (
    <View style={[tw`flex-1 gap-2`, style]}>
      <Text style={[tw`font-semibold text-xl`, labelStyle]}>
        {upperFirst(t('common.messages.most_popular', { count: 2 }))}
      </Text>
      <LegendList
        data={medias}
        renderItem={renderItem}
        snapToInterval={WIDTH_CARD_XS + GAP}
        decelerationRate="fast"
        keyExtractor={keyExtractor}
        onEndReached={onEndReached}
        horizontal
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={ItemSeparatorComponent}
        contentContainerStyle={containerStyle}
        nestedScrollEnabled
      />
    </View>
  );
};
WidgetMostPopular.displayName = 'WidgetMostPopular';
