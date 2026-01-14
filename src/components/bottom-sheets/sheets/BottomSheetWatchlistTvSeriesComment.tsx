import tw from '@/lib/tw';
import { UserWatchlistTvSeries } from '@recomendapp/types';
import { upperFirst } from 'lodash';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import { useUserWatchlistTvSeriesUpdateMutation } from '@/api/users/userMutations';
import { Button } from '@/components/ui/Button';
import TrueSheet from '@/components/ui/TrueSheet';
import { BottomSheetProps } from '../BottomSheetManager';
import { useTranslations } from 'use-intl';
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from '@/theme/globals';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/text';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { View } from '@/components/ui/view';
import { useTheme } from '@/providers/ThemeProvider';
import { useToast } from '@/components/Toast';
import { forwardRef } from 'react';

interface BottomSheetWatchlistTvSeriesCommentProps extends BottomSheetProps {
	watchlistItem: UserWatchlistTvSeries
};

const COMMENT_MIN_LENGTH = 0;
const COMMENT_MAX_LENGTH = 180;

export const BottomSheetWatchlistTvSeriesComment = forwardRef<
  React.ComponentRef<typeof TrueSheet>,
  BottomSheetWatchlistTvSeriesCommentProps
>(({ id, watchlistItem, ...props }, ref) => {
	const toast = useToast();
	const { colors } = useTheme();
	const closeSheet = useBottomSheetStore((state) => state.closeSheet);
	const t = useTranslations();
	const { mutateAsync: updateWatchlist, isPending: isUpdatingWatchlist } = useUserWatchlistTvSeriesUpdateMutation();

	/* ---------------------------------- FORM ---------------------------------- */
	const watchlistSchema = z.object({
		comment: z.string()
			.min(COMMENT_MIN_LENGTH, { message: upperFirst(t('common.form.length.char_min', { count: COMMENT_MIN_LENGTH }))})
			.max(COMMENT_MAX_LENGTH, { message: upperFirst(t('common.form.length.char_max', { count: COMMENT_MAX_LENGTH }))}),
	});
	type WatchlistFormValues = z.infer<typeof watchlistSchema>;
	const defaultValues: Partial<WatchlistFormValues> = {
		comment: watchlistItem.comment || '',
	};
	const form = useForm<WatchlistFormValues>({
		resolver: zodResolver(watchlistSchema),
		defaultValues: defaultValues,
		mode: 'onChange',
	});
	/* -------------------------------------------------------------------------- */

	// Handlers
	const handleUpdateComment = async (values: WatchlistFormValues) => {
		if (values.comment === watchlistItem?.comment) {
			closeSheet(id);
			return;
		}
		if (!watchlistItem?.id) {
			toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
			return;
		}
		await updateWatchlist({
			watchlistId: watchlistItem.id,
			comment: values.comment.replace(/\s+/g, ' ').trimStart(),
		}, {
			onSuccess: () => {
				toast.success(upperFirst(t('common.messages.saved', { count: 1, gender: 'male' })));
				closeSheet(id);
			},
			onError: () => {
				toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
			}
		});
	};

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
		loading={isUpdatingWatchlist}
		onPress={form.handleSubmit(handleUpdateComment)}
		disabled={isUpdatingWatchlist || !form.formState.isValid}
		>
			{upperFirst(t('common.messages.save'))}
		</Button>
    </TrueSheet>
  );
});
BottomSheetWatchlistTvSeriesComment.displayName = 'BottomSheetWatchlistTvSeriesComment';
