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
}

const BottomSheetMedia = React.forwardRef<
  React.ComponentRef<typeof TrueSheet>,
  BottomSheetMediaProps
>(({ id, media, additionalItemsTop = [], additionalItemsBottom = [], ...props }, ref) => {
  const { closeSheet, openSheet } = useBottomSheetStore();
  const { colors, inset } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
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
    <ThemedTrueSheet ref={ref} {...props}>
      <View
      style={[
        { borderColor: colors.mutedForeground },
        tw`flex-row items-center gap-2 border-b p-4`,
      ]}
      >
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
      {items.map((group, i) => (
        <React.Fragment key={i}>
          {group.map((item, j) => (
            <TouchableOpacity
            key={j}
            onPress={async () => {
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
    </ThemedTrueSheet>
  );
});
BottomSheetMedia.displayName = 'BottomSheetMedia';

export default BottomSheetMedia;