import React from 'react';
import {
	LayoutChangeEvent,
} from 'react-native';
import Animated, {
	Extrapolation,
	FadeInDown,
	interpolate,
	SharedValue,
	useAnimatedStyle,
	useSharedValue,
} from 'react-native-reanimated';
import { AnimatedImageWithFallback } from '@/components/ui/AnimatedImageWithFallback';
import { upperFirst } from 'lodash';
import { MediaPerson } from '@recomendapp/types';
import useColorConverter from '@/hooks/useColorConverter';
import { Skeleton } from '@/components/ui/Skeleton';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/providers/ThemeProvider';
import tw from '@/lib/tw';
import { useTranslations } from 'use-intl';
import { Text } from '@/components/ui/text';
import { BORDER_RADIUS, PADDING_HORIZONTAL, PADDING_VERTICAL } from '@/theme/globals';
import { useHeaderHeight } from '@react-navigation/elements';
import { View } from '@/components/ui/view';
import { useImagePalette } from '@/hooks/useImagePalette';

interface PersonHeaderProps {
	person?: MediaPerson | null;
	loading: boolean;
	scrollY: SharedValue<number>;
	triggerHeight: SharedValue<number>;
}
export const PersonHeader: React.FC<PersonHeaderProps> = ({
	person,
	loading,
	scrollY,
	triggerHeight,
}) => {
	const t = useTranslations();
	const { hslToRgb } = useColorConverter();
	const { colors } = useTheme();
	const navigationHeaderHeight = useHeaderHeight();
	const bgColor = hslToRgb(colors.background);
	const { palette } = useImagePalette(person?.profile_url || undefined);
	// SharedValue
	const posterHeight = useSharedValue(0);
	const headerHeight = useSharedValue(0);
	// Animated styles
	const posterAnim = useAnimatedStyle(() => {
		const stretch = Math.max(-scrollY.value, 0);
		const base = Math.max(posterHeight.value, 1);
		const scale = 1 + stretch / base;
		const clampedScale = Math.min(scale, 3);
		const translateY = -stretch / 2;
		return {
			transform: [
				{ translateY },
				{ scale: clampedScale },
			],
		};
	});
	const textAnim = useAnimatedStyle(() => {
		return {
			opacity: interpolate(
				scrollY.get(),
				[0, (headerHeight.get() - navigationHeaderHeight) / 0.8],
				[1, 0],
				Extrapolation.CLAMP,
			),
			transform: [
				{
					scale: interpolate(
					scrollY.get(),
					[0, (headerHeight.get() - navigationHeaderHeight) / 2],
					[1, 0.98],
					'clamp',
					),
				},
			],
		};
	});
	const bgAnim = useAnimatedStyle(() => {
		const stretch = Math.max(-scrollY.value, 0);
		const base = Math.max(headerHeight.value, 1);
		const scale = 1 + stretch / base;
		const clampedScale = Math.min(scale, 3);

		return {
			transform: [
				{ translateY: -stretch / 2 },
				{ scale: clampedScale },
			],
		};
	});

	return (
	<Animated.View
	style={[
		tw.style('w-full'),
		{ paddingTop: navigationHeaderHeight },
	]}
	onLayout={(event: LayoutChangeEvent) => {
		'worklet';
		const height = event.nativeEvent.layout.height;
		headerHeight.value = height;
		triggerHeight.value = (height - navigationHeaderHeight) * 0.7;
	}}
	>
		<Animated.View
		style={[
			tw`absolute inset-0`,
			bgAnim,
		]}
		>
			{palette?.length ? <View style={[{ backgroundColor: palette[0] }, tw`absolute inset-0`]}/> : null}
			<LinearGradient
			style={tw`absolute inset-0`}
			colors={[
				`rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, 0.3)`,
				`rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, 1)`,
			]}
			/>
		</Animated.View>
		<Animated.View
		style={[
			tw`items-center gap-4`,
			{ paddingHorizontal: PADDING_HORIZONTAL, paddingVertical: PADDING_VERTICAL }
		]}
		>
			<Animated.View entering={FadeInDown.delay(200).duration(500)}>
				{!loading ? (
					<AnimatedImageWithFallback
					onLayout={(e) => {
						'worklet';
						posterHeight.value = e.nativeEvent.layout.height;
					}}
					transition={250}
					alt={person?.name ?? ''}
					source={{ uri: person?.profile_url ?? '' }}
					style={[
						{ aspectRatio: 1 / 1, borderRadius: BORDER_RADIUS },
						tw`w-48 h-auto`,
						posterAnim
					]}
					type={'person'}
					/>
				) : <Skeleton style={[{ aspectRatio: 1 / 1 }, tw`w-48` ]}/>}
			</Animated.View>
			<Animated.View
			style={[
				tw`gap-2 w-full`,
				textAnim
			]}
			>
				{/* GENRES */}
				{person ? <Text>
					<Text style={{ color: colors.accentYellow }}>
						{upperFirst(t('common.messages.person', { count: 1 }))}
					</Text>
					{person.known_for_department ? (
						<>
						{" | "}
						<Text>{person.known_for_department}</Text>
						</>
					) : null}
				</Text> : loading ? <Skeleton style={tw`w-32 h-8`} /> : null}
				{/* TITLE */}
				{!loading ? (
					<Text
					variant="title"
					numberOfLines={2}
					style={[
						(!person && !loading) && { textAlign: 'center', color: colors.mutedForeground }
					]}
					>
						{person?.name || upperFirst(t('common.messages.person_not_found'))}
					</Text>
				) : <Skeleton style={tw`w-64 h-12`} />}
			</Animated.View>
		</Animated.View>
	</Animated.View>
	);
};
