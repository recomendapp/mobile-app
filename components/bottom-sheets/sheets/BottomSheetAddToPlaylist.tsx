import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import { BottomSheetModal, BottomSheetView, TouchableOpacity } from '@gorhom/bottom-sheet';
import tw from '@/lib/tw';
import { useTranslation } from 'react-i18next';
import { Icons } from '@/constants/Icons';
import { Media, Playlist } from '@/types/type.db';
import { useTheme } from '@/context/ThemeProvider';
import { ThemedText } from '@/components/ui/ThemedText';
import { upperFirst } from 'lodash';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import { FlatList, Text, TouchableWithoutFeedback, View } from 'react-native';
import { useUserAddMediaToPlaylistQuery } from '@/features/user/userQueries';
import { useAuth } from '@/context/AuthProvider';
import Fuse from "fuse.js";
import { InputBottomSheet } from '@/components/ui/Input';
import { Button, ButtonText } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ImageWithFallback } from '@/components/utils/ImageWithFallback';
import { useAddMediaToPlaylists, usePlaylistInsertMutation } from '@/features/playlist/playlistMutations';
import * as Burnt from 'burnt';
import { useQueryClient } from '@tanstack/react-query';
import { userKeys } from '@/features/user/userKeys';
import BottomSheetQuickCreatePlaylist from './BottomSheetQuickCreatePlaylist';

interface BottomSheetAddToPlaylistProps extends Omit<React.ComponentPropsWithoutRef<typeof BottomSheetModal>, 'children'> {
  id: string;
  media: Media,
};

const COMMENT_MAX_LENGTH = 180;

const BottomSheetAddToPlaylist = forwardRef<
  React.ElementRef<typeof BottomSheetModal>,
  BottomSheetAddToPlaylistProps
>(({ id, media, snapPoints, ...props }, ref) => {
  const { colors, inset } = useTheme();
  const { user } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { closeSheet, openSheet } = useBottomSheetStore();
  const {
		data: playlists,
    isRefetching,
    refetch,
	} = useUserAddMediaToPlaylistQuery({
		userId: user?.id,
		mediaId: media.media_id!,
    type: 'personal',
	});
	const addToPlaylistMutation = useAddMediaToPlaylists({
    userId: user?.id,
    mediaId: media.media_id!,
  });
  const createPlaylistMutation = usePlaylistInsertMutation({
    userId: user?.id,
  })

  const [search, setSearch] = useState('');
  const fuse = useMemo(() => {
    if (!playlists) return null;
    return new Fuse(playlists, {
      keys: ['playlist.title'],
      threshold: 0.3,
    });
	}, [playlists]);
  const [results, setResults] = useState<typeof playlists>([]);
  const [selected, setSelected] = useState<Playlist[]>([]);
  const [comment, setComment] = useState('');

  const submit = async () => {
    if (!user || !media.media_id) return;
		addToPlaylistMutation.mutate({
			playlists: selected,
      comment: comment,
		}, {
			onSuccess: () => {
        Burnt.toast({
          title: upperFirst(t('common.messages.added')),
          preset: 'done',
        })
				closeSheet(id);
			},
			onError: () => {	
        Burnt.toast({
          title: upperFirst(t('common.errors.an_error_occurred')),
          preset: 'error',
        })
			}
		});
  };

  const handleCreatePlaylist = async (playlistName: string) => {
		await createPlaylistMutation.mutateAsync({
			title: playlistName,
		}, {
			onSuccess: (playlist) => {
				queryClient.setQueryData(userKeys.addMediaToPlaylist({
          userId: user?.id!,
					mediaId: media.media_id!,
					type: 'personal',
				}), (prev: { playlist: Playlist; already_added: boolean }[] | undefined) => {
					if (!prev) return [{ playlist, already_added: false }];
					return [
						{ playlist, already_added: false },
						...prev,
					];
				});
				setSelected((prev) => [...prev, playlist]);
			},
			onError: (error: any) => {
				Burnt.toast({
          title: upperFirst(t('common.errors.an_error_occurred')),
          preset: 'error',
        })
			}
		});
	};

  useEffect(() => {
    if (!playlists?.length) return;
    if (search === '') {
      setResults(playlists);
      return;
    }
    setResults(fuse?.search(search).map(({ item }) => item));
	}, [search, playlists, fuse]);

  return (
    <BottomSheetModal
    ref={ref}
    {...props}
    >
      <BottomSheetView
      style={[
        { paddingBottom: inset.bottom },
        tw`flex-1 gap-2 mx-2`,
      ]}
      >
        <View style={tw`gap-2 p-2`}>
          <ThemedText style={tw`font-bold text-center`}>Ajouter à une playlist</ThemedText>
          <View style={tw`h-12 flex-row items-center justify-center overflow-hidden -gap-2`}>
            {selected.length ? selected.map((playlist) => (
              <TouchableOpacity
              key={playlist.id}
              onPress={() => setSelected((prev) => prev.filter(
                (selectedUser) => selectedUser?.id !== playlist.id
              ))}
              >
                <ImageWithFallback
                source={{ uri: playlist.poster_url ?? '' }}
                alt={playlist.title}
                style={tw`rounded-md w-10 h-10`}
                type="playlist"
                />
              </TouchableOpacity>
            )) : (
              <Text style={[{ color: colors.mutedForeground }, tw`text-center`]}>
                Ajouter <Text style={tw`font-bold`}>{media?.title}</Text> à une playlist.
              </Text>
            )}
          </View>
        </View>
        <InputBottomSheet
        defaultValue={search}
        onChangeText={setSearch}
        placeholder={upperFirst(t('common.messages.search_playlist'))}
        />
        <View style={tw`h-64`}>
          <FlatList
          ListHeaderComponent={() => (
            <Button
            variant={'outline'}
            style={tw`w-full`}
            onPress={() => {
              openSheet(BottomSheetQuickCreatePlaylist, {
                onConfirm: handleCreatePlaylist,
                placeholder: media.title,
              })
            }}
            >
              <Icons.Add size={20} color={colors.foreground} style={tw`mr-2`} />
              <ButtonText variant='outline'>{t('common.playlist.actions.create')}</ButtonText>
            </Button>
          )}
          data={results}
          renderItem={({ item: { playlist, already_added } }) => (
            <TouchableWithoutFeedback
            onPress={() => {
              if (selected.some((selectedPlaylist) => selectedPlaylist?.id === playlist?.id)) {
                return setSelected((prev) => prev.filter(
                  (selectedUser) => selectedUser?.id !== playlist?.id
                ))
              }
              return setSelected((prev) => [...prev, playlist]);
            }}
            >
              <View style={tw`flex-row items-center justify-between gap-2 py-2`}>
                <View style={tw`shrink flex-row items-center gap-2`}>
                  <ImageWithFallback
                  source={{ uri: playlist.poster_url ?? '' }}
                  alt={playlist.title}
                  style={tw`rounded-md w-10 h-10`}
                  type="playlist"
                  />
                  <ThemedText style={tw`shrink`} numberOfLines={1}>{playlist.title}</ThemedText>
                </View>
                <View style={tw`flex-row items-center gap-2 shrink-0`}>
                    {already_added && (
                      <Badge variant="destructive">
                        {upperFirst(t('common.messages.already_added'))}
                      </Badge>
                    )}
                    <Icons.Check size={20} style={[{ color: colors.foreground }, tw`${!selected.some((selectedUser) => selectedUser?.id === playlist?.id) ? 'opacity-0' : ''}`]} />
                  </View>
              </View>
            </TouchableWithoutFeedback>
          )}
          showsVerticalScrollIndicator={false}
          refreshing={isRefetching}
          onRefresh={refetch}
          />
        </View>
        <InputBottomSheet
        defaultValue={comment}
        onChangeText={setComment}
        placeholder={upperFirst(t('common.messages.add_comment'))}
        maxLength={COMMENT_MAX_LENGTH}
        />
        <Button disabled={!selected.length} onPress={submit}>
          <ButtonText>{upperFirst(t('common.messages.add'))}</ButtonText>
        </Button>
      </BottomSheetView>
    </BottomSheetModal>
  );
});
BottomSheetAddToPlaylist.displayName = 'BottomSheetAddToPlaylist';

export default BottomSheetAddToPlaylist;