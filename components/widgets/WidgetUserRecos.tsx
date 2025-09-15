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
import { useCallback, useMemo } from "react";
import { MediaMovie, MediaTvSeries, UserRecosAggregated } from "@recomendapp/types";
import { CardMovie } from "../cards/CardMovie";
import { CardTvSeries } from "../cards/CardTvSeries";

interface WidgetUserRecosProps extends React.ComponentPropsWithoutRef<typeof View> {
  labelStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

const SendersAvatars = ({ 
  senders, 
  sendersShow = 3 
}: { 
  senders: UserRecosAggregated['senders']; 
  sendersShow?: number; 
}) => {
  const { colors } = useTheme();

  const visibleSenders = useMemo(() => 
    senders?.slice(0, sendersShow) || [], 
    [senders, sendersShow]
  );

  const remainingCount = useMemo(() => 
    (senders?.length || 0) - sendersShow, 
    [senders?.length, sendersShow]
  );

  return (
    <View style={tw`flex-row -gap-2 overflow-hidden`}>
      {visibleSenders.map(({ user: sender }) => (
        <UserAvatar
          key={sender.id}
          full_name={sender?.full_name ?? ''}
          avatar_url={sender?.avatar_url ?? ''}
          style={tw`w-4 h-4`}
        />
      ))}
      {remainingCount > 0 && (
        <ThemedView style={tw`h-4 flex items-center justify-center rounded-full`}>
          <Text style={[{ color: colors.mutedForeground }, tw`text-xs`]}>
            +{remainingCount}
          </Text>
        </ThemedView>
      )}
    </View>
  );
};
SendersAvatars.displayName = 'SendersAvatars';

const RecoItem = ({ 
  item, 
  sendersShow 
}: { 
  item: UserRecosAggregated; 
  sendersShow: number; 
}) => {
  const sendersContent = useMemo(() => (
    <SendersAvatars senders={item.senders} sendersShow={sendersShow} />
  ), [item.senders, sendersShow]);

  if (item.type === 'movie') {
    return (
      <CardMovie movie={item.media as MediaMovie}>
        {sendersContent}
      </CardMovie>
    );
  }

  if (item.type === 'tv_series') {
    return (
      <CardTvSeries tvSeries={item.media as MediaTvSeries}>
        {sendersContent}
      </CardTvSeries>
    );
  }

  return null;
};
RecoItem.displayName = 'RecoItem';

const WidgetHeader = ({ 
  labelStyle 
}: { 
  labelStyle?: StyleProp<TextStyle>; 
}) => {
  const { colors } = useTheme();
  const t = useTranslations();
  return (
    <Link href="/collection/my-recos" style={labelStyle}>
      <View style={tw`flex-row items-center`}>
        <ThemedText style={tw`font-semibold text-xl`} numberOfLines={1}>
          {upperFirst(t('common.messages.reco_by_your_friends'))}
        </ThemedText>
        <Icons.ChevronRight color={colors.mutedForeground} />
      </View>
    </Link>
  );
};
WidgetHeader.displayName = 'WidgetHeader';

export const WidgetUserRecos = ({
  style,
  labelStyle,
  containerStyle
}: WidgetUserRecosProps) => {
  const { session } = useAuth();
  const { data: recos } = useUserRecosQuery({
    userId: session?.user.id,
    filters: {
      sortBy: 'random',
      limit: 6,
    }
  });

  const sendersShow = 3;

  const renderItem = useCallback(({ item }: { item: UserRecosAggregated }) => (
    <RecoItem item={item} sendersShow={sendersShow} />
  ), [sendersShow]);

  const keyExtractor = useCallback((item: UserRecosAggregated) => 
    item.media_id?.toString() || '', 
    []
  );

  const ItemSeparatorComponent = useCallback(() => 
    <View style={tw`h-1`} />, 
    []
  );

  if (!recos?.length) {
    return null;
  }

  return (
    <View style={[tw`gap-2`, style]}>
      <WidgetHeader labelStyle={labelStyle} />
      <LegendList
      data={recos}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={2}
      columnWrapperStyle={tw`gap-1`}
      contentContainerStyle={containerStyle}
      ItemSeparatorComponent={ItemSeparatorComponent}
      nestedScrollEnabled
      />
    </View>
  );
};
WidgetUserRecos.displayName = 'WidgetUserRecos';
