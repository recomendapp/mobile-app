import { Button } from '@/components/ui/Button';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/providers/ThemeProvider';
import tw from '@/lib/tw';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { upperFirst } from 'lodash';
import React from 'react';
import { Dimensions, FlatList, View } from 'react-native';
import Animated, { clamp, interpolate, runOnJS, SharedValue, useAnimatedProps, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Icons } from '@/constants/Icons';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { Media } from '@/types/type.db';
import { ImageWithFallback } from '@/components/utils/ImageWithFallback';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import { useUserActivityQuery } from '@/features/user/userQueries';
import { useAuth } from '@/providers/AuthProvider';
import { useUserActivityInsertMutation, useUserActivityUpdateMutation } from '@/features/user/userMutations';
import * as Burnt from 'burnt';
import ThemedTrueSheet from '@/components/ui/ThemedTrueSheet';
import { BottomSheetProps } from '../BottomSheetManager';
import { useTranslations } from 'use-intl';

const { width } = Dimensions.get('screen');
const ITEM_WIDTH = width * 0.2;
const ITEM_SPACING = 8;
const ITEM_TOTAL_SIZE = ITEM_WIDTH + ITEM_SPACING;

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableWithoutFeedback);

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
			<ThemedText style={tw`text-white text-4xl font-bold`}>
				{rating}
			</ThemedText>
		</Animated.View>
	)
});
RatingItem.displayName = 'RatingItem';


interface BottomSheetMediaRatingProps extends BottomSheetProps {
	media: Media;
	/**
	 * 
	 * @param rating The rating value, or null if the rating was removed.
	 * @returns 
	 */
	onRatingChange?: (rating: number | null) => void;
};
const BottomSheetMediaRating = React.forwardRef<
	React.ComponentRef<typeof TrueSheet>,
	BottomSheetMediaRatingProps
>(({ id, media, onRatingChange, sizes, ...props }, ref) => {
	const { user } = useAuth();
	const { colors, inset } = useTheme();
	const t = useTranslations();
	const { closeSheet } = useBottomSheetStore();
	const {
		data: activity,
	} = useUserActivityQuery({
		userId: user?.id,
		mediaId: media.media_id!,
	});
	const insertActivity = useUserActivityInsertMutation();
	const updateActivity = useUserActivityUpdateMutation();

	const scrollRef = React.useRef<FlatList>(null);
	const ratings = React.useMemo(() => {
		return Array.from({ length: 10 }, (_, i) => ({
			id: i,
			rating: i + 1,
		}));
	}, []);
	const activeRating = useSharedValue(activity?.rating ?? Math.floor(ratings.length / 2));
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
	const handleRate = async (rating: number) => {
		if (!user?.id) return;
		if (activity) {
			await updateActivity.mutateAsync({
				activityId: activity.id,
				rating: rating,
			}, {
				onError: () => {
					Burnt.toast({
						title: upperFirst(t('common.messages.an_error_occurred')),
						preset: 'error',
					});
				}
			});
		} else {
			await insertActivity.mutateAsync({
				userId: user?.id,
				mediaId: media.media_id!,
				rating: rating,
			}, {
				onError: () => {
					Burnt.toast({
						title: upperFirst(t('common.messages.an_error_occurred')),
						preset: 'error',
					});
				}
			});
		}
	};
	const handleUnrate = async () => {
		if (activity?.review) {
			return Burnt.toast({
				title: upperFirst(t('common.messages.an_error_occurred')),
				message: 'You cannot unrate a media with a review.',
				duration: 3,
				haptic: 'error',
				preset: 'error',
			})
		}
		await updateActivity.mutateAsync({
			activityId: activity!.id!,
			rating: null,
		}, {
			onError: () => {
				Burnt.toast({
					title: upperFirst(t('common.messages.an_error_occurred')),
					preset: 'error',
				});
			}
		});
	};

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

	const handleDeleteRating = async () => {
		handleUnrate();
		onRatingChange?.(null);
		closeSheet(id);
	};
	const handleSaveRating = async () => {
		await handleRate(activeRating.value);
		onRatingChange?.(activeRating.value);
		closeSheet(id);
	};

	return (
		<ThemedTrueSheet
		ref={ref}
		sizes={['auto']}
		FooterComponent={() => (
			<View style={[{ paddingBottom: inset.bottom }, tw`flex-1 flex-row gap-2 justify-between px-4`]}>
				{activity?.rating ? (
					<>
						<Button variant="outline" onPress={handleDeleteRating} style={{ flex: 1 }}>
							Delete
						</Button>
						<Button variant="accent-yellow" onPress={handleSaveRating} style={{ flex: 1 }}>
							{upperFirst(t('common.messages.save'))}
						</Button>
					</>
				) : (
					<Button variant="accent-yellow" onPress={handleSaveRating} style={{ flex: 1 }}>
						Ajouter une note
					</Button>
				)}
			</View>
		)}
		{...props}
		>
			<View style={tw`flex-row items-center justify-center px-4`}>
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
							source={{uri: media.avatar_url ?? ''}}
							alt={media.title ?? ''}
							type={media.media_type}
						/>
					</Animated.View>
					{/* <AnimatedTextInput
					style={[
						{
							color: colors.accentYellow,
						},
						tw`text-9xl font-bold flex-1 text-center`,
					]}
					animatedProps={animatedTextProps}
					editable={false}
					/> */}
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
			onLayout={() => {
				'worklet';
				scrollRef.current?.scrollToOffset({
					offset: (activeRating.value - 1) * ITEM_TOTAL_SIZE,
					animated: false,
				});
			}}
			renderItem={({ item }) => (
				<TouchableWithoutFeedback
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
				</TouchableWithoutFeedback>
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
		</ThemedTrueSheet>
	);
});
BottomSheetMediaRating.displayName = 'BottomSheetMediaRating';

export default BottomSheetMediaRating;