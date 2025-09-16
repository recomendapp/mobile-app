import { useUserDiscoveryInfinite } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { StyleProp, TextStyle, View, ViewStyle } from "react-native";
import { ThemedText } from "@/components/ui/ThemedText";
import { CardUser } from "../cards/CardUser";
import { LegendList } from "@legendapp/list";
import { useTranslations } from "use-intl";
import { upperFirst } from "lodash";
import { useCallback, useMemo } from "react";
import { Profile } from "@recomendapp/types";

interface WidgetUserDiscoveryProps extends React.ComponentPropsWithoutRef<typeof View> {
  labelStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

export const WidgetUserDiscovery = ({
  style,
  labelStyle,
  containerStyle
} : WidgetUserDiscoveryProps) => {
  const t = useTranslations();
  const {
    data: users,
    fetchNextPage,
    hasNextPage,
  } = useUserDiscoveryInfinite({
    filters: {
      resultsPerPage: 20,
      order: 'created_at-desc',
    }
  });

  const userData = useMemo(() => users?.pages.flat() || [], [users]);

  const renderItem = useCallback(({ item }: { item: Profile }) => (
    <View style={tw`max-h-24`}>
      <CardUser user={item} style={tw`h-full w-48`} />
    </View>
  ), []);

  const keyExtractor = useCallback((item: Profile) => 
    item.id!.toString(), 
    []
  );

  const onEndReached = useCallback(() => {
    if (hasNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage]);

  const ItemSeparatorComponent = useCallback(() => 
    <View style={tw`w-2`} />, 
    []
  );

  if (!userData.length) {
    return null;
  }

  return (
    <View style={[tw`gap-2`, style]}>
      <ThemedText style={[tw`font-semibold text-xl`, labelStyle]}>
        {upperFirst(t('common.messages.discover_users'))}
      </ThemedText>
      <LegendList
        data={userData}
        renderItem={renderItem}
        snapToInterval={200}
        decelerationRate="fast"
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.2}
        ItemSeparatorComponent={ItemSeparatorComponent}
        contentContainerStyle={containerStyle}
        nestedScrollEnabled
      />
    </View>
  );
};
WidgetUserDiscovery.displayName = 'WidgetUserDiscovery';
