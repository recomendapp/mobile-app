import { useAuth } from "@/context/AuthProvider";
import { useUserFeedInfiniteQuery } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
import { useTheme } from "@/context/ThemeProvider";
import { ThemedText } from "@/components/ui/ThemedText";
import { CardUserActivity } from "../cards/CardUserActivity";

export const WidgetUserFeed = ({
  style,
} : React.ComponentPropsWithoutRef<typeof View>) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
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
    <Link href={'/feed'} asChild>
      <ThemedText style={tw`p-0 w-fit font-semibold text-xl`}>{t('widgets.user_feed.label')}</ThemedText>
    </Link>
    <FlatList
    data={feed.pages.flat()}
    renderItem={({ item }) => (
      <CardUserActivity key={item.media_id} activity={item} style={tw`max-h-36 w-86`}/>
    )}
    horizontal
    onEndReached={() => hasNextPage && fetchNextPage()}
    onEndReachedThreshold={0.2}
    showsHorizontalScrollIndicator={false}
    ItemSeparatorComponent={() => <View style={tw`w-1`} />}
    nestedScrollEnabled
    />
  </View>
  )
};
