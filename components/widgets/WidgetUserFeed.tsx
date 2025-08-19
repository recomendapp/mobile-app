import { useAuth } from "@/providers/AuthProvider";
import { useUserFeedInfiniteQuery } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { StyleProp, TextStyle, View, ViewStyle } from "react-native";
import { CardUserActivity } from "../cards/CardUserActivity";
import { Link } from "expo-router";
import { useTheme } from "@/providers/ThemeProvider";
import { LegendList } from "@legendapp/list";
import { ThemedText } from "../ui/ThemedText";
import { Icons } from "@/constants/Icons";
import { useTranslations } from "use-intl";
import { upperFirst } from "lodash";

interface WidgetUserFeedProps extends React.ComponentPropsWithoutRef<typeof View> {
  labelStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

export const WidgetUserFeed = ({
  style,
  labelStyle,
  containerStyle
}: WidgetUserFeedProps) => {
  const { colors } = useTheme();
  const t = useTranslations();
  const { user } = useAuth();
  const {
    data: feed,
    fetchNextPage,
    hasNextPage,
  } = useUserFeedInfiniteQuery({
    userId: user?.id,
  })

  if (!user || !feed || !feed.pages[0]?.length) return null;

  return (
  <View style={[tw`gap-2`, style]}>
    <Link href={'/(tabs)/(feed)/feed'} style={labelStyle}>
      <View style={tw`flex-row items-center`}>
        <ThemedText style={tw`font-semibold text-xl`} numberOfLines={1}>
          {upperFirst(t('common.messages.latest_activity', { count: 2 }))}
        </ThemedText>
        <Icons.ChevronRight color={colors.mutedForeground} />
      </View>
    </Link>
    {/* <LegendList
    data={feed.pages.flat()}
    renderItem={({ item }) => (
      <CardUserActivity key={item.media_id} activity={item} style={tw`max-h-36 w-86`}/>
    )}
    snapToInterval={352}
    decelerationRate="fast"
    keyExtractor={(item) => item.id.toString()}
    horizontal
    onEndReached={() => hasNextPage && fetchNextPage()}
    onEndReachedThreshold={0.2}
    showsHorizontalScrollIndicator={false}
    ItemSeparatorComponent={() => <View style={tw`w-2`} />}
    contentContainerStyle={containerStyle}
    nestedScrollEnabled
    /> */}
  </View>
  )
};
