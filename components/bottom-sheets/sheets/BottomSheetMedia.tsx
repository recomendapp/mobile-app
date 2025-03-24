import React, { forwardRef, Fragment, useMemo } from 'react';
import { BottomSheetModal, BottomSheetView, TouchableOpacity } from '@gorhom/bottom-sheet';
import tw from '@/lib/tw';
import { useTranslation } from 'react-i18next';
import { Icons } from '@/constants/Icons';
import { Media } from '@/types/type.db';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinkProps, useRouter } from 'expo-router';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeProvider';
import { ThemedText } from '@/components/ui/ThemedText';
import { upperFirst } from 'lodash';
import useBottomSheetStore from '@/stores/useBottomSheetStore';

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
  const { closeSheet } = useBottomSheetStore();
  const { colors } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const inset = useSafeAreaInsets();
  const items: Item[][] = useMemo(() => ([
    [
      ...additionalItemsTop,
    ],
    [
			{
				icon: Icons.Movie,
				onPress: () => router.push(media?.url as LinkProps['href']),
				label: upperFirst(t('common.messages.go_to_film')),
			},
      {
				icon: Icons.AddPlaylist,
        onPress: () => {},
				// onClick: () => openModal(ModalPlaylistAdd, { mediaId: media.media_id!, mediaTitle: mediaDetails.title }),
				label: upperFirst(t('common.messages.add_to_playlist')),
			},
			{
				icon: Icons.Reco,
        onPress: () => {},
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
        <ThemedText style={tw`text-center text-xl font-bold`}>{media?.title}</ThemedText>
        {items.map((group, i) => (
          <Fragment key={i}>
            {group.map((item, j) => (
              <TouchableOpacity
              key={j}
              onPress={() => {
                item.onPress();
                console.log('closeSheet', id);
                closeSheet(id);
              }}
              style={tw`flex-row items-center gap-2 p-4`}
              >
                <item.icon color={colors.foreground} size={24} />
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