import React, { forwardRef } from 'react';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import tw from '@/lib/tw';
import { useTranslation } from 'react-i18next';
import { UserWatchlist } from '@/types/type.db';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeProvider';
import { ThemedText } from '@/components/ui/ThemedText';
import { upperFirst } from 'lodash';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import { useUserWatchlistUpdateMutation } from '@/features/user/userMutations';
import { Input } from '@/components/ui/Input';
import { Button, ButtonText } from '@/components/ui/Button';
import * as Burnt from 'burnt';
import { ActivityIndicator } from 'react-native';

interface BottomSheetWatchlistCommentProps extends Omit<React.ComponentPropsWithoutRef<typeof BottomSheetModal>, 'children'> {
  id: string;
  watchlistItem: UserWatchlist
};

const BottomSheetWatchlistComment = forwardRef<
  React.ElementRef<typeof BottomSheetModal>,
  BottomSheetWatchlistCommentProps
>(({ id, watchlistItem, snapPoints, ...props }, ref) => {
  const { closeSheet } = useBottomSheetStore();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const inset = useSafeAreaInsets();
  const [comment, setComment] = React.useState(watchlistItem.comment || '');
  const updateWatchlist = useUserWatchlistUpdateMutation();

  const handleUpdateComment = async () => {
	if (comment == watchlistItem?.comment) {
		closeSheet(id);
		return;
	}
	if (!watchlistItem?.id) {
		Burnt.toast({
			title: upperFirst(t('common.errors.an_error_occurred')),
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
				title: upperFirst(t('common.errors.an_error_occurred')),
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
        tw`flex-1 gap-2 px-4`,
      ]}
      >
        <ThemedText style={tw`text-center text-xl font-bold`}>{upperFirst(t('common.messages.comment', { count: 1 }))}</ThemedText>
		<Input
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
      </BottomSheetView>
    </BottomSheetModal>
  );
});
BottomSheetWatchlistComment.displayName = 'BottomSheetWatchlistComment';

export default BottomSheetWatchlistComment;