import React from 'react';
import tw from '@/lib/tw';
import { UserWatchlistMovie } from '@recomendapp/types';
import { ThemedText } from '@/components/ui/ThemedText';
import { upperFirst } from 'lodash';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import { useUserWatchlistMovieUpdateMutation } from '@/features/user/userMutations';
import { Button } from '@/components/ui/Button';
import * as Burnt from 'burnt';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import ThemedTrueSheet from '@/components/ui/ThemedTrueSheet';
import { BetterInput } from '@/components/ui/BetterInput';
import { BottomSheetProps } from '../BottomSheetManager';
import { useTranslations } from 'use-intl';

interface BottomSheetWatchlistMovieCommentProps extends BottomSheetProps {
  watchlistItem: UserWatchlistMovie
};

const BottomSheetWatchlistMovieComment = React.forwardRef<
  React.ComponentRef<typeof TrueSheet>,
  BottomSheetWatchlistMovieCommentProps
>(({ id, watchlistItem, ...props }, ref) => {
  const closeSheet = useBottomSheetStore((state) => state.closeSheet);
  const t = useTranslations();
  const [comment, setComment] = React.useState(watchlistItem.comment || '');
  const updateWatchlist = useUserWatchlistMovieUpdateMutation();

  const handleUpdateComment = async () => {
	if (comment == watchlistItem?.comment) {
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
		comment: comment.replace(/\s+/g, ' ').trimStart(),
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
	contentContainerStyle={tw`gap-2 px-4`}
	{...props}
	>
		<ThemedText style={tw`text-center text-xl font-bold`}>{upperFirst(t('common.messages.comment', { count: 1 }))}</ThemedText>
		<BetterInput
		variant='outline'
		multiline
		defaultValue={comment}
		onChangeText={setComment}
		placeholder='Ajouter un commentaire...'
		style={tw`h-24`}
		/>
		<Button loading={updateWatchlist.isPending} onPress={handleUpdateComment} disabled={updateWatchlist.isPending}>
			{upperFirst(t('common.messages.save'))}
		</Button>
    </ThemedTrueSheet>
  );
});
BottomSheetWatchlistMovieComment.displayName = 'BottomSheetWatchlistMovieComment';

export default BottomSheetWatchlistMovieComment;