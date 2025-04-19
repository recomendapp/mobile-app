import {
  LayoutChangeEvent,
  Pressable,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { Icons } from '@/constants/Icons';
import { useNavigation } from '@react-navigation/native';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/context/ThemeProvider';
import tw from '@/lib/tw';
import React from 'react';

interface HeaderOverlayProps {
	triggerHeight: SharedValue<number>;
	headerHeight: SharedValue<number>;
	onHeaderHeight: (height: number) => void;
	scrollY: SharedValue<number>;
	title: string;
}
const HeaderOverlay: React.FC<HeaderOverlayProps> = ({
	triggerHeight,
	headerHeight,
	onHeaderHeight,
	scrollY,
	title,
}) => {
	const { colors, inset } = useTheme();
	const navigation = useNavigation();
	const opacityAnim = useAnimatedStyle(() => {
		return {
			opacity: interpolate(
			scrollY.get(),
			[
				((triggerHeight.get() - (headerHeight.get() + inset.top)) / 4) * 3,
				triggerHeight.get() - (headerHeight.get() + inset.top) + 1,
			],
			[0, 1],
			),
			transform: [
			{
				scale: interpolate(
				scrollY.get(),
				[
					((triggerHeight.get() - (headerHeight.get() + inset.top)) / 4) * 3,
					triggerHeight.get() - (headerHeight.get() + inset.top) + 1,
				],
				[0.98, 1],
				Extrapolation.CLAMP,
				),
			},
			{
				translateY: interpolate(
				scrollY.get(),
				[
					((triggerHeight.get() - (headerHeight.get() + inset.top)) / 4) * 3,
					triggerHeight.get() - (headerHeight.get() + inset.top) + 1,
				],
				[-10, 0],
				Extrapolation.CLAMP,
				),
			},
			],
			paddingTop: inset.top === 0 ? 8 : inset.top,
		};
	});

	return (
	<>
		<Animated.View
		style={[
			{ backgroundColor: colors.background },
			tw.style('absolute w-full px-4 pb-4 flex flex-row items-center justify-between gap-2 z-10'),
			opacityAnim
		]}
		onLayout={(event: LayoutChangeEvent) => {
			'worklet';
			onHeaderHeight((event.nativeEvent.layout.height / 2) - 10);
		}}
		>
			<Icons.ChevronLeft style={tw.style('opacity-0')} />
			<ThemedText numberOfLines={1} style={tw.style('text-xl font-medium shrink')}>
			{title}
			</ThemedText>
			<Pressable onPress={() => console.log('options pressed')}>
				<Icons.EllipsisVertical color={colors.foreground} />
			</Pressable>
		</Animated.View>
		{navigation.canGoBack() ? (
			<Pressable
			onPress={() => navigation.goBack()}
			style={[
				tw.style('absolute z-10'),
				{
					top: inset.top,
					left: 14,
				}
			]}
			>
				<Icons.ChevronLeft color={colors.foreground} />
			</Pressable>
		) : null}
	</>
	);
};

export default HeaderOverlay;