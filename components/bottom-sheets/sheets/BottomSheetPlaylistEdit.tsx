import React from 'react';
import tw from '@/lib/tw';
import { useTheme } from '@/context/ThemeProvider';
import { ThemedText } from '@/components/ui/ThemedText';
import { upperFirst } from 'lodash';
import { useTranslation } from 'react-i18next';
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
import { useSupabaseClient } from '@/context/SupabaseProvider';
import { decode } from 'base64-arraybuffer';
import Switch from '@/components/ui/Switch';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { Input } from '@/components/ui/Input';

interface BottomSheetPlaylistEditProps extends Omit<React.ComponentPropsWithoutRef<typeof TrueSheet>, 'children'> {
  id: string;
  playlist: Playlist;
  onEdit?: (playlist: Playlist) => void | Promise<void>;
}

const TITLE_MIN_LENGTH = 1;
const TITLE_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 300;

const BottomSheetPlaylistEdit = React.forwardRef<
	React.ElementRef<typeof TrueSheet>,
	BottomSheetPlaylistEditProps
>(({ id, playlist, onEdit, sizes, ...props }, ref) => {
  const supabase = useSupabaseClient();
  const { closeSheet } = useBottomSheetStore();
  const { colors, inset } = useTheme();
  const { t } = useTranslation();
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
    private: z.boolean().default(false),
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
		{ label: "Choisir dans la bibliothèque", value: "library" },
		{ label: "Prendre une photo", value: "camera" },
    { label: "Supprimer l'image actuelle", value: "delete", disable: !playlist.poster_url && !newPoster },
		{ label: t("common.word.cancel"), value: "cancel" },
	], [t, playlist.poster_url, newPoster]);

  const handlePosterOptions = () => {
    const cancelIndex = posterOptions.length - 1;
    showActionSheetWithOptions({
      options: posterOptions.map((option) => upperFirst(option.label)),
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
              message: upperFirst(t('common.errors.camera_permission_denied')),
              preset: 'error',
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
        const fileName = `${playlist.id}-${Math.random()}.${fileExt}`;
        const { data, error } = await supabase.storage
          .from('playlist_posters')
          .upload(fileName, decode(newPoster.base64!), {
            contentType: newPoster.mimeType,
            upsert: true,
          });
        if (error) throw error;
        poster_url =  `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${data?.fullPath}`;
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
            title: upperFirst(t('common.word.saved')),
            preset: 'done',
          });
          onEdit && onEdit(playlist);
          await closeSheet(id);
        },
        onError: (error) => {
          Burnt.toast({
            title: upperFirst(t('common.messages.error')),
            message: upperFirst(t('common.errors.an_error_occurred')),
            preset: 'error',
          });
        }
      });
    } catch (error: any) {
      if (error?.message) {
        Burnt.toast({
          title: upperFirst(t('common.messages.error')),
          message: upperFirst(error.message),
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
  };

  return (
    <TrueSheet
    ref={ref}
    onLayout={async () => {
      if (typeof ref === 'object' && ref?.current?.present) {
        await ref.current.present();
      };
    }}
    sizes={['large']}
    {...props}
    >
      <View
      style={[
        { paddingBottom: inset.bottom },
        tw`flex-1 gap-4 items-center mx-2`,
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
            <Input
            variant='outline'
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
            <Input
            variant='outline'
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
        <View style={tw`w-full flex-row items-center justify-between gap-1`}>
          <Controller
          name='private'
          control={form.control}
          render={({ field: { onChange, onBlur, value} }) => (
            <View style={tw`flex-row items-center gap-2`}>
              <ThemedText>{upperFirst(t('common.messages.private', { context: 'female' }))}</ThemedText>
              <Switch
              value={value}
              onValueChange={onChange}
              />
            </View>
          )}
          />
        </View>
      </View>
    </TrueSheet>
  );
});
BottomSheetPlaylistEdit.displayName = 'BottomSheetPlaylistEdit';

export default BottomSheetPlaylistEdit;