import { Button } from '@/components/ui/Button';
import { useTheme } from '@/providers/ThemeProvider';
import tw from '@/lib/tw';
import { upperFirst } from 'lodash';
import React from 'react';
import { Dimensions, FlatList, Pressable, TouchableOpacity, View } from 'react-native';
import Animated, { clamp, interpolate, runOnJS, SharedValue, useAnimatedProps, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Icons } from '@/constants/Icons';
import { ImageType, ImageWithFallback } from '@/components/utils/ImageWithFallback';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import TrueSheet from '@/components/ui/TrueSheet';
import { BottomSheetProps } from '../BottomSheetManager';
import { useTranslations } from 'use-intl';
import { PADDING_HORIZONTAL, PADDING_VERTICAL } from '@/theme/globals';
import { Text } from '@/components/ui/text';

const { width } = Dimensions.get('screen');
const ITEM_WIDTH = width * 0.2;
const ITEM_SPACING = 8;
const ITEM_TOTAL_SIZE = ITEM_WIDTH + ITEM_SPACING;

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);


interface RatingItemProps
	extends React.ComponentProps<typeof Animated.View> {
		index: number;
		totalItems: number;
		rating: number;
		scrollX: SharedValue<number>;
	}

const RatingItem = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	RatingItemProps
>(({ index, totalItems, rating, scrollX, ...props }, ref) => {
	const anim = useAnimatedStyle(() => ({
		opacity: interpolate(
			scrollX?.get(),
			[index - 1, index, index + 1],
			[0.65, 1, 0.65],
		),
		transform: [
			{
				translateY: interpolate(
					scrollX?.get(),
					[
						index - 1,
						index,
						index + 1,
					],
					[
						ITEM_WIDTH / 3,
						0,
						ITEM_WIDTH / 3,
					],
				)
			}
		]
	}), [scrollX]);
	return (
		<Animated.View
		ref={ref}
		style={[
			tw`relative rounded-full items-center justify-center`,
			{ width: ITEM_WIDTH, height: ITEM_WIDTH },
			anim
		]}
		{...props}
		>
			{/* <Icons.Star width={ITEM_WIDTH} height={ITEM_WIDTH} color={'red'} /> */}
			<Text style={tw`text-white text-4xl font-bold`}>
				{rating}
			</Text>
		</Animated.View>
	)
});
RatingItem.displayName = 'RatingItem';


interface BottomSheetRatingProps extends BottomSheetProps {
	media: {
		title: string;
		imageUrl: string;
		type: ImageType;
	};
	rating?: number | null;
	/**
	 * 
	 * @param rating The rating value, or null if the rating was removed.
	 * @returns 
	 */
	onRatingChange?: (rating: number | null) => Promise<void>;
};
const BottomSheetRating = React.forwardRef<
	React.ComponentRef<typeof TrueSheet>,
	BottomSheetRatingProps
>(({ id, media, rating, onRatingChange, ...props }, ref) => {
	const { colors } = useTheme();
	const t = useTranslations();
	const closeSheet = useBottomSheetStore((state) => state.closeSheet);
	const scrollRef = React.useRef<FlatList>(null);
	const ratings = React.useMemo(() => {
		return Array.from({ length: 10 }, (_, i) => ({
			id: i,
			rating: i + 1,
		}));
	}, []);
	const activeRating = useSharedValue(rating ?? Math.floor(ratings.length / 2));
	const scrollX = useSharedValue(0);

	const vibrate = () => {
		if (process.env.EXPO_OS === 'ios') {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		}
	};
	const onScroll = useAnimatedScrollHandler(e => {
		'worklet';
		scrollX.value = clamp(e.contentOffset.x / ITEM_TOTAL_SIZE, 0, ratings.length - 1);
		const newActiveRating = Math.round(scrollX.get()) + 1;
		if (newActiveRating !== activeRating.get()) {
			activeRating.value = newActiveRating;
			runOnJS(vibrate)();
		}
	});

	const decreaseRatingStyle = useAnimatedStyle(() => ({
		opacity: activeRating.value === 1 ? 0.5 : 1,
	}));
	const decreaseDisabledProps = useAnimatedProps(() => ({
		disabled: activeRating.value === 1,
	}));
	const increaseRatingStyle = useAnimatedStyle(() => ({
		opacity: activeRating.value === ratings.length ? 0.5 : 1,
	}));
	const increaseDisabledProps = useAnimatedProps(() => ({
		disabled: activeRating.value === ratings.length,
	}));

	// Handlers
	const handleDeleteRating = async () => {
		await onRatingChange?.(null);
		closeSheet(id);
	};
	const handleSaveRating = async () => {
		await onRatingChange?.(activeRating.value);
		closeSheet(id);
	};

	// useEffects
	React.useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollToOffset({
			offset: (activeRating.value - 1) * ITEM_TOTAL_SIZE,
			animated: false,
			});
		}
	}, []);

	return (
		<TrueSheet
		ref={ref}
		style={{ paddingTop: PADDING_VERTICAL * 2 }} 
		{...props}
		>
			<View style={[tw`flex-row items-center justify-center`, { paddingHorizontal: PADDING_HORIZONTAL }]}>
				<AnimatedTouchableOpacity
				style={[
					{ backgroundColor: colors.background },
					tw`rounded-full p-2`,
					decreaseRatingStyle,
				]}
				animatedProps={decreaseDisabledProps}
				onPress={() => {
					scrollRef.current?.scrollToOffset({
						offset: (activeRating.value - 2) * ITEM_TOTAL_SIZE,
						animated: true,
					});
				}}
				>
					<Icons.ChevronLeft color={colors.accentYellow} />
				</AnimatedTouchableOpacity>
				<View style={tw`flex-1 items-center justify-center`}>
					<Animated.View
					style={[
						{ aspectRatio: 2 / 3 },
						tw.style('relative flex gap-4 items-center w-2/5 shrink-0 rounded-sm overflow-hidden'),
					]}
					>
						<ImageWithFallback
							source={{uri: media.imageUrl}}
							alt={media.title}
							type={media.type}
						/>
					</Animated.View>
				</View>
				<AnimatedTouchableOpacity
				style={[
					{ backgroundColor: colors.background },
					tw`rounded-full p-2`,
					increaseRatingStyle,
				]}
				animatedProps={increaseDisabledProps}
				onPress={() => {
					scrollRef.current?.scrollToOffset({
						offset: (activeRating.value) * ITEM_TOTAL_SIZE,
						animated: true,
					});
				}}
				>
					<Icons.ChevronRight color={colors.accentYellow} />
				</AnimatedTouchableOpacity>
			</View>
			<Animated.FlatList
			ref={scrollRef}
			data={ratings}
			renderItem={({ item }) => (
				<Pressable
				key={item.id}
				onPress={() => {
					scrollRef.current?.scrollToOffset({
						offset: item.id * ITEM_TOTAL_SIZE,
						animated: true,
					});
				}}
				>
					<RatingItem
					index={item.id}
					totalItems={ratings.length}
					rating={item.rating}
					scrollX={scrollX}
					/>
				</Pressable>
			)}
			keyExtractor={(item) => item.id.toString()}
			horizontal
			showsHorizontalScrollIndicator={false}
			style={{
				flexGrow: 0,
				height: ITEM_WIDTH * 2,
			}}
			contentContainerStyle={{
				gap: ITEM_SPACING,
				paddingHorizontal: (width - ITEM_WIDTH) / 2,
			}}
			onScroll={onScroll}
			scrollEventThrottle={1000 / 60} // ~16ms
			snapToInterval={ITEM_TOTAL_SIZE}
			/>
			<View style={{ paddingHorizontal: PADDING_HORIZONTAL }}>
				{rating ? (
					<View style={tw`flex-row gap-2 justify-between`}>
						<Button variant="destructive" onPress={handleDeleteRating} style={{ flex: 1 }}>
							{upperFirst(t('common.messages.delete'))}
						</Button>
						<Button variant="accent-yellow" onPress={handleSaveRating} style={{ flex: 1 }}>
							{upperFirst(t('common.messages.save'))}
						</Button>
					</View>
				) : (
					<Button variant="accent-yellow" onPress={handleSaveRating}>
						{upperFirst(t('common.messages.add_rating'))}
					</Button>
				)}
			</View>
		</TrueSheet>
	);
});
BottomSheetRating.displayName = 'BottomSheetRating';

export default BottomSheetRating;