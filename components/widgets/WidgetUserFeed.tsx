import { useAuth } from "@/context/AuthProvider";
import { useUserFeedInfiniteQuery } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
import { useTheme } from "@/context/ThemeProvider";
import { ThemedText } from "@/components/ui/ThemedText";

const WIDGET_USER_FEED_LIMIT = 4;

export const WidgetUserFeed = ({
  style,
} : React.ComponentPropsWithoutRef<typeof View>) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();

  const { data: feed } = useUserFeedInfiniteQuery({
    userId: user?.id,
  })

  if (!user || !feed || !feed.pages[0]?.length) return null;

  return (
  <View style={[tw`gap-2`, style]}>
    <Link href={'/feed'} asChild>
      <ThemedText style={tw`p-0 w-fit font-semibold text-xl`}>{t('widgets.user_feed.label')}</ThemedText>
    </Link>
    <FlatList
    data={feed.pages.flat().slice(0, WIDGET_USER_FEED_LIMIT)}
    renderItem={({ item }) => (
      <View key={item.media_id} style={tw`flex-0.5`}>
        {/* <CardUserActivity key={index} activity={item} /> */}
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
