import { useAuth } from "@/providers/AuthProvider";
import { useUserRecosQuery } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleProp, Text, TextStyle, View, ViewStyle } from "react-native";
import { CardMedia } from "@/components/cards/CardMedia";
import UserAvatar from "@/components/user/UserAvatar";
import { useTheme } from "@/providers/ThemeProvider";
import { ThemedView } from "@/components/ui/ThemedView";
import { LegendList } from "@legendapp/list";

interface WidgetUserRecosProps extends React.ComponentPropsWithoutRef<typeof View> {
  labelStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

export const WidgetUserRecos = ({
  style,
  labelStyle,
  containerStyle
}: WidgetUserRecosProps) => {
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
    <Link href={'/collection/my-recos'} style={[tw`font-semibold text-xl`, { color: colors.foreground }, labelStyle]}>
      {t('widgets.user_recos.label')}
    </Link>
    <LegendList
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
    keyExtractor={(item) => item.media_id!.toString()}
    numColumns={2}
    columnWrapperStyle={tw`gap-1`}
    contentContainerStyle={containerStyle}
    ItemSeparatorComponent={() => <View style={tw`h-1`} />}
    nestedScrollEnabled
    />
  </View>
  )
};
