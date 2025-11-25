import * as React from "react"
import { useRouter } from "expo-router";
import { Pressable, View, StyleProp, ViewStyle } from "react-native";
import Animated from "react-native-reanimated";
import { Profile, User, FixedOmit } from "@recomendapp/types";
import UserAvatar from "../user/UserAvatar";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import { Icons } from "@/constants/Icons";
import { Skeleton } from "../ui/Skeleton";
import { Text } from "../ui/text";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import BottomSheetUser from "../bottom-sheets/sheets/BottomSheetUser";

interface CardUserBaseProps
  extends React.ComponentPropsWithoutRef<typeof Animated.View> {
  onPress?: () => void;
  onLongPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  variant?: "default" | "icon" | "username" | "inline" | "list";
  linked?: boolean;
  width?: number;
  height?: number;
  children?: React.ReactNode;
}

type CardUserSkeletonProps = {
  skeleton: true;
  user?: never;
};

type CardUserDataProps = {
  skeleton?: false;
  user: User | Profile;
};

export type CardUserProps = CardUserBaseProps &
(CardUserSkeletonProps | CardUserDataProps);

const CardUserDefault = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	FixedOmit<CardUserProps, "variant" | "linked" | "onPress" | "onLongPress">
>(({ user, skeleton, children, style, ...props }, ref) => {
	const { colors } = useTheme();
	return (
		<Animated.View
		ref={ref}
		style={[
			{ backgroundColor: colors.card, borderColor: colors.border },
			tw.style('flex-row items-center justify-between rounded-xl h-20 p-1 border'),
			style,
		]}
		{...props}
		>
			<View style={tw`flex-row items-center justify-center shrink`}>
				{!skeleton ? <UserAvatar full_name={user.full_name!} avatar_url={user?.avatar_url} /> : <UserAvatar skeleton />}
				<View style={tw.style('shrink px-2 py-1 gap-1')}>
					<View style={tw.style('flex-row items-center gap-1')}>
						{!skeleton ? <Text numberOfLines={2}>{user?.full_name}</Text> : <Skeleton style={tw`w-20 h-5`} />}
						{!skeleton && user?.premium && (
							<Icons.premium color={colors.accentBlue} size={14}/>
						)}
					</View>
					{!skeleton ? (
						<Text numberOfLines={2} style={{ color: colors.mutedForeground }}>@{user?.username}</Text>
					) : (
						<Skeleton style={tw`w-20 h-5`} />
					)}
				</View>
			</View>
			{children}
		</Animated.View>
	);
});
CardUserDefault.displayName = "CardUserDefault";

const CardUserIcon = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	FixedOmit<CardUserProps, "variant" | "linked" | "onPress" | "onLongPress">
>(({ user, width = 25, height = 25, skeleton, children, style, ...props }, ref) => {
	return (
		<Animated.View
		ref={ref}
		{...props}
		>
			{!skeleton ? (
				<UserAvatar
				style={{ width: width, height: height }}
				full_name={user?.full_name!}
				avatar_url={user?.avatar_url}
				skeleton={skeleton}
				/>
			) : (
				<UserAvatar skeleton />
			)}
		</Animated.View>
	);
});
CardUserIcon.displayName = "CardUserIcon";

const CardUserUsername = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	FixedOmit<CardUserProps, "variant" | "linked" | "onPress" | "onLongPress">
>(({ user, width, height, skeleton, children, style, ...props }, ref) => {
	const { colors } = useTheme();
	return (
		<Animated.View
		ref={ref}
		style={[
			tw.style("flex-row items-center gap-1 font-bold"),
			style,
		]}
		{...props}
		>
			{!skeleton ? <Text>{user?.username}</Text> : <Skeleton style={tw`w-20 h-5`} />}
			{!skeleton && user?.premium && (
				<Icons.premium color={colors.accentBlue} size={14}/>
			)}
		</Animated.View>
	);
});
CardUserUsername.displayName = "CardUserUsername";

const CardUserInline = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	FixedOmit<CardUserProps, "variant" | "linked" | "onPress" | "onLongPress">
>(({ user, children, skeleton, style, ...props }, ref) => {
	return (
		<Animated.View style={[tw.style('flex-row items-center gap-1'), style]}>
			{!skeleton ? <CardUserIcon user={user} {...props}/> : <CardUserIcon skeleton {...props} />}
			{!skeleton ? <CardUserUsername user={user} {...props}/> : <CardUserUsername skeleton {...props} />}
		</Animated.View>
	);
});
CardUserInline.displayName = "CardUserInline";

const CardUserList = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	FixedOmit<CardUserProps, "variant" | "linked" | "onPress" | "onLongPress">
>(({ user, skeleton, children, style, ...props }, ref) => {
	const { colors } = useTheme();
	return (
		<Animated.View
		ref={ref}
		style={[
			tw.style('flex-row items-center justify-between p-1 gap-2'),
			style,
		]}
		{...props}
		>
			<View style={tw`flex-row items-center justify-center`}>
				{!skeleton ? <UserAvatar full_name={user.full_name!} avatar_url={user?.avatar_url} /> : <UserAvatar skeleton />}
				<View style={tw.style('shrink px-2 py-1 gap-1')}>
					<View style={tw.style('flex-row items-center gap-1')}>
						{!skeleton ? <Text numberOfLines={2}>{user?.full_name}</Text> : <Skeleton style={tw`w-20 h-5`} />}
						{!skeleton && user?.premium && (
							<Icons.premium color={colors.accentBlue} size={14}/>
						)}
					</View>
					{!skeleton ? (
						<Text numberOfLines={2} style={{ color: colors.mutedForeground }}>@{user?.username}</Text>
					) : (
						<Skeleton style={tw`w-20 h-5`} />
					)}
				</View>
			</View>
			{children}
		</Animated.View>
	);
});
CardUserList.displayName = "CardUserList";

const CardUser = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	CardUserProps
>(({ variant = "default", linked = true, onPress: onPressProps, onLongPress: onLongPressProps, containerStyle, ...props }, ref) => {
	const router = useRouter();
	const openSheet = useBottomSheetStore((state) => state.openSheet);

	const onPress = React.useCallback(() => {
		if (linked) router.push(`/user/${props.user?.username}`);
		onPressProps?.();
	}, [linked, onPressProps, props.user?.username, router]);

	const onLongPress = React.useCallback(() => {
		if (!props.user) return null;
		openSheet(BottomSheetUser, {
			user: props.user,
		});
		onLongPressProps?.();
	}, [onLongPressProps, openSheet, props.user]);

	const content = React.useMemo(() => (
		variant === "default" ? (
			<CardUserDefault ref={ref} {...props} />
		) : variant === "icon" ? (
			<CardUserIcon ref={ref} {...props} />
		) : variant === "username" ? (
			<CardUserUsername ref={ref} {...props} />
		) : variant === "inline" ? (
			<CardUserInline ref={ref} {...props} />
		) : variant === "list" ? (
			<CardUserList ref={ref} {...props} />
		) : null
	), [variant, props, ref]);

	if (props.skeleton) return content;

	const Wrapper =
		linked || onPressProps || onLongPressProps ? Pressable : View;

	return (
		<Wrapper
		onPress={onPress}
		onLongPress={onLongPress}
		style={containerStyle}
		>
			{content}
		</Wrapper>
	);
});
CardUser.displayName = "CardUser";

export {
	CardUser,
	CardUserDefault,
}