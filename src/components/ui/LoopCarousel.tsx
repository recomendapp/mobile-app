import React, { useEffect, useState } from "react";
import { ViewStyle } from "react-native";
import Animated, {
	FadeIn,
	FadeOut,
	LinearTransition,
} from "react-native-reanimated";

type CarouselProps<T> = {
	items: T[];
	delay?: number; // ms
	renderItem: (item: T, index: number) => React.ReactNode;
	transitionIn?: typeof FadeIn;
	transitionOut?: typeof FadeOut;
	containerStyle?: ViewStyle;
	onChange?: (item: T, index: number) => void;
};

export function LoopCarousel<T>({
	items,
	delay = 6000,
	renderItem,
	transitionIn = FadeIn,
	transitionOut = FadeOut,
	containerStyle,
	onChange,
}: CarouselProps<T>) {
	const [index, setIndex] = useState(0);

	useEffect(() => {
		const id = setInterval(() => {
			setIndex((i) => {
				const nextIndex = (i + 1) % items.length;
				onChange?.(items[nextIndex], nextIndex);
				return nextIndex;
			});
		}, delay);
		return () => clearInterval(id);
	}, [items, delay, onChange]);

	const item = items[index];

	return (
	<Animated.View
	key={index}
	style={containerStyle}
	entering={transitionIn.duration(1000)}
	exiting={transitionOut.duration(1000)}
	layout={LinearTransition.duration(1000)}
	>
		{renderItem(item, index)}
	</Animated.View>
	);
}
