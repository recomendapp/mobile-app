import { useTheme } from "@/context/ThemeProvider";
import useColorConverter from "@/hooks/useColorConverter";
import tw from "@/lib/tw";
import React, { forwardRef } from "react";
import Animated, { Extrapolation, interpolate, SharedValue, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import useRandomBackdrop from "@/hooks/useRandomBackdrop";
import { Playlist } from "@/types/type.db";
import { AnimatedImageWithFallback } from "@/components/ui/AnimatedImageWithFallback";
import { Skeleton } from "@/components/ui/Skeleton";
import { ThemedText } from "@/components/ui/ThemedText";
import { upperFirst } from "lodash";
import { useTranslation } from "react-i18next";
import { CardUser } from "@/components/cards/CardUser";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";

interface PlaylistHeaderProps
	extends React.ComponentPropsWithoutRef<typeof Animated.View> {
		playlist?: Playlist | null;
		loading: boolean;
		headerHeight: SharedValue<number>;
		headerOverlayHeight: SharedValue<number>;
		scrollY: SharedValue<number>;
		backdrops: (string | null | undefined)[];
	}

const PlaylistHeader = forwardRef<
	React.ElementRef<typeof Animated.View>,
	PlaylistHeaderProps
>(({ playlist, loading, headerHeight, headerOverlayHeight, scrollY, backdrops, ...props }, ref) => {
	const { colors, inset } = useTheme();
	const { hslToRgb } = useColorConverter();
	const { t } = useTranslation();
	const bgBackdrop = useRandomBackdrop(backdrops);
	const bgColor = hslToRgb(colors.background);
	const posterHeight = useSharedValue(0);
	const opacityAnim = useAnimatedStyle(() => {
		return {
			opacity: interpolate(
				scrollY.get(),
				[0, headerHeight.get() - (headerOverlayHeight.get() + inset.top) / 0.9],
				[1, 0],
				Extrapolation.CLAMP,
			),
		};
	});
	const posterAnim = useAnimatedStyle(() => {
		const scaleValue = interpolate(
			scrollY.get(),
			[-headerHeight.get(), 0],
			[3, 1],
			Extrapolation.CLAMP,
		);
		const scaleOffset = (posterHeight.get() * (scaleValue - 1)) / 2;
		const freezeScroll = interpolate(
			scrollY.get(),
			[-headerHeight.get(), 0],
			[-headerHeight.get(), 1],
			Extrapolation.CLAMP,
		);
		return {
			opacity: interpolate(
				scrollY.get(),
				[0, headerHeight.get() - (headerOverlayHeight.get() + inset.top) / 0.8],
				[1, 0],
				Extrapolation.CLAMP,
			),
			transform: [
				{ scale: scaleValue },
				{ translateY: freezeScroll + scaleOffset },
			],
		};
	});
	const textAnim = useAnimatedStyle(() => {
		return {
			opacity: interpolate(
				scrollY.get(),
				[0, headerHeight.get() - (headerOverlayHeight.get() + inset.top) / 0.8],
				[1, 0],
				Extrapolation.CLAMP,
			),
			transform: [
				{
					scale: interpolate(
					scrollY.get(),
					[0, (headerHeight.get() - (headerOverlayHeight.get() + inset.top)) / 2],
					[1, 0.95],
					'clamp',
					),
				},
			],
		};
	});
	const bgAnim = useAnimatedStyle(() => {
		const scaleValue = interpolate(
			scrollY.get(),
			[-headerHeight.get(), 0],
			[2, 1],
			Extrapolation.CLAMP,
		);
		const offset = (headerHeight.get() * (scaleValue - 1)) / 2;
		return {
			transform: [
				{ scale: scaleValue },
				{ translateY: -offset },
			],
		};
	});

	return (
		<Animated.View
		ref={ref}
		style={[
			opacityAnim,
		]}
		onLayout={(event) => {
			'worklet';
			headerHeight.value = event.nativeEvent.layout.height;
		}}
		{...props}
		>
			<Animated.View
			style={[
				tw`absolute inset-0`,
				bgAnim,
			]}
			>
				{playlist ? (
					<Image
					style={tw`absolute inset-0`}
					source={{ uri: bgBackdrop ?? 'https://media.giphy.com/media/Ic0IOSkS23UAw/giphy.gif' }}
					/>
				) : null}
				<LinearGradient

				style={tw`absolute inset-0`}
				colors={[
					`rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, 0.3)`,
					`rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, 0.4)`,
					`rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, 0.5)`,
					`rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, 0.6)`,
					`rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, 0.6)`,
					`rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, 0.8)`,
					`rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, 1)`,
				]}
				/>
			</Animated.View>
			<Animated.View
			style={[
				tw`items-center justify-center gap-2 p-2`,
				{
					paddingTop: inset.top === 0 ? 8 : inset.top,
				}
			]}
			>
				{!loading ? (
					<AnimatedImageWithFallback
					onLayout={(e) => {
						'worklet';
						posterHeight.value = e.nativeEvent.layout.height;
					}}
					alt={playlist?.title ?? ''}
					source={{ uri: playlist?.poster_url ?? '' }}
					style={[
						tw`aspect-square h-auto rounded-md w-48`,
						posterAnim
					]}
					type={'playlist'}
					/>
				) : <Skeleton style={[tw`aspect-square h-auto rounded-md w-48`, posterAnim]}/>}
				<Animated.View
				style={[
					tw.style('gap-2 w-full'),
					textAnim
				]}
				>
					{playlist ? <ThemedText>
						<ThemedText style={{ color: colors.accentYellow }}>{upperFirst('playlist')}</ThemedText>
						{" | "}
						{playlist.private ? upperFirst(t('common.messages.private', { context: 'female' })) : upperFirst(t('common.messages.public', { context: 'female' }))}
					</ThemedText> : loading ? <Skeleton style={tw.style('w-32 h-8')} /> : null}
					{/* TITLE */}
					{!loading ? (
						<ThemedText
						numberOfLines={2}
						style={[
							tw.style('text-4xl font-bold'),
							(!playlist && !loading) && { textAlign: 'center', color: colors.mutedForeground }
						]}
						>
							{playlist?.title ?? upperFirst(t('common.errors.playlist_not_found'))}
						</ThemedText>
					) : <Skeleton style={tw.style('w-64 h-12')} />}
					{playlist ? (
						<>
							<CardUser variant="inline" user={playlist.user!} />
						</>
					) : null}
				</Animated.View>
			</Animated.View>
		</Animated.View>
	)
});
PlaylistHeader.displayName = "PlaylistHeader";

export default PlaylistHeader;