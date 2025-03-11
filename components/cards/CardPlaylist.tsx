import { ImageWithFallback } from '../utils/ImageWithFallback';
import { Playlist } from '@/types/type.db';
import React from 'react';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { ThemedText } from '../ui/ThemedText';
import { useRouter } from 'expo-router';
import tw from '@/lib/tw';

interface CardPlaylistProps
	extends React.ComponentPropsWithRef<typeof Animated.View> {
		variant?: "default";
		playlist: Playlist;
		hideItemCount?: boolean;
	}

const CardPlaylistDefault = React.forwardRef<
	React.ElementRef<typeof Animated.View>,
	Omit<CardPlaylistProps, "variant">
>(({ style, playlist, hideItemCount, children, ...props }, ref) => {
	const { t } = useTranslation();
	return (
		<Animated.View
			ref={ref}
			style={[
				tw.style("gap-2"),
				style,
			]}
			{...props}
		>
			<View style={tw.style("relative aspect-square rounded-sm overflow-hidden w-full")}>
				<ImageWithFallback
					source={{uri: playlist.poster_url ?? ''}}
					alt={playlist?.title ?? ''}
					type="playlist"
					
				/>
			</View>
			<View>
				<ThemedText numberOfLines={2} style={tw.style("text-center font-medium")}>{playlist?.title}</ThemedText>
			</View>
			{/* <CardContent className='p-0'>
				<p className="line-clamp-2 break-words group-hover:text-primary/80">{playlist?.title}</p>
				{!hideItemCount ? (
					<p className="line-clamp-1 text-sm italic text-muted-foreground">
					{common('messages.item_count', { count: playlist?.items_count ?? 0 })}
					</p>
				) : null}
			</CardContent> */}
		</Animated.View>
	);
});
CardPlaylistDefault.displayName = "CardPlaylistDefault";

const CardPlaylist = React.forwardRef<
	React.ElementRef<typeof Animated.View>,
	CardPlaylistProps
>(({ playlist, variant = "default", ...props }, ref) => {
	const router = useRouter();
	const onPress = () => {
		router.push(`/playlist/${playlist?.id}`);
	};
	return (
	// <ContextMenuMovie movie={movie}>
		// <Link href={`/playlist/${playlist?.id}`}>
		<Pressable onPress={onPress}>
			{variant === "default" ? (
				<CardPlaylistDefault ref={ref}  playlist={playlist} {...props} />
			) : null}
		</Pressable>
		// </Link>
	// </ContextMenuMovie>
	);
});
CardPlaylist.displayName = "CardPlaylist";

export {
	type CardPlaylistProps,
	CardPlaylist,
	CardPlaylistDefault,
}