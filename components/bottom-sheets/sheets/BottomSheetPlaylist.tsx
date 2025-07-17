import React from 'react';
import tw from '@/lib/tw';
import { useTranslation } from 'react-i18next';
import { Icons } from '@/constants/Icons';
import { Playlist } from '@/types/type.db';
import { usePathname, useRouter } from 'expo-router';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { ThemedText } from '@/components/ui/ThemedText';
import { upperFirst } from 'lodash';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { ImageWithFallback } from '@/components/utils/ImageWithFallback';
import { useAuth } from '@/providers/AuthProvider';
import { usePlaylistDeleteMutation } from '@/features/playlist/playlistMutations';
import * as Burnt from 'burnt';
import BottomSheetPlaylistEdit from './BottomSheetPlaylistEdit';
import { useUserPlaylistSavedQuery } from '@/features/user/userQueries';
import { useUserPlaylistSavedDeleteMutation, useUserPlaylistSavedInsertMutation } from '@/features/user/userMutations';
import BottomSheetPlaylistGuests from './BottomSheetPlaylistGuests';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import ThemedTrueSheet from '@/components/ui/ThemedTrueSheet';
import { ScrollView } from 'react-native-gesture-handler';

interface BottomSheetPlaylistProps extends Omit<React.ComponentPropsWithoutRef<typeof TrueSheet>, 'children'> {
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

const BottomSheetPlaylist = React.forwardRef<
  React.ComponentRef<typeof TrueSheet>,
  BottomSheetPlaylistProps
>(({ id, playlist, additionalItemsTop = [], ...props }, ref) => {
  const { user } = useAuth();
  const { closeSheet, openSheet } = useBottomSheetStore();
  const { colors, inset } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  // REFs
  const scrollRef = React.useRef<ScrollView>(null);
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

  const items: Item[][] = React.useMemo(() => {
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
            onPress: async () => {
              await openSheet(BottomSheetPlaylistEdit, {
                playlist: playlist,
              })
            },
            label: upperFirst(t('common.messages.edit')),
          },
          {
            icon: Icons.Users,
            onPress: async () => await openSheet(BottomSheetPlaylistGuests, {
              playlist: playlist,
            }),
            label: upperFirst(t('common.messages.guest', { context: 'male', count: 2 })),
          },
          {
            icon: Icons.Delete,
            onPress: async () => {
              Alert.alert(
                upperFirst(t('common.messages.are_u_sure')),
                upperFirst(t('common.playlist.actions.delete.description', { title: playlist.title })),
                [
                  {
                    text: upperFirst(t('common.word.cancel')),
                    style: 'cancel',
                  },
                  {
                    text: upperFirst(t('common.word.delete')),
                    onPress: async () => {
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
                    style: 'destructive',
                  }
                ]
              )
            },
            label: upperFirst(t('common.word.delete')),
            closeSheet: false,
          }
        ] : []),
      ]
    ]
  }, [playlist, user, saved, additionalItemsTop, colors, t, router, closeSheet, id, playlistDeleteMutation, insertPlaylistSaved, deletePlaylistSaved]);
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
      </View>
      {items.map((group, i) => (
        <React.Fragment key={i}>
          {group.map((item, j) => (
            <TouchableOpacity
            key={j}
            onPress={() => {
              (item.closeSheet === undefined || item.closeSheet === true) && closeSheet(id);
              item.onPress();
            }}
            style={[tw`flex-row items-center gap-2 p-4`, { opacity: item.disabled ? 0.5 : 1 }]}
            disabled={item.disabled}
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
BottomSheetPlaylist.displayName = 'BottomSheetPlaylist';

export default BottomSheetPlaylist;