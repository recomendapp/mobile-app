import React, { forwardRef, Fragment, useMemo } from 'react';
import { BottomSheetModal, BottomSheetView, TouchableOpacity } from '@gorhom/bottom-sheet';
import tw from '@/lib/tw';
import { useTranslation } from 'react-i18next';
import { Icons } from '@/constants/Icons';
import { Playlist } from '@/types/type.db';
import { usePathname, useRouter } from 'expo-router';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeProvider';
import { ThemedText } from '@/components/ui/ThemedText';
import { upperFirst } from 'lodash';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import { Text, View } from 'react-native';
import { ImageWithFallback } from '@/components/utils/ImageWithFallback';
import { useAuth } from '@/context/AuthProvider';
import { usePlaylistDeleteMutation } from '@/features/playlist/playlistMutations';
import * as Burnt from 'burnt';
import BottomSheetPlaylistEdit from './BottomSheetPlaylistEdit';
import { useUserPlaylistSavedQuery } from '@/features/user/userQueries';
import { useUserPlaylistSavedDeleteMutation, useUserPlaylistSavedInsertMutation } from '@/features/user/userMutations';
import BottomSheetPlaylistGuests from './BottomSheetPlaylistGuests';

interface BottomSheetPlaylistProps extends Omit<React.ComponentPropsWithoutRef<typeof BottomSheetModal>, 'children'> {
  id: string;
  playlist: Playlist,
  additionalItemsTop?: Item[];
};

interface Item {
	icon: LucideIcon;
	label: string;
	onPress: () => void | Promise<void>;
	submenu?: Item[];
  closeSheet?: boolean;
  disabled?: boolean;
}

const BottomSheetPlaylist = forwardRef<
  React.ElementRef<typeof BottomSheetModal>,
  BottomSheetPlaylistProps
>(({ id, playlist, additionalItemsTop = [], snapPoints, ...props }, ref) => {
  const { user } = useAuth();
  const { closeSheet, openSheet, createConfirmSheet } = useBottomSheetStore();
  const { colors, inset } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const {
		data: saved,
		isLoading: isLoadingSaved,
	} = useUserPlaylistSavedQuery({
		userId: user?.id,
		playlistId: playlist.id,
	});
	const insertPlaylistSaved = useUserPlaylistSavedInsertMutation();
	const deletePlaylistSaved = useUserPlaylistSavedDeleteMutation();

  const playlistDeleteMutation = usePlaylistDeleteMutation({
    userId: user?.id,
  });

  const items: Item[][] = useMemo(() => {
    return [
      [
        ...additionalItemsTop,
      ],
      [
        ...(user?.id && playlist.user?.id !== user.id ? [
          {
            icon: saved
              ? Icons.Check
              : Icons.Add,
            onPress: async () => {
              if (saved) {
                await deletePlaylistSaved.mutateAsync({
                  savedId: saved.id,
                }, {
                  onError: () => {
                    Burnt.toast({
                      title: upperFirst(t('common.messages.error')),
                      message: upperFirst(t('common.errors.an_error_occurred')),
                      preset: 'error',
                    });
                  }
                });
              } else {
                await insertPlaylistSaved.mutateAsync({
                  playlistId: playlist.id,
                }, {
                  onError: () => {
                    Burnt.toast({
                      title: upperFirst(t('common.messages.error')),
                      message: upperFirst(t('common.errors.an_error_occurred')),
                      preset: 'error',
                    });
                  }
                });

              }
            },
            label: saved ? upperFirst(t('common.messages.remove_from_library')) : upperFirst(t('common.messages.save_to_library')),
            closeSheet: false,
            disabled: isLoadingSaved,
          }
        ] : []),
        {
          icon: Icons.Playlist,
          onPress: () => router.push(`/playlist/${playlist.id}`),
          label: upperFirst(t('common.messages.go_to_playlist')),
        },
        {
          icon: Icons.user,
          onPress: () => router.push(`/user/${playlist.user?.username}`),
          label: upperFirst(t('common.messages.go_to_user')),
        },
        ...(user?.id === playlist.user?.id ? [
          {
            icon: Icons.Edit,
            onPress: () => {
              openSheet(BottomSheetPlaylistEdit, {
                playlist: playlist,
                onEdit: async (playlist) => {
                  console.log('onEdit', playlist);
                },
              })
            },
            label: upperFirst(t('common.messages.edit')),
          },
          {
            icon: Icons.Users,
            onPress: () => openSheet(BottomSheetPlaylistGuests, {
              playlist: playlist,
            }),
            label: upperFirst(t('common.messages.guest', { context: 'male', count: 2 })),
          },
          {
            icon: Icons.Delete,
            onPress: () => {
              createConfirmSheet({
                title: upperFirst(t('common.messages.are_u_sure')),
                description: upperFirst(t('common.playlist.actions.delete.description', { title: playlist.title })),
                onConfirm: async () => {
                  await playlistDeleteMutation.mutateAsync(
                    { playlistId: playlist.id },
                    {
                      onSuccess: () => {
                        Burnt.toast({
                          title: upperFirst(t('common.word.deleted')),
                          preset: 'done',
                        });
                        if (pathname.startsWith(`/playlist/${playlist.id}`)) {
                          router.replace('/collection');
                        }
                        closeSheet(id);
                      },
                      onError: () => {
                        Burnt.toast({
                          title: upperFirst(t('common.errors.an_error_occurred')),
                          preset: 'error',
                        });
                      },
                    }
                  );
                },
              })
            },
            label: upperFirst(t('common.word.delete')),
            closeSheet: false,
          }
        ] : []),
      ]
    ]
  }, [playlist, user, saved, additionalItemsTop, colors, t, router, closeSheet, id, createConfirmSheet, playlistDeleteMutation, insertPlaylistSaved, deletePlaylistSaved]);
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
            <ThemedText numberOfLines={2} style={tw`shrink`}>{playlist.title}</ThemedText>
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
              onPress={async () => {
                await item.onPress();
                (item.closeSheet === undefined || item.closeSheet === true) && closeSheet(id);
              }}
              style={[tw`flex-row items-center gap-2 p-4`, { opacity: item.disabled ? 0.5 : 1 }]}
              disabled={item.disabled}
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