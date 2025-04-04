import React from 'react';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import tw from '@/lib/tw';
import { useTheme } from '@/context/ThemeProvider';
import { ThemedText } from '@/components/ui/ThemedText';
import { InputBottomSheet } from '@/components/ui/Input';
import { upperFirst } from 'lodash';
import { useTranslation } from 'react-i18next';
import { Button, ButtonText } from '@/components/ui/Button';
import * as Burnt from 'burnt';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import { usePlaylistInsertMutation } from '@/features/playlist/playlistMutations';
import { useAuth } from '@/context/AuthProvider';
import { Playlist } from '@/types/type.db';

interface BottomSheetPlaylistCreateProps extends Omit<React.ComponentPropsWithoutRef<typeof BottomSheetModal>, 'children'> {
  id: string;
  onCreate?: (playlist: Playlist) => void;
  placeholder?: string | null;
}

const BottomSheetPlaylistCreate = React.forwardRef<
	React.ElementRef<typeof BottomSheetModal>,
	BottomSheetPlaylistCreateProps
>(({ id, onCreate, placeholder, snapPoints, ...props }, ref) => {
  const { user } = useAuth();
  const { closeSheet } = useBottomSheetStore();
  const { inset } = useTheme();
  const { t } = useTranslation();
  const [playlistName, setPlaylistName] = React.useState('');
  const createPlaylistMutation = usePlaylistInsertMutation({
    userId: user?.id,
  });
  const handleCreatePlaylist = async (name: string) => {
      await createPlaylistMutation.mutateAsync({
        title: name,
      }, {
        onSuccess: (playlist) => {
          Burnt.toast({
            title: upperFirst(t('common.messages.added')),
            preset: 'done',
          });
          onCreate && onCreate(playlist);
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

  return (
    <BottomSheetModal
    ref={ref}
    {...props}
    >
      <BottomSheetView
      style={[
        { paddingBottom: inset.bottom },
        tw`flex-1 gap-4 items-center justify-center mx-2`,
      ]}
      >
        <ThemedText style={tw`text-lg font-bold`}>Donner un nom à la playlist</ThemedText>
        <InputBottomSheet
        placeholder={placeholder ?? upperFirst(t('common.playlist.actions.create'))}
        defaultValue={playlistName}
        onChangeText={setPlaylistName}
        style={tw`w-full`}
        />
        <Button
        onPress={() => handleCreatePlaylist(playlistName.length > 0 ? playlistName : placeholder!)}
        >
          <ButtonText>{upperFirst(t('common.messages.create'))}</ButtonText>
        </Button>
      </BottomSheetView>
    </BottomSheetModal>
  );
});
BottomSheetPlaylistCreate.displayName = 'BottomSheetPlaylistCreate';

export default BottomSheetPlaylistCreate;