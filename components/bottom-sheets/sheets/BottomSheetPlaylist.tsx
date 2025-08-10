import React from 'react';
import tw from '@/lib/tw';
import { Icons } from '@/constants/Icons';
import { Playlist } from '@/types/type.db';
import { usePathname, useRouter } from 'expo-router';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { upperFirst } from 'lodash';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import { Alert, View } from 'react-native';
import { ImageWithFallback } from '@/components/utils/ImageWithFallback';
import { useAuth } from '@/providers/AuthProvider';
import { usePlaylistDeleteMutation } from '@/features/playlist/playlistMutations';
import * as Burnt from 'burnt';
import { useUserPlaylistSavedQuery } from '@/features/user/userQueries';
import { useUserPlaylistSavedDeleteMutation, useUserPlaylistSavedInsertMutation } from '@/features/user/userMutations';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import ThemedTrueSheet from '@/components/ui/ThemedTrueSheet';
import { ScrollView } from 'react-native-gesture-handler';
import { BottomSheetProps } from '../BottomSheetManager';
import { useTranslations } from 'use-intl';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/text';
import richTextToPlainString from '@/utils/richTextToPlainString';

interface BottomSheetPlaylistProps extends BottomSheetProps {
  playlist: Playlist,
  additionalItemsTop?: Item[];
};

interface Item {
	icon: LucideIcon;
	label: string;
	onPress: () => void;
	submenu?: Item[];
  closeSheet?: boolean;
  disabled?: boolean;
}

const BottomSheetPlaylist = React.forwardRef<
  React.ComponentRef<typeof TrueSheet>,
  BottomSheetPlaylistProps
>(({ id, playlist, additionalItemsTop = [], ...props }, ref) => {
  const { user } = useAuth();
  const openSheet = useBottomSheetStore((state) => state.openSheet);
  const closeSheet = useBottomSheetStore((state) => state.closeSheet);
  const { colors, inset } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();
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
                      message: upperFirst(t('common.messages.an_error_occurred')),
                      preset: 'error',
                      haptic: 'error',
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
                      message: upperFirst(t('common.messages.an_error_occurred')),
                      preset: 'error',
                      haptic: 'error',
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
          disabled: pathname.startsWith(`/playlist/${playlist.id}`),
        },
        {
          icon: Icons.User,
          onPress: () => router.push(`/user/${playlist.user?.username}`),
          label: upperFirst(t('common.messages.go_to_user')),
        },
        ...(user?.id === playlist.user?.id ? [
          {
            icon: Icons.Users,
            onPress: () => router.push(`/playlist/${playlist.id}/edit/guests`),
            label: upperFirst(t('common.messages.guest', { gender: 'male', count: 2 })),
          },
          {
            icon: Icons.settings,
            onPress: () => router.push(`/playlist/${playlist.id}/edit`),
            label: upperFirst(t('common.messages.setting', { count: 2 })),
          },
          {
            icon: Icons.Delete,
            onPress: async () => {
              Alert.alert(
                upperFirst(t('common.messages.are_u_sure')),
                upperFirst(richTextToPlainString(t.rich('pages.playlist.actions.delete.description', { title: playlist.title, important: (chunk) => `"${chunk}"` }))),
                [
                  {
                    text: upperFirst(t('common.messages.cancel')),
                    style: 'cancel',
                  },
                  {
                    text: upperFirst(t('common.messages.delete')),
                    onPress: async () => {
                      await playlistDeleteMutation.mutateAsync(
                        { id: playlist.id },
                        {
                          onSuccess: () => {
                            Burnt.toast({
                              title: upperFirst(t('common.messages.deleted')),
                              preset: 'done',
                            });
                            if (pathname.startsWith(`/playlist/${playlist.id}`)) {
                              router.replace('/collection');
                            }
                            closeSheet(id);
                          },
                          onError: () => {
                            Burnt.toast({
                              title: upperFirst(t('common.messages.an_error_occurred')),
                              preset: 'error',
                              haptic: 'error',
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
            label: upperFirst(t('common.messages.delete')),
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
          type={"playlist"}
          />
          <View style={tw`shrink`}>
            <Text numberOfLines={2} style={tw`shrink`}>{playlist.title}</Text>
            <Text textColor='muted' numberOfLines={1} style={tw`shrink`}>
              {t('common.messages.by_name', { name: playlist.user?.username! })}
            </Text>
          </View>
        </View>
      </View>
      {items.map((group, i) => (
        <React.Fragment key={i}>
          {group.map((item, j) => (
            <Button
            key={j}
            variant='ghost'
            icon={item.icon}
            iconProps={{
              color: colors.mutedForeground,
            }}
            disabled={item.disabled}
            style={tw`justify-start h-auto py-4`}
            onPress={() => {
              (item.closeSheet === undefined || item.closeSheet === true) && closeSheet(id);
              item.onPress();
            }}
            >
              {item.label}
            </Button>
          ))}
        </React.Fragment>
      ))}
    </ScrollView>
  </ThemedTrueSheet>
  );
});
BottomSheetPlaylist.displayName = 'BottomSheetPlaylist';

export default BottomSheetPlaylist;