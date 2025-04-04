import React, { forwardRef, Fragment, useMemo } from 'react';
import { BottomSheetModal, BottomSheetView, TouchableOpacity } from '@gorhom/bottom-sheet';
import tw from '@/lib/tw';
import { useTranslation } from 'react-i18next';
import { Icons } from '@/constants/Icons';
import { Playlist } from '@/types/type.db';
import { useRouter } from 'expo-router';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeProvider';
import { ThemedText } from '@/components/ui/ThemedText';
import { upperFirst } from 'lodash';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import { Text, View } from 'react-native';
import { ImageWithFallback } from '@/components/utils/ImageWithFallback';
import { useAuth } from '@/context/AuthProvider';

interface BottomSheetPlaylistProps extends Omit<React.ComponentPropsWithoutRef<typeof BottomSheetModal>, 'children'> {
  id: string;
  playlist: Playlist,
  additionalItemsTop?: Item[];
  additionalItemsBottom?: Item[];
};

interface Item {
	icon: LucideIcon;
	label: string;
	onPress: () => void;
	submenu?: Item[];
}

const BottomSheetPlaylist = forwardRef<
  React.ElementRef<typeof BottomSheetModal>,
  BottomSheetPlaylistProps
>(({ id, playlist, additionalItemsTop = [], additionalItemsBottom = [], snapPoints, ...props }, ref) => {
  const { user } = useAuth();
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
				icon: Icons.Playlist,
				onPress: () => router.push(`/playlist/${playlist.id}`),
        label: upperFirst(t('common.messages.go_to_playlist')),
			},
    ],
    [
      ...additionalItemsBottom,
    ],
  ]), [playlist, user]);
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
          alt={playlist.title ?? ''}
          source={{ uri: playlist.poster_url ?? '' }}
          style={[
            { aspectRatio: 1 / 1, height: 'fit-content' },
            tw.style('rounded-md w-12'),
          ]}
          />
          <View style={tw`shrink`}>
            <ThemedText numberOfLines={2} style={tw`shrink font-bold`}>{playlist.title}</ThemedText>
            <Text numberOfLines={1} style={[{ color: colors.mutedForeground }, tw`shrink`]}>
              {t('common.messages.by_name', { name: playlist.user?.username })}
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
BottomSheetPlaylist.displayName = 'BottomSheetPlaylist';

export default BottomSheetPlaylist;