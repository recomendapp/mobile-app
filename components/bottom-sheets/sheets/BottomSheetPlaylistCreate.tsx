import React from 'react';
import tw from '@/lib/tw';
import { useTheme } from '@/context/ThemeProvider';
import { ThemedText } from '@/components/ui/ThemedText';
import { upperFirst } from 'lodash';
import { useTranslation } from 'react-i18next';
import { Button, ButtonText } from '@/components/ui/Button';
import * as Burnt from 'burnt';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import { usePlaylistInsertMutation } from '@/features/playlist/playlistMutations';
import { useAuth } from '@/context/AuthProvider';
import { Playlist } from '@/types/type.db';
import * as z from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Text, View } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { Input } from '@/components/ui/Input';

interface BottomSheetPlaylistCreateProps extends Omit<React.ComponentPropsWithoutRef<typeof TrueSheet>, 'children'> {
  id: string;
  onCreate?: (playlist: Playlist) => void;
  placeholder?: string | null;
}

const TITLE_MIN_LENGTH = 1;
const TITLE_MAX_LENGTH = 100;

const BottomSheetPlaylistCreate = React.forwardRef<
	React.ElementRef<typeof TrueSheet>,
	BottomSheetPlaylistCreateProps
>(({ id, onCreate, placeholder, ...props }, ref) => {
  const { user } = useAuth();
  const { closeSheet } = useBottomSheetStore();
  const { colors, inset } = useTheme();
  const { t } = useTranslation();
  const createPlaylistMutation = usePlaylistInsertMutation({
    userId: user?.id,
  });

  /* ---------------------------------- FORM ---------------------------------- */
  const playlistSchema = z.object({
    title: z.string()
      .min(TITLE_MIN_LENGTH, { message: upperFirst(t('common.form.length.char_min', { count: TITLE_MIN_LENGTH }))})
      .max(TITLE_MAX_LENGTH, { message: upperFirst(t('common.form.length.char_max', { count: TITLE_MIN_LENGTH }))}),
  });
  type PlaylistFormValues = z.infer<typeof playlistSchema>;
  const defaultValues: Partial<PlaylistFormValues> = {
    title: undefined,
  };
  const form = useForm<PlaylistFormValues>({
    resolver: zodResolver(playlistSchema),
    defaultValues: defaultValues,
    mode: 'onChange',
  });
  /* -------------------------------------------------------------------------- */

  const onSubmit = async (values: PlaylistFormValues) => {
    await createPlaylistMutation.mutateAsync({
      title: values.title,
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
          title: upperFirst(t('common.messages.error')),
          message: upperFirst(t('common.errors.an_error_occurred')),
          preset: 'error',
        });
      }
    });
  };

  return (
    <TrueSheet
    ref={ref}
    onLayout={async () => {
      if (typeof ref === 'object' && ref?.current?.present) {
        await ref.current.present();
      };
    }}
    {...props}
    >
      <View
      style={[
        { paddingBottom: inset.bottom },
        tw`flex-1 gap-4 items-center justify-center mx-2`,
      ]}
      >
        <ThemedText style={tw`text-lg font-bold`}>Donner un nom à la playlist</ThemedText>
        <Controller
        name='title'
        control={form.control}
        render={({ field: { onChange, onBlur, value} }) => (
          <View style={tw`gap-2 w-full`}>
            <Input
            variant='outline'
            placeholder={placeholder ?? upperFirst(t('common.playlist.form.title.placeholder'))}
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
        <Button
        onPress={() => {
          if (placeholder && placeholder.length > 0) {
            onSubmit({ title: placeholder });
          } else {
            form.handleSubmit(onSubmit)();
          }
        }}
        disabled={createPlaylistMutation.isPending}
        >
          <ButtonText>{upperFirst(t('common.messages.create'))}</ButtonText>
        </Button>
      </View>
    </TrueSheet>
  );
});
BottomSheetPlaylistCreate.displayName = 'BottomSheetPlaylistCreate';

export default BottomSheetPlaylistCreate;