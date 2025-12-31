import tw from '@/lib/tw';
import { upperFirst } from 'lodash';
import { Button } from '@/components/ui/Button';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import { usePlaylistInsertMutation } from '@/api/playlists/playlistMutations';
import { Playlist, PlaylistType } from '@recomendapp/types';
import * as z from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { View } from 'react-native';
import { BottomSheetProps } from '../BottomSheetManager';
import TrueSheet from '@/components/ui/TrueSheet';
import { useTranslations } from 'use-intl';
import { useToast } from '@/components/Toast';
import { Input } from "@/components/ui/Input";
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from '@/theme/globals';
import { Label } from '@/components/ui/Label';
import { forwardRef, useCallback } from 'react';
import { Text } from '@/components/ui/text';
import { FlashList } from '@shopify/flash-list';

interface BottomSheetPlaylistCreateProps extends BottomSheetProps {
	onCreate?: (playlist: Playlist) => void;
	placeholder?: string | null;
	playlistType?: PlaylistType;
}

const TITLE_MIN_LENGTH = 1;
const TITLE_MAX_LENGTH = 100;

const BottomSheetPlaylistCreate = forwardRef<
	React.ComponentRef<typeof TrueSheet>,
	BottomSheetPlaylistCreateProps
>(({ id, onCreate,  placeholder, playlistType, ...props }, ref) => {
	const toast = useToast();
	const closeSheet = useBottomSheetStore((state) => state.closeSheet);
	const t = useTranslations();
	const { mutateAsync: createPlaylistMutation, isPending: isPlaylistCreating } = usePlaylistInsertMutation();

	const typeOptions: { key: PlaylistType; label: string }[] = [
		{ key: 'movie', label: upperFirst(t('common.messages.film', { count: 2 })) },
		{ key: 'tv_series', label: upperFirst(t('common.messages.tv_series', { count: 2 })) },
	];

	/* ---------------------------------- FORM ---------------------------------- */
	const playlistSchema = z.object({
		title: z.string()
			.min(TITLE_MIN_LENGTH, { message: upperFirst(t('common.form.length.char_min', { count: TITLE_MIN_LENGTH }))})
			.max(TITLE_MAX_LENGTH, { message: upperFirst(t('common.form.length.char_max', { count: TITLE_MIN_LENGTH }))}),
		type: z.enum(['movie', 'tv_series']),
	});
	type PlaylistFormValues = z.infer<typeof playlistSchema>;
	const defaultValues: Partial<PlaylistFormValues> = {
		title: '',
		type: playlistType || 'movie',
	};
	const form = useForm<PlaylistFormValues>({
		resolver: zodResolver(playlistSchema),
		defaultValues: defaultValues,
		mode: 'onChange',
	});
	/* -------------------------------------------------------------------------- */

	const onSubmit = useCallback(async (values: PlaylistFormValues) => {
		await createPlaylistMutation({
			title: values.title,
			type: values.type,
		}, {
			onSuccess: (playlist) => {
				toast.success(upperFirst(t('common.messages.added', { gender: 'female', count: 1 })));
				form.reset();
				onCreate && onCreate(playlist);
				closeSheet(id);
			},
			onError: () => {
				toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
			}
		});
	}, [createPlaylistMutation, toast, t, onCreate, closeSheet, id, form]);

	return (
		<TrueSheet
		ref={ref}
		style={{
			gap: GAP,
			paddingTop: PADDING_VERTICAL * 2,
			paddingHorizontal: PADDING_HORIZONTAL,
		}}
		{...props}
		>
			<Text style={tw`text-center text-lg font-bold`}>{upperFirst(t('common.messages.new_playlist'))}</Text>
			<Controller
			name='title'
			control={form.control}
			render={({ field: { onChange, onBlur, value} }) => (
				<View style={[tw`w-full`, { gap: GAP }]}>
					<Label>{upperFirst(t('common.messages.title'))}</Label>
					<Input
					variant='outline'
					value={value}
					onChangeText={onChange}
					onBlur={onBlur}
					placeholder={placeholder ?? upperFirst(t('pages.playlist.form.title.placeholder'))}
					autoCorrect={false}
					disabled={isPlaylistCreating}
					error={form.formState.errors.title?.message}
					/>
				</View>
			)}
			/>
			<Controller
			name='type'
			control={form.control}
			render={({ field: { onChange, value } }) => (
			<View style={[tw`w-full`, { gap: GAP }]}>
				<Label>{upperFirst(t('common.messages.select_a_type'))}</Label>
				<FlashList
				data={typeOptions}
				extraData={value}
				horizontal
				style={tw`w-full`}
				ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
				renderItem={({ item } : { item: { key: string; label: string } }) => (
					<Button
					variant={value === item.key ? 'accent-yellow' : 'outline'}
					onPress={() => onChange(item.key)}
					disabled={playlistType && item.key !== playlistType}
					>
						{item.label}
					</Button>
				)}
				/>
			</View>
			)}
			/>
			<Button
			variant='outline'
			onPress={() => {
				if (form.getValues('title').length === 0 && placeholder && placeholder.length > 0) {
					onSubmit({ title: placeholder, type: form.getValues('type') });
				} else {
					form.handleSubmit(onSubmit)();
				}
			}}
			containerStyle={tw`w-full`}
			disabled={isPlaylistCreating}
			>
				{upperFirst(t('common.messages.create'))}
			</Button>
		</TrueSheet>
	);
});
BottomSheetPlaylistCreate.displayName = 'BottomSheetPlaylistCreate';

export default BottomSheetPlaylistCreate;