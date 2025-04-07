import React from 'react';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import tw from '@/lib/tw';
import { useTheme } from '@/context/ThemeProvider';
import { ThemedText } from '@/components/ui/ThemedText';
import { Playlist } from '@/types/type.db';
import { View } from 'react-native';
import { upperFirst } from 'lodash';
import { useTranslation } from 'react-i18next';
import { usePlaylistGuests } from '@/features/playlist/playlistQueries';

interface BottomSheetPlaylistGuestsProps extends Omit<React.ComponentPropsWithoutRef<typeof BottomSheetModal>, 'children'> {
  id: string;
  playlist: Playlist;
  onEdit?: (playlist: Playlist) => void | Promise<void>;
}

const BottomSheetPlaylistGuests = React.forwardRef<
  React.ElementRef<typeof BottomSheetModal>,
  BottomSheetPlaylistGuestsProps
>(({ id, playlist, onEdit, snapPoints, ...props }, ref) => {
  const { colors, inset } = useTheme();
  const { t } = useTranslation();
  const {
    data: guests,
    isLoading,
    isError,
    refetch,
  } = usePlaylistGuests(playlist.id);

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
        <ThemedText style={tw`font-bold`}>
          {upperFirst(t('common.playlist.actions.edit_guests'))}
        </ThemedText>
        <View style={tw`flex-1 w-full`}>

        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});
BottomSheetPlaylistGuests.displayName = 'BottomSheetPlaylistGuests';

export default BottomSheetPlaylistGuests;