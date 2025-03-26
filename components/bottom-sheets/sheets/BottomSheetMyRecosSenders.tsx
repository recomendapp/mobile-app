import React, { forwardRef } from 'react';
import { BottomSheetFlashList, BottomSheetModal } from '@gorhom/bottom-sheet';
import tw from '@/lib/tw';
import { useTranslation } from 'react-i18next';
import { UserRecosAggregated } from '@/types/type.db';
import { useTheme } from '@/context/ThemeProvider';
import { ThemedText } from '@/components/ui/ThemedText';
import { upperFirst } from 'lodash';
import { View } from 'react-native';
import { CardUser } from '@/components/cards/CardUser';

interface BottomSheetMyRecosSendersProps extends Omit<React.ComponentPropsWithoutRef<typeof BottomSheetModal>, 'children'> {
  id: string;
  comments: UserRecosAggregated['senders'];
};

const BottomSheetMyRecosSenders = forwardRef<
  React.ElementRef<typeof BottomSheetModal>,
  BottomSheetMyRecosSendersProps
>(({ id, comments, ...props }, ref) => {
  const { colors, inset } = useTheme();
  const { t } = useTranslation();
  return (
    <BottomSheetModal
    ref={ref}
	enableDynamicSizing={false}
    {...props}
    >
		<BottomSheetFlashList
		data={comments}
		renderItem={({ item }) => (
			<View key={item.user.id} style={[{ backgroundColor: colors.muted }, tw`rounded-xl p-2 gap-2`]}>
				<View style={tw`flex-row items-center justify-between gap-2`}>
					<CardUser user={item.user} variant='inline' />
					{/* <ThemedText>{item.created_at}</ThemedText> */}
				</View>
				{item.comment ? (
					<View style={[{ backgroundColor: colors.background }, tw`ml-6 p-2 rounded-md`]}>
						<ThemedText>{item.comment}</ThemedText>
					</View>
				) : null}
			</View>
		)}
		ListHeaderComponent={() => (
			<ThemedText style={tw`text-center text-xl font-bold`}>{upperFirst(t('common.messages.reco', { count: comments.length }))}</ThemedText>
  		)}
		estimatedItemSize={100}
		keyExtractor={(item) => item.user.id}
		contentContainerStyle={{
			paddingLeft: 16,
			paddingRight: 16,
			paddingBottom: inset.bottom,
		}}
		ItemSeparatorComponent={() => <View style={tw`h-2`} />}
		/>
    </BottomSheetModal>
  );
});
BottomSheetMyRecosSenders.displayName = 'BottomSheetMyRecosSenders';

export default BottomSheetMyRecosSenders;