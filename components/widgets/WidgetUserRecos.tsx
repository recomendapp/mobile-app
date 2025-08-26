import { useAuth } from "@/providers/AuthProvider";
import { useUserRecosQuery } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { Link } from "expo-router";
import { StyleProp, Text, TextStyle, View, ViewStyle } from "react-native";
import UserAvatar from "@/components/user/UserAvatar";
import { useTheme } from "@/providers/ThemeProvider";
import { ThemedView } from "@/components/ui/ThemedView";
import { LegendList } from "@legendapp/list";
import { Icons } from "@/constants/Icons";
import { ThemedText } from "../ui/ThemedText";
import { useTranslations } from "use-intl";
import { upperFirst } from "lodash";
import { useCallback } from "react";
import { MediaMovie, MediaTvSeries, UserRecosAggregated } from "@recomendapp/types";
import { CardMovie } from "../cards/CardMovie";
import { CardTvSeries } from "../cards/CardTvSeries";

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
  const t = useTranslations();
  const { user } = useAuth();
  const { data: recos } = useUserRecosQuery({
    userId: user?.id,
    filters: {
      sortBy: 'random',
      limit: 6,
    }
  })

  const sendersShow = 3;

  // Renders
  const renderContent = useCallback((item: UserRecosAggregated) => {
    return (
      <View style={tw`flex-row -gap-2 overflow-hidden`}>
          {item.senders?.slice(0, sendersShow).map(({ user: sender }, index) => (
            <UserAvatar
              key={index}
              full_name={sender?.full_name ?? ''}
              avatar_url={sender?.avatar_url ?? ''}
              style={tw`w-4 h-4`}
            />
          ))}
          {item.senders?.length! > sendersShow ? (
            <ThemedView style={tw`h-4 flex items-center justify-center rounded-full`}>
              <Text style={[{ color: colors.mutedForeground }, tw`text-xs`]}>+{item.senders?.length! - sendersShow}</Text>
            </ThemedView>
          ) : null}
        </View>
    )
  }, [colors.mutedForeground, sendersShow, t])

  if (!user) return null;

  if (!recos || !recos.length) return null;

  return (
  <View style={[tw`gap-2`, style]}>
    <Link href={'/collection/my-recos'} style={labelStyle}>
      <View style={tw`flex-row items-center`}>
        <ThemedText style={tw`font-semibold text-xl`} numberOfLines={1}>
          {upperFirst(t('common.messages.reco_by_your_friends'))}
        </ThemedText>
        <Icons.ChevronRight color={colors.mutedForeground} />
      </View>
    </Link>
    <LegendList
    data={recos}
    renderItem={({ item }) => (
      item.type === 'movie' ? (
        <CardMovie movie={item.media as MediaMovie}>
          {renderContent(item)}
        </CardMovie>
      ) : item.type === 'tv_series' && (
        <CardTvSeries tvSeries={item.media as MediaTvSeries}>
          {renderContent(item)}
        </CardTvSeries>
      )
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
