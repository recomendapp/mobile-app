import tw from "@/lib/tw";
import { StyleProp, TextStyle, View, ViewStyle } from "react-native";
import { LegendList } from "@legendapp/list";
import { useTranslations } from "use-intl";
import { upperFirst } from "lodash";
import { CardMovie } from "../cards/CardMovie";
import { CardTvSeries } from "../cards/CardTvSeries";
import { GAP, WIDTH_CARD_XS } from "@/theme/globals";
import { Text } from "../ui/text";
import { useWidgetMostPopularQuery } from "@/api/widgets/widgetQueries";

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

  // Queries
  const {
    data,
    hasNextPage,
    fetchNextPage,
  } = useWidgetMostPopularQuery();
  const medias = data?.pages.flat() || [];

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
        renderItem={({ item }) => (
          item.type === 'movie'
            ? <CardMovie variant="poster" movie={item.media} style={{ width: WIDTH_CARD_XS }} />
          : item.type === 'tv_series'
            ? <CardTvSeries variant="poster" tvSeries={item.media} style={{ width: WIDTH_CARD_XS }} />
          : null
        )}
        snapToInterval={WIDTH_CARD_XS + GAP}
        decelerationRate="fast"
        keyExtractor={(item) =>  `${item.type}-${item.media_id}`}
        onEndReached={() => hasNextPage && fetchNextPage()}
        horizontal
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
        contentContainerStyle={containerStyle}
        nestedScrollEnabled
      />
    </View>
  );
};
WidgetMostPopular.displayName = 'WidgetMostPopular';
