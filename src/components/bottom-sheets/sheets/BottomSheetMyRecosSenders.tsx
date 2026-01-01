import React, { useCallback } from 'react';
import tw from '@/lib/tw';
import { UserRecosAggregated } from '@recomendapp/types';
import { useTheme } from '@/providers/ThemeProvider';
import { Text } from '@/components/ui/text';
import { upperFirst } from 'lodash';
import { View } from 'react-native';
import { CardUser } from '@/components/cards/CardUser';
import { FlashList } from '@shopify/flash-list';
import TrueSheet from '@/components/ui/TrueSheet';
import { BottomSheetProps } from '../BottomSheetManager';
import { useTranslations } from 'use-intl';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PADDING_HORIZONTAL, PADDING_VERTICAL } from '@/theme/globals';

interface BottomSheetMyRecosSendersProps extends BottomSheetProps {
  comments: UserRecosAggregated['senders'];
};

const BottomSheetMyRecosSenders = React.forwardRef<
  React.ComponentRef<typeof TrueSheet>,
  BottomSheetMyRecosSendersProps
>(({ id, comments, ...props }, ref) => {
	const insets = useSafeAreaInsets();
	const { colors, mode } = useTheme();
	const t = useTranslations();
	const renderItem = useCallback(({ item }: { item: UserRecosAggregated['senders'][number] }) => {
		return (
			<View key={item.user.id} style={[{ backgroundColor: colors.background }, tw`rounded-xl p-2 gap-2`]}>
				<View style={tw`flex-row items-center justify-between gap-2`}>
					<CardUser user={item.user} variant='inline' />
				</View>
				{item.comment ? (
					<View style={[{ backgroundColor: colors.muted }, tw`ml-6 p-2 rounded-md`]}>
						<Text>{item.comment}</Text>
					</View>
				) : null}
			</View>
		);
	}, [colors.muted, colors.background]);
	const keyExtractor = useCallback((item: UserRecosAggregated['senders'][number]) => item.user.id!, []);
	return (
    <TrueSheet
    ref={ref}
	header={
		<Text
		style={[
			tw`text-center text-xl font-bold`,
			{
				paddingTop: PADDING_VERTICAL * 2,
				paddingHorizontal: PADDING_HORIZONTAL,
				paddingBottom: PADDING_VERTICAL,
			}
		]}>
			{upperFirst(t('common.messages.reco', { count: comments.length }))}
		</Text>
	}
	scrollable
    {...props}
    >
		<FlashList
		data={comments}
		renderItem={renderItem}
		keyExtractor={keyExtractor}
		contentContainerStyle={{
			paddingHorizontal: PADDING_HORIZONTAL,
			paddingBottom: insets.bottom + PADDING_VERTICAL,
		}}
		indicatorStyle={mode === 'dark' ? 'white' : 'black'}
		ItemSeparatorComponent={() => <View style={tw`h-2`} />}
		/>
    </TrueSheet>
	);
});
BottomSheetMyRecosSenders.displayName = 'BottomSheetMyRecosSenders';

export default BottomSheetMyRecosSenders;