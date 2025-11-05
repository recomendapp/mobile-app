import React from 'react';
import tw from '@/lib/tw';
import { UserRecosAggregated } from '@recomendapp/types';
import { useTheme } from '@/providers/ThemeProvider';
import { Text } from '@/components/ui/text';
import { upperFirst } from 'lodash';
import { View } from 'react-native';
import { CardUser } from '@/components/cards/CardUser';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import TrueSheet from '@/components/ui/TrueSheet';
import { BottomSheetProps } from '../BottomSheetManager';
import { useTranslations } from 'use-intl';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BottomSheetMyRecosSendersProps extends BottomSheetProps {
  comments: UserRecosAggregated['senders'];
};

const BottomSheetMyRecosSenders = React.forwardRef<
  React.ComponentRef<typeof TrueSheet>,
  BottomSheetMyRecosSendersProps
>(({ id, comments, sizes, ...props }, ref) => {
	const insets = useSafeAreaInsets();
	const { colors } = useTheme();
	const t = useTranslations();
	const flashlistRef = React.useRef<FlashListRef<UserRecosAggregated['senders'][number]>>(null);
	return (
    <TrueSheet
    ref={ref}
	sizes={['large']}
	// scrollRef={flashlistRef as React.RefObject<React.Component<unknown, {}, any>>}
	scrollRef={flashlistRef as any}
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
						<Text>{item.comment}</Text>
					</View>
				) : null}
			</View>
		)}
		ListHeaderComponent={
			<Text style={tw`text-center text-xl font-bold`}>{upperFirst(t('common.messages.reco', { count: comments.length }))}</Text>
  		}
		keyExtractor={(item) => item.user.id!}
		contentContainerStyle={{
			paddingTop: 16,
			paddingLeft: 16,
			paddingRight: 16,
			paddingBottom: insets.bottom,
		}}
		ItemSeparatorComponent={() => <View style={tw`h-2`} />}
		/>
    </TrueSheet>
	);
});
BottomSheetMyRecosSenders.displayName = 'BottomSheetMyRecosSenders';

export default BottomSheetMyRecosSenders;