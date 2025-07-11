import React from 'react';
import tw from '@/lib/tw';
import { useTranslation } from 'react-i18next';
import { UserWatchlist } from '@/types/type.db';
import { useTheme } from '@/providers/ThemeProvider';
import { ThemedText } from '@/components/ui/ThemedText';
import { upperFirst } from 'lodash';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import { useUserWatchlistUpdateMutation } from '@/features/user/userMutations';
import { Input } from '@/components/ui/Input';
import { Button, ButtonText } from '@/components/ui/Button';
import * as Burnt from 'burnt';
import { ActivityIndicator, View } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import ThemedTrueSheet from '@/components/ui/ThemedTrueSheet';

interface BottomSheetWatchlistCommentProps extends Omit<React.ComponentPropsWithoutRef<typeof TrueSheet>, 'children'> {
  id: string;
  watchlistItem: UserWatchlist
};

const BottomSheetWatchlistComment = React.forwardRef<
  React.ComponentRef<typeof TrueSheet>,
  BottomSheetWatchlistCommentProps
>(({ id, watchlistItem, ...props }, ref) => {
  const { closeSheet } = useBottomSheetStore();
  const { colors, inset } = useTheme();
  const { t } = useTranslation();
  const [comment, setComment] = React.useState(watchlistItem.comment || '');
  const updateWatchlist = useUserWatchlistUpdateMutation();

  const handleUpdateComment = async () => {
	if (comment == watchlistItem?.comment) {
		closeSheet(id);
		return;
	}
	if (!watchlistItem?.id) {
		Burnt.toast({
			title: upperFirst(t('common.messages.error')),
			message: upperFirst(t('common.errors.an_error_occurred')),
			preset: 'error',
		});
		return;
	}
	await updateWatchlist.mutateAsync({
		watchlistId: watchlistItem.id,
		comment: comment.replace(/\s+/g, ' ').trimStart(),
	}, {
		onSuccess: () => {
			Burnt.toast({
				title: upperFirst(t('common.word.saved')),
				preset: 'done',
			});
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
    <ThemedTrueSheet
	ref={ref}
	contentContainerStyle={tw`gap-2 px-4`}
	{...props}
	>
		<ThemedText style={tw`text-center text-xl font-bold`}>{upperFirst(t('common.messages.comment', { count: 1 }))}</ThemedText>
		<Input
		variant='outline'
		multiline
		defaultValue={comment}
		onChangeText={setComment}
		placeholder='Ajouter un commentaire...'
		style={tw`h-24`}
		/>
		<Button onPress={handleUpdateComment} disabled={updateWatchlist.isPending}>
			{updateWatchlist.isPending ? <ActivityIndicator color={colors.background} /> : null}
			<ButtonText>{upperFirst(t('common.word.save'))}</ButtonText>
		</Button>
    </ThemedTrueSheet>
  );
});
BottomSheetWatchlistComment.displayName = 'BottomSheetWatchlistComment';

export default BottomSheetWatchlistComment;