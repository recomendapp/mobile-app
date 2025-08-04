import React from 'react';
import tw from '@/lib/tw';
import { UserRecosAggregated } from '@/types/type.db';
import { useTheme } from '@/providers/ThemeProvider';
import { ThemedText } from '@/components/ui/ThemedText';
import { upperFirst } from 'lodash';
import { View } from 'react-native';
import { CardUser } from '@/components/cards/CardUser';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { FlashList } from '@shopify/flash-list';
import ThemedTrueSheet from '@/components/ui/ThemedTrueSheet';
import { BottomSheetProps } from '../BottomSheetManager';
import { useTranslations } from 'use-intl';

interface BottomSheetMyRecosSendersProps extends BottomSheetProps {
  comments: UserRecosAggregated['senders'];
};

const BottomSheetMyRecosSenders = React.forwardRef<
  React.ComponentRef<typeof TrueSheet>,
  BottomSheetMyRecosSendersProps
>(({ id, comments, sizes, ...props }, ref) => {
  const { colors, inset } = useTheme();
  const t = useTranslations();
  const flashlistRef = React.useRef<FlashList<UserRecosAggregated['senders'][number]>>(null);
  return (
    <ThemedTrueSheet
    ref={ref}
	sizes={['large']}
	scrollRef={flashlistRef as React.RefObject<React.Component<unknown, {}, any>>}
    {...props}
    >
		<FlashList
		ref={flashlistRef}
		data={comments}
		renderItem={({ item }) => (
			<View key={item.user.id} style={[{ backgroundColor: colors.muted }, tw`rounded-xl p-2 gap-2`]}>
				<View style={tw`flex-row items-center justify-between gap-2`}>
					<CardUser user={item.user} variant='inline' />
				</View>
				{item.comment ? (
					<View style={[{ backgroundColor: colors.background }, tw`ml-6 p-2 rounded-md`]}>
						<ThemedText>{item.comment}</ThemedText>
					</View>
				) : null}
			</View>
		)}
		ListHeaderComponent={
			<ThemedText style={tw`text-center text-xl font-bold`}>{upperFirst(t('common.messages.reco', { count: comments.length }))}</ThemedText>
  		}
		estimatedItemSize={100}
		keyExtractor={(item) => item.user.id}
		contentContainerStyle={{
			paddingTop: 16,
			paddingLeft: 16,
			paddingRight: 16,
			paddingBottom: inset.bottom,
		}}
		ItemSeparatorComponent={() => <View style={tw`h-2`} />}
		/>
    </ThemedTrueSheet>
  );
});
BottomSheetMyRecosSenders.displayName = 'BottomSheetMyRecosSenders';

export default BottomSheetMyRecosSenders;