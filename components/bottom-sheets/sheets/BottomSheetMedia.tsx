import React, { forwardRef, Fragment, useMemo } from 'react';
import { BottomSheetModal, BottomSheetView, TouchableOpacity } from '@gorhom/bottom-sheet';
import tw from '@/lib/tw';
import { useTranslation } from 'react-i18next';
import { Icons } from '@/constants/Icons';
import { Media } from '@/types/type.db';
import { LinkProps, useRouter } from 'expo-router';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeProvider';
import { ThemedText } from '@/components/ui/ThemedText';
import { upperFirst } from 'lodash';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import { Text, View } from 'react-native';
import { ImageWithFallback } from '@/components/utils/ImageWithFallback';
import BottomSheetSendReco from './BottomSheetSendReco';

interface BottomSheetMediaProps extends Omit<React.ComponentPropsWithoutRef<typeof BottomSheetModal>, 'children'> {
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

const BottomSheetMedia = forwardRef<
  React.ElementRef<typeof BottomSheetModal>,
  BottomSheetMediaProps
>(({ id, media, additionalItemsTop = [], additionalItemsBottom = [], snapPoints, ...props }, ref) => {
  const { closeSheet, openSheet } = useBottomSheetStore();
  const { colors, inset } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const items: Item[][] = useMemo(() => ([
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
        onPress: () => {},
				// onClick: () => openModal(ModalPlaylistAdd, { mediaId: media.media_id!, mediaTitle: mediaDetails.title }),
				label: upperFirst(t('common.messages.add_to_playlist')),
			},
			{
				icon: Icons.Reco,
        onPress: () => openSheet(BottomSheetSendReco, {
          media: media!,
        }),
				// onClick: () => openModal(ModalRecoSend, { mediaId: media.media_id!, mediaTitle: mediaDetails.title }),
				label: upperFirst(t('common.messages.send_to_friend')),
			}
    ],
    [
      ...additionalItemsBottom,
    ],
  ]), [media]);
  return (
    <BottomSheetModal
    ref={ref}
    {...props}
    >
      <BottomSheetView
      style={[
        { paddingBottom: inset.bottom },
        tw`flex-1`,
      ]}
      >
        <View
        style={[
          { borderColor: colors.muted },
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
            <ThemedText numberOfLines={2} style={tw`shrink font-bold`}>{media?.title}</ThemedText>
            <Text numberOfLines={1} style={[{ color: colors.mutedForeground }, tw`shrink`]}>
              {media?.main_credit?.map((director) => director.title).join(', ')}
            </Text>
          </View>
        </View>
        {items.map((group, i) => (
          <Fragment key={i}>
            {group.map((item, j) => (
              <TouchableOpacity
              key={j}
              onPress={() => {
                item.onPress();
                closeSheet(id);
              }}
              style={tw`flex-row items-center gap-2 p-4`}
              >
                <item.icon color={colors.mutedForeground} size={20} />
                <ThemedText>{item.label}</ThemedText>
              </TouchableOpacity>
            ))}
          </Fragment>
        ))}
      </BottomSheetView>
    </BottomSheetModal>
  );
});
BottomSheetMedia.displayName = 'BottomSheetMedia';

export default BottomSheetMedia;