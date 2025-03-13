import * as React from 'react';
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
import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Icons } from '@/constants/Icons';
import { useNavigation } from '@react-navigation/native';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/context/ThemeProvider';
import tw from '@/lib/tw';

interface FilmHeaderProps {
	filmHeaderHeight: SharedValue<number>;
	headerHeight: SharedValue<number>;
	onHeaderHeight: (height: number) => void;
	sv: SharedValue<number>;
	title: string;
}
const FilmHeader: React.FC<FilmHeaderProps> = ({
	filmHeaderHeight,
	headerHeight,
	onHeaderHeight,
	sv,
	title,
}) => {
	const { colors } = useTheme();
	const navigation = useNavigation();
	const inset = useSafeAreaInsets();
	const opacityAnim = useAnimatedStyle(() => {
		return {
			opacity: interpolate(
			sv.get(),
			[
				((filmHeaderHeight.get() - (headerHeight.get() + inset.top)) / 4) * 3,
				filmHeaderHeight.get() - (headerHeight.get() + inset.top) + 1,
			],
			[0, 1],
			),
			transform: [
			{
				scale: interpolate(
				sv.get(),
				[
					((filmHeaderHeight.get() - (headerHeight.get() + inset.top)) / 4) * 3,
					filmHeaderHeight.get() - (headerHeight.get() + inset.top) + 1,
				],
				[0.98, 1],
				Extrapolation.CLAMP,
				),
			},
			{
				translateY: interpolate(
				sv.get(),
				[
					((filmHeaderHeight.get() - (headerHeight.get() + inset.top)) / 4) * 3,
					filmHeaderHeight.get() - (headerHeight.get() + inset.top) + 1,
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
			onHeaderHeight((event.nativeEvent.layout.height / 2) - 8);
		}}
		>
			<Icons.ChevronLeft style={tw.style('opacity-0')} />
			<ThemedText numberOfLines={1} style={tw.style('text-xl font-medium shrink')}>
			{title}
			</ThemedText>
			<Pressable onPress={() => console.log('pressed')}>
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

export default FilmHeader;