import { useAuth } from "@/context/AuthProvider";
import { useUserDiscoveryInfinite } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";
import { FlatList, Text, View } from "react-native";
import { CardMedia } from "@/components/cards/CardMedia";
import UserAvatar from "@/components/user/UserAvatar";
import { useTheme } from "@/context/ThemeProvider";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { CardUser } from "../cards/CardUser";

export const WidgetUserDiscovery = ({
  style,
} : React.ComponentPropsWithoutRef<typeof View>) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

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
	  <ThemedText style={tw`p-0 font-semibold text-xl`}>{t('widgets.user_discovery.label')}</ThemedText>
    <FlatList
    data={users.pages.flat()}
    renderItem={({ item }) => (
		<View key={item.id} style={tw`max-h-24`}>
			<CardUser key={item.id} user={item} style={tw`h-full w-48`}/>
		</View>
    )}
    horizontal
    showsHorizontalScrollIndicator={false}
    onEndReached={() => hasNextPage && fetchNextPage()}
    onEndReachedThreshold={0.2}
    ItemSeparatorComponent={() => <View style={tw`w-1`} />}
    nestedScrollEnabled
    />
  </View>
  )
};
