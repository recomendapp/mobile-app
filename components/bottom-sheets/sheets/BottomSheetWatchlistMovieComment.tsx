import React, { useMemo } from 'react';
import tw from '@/lib/tw';
import { UserWatchlistMovie } from '@recomendapp/types';
import { upperFirst } from 'lodash';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import { useUserWatchlistMovieUpdateMutation } from '@/features/user/userMutations';
import { Button } from '@/components/ui/Button';
import * as Burnt from 'burnt';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import ThemedTrueSheet from '@/components/ui/ThemedTrueSheet';
import { BottomSheetProps } from '../BottomSheetManager';
import { useTranslations } from 'use-intl';
import { GAP, PADDING_HORIZONTAL } from '@/theme/globals';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/text';
import z from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { View } from '@/components/ui/view';
import { useTheme } from '@/providers/ThemeProvider';

interface BottomSheetWatchlistMovieCommentProps extends BottomSheetProps {
	watchlistItem: UserWatchlistMovie
};

const COMMENT_MIN_LENGTH = 0;
const COMMENT_MAX_LENGTH = 180;

export const BottomSheetWatchlistMovieComment = React.forwardRef<
  React.ComponentRef<typeof TrueSheet>,
  BottomSheetWatchlistMovieCommentProps
>(({ id, watchlistItem, ...props }, ref) => {
	const { colors } = useTheme();
	const closeSheet = useBottomSheetStore((state) => state.closeSheet);
	const t = useTranslations();
	const updateWatchlist = useUserWatchlistMovieUpdateMutation();

	/* ---------------------------------- FORM ---------------------------------- */
	const watchlistSchema = z.object({
		comment: z.string()
			.min(COMMENT_MIN_LENGTH, { message: upperFirst(t('common.form.length.char_min', { count: COMMENT_MIN_LENGTH }))})
			.max(COMMENT_MAX_LENGTH, { message: upperFirst(t('common.form.length.char_max', { count: COMMENT_MAX_LENGTH }))}),
	});
	type WatchlistFormValues = z.infer<typeof watchlistSchema>;
	const defaultValues = useMemo((): Partial<WatchlistFormValues> => ({
		comment: watchlistItem.comment || '',
	}), [watchlistItem.comment]);
	const form = useForm<WatchlistFormValues>({
		resolver: zodResolver(watchlistSchema),
		defaultValues: defaultValues,
		mode: 'onChange',
	});
	/* -------------------------------------------------------------------------- */

	// Handlers
	const handleUpdateComment = async (values: WatchlistFormValues) => {
		if (values.comment == watchlistItem?.comment) {
			closeSheet(id);
			return;
		}
		if (!watchlistItem?.id) {
			Burnt.toast({
				title: upperFirst(t('common.messages.error')),
				message: upperFirst(t('common.messages.an_error_occurred')),
				preset: 'error',
				haptic: 'error',
			});
			return;
		}
		await updateWatchlist.mutateAsync({
			watchlistId: watchlistItem.id,
			comment: values.comment.replace(/\s+/g, ' ').trimStart(),
		}, {
			onSuccess: () => {
				Burnt.toast({
					title: upperFirst(t('common.messages.saved', { count: 1, gender: 'male' })),
					preset: 'done',
				});
				closeSheet(id);
			},
			onError: () => {
				Burnt.toast({
					title: upperFirst(t('common.messages.error')),
					message: upperFirst(t('common.messages.an_error_occurred')),
					preset: 'error',
					haptic: 'error',
				});
			}
		});
	};

	return (
    <ThemedTrueSheet
	ref={ref}
	contentContainerStyle={{
		gap: GAP,
		paddingHorizontal: PADDING_HORIZONTAL,
	}}
	{...props}
	>
		<Text style={tw`text-center text-xl font-bold`}>{upperFirst(t('common.messages.comment', { count: 1 }))}</Text>
		<Controller
		name='comment'
		control={form.control}
		render={({ field: { onChange, onBlur, value} }) => (
			<View style={tw`gap-2 w-full`}>
				<Input
				variant='outline'
				placeholder={upperFirst(t('common.messages.add_comment', { count: 1 }))}
				value={value}
				autoCorrect={false}
				onBlur={onBlur}
				onChangeText={onChange}
				type='textarea'
				/>
				{form.formState.errors.comment && (
					<Text style={{ color: colors.destructive }}>
					{form.formState.errors.comment.message}
					</Text>
				)}
			</View>
		)}
		/>
		<Button
		loading={updateWatchlist.isPending}
		onPress={form.handleSubmit(handleUpdateComment)}
		disabled={updateWatchlist.isPending || !form.formState.isValid}
		>
			{upperFirst(t('common.messages.save'))}
		</Button>
    </ThemedTrueSheet>
  );
});
BottomSheetWatchlistMovieComment.displayName = 'BottomSheetWatchlistMovieComment';
