import React from 'react';
import tw from '@/lib/tw';
import { useTranslation } from 'react-i18next';
import { Icons } from '@/constants/Icons';
import { UserActivity } from '@/types/type.db';
import { LinkProps, useRouter } from 'expo-router';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { ThemedText } from '@/components/ui/ThemedText';
import { upperFirst } from 'lodash';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import { Text, TouchableOpacity, View } from 'react-native';
import { ImageWithFallback } from '@/components/utils/ImageWithFallback';
import BottomSheetSendReco from './BottomSheetSendReco';
import BottomSheetAddToPlaylist from './BottomSheetAddToPlaylist';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import ThemedTrueSheet from '@/components/ui/ThemedTrueSheet';
import { ScrollView } from 'react-native-gesture-handler';

interface BottomSheetUserActivityProps extends Omit<React.ComponentPropsWithoutRef<typeof TrueSheet>, 'children'> {
  id: string;
  activity: UserActivity,
  additionalItemsTop?: Item[];
  additionalItemsBottom?: Item[];
};

interface Item {
	icon: LucideIcon;
	label: string;
	onPress: () => void;
	submenu?: Item[];
}

const BottomSheetUserActivity = React.forwardRef<
  React.ComponentRef<typeof TrueSheet>,
  BottomSheetUserActivityProps
>(({ id, activity: { media, ...activity}, additionalItemsTop = [], additionalItemsBottom = [], ...props }, ref) => {
  const { closeSheet, openSheet } = useBottomSheetStore();
  const { colors, inset } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  // REFs
  const scrollRef = React.useRef<ScrollView>(null);
  const items: Item[][] = React.useMemo(() => ([
    [
      ...additionalItemsTop,
    ],
    [
      {
        icon: Icons.Feed,
        onPress: () => router.push(`/user/${activity.user?.username}`),
        label: upperFirst(t('common.messages.go_to_activity')),
      },
			{
				icon: Icons.Movie,
				onPress: () => router.push(media?.url as LinkProps['href']),
        label: media?.media_type === 'movie'
          ? upperFirst(t('common.messages.go_to_film'))
          : media?.media_type === 'tv_series'
          ? upperFirst(t('common.messages.go_to_serie'))
          : media?.media_type === 'person'
          ? upperFirst(t('common.messages.go_to_person'))
          : upperFirst(t('common.messages.go_to_media')),
			},
      {
				icon: Icons.AddPlaylist,
        onPress: async () => await openSheet(BottomSheetAddToPlaylist, {
          media: media!,
        }),
				label: upperFirst(t('common.messages.add_to_playlist')),
			},
			{
				icon: Icons.Reco,
        onPress: async () => await openSheet(BottomSheetSendReco, {
          media: media!,
        }),
				label: upperFirst(t('common.messages.send_to_friend')),
			}
    ],
    [
      ...additionalItemsBottom,
    ],
  ]), [media]);

  return (
    <ThemedTrueSheet
    ref={ref}
    scrollRef={scrollRef as React.RefObject<React.Component<unknown, {}, any>>}
    contentContainerStyle={tw`p-0`}
    {...props}
    >
      <ScrollView
      ref={scrollRef}
      bounces={false}
      contentContainerStyle={{ paddingBottom: inset.bottom }}
      stickyHeaderIndices={[0]}
      >
        <View
        style={[
          { backgroundColor: colors.muted, borderColor: colors.mutedForeground },
          tw`border-b p-4`,
        ]}
        >
          <View style={tw`flex-row items-center gap-2 `}>
            <ImageWithFallback
            alt={media?.title ?? ''}
            source={{ uri: media?.avatar_url ?? '' }}
            style={[
              { aspectRatio: 2 / 3, height: 'fit-content' },
              tw.style('rounded-md w-12'),
            ]}
            />
            <View style={tw`shrink`}>
              <ThemedText numberOfLines={2} style={tw`shrink`}>{media?.title}</ThemedText>
              <Text numberOfLines={1} style={[{ color: colors.mutedForeground }, tw`shrink`]}>
                {media?.main_credit?.map((director) => director.title).join(', ')}
              </Text>
            </View>
          </View>
        </View>
        {items.map((group, i) => (
          <React.Fragment key={i}>
            {group.map((item, j) => (
              <TouchableOpacity
              key={j}
              onPress={() => {
                closeSheet(id);
                item.onPress();
              }}
              style={tw`flex-row items-center gap-2 p-4`}
              >
                <item.icon color={colors.mutedForeground} size={20} />
                <ThemedText>{item.label}</ThemedText>
              </TouchableOpacity>
            ))}
          </React.Fragment>
        ))}
      </ScrollView>
    </ThemedTrueSheet>
  );
});
BottomSheetUserActivity.displayName = 'BottomSheetUserActivity';

export default BottomSheetUserActivity;