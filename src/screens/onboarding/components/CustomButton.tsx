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
import { useNavigation, useRouter } from 'expo-router';
import { useUIStore } from '@/stores/useUIStore';
import { Icons } from '@/constants/Icons';
import { useAuth } from '@/providers/AuthProvider';
import { useTranslations } from 'use-intl';
import { upperFirst } from 'lodash';

type Props = {
	dataLength: number;
	flatListIndex: SharedValue<number>;
	flatListRef: AnimatedRef<FlatList<OnboardingData>>;
	x: SharedValue<number>;
	colors: string[];
};

const CustomButton = ({flatListRef, flatListIndex, dataLength, x, colors}: Props) => {
	const { session } = useAuth();
	const t = useTranslations();
	const setHasOnboarded = useUIStore(state => state.setHasOnboarded);
	const {width: SCREEN_WIDTH} = useWindowDimensions();
	const router = useRouter();
	const navigation = useNavigation();
	const routes = navigation.getState()?.routes;
	const prevRoute = routes ? routes[routes.length - 2] : null;

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
		colors.map((_, i) => i * SCREEN_WIDTH),
		colors,
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
					router.replace({ pathname: '/(tabs)/(home)' });
				}

				if (!session && (!prevRoute || !prevRoute.name.includes('auth'))) {
					router.push({ pathname: '/(tabs)/(home)/auth' });
				}
			}
		}}>
		<Animated.View
			style={[styles.container, buttonAnimationStyle, animatedColor]}>
			<Animated.Text style={[styles.textButton, textAnimationStyle]}>
				{upperFirst(t('common.messages.get_started'))}
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