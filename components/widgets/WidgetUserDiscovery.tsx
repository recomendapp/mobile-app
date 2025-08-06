import { useUserDiscoveryInfinite } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { StyleProp, TextStyle, View, ViewStyle } from "react-native";
import { ThemedText } from "@/components/ui/ThemedText";
import { CardUser } from "../cards/CardUser";
import { LegendList } from "@legendapp/list";
import { useTranslations } from "use-intl";
import { upperFirst } from "lodash";

interface WidgetUserDiscoveryProps extends React.ComponentPropsWithoutRef<typeof View> {
  labelStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

export const WidgetUserDiscovery = ({
  style,
  labelStyle,
  containerStyle
}: WidgetUserDiscoveryProps) => {
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
  })

  if (!users || !users.pages[0].length) return null;

  return (
  <View style={[tw`gap-2`, style]}>
	  <ThemedText style={[tw`font-semibold text-xl`, labelStyle]}>{upperFirst(t('common.messages.discover_users'))}</ThemedText>
    <LegendList
    data={users.pages.flat()}
    renderItem={({ item }) => (
		<View key={item.id} style={tw`max-h-24`}>
			<CardUser key={item.id} user={item} style={tw`h-full w-48`}/>
		</View>
    )}
    snapToInterval={200}
    decelerationRate="fast"
    keyExtractor={(item) => item.id.toString()}
    horizontal
    showsHorizontalScrollIndicator={false}
    onEndReached={() => hasNextPage && fetchNextPage()}
    onEndReachedThreshold={0.2}
    ItemSeparatorComponent={() => <View style={tw`w-2`} />}
    contentContainerStyle={containerStyle}
    nestedScrollEnabled
    />
  </View>
  )
};
