import React from 'react';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import tw from '@/lib/tw';
import { useTheme } from '@/context/ThemeProvider';
import { ThemedText } from '@/components/ui/ThemedText';
import { Json, Playlist, User } from '@/types/type.db';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { upperFirst } from 'lodash';
import { useTranslation } from 'react-i18next';
import { usePlaylistGuests } from '@/features/playlist/playlistQueries';
import { Input } from '@/components/ui/Input';
import Fuse from 'fuse.js';
import { Button, ButtonText } from '@/components/ui/Button';
import { MinusCircleIcon } from 'lucide-react-native';
import { Icons } from '@/constants/Icons';
import { CardUser } from '@/components/cards/CardUser';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import { useSupabaseClient } from '@/context/SupabaseProvider';
import * as Burnt from 'burnt';
import { PostgrestError } from '@supabase/supabase-js';
import { useAuth } from '@/context/AuthProvider';
import { useQueryClient } from '@tanstack/react-query';
import { playlistKeys } from '@/features/playlist/playlistKeys';

interface BottomSheetPlaylistGuestsProps extends Omit<React.ComponentPropsWithoutRef<typeof BottomSheetModal>, 'children'> {
  id: string;
  playlist: Playlist;
}

const BottomSheetPlaylistGuests = React.forwardRef<
  React.ElementRef<typeof BottomSheetModal>,
  BottomSheetPlaylistGuestsProps
>(({ id, playlist, snapPoints, ...props }, ref) => {
  const supabase = useSupabaseClient();
  const { colors, inset } = useTheme();
  const { closeSheet, createConfirmSheet } = useBottomSheetStore();
  const { t } = useTranslation();
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
    if (!guests) return null;
    return new Fuse(guests, {
      keys: ['user.username', 'user.full_name'],
      threshold: 0.3,
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
        title: upperFirst(t('common.word.saved')),
        preset: 'done',
      });
      closeSheet(id);
    } catch (error) {
      if (error instanceof PostgrestError) {
        Burnt.toast({
          title: upperFirst(t('common.messages.error')),
          message: error.message,
          preset: 'error',
        });
      } else {
        Burnt.toast({
          title: upperFirst(t('common.messages.error')),
          message: upperFirst(t('common.errors.an_error_occurred')),
          preset: 'error',
        });
      }
    }
  }

  const handleRemoveGuest = async (userId: string) => {
    setGuests((prev) => {
      if (!prev) return [];
      const newGuests = prev.filter((guest) => guest.user.id !== userId);
      return newGuests;
    });
  }

  return (
    <BottomSheetModal
    ref={ref}
    snapPoints={['90%']}
    enableDynamicSizing={false}
    {...props}
    >
      <BottomSheetView
      style={[
        { paddingBottom: inset.bottom },
        tw`flex-1 gap-4 items-center justify-center mx-2`,
      ]}
      >
        <View style={tw`flex-row items-center justify-between w-full`}>
          <TouchableOpacity
          onPress={() => {
            if (hasChanges) {
              createConfirmSheet({
                title: 'Abandonner les modifications ?',
                description: 'Si vous revenez en arrière maintenant, vous perdrez vos modifications.',
                cancelLabel: 'Ignorer',
                confirmLabel: 'Poursuivre la modification',
                onCancel: () => {
                  closeSheet(id);
                }
              })
            } else {
              closeSheet(id)
            }
          }}
          >
            <ThemedText>{upperFirst(t('common.word.cancel'))}</ThemedText>
          </TouchableOpacity>
          <ThemedText style={tw`font-bold`}>
           {upperFirst(t('common.playlist.actions.edit_guests'))}
          </ThemedText>
          <TouchableOpacity
          onPress={handleSave}
          disabled={!hasChanges}
          style={{ opacity: hasChanges ? 1 : 0.5}}
          >
            <ThemedText>{upperFirst(t('common.word.save'))}</ThemedText>
          </TouchableOpacity>
        </View>
        <View style={tw`flex-1 w-full gap-2`}>
          <View style={tw`flex-row items-center justify-between gap-2`}>
            <Input
            defaultValue={search}
            onChangeText={setSearch}
            placeholder={upperFirst(t('common.messages.search_guest'))}
            style={tw`flex-1`}
            />
            <TouchableOpacity
            onPress={() => console.log('add')}
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
                  onPress={() => {
                    console.log('user', user);
                  }}
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
                    <ButtonText variant={edit ? 'accent-yellow' : 'outline'}>
                      Edit
                    </ButtonText>
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
            onRefresh={refetch}
            />
          </View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});
BottomSheetPlaylistGuests.displayName = 'BottomSheetPlaylistGuests';

export default BottomSheetPlaylistGuests;