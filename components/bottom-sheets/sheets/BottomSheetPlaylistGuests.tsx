import React from 'react';
import tw from '@/lib/tw';
import { useTheme } from '@/providers/ThemeProvider';
import { ThemedText } from '@/components/ui/ThemedText';
import { Json, Playlist, User } from '@/types/type.db';
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { upperFirst } from 'lodash';
import { usePlaylistGuests } from '@/features/playlist/playlistQueries';
import Fuse from 'fuse.js';
import { Button } from '@/components/ui/Button';
import { MinusCircleIcon } from 'lucide-react-native';
import { Icons } from '@/constants/Icons';
import { CardUser } from '@/components/cards/CardUser';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import { useSupabaseClient } from '@/providers/SupabaseProvider';
import * as Burnt from 'burnt';
import { PostgrestError } from '@supabase/supabase-js';
import { useAuth } from '@/providers/AuthProvider';
import { useQueryClient } from '@tanstack/react-query';
import { playlistKeys } from '@/features/playlist/playlistKeys';
import BottomSheetPlaylistGuestsAdd from './BottomSheetPlaylistGuestsAdd';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import ThemedTrueSheet from '@/components/ui/ThemedTrueSheet';
import { BetterInput } from '@/components/ui/BetterInput';
import { BottomSheetProps } from '../BottomSheetManager';
import { useTranslations } from 'use-intl';

interface BottomSheetPlaylistGuestsProps extends BottomSheetProps {
  playlist: Playlist;
}

const BottomSheetPlaylistGuests = React.forwardRef<
  React.ComponentRef<typeof TrueSheet>,
  BottomSheetPlaylistGuestsProps
>(({ id, playlist, sizes, ...props }, ref) => {
  const supabase = useSupabaseClient();
  const { colors } = useTheme();
  const { closeSheet } = useBottomSheetStore();
  const t = useTranslations();
  const { user: loggedUser } = useAuth();
  const queryClient = useQueryClient();
  const {
    data: guestsRequest,
    isLoading,
    isRefetching,
    refetch,
  } = usePlaylistGuests(playlist.id);
  const loading = isLoading || guestsRequest === undefined;

  const [guests, setGuests] = React.useState<{ user: User, edit: boolean }[] | undefined>(undefined);
    React.useEffect(() => {
      setGuests(guestsRequest?.map((guest) => ({
        user: guest.user,
        edit: guest.edit,
      })));
  }, [guestsRequest]);
  // REFs
  const BottomSheetPlaylistGuestsAddRef = React.useRef<TrueSheet>(null);

  const hasChanges = React.useMemo(() => {
    if (!guestsRequest || !guests) return false;
    if (guestsRequest.length !== guests.length) return true;
    return guestsRequest.some((initial, index) => {
      const current = guests[index];
      return (
        initial.user.id !== current.user.id ||
        initial.edit !== current.edit
      );
    });
  }, [guestsRequest, guests]);

  /* --------------------------------- SEARCH --------------------------------- */
  const [search, setSearch] = React.useState('');
  const [filteredGuests, setFilteredGuests] = React.useState<typeof guests>([]);
  const fuse = React.useMemo(() => {
    return new Fuse(guests || [], {
      keys: ['user.username', 'user.full_name'],
      threshold: 0.5,
    });
  }, [guests]);
  React.useEffect(() => {
    if (search.length > 0) {
      setFilteredGuests(fuse?.search(search).map(({ item }) => item));
    } else {
      setFilteredGuests(guests);
    }
  }, [search, guests, fuse]);
  /* -------------------------------------------------------------------------- */

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .rpc('playlist_guests_update', {
          p_playlist_id: playlist.id,
          p_guests: guests?.map((guest) => ({
            user_id: guest.user.id,
            edit: guest.edit,
          })) as Json,
        })
      if (error) throw error;
      queryClient.invalidateQueries({
        queryKey: playlistKeys.guests(playlist.id),
      })
      Burnt.toast({
        title: upperFirst(t('common.messages.saved', { gender: 'male', count: 1 })),
        preset: 'done',
      });
      await closeSheet(id);
    } catch (error) {
      if (error instanceof PostgrestError) {
        Burnt.toast({
          title: upperFirst(t('common.messages.error')),
          message: error.message,
          preset: 'error',
          haptic: 'error',
        });
      } else {
        Burnt.toast({
          title: upperFirst(t('common.messages.error')),
          message: upperFirst(t('common.messages.an_error_occurred')),
          preset: 'error',
          haptic: 'error',
        });
      }
    }
  };

  const handleRemoveGuest = async (userId: string) => {
    setGuests((prev) => {
      if (!prev) return [];
      const newGuests = prev.filter((guest) => guest.user.id !== userId);
      return newGuests;
    });
  };

  const handleAddGuest = async (user: User) => {
    setGuests((prev) => {
      if (!prev) return [];
      const newGuests = [...prev, { user, edit: false }];
      return newGuests;
    });
  };

  return (
    <ThemedTrueSheet
    ref={ref}
    sizes={['large']}
    contentContainerStyle={tw`gap-4 items-center justify-center mx-2`}
    {...props}
    >
      <View style={tw`flex-row items-center justify-between w-full`}>
        <TouchableOpacity
        onPress={() => {
          if (hasChanges) {
            Alert.alert(
              upperFirst(t('common.messages.cancel')),
              upperFirst(t('pages.playlist.actions.edit_guests.modal.cancel_without_saving')),
              [
                {
                  text: upperFirst(t('common.messages.cancel')),
                  style: 'cancel',
                },
                {
                  text: upperFirst(t('common.messages.ignore')),
                  onPress: () => closeSheet(id),
                  style: 'destructive',
                }
              ]
            )
          } else {
            closeSheet(id)
          }
        }}
        style={tw`flex-1`}
        >
          <ThemedText>{upperFirst(t('common.messages.cancel'))}</ThemedText>
        </TouchableOpacity>
        <ThemedText style={tw`flex-1 text-center font-bold`}>
          {upperFirst(t('pages.playlist.actions.edit_guests.label'))}
        </ThemedText>
        <TouchableOpacity
        onPress={handleSave}
        disabled={!hasChanges}
        style={[{ opacity: hasChanges ? 1 : 0.5}, tw`flex-1`]}
        >
          <ThemedText style={tw`text-right`}>{upperFirst(t('common.messages.save'))}</ThemedText>
        </TouchableOpacity>
      </View>
      <View style={tw`flex-1 w-full gap-2`}>
        <View style={tw`flex-row items-center justify-between gap-2`}>
          <BetterInput
          variant='outline'
          defaultValue={search}
          onChangeText={setSearch}
          placeholder={upperFirst(t('common.messages.search_guest'))}
          leftIcon='search'
          clearable
          />
          <TouchableOpacity
          onPress={() => BottomSheetPlaylistGuestsAddRef.current?.present()}
          >
            <Icons.Add color={colors.foreground} />
          </TouchableOpacity>
        </View>
        <View style={tw`flex-1`}>
          <FlatList
          data={filteredGuests}
          renderItem={({ item: { user, edit } }) => (
            <View
            key={playlist.id}
            style={tw`flex-row items-center justify-between gap-4 py-2`}
            >
                <TouchableOpacity onPress={() => handleRemoveGuest(user.id)}>
                  <MinusCircleIcon color={colors.foreground} />
                </TouchableOpacity>
                <CardUser
                user={user}
                style={tw`border-0 bg-transparent h-auto`}
                containerStyle={tw`flex-1`}
                linked={false}
                />
                <Button
                disabled={!loggedUser?.premium}
                variant={edit ? 'accent-yellow' : 'outline'}
                onPress={() => {
                  setGuests((prev) => {
                    if (!prev) return [];
                    const newGuests = prev.map((guest) => {
                      if (guest.user.id === user.id) {
                        return { ...guest, edit: !edit };
                      }
                      return guest;
                    });
                    return newGuests;
                  });
                }}
                >
                  Edit
                </Button>
            </View>
          )}
          ListEmptyComponent={() => (
            loading ? (
              <Icons.Loader />
            ) : (
              <View style={tw`flex-1 items-center justify-center`}>
                <Text style={{ color: colors.mutedForeground }}>{upperFirst(t('common.messages.no_results'))}</Text>
              </View>
            )
          )}
          keyExtractor={(item) => item.user.id.toString()}
          showsVerticalScrollIndicator={false}
          refreshing={isRefetching}
          // onRefresh={refetch}
          />
        </View>
      </View>
      <BottomSheetPlaylistGuestsAdd
      ref={BottomSheetPlaylistGuestsAddRef}
      id={`${id}-add-guests`}
      playlistId={playlist.id}
      guests={guests}
      onAdd={handleAddGuest}
      onRemove={handleRemoveGuest}
      />
    </ThemedTrueSheet>
  );
});
BottomSheetPlaylistGuests.displayName = 'BottomSheetPlaylistGuests';

export default BottomSheetPlaylistGuests;