import React, { useMemo, useState } from 'react';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import tw from '@/lib/tw';
import { useTheme } from '@/context/ThemeProvider';
import { ThemedText } from '@/components/ui/ThemedText';
import { upperFirst } from 'lodash';
import { useTranslation } from 'react-i18next';
import { Button, ButtonText } from '@/components/ui/Button';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import { useAuth } from '@/context/AuthProvider';
import { Playlist } from '@/types/type.db';
import * as z from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePlaylistUpdateMutation } from '@/features/playlist/playlistMutations';
import * as Burnt from 'burnt';
import { Text, TouchableOpacity, View } from 'react-native';
import { InputBottomSheet } from '@/components/ui/Input';
import { ImageWithFallback } from '@/components/utils/ImageWithFallback';
import { useActionSheet } from '@expo/react-native-action-sheet';
import * as ImagePicker from 'expo-image-picker';

interface BottomSheetPlaylistEditProps extends Omit<React.ComponentPropsWithoutRef<typeof BottomSheetModal>, 'children'> {
  id: string;
  playlist: Playlist;
  onEdit?: (playlist: Playlist) => void | Promise<void>;
}

const TITLE_MIN_LENGTH = 1;
const TITLE_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 300;

const BottomSheetPlaylistEdit = React.forwardRef<
	React.ElementRef<typeof BottomSheetModal>,
	BottomSheetPlaylistEditProps
>(({ id, playlist, onEdit, snapPoints, ...props }, ref) => {
  const { closeSheet } = useBottomSheetStore();
  const { colors, inset } = useTheme();
  const { t } = useTranslation();
  const { showActionSheetWithOptions } = useActionSheet();
  const updatePlaylistMutation = usePlaylistUpdateMutation();
  const [newPoster, setNewPoster] = useState<string | null | undefined>(undefined);

  /* ---------------------------------- FORM ---------------------------------- */
  const playlistSchema = z.object({
    title: z.string()
      .min(TITLE_MIN_LENGTH, { message: upperFirst(t('common.form.length.char_min', { count: TITLE_MIN_LENGTH }))})
      .max(TITLE_MAX_LENGTH, { message: upperFirst(t('common.form.length.char_max', { count: TITLE_MIN_LENGTH }))}),
    description: z.string()
      .max(DESCRIPTION_MAX_LENGTH, { message: upperFirst(t('common.form.length.char_max', { count: DESCRIPTION_MAX_LENGTH }))})
      .optional().nullable(),
    private: z.boolean().default(false),
    poster_url: z.string().url().optional().nullable(),
  });
  type PlaylistFormValues = z.infer<typeof playlistSchema>;
  const defaultValues: Partial<PlaylistFormValues> = {
    title: playlist.title,
    description: playlist.description,
    private: playlist.private,
    poster_url: playlist.poster_url,
  };
  const form = useForm<PlaylistFormValues>({
    resolver: zodResolver(playlistSchema),
    defaultValues: defaultValues,
    mode: 'onChange',
  });
  /* -------------------------------------------------------------------------- */

  const posterOptions = useMemo(() => [
		{ label: "Choisir dans la bibliothèque", value: "library" },
		{ label: "Prendre une photo", value: "camera" },
    { label: "Supprimer l'image actuelle", value: "delete", enable: playlist.poster_url !== null },
		{ label: t("common.word.cancel"), value: "cancel" },
	], [t, playlist]);
  const handlePosterOptions = () => {
    const cancelIndex = posterOptions.length - 1;
    showActionSheetWithOptions({
      options: posterOptions.map((option) => upperFirst(option.label)),
      disabledButtonIndices: posterOptions.map((option, index) => option.enable === false ? index : -1).filter((index) => index !== -1),
      cancelButtonIndex: cancelIndex,
    }, async (selectedIndex) => {
      if (selectedIndex === undefined || selectedIndex === cancelIndex) return;
      const selectedOption = posterOptions[selectedIndex];
      switch (selectedOption.value) {
        case 'library':
          const results = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
          })
          console.log('results', results);
          if (!results.canceled) {
            setNewPoster(results.assets[0].uri);
          }
          break;
        case 'camera':
          const cameraResults = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
          })
          if (!cameraResults.canceled) {
            setNewPoster(cameraResults.assets[0].uri);
          }
          break;
        case 'delete':
          setNewPoster(null);
          break;
      };
    });
  };

  const submit = async (values: PlaylistFormValues) => {
    await updatePlaylistMutation.mutateAsync({
      playlistId: playlist.id,
      payload: values,
    }, {
      onSuccess: (playlist) => {
        Burnt.toast({
          title: upperFirst(t('common.word.saved')),
          preset: 'done',
        });
        onEdit && onEdit(playlist);
        closeSheet(id);
      },
      onError: (error) => {
        Burnt.toast({
          title: upperFirst(t('common.messages.error')),
          message: upperFirst(t('common.errors.an_error_occurred')),
          preset: 'error',
        });
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
        <View style={tw`flex-row items-center justify-between w-full`}>
          <TouchableOpacity
          onPress={() => closeSheet(id)}
          >
            <ThemedText>{upperFirst(t('common.word.cancel'))}</ThemedText>
          </TouchableOpacity>
          <ThemedText style={tw`font-bold`}>
            {upperFirst(t('common.playlist.actions.edit'))}
          </ThemedText>
          <TouchableOpacity
          onPress={form.handleSubmit(submit)}
          disabled={updatePlaylistMutation.isPending}
          >
            <ThemedText>{upperFirst(t('common.word.save'))}</ThemedText>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handlePosterOptions} style={tw.style('relative aspect-square rounded-sm overflow-hidden w-1/3')}>
          <ImageWithFallback
            source={{uri: newPoster !== undefined ? (newPoster ?? '') : playlist.poster_url ?? ''}}
            alt={playlist?.title ?? ''}
            type="playlist"
            
          />
        </TouchableOpacity>
        <Controller
        name='title'
        control={form.control}
        render={({ field: { onChange, onBlur, value} }) => (
          <View style={tw`gap-2 w-full`}>
            <InputBottomSheet
            placeholder={upperFirst(t('common.playlist.form.title.placeholder'))}
            value={value}
            autoCorrect={false}
            onBlur={onBlur}
            onChangeText={onChange}
            />
            {form.formState.errors.title && (
              <Text style={{ color: colors.destructive }}>
                {form.formState.errors.title.message}
              </Text>
            )}
          </View>
        )}
        />
        <Controller
        name='description'
        control={form.control}
        render={({ field: { onChange, onBlur, value} }) => (
          <View style={tw`gap-2 w-full`}>
            <InputBottomSheet
            placeholder={upperFirst(t('common.word.description'))}
            style={tw`h-24`}
            multiline
            value={value ?? ''}
            autoCorrect={false}
            onBlur={onBlur}
            onChangeText={onChange}
            />
            {form.formState.errors.description && (
              <Text style={{ color: colors.destructive }}>
                {form.formState.errors.description.message}
              </Text>
            )}
          </View>
        )}
        />
      </BottomSheetView>
    </BottomSheetModal>
  );
});
BottomSheetPlaylistEdit.displayName = 'BottomSheetPlaylistEdit';

export default BottomSheetPlaylistEdit;