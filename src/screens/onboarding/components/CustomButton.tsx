import {
  FlatList,
  StyleSheet,
  TouchableWithoutFeedback,
  useWindowDimensions,
} from 'react-native';
import React from 'react';
import Animated, {
  AnimatedRef,
  SharedValue,
  interpolateColor,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {OnboardingData} from '../data';
import { useRouter } from 'expo-router';
import { useUIStore } from '@/stores/useUIStore';
import { Icons } from '@/constants/Icons';
import { useAuth } from '@/providers/AuthProvider';

type Props = {
	dataLength: number;
	flatListIndex: SharedValue<number>;
	flatListRef: AnimatedRef<FlatList<OnboardingData>>;
	x: SharedValue<number>;
};

const CustomButton = ({flatListRef, flatListIndex, dataLength, x}: Props) => {
	const { session } = useAuth();
	const setHasOnboarded = useUIStore(state => state.setHasOnboarded);
	const {width: SCREEN_WIDTH} = useWindowDimensions();
	const router = useRouter();

	const buttonAnimationStyle = useAnimatedStyle(() => {
		return {
		width:
			flatListIndex.value === dataLength - 1
			? withSpring(140)
			: withSpring(60),
		height: 60,
		};
	});

	const arrowAnimationStyle = useAnimatedStyle(() => {
		return {
		width: 30,
		height: 30,
		opacity:
			flatListIndex.value === dataLength - 1 ? withTiming(0) : withTiming(1),
		transform: [
			{
			translateX:
				flatListIndex.value === dataLength - 1
				? withTiming(100)
				: withTiming(0),
			},
		],
		};
	});

	const textAnimationStyle = useAnimatedStyle(() => {
		return {
		opacity:
			flatListIndex.value === dataLength - 1 ? withTiming(1) : withTiming(0),
		transform: [
			{
			translateX:
				flatListIndex.value === dataLength - 1
				? withTiming(0)
				: withTiming(-100),
			},
		],
		};
	});
	const animatedColor = useAnimatedStyle(() => {
		const backgroundColor = interpolateColor(
		x.value,
		[0, SCREEN_WIDTH, 2 * SCREEN_WIDTH],
		['#005b4f', '#1e2169', '#F15937'],
		);

		return {
		backgroundColor: backgroundColor,
		};
	});

	return (
		<TouchableWithoutFeedback
		onPress={() => {
			if (flatListIndex.value < dataLength - 1) {
				flatListRef.current?.scrollToIndex({index: flatListIndex.value + 1});
			} else {
				setHasOnboarded(true);
				if (router.canGoBack()) {
					router.back();
				} else {
					router.replace({ pathname: '/(tabs)/(home)'});
				}
			}
		}}>
		<Animated.View
			style={[styles.container, buttonAnimationStyle, animatedColor]}>
			<Animated.Text style={[styles.textButton, textAnimationStyle]}>
			Get Started
			</Animated.Text>
			<Animated.View style={[styles.arrow, arrowAnimationStyle]}>
				<Icons.ChevronLeft color="white" size={30} style={{transform: [{rotate: '180deg'}]}}/>
			</Animated.View>
		</Animated.View>
		</TouchableWithoutFeedback>
	);
};

export default CustomButton;

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#1e2169',
		padding: 10,
		borderRadius: 100,
		justifyContent: 'center',
		alignItems: 'center',
		overflow: 'hidden',
	},
	arrow: {
		position: 'absolute',
	},
	textButton: {color: 'white', fontSize: 16, position: 'absolute'},
});