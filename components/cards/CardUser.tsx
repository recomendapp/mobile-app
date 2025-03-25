import * as React from "react"
import { useRouter } from "expo-router";
import { Pressable, View, Text } from "react-native";
import Animated from "react-native-reanimated";
import { User } from "@/types/type.db";
import UserAvatar from "../user/UserAvatar";
import tw from "@/lib/tw";
import { useTheme } from "@/context/ThemeProvider";
import { ThemedText } from "../ui/ThemedText";
import { Icons } from "@/constants/Icons";
import { ThemedView } from "../ui/ThemedView";

interface CardUserProps
	extends React.ComponentPropsWithoutRef<typeof Animated.View> {
		variant?: "default" | "icon" | "username" | "inline";
		user: User;
		linked?: boolean;
		width?: number;
		height?: number;
	}

const CardUserDefault = React.forwardRef<
	React.ElementRef<typeof Animated.View>,
	Omit<CardUserProps, "variant">
>(({ user, linked, children, style, ...props }, ref) => {
	const { colors } = useTheme();
	return (
		<Animated.View
		ref={ref}
		style={[
			{ backgroundColor: colors.card, borderColor: colors.border },
			tw.style('flex-row items-center rounded-xl h-20 p-1 border'),
			style,
		]}
		{...props}
		>
			<UserAvatar full_name={user?.full_name} avatar_url={user?.avatar_url} />
			<View style={tw.style('shrink px-2 py-1 gap-1')}>
				<ThemedText numberOfLines={2}>{user?.full_name}</ThemedText>
				<Text numberOfLines={2} style={{ color: colors.mutedForeground }}>@{user?.username}</Text>
				{/* {children} */}
			</View>
		</Animated.View>
	);
});
CardUserDefault.displayName = "CardUserDefault";

const CardUserIcon = React.forwardRef<
	React.ElementRef<typeof Animated.View>,
	Omit<CardUserProps, "variant">
>(({ user, linked, width = 25, height = 25, children, style, ...props }, ref) => {
	return (
		<Animated.View
		ref={ref}
		{...props}
		>
			<UserAvatar
			style={{ width: width, height: height }}
			full_name={user?.full_name}
			avatar_url={user?.avatar_url}
			/>
		</Animated.View>
	);
});
CardUserIcon.displayName = "CardUserIcon";

const CardUserUsername = React.forwardRef<
	React.ElementRef<typeof Animated.View>,
	Omit<CardUserProps, "variant">
>(({ user, linked, width, height, children, style, ...props }, ref) => {
	return (
		<Animated.View
		ref={ref}
		style={[
			tw.style("items-center gap-1 font-bold"),
			style,
		]}
		{...props}
		>
			<ThemedText>{user?.username}</ThemedText>
			{/* {user?.premium && (
				<Icons.premium className='fill-blue-400 inline w-3'/>
			)} */}
		</Animated.View>
	);
});
CardUserUsername.displayName = "CardUserUsername";

const CardUserInline = React.forwardRef<
	React.ElementRef<typeof Animated.View>,
	Omit<CardUserProps, "variant">
>(({ user, children, style, ...props }, ref) => {
	return (
		<Animated.View style={[tw.style('flex-row items-center gap-1'), style]}>
			<CardUserIcon user={user} {...props}/>
			<CardUserUsername user={user} {...props}/>
		</Animated.View>
	);
});
CardUserInline.displayName = "CardUserInline";

const CardUser = React.forwardRef<
	React.ElementRef<typeof Animated.View>,
	CardUserProps
>(({ variant = "default", linked = true, ...props }, ref) => {
	const router = useRouter();
	const onPress = () => {
		if (linked) {
			router.push(`/user/${props.user?.username}`);
		}
	};
	return (
		<Pressable onPress={onPress}>
			{variant === "default" ? (
				<CardUserDefault ref={ref} {...props} />
			) : variant === "icon" ? (
				<CardUserIcon ref={ref} {...props} />
			) : variant === "username" ? (
				<CardUserUsername ref={ref} {...props} />
			) : variant === "inline" ? (
				<CardUserInline ref={ref} {...props} />
			) : null}
		</Pressable>
	);
});
CardUser.displayName = "CardUser";

export {
	type CardUserProps,
	CardUser,
	CardUserDefault,
}