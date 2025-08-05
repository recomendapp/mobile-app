import React from 'react';
import tw from '@/lib/tw';
import { useTheme } from '@/providers/ThemeProvider';
import { ThemedText } from '@/components/ui/ThemedText';
import { upperFirst } from 'lodash';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import { Playlist } from '@/types/type.db';
import * as z from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePlaylistUpdateMutation } from '@/features/playlist/playlistMutations';
import * as Burnt from 'burnt';
import { Text, TouchableOpacity, View } from 'react-native';
import { ImageWithFallback } from '@/components/utils/ImageWithFallback';
import { useActionSheet } from '@expo/react-native-action-sheet';
import * as ImagePicker from 'expo-image-picker';
import { useSupabaseClient } from '@/providers/SupabaseProvider';
import { decode } from 'base64-arraybuffer';
import Switch from '@/components/ui/Switch';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import ThemedTrueSheet from '@/components/ui/ThemedTrueSheet';
import { BetterInput } from '@/components/ui/BetterInput';
import { BottomSheetProps } from '../BottomSheetManager';
import { useTranslations } from 'use-intl';

interface BottomSheetPlaylistEditProps extends BottomSheetProps {
  playlist: Playlist;
  onEdit?: (playlist: Playlist) => void | Promise<void>;
}

const TITLE_MIN_LENGTH = 1;
const TITLE_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 300;

const BottomSheetPlaylistEdit = React.forwardRef<
	React.ComponentRef<typeof TrueSheet>,
	BottomSheetPlaylistEditProps
>(({ id, playlist, onEdit, sizes = ["auto"], ...props }, ref) => {
  const supabase = useSupabaseClient();
  const { closeSheet } = useBottomSheetStore();
  const { colors, inset } = useTheme();
  const t = useTranslations();
  const { showActionSheetWithOptions } = useActionSheet();
  const updatePlaylistMutation = usePlaylistUpdateMutation();
  const [newPoster, setNewPoster] = React.useState<ImagePicker.ImagePickerAsset | null | undefined>(undefined);

  /* ---------------------------------- FORM ---------------------------------- */
  const playlistSchema = z.object({
    title: z.string()
      .min(TITLE_MIN_LENGTH, { message: upperFirst(t('common.form.length.char_min', { count: TITLE_MIN_LENGTH }))})
      .max(TITLE_MAX_LENGTH, { message: upperFirst(t('common.form.length.char_max', { count: TITLE_MIN_LENGTH }))}),
    description: z.string()
      .max(DESCRIPTION_MAX_LENGTH, { message: upperFirst(t('common.form.length.char_max', { count: DESCRIPTION_MAX_LENGTH }))})
      .optional().nullable(),
    private: z.boolean(),
  });
  type PlaylistFormValues = z.infer<typeof playlistSchema>;
  const defaultValues: Partial<PlaylistFormValues> = {
    title: playlist.title,
    description: playlist.description,
    private: playlist.private,
  };
  const form = useForm<PlaylistFormValues>({
    resolver: zodResolver(playlistSchema),
    defaultValues: defaultValues,
    mode: 'onChange',
  });
  /* -------------------------------------------------------------------------- */

  const posterOptions = React.useMemo(() => [
		{ label: upperFirst(t('common.messages.choose_from_the_library')), value: "library" },
		{ label: upperFirst(t('common.messages.take_a_photo')), value: "camera" },
    { label: upperFirst(t('common.messages.delete_current_image')), value: "delete", disable: !playlist.poster_url && !newPoster },
		{ label: upperFirst(t("common.messages.cancel")), value: "cancel" },
	], [t, playlist.poster_url, newPoster]);

  const handlePosterOptions = () => {
    const cancelIndex = posterOptions.length - 1;
    showActionSheetWithOptions({
      options: posterOptions.map((option) => option.label),
      disabledButtonIndices: posterOptions.map((option, index) => option.disable ? index : -1).filter((index) => index !== -1),
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
            quality: 0,
            base64: true,
          })
          if (!results.canceled) {
            setNewPoster(results.assets[0]);
          }
          break;
        case 'camera':
          const hasPermission = await ImagePicker.requestCameraPermissionsAsync();
          if (!hasPermission.granted) {
            Burnt.toast({
              title: upperFirst(t('common.messages.error')),
              message: upperFirst(t('common.messages.camera_permission_denied')),
              preset: 'error',
              haptic: 'error',
            });
            return;
          }
          const cameraResults = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0,
            base64: true,
          })
          if (!cameraResults.canceled) {
            setNewPoster(cameraResults.assets[0]);
          }
          break;
        case 'delete':
          setNewPoster(playlist.poster_url ? null : undefined);
          break;
      };
    });
  };

  const submit = async (values: PlaylistFormValues) => {
    try {
      let poster_url: string | null | undefined = undefined;
      if (newPoster) {
        const fileExt = newPoster.uri.split('.').pop();
        const fileName = `${playlist.id}.${fileExt}`;
        const { data, error } = await supabase.storage
          .from('playlist_posters')
          .upload(fileName, decode(newPoster.base64!), {
            contentType: newPoster.mimeType,
            upsert: true,
          });
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage
          .from('playlist_posters')
          .getPublicUrl(data.path);
        poster_url = publicUrl;
      } else if (newPoster === null) {
        poster_url = null;
      }
      await updatePlaylistMutation.mutateAsync({
        playlistId: playlist.id,
        payload: {
          ...values,
          poster_url: poster_url,
        },
      }, {
        onSuccess: async (playlist) => {
          Burnt.toast({
            title: upperFirst(t('common.messages.saved', { gender: 'male', count: 1 })),
            preset: 'done',
          });
          onEdit && onEdit(playlist);
          await closeSheet(id);
        },
        onError: (error) => {
          Burnt.toast({
            title: upperFirst(t('common.messages.error')),
            message: upperFirst(t('common.messages.an_error_occurred')),
            preset: 'error',
            haptic: 'error',
          });
        }
      });
    } catch (error: any) {
      if (error?.message) {
        Burnt.toast({
          title: upperFirst(t('common.messages.error')),
          message: upperFirst(error.message),
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

  return (
    <ThemedTrueSheet
    ref={ref}
    sizes={sizes}
    contentContainerStyle={tw`gap-4 items-center mx-2`}
    {...props}
    >
      <View style={tw`flex-row items-center justify-between w-full`}>
        <TouchableOpacity
        onPress={() => closeSheet(id)}
        >
          <ThemedText>{upperFirst(t('common.messages.cancel'))}</ThemedText>
        </TouchableOpacity>
        <ThemedText style={tw`font-bold`}>
          {upperFirst(t('pages.playlist.actions.edit'))}
        </ThemedText>
        <TouchableOpacity
        onPress={form.handleSubmit(submit)}
        disabled={updatePlaylistMutation.isPending}
        >
          <ThemedText>{upperFirst(t('common.messages.save'))}</ThemedText>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={handlePosterOptions} style={tw`relative aspect-square rounded-md overflow-hidden w-2/4`}>
        <ImageWithFallback
          source={{uri: newPoster !== undefined ? (newPoster?.uri ?? '') : playlist.poster_url ?? ''}}
          alt={playlist?.title ?? ''}
          type="playlist"
          style={{ backgroundColor: colors.background   }}
        />
      </TouchableOpacity>
      <Controller
      name='title'
      control={form.control}
      render={({ field: { onChange, onBlur, value} }) => (
        <View style={tw`gap-2 w-full`}>
          <BetterInput
          variant='outline'
          placeholder={upperFirst(t('pages.playlist.form.title.placeholder'))}
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
          <BetterInput
          variant='outline'
          placeholder={upperFirst(t('common.messages.description'))}
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
      <View style={tw`w-full flex-row items-center justify-between gap-1`}>
        <Controller
        name='private'
        control={form.control}
        render={({ field: { onChange, onBlur, value} }) => (
          <View style={tw`flex-row items-center gap-2`}>
            <ThemedText>{upperFirst(t('common.messages.private', { gender: 'female', count: 1 }))}</ThemedText>
            <Switch
            value={value}
            onValueChange={onChange}
            />
          </View>
        )}
        />
      </View>
    </ThemedTrueSheet>
  );
});
BottomSheetPlaylistEdit.displayName = 'BottomSheetPlaylistEdit';

export default BottomSheetPlaylistEdit;