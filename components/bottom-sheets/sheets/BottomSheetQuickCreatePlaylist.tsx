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

interface BottomSheetQuickCreatePlaylistProps extends Omit<React.ComponentPropsWithoutRef<typeof BottomSheetModal>, 'children'> {
  id: string;
  onConfirm: (playlistName: string) => void;
  placeholder?: string | null;
}

const BottomSheetQuickCreatePlaylist = React.forwardRef<
	React.ElementRef<typeof BottomSheetModal>,
	BottomSheetQuickCreatePlaylistProps
>(({ id, onConfirm, placeholder, snapPoints, ...props }, ref) => {
  const { closeSheet } = useBottomSheetStore();
  const { inset } = useTheme();
  const { t } = useTranslation();
  const [playlistName, setPlaylistName] = React.useState('');

  const handleConfirm = () => {
    try {
      if (placeholder || playlistName.length > 0) {
        onConfirm(playlistName.length > 0 ? playlistName : placeholder!);
        closeSheet(id);
      }
    } catch (error) {
      Burnt.toast({
        title: upperFirst(t('common.errors.an_error_occurred')),
        preset: 'error',
      });
    }
  }
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
        onPress={handleConfirm}
        >
          <ButtonText>{upperFirst(t('common.messages.create'))}</ButtonText>
        </Button>
      </BottomSheetView>
    </BottomSheetModal>
  );
});
BottomSheetQuickCreatePlaylist.displayName = 'BottomSheetQuickCreatePlaylist';

export default BottomSheetQuickCreatePlaylist;