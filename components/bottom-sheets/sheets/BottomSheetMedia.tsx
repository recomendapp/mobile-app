import React from 'react';
import tw from '@/lib/tw';
import { useTranslation } from 'react-i18next';
import { Icons } from '@/constants/Icons';
import { Media } from '@/types/type.db';
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
import BottomSheetDefaultView from '../templates/BottomSheetDefaultView';
import { ScrollView } from 'react-native-gesture-handler';

interface BottomSheetMediaProps extends Omit<React.ComponentPropsWithoutRef<typeof TrueSheet>, 'children'> {
  id: string;
  media?: Media,
  additionalItemsTop?: Item[];
  additionalItemsBottom?: Item[];
};

interface Item {
	icon: LucideIcon;
	label: string;
	onPress: () => void;
	submenu?: Item[];
  closeOnPress?: boolean;
}

const BottomSheetMedia = React.forwardRef<
  React.ComponentRef<typeof TrueSheet>,
  BottomSheetMediaProps
>(({ id, media, additionalItemsTop = [], additionalItemsBottom = [], ...props }, ref) => {
  const { closeSheet, openSheet } = useBottomSheetStore();
  const { colors, inset } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  // REFs
  const scrollRef = React.useRef<ScrollView>(null);
  const BottomSheetMainCreditsRef = React.useRef<TrueSheet>(null);
  // States
  const items: Item[][] = React.useMemo(() => ([
    [
      ...additionalItemsTop,
    ],
    [
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
      ...(((media?.media_type === 'movie' || media?.media_type === 'tv_series') && media.main_credit && media.main_credit.length > 0) ? [
        media.main_credit.length > 1 ? {
          icon: Icons.Users,
          onPress: () => BottomSheetMainCreditsRef.current?.present(),
          label: upperFirst(t(
            media.media_type === 'movie' ? 'common.messages.show_director_other' : 'common.messages.show_creator_other',
            {
              count: media.main_credit.length,
            }
          )),
          closeOnPress: false,
        } : {
          icon: Icons.user,
          onPress: () => router.push(media.main_credit![0].url as LinkProps['href']),
          label: upperFirst(t(
            media.media_type === 'movie' ? 'common.messages.go_to_director' : 'common.messages.go_to_creator',
            {
              context: media.main_credit![0].extra_data.gender === 1 ? 'female' : 'male',
              count: 1,
            }
          ))
        },
      ] : []),
      {
				icon: Icons.AddPlaylist,
        onPress: () => openSheet(BottomSheetAddToPlaylist, {
          media: media!,
        }),
				label: upperFirst(t('common.messages.add_to_playlist')),
			},
			{
				icon: Icons.Reco,
        onPress: () => openSheet(BottomSheetSendReco, {
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
                {(media?.media_type === 'movie' || media?.media_type === 'tv_series') ? (
                  media?.main_credit?.map((director) => director.title).join(', ')
                ) : media?.media_type === 'person' ? (
                  media.extra_data.known_for_department
                ) : null}
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
                (item.closeOnPress || item.closeOnPress === undefined) && closeSheet(id);
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
      <BottomSheetDefaultView
      ref={BottomSheetMainCreditsRef}
      id={`${id}-credits`}
      content={
        <View>
          <ThemedText>ok</ThemedText>
        </View>
      }
      />
    </ThemedTrueSheet>
  );
});
BottomSheetMedia.displayName = 'BottomSheetMedia';

export default BottomSheetMedia;