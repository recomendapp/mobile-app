import * as React from "react"
import { MediaPerson } from "@/types/type.db";
import Animated from "react-native-reanimated";
import { ImageWithFallback } from "../utils/ImageWithFallback";
import { Href, useRouter } from "expo-router";
import tw from "@/lib/tw";
import { Pressable, View } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { IconMediaRating } from "../medias/IconMediaRating";
import { FixedOmit } from "@/types";
import { Skeleton } from "../ui/Skeleton";
import BottomSheetMovie from "../bottom-sheets/sheets/BottomSheetMovie";
import { Text } from "../ui/text";
import BottomSheetPerson from "../bottom-sheets/sheets/BottomSheetPerson";

interface CardPersonBaseProps
	extends React.ComponentPropsWithRef<typeof Animated.View> {
		variant?: "default" | "poster" | "row";
		linked?: boolean;
		children?: React.ReactNode;
		onPress?: () => void;
		onLongPress?: () => void;
	}

type CardPersonSkeletonProps = {
	skeleton: true;
	person?: never;
};

type CardPersonDataProps = {
	skeleton?: false;
	person: MediaPerson;
};

export type CardPersonProps = CardPersonBaseProps &
	(CardPersonSkeletonProps | CardPersonDataProps);

const CardPersonDefault = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	FixedOmit<CardPersonProps, "variant" | "linked" | "onPress" | "onLongPress">
>(({ style, person, skeleton, children, ...props }, ref) => {
	const { colors } = useTheme();
	return (
		<Animated.View
		ref={ref}
		style={[
			{ backgroundColor: colors.card, borderColor: colors.border },
			tw`flex-row justify-between items-center rounded-xl h-20 p-1 gap-2 border overflow-hidden`,
			style,
		]}
		{...props}
		>
			<View style={tw`flex-1 flex-row items-center gap-2`}>
				{!skeleton ? <ImageWithFallback
					source={{uri: person.profile_url ?? ''}}
					alt={person.name ?? ''}
					type={'person'}
					style={{
						aspectRatio: 2 / 3,
						width: 'auto',
					}}
				/> : <Skeleton style={{ aspectRatio: 2 / 3, width: 'auto' }} />}
				<View style={tw`shrink px-2 py-1 gap-1`}>
					{!skeleton ? <Text numberOfLines={2}>{person.name}</Text> : <Skeleton style={tw.style('w-full h-5')} />}
					{children}
				</View>
			</View>
		</Animated.View>
	);
});
CardPersonDefault.displayName = "CardPersonDefault";

const CardPersonPoster = React.forwardRef<
React.ComponentRef<typeof Animated.View>,
	FixedOmit<CardPersonProps, "variant" | "linked" | "onPress" | "onLongPress">
>(({ style, person, skeleton, children, ...props }, ref) => {
	return (
		<Animated.View
			ref={ref}
			style={[
				{ aspectRatio: 2 / 3 },
				tw.style('relative flex gap-4 items-center w-32 shrink-0 rounded-sm border-transparent overflow-hidden'),
				style,
			]}
			{...props}
		>
			{!skeleton ? <ImageWithFallback
				source={{uri: person.profile_url ?? ''}}
				alt={person.name ?? ''}
				type={'person'}
			/> : <Skeleton style={tw.style('w-full h-full')} />}
		</Animated.View>
	);
});
CardPersonPoster.displayName = "CardPersonPoster";

const CardPerson = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	CardPersonProps
>(({ variant = "default", linked = true, onPress, onLongPress, ...props }, ref) => {
	const router = useRouter();
	const openSheet = useBottomSheetStore((state) => state.openSheet);

	const content = (
		variant === "default" ? (
			<CardPersonDefault ref={ref} {...props} />
		) : variant == "poster" ? (
			<CardPersonPoster ref={ref} {...props} />
		) : null
	)

	if (props.skeleton) return content;

	return (
	<Pressable
	onPress={() => {
		if (linked) router.push(props.person.url as Href);
		onPress?.();
	}}
	onLongPress={() => {
		openSheet(BottomSheetPerson, {
			person: props.person,
		});
		onLongPress?.();
	}}
	>
		{content}
	</Pressable>
	);
});
CardPerson.displayName = "CardPerson";

export {
	CardPerson,
	CardPersonDefault,
	CardPersonPoster,
}