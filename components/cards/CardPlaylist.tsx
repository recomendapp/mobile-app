import { cn } from '@/lib/utils';
import { ImageWithFallback } from '../utils/ImageWithFallback';
import { Playlist } from '@/types/type.db';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import React from 'react';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { ThemedText } from '../ui/ThemedText';

interface CardPlaylistProps
	extends React.ComponentPropsWithRef<typeof Animated.View> {
		variant?: "default";
		playlist: Playlist;
		hideItemCount?: boolean;
	}

const CardPlaylistDefault = React.forwardRef<
	React.ElementRef<typeof Animated.View>,
	Omit<CardPlaylistProps, "variant">
>(({ className, playlist, hideItemCount, children, ...props }, ref) => {
	const { t } = useTranslation();
	return (
		<Animated.View
			ref={ref}
			className={cn(
				"gap-2",
				className
			)}
			{...props}
		>
			<View className='relative aspect-square rounded-sm overflow-hidden w-full'>
				<ImageWithFallback
					source={{uri: playlist.poster_url ?? ''}}
					alt={playlist?.title ?? ''}
					type="playlist"
					
				/>
			</View>
			<View>
				<ThemedText className='text-center font-medium line-clamp-2'>{playlist?.title}</ThemedText>
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
>(({ className, playlist, variant = "default", ...props }, ref) => {
	return (
	// <ContextMenuMovie movie={movie}>
		// <Link href={`/playlist/${playlist?.id}`}>
		<>
			{variant === "default" ? (
				<CardPlaylistDefault ref={ref} className={className} playlist={playlist} {...props} />
			) : null}
		</>
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