import { useAuth } from "@/context/AuthProvider";
import { useUserRecosQuery } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";
import { FlatList, Text, View } from "react-native";
import { CardMedia } from "@/components/cards/CardMedia";
import UserAvatar from "@/components/user/UserAvatar";
import { useTheme } from "@/context/ThemeProvider";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";

export const WidgetUserRecos = ({
  style,
} : React.ComponentPropsWithoutRef<typeof View>) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();

  const { data: recos } = useUserRecosQuery({
    userId: user?.id,
    filters: {
      order: 'random',
      limit: 6,
    }
  })

  const sendersShow = 3;

  if (!user) return null;

  if (!recos || !recos.length) return null;

  return (
  <View style={[tw`gap-2`, style]}>
    <Link href={'/collection/my-recos'} asChild>
      <ThemedText style={tw`p-0 font-semibold text-xl`}>{t('widgets.user_recos.label')}</ThemedText>
    </Link>
    <FlatList
    data={recos}
    renderItem={({ item }) => (
      <View key={item.media_id} style={tw`flex-0.5`}>
        <CardMedia media={item.media!}>
          <View style={tw`flex-row -gap-2 overflow-hidden`}>
            {item.senders?.slice(0, sendersShow).map(({ user }, index) => (
            <UserAvatar
              key={index}
              full_name={user?.full_name ?? ''}
              avatar_url={user?.avatar_url ?? ''}
              style={tw`w-4 h-4`}
            />
            ))}
            {item.senders?.length! > sendersShow ? (
              <ThemedView style={tw`h-4 flex items-center justify-center rounded-full`}>
                <Text style={[{ color: colors.mutedForeground }, tw`text-xs`]}>+{item.senders?.length! - sendersShow}</Text>
              </ThemedView>
            ) : null}
          </View>
        </CardMedia>
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
